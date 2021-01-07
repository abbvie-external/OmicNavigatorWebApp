import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Select,
  Icon,
  Popup,
  Divider,
  Radio,
  Transition,
  Button,
} from 'semantic-ui-react';
import ndjsonStream from 'can-ndjson-stream';
import { CancelToken } from 'axios';
import DOMPurify from 'dompurify';
import '../Shared/SearchCriteria.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialMultisetFilters from './DifferentialMultisetFilters';

let cancelRequestGetReportLinkDifferential = () => {};
let cancelRequestMultisetInferenceData = () => {};
let cancelRequestInferenceMultisetPlot = () => {};
const cache = {};
const baseUrl =
  process.env.NODE_ENV === 'development'
    ? '***REMOVED***'
    : window.location.origin;
const fetchUrl = `${baseUrl}/ocpu/library/OmicNavigator/R/getResultsTable/ndjson`;
async function* streamAsyncIterable(reader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return;
    }
    yield value;
  }
}
class DifferentialSearchCriteria extends Component {
  state = {
    differentialStudies: [],
    differentialStudyHrefVisible: false,
    differentialStudyHref: '',
    differentialStudyReportTooltip:
      'Select a study and model to view Analysis Details',
    differentialModels: [],
    differentialTests: [],
    differentialModelTooltip: '',
    differentialTestTooltip: '',
    differentialStudiesDisabled: true,
    differentialModelsDisabled: true,
    differentialTestsDisabled: true,
    uAnchorP: '',
    selectedColP: [],
    selectedOperatorP: [
      {
        key: '<',
        text: '<',
        value: '<',
      },
    ],
    sigValueP: [0.05],
    reloadPlotP: true,
    mustDifferential: [],
    notDifferential: [],
    uSettingsP: {
      defaultselectedColP: [],
      defaultselectedOperatorP: {
        key: '<',
        text: '<',
        value: '<',
      },
      defaultSigValueP: [0.05],
      useAnchorP: true,
      hoveredFilter: -1,
      displayMetaDataP: true,
      templateName: 'differential-multiset',
      numElementsP: 0,
      maxElementsP: 0,
      indexFiltersP: [0],
      metaSvgP: '',
      heightScalarP: 1,
      thresholdOperatorP: [
        {
          key: '<',
          text: '<',
          value: '<',
        },
        {
          key: '>',
          text: '>',
          value: '>',
        },
        {
          key: '|<|',
          text: '|<|',
          value: '|<|',
        },
        {
          key: '|>|',
          text: '|>|',
          value: '|>|',
        },
      ],
    },
    multisetFiltersVisibleDifferential: false,
    activateMultisetFiltersP: false,
    uDataP: [],
    isFilteredDifferential: false,
    // initialRenderP: true,
    // loadingDifferentialMultisetFilters: false,
  };

  componentDidMount() {
    this.setState({
      differentialStudiesDisabled: false,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.allStudiesMetadata !== prevProps.allStudiesMetadata ||
      this.props.differentialStudy !== prevProps.differentialStudy
    ) {
      this.populateDropdowns();
    }
    // if (this.props.multisetPlotAvailableDifferential !== prevProps.multisetPlotAvailableDifferential) {
    //   this.forceUpdate();
    // }
  }

  populateDropdowns = () => {
    const {
      allStudiesMetadata,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      onSearchCriteriaChangeDifferential,
      onSearchTransitionDifferential,
    } = this.props;
    const studies = allStudiesMetadata.map(study => {
      const studyName = study.name;
      return {
        key: `${studyName}Differential`,
        text: studyName,
        value: studyName,
      };
    });
    this.setState({
      differentialStudies: studies,
    });
    if (differentialStudy !== '') {
      // loop through allStudiesMetadata to find the object with the name matching differentialStudy
      const allStudiesMetadataCopy = [...allStudiesMetadata];
      const differentialStudyData = allStudiesMetadataCopy.find(
        study => study.name === differentialStudy,
      );
      const differentialModelsAndTestsVar =
        differentialStudyData?.results || [];
      this.props.onSetStudyModelTestMetadata(
        differentialStudyData,
        differentialModelsAndTestsVar,
      );
      const differentialModelsMapped = differentialModelsAndTestsVar.map(
        result => {
          return {
            key: `${result.modelID}Differential`,
            text: result.modelID,
            value: result.modelID,
          };
        },
      );

      this.setState({
        differentialModelsDisabled: false,
        differentialModels: differentialModelsMapped,
      });
      this.getReportLink(differentialStudy, 'default');
      if (differentialModel !== '') {
        this.props.onDoMetaFeaturesExist(differentialStudy, differentialModel);
        this.props.onGetResultsLinkouts(differentialStudy, differentialModel);
        this.props.onHandlePlotTypesDifferential(differentialModel);
        const differentialModelWithTests = differentialModelsAndTestsVar.find(
          model => model.modelID === differentialModel,
        );
        const differentialModelTooltip =
          differentialModelWithTests?.modelDisplay || '';
        this.setState({
          differentialModelTooltip: differentialModelTooltip,
        });
        const differentialTestsMetadataVar =
          differentialModelWithTests?.tests || [];
        const differentialTestsMapped = differentialTestsMetadataVar.map(
          test => {
            return {
              key: `${test.testID}Differential`,
              text: test.testID,
              value: test.testID,
            };
          },
        );
        const uDataPMapped = differentialTestsMetadataVar.map(t => t.testID);
        this.setState({
          differentialTestsDisabled: false,
          differentialTests: differentialTestsMapped,
          uDataP: uDataPMapped,
        });
        this.props.onSetTestsMetadata(differentialTestsMetadataVar);
        this.getReportLink(differentialStudy, differentialModel);
        if (differentialTest !== '') {
          onSearchTransitionDifferential(true);
          const obj = {
            study: differentialStudy,
            modelID: differentialModel,
            testID: differentialTest,
          };
          fetch(fetchUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj), // body data type must match "Content-Type" header
          })
            // can nd-json-stream - assumes json is NDJSON, a data format that is separated into individual JSON objects with a newline character (\n). The 'nd' stands for newline delimited JSON
            .then(response => {
              return ndjsonStream(response.body); //ndjsonStream parses the response.body
            })
            .then(canNdJsonStream => {
              this.handleGetResultsTableStream(
                canNdJsonStream,
                differentialTest,
              );
            })
            .catch(error => {
              console.error('Error during getResultsTable', error);
            });
          onSearchCriteriaChangeDifferential(
            {
              differentialStudy: differentialStudy,
              differentialModel: differentialModel,
              differentialTest: differentialTest,
              differentialFeature: differentialFeature,
            },
            false,
          );
          const differentialTestMeta = differentialTestsMetadataVar.find(
            test => test.testID === differentialTest,
          );
          const differentialTestTooltip =
            differentialTestMeta?.testDisplay || '';
          this.setState({
            differentialTestTooltip,
            uAnchorP: differentialTest,
          });
        }
      }
    }
  };

  handleStudyChange = (evt, { name, value }) => {
    const {
      onSearchCriteriaChangeDifferential,
      onSearchCriteriaResetDifferential,
    } = this.props;
    onSearchCriteriaChangeDifferential(
      {
        [name]: value,
        differentialModel: '',
        differentialTest: '',
      },
      true,
    );
    onSearchCriteriaResetDifferential({
      isValidSearchDifferential: false,
    });
    this.setState({
      differentialStudyHrefVisible: false,
      differentialModelsDisabled: true,
      differentialTestsDisabled: true,
      differentialModelTooltip: '',
      differentialTestTooltip: '',
    });
    this.getReportLink(value, 'default');
  };

  setStudyTooltip = () => {
    if (this.props.differentialModel !== '') {
      this.setState({
        differentialStudyReportTooltip: `The model "main" from the study ${this.props.differentialStudy} does not have additional analysis details available.`,
      });
    }
  };

  getReportLink = (study, model) => {
    cancelRequestGetReportLinkDifferential();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetReportLinkDifferential = e;
    });
    omicNavigatorService
      .getReportLink(study, model, this.setStudyTooltip, cancelToken)
      .then(getReportLinkResponse => {
        if (getReportLinkResponse.length > 0) {
          const link = getReportLinkResponse.includes('http')
            ? getReportLinkResponse
            : // : `***REMOVED***/ocpu/library/${getReportLinkResponse}`;
              `${this.props.baseUrl}/ocpu/library/${getReportLinkResponse}`;
          this.setState({
            differentialStudyHrefVisible: true,
            differentialStudyHref: link,
          });
        } else {
          this.setStudyTooltip();
          this.setState({
            differentialStudyHrefVisible: false,
            differentialStudyHref: '',
          });
        }
      })
      .catch(error => {
        console.error('Error during getReportLink', error);
      });
  };

  handleModelChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      onSearchCriteriaChangeDifferential,
      onSearchCriteriaResetDifferential,
      differentialModelsAndTests,
    } = this.props;
    this.props.onHandlePlotTypesDifferential(value);
    onSearchCriteriaChangeDifferential(
      {
        differentialStudy: differentialStudy,
        [name]: value,
        differentialTest: '',
      },
      true,
    );
    onSearchCriteriaResetDifferential({
      isValidSearchDifferential: false,
    });
    const differentialModelsAndTestsCopy = [...differentialModelsAndTests];
    const differentialModelWithTests = differentialModelsAndTestsCopy.find(
      model => model.modelID === value,
    );
    const differentialModelTooltip =
      differentialModelWithTests?.modelDisplay || '';
    const differentialTestsMetadataVar =
      differentialModelWithTests?.tests || [];
    const differentialTestsMapped = differentialTestsMetadataVar.map(test => {
      return {
        key: test.testID,
        text: test.testID,
        value: test.testID,
      };
    });
    const uDataP = differentialTestsMetadataVar.map(t => t.testID);
    this.setState({
      differentialTestsDisabled: false,
      differentialTests: differentialTestsMapped,
      uDataP: uDataP,
      differentialModelTooltip: differentialModelTooltip,
      differentialTestTooltip: '',
    });
    this.props.onSetTestsMetadata(differentialTestsMetadataVar);
    this.getReportLink(differentialStudy, value);
  };

  handleTestChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      differentialModel,
      onMultisetQueriedDifferential,
      onSearchCriteriaChangeDifferential,
      onSearchTransitionDifferential,
    } = this.props;
    onSearchTransitionDifferential(true);
    onMultisetQueriedDifferential(false);
    const differentialTestMeta = this.props.differentialTestsMetadata.find(
      test => test.testID === value,
    );
    const differentialTestTooltip = differentialTestMeta?.testDisplay || '';
    this.setState({
      differentialTestTooltip: differentialTestTooltip,
      reloadPlotP: true,
      multisetFiltersVisibleDifferential: false,
      sigValP: this.state.uSettingsP.defaultSigValueP,
      selectedColP: [],
    });

    onSearchCriteriaChangeDifferential(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
    );
    const obj = {
      study: differentialStudy,
      modelID: differentialModel,
      testID: value,
    };
    const cacheKey = `getResultsTable_${differentialStudy}_${differentialModel}_${value}`;
    if (cache[cacheKey]) {
      this.handleGetResultsTableData(cache[cacheKey], true, true, value);
      return;
    }
    fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj), // body data type must match "Content-Type" header
    })
      // can nd-json-stream - assumes json is NDJSON, a data format that is separated into individual JSON objects with a newline character (\n). The 'nd' stands for newline delimited JSON
      .then(response => {
        return ndjsonStream(response.body); //ndjsonStream parses the response.body
      })
      .then(canNdJsonStream => {
        this.handleGetResultsTableStream(canNdJsonStream, value);
      })
      .catch(error => {
        console.error('Error during getResultsTable', error);
      });
  };

  /**
   * @param stream {ReadableStream<any>}
   */
  handleGetResultsTableStream = async (stream, test) => {
    this.reader?.cancel();
    this.props.onHandleIsDataStreaming(true);
    const { differentialStudy, differentialModel } = this.props;
    const cacheKey = `getResultsTable_${differentialStudy}_${differentialModel}_${test}`;
    let streamedResults = [];
    try {
      this.reader = stream.getReader();
      for await (let value of streamAsyncIterable(this.reader)) {
        streamedResults.push(value);
        if (
          streamedResults.length === 100 ||
          streamedResults.length % 25000 === 0
        ) {
          this.handleGetResultsTableData(
            streamedResults.slice(),
            true,
            true,
            test,
          );
        }
      }
      // Stream finished at this point
      const streamedResultsCopy = streamedResults.slice();
      cache[cacheKey] = streamedResultsCopy;
      this.props.onHandleIsDataStreaming(false);
      this.handleGetResultsTableData(streamedResultsCopy, true, true, test);
    } catch (error) {
      console.error(error);
      // Ignore?
    }
    // while(!reader.){
    // }
    // this.reader.read().then(
    //   (read = result => {
    //     if (result.done) {
    //       streamedResults.push(result.value);
    //       if (streamedResults.length > 0) {
    //         this.handleGetResultsTableData(streamedResults, true, true, value);
    //         return;
    //       }
    //     }
    //     streamedResults.push(result.value);
    //     if (streamedResults.length === 100) {
    //       this.handleGetResultsTableData(streamedResults, true, true, value);
    //     }
    //     this.reader.read().then(read);
    //   }),
    // );
  };

  handleGetResultsTableData = (
    tableData,
    resetMultiset,
    handleMaxElements,
    differentialTest,
  ) => {
    const { onDifferentialSearchUnfiltered, onDifferentialSearch } = this.props;
    if (resetMultiset) {
      this.setState({
        mustDifferential: [],
        notDifferential: [],
        uSettingsP: {
          ...this.state.uSettingsP,
          maxElementsP: handleMaxElements ? tableData.length : 0,
        },
        sigValueP: [0.05],
        uAnchorP: differentialTest,
      });
    }
    onDifferentialSearchUnfiltered({ differentialResults: tableData });
    onDifferentialSearch({ differentialResults: tableData });
  };

  handleMultisetToggleDifferential = () => {
    if (this.state.multisetFiltersVisibleDifferential === false) {
      const { thresholdColsP } = this.props;
      // on toggle open
      // this.props.onMultisetQueriedDifferential(true);
      // this.props.onSearchTransitionDifferentialAlt(true);
      if (this.state.selectedColP.length === 0) {
        var defaultColKey = null;
        const thresholdColsPKeys = thresholdColsP.map(t => t.key);
        if (thresholdColsPKeys.includes('P_Value')) {
          defaultColKey = 'P_Value';
        } else if (thresholdColsPKeys.includes('P.Value')) {
          defaultColKey = 'P.Value';
        } else if (thresholdColsPKeys.includes('PValue')) {
          defaultColKey = 'PValue';
        } else if (thresholdColsPKeys.includes('PVal')) {
          defaultColKey = 'PVal';
        } else if (thresholdColsPKeys.includes('P value')) {
          defaultColKey = 'P value';
        } else if (thresholdColsPKeys.includes('adj_P_Value')) {
          defaultColKey = 'adj_P_Val';
        } else if (thresholdColsPKeys.includes('adj.P.Value')) {
          defaultColKey = 'adj.P.Val';
        } else {
          defaultColKey = null;
        }
        let defaultCol = null;
        if (defaultColKey != null) {
          defaultCol = [
            {
              key: defaultColKey,
              text: defaultColKey,
              value: defaultColKey,
            },
          ];
        } else {
          defaultCol = [thresholdColsP[0]];
        }
        this.setState({
          uSettingsP: {
            ...this.state.uSettingsP,
            defaultselectedColP: defaultCol,
          },
          selectedColP: defaultCol,
        });
      }
      this.setState(
        {
          reloadPlotP: true,
          multisetFiltersVisibleDifferential: true,
        },
        // function() {
        //   this.updateQueryDataP();
        // },
      );
    } else {
      // on toggle close
      this.props.onSearchTransitionDifferentialAlt(true);
      // this.props.onMultisetQueriedDifferential(false);
      this.setState(
        {
          multisetFiltersVisibleDifferential: false,
          // reloadPlotP: false,
          isFilteredDifferential: false,
          // initialRenderP: true,
        },
        function() {
          const differentialTestName = 'differentialTest';
          const differentialTestVar = this.props.differentialTest;
          this.multisetTriggeredTestChange(
            differentialTestName,
            differentialTestVar,
          );
        },
      );
    }
  };

  handleMultisetOpenErrorDifferential = () => {
    cancelRequestInferenceMultisetPlot();
    this.setState({
      multisetFiltersVisibleDifferential: false,
    });
    console.log('Error during getResultsIntersection');
  };

  handleMultisetPCloseError = () => {
    this.props.onSearchTransitionDifferentialAlt(false);
    this.props.onHandleVolcanoTableLoading(false);
    this.setState(
      {
        multisetFiltersVisibleDifferential: true,
        // reloadPlotP: true,
      },
      this.updateQueryDataP(),
    );
    console.log('Error during getResultsTable');
  };

  multisetTriggeredTestChange = (name, value) => {
    const {
      differentialStudy,
      differentialModel,
      onSearchCriteriaChangeDifferential,
      // onSearchTransitionDifferentialAlt,
    } = this.props;
    // onSearchTransitionDifferentialAlt(true);
    this.setState({
      isFilteredDifferential: false,
    });
    onSearchCriteriaChangeDifferential(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
    );
    const obj = {
      study: differentialStudy,
      modelID: differentialModel,
      testID: value,
    };
    const cacheKey = `getResultsTable_${differentialStudy}_${differentialModel}_${value}`;
    if (cache[cacheKey]) {
      this.handleGetResultsTableData(cache[cacheKey], true, true, value);
      return;
    }
    fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj), // body data type must match "Content-Type" header
    })
      // can nd-json-stream - assumes json is NDJSON, a data format that is separated into individual JSON objects with a newline character (\n). The 'nd' stands for newline delimited JSON
      .then(response => {
        return ndjsonStream(response.body); //ndjsonStream parses the response.body
      })
      .then(canNdJsonStream => {
        this.handleGetResultsTableStream(canNdJsonStream, value);
      })
      .catch(error => {
        console.error('Error during getResultsTable', error);
      });
  };

  addFilterDifferential = () => {
    // this.props.onHandleVolcanoTableLoading(true);
    // this.setState({ loadingDifferentialMultisetFilters: true });
    // const uSetVP = _.cloneDeep(this.state.uSettingsP);
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...this.state.uSettingsP.indexFiltersP].concat(
      this.state.uSettingsP.indexFiltersP.length,
    );
    this.setState({
      selectedColP: [...this.state.selectedColP].concat(
        this.state.uSettingsP.defaultselectedColP,
      ),
      selectedOperatorP: [...this.state.selectedOperatorP].concat(
        this.state.uSettingsP.defaultselectedOperatorP,
      ),
      sigValueP: [...this.state.sigValueP].concat(
        this.state.uSettingsP.defaultSigValueP,
      ),
      uSettingsP: uSetVP,
      isFilteredDifferential: false,
    });
  };

  removeFilterDifferential = index => {
    // this.props.onHandleVolcanoTableLoading(true);
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...uSetVP.indexFiltersP]
      .slice(0, index)
      .concat([...uSetVP.indexFiltersP].slice(index + 1));
    for (var i = index; i < uSetVP.indexFiltersP.length; i++) {
      uSetVP.indexFiltersP[i]--;
    }
    this.setState(
      {
        selectedColP: [...this.state.selectedColP]
          .slice(0, index)
          .concat([...this.state.selectedColP].slice(index + 1)),
        selectedOperatorP: [...this.state.selectedOperatorP]
          .slice(0, index)
          .concat([...this.state.selectedOperatorP].slice(index + 1)),
        sigValueP: [...this.state.sigValueP]
          .slice(0, index)
          .concat([...this.state.sigValueP].slice(index + 1)),
        uSettingsP: uSetVP,
        isFilteredDifferential: false,
      },
      // function() {
      //   this.updateQueryDataP();
      // },
    );
  };
  changeHoveredFilter = index => {
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettingsP: uSetVP });
  };
  handleDropdownChange = (evt, { name, value, index }) => {
    // this.props.onHandleVolcanoTableLoading(true);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState(
      {
        [name]: uSelVP,
        // reloadPlotP: false,
        isFilteredDifferential: false,
      },
      // function() {
      //   this.updateQueryDataP();
      // },
    );
  };
  handleSigValuePInputChange = (name, value, index) => {
    // if (!this.state.initialRenderP) {
    //   this.props.onHandleVolcanoTableLoading(true);
    // }
    const uSelVP = [...this.state[name]];
    uSelVP[index] = parseFloat(value);
    this.setState(
      {
        [name]: uSelVP,
        reloadPlotP: true,
        isFilteredDifferential: false,
        // initialRenderP: false,
      },
      // function() {
      //   this.updateQueryDataP();
      // },
    );
  };
  handleSetChange = (mustDifferential, notDifferential) => {
    // this.props.onHandleVolcanoTableLoading(true);
    this.setState({
      mustDifferential,
      notDifferential,
      // reloadPlotP: false,
      isFilteredDifferential: false,
    });
  };

  updateQueryDataP = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      onDifferentialSearch,
      onDisablePlotDifferential,
    } = this.props;
    const {
      selectedOperatorP,
      reloadPlotP,
      sigValueP,
      selectedColP,
      differentialTests,
      mustDifferential,
      notDifferential,
    } = this.state;
    this.props.onSearchTransitionDifferentialAlt(true);
    this.setState({
      isFilteredDifferential: true,
    });
    cancelRequestMultisetInferenceData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetInferenceData = e;
    });
    omicNavigatorService
      .getResultsIntersection(
        differentialStudy,
        differentialModel,
        differentialTest,
        mustDifferential,
        notDifferential,
        sigValueP,
        this.jsonToList(selectedOperatorP),
        this.jsonToList(selectedColP),
        this.handleMultisetOpenErrorDifferential,
        cancelToken,
      )
      .then(inferenceData => {
        const multisetResultsP = inferenceData;
        this.setState({
          mustDifferential,
          notDifferential,
          uSettingsP: {
            ...this.state.uSettingsP,
            numElementsP: multisetResultsP.length,
            maxElementsP: this.state.uSettingsP.maxElementsP,
          },
          // activateMultisetFiltersP: true,
          reloadPlotP: false,
          // loadingDifferentialMultisetFilters: false,
        });
        onDifferentialSearch({
          differentialResults: multisetResultsP,
        });
      })
      .catch(error => {
        console.error('Error during getResultsIntersection', error);
      });
    //   const testsLength =
    //   typeof differentialTests === 'string' ? 1 : differentialTests.length;
    // if (reloadPlotP === true && testsLength > 1) {
    if (reloadPlotP === true && differentialTests.length > 1) {
      onDisablePlotDifferential();
      this.getMultisetPlot(
        sigValueP,
        differentialModel,
        differentialStudy,
        this.jsonToList(selectedOperatorP),
        this.jsonToList(selectedColP),
      );
    }
  };

  jsonToList(json) {
    var valueList = [];
    for (var i = 0; i < json.length; i++) {
      valueList.push(json[i].value);
    }
    return valueList;
  }

  getMultisetPlot(
    sigVal,
    differentialModel,
    differentialStudy,
    eOperatorP,
    eColP,
  ) {
    cancelRequestInferenceMultisetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestInferenceMultisetPlot = e;
    });
    omicNavigatorService
      .getResultsUpset(
        differentialStudy,
        differentialModel,
        sigVal,
        eOperatorP,
        eColP,
        undefined,
        cancelToken,
      )
      .then(svgMarkupRaw => {
        let svgMarkup = svgMarkupRaw.data;
        svgMarkup = svgMarkup.replace(
          /<svg/g,
          '<svg preserveAspectRatio="xMinYMid meet" id="differentialMultisetAnalysisSVG"',
        );
        DOMPurify.addHook('afterSanitizeAttributes', function(node) {
          if (
            node.hasAttribute('xlink:href') &&
            !node.getAttribute('xlink:href').match(/^#/)
          ) {
            node.remove();
          }
        });
        // Clean HTML string and write into our DIV
        let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
          ADD_TAGS: ['use'],
        });
        let svgInfo = { plotType: 'Multiset', svg: sanitizedSVG };
        // let svgInfo = { plotType: 'Multiset', svg: svgMarkup };
        this.props.onGetMultisetPlotDifferential({
          svgInfo,
        });
      })
      .catch(error => {
        console.error('Error during getResultsUpset', error);
      });
  }

  getDynamicSize() {
    let w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    if (w < 1200) {
      return 'small';
    } else if (w > 1199 && w < 1600) {
      return 'small';
    } else if (w > 1599 && w < 2600) {
      return undefined;
    } else if (w > 2599) return 'large';
  }

  render() {
    const {
      differentialStudies,
      differentialStudyHref,
      differentialStudyHrefVisible,
      differentialModels,
      differentialModelTooltip,
      differentialTests,
      differentialTestTooltip,
      differentialStudiesDisabled,
      differentialModelsDisabled,
      differentialTestsDisabled,
      multisetFiltersVisibleDifferential,
      differentialStudyReportTooltip,
      isFilteredDifferential,
      // activateMultisetFiltersP,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      isValidSearchDifferential,
      multisetPlotAvailableDifferential,
      plotButtonActiveDifferential,
      onHandlePlotAnimationDifferential,
      isDataStreamingResultsTable,
    } = this.props;

    const dynamicSize = this.getDynamicSize();

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
    };

    let studyIcon;
    let studyName = `${differentialStudy} Analysis Details`;

    if (differentialStudyHrefVisible) {
      studyIcon = (
        <Popup
          trigger={
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={differentialStudyHref}
            >
              <Icon
                name="line graph"
                size="large"
                className="StudyHtmlIcon"
                inverted
                circular
              />
            </a>
          }
          style={StudyPopupStyle}
          className="CustomTooltip"
          inverted
          basic
          position="bottom center"
          content={studyName}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        />
      );
    } else {
      studyIcon = (
        <Popup
          trigger={
            <a target="_blank" rel="noopener noreferrer" href={'/'}>
              <Icon name="line graph" size="large" circular inverted disabled />
            </a>
          }
          style={StudyPopupStyle}
          basic
          inverted
          className="CustomTooltip"
          position="bottom center"
          content={differentialStudyReportTooltip}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        />
      );
    }

    let MultisetFiltersDifferential;
    let MultisetFilterButtonDifferential;
    if (isValidSearchDifferential && multisetFiltersVisibleDifferential) {
      MultisetFiltersDifferential = (
        <DifferentialMultisetFilters
          {...this.props}
          {...this.state}
          onHandleDropdownChange={this.handleDropdownChange}
          onHandleSigValuePInputChange={this.handleSigValuePInputChange}
          onHandleSetChange={this.handleSetChange}
          onAddFilterDifferential={this.addFilterDifferential}
          onRemoveFilterDifferential={this.removeFilterDifferential}
          onChangeHoveredFilter={this.changeHoveredFilter}
        />
      );

      MultisetFilterButtonDifferential = (
        // <Popup
        //   trigger={
        <Button
          icon
          labelPosition="left"
          id={
            isFilteredDifferential
              ? 'MultisetFilterButtonLight'
              : 'MultisetFilterButtonDark'
          }
          className={isFilteredDifferential ? 'disabled' : ''}
          size={dynamicSize}
          fluid
          onClick={this.updateQueryDataP}
        >
          {isFilteredDifferential ? 'Filtered' : 'Filter'}
          <Icon name={isFilteredDifferential ? 'check' : 'filter'} />
        </Button>
        // }
        //   content="Use multiset criteria below to filter results"
        //   style={StudyPopupStyle}
        //   // on="click"
        //   basic
        //   inverted
        // />
      );
    }

    let PlotRadio;
    let MultisetRadio;

    if (isValidSearchDifferential) {
      PlotRadio = (
        <Transition
          visible={!multisetPlotAvailableDifferential}
          animation="flash"
          duration={1500}
        >
          <Radio
            toggle
            label="View Plot"
            className={multisetPlotAvailableDifferential ? 'ViewPlotRadio' : ''}
            checked={plotButtonActiveDifferential}
            onChange={onHandlePlotAnimationDifferential('uncover')}
            disabled={!multisetPlotAvailableDifferential}
          />
        </Transition>
      );

      MultisetRadio = (
        <React.Fragment>
          <Divider />
          <Radio
            toggle
            label="Set Analysis"
            checked={multisetFiltersVisibleDifferential}
            onChange={this.handleMultisetToggleDifferential}
            disabled={isDataStreamingResultsTable}
            className={isDataStreamingResultsTable ? 'CursorNotAllowed' : ''}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Form className="SearchCriteriaContainer">
          <Form.Field
            control={Select}
            name="differentialStudy"
            value={differentialStudy}
            options={differentialStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={differentialStudiesDisabled}
            label={{
              children: 'Study',
              htmlFor: 'form-select-control-pstudy',
            }}
            search
            searchInput={{ id: 'form-select-control-pstudy' }}
            width={13}
            selectOnBlur={false}
            selectOnNavigation={false}
          />
          <span className="StudyHtmlIconDivP">{studyIcon}</span>
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="differentialModel"
                value={differentialModel}
                options={differentialModels}
                placeholder="Select Model"
                onChange={this.handleModelChange}
                disabled={differentialModelsDisabled}
                label={{
                  children: 'Model',
                  htmlFor: 'form-select-control-pmodel',
                }}
                search
                searchInput={{ id: 'form-select-control-pmodel' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={differentialModelTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialModelTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="differentialTest"
                value={differentialTest}
                options={differentialTests}
                placeholder="Select Test"
                onChange={this.handleTestChange}
                disabled={differentialTestsDisabled}
                label={{
                  children: 'Test',
                  htmlFor: 'form-select-control-ptest',
                }}
                search
                searchInput={{ id: 'form-select-control-ptest' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={differentialTestTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialTestTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
        </Form>
        <div className="MultisetContainer">
          <div className="SliderDiv">
            <span className="MultisetRadio">{MultisetRadio}</span>
            <span className="PlotRadio">{PlotRadio}</span>
          </div>
          <div className="MultisetFilterButtonDiv">
            {MultisetFilterButtonDifferential}
          </div>
          <div className="MultisetFiltersDiv">
            {MultisetFiltersDifferential}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(DifferentialSearchCriteria);
