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
import '../Shared/SearchCriteria.scss';
import { phosphoprotService } from '../../services/phosphoprot.service';
import EnrichmentMultisetFilters from './EnrichmentMultisetFilters';

let cancelGetEnrichmentsTable = () => {};
let cancelRequestMultisetEnrichmentData = () => {};
let cancelRequestEnrichmentMultisetPlot = () => {};

class EnrichmentSearchCriteria extends Component {
  state = {
    enrichmentStudies: [],
    enrichmentStudyHrefVisible: false,
    enrichmentStudyHref: '',
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
      must: [],
      not: [],
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
    },
    // activateMultisetFilters: false,
    reloadPlot: true,
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
      enrichmentDescriptionAndTest,
      onSearchCriteriaChange,
      onSearchTransitionEnrichment,
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
      this.setState({
        enrichmentStudyHrefVisible: true,
        enrichmentStudyHref: `http://www.localhost:3000/${enrichmentStudy}.html`,
      });

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

      if (enrichmentModel !== '') {
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
        if (enrichmentAnnotation !== '') {
          onSearchTransitionEnrichment(true);
          phosphoprotService
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
          onSearchCriteriaChange(
            {
              enrichmentStudy: enrichmentStudy,
              enrichmentModel: enrichmentModel,
              enrichmentAnnotation: enrichmentAnnotation,
              enrichmentDescriptionAndTest: enrichmentDescriptionAndTest,
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
    const { onSearchCriteriaChange, onSearchCriteriaReset } = this.props;
    onSearchCriteriaChange(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    onSearchCriteriaReset({
      isValidSearchEnrichment: false,
    });
    this.setState({
      enrichmentStudyHrefVisible: true,
      enrichmentStudyHref: `http://www.localhost:3000/${value}.html`,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true,
      enrichmentModelTooltip: '',
      enrichmentAnnotationTooltip: '',
    });
  };

  handleModelChange = (evt, { name, value }) => {
    const {
      enrichmentStudy,
      onSearchCriteriaChange,
      onSearchCriteriaReset,
      enrichmentModelsAndAnnotations,
    } = this.props;
    this.props.onHandlePlotTypesEnrichment(value);
    onSearchCriteriaChange(
      {
        enrichmentStudy: enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    onSearchCriteriaReset({
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
  };

  handleAnnotationChange = (evt, { name, value }) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      pValueType,
      onSearchTransitionEnrichment,
      onSearchCriteriaChange,
    } = this.props;
    const enrichmentAnnotationMeta = this.props.enrichmentAnnotationsMetadata.find(
      annotation => annotation.annotationID === value,
    );
    const enrichmentAnnotationTooltip =
      enrichmentAnnotationMeta?.annotationDisplay || '';
    this.props.onHandleMulisetFiltersVisible(false);
    this.setState({
      enrichmentAnnotationTooltip,
      reloadPlot: true,
    });
    onSearchCriteriaChange(
      {
        enrichmentStudy: enrichmentStudy,
        enrichmentModel: enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    onSearchTransitionEnrichment(true);
    cancelGetEnrichmentsTable();
    let cancelToken = new CancelToken(e => {
      cancelGetEnrichmentsTable = e;
    });
    phosphoprotService
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
          // PAUL - this needs to be handled true for column reordering, once grid props are fixed
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
        uSettings: {
          ...this.state.uSettings,
          must: [],
          not: [],
        },
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
      this.props.onColumns({
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
      multisetFiltersVisible,
    } = this.props;
    onSearchTransitionEnrichment(true);
    onPValueTypeChange(value);
    if (!multisetFiltersVisible) {
      cancelGetEnrichmentsTable();
      let cancelToken = new CancelToken(e => {
        cancelGetEnrichmentsTable = e;
      });
      phosphoprotService
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
      const { sigValue, selectedOperator } = this.state;
      const eMust = this.state.uSettings.must;
      const eNot = this.state.uSettings.not;
      console.log(value);
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
      phosphoprotService
        .getEnrichmentsIntersection(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          eMust,
          eNot,
          sigValue,
          this.jsonToList(selectedOperator),
          value,
          undefined,
          cancelToken,
        )
        .then(annotationData => {
          const multisetResults = annotationData;
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              numElements: multisetResults.length,
              maxElements: this.state.uSettings.maxElements,
              must: eMust,
              not: eNot,
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
    }
  };

  handleMultisetToggle = () => {
    return evt => {
      if (this.props.multisetFiltersVisible === false) {
        // on toggle open
        this.props.onHandleMulisetFiltersVisible(true);
        this.setState(
          {
            reloadPlot: true,
          },
          function() {
            this.updateQueryData();
          },
        );
      } else {
        // on toggle close
        this.props.onHandleMulisetFiltersVisible(false);
        this.setState({
          reloadPlot: false,
        });
        const enrichmentAnnotationName = 'enrichmentAnnotation';
        const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
        this.multisetTriggeredAnnotationChange(
          enrichmentAnnotationName,
          enrichmentAnnotationVar,
        );
      }
    };
  };

  handleMultisetEOpenError = () => {
    cancelRequestEnrichmentMultisetPlot();
    this.props.onHandleMulisetFiltersVisible(false);
    console.log('Error during getEnrichmentsIntersection');
  };

  handleMultisetECloseError = () => {
    this.props.onSearchTransitionEnrichment(false);
    this.props.onHandleMulisetFiltersVisible(true);
    this.setState(
      {
        reloadPlot: true,
      },
      this.updateQueryData(),
    );
    console.log('Error during getEnrichmentsTable');
  };

  multisetTriggeredAnnotationChange = (name, value) => {
    const {
      enrichmentStudy,
      enrichmentModel,
      pValueType,
      onSearchTransitionEnrichment,
      onSearchCriteriaChange,
    } = this.props;
    onSearchCriteriaChange(
      {
        enrichmentStudy: enrichmentStudy,
        enrichmentModel: enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    onSearchTransitionEnrichment(true);
    cancelGetEnrichmentsTable();
    let cancelToken = new CancelToken(e => {
      cancelGetEnrichmentsTable = e;
    });
    phosphoprotService
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
    this.props.onHandleNetworkOperator(value);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState(
      {
        [name]: uSelVP,
        reloadPlot: false,
      },
      function() {
        this.updateQueryData();
      },
    );
  };
  handleSigValueEInputChange = value => {
    this.props.onHandleNetworkSigValue(parseFloat(value));
    this.setState(
      {
        sigValue: [parseFloat(value)],
        reloadPlot: true,
      },
      function() {
        this.updateQueryData();
      },
    );
  };
  handleSetChange = ({ must, not }) => {
    this.props.onHandleNetworkTests(must, not);
    const uSettingsVP = this.state.uSettings;
    uSettingsVP.must = must;
    uSettingsVP.not = not;
    this.setState(
      {
        uSettings: uSettingsVP,
        reloadPlot: false,
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
      onDisablePlot,
      tests,
    } = this.props;
    const { selectedOperator, reloadPlot, sigValue } = this.state;
    if (reloadPlot) {
      onDisablePlot();
    }
    const eMust = this.state.uSettings.must;
    const eNot = this.state.uSettings.not;
    cancelRequestMultisetEnrichmentData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetEnrichmentData = e;
    });
    phosphoprotService
      .getEnrichmentsIntersection(
        enrichmentStudy,
        enrichmentModel,
        enrichmentAnnotation,
        eMust,
        eNot,
        sigValue,
        this.jsonToList(selectedOperator),
        pValueType,
        this.handleMultisetEOpenError,
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
        const multisetResults = annotationData;
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length,
            maxElements: this.state.uSettings.maxElements,
            must: eMust,
            not: eNot,
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
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    cancelRequestEnrichmentMultisetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestEnrichmentMultisetPlot = e;
    });
    phosphoprotService
      .getEnrichmentsUpset(
        enrichmentStudy,
        enrichmentModel,
        enrichmentAnnotation,
        sigVal,
        selectedOperator,
        this.props.pValueType,
        undefined,
        cancelToken,
      )
      .then(svgMarkupObj => {
        let svgMarkup = svgMarkupObj.data;
        // svgMarkup = svgMarkup.replace(
        //   /<svg/g,
        //   '<svg preserveAspectRatio="xMinYMid meet" id="multisetAnalysisSVG"'
        // );
        svgMarkup = svgMarkup.replace(
          /<svg/g,
          '<svg preserveAspectRatio="xMinYMid meet" style="width:' +
            widthCalculation() * 0.8 +
            'px; height:' +
            heightCalculation() * 0.8 +
            'px;" id="multisetAnalysisSVG"',
        );
        let svgInfo = { plotType: 'Multiset', svg: svgMarkup };
        this.props.onGetMultisetPlot({
          svgInfo,
        });
      })
      .catch(error => {
        console.error('Error during getEnrichmentsUpset', error);
      });
  }

  calculateHeight() {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0,
    );
    return h;
  }

  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    return w;
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
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      isValidSearchEnrichment,
      multisetPlotAvailable,
      plotButtonActive,
      isTestDataLoaded,
      multisetFiltersVisible,
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
          content="Select a study to view Analysis Details"
        />
      );
    }

    let EMultisetFilters;
    if (
      isValidSearchEnrichment &&
      // activateMultisetFilters &&
      multisetFiltersVisible
    ) {
      EMultisetFilters = (
        <EnrichmentMultisetFilters
          {...this.props}
          {...this.state}
          onHandleOperatorChange={this.handleOperatorChange}
          onHandleSigValueEInputChange={this.handleSigValueEInputChange}
          onHandleSetChange={this.handleSetChange}
          onAddFilter={this.addFilter}
          onRemoveFilter={this.removeFilter}
          onChangeHoveredFilter={this.changeHoveredFilter}
        />
      );
    }

    let PlotRadio;
    let MultisetRadio;

    if (isValidSearchEnrichment) {
      PlotRadio = (
        <Transition
          visible={!multisetPlotAvailable}
          animation="flash"
          duration={1500}
        >
          <Radio
            toggle
            label="View Plot"
            className={multisetPlotAvailable ? 'ViewPlotRadio' : ''}
            checked={plotButtonActive}
            onChange={this.props.onHandlePlotAnimation('uncover')}
            disabled={!multisetPlotAvailable}
          />
        </Transition>
      );
      MultisetRadio = (
        <React.Fragment>
          <Divider />
          <Radio
            toggle
            label="Set Analysis"
            checked={multisetFiltersVisible}
            onChange={this.handleMultisetToggle()}
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
              value="Nominal"
              name="Nominal"
              positive={pValueType === 'Nominal'}
              onClick={this.handlePValueTypeChange}
              disabled={enrichmentAnnotationsDisabled}
            >
              Nominal
            </Button>
            <Button.Or className="OrCircle" />
            <Button
              type="button"
              className="pValueButton"
              value="Adjusted"
              name="Adjusted"
              positive={pValueType === 'Adjusted'}
              onClick={this.handlePValueTypeChange}
              disabled={enrichmentAnnotationsDisabled}
            >
              Adjusted
            </Button>
          </Button.Group>
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
          <div className="MultisetFiltersDiv">{EMultisetFilters}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default EnrichmentSearchCriteria;
