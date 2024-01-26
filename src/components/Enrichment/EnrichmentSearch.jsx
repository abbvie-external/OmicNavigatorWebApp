import React, { Component, Fragment } from 'react';
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
import _ from 'lodash-es';
import ndjsonStream from 'can-ndjson-stream';
import { CancelToken } from 'axios';
import '../Shared/Search.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import EnrichmentMultisetFilters from './EnrichmentMultisetFilters';
import { getDynamicSize } from '../Shared/helpers';

let cancelRequestGetReportLinkEnrichment = () => {};
// let cancelGetEnrichmentsTable = () => {};
let cancelRequestGetEnrichmentsIntersection = () => {};
let cancelRequestGetEnrichmentsMultiset = () => {};
let cancelGetEnrichmentResultsColumnTooltips = () => {};
let cancelGetEnrichmentPlotDescriptions = () => {};
const cacheEnrichmentsTable = {};
async function* streamAsyncIterable(reader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return;
    }
    yield value;
  }
}

class EnrichmentSearch extends Component {
  state = {
    enrichmentStudies: [],
    enrichmentStudyHrefVisible: false,
    enrichmentStudyHref: '',
    enrichmentStudyReportTooltip:
      'Select a study and model to view Analysis Details',
    enrichmentModels: [],
    enrichmentAnnotations: [],
    enrichmentStudyReportTooltip: 'Select a study',
    enrichmentModelTooltip: '',
    enrichmentAnnotationTooltip: '',
    enrichmentStudiesDisabled: true,
    enrichmentModelsDisabled: true,
    enrichmentAnnotationsDisabled: true,
    uAnchor: '',
    selectedCol: [
      {
        key: 'adj_P_Val',
        text: 'Adjusted P Value',
        value: 'adj_P_Val',
      },
    ],
    selectedOperator: [
      {
        key: '<',
        text: '<',
        value: '<',
      },
    ],
    sigValue: [0.05],
    mustEnrichment: [],
    notEnrichment: [],
    numElements: null,
    maxElements: null,
    uSettings: {
      defaultSelectedCol: {
        key: 'adj_P_Val',
        text: 'Adjusted P Value',
        value: 'adj_P_Val',
      },
      defaultSelectedOperator: {
        key: '<',
        text: '<',
        value: '<',
      },
      defaultSigValue: 0.05,
      useAnchor: false,
      hoveredFilter: -1,
      indexFilters: [0],
      displayMetaData: true,
      templateName: 'enrichment-multiset',
      metaSvg: '',
      heightScalar: 1,
      thresholdCols: [
        {
          key: 'adj_P_Val',
          text: 'adj_P_Val',
          value: 'adj_P_Val',
        },
      ],
      thresholdOperator: [
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
      ],
      useTestCheckBoxes: true,
    },
    reloadPlot: true,
    reloadTests: false,
    isFilteredEnrichment: false,
    multisetFiltersVisibleEnrichment: false,
    isSmallScreen: true,
  };

  componentDidMount() {
    this.setState({
      enrichmentStudiesDisabled: false,
      isSmallScreen: window.innerWidth < 1725,
    });
    const setScreen = _.debounce(
      () => this.setState({ isSmallScreen: window.innerWidth < 1725 }),
      300,
    );
    window.addEventListener('resize', setScreen, false);
  }

  componentDidUpdate(prevProps) {
    const { allStudiesMetadata, enrichmentStudy, enrichmentResults } =
      this.props;
    if (
      allStudiesMetadata !== prevProps.allStudiesMetadata ||
      enrichmentStudy !== prevProps.enrichmentStudy
    ) {
      this.populateDropdowns();
    }

    if (prevProps.enrichmentResults !== enrichmentResults) {
      this.setState({
        numElements: enrichmentResults?.length || null,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize');
  }

  populateDropdowns = () => {
    const {
      allStudiesMetadata,
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      enrichmentTestAndDescription,
      onSearchChangeEnrichment,
      onSearchTransitionEnrichment,
      onGetEnrichmentsLinkouts,
    } = this.props;

    const studies = allStudiesMetadata.map((study) => {
      const studyName = study.name;
      return {
        key: `${studyName}Enrichment`,
        text: studyName,
        value: studyName,
      };
    });
    this.setState({
      enrichmentStudies: studies,
    });
    if (enrichmentStudy !== '') {
      // loop through allStudiesMetadata to find the object with the name matching enrichmentStudy
      const allStudiesMetadataCopy = [...allStudiesMetadata];
      const enrichmentStudyData = allStudiesMetadataCopy.find(
        (study) => study.name === enrichmentStudy,
      );
      const enrichmentModelsAndAnnotationsVar =
        enrichmentStudyData?.enrichments || [];
      this.props.onSetStudyModelAnnotationMetadata(
        enrichmentStudyData,
        enrichmentModelsAndAnnotationsVar,
      );
      const enrichmentModelIds = [];
      enrichmentModelsAndAnnotationsVar.forEach((enrichment) =>
        enrichmentModelIds.push(enrichment.modelID),
      );
      this.props.onSetEnrichmentModelIds(enrichmentModelIds);
      const enrichmentModelsMapped = enrichmentModelsAndAnnotationsVar.map(
        (enrichment) => {
          return {
            key: `${enrichment.modelID}Enrichment`,
            text: enrichment.modelID,
            value: enrichment.modelID,
          };
        },
      );
      const enrichmentStudyReportTooltip =
        enrichmentStudyData?.package?.description || '';
      this.setState({
        enrichmentStudyReportTooltip: enrichmentStudyReportTooltip,
        enrichmentModelsDisabled: false,
        enrichmentModels: enrichmentModelsMapped,
      });
      this.getResultsColumnTooltips(enrichmentStudy);
      this.getEnrichmentPlotDescriptions(enrichmentStudy);
      if (enrichmentModel === '') {
        this.getReportLink(enrichmentStudy, 'default');
      } else {
        this.props.onHandleHasBarcodeData();
        this.props.onHandlePlotTypesEnrichment(enrichmentModel);
        const enrichmentModelWithAnnotations =
          enrichmentModelsAndAnnotationsVar.find(
            (model) => model.modelID === enrichmentModel,
          );
        const enrichmentModelTooltip =
          enrichmentModelWithAnnotations?.modelDisplay || '';
        this.setState({
          enrichmentModelTooltip: enrichmentModelTooltip,
        });
        const enrichmentAnnotationsMetadataVar =
          enrichmentModelWithAnnotations?.annotations || [];
        const enrichmentAnnotationsMapped =
          enrichmentAnnotationsMetadataVar.map((annotation) => {
            return {
              key: `${annotation.annotationID}Enrichment`,
              text: annotation.annotationID,
              value: annotation.annotationID,
            };
          });
        // const uDataMapped = enrichmentAnnotationsMetadataVar.map(
        //   a => a.annotationID,
        // );
        this.setState({
          enrichmentAnnotationsDisabled: false,
          enrichmentAnnotations: enrichmentAnnotationsMapped,
          // uData: uDataMapped,
        });
        this.props.onSetAnnotationsMetadata(enrichmentAnnotationsMetadataVar);
        this.getReportLink(enrichmentStudy, enrichmentModel);
        if (enrichmentAnnotation !== '') {
          onGetEnrichmentsLinkouts(enrichmentStudy, enrichmentAnnotation);
          onSearchTransitionEnrichment(true);
          const obj = {
            study: enrichmentStudy,
            modelID: enrichmentModel,
            annotationID: enrichmentAnnotation,
            type: pValueType,
          };
          const fetchUrlEnrichmentsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getEnrichmentsTable/ndjson?auto_unbox=true&digits=10&na="string"`;
          fetch(fetchUrlEnrichmentsTable, {
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
              this.handleGetEnrichmentsTableStream(
                canNdJsonStream,
                enrichmentAnnotation,
                false,
                true,
                false,
              );
            })
            .catch((error) => {
              console.error('Error during getEnrichmentsTable', error);
            });
          onSearchChangeEnrichment(
            {
              enrichmentStudy: enrichmentStudy,
              enrichmentModel: enrichmentModel,
              enrichmentAnnotation: enrichmentAnnotation,
              enrichmentTestAndDescription: enrichmentTestAndDescription,
            },
            false,
          );
          const enrichmentAnnotationMeta =
            enrichmentAnnotationsMetadataVar.find(
              (annotation) => annotation.annotationID === enrichmentAnnotation,
            );
          const enrichmentAnnotationTooltip =
            enrichmentAnnotationMeta?.annotationDisplay || '';
          this.setState({
            enrichmentAnnotationTooltip,
          });
        }
      }
    }
  };

  getResultsColumnTooltips = (study) => {
    const { onSetEnrichmentResultsColumnTooltips } = this.props;
    cancelGetEnrichmentResultsColumnTooltips();
    let cancelToken = new CancelToken((e) => {
      cancelGetEnrichmentResultsColumnTooltips = e;
    });
    omicNavigatorService
      .getResultsColumnTooltips(study)
      .then((getResultsColumnTooltipsResponse) => {
        if (getResultsColumnTooltipsResponse) {
          onSetEnrichmentResultsColumnTooltips(
            getResultsColumnTooltipsResponse,
          );
        } else {
          onSetEnrichmentResultsColumnTooltips([]);
        }
      })
      .catch((error) => {
        console.error(
          'Error during getEnrichmentResultsColumnTooltipsResponse',
          error,
        );
      });
  };

  getEnrichmentPlotDescriptions = (study) => {
    const { onSetEnrichmentPlotDescriptions } = this.props;
    cancelGetEnrichmentPlotDescriptions();
    let cancelToken = new CancelToken((e) => {
      cancelGetEnrichmentPlotDescriptions = e;
    });
    omicNavigatorService
      .getPlotDescriptions(study)
      .then((getPlotDescriptionsResponse) => {
        if (getPlotDescriptionsResponse) {
          onSetEnrichmentPlotDescriptions(getPlotDescriptionsResponse);
        } else {
          onSetEnrichmentPlotDescriptions([]);
        }
      })
      .catch((error) => {
        console.error(
          'Error during getEnrichmentPlotDescriptionsResponse',
          error,
        );
      });
  };

  handleStudyChange = (evt, { name, value }) => {
    const { onSearchChangeEnrichment, onSearchResetEnrichment } = this.props;
    onSearchChangeEnrichment(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentTestAndDescription: '',
      },
      true,
    );
    onSearchResetEnrichment({
      isValidSearchEnrichment: false,
    });
    this.setState({
      enrichmentStudyHrefVisible: false,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true,
      enrichmentModelTooltip: '',
      enrichmentAnnotationTooltip: '',
    });
    this.getReportLink(value, 'default');
  };

  setStudyTooltip = () => {
    if (this.props.enrichmentModel !== '') {
      this.setState({
        enrichmentStudyReportTooltip: `The model ${this.props.enrichmentModel} from the study ${this.props.enrichmentStudy} does not have additional analysis details available.`,
      });
    } else {
      this.setState({
        enrichmentStudyReportTooltip:
          'Select a study and model to view Analysis Details',
      });
    }
  };

  getReportLink = (study, model) => {
    cancelRequestGetReportLinkEnrichment();
    let cancelToken = new CancelToken((e) => {
      cancelRequestGetReportLinkEnrichment = e;
    });
    omicNavigatorService
      .getReportLink(study, model, this.setStudyTooltip, cancelToken)
      .then((getReportLinkResponse) => {
        if (getReportLinkResponse.length > 0) {
          const link = getReportLinkResponse.includes('http')
            ? getReportLinkResponse
            : `${this.props.baseUrl}/ocpu/library/${getReportLinkResponse}`;
          this.setState({
            enrichmentStudyHrefVisible: true,
            enrichmentStudyHref: link,
          });
        } else {
          this.setStudyTooltip();
          this.setState({
            enrichmentStudyHrefVisible: false,
            enrichmentStudyHref: '',
          });
        }
      })
      .catch((error) => {
        console.error('Error during getReportLink', error);
      });
  };

  handleModelChange = (evt, { name, value }) => {
    const {
      enrichmentStudy,
      onSearchChangeEnrichment,
      onSearchResetEnrichment,
      enrichmentModelsAndAnnotations,
      onHandleEnrichmentColumnsConfigured,
    } = this.props;
    onHandleEnrichmentColumnsConfigured(false);
    this.props.onHandleHasBarcodeData(value);
    this.props.onHandlePlotTypesEnrichment(value);
    onSearchChangeEnrichment(
      {
        enrichmentStudy: enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: '',
        enrichmentTestAndDescription: '',
      },
      true,
    );
    onSearchResetEnrichment({
      isValidSearchEnrichment: false,
    });
    const enrichmentModelsAndAnnotationsCopy = [
      ...enrichmentModelsAndAnnotations,
    ];
    const enrichmentModelWithAnnotations =
      enrichmentModelsAndAnnotationsCopy.find(
        (model) => model.modelID === value,
      );
    const enrichmentModelTooltip =
      enrichmentModelWithAnnotations?.modelDisplay || '';
    const enrichmentAnnotationsMetadataVar =
      enrichmentModelWithAnnotations.annotations || [];
    const enrichmentAnnotationsMapped = enrichmentAnnotationsMetadataVar.map(
      (annotation) => {
        return {
          key: annotation.annotationID,
          text: annotation.annotationID,
          value: annotation.annotationID,
        };
      },
    );
    this.setState({
      enrichmentAnnotationsDisabled: false,
      enrichmentAnnotations: enrichmentAnnotationsMapped,
      enrichmentModelTooltip: enrichmentModelTooltip,
      enrichmentAnnotationTooltip: '',
    });
    this.props.onSetAnnotationsMetadata(enrichmentAnnotationsMetadataVar);
    this.getReportLink(enrichmentStudy, value);
  };

  handleAnnotationChange = (evt, { name, value }) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      pValueType,
      onMultisetQueriedEnrichment,
      onSearchTransitionEnrichment,
      onSearchChangeEnrichment,
      onHandleEnrichmentColumnsConfigured,
    } = this.props;
    onHandleEnrichmentColumnsConfigured(false);
    onSearchTransitionEnrichment(true);
    onMultisetQueriedEnrichment(false);
    const enrichmentAnnotationMeta =
      this.props.enrichmentAnnotationsMetadata.find(
        (annotation) => annotation.annotationID === value,
      );
    const enrichmentAnnotationTooltip =
      enrichmentAnnotationMeta?.annotationDisplay || '';
    this.props.onAnnotationChange();
    this.setState({
      enrichmentAnnotationTooltip,
      reloadPlot: true,
      multisetFiltersVisibleEnrichment: false,
    });
    onSearchChangeEnrichment(
      {
        enrichmentStudy: enrichmentStudy,
        enrichmentModel: enrichmentModel,
        [name]: value,
        enrichmentTestAndDescription: '',
      },
      true,
    );
    const cacheKey = `getEnrichmentsTable_${enrichmentStudy}_${enrichmentModel}_${value}_${pValueType}`;
    if (cacheEnrichmentsTable[cacheKey]) {
      this.handleGetEnrichmentsTableData(
        cacheEnrichmentsTable[cacheKey],
        value,
        true,
        true,
        false,
      );
      return;
    }
    const obj = {
      study: enrichmentStudy,
      modelID: enrichmentModel,
      annotationID: value,
      type: pValueType,
    };
    const fetchUrlEnrichmentsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getEnrichmentsTable/ndjson?auto_unbox=true&digits=10&na="string"`;
    fetch(fetchUrlEnrichmentsTable, {
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
        this.handleGetEnrichmentsTableStream(
          canNdJsonStream,
          value,
          true,
          true,
          false,
        );
      })
      .catch((error) => {
        console.error('Error during getEnrichmentsTable', error);
      });
  };

  /**
   * @param stream {ReadableStream<any>}
   */
  handleGetEnrichmentsTableStream = async (
    stream,
    annotation,
    handleUSettings,
    handleMaxElements,
    handleColumns,
  ) => {
    this.reader?.cancel();
    this.props.onHandleIsDataStreamingEnrichmentsTable(true);
    const { enrichmentStudy, enrichmentModel, pValueType } = this.props;
    const cacheKey = `getEnrichmentsTable_${enrichmentStudy}_${enrichmentModel}_${annotation}_${pValueType}`;
    let streamedResults = [];
    try {
      this.reader = stream.getReader();
      for await (let value of streamAsyncIterable(this.reader)) {
        streamedResults.push(value);
        if (
          streamedResults.length === 30 ||
          streamedResults.length % 25000 === 0
        ) {
          this.handleGetEnrichmentsTableData(
            streamedResults.slice(),
            annotation,
            handleUSettings,
            handleMaxElements,
            handleColumns,
          );
        }
      }
      // Stream finished at this point
      const streamedResultsCopy = streamedResults.slice();
      cacheEnrichmentsTable[cacheKey] = streamedResultsCopy;
      this.props.onHandleIsDataStreamingEnrichmentsTable(false);
      this.handleGetEnrichmentsTableData(
        streamedResultsCopy,
        annotation,
        handleUSettings,
        handleMaxElements,
        handleColumns,
      );
    } catch (error) {
      console.error(error);
    }
  };

  handleGetEnrichmentsTableData = (
    data,
    annotation,
    handleUSettings,
    handleMaxElements,
    // handleColumns,
  ) => {
    if (handleUSettings) {
      this.props.onHandleNetworkSigValue(0.05);
      this.setState({
        mustEnrichment: [],
        notEnrichment: [],
        sigValue: [0.05],
      });
    }
    if (handleMaxElements) {
      this.setState({
        maxElements: data.length,
      });
    }
    // if (handleColumns) {
    //   this.props.onColumnReorder({
    //     enrichmentResults: this.annotationdata,
    //   });
    // }
    this.props.onEnrichmentSearch(data, annotation);
  };

  handlePValueTypeChange = (evt, { value }) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      onSearchTransitionEnrichment,
      onEnrichmentSearch,
      onHandlePValueTypeChange,
      onHandleEnrichmentTableLoading,
    } = this.props;
    const { multisetFiltersVisibleEnrichment } = this.state;
    onHandlePValueTypeChange(value);
    if (!multisetFiltersVisibleEnrichment) {
      const cacheKey = `getEnrichmentsTable_${enrichmentStudy}_${enrichmentModel}_${enrichmentAnnotation}_${value}`;
      if (cacheEnrichmentsTable[cacheKey]) {
        this.handleGetEnrichmentsTableData(
          cacheEnrichmentsTable[cacheKey],
          enrichmentAnnotation,
          false,
          true,
          false,
        );
        return;
      }
      onHandleEnrichmentTableLoading(true);
      const obj = {
        study: enrichmentStudy,
        modelID: enrichmentModel,
        annotationID: enrichmentAnnotation,
        type: value,
      };
      const fetchUrlEnrichmentsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getEnrichmentsTable/ndjson?auto_unbox=true&digits=10&na="string"`;
      fetch(fetchUrlEnrichmentsTable, {
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
          this.handleGetEnrichmentsTableStream(
            canNdJsonStream,
            enrichmentAnnotation,
            false,
            true,
            false,
          );
        })
        .catch((error) => {
          onSearchTransitionEnrichment(false);
          console.error('Error during getEnrichmentsTable', error);
        });
    } else {
      const { sigValue, selectedOperator, mustEnrichment, notEnrichment } =
        this.state;
      this.setState({
        reloadPlot: true,
        isFilteredEnrichment: this.hasMustOrNotAnnotations(),
      });
      this.props.onHandleEnrichmentTableLoading(true);
      cancelRequestGetEnrichmentsIntersection();
      let cancelToken = new CancelToken((e) => {
        cancelRequestGetEnrichmentsIntersection = e;
      });
      omicNavigatorService
        .getEnrichmentsIntersection(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          mustEnrichment,
          notEnrichment,
          sigValue,
          this.jsonToList(selectedOperator),
          value,
          undefined,
          cancelToken,
        )
        .then((annotationData) => {
          const multisetResults = annotationData;
          this.setState({
            mustEnrichment,
            notEnrichment,
            numElements: multisetResults.length,
            maxElements: this.state.maxElements,
          });
          onEnrichmentSearch(multisetResults, enrichmentAnnotation);
        })
        .catch((error) => {
          console.error('Error during getEnrichmentsIntersection', error);
        });
    }
  };

  hasMustOrNotAnnotations = () => {
    // if no annotations are "must" or "not", then set isFilteredEnrichment to true
    return this.state.mustEnrichment.length > 0 ||
      this.state.notEnrichment.length > 0
      ? false
      : true;
  };

  handleMultisetToggleEnrichment = () => {
    if (this.state.multisetFiltersVisibleEnrichment === false) {
      // on toggle open
      this.setState({
        reloadPlot: true,
        multisetFiltersVisibleEnrichment: true,
        isFilteredEnrichment: this.hasMustOrNotAnnotations(),
      });
    } else {
      // on toggle close
      // this.props.onHandleNetworkTests([], []);
      this.props.onMultisetQueriedEnrichment(false);
      this.setState({
        reloadPlot: false,
        multisetFiltersVisibleEnrichment: false,
      });
      const enrichmentAnnotationName = 'enrichmentAnnotation';
      const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
      this.multisetTriggeredAnnotationChange(
        enrichmentAnnotationName,
        enrichmentAnnotationVar,
      );
    }
  };

  handleErrorGetEnrichmentsIntersection = () => {
    this.props.onHandleNetworkGraphReady(true);
    this.props.onHandleEnrichmentTableLoading(false);
  };

  multisetTriggeredAnnotationChange = (name, value) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      pValueType,
      // onSearchTransitionEnrichment,
      onSearchChangeEnrichment,
    } = this.props;
    this.setState({
      multisetFiltersVisibleEnrichment: false,
    });
    onSearchChangeEnrichment(
      {
        enrichmentStudy: enrichmentStudy,
        enrichmentModel: enrichmentModel,
        [name]: value,
        enrichmentTestAndDescription: '',
      },
      true,
    );
    const cacheKey = `getEnrichmentsTable_${enrichmentStudy}_${enrichmentModel}_${value}_${pValueType}`;
    if (cacheEnrichmentsTable[cacheKey]) {
      this.handleGetEnrichmentsTableData(
        cacheEnrichmentsTable[cacheKey],
        value,
        false,
        false,
        false,
      );
      return;
    }
    const obj = {
      study: enrichmentStudy,
      modelID: enrichmentModel,
      annotationID: value,
      type: pValueType,
    };
    const fetchUrlEnrichmentsTable = `${this.props.baseUrl}/ocpu/library/OmicNavigator/R/getEnrichmentsTable/?auto_unbox=true&digits=10&na="string"`;
    fetch(fetchUrlEnrichmentsTable, {
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
        this.handleGetEnrichmentsTableStream(
          canNdJsonStream,
          value,
          false,
          false,
          false,
        );
      })
      .catch((error) => {
        console.error('Error during getEnrichmentsTable', error);
      });
  };

  changeHoveredFilter = (index) => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettings: uSetVP });
  };

  handleOperatorChange = (evt, { name, value, index }) => {
    this.setState({
      isFilteredEnrichment: this.hasMustOrNotAnnotations(),
    });
    this.props.onHandleNetworkOperator(value);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState({
      [name]: uSelVP,
      reloadPlot: true,
    });
  };

  handleSigValueEInputChange = (value) => {
    this.setState({
      sigValue: [parseFloat(value)],
      reloadPlot: true,
      isFilteredEnrichment: this.hasMustOrNotAnnotations(),
    });
    this.props.onHandleNetworkSigValue(parseFloat(value));
  };

  handleSetChange = (mustEnrichment, notEnrichment) => {
    const hasMustOrNotAnnotations =
      mustEnrichment.length > 0 || notEnrichment.length > 0 ? false : true;
    this.setState({
      mustEnrichment,
      notEnrichment,
      isFilteredEnrichment: hasMustOrNotAnnotations,
      // reloadPlot: false,
    });
    this.props.onHandleNetworkTests(mustEnrichment, notEnrichment);
  };

  handleFilterOutChange = (test, isMultiset) => {
    const { mustEnrichment, notEnrichment, multisetFiltersVisibleEnrichment } =
      this.state;
    let mustEnrichmentCopy = [...mustEnrichment];
    let notEnrichmentCopy = [...notEnrichment];
    if (mustEnrichmentCopy.includes(test)) {
      mustEnrichmentCopy.splice(mustEnrichmentCopy.indexOf(test), 1);
    } else if (notEnrichmentCopy.includes(test)) {
      notEnrichmentCopy.splice(notEnrichmentCopy.indexOf(test), 1);
    }
    this.setState(
      {
        mustEnrichment: mustEnrichmentCopy,
        notEnrichment: notEnrichmentCopy,
        reloadPlot: true,
        reloadTests: true,
        isFilteredEnrichment: this.hasMustOrNotAnnotations(),
      },
      // function() {
      //   this.updateQueryData();
      // },
    );
    this.props.onMultisetTestsFiltered(test, !multisetFiltersVisibleEnrichment);
  };

  updateQueryData = () => {
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      onEnrichmentSearch,
      onDisablePlotEnrichment,
      tests,
    } = this.props;
    const {
      selectedOperator,
      reloadPlot,
      sigValue,
      mustEnrichment,
      notEnrichment,
      reloadTests,
    } = this.state;
    this.setState({
      isFilteredEnrichment: true,
    });
    if (reloadTests) {
      this.props.onMultisetTestsFiltered(null, true);
    }
    this.props.onHandleEnrichmentTableLoading(true);
    if (reloadPlot) {
      onDisablePlotEnrichment();
    }
    cancelRequestGetEnrichmentsIntersection();
    let cancelToken = new CancelToken((e) => {
      cancelRequestGetEnrichmentsIntersection = e;
    });
    omicNavigatorService
      .getEnrichmentsIntersection(
        enrichmentStudy,
        enrichmentModel,
        enrichmentAnnotation,
        mustEnrichment,
        notEnrichment,
        sigValue,
        this.jsonToList(selectedOperator),
        pValueType,
        this.handleErrorGetEnrichmentsIntersection,
        cancelToken,
      )
      .then((annotationData) => {
        const multisetResults = annotationData;
        this.setState({
          mustEnrichment,
          notEnrichment,
          numElements: multisetResults.length || 0,
          maxElements: this.state.maxElements || 0,
          // activateMultisetFilters: true,
        });
        onEnrichmentSearch(multisetResults, enrichmentAnnotation);
      })
      .catch((error) => {
        console.error('Error during getEnrichmentsIntersection', error);
      });
    const testsLength = typeof tests === 'string' ? 1 : tests.length;
    if (reloadPlot === true && testsLength > 1) {
      this.getMultisetPlot(
        sigValue,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation,
        this.jsonToList(selectedOperator),
        pValueType,
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
    enrichmentModel,
    enrichmentStudy,
    enrichmentAnnotation,
    selectedOperator,
    pValueType,
  ) {
    const { uData, multisetTestsFilteredOut } = this.props;
    const tests = uData.filter(function (col) {
      return !multisetTestsFilteredOut.includes(col);
    });
    if (tests?.length > 1) {
      cancelRequestGetEnrichmentsMultiset();
      let cancelToken = new CancelToken((e) => {
        cancelRequestGetEnrichmentsMultiset = e;
      });
      omicNavigatorService
        .getEnrichmentsMultiset(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          sigVal,
          selectedOperator,
          pValueType,
          tests,
          undefined,
          cancelToken,
        )
        .then((svgUrl) => {
          if (svgUrl) {
            let svgInfo = { plotType: 'Multiset', svg: svgUrl };
            this.props.onGetMultisetPlotEnrichment({
              svgInfo,
            });
          }
        })
        .catch((error) => {
          console.error('Error during getEnrichmentsMultiset', error);
        });
    }
  }

  handleMultisetFiltersVisibleEnrichment = () => {
    this.setState((prevState) => ({
      multisetFiltersVisibleEnrichment:
        !prevState.multisetFiltersVisibleEnrichment,
    }));
  };

  render() {
    const {
      enrichmentStudies,
      enrichmentStudyHref,
      enrichmentStudyHrefVisible,
      enrichmentModels,
      enrichmentAnnotations,
      enrichmentStudyReportTooltip,
      enrichmentModelTooltip,
      enrichmentAnnotationTooltip,
      enrichmentStudiesDisabled,
      enrichmentModelsDisabled,
      enrichmentAnnotationsDisabled,
      // activateMultisetFilters,
      multisetFiltersVisibleEnrichment,
      isSmallScreen,
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      isValidSearchEnrichment,
      multisetPlotAvailableEnrichment,
      plotButtonActiveEnrichment,
      isTestDataLoaded,
      isDataStreamingEnrichmentsTable,
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
    };

    let studyName = `${enrichmentStudy} Analysis Details`;
    const dynamicSize = getDynamicSize();
    let studyIcon = (
      <Popup
        trigger={
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={enrichmentStudyHrefVisible ? enrichmentStudyHref : null}
          >
            <Transition
              visible={!enrichmentStudyHrefVisible}
              animation={enrichmentStudyHrefVisible ? 'flash' : null}
              duration={1000}
            >
              <Icon
                name="info"
                size="large"
                className={
                  enrichmentStudyHrefVisible
                    ? 'StudyHtmlIcon'
                    : 'StudyHtmlIcon DisabledLink'
                }
                color={!enrichmentStudyHrefVisible ? 'grey' : null}
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
          enrichmentStudyHrefVisible ? studyName : enrichmentStudyReportTooltip
        }
        mouseEnterDelay={0}
        mouseLeaveDelay={0}
      />
    );

    let MultisetFiltersEnrichment;
    let MultisetFilterButtonEnrichment;
    if (isValidSearchEnrichment) {
      MultisetFiltersEnrichment = (
        <EnrichmentMultisetFilters
          {...this.props}
          {...this.state}
          onHandleOperatorChange={this.handleOperatorChange}
          onHandleSigValueEInputChange={this.handleSigValueEInputChange}
          onHandleSetChange={this.handleSetChange}
          onFilterOutChange={this.handleFilterOutChange}
          // onAddFilter={this.addFilter}
          // onRemoveFilter={this.removeFilter}
          onChangeHoveredFilter={this.changeHoveredFilter}
        />
      );
    }

    if (isValidSearchEnrichment && multisetFiltersVisibleEnrichment) {
      MultisetFilterButtonEnrichment = (
        // <Popup
        //   trigger={
        <Button
          // disabled={}
          icon
          labelPosition="left"
          id={
            this.state.isFilteredEnrichment
              ? 'MultisetFilterButtonLight'
              : 'MultisetFilterButtonDark'
          }
          className={this.state.isFilteredEnrichment ? 'disabled' : ''}
          size={dynamicSize}
          fluid
          onClick={this.updateQueryData}
        >
          {this.state.isFilteredEnrichment ? 'Filtered' : 'Filter'}
          <Icon name={this.state.isFilteredEnrichment ? 'check' : 'filter'} />
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

    if (isValidSearchEnrichment) {
      PlotRadio = (
        <div className={multisetFiltersVisibleEnrichment ? 'Show' : 'Hide'}>
          <Transition
            visible={!multisetPlotAvailableEnrichment}
            animation="flash"
            duration={1500}
          >
            <Radio
              toggle
              label="View Set Intersections"
              className={multisetPlotAvailableEnrichment ? 'ViewPlotRadio' : ''}
              checked={plotButtonActiveEnrichment}
              onChange={this.props.onHandlePlotAnimationEnrichment('uncover')}
              disabled={!multisetPlotAvailableEnrichment}
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
            position="top center"
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
                checked={multisetFiltersVisibleEnrichment}
                onChange={this.handleMultisetToggleEnrichment}
                disabled={isDataStreamingEnrichmentsTable}
                className={
                  isDataStreamingEnrichmentsTable ? 'CursorNotAllowed' : ''
                }
              />
            }
            style={StudyPopupStyle}
            className="CustomTooltip"
            position="right center"
            inverted
            basic
            content={
              isDataStreamingEnrichmentsTable
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
                name="enrichmentStudy"
                value={enrichmentStudy}
                options={enrichmentStudies}
                placeholder="Select A Study"
                onChange={this.handleStudyChange}
                disabled={enrichmentStudiesDisabled}
                width={13}
                label={{
                  children: 'Study',
                  htmlFor: 'form-select-control-estudy',
                }}
                search
                searchInput={{ id: 'form-select-control-estudy' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={enrichmentStudyReportTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <span className="StudyHtmlIconDivE">{studyIcon}</span>
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="enrichmentModel"
                value={enrichmentModel}
                options={enrichmentModels}
                placeholder="Select Model"
                onChange={this.handleModelChange}
                disabled={enrichmentModelsDisabled}
                label={{
                  children: 'Model',
                  htmlFor: 'form-select-control-emodel',
                }}
                search
                searchInput={{ id: 'form-select-control-emodel' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={enrichmentModelTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={enrichmentModelTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="enrichmentAnnotation"
                value={enrichmentAnnotation}
                options={enrichmentAnnotations}
                placeholder="Select Database"
                onChange={this.handleAnnotationChange}
                disabled={enrichmentAnnotationsDisabled}
                label={{
                  children: 'Database',
                  htmlFor: 'form-select-control-edatabase',
                }}
                search
                searchInput={{ id: 'form-select-control-edatabase' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={enrichmentAnnotationTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={enrichmentAnnotationTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <span className={!isTestDataLoaded ? 'ShowBlock' : 'Hide'}>
            <label
              className={
                enrichmentAnnotationsDisabled ? 'greyText' : 'normalText'
              }
            >
              P Values
            </label>
            <Button.Group className="PValueTypeContainer" size="small">
              <Button
                type="button"
                className="pValueButton"
                value="nominal"
                name="nominal"
                positive={pValueType === 'nominal'}
                onClick={this.handlePValueTypeChange}
                disabled={enrichmentAnnotationsDisabled}
              >
                Nominal
              </Button>
              <Button.Or className="OrCircle" />
              <Button
                type="button"
                className="pValueButton"
                value="adjusted"
                name="adjusted"
                positive={pValueType === 'adjusted'}
                onClick={this.handlePValueTypeChange}
                disabled={enrichmentAnnotationsDisabled}
              >
                Adjusted
              </Button>
            </Button.Group>
          </span>
        </Form>
        <div
          className={
            !isTestDataLoaded
              ? 'ShowBlock MultisetContainer'
              : 'Hide MultisetContainer'
          }
        >
          <div className="SliderDiv">
            <span className="MultisetRadio">{MultisetRadio}</span>
            <span className={isSmallScreen ? 'Block' : 'FloatRight'}>
              {PlotRadio}
            </span>
          </div>
          <div className="MultisetFilterButtonDiv">
            {MultisetFilterButtonEnrichment}
          </div>
          <div className="MultisetFiltersDiv">{MultisetFiltersEnrichment}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default EnrichmentSearch;
