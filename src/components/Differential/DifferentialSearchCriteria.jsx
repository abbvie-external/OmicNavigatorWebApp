import React, { Component, Fragment } from 'react';
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
import '../Shared/SearchCriteria.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialMultisetFilters from './DifferentialMultisetFilters';

let cancelRequestGetReportLinkDifferential = () => {};
let cancelRequestGetResultsIntersection = () => {};
let cancelRequestGetResultsUpset = () => {};
const cacheResultsTable = {};
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
  dom = '';

  state = {
    differentialStudies: [],
    differentialStudyHrefVisible: false,
    differentialStudyHref: '',
    differentialStudyReportTooltip:
      'Select a study and model to view Analysis Details',
    differentialModels: [],
    differentialTests: [],
    differentialStudyTooltip: 'Select a study',
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
    numElementsP: null,
    maxElementsP: null,
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
  };

  componentDidMount() {
    this.setState({
      differentialStudiesDisabled: false,
    });
  }

  componentDidUpdate(prevProps) {
    const {
      allStudiesMetadata,
      differentialStudy,
      differentialResults,
      differentialResultsUnfiltered,
    } = this.props;
    if (
      allStudiesMetadata !== prevProps.allStudiesMetadata ||
      differentialStudy !== prevProps.differentialStudy
    ) {
      this.populateDropdowns();
    }
    // if (this.props.multisetPlotAvailableDifferential !== prevProps.multisetPlotAvailableDifferential) {
    //   this.forceUpdate();
    // }

    // uSettingsP: {
    //   ...this.state.uSettingsP,
    //   maxElementsP: handleMaxElements ? tableData.length : 0,
    // }

    //Double check this Joey D
    if (
      prevProps.differentialResults !== differentialResults ||
      prevProps.differentialResultsUnfiltered !== differentialResultsUnfiltered
    ) {
      this.setState({
        numElementsP: differentialResults?.length || null,
        maxElementsP: differentialResultsUnfiltered?.length || null,
      });
    }
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
      // loop through allStudiesMetadata to find the object with name matching differentialStudy
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
      const differentialStudyTooltip =
        differentialStudyData?.package?.description || '';
      this.setState({
        differentialStudyTooltip: differentialStudyTooltip,
        differentialModelsDisabled: false,
        differentialModels: differentialModelsMapped,
      });
      if (differentialModel === '') {
        this.getReportLink(differentialStudy, 'default');
      } else {
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
          const fetchUrlResultsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getResultsTable/ndjson?auto_unbox=true&digits=10&na="string"`;
          fetch(fetchUrlResultsTable, {
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
        differentialStudyReportTooltip: `The model ${this.props.differentialModel} from the study ${this.props.differentialStudy} does not have additional analysis details available.`,
      });
    } else {
      this.setState({
        differentialStudyReportTooltip:
          'Select a study and model to view Analysis Details',
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
            : `${this.props.baseUrl}/ocpu/library/${getReportLinkResponse}`;
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
    if (cacheResultsTable[cacheKey]) {
      this.handleGetResultsTableData(
        cacheResultsTable[cacheKey],
        true,
        true,
        value,
      );
      return;
    }
    const fetchUrlResultsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getResultsTable/ndjson?auto_unbox=true&digits=10&na="string"`;
    fetch(fetchUrlResultsTable, {
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
    this.props.onHandleIsDataStreamingResultsTable(true);
    const { differentialStudy, differentialModel } = this.props;
    const cacheKey = `getResultsTable_${differentialStudy}_${differentialModel}_${test}`;
    let streamedResults = [];
    try {
      this.reader = stream.getReader();
      for await (let value of streamAsyncIterable(this.reader)) {
        streamedResults.push(value);
        if (
          streamedResults.length === 30 ||
          streamedResults.length % 25000 === 0
        ) {
          this.handleGetResultsTableData(
            streamedResults.slice(),
            true,
            true,
            test,
            false,
          );
        }
      }
      // Stream finished at this point
      const streamedResultsCopy = streamedResults.slice();
      cacheResultsTable[cacheKey] = streamedResultsCopy;
      this.handleGetResultsTableData(
        streamedResultsCopy,
        true,
        true,
        test,
        true,
      );
    } catch (error) {
      console.error(error);
    }
  };

  handleGetResultsTableData = (
    tableData,
    resetMultiset,
    handleMaxElements,
    differentialTest,
    streamingFinished,
  ) => {
    const { onDifferentialSearchUnfiltered, onDifferentialSearch } = this.props;
    if (resetMultiset) {
      this.setState({
        mustDifferential: [],
        notDifferential: [],
        maxElementsP: handleMaxElements ? tableData.length : 0,
        sigValueP: [0.05],
        uAnchorP: differentialTest,
      });
    }
    const finished = streamingFinished ? true : false;
    onDifferentialSearchUnfiltered({ differentialResults: tableData });
    onDifferentialSearch({ differentialResults: tableData }, finished);
  };

  handleMultisetToggleDifferential = () => {
    if (this.state.multisetFiltersVisibleDifferential === false) {
      this.props.onHandleUpsetVisible(true);
      const { thresholdColsP } = this.props;
      // on toggle open
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
      this.setState({
        reloadPlotP: true,
        multisetFiltersVisibleDifferential: true,
      });
    } else {
      // on toggle close
      // this.props.onSearchTransitionDifferentialAlt(true);
      // this.props.onMultisetQueriedDifferential(false);
      this.props.onHandleUpsetVisible(false);
      this.props.onHandleIsFilteredDifferential(false);
      this.setState(
        {
          multisetFiltersVisibleDifferential: false,
          isFilteredDifferential: false,
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

  handleErrorGetResultsIntersection = () => {
    this.props.onHandleVolcanoTableLoading(false);
  };

  multisetTriggeredTestChange = (name, value) => {
    const {
      differentialStudy,
      differentialModel,
      onSearchCriteriaChangeDifferential,
    } = this.props;
    // onSearchTransitionDifferentialAlt(true);
    this.props.onHandleIsFilteredDifferential(false);
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
    if (cacheResultsTable[cacheKey]) {
      this.handleGetResultsTableData(
        cacheResultsTable[cacheKey],
        false,
        true,
        value,
      );
      return;
    }
    const fetchUrlResultsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getResultsTable/ndjson?auto_unbox=true&digits=10&na="string"`;
    fetch(fetchUrlResultsTable, {
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
    this.props.onHandleIsFilteredDifferential(false);
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
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...uSetVP.indexFiltersP]
      .slice(0, index)
      .concat([...uSetVP.indexFiltersP].slice(index + 1));
    for (var i = index; i < uSetVP.indexFiltersP.length; i++) {
      uSetVP.indexFiltersP[i]--;
    }
    this.props.onHandleIsFilteredDifferential(false);
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
    // const uSetVP = { ...this.state.uSettingsP };
    // uSetVP.hoveredFilter = index;
    this.setState({
      uSettingsP: {
        ...this.state.uSettingsP,
        hoveredFilter: index,
      },
    });
  };

  handleDropdownChange = (evt, { name, value, index }) => {
    // this.props.onHandleVolcanoTableLoading(true);
    this.props.onHandleIsFilteredDifferential(false);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState({
      [name]: uSelVP,
      reloadPlotP: true,
      isFilteredDifferential: false,
    });
  };

  handleSigValuePInputChange = (name, value, index) => {
    if (this.props.isFilteredDifferential)
      this.props.onHandleIsFilteredDifferential(false);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = parseFloat(value);
    this.setState({
      [name]: uSelVP,
      reloadPlotP: true,
      isFilteredDifferential: false,
    });
  };

  handleSetChange = (mustDifferential, notDifferential) => {
    this.setState({
      mustDifferential,
      notDifferential,
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
      maxElementsP,
    } = this.state;
    // this.props.onSearchTransitionDifferentialAlt(true); Commented on 3/31 Paul
    this.props.onHandleIsFilteredDifferential(true);
    this.setState({
      isFilteredDifferential: true,
    });
    this.props.onHandleVolcanoTableLoading(true);
    cancelRequestGetResultsIntersection();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetResultsIntersection = e;
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
        this.handleErrorGetResultsIntersection,
        cancelToken,
      )
      .then(inferenceData => {
        onDifferentialSearch({
          differentialResults: inferenceData,
        });
        this.setState({
          mustDifferential,
          notDifferential,
          numElementsP: inferenceData.length,
          maxElementsP: maxElementsP,
          reloadPlotP: false,
        });
        this.props.onHandleIsFilteredDifferential(false);
      })
      .catch(error => {
        console.error('Error during getResultsIntersection', error);
        this.props.onHandleIsFilteredDifferential(false);
      });

    if (reloadPlotP === true && differentialTests?.length > 1) {
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
    cancelRequestGetResultsUpset();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetResultsUpset = e;
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
      .then(svgUrl => {
        if (svgUrl) {
          let svgInfo = { plotType: 'Multiset', svg: svgUrl };
          this.props.onGetMultisetPlotDifferential({
            svgInfo,
          });
        }
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

  thisfunc = () => {
    this.setState({
      sigValueP: [0.25],
    });
    // document.getElementsByClassName('NumericExponentialInput')[0].value = [
    //   0.25,
    // ];
    // this.dom = document.getElementsByClassName(
    //   'MultisetFiltersDiv',
    // )[0].innerHTML;
    // console.log(this.dom);
  };

  thisfuncTwo = () => {
    // document.getElementsByClassName(
    //   'MultisetFiltersDiv',
    // )[0].innerHTML = this.dom;
  };

  render() {
    const {
      differentialStudies,
      differentialStudyTooltip,
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

    let studyName = `${differentialStudy} Analysis Details`;
    let studyIcon = (
      <Popup
        trigger={
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={differentialStudyHrefVisible ? differentialStudyHref : '/'}
          >
            <Icon
              name="line graph"
              size="large"
              className="StudyHtmlIcon"
              inverted
              circular
              disabled={!differentialStudyHrefVisible}
            />
          </a>
        }
        style={StudyPopupStyle}
        className="CustomTooltip"
        inverted
        basic
        position="bottom center"
        content={
          differentialStudyHrefVisible
            ? studyName
            : differentialStudyReportTooltip
        }
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
      />
    );

    let MultisetFiltersDifferential;
    let MultisetFilterButtonDifferential;
    if (isValidSearchDifferential && multisetFiltersVisibleDifferential) {
      MultisetFiltersDifferential = (
        <DifferentialMultisetFilters
          // {...this.props}
          // {...this.state}
          onHandleDropdownChange={this.handleDropdownChange}
          onHandleSigValuePInputChange={this.handleSigValuePInputChange}
          onHandleSetChange={this.handleSetChange}
          onAddFilterDifferential={this.addFilterDifferential}
          onRemoveFilterDifferential={this.removeFilterDifferential}
          onChangeHoveredFilter={this.changeHoveredFilter}
          uDataP={this.state.uDataP}
          uAnchorP={this.state.uAnchorP}
          uSettingsP={this.state.uSettingsP}
          metaSvgP={this.state.metaSvgP}
          sigValueP={this.state.sigValueP}
          selectedColP={this.state.selectedColP}
          selectedOperatorP={this.state.selectedOperatorP}
          mustDifferential={this.state.mustDifferential}
          notDifferential={this.state.notDifferential}
          multisetFiltersVisibleDifferential={
            this.state.multisetFiltersVisibleDifferential
          }
          thresholdColsP={this.props.thresholdColsP}
          numElementsP={this.state.numElementsP}
          maxElementsP={this.state.maxElementsP}
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
        <Fragment>
          <Transition
            visible={!multisetPlotAvailableDifferential}
            animation="flash"
            duration={1500}
          >
            <Radio
              toggle
              label="View Plot"
              className={
                multisetPlotAvailableDifferential ? 'ViewPlotRadio' : ''
              }
              checked={plotButtonActiveDifferential}
              onChange={onHandlePlotAnimationDifferential('uncover')}
              disabled={!multisetPlotAvailableDifferential}
            />
          </Transition>
          <Popup
            trigger={
              <Icon
                size="small"
                name="info circle"
                className="ViewPlotInfo"
                color="grey"
              />
            }
            style={StudyPopupStyle}
            className="CustomTooltip"
            position="bottom center"
            inverted
            basic
            on="click"
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          >
            <Popup.Content>
              View an intersecting sets, or{' '}
              <a
                href="https://github.com/hms-dbmi/UpSetR"
                target="_blank"
                rel="noreferrer"
              >
                UpSet
              </a>{' '}
              plot, derived from features that pass the selected filters in at
              least one of the possible sets. Note that this plot considers the
              column/operator/value selection and ignores the must/maybe/not
              selection.
            </Popup.Content>
          </Popup>
        </Fragment>
      );

      MultisetRadio = (
        <React.Fragment>
          <Divider />
          <Popup
            trigger={
              <Radio
                toggle
                label="Set Analysis"
                checked={multisetFiltersVisibleDifferential}
                onChange={this.handleMultisetToggleDifferential}
                disabled={isDataStreamingResultsTable}
                className={
                  isDataStreamingResultsTable ? 'CursorNotAllowed' : ''
                }
              />
            }
            style={StudyPopupStyle}
            className="CustomTooltip"
            position="bottom center"
            inverted
            basic
            content={
              isDataStreamingResultsTable
                ? 'Set Analysis is disabled until data finishes streaming'
                : 'Apply column filter(s) across multiple test results'
            }
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Form className="SearchCriteriaContainer">
          <Popup
            trigger={
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
            }
            style={StudyPopupStyle}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialStudyTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <span className="StudyHtmlIconDivP">{studyIcon}</span>
          {/* <button onClick={this.thisfunc}>read me</button>
          <button onClick={this.thisfuncTwo}>write me</button> */}
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
