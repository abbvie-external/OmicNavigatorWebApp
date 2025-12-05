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
import _ from 'lodash-es';
import { getDynamicSize, getYAxis } from '../Shared/helpers';
import '../Shared/Search.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialMultisetFilters from './DifferentialMultisetFilters';

let cancelRequestGetReportLinkDifferential = () => {};
let cancelRequestGetResultsIntersection = () => {};
let cancelRequestGetResultsMultiset = () => {};
let cancelGetAllDifferentialTests = () => {};
let cancelGetResultsTests = () => {};
let cancelGetDifferentialPlotDescriptions = () => {};
let cancelGetResultsModels = () => {};

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
class DifferentialSearch extends Component {
  dom = '';

  state = {
    differentialStudies: [],
    differentialStudyHrefVisible: false,
    differentialStudyHref: '',
    differentialMaintainer: null,
    differentialStudyReportTooltip:
      'Select a study and model to view Analysis Details',
    differentialModels: [],
    differentialTests: [],
    differentialStudyTooltip: 'Select a study',
    differentialStudyTooltips: {},
    differentialModelTooltip: 'Select a model',
    differentialModelTooltips: {},
    differentialTestTooltip: 'Select a test',
    differentialTestTooltips: {},
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
    isFilteredSearch: false,
    isSmallScreen: true,
  };

  componentDidMount() {
    const { differentialStudy, differentialModel } = this.props;
    this.getResultsStudies();
    this.populateDropdowns();
    if (differentialModel) {
      this.getDifferentialPlotDescriptions(
        differentialStudy,
        differentialModel,
      );
    }
    this.setState({
      differentialStudiesDisabled: false,
      isSmallScreen: window.innerWidth < 1725,
    });
    window.addEventListener('resize', this.setScreen, false);
  }

  componentDidUpdate(prevProps) {
    const {
      differentialModel,
      differentialStudy,
      differentialResults,
      differentialResultsUnfiltered,
    } = this.props;
    if (differentialStudy !== prevProps.differentialStudy) {
      this.populateDropdowns();
    }
    if (
      differentialModel &&
      differentialModel !== prevProps.differentialModel
    ) {
      this.getDifferentialPlotDescriptions(
        differentialStudy,
        differentialModel,
      );
    }
    // if (this.props.plotMultisetLoadedDifferential !== prevProps.plotMultisetLoadedDifferential) {
    //   this.forceUpdate();
    // }

    // uSettingsP: {
    //   ...this.state.uSettingsP,
    //   maxElementsP: handleMaxElements ? tableData.length : 0,
    // }
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

  componentWillUnmount() {
    window.removeEventListener('resize', this.setScreen);
  }

  setScreen = _.debounce(
    () => this.setState({ isSmallScreen: window.innerWidth < 1725 }),
    300,
  );

  getResultsStudies = () => {
    omicNavigatorService
      .getResultsStudies()
      .then((getResultsStudiesResponseData) => {
        let studies = [];
        // Handle if response is a string (single study) or array
        if (typeof getResultsStudiesResponseData === 'string') {
          studies = [
            {
              key: `${getResultsStudiesResponseData}Differential`,
              text: getResultsStudiesResponseData,
              value: getResultsStudiesResponseData,
            },
          ];
        } else if (
          Array.isArray(getResultsStudiesResponseData) &&
          getResultsStudiesResponseData.length
        ) {
          studies = getResultsStudiesResponseData.map((studyName) => {
            return {
              key: `${studyName}Differential`,
              text: studyName,
              value: studyName,
            };
          });
        }
        this.setState({
          differentialStudies: studies,
        });
      })
      .catch((error) => {
        console.error('Error during getResultsStudies differential', error);
      });
  };

  getStudyMetaFunc = async () => {
    const { differentialStudy } = this.props;
    const response = await omicNavigatorService.getStudyMeta(differentialStudy);
    this.setState({
      differentialStudyTooltip: response.description,
      differentialMaintainer: response.maintainer,
      differentialMaintainerEmail: response.maintainerEmail,
    });
  };

  populateDropdowns = async () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      onSearchChangeDifferential,
      onSearchTransitionDifferential,
    } = this.props;
    let models = [];
    let differentialModelIds = {};
    let tests = [];
    let differentialTestIds = {};
    if (differentialStudy !== '') {
      models = await this.getAndSetModelOptions(differentialStudy);
      this.getStudyMetaFunc();
      differentialModelIds = Object.keys(models) || [];
      this.props.onSetDifferentialModelIds(differentialModelIds);

      const allTests = await this.getAllTests(differentialStudy);
      this.props.onSetStudyModelTestMetadata(allTests);
      if (differentialModel === '') {
        this.getReportLink(differentialStudy, 'default');
      } else {
        tests = await this.getAndSetTestOptions(
          differentialStudy,
          differentialModel,
        );
        this.props.onDoMetaFeaturesExist(differentialStudy, differentialModel);
        await this.props.onGetResultsLinkouts(
          differentialStudy,
          differentialModel,
        );
        this.props.onGetMultisetColsDifferential(
          differentialStudy,
          differentialModel,
        );
        differentialTestIds = Object.keys(tests || {});
        this.setState({
          differentialModelTooltip:
            models?.[differentialModel] || differentialModel,
          uDataP: differentialTestIds,
        });
        this.props.onSetDifferentialTestIds(differentialTestIds);
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
            .then((response) => {
              return ndjsonStream(response.body); //ndjsonStream parses the response.body
            })
            .then((canNdJsonStream) => {
              this.handleGetResultsTableStream(
                canNdJsonStream,
                differentialTest,
              );
            })
            .catch((error) => {
              console.error('Error during getResultsTable', error);
            });
          onSearchChangeDifferential(
            {
              differentialStudy: differentialStudy,
              differentialModel: differentialModel,
              differentialTest: differentialTest,
              differentialFeature: differentialFeature,
            },
            false,
            true,
          );
          const differentialTestTooltip =
            tests?.[differentialTest] || differentialTest;
          this.setState({
            differentialTestTooltip,
            uAnchorP: differentialTest,
          });
        }
      }
    }
  };

  getAllTests = async (study) => {
    const { onSetDifferentialResultsColumnTooltips } = this.props;
    cancelGetAllDifferentialTests();
    let cancelToken = new CancelToken((e) => {
      cancelGetAllDifferentialTests = e;
    });
    try {
      const getAllTestsResponse = await omicNavigatorService.getAllTests(
        study,
        cancelToken,
      );
      if (getAllTestsResponse) {
        onSetDifferentialResultsColumnTooltips(getAllTestsResponse);
      } else {
        onSetDifferentialResultsColumnTooltips([]);
      }
      return getAllTestsResponse;
    } catch (error) {
      console.error('Error during getAllTests', error);
    }
  };

  getAndSetTestOptions = async (study, model) => {
    cancelGetResultsTests();
    let cancelToken = new CancelToken((e) => {
      cancelGetResultsTests = e;
    });
    try {
      const getResultsTestsResponse =
        await omicNavigatorService.getResultsTests(study, model, cancelToken);
      if (
        getResultsTestsResponse &&
        Object.keys(getResultsTestsResponse).length > 0
      ) {
        const testOptions = Object.entries(getResultsTestsResponse).map(
          ([testName]) => ({
            key: `${testName}-test-differential`,
            value: testName,
            text: testName,
          }),
        );
        const testTooltips = Object.entries(getResultsTestsResponse).reduce(
          (acc, [testName, testObj]) => {
            acc[testName] = testObj || testName;
            return acc;
          },
          {},
        );
        this.setState({
          differentialTests: testOptions,
          differentialTestTooltips: testTooltips,
          differentialTestsDisabled: false,
        });
        return getResultsTestsResponse;
      } else {
        this.setState({
          differentialTests: [],
          differentialTestsDisabled: false,
        });
        return getResultsTestsResponse;
      }
    } catch (error) {
      console.error('Error during getResultsTests', error);
    }
  };

  getDifferentialPlotDescriptions = (study, model) => {
    const { onSetDifferentialPlotDescriptions } = this.props;
    cancelGetDifferentialPlotDescriptions();
    let cancelToken = new CancelToken((e) => {
      cancelGetDifferentialPlotDescriptions = e;
    });
    omicNavigatorService
      .getPlotDescriptions(study, model, cancelToken)
      .then((getPlotDescriptionsResponse) => {
        if (getPlotDescriptionsResponse) {
          onSetDifferentialPlotDescriptions(getPlotDescriptionsResponse);
        } else {
          onSetDifferentialPlotDescriptions([]);
        }
      })
      .catch((error) => {
        console.error(
          'Error during getDifferentialPlotDescriptionsResponse',
          error,
        );
      });
  };

  getAndSetModelOptions = async (study) => {
    cancelGetResultsModels();
    let cancelToken = new CancelToken((e) => {
      cancelGetResultsModels = e;
    });
    try {
      const getResultsModelsResponse =
        await omicNavigatorService.getResultsModels(study, cancelToken);
      if (
        getResultsModelsResponse &&
        Object.keys(getResultsModelsResponse).length > 0
      ) {
        const modelOptions = Object.entries(getResultsModelsResponse).map(
          ([modelName]) => ({
            key: `${modelName}-model-differential`,
            value: modelName,
            text: modelName,
          }),
        );
        const modelTooltips = Object.entries(getResultsModelsResponse).reduce(
          (acc, [modelName, modelObj]) => {
            acc[modelName] = modelObj || modelName;
            return acc;
          },
          {},
        );
        this.setState({
          differentialModels: modelOptions,
          differentialModelTooltips: modelTooltips,
          differentialModelsDisabled: false,
        });
        return getResultsModelsResponse;
      } else {
        this.setState({
          differentialModels: [],
          differentialModelTooltips: [],
        });
        return getResultsModelsResponse;
      }
    } catch (error) {
      console.error('Error during getResultsModelsResponse', error);
    }
  };

  handleStudyChange = async (evt, { name, value }) => {
    const { onSearchChangeDifferential, onSearchResetDifferential } =
      this.props;
    this.setState({
      differentialStudyHrefVisible: false,
      differentialModelsDisabled: true,
      differentialTestsDisabled: true,
      differentialStudyTooltip: 'Select a study',
      differentialModelTooltip: 'Select a model',
      differentialTestTooltip: 'Select a test',
    });
    this.props.onGetMultiModelMappingObject(value);
    onSearchChangeDifferential(
      {
        [name]: value,
        differentialModel: '',
        differentialTest: '',
      },
      true,
      true,
    );
    onSearchResetDifferential({
      isValidSearchDifferential: false,
    });
    this.getReportLink(value, 'default');
  };

  setStudyReportTooltip = () => {
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
    let cancelToken = new CancelToken((e) => {
      cancelRequestGetReportLinkDifferential = e;
    });
    omicNavigatorService
      .getReportLink(study, model, this.setStudyReportTooltip, cancelToken)
      .then((getReportLinkResponse) => {
        let links = [];
        if (Array.isArray(getReportLinkResponse)) {
          if (getReportLinkResponse.length > 0) {
            links = getReportLinkResponse.map((response) =>
              response.includes('http')
                ? response
                : `${this.props.baseUrl}/ocpu/library/${response}`,
            );
            this.setState({
              differentialStudyHrefVisible: true,
              differentialStudyHref: links,
            });
            return;
          }
        } else if (
          typeof getReportLinkResponse === 'string' &&
          getReportLinkResponse
        ) {
          links = getReportLinkResponse.includes('http')
            ? getReportLinkResponse
            : `${this.props.baseUrl}/ocpu/library/${getReportLinkResponse}`;
          this.setState({
            differentialStudyHrefVisible: true,
            differentialStudyHref: links,
          });
          return;
        }
        this.setStudyReportTooltip();
        this.setState({
          differentialStudyHrefVisible: false,
          differentialStudyHref: '',
        });
      })
      .catch((error) => {
        console.error('Error during getReportLink', error);
      });
  };

  handleModelChange = async (evt, { name, value }) => {
    const {
      differentialStudy,
      onSearchChangeDifferential,
      onSearchResetDifferential,
      onHandleDifferentialColumnsConfigured,
    } = this.props;
    const { differentialModelTooltips } = this.state;
    const tests = await this.getAndSetTestOptions(differentialStudy, value);
    onHandleDifferentialColumnsConfigured(false);
    onSearchChangeDifferential(
      {
        differentialStudy: differentialStudy,
        [name]: value,
        differentialTest: '',
      },
      true,
      true,
    );
    onSearchResetDifferential({
      isValidSearchDifferential: false,
    });
    const differentialTestIds = Object.keys(tests || {});
    this.setState({
      differentialTestsDisabled: false,
      uDataP: differentialTestIds,
      differentialModelTooltip: differentialModelTooltips?.[value] || value,
      differentialTestTooltip: 'Select a test',
    });
    this.props.onSetDifferentialTestIds(differentialTestIds);
    this.getReportLink(differentialStudy, value);
  };

  handleTestChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      differentialModel,
      onMultisetQueriedDifferential,
      onSearchChangeDifferential,
      onSearchTransitionDifferential,
      onHandleDifferentialColumnsConfigured,
    } = this.props;
    const { differentialTestTooltips } = this.state;
    onHandleDifferentialColumnsConfigured(false);
    onSearchTransitionDifferential(true);
    onMultisetQueriedDifferential(false);
    this.setState({
      differentialTestTooltip: differentialTestTooltips?.[value] || value,
      reloadPlotP: true,
      multisetFiltersVisibleDifferential: false,
      sigValP: this.state.uSettingsP.defaultSigValueP,
      selectedColP: [],
      selectedOperatorP: [this.state.uSettingsP.defaultselectedOperatorP],
    });

    onSearchChangeDifferential(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
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
        true,
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
      .then((response) => {
        return ndjsonStream(response.body); //ndjsonStream parses the response.body
      })
      .then((canNdJsonStream) => {
        this.handleGetResultsTableStream(canNdJsonStream, value);
      })
      .catch((error) => {
        console.error('Error during getResultsTable', error);
      });
  };

  /**
   * @param stream {ReadableStream<any>}
   */
  handleGetResultsTableStream = async (stream, test) => {
    this.reader?.cancel();
    this.props.onHandleDifferentialResultsTableStreaming(true);
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
    const { onDifferentialSearch } = this.props;
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
    onDifferentialSearch({ differentialResults: tableData }, true, finished);
  };

  handleMultisetToggleDifferential = () => {
    if (this.state.multisetFiltersVisibleDifferential === false) {
      this.props.onHandleMultisetFiltersVisibleParentRef(true);
      const { multisetColsDifferential } = this.props;
      // on toggle open
      if (this.state.selectedColP.length === 0) {
        const multisetColsDifferentialKeys = multisetColsDifferential.map(
          (t) => t.key,
        );
        let defaultColKey = getYAxis(multisetColsDifferentialKeys);
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
          defaultCol = [multisetColsDifferential[0]];
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
      this.props.onResetOverlay();
    } else {
      // on toggle close
      // this.props.onSearchTransitionDifferentialAlt(true);
      // this.props.onMultisetQueriedDifferential(false);
      this.props.onHandleMultisetFiltersVisibleParentRef(false);
      this.setState(
        {
          multisetFiltersVisibleDifferential: false,
          isFilteredSearch: false,
        },
        function () {
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
    this.props.onHandleResultsTableLoading(false);
  };

  multisetTriggeredTestChange = (name, value) => {
    const { differentialStudy, differentialModel, onSearchChangeDifferential } =
      this.props;
    // onSearchTransitionDifferentialAlt(true);
    this.setState({
      isFilteredSearch: false,
    });
    onSearchChangeDifferential(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
      false,
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
        true,
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
      .then((response) => {
        return ndjsonStream(response.body); //ndjsonStream parses the response.body
      })
      .then((canNdJsonStream) => {
        this.handleGetResultsTableStream(canNdJsonStream, value);
      })
      .catch((error) => {
        console.error('Error during getResultsTable', error);
      });
  };

  addFilterDifferential = () => {
    // this.props.onHandleResultsTableLoading(true);
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
      isFilteredSearch: false,
    });
  };

  removeFilterDifferential = (index) => {
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
        isFilteredSearch: false,
      },
      // function() {
      //   this.updateQueryDataP();
      // },
    );
  };

  changeHoveredFilter = (index) => {
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
    // this.props.onHandleResultsTableLoading(true);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState({
      [name]: uSelVP,
      reloadPlotP: true,
      isFilteredSearch: false,
    });
  };

  handleSigValuePInputChange = (name, value, index) => {
    const uSelVP = [...this.state[name]];
    uSelVP[index] = parseFloat(value);
    this.setState({
      [name]: uSelVP,
      reloadPlotP: true,
      isFilteredSearch: false,
    });
  };

  handleSetChange = (mustDifferential, notDifferential) => {
    this.setState({
      mustDifferential,
      notDifferential,
      isFilteredSearch: false,
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
    this.props.onHandleIsFilteredDifferential(true);
    this.setState({
      isFilteredSearch: true,
    });
    this.props.onHandleResultsTableLoading(true);
    cancelRequestGetResultsIntersection();
    let cancelToken = new CancelToken((e) => {
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
      .then((inferenceData) => {
        onDifferentialSearch(
          {
            differentialResults: inferenceData,
          },
          false,
          true,
          true,
        );
        this.setState({
          mustDifferential,
          notDifferential,
          numElementsP: inferenceData.length,
          maxElementsP: maxElementsP,
          reloadPlotP: false,
        });
        this.props.onHandleIsFilteredDifferential(false);
      })
      .catch((error) => {
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
    cancelRequestGetResultsMultiset();
    let cancelToken = new CancelToken((e) => {
      cancelRequestGetResultsMultiset = e;
    });
    omicNavigatorService
      .getResultsMultiset(
        differentialStudy,
        differentialModel,
        sigVal,
        eOperatorP,
        eColP,
        undefined,
        cancelToken,
      )
      .then((svgUrl) => {
        if (svgUrl) {
          let svgInfo = { plotType: 'Multiset', svg: svgUrl };
          this.props.onGetMultisetPlotDifferential({
            svgInfo,
          });
        }
      })
      .catch((error) => {
        console.error('Error during getResultsMultiset', error);
      });
  }

  render() {
    const {
      differentialStudies,
      differentialMaintainer,
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
      isFilteredSearch,
      isSmallScreen,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      isValidSearchDifferential,
      plotMultisetLoadedDifferential,
      multisetButttonActiveDifferential,
      onHandlePlotAnimationDifferential,
      differentialResultsTableStreaming,
    } = this.props;

    const dynamicSize = getDynamicSize();

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
    };

    const getMaintainer = (hasMaintainer) => {
      const { differentialStudy } = this.props;
      const { differentialMaintainer, differentialMaintainerEmail } =
        this.state;
      if (differentialStudy === '') {
        return <div>Select a study to view Maintainer</div>;
      } else {
        return !hasMaintainer ? (
          <div>Maintainer unknown</div>
        ) : (
          <>
            Maintainer: <br></br>
            {differentialMaintainer} <br></br>
            <a
              href={`mailto:${differentialMaintainerEmail}?subject=${differentialStudy}`}
            >
              {differentialMaintainerEmail}
            </a>
          </>
        );
      }
    };
    const hasMaintainer =
      differentialMaintainer != null &&
      differentialMaintainer !== '' &&
      differentialMaintainer !== 'Unknown';

    let maintainerIcon = (
      <Popup
        trigger={
          <span>
            <Transition
              visible={!hasMaintainer}
              animation={hasMaintainer ? 'flash' : null}
              duration={1000}
            >
              <Icon
                name="user"
                // size="large"
                className={
                  hasMaintainer ? 'StudyHtmlIcon' : 'StudyHtmlIcon DisabledLink'
                }
                color={hasMaintainer ? null : 'grey'}
                inverted
                circular
              />
            </Transition>
          </span>
        }
        style={StudyPopupStyle}
        inverted
        basic
        position="bottom center"
        content={getMaintainer(hasMaintainer)}
        on="click"
      />
    );
    let studyName = `${differentialStudy} Analysis Details`;
    let studyIcon = (
      <Popup
        trigger={
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={null}
            onClick={(e) => {
              e.preventDefault();
              if (
                differentialStudyHrefVisible &&
                Array.isArray(differentialStudyHref)
              ) {
                differentialStudyHref.forEach((link) => {
                  if (link) window.open(link, '_blank', 'noopener,noreferrer');
                });
              } else if (
                differentialStudyHrefVisible &&
                typeof differentialStudyHref === 'string'
              ) {
                window.open(
                  differentialStudyHref,
                  '_blank',
                  'noopener,noreferrer',
                );
              }
            }}
          >
            <Transition
              visible={!differentialStudyHrefVisible}
              animation={differentialStudyHrefVisible ? 'flash' : null}
              duration={1000}
            >
              <Icon
                name="info"
                className={
                  differentialStudyHrefVisible
                    ? 'StudyHtmlIcon'
                    : 'StudyHtmlIcon DisabledLink'
                }
                color={!differentialStudyHrefVisible ? 'grey' : null}
                inverted
                circular
              />
            </Transition>
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
        on="hover"
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
          multisetColsDifferential={this.props.multisetColsDifferential}
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
            isFilteredSearch
              ? 'MultisetFilterButtonLight'
              : 'MultisetFilterButtonDark'
          }
          className={isFilteredSearch ? 'disabled' : ''}
          size={dynamicSize}
          fluid
          onClick={this.updateQueryDataP}
        >
          {isFilteredSearch ? 'Filtered' : 'Filter'}
          <Icon name={isFilteredSearch ? 'check' : 'filter'} />
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
        <div className={multisetFiltersVisibleDifferential ? 'Show' : 'Hide'}>
          <Transition
            visible={!plotMultisetLoadedDifferential}
            animation="flash"
            duration={1500}
          >
            <Radio
              toggle
              label="View Set Intersections"
              className={plotMultisetLoadedDifferential ? 'ViewPlotRadio' : ''}
              checked={multisetButttonActiveDifferential}
              onChange={onHandlePlotAnimationDifferential('uncover')}
              disabled={!plotMultisetLoadedDifferential}
            />
          </Transition>
          <Popup
            trigger={
              <Icon
                // size="small"
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
              <a href="https://upset.app/" target="_blank" rel="noreferrer">
                UpSet
              </a>{' '}
              plot, that displays the number of features found in every
              combination of test results. Note that this plot considers the
              column/operator/value selection and ignores the must/maybe/not
              selection.
            </Popup.Content>
          </Popup>
        </div>
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
                disabled={differentialResultsTableStreaming}
                className={
                  differentialResultsTableStreaming ? 'CursorNotAllowed' : ''
                }
              />
            }
            style={StudyPopupStyle}
            className="CustomTooltip"
            position="right center"
            inverted
            basic
            content={
              differentialResultsTableStreaming
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
        <Form className="SearchContainer">
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
          <span className="MaintainerHtmlIconDivP">{maintainerIcon}</span>
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
            disabled={!differentialStudy}
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
            <span className={isSmallScreen ? 'Block' : 'FloatRight'}>
              {PlotRadio}
            </span>
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

export default withRouter(DifferentialSearch);
