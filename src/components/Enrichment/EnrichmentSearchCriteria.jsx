import React, { Component } from 'react';
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
import { CancelToken } from 'axios';
import DOMPurify from 'dompurify';
import '../Shared/SearchCriteria.scss';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import EnrichmentMultisetFilters from './EnrichmentMultisetFilters';

let cancelRequestGetReportLinkEnrichment = () => {};
let cancelGetEnrichmentsTable = () => {};
let cancelRequestMultisetEnrichmentData = () => {};
let cancelRequestEnrichmentMultisetPlot = () => {};

class EnrichmentSearchCriteria extends Component {
  state = {
    enrichmentStudies: [],
    enrichmentStudyHrefVisible: false,
    enrichmentStudyHref: '',
    enrichmentStudyReportTooltip:
      'Select a study and model to view Analysis Details',
    enrichmentModels: [],
    enrichmentAnnotations: [],
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
      numElements: 0,
      maxElements: 0,
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
    filteredTriggeredEnrichment: false,
    multisetFiltersVisibleEnrichment: false,
  };

  componentDidMount() {
    this.setState({
      enrichmentStudiesDisabled: false,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.allStudiesMetadata !== prevProps.allStudiesMetadata ||
      this.props.enrichmentStudy !== prevProps.enrichmentStudy
    ) {
      this.populateDropdowns();
    }
  }

  populateDropdowns = () => {
    const {
      allStudiesMetadata,
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      enrichmentTestAndDescription,
      onSearchCriteriaChangeEnrichment,
      onSearchTransitionEnrichment,
      onGetEnrichmentsLinkouts,
    } = this.props;

    const studies = allStudiesMetadata.map(study => {
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
        study => study.name === enrichmentStudy,
      );
      const enrichmentModelsAndAnnotationsVar =
        enrichmentStudyData?.enrichments || [];
      this.props.onSetStudyModelAnnotationMetadata(
        enrichmentStudyData,
        enrichmentModelsAndAnnotationsVar,
      );
      const enrichmentModelsMapped = enrichmentModelsAndAnnotationsVar.map(
        enrichment => {
          return {
            key: `${enrichment.modelID}Enrichment`,
            text: enrichment.modelID,
            value: enrichment.modelID,
          };
        },
      );
      this.setState({
        enrichmentModelsDisabled: false,
        enrichmentModels: enrichmentModelsMapped,
      });
      this.getReportLink(enrichmentStudy, 'default');
      if (enrichmentModel !== '') {
        this.props.onHandleHasBarcodeData();
        this.props.onHandlePlotTypesEnrichment(enrichmentModel);
        const enrichmentModelWithAnnotations = enrichmentModelsAndAnnotationsVar.find(
          model => model.modelID === enrichmentModel,
        );
        const enrichmentModelTooltip =
          enrichmentModelWithAnnotations?.modelDisplay || '';
        this.setState({
          enrichmentModelTooltip: enrichmentModelTooltip,
        });
        const enrichmentAnnotationsMetadataVar =
          enrichmentModelWithAnnotations?.annotations || [];
        const enrichmentAnnotationsMapped = enrichmentAnnotationsMetadataVar.map(
          annotation => {
            return {
              key: `${annotation.annotationID}Enrichment`,
              text: annotation.annotationID,
              value: annotation.annotationID,
            };
          },
        );
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
          omicNavigatorService
            .getEnrichmentsTable(
              enrichmentStudy,
              enrichmentModel,
              enrichmentAnnotation,
              pValueType,
              onSearchTransitionEnrichment,
            )
            .then(getEnrichmentsTableData => {
              this.handleGetEnrichmentsTableData(
                getEnrichmentsTableData,
                false,
                true,
                false,
              );
            })
            .catch(error => {
              console.error('Error during getEnrichmentsTable', error);
            });
          onSearchCriteriaChangeEnrichment(
            {
              enrichmentStudy: enrichmentStudy,
              enrichmentModel: enrichmentModel,
              enrichmentAnnotation: enrichmentAnnotation,
              enrichmentTestAndDescription: enrichmentTestAndDescription,
            },
            false,
          );
          const enrichmentAnnotationMeta = enrichmentAnnotationsMetadataVar.find(
            annotation => annotation.annotationID === enrichmentAnnotation,
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

  handleStudyChange = (evt, { name, value }) => {
    const {
      onSearchCriteriaChangeEnrichment,
      onSearchCriteriaResetEnrichment,
    } = this.props;
    onSearchCriteriaChangeEnrichment(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentTestAndDescription: '',
      },
      true,
    );
    onSearchCriteriaResetEnrichment({
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
        enrichmentStudyReportTooltip: `The model "main" from the study ${this.props.enrichmentStudy} does not have additional analysis details available.`,
      });
    }
  };

  getReportLink = (study, model) => {
    cancelRequestGetReportLinkEnrichment();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetReportLinkEnrichment = e;
    });
    omicNavigatorService
      .getReportLink(study, model, this.setStudyTooltip, cancelToken)
      .then(getReportLinkResponse => {
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
      .catch(error => {
        console.error('Error during getReportLink', error);
      });
  };

  handleModelChange = (evt, { name, value }) => {
    const {
      enrichmentStudy,
      onSearchCriteriaChangeEnrichment,
      onSearchCriteriaResetEnrichment,
      enrichmentModelsAndAnnotations,
    } = this.props;
    this.props.onHandleHasBarcodeData();
    this.props.onHandlePlotTypesEnrichment(value);
    onSearchCriteriaChangeEnrichment(
      {
        enrichmentStudy: enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: '',
        enrichmentTestAndDescription: '',
      },
      true,
    );
    onSearchCriteriaResetEnrichment({
      isValidSearchEnrichment: false,
    });
    const enrichmentModelsAndAnnotationsCopy = [
      ...enrichmentModelsAndAnnotations,
    ];
    const enrichmentModelWithAnnotations = enrichmentModelsAndAnnotationsCopy.find(
      model => model.modelID === value,
    );
    const enrichmentModelTooltip =
      enrichmentModelWithAnnotations?.modelDisplay || '';
    const enrichmentAnnotationsMetadataVar =
      enrichmentModelWithAnnotations.annotations || [];
    const enrichmentAnnotationsMapped = enrichmentAnnotationsMetadataVar.map(
      annotation => {
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
      onSearchCriteriaChangeEnrichment,
    } = this.props;
    onSearchTransitionEnrichment(true);
    onMultisetQueriedEnrichment(false);
    const enrichmentAnnotationMeta = this.props.enrichmentAnnotationsMetadata.find(
      annotation => annotation.annotationID === value,
    );
    const enrichmentAnnotationTooltip =
      enrichmentAnnotationMeta?.annotationDisplay || '';
    this.props.onAnnotationChange();
    this.setState({
      enrichmentAnnotationTooltip,
      reloadPlot: true,
      multisetFiltersVisibleEnrichment: false,
    });
    onSearchCriteriaChangeEnrichment(
      {
        enrichmentStudy: enrichmentStudy,
        enrichmentModel: enrichmentModel,
        [name]: value,
        enrichmentTestAndDescription: '',
      },
      true,
    );
    cancelGetEnrichmentsTable();
    let cancelToken = new CancelToken(e => {
      cancelGetEnrichmentsTable = e;
    });
    omicNavigatorService
      .getEnrichmentsTable(
        enrichmentStudy,
        enrichmentModel,
        value,
        pValueType,
        onSearchTransitionEnrichment,
        cancelToken,
      )
      .then(getEnrichmentsTableData => {
        this.handleGetEnrichmentsTableData(
          getEnrichmentsTableData,
          true,
          true,
          // PAUL - this needs to be handled true for column reordering, once we can freeze the first column (featureID) from being reordered
          false,
        );
      })
      .catch(error => {
        console.error('Error during getEnrichmentsTable', error);
      });
  };

  handleGetEnrichmentsTableData = (
    data,
    handleUSettings,
    handleMaxElements,
    handleColumns,
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
        uSettings: {
          ...this.state.uSettings,
          maxElements: data.length,
        },
      });
    }
    if (handleColumns) {
      this.props.onColumnReorder({
        enrichmentResults: this.annotationdata,
      });
    }
    this.props.onEnrichmentSearch({
      enrichmentResults: data,
    });
  };

  handlePValueTypeChange = (evt, { value }) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      onSearchTransitionEnrichment,
      onEnrichmentSearch,
      onPValueTypeChange,
      onHandleEnrichmentTableLoading,
      multisetFiltersVisibleEnrichment,
    } = this.props;
    onHandleEnrichmentTableLoading(true);
    onPValueTypeChange(value);
    if (!multisetFiltersVisibleEnrichment) {
      cancelGetEnrichmentsTable();
      let cancelToken = new CancelToken(e => {
        cancelGetEnrichmentsTable = e;
      });
      omicNavigatorService
        .getEnrichmentsTable(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          value,
          onSearchTransitionEnrichment,
          cancelToken,
        )
        .then(getEnrichmentsTableData => {
          this.handleGetEnrichmentsTableData(
            getEnrichmentsTableData,
            false,
            true,
            false,
          );
        })
        .catch(error => {
          console.error('Error during getEnrichmentsTable', error);
        });
    } else {
      const {
        sigValue,
        selectedOperator,
        mustEnrichment,
        notEnrichment,
      } = this.state;
      this.getMultisetPlot(
        sigValue,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation,
        this.jsonToList(selectedOperator),
        value,
      );
      cancelRequestMultisetEnrichmentData();
      let cancelToken = new CancelToken(e => {
        cancelRequestMultisetEnrichmentData = e;
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
        .then(annotationData => {
          const multisetResults = annotationData;
          this.setState({
            mustEnrichment,
            notEnrichment,
            uSettings: {
              ...this.state.uSettings,
              numElements: multisetResults.length,
              maxElements: this.state.uSettings.maxElements,
            },
          });
          onEnrichmentSearch({
            enrichmentResults: multisetResults,
          });
        })
        .catch(error => {
          console.error('Error during getEnrichmentsIntersection', error);
        });
    }
  };

  handleMultisetToggleEnrichment = () => {
    if (this.state.multisetFiltersVisibleEnrichment === false) {
      // on toggle open
      this.setState({
        reloadPlot: true,
        multisetFiltersVisibleEnrichment: true,
      });
    } else {
      // on toggle close
      // this.props.onHandleNetworkTests([], []);
      this.props.onMultisetQueriedEnrichment(false);
      this.setState({
        reloadPlot: false,
        multisetFiltersVisibleEnrichment: false,
        filteredTriggeredEnrichment: false,
      });
      const enrichmentAnnotationName = 'enrichmentAnnotation';
      const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
      this.multisetTriggeredAnnotationChange(
        enrichmentAnnotationName,
        enrichmentAnnotationVar,
      );
    }
  };

  handleMultisetOpenErrorEnrichment = () => {
    cancelRequestEnrichmentMultisetPlot();
    this.props.onMultisetQueriedEnrichment(false);
    console.log('Error during getEnrichmentsIntersection');
  };

  handleMultisetECloseError = () => {
    this.props.onSearchTransitionEnrichment(false);
    this.props.onMultisetQueriedEnrichment(true);
    this.setState({
      reloadPlot: true,
    });
    console.log('Error during getEnrichmentsTable');
  };

  multisetTriggeredAnnotationChange = (name, value) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      pValueType,
      // onSearchTransitionEnrichment,
      onSearchCriteriaChangeEnrichment,
    } = this.props;
    this.setState({
      multisetFiltersVisibleEnrichment: false,
    });
    onSearchCriteriaChangeEnrichment(
      {
        enrichmentStudy: enrichmentStudy,
        enrichmentModel: enrichmentModel,
        [name]: value,
        enrichmentTestAndDescription: '',
      },
      true,
    );
    // onSearchTransitionEnrichment(true);
    cancelGetEnrichmentsTable();
    let cancelToken = new CancelToken(e => {
      cancelGetEnrichmentsTable = e;
    });
    omicNavigatorService
      .getEnrichmentsTable(
        enrichmentStudy,
        enrichmentModel,
        value,
        pValueType,
        this.handleMultisetECloseError,
        cancelToken,
      )
      .then(getEnrichmentsTableData => {
        this.handleGetEnrichmentsTableData(
          getEnrichmentsTableData,
          false,
          false,
          false,
        );
      })
      .catch(error => {
        console.error('Error during getEnrichmentsTable', error);
      });
  };

  changeHoveredFilter = index => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettings: uSetVP });
  };

  handleOperatorChange = (evt, { name, value, index }) => {
    this.setState({
      filteredTriggeredEnrichment: false,
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
      reloadPlot: false,
    });
  };

  handleSigValueEInputChange = value => {
    this.setState({
      sigValue: [parseFloat(value)],
      reloadPlot: true,
      filteredTriggeredEnrichment: false,
    });
    this.props.onHandleNetworkSigValue(parseFloat(value));
  };

  handleSetChange = (mustEnrichment, notEnrichment) => {
    this.setState({
      mustEnrichment,
      notEnrichment,
      filteredTriggeredEnrichment: false,
      // reloadPlot: false,
    });
    this.props.onHandleNetworkTests(mustEnrichment, notEnrichment);
  };

  handleFilterOutChange = test => {
    const { mustEnrichment, notEnrichment } = this.state;
    this.props.onHandleNetworkGraphReady(false);
    this.props.onHandleEnrichmentTableLoading(true);
    this.props.onMultisetTestsFiltered(test);
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
      },
      function() {
        this.updateQueryData();
      },
    );
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
    } = this.state;
    this.setState({
      filteredTriggeredEnrichment: true,
    });
    this.props.onHandleEnrichmentTableLoading(true);
    if (reloadPlot) {
      onDisablePlotEnrichment();
    }
    cancelRequestMultisetEnrichmentData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetEnrichmentData = e;
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
        this.handleMultisetOpenErrorEnrichment,
        cancelToken,
      )
      .then(annotationData => {
        // let countAlphanumericFields = [];
        // const firstObject = annotationData[0];
        // const totalLength = Object.keys(firstObject).length;
        // for (let [key, value] of Object.entries(firstObject)) {
        //   if (typeof value === 'string' || value instanceof String) {
        //     countAlphanumericFields.push(key);
        //   }
        // }
        // const alphanumericLength = countAlphanumericFields.length;
        // const annotationTestsLength = totalLength - alphanumericLength;
        // if (reloadPlot === true && annotationTestsLength > 1) {
        const multisetResults = annotationData;
        this.setState({
          mustEnrichment,
          notEnrichment,
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length || 0,
            maxElements: this.state.uSettings.maxElements || 0,
          },
          // activateMultisetFilters: true,
        });
        onEnrichmentSearch({
          enrichmentResults: multisetResults,
        });
      })
      .catch(error => {
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
  ) {
    const { uData, multisetTestsFilteredOut } = this.props;
    const tests = uData.filter(function(col) {
      return !multisetTestsFilteredOut.includes(col);
    });
    if (tests?.length > 1) {
      cancelRequestEnrichmentMultisetPlot();
      let cancelToken = new CancelToken(e => {
        cancelRequestEnrichmentMultisetPlot = e;
      });
      omicNavigatorService
        .getEnrichmentsUpset(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          sigVal,
          selectedOperator,
          this.props.pValueType,
          tests,
          undefined,
          cancelToken,
        )
        .then(svgMarkupObj => {
          let svgMarkup = svgMarkupObj.data;
          svgMarkup = svgMarkup.replace(
            /<svg/g,
            '<svg preserveAspectRatio="xMinYMid meet" id="enrichmentMultisetAnalysisSVG"',
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
          this.props.onGetMultisetPlotEnrichment({
            svgInfo,
          });
        })
        .catch(error => {
          console.error('Error during getEnrichmentsUpset', error);
        });
    }
  }

  handleMultisetFiltersVisibleEnrichment = () => {
    this.setState(prevState => ({
      multisetFiltersVisibleEnrichment: !prevState.multisetFiltersVisibleEnrichment,
    }));
  };

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
      enrichmentStudies,
      enrichmentStudyHref,
      enrichmentStudyHrefVisible,
      enrichmentModels,
      enrichmentAnnotations,
      enrichmentModelTooltip,
      enrichmentAnnotationTooltip,
      enrichmentStudiesDisabled,
      enrichmentModelsDisabled,
      enrichmentAnnotationsDisabled,
      // activateMultisetFilters,
      multisetFiltersVisibleEnrichment,
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
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
    };

    let studyIcon;
    let studyName = `${enrichmentStudy} Analysis Details`;
    const dynamicSize = this.getDynamicSize();

    if (enrichmentStudyHrefVisible) {
      studyIcon = (
        <Popup
          trigger={
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={enrichmentStudyHref}
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
          inverted
          basic
          position="bottom center"
          content={studyName}
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
          position="bottom center"
          content={this.state.enrichmentStudyReportTooltip}
        />
      );
    }

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
            this.state.filteredTriggeredEnrichment
              ? 'MultisetFilterButtonLight'
              : 'MultisetFilterButtonDark'
          }
          className={this.state.filteredTriggeredEnrichment ? 'disabled' : ''}
          size={dynamicSize}
          fluid
          onClick={this.updateQueryData}
        >
          {this.state.filteredTriggeredEnrichment ? 'Filtered' : 'Filter'}
          <Icon
            name={this.state.filteredTriggeredEnrichment ? 'check' : 'filter'}
          />
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
        <Transition
          visible={!multisetPlotAvailableEnrichment}
          animation="flash"
          duration={1500}
        >
          <Radio
            toggle
            label="View Plot"
            className={multisetPlotAvailableEnrichment ? 'ViewPlotRadio' : ''}
            checked={plotButtonActiveEnrichment}
            onChange={this.props.onHandlePlotAnimationEnrichment('uncover')}
            disabled={!multisetPlotAvailableEnrichment}
          />
        </Transition>
      );

      MultisetRadio = (
        <React.Fragment>
          <Divider />
          <Radio
            toggle
            label="Set Analysis"
            checked={multisetFiltersVisibleEnrichment}
            onChange={this.handleMultisetToggleEnrichment}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Form className="SearchCriteriaContainer">
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
            <span className="PlotRadio">{PlotRadio}</span>
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

export default EnrichmentSearchCriteria;
