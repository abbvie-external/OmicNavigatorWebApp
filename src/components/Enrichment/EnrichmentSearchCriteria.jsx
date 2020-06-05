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
import * as d3 from 'd3';
import { CancelToken } from 'axios';
import '../Shared/SearchCriteria.scss';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
// import { toast } from 'react-toastify';
import EnrichmentMultisetFilters from './EnrichmentMultisetFilters';

let cancelRequestAnnotationData = () => {};
let cancelRequestMultisetEnrichmentData = () => {};
let cancelRequestEnrichmentMultisetPlot = () => {};

class EnrichmentSearchCriteria extends Component {
  state = {
    enrichmentStudies: [],
    enrichmentStudyHrefVisible: false,
    enrichmentStudyHref: '',
    enrichmentModels: [],
    enrichmentAnnotations: [],
    enrichmentStudiesDisabled: false,
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
      numElements: undefined,
      maxElements: undefined,
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
    multisetFiltersVisible: false,
    activateMultisetFilters: false,
    enrichmentStudyMetadata: [],
    enrichmentModelsAndAnnotations: [],
  };

  componentDidMount() {}

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
    } = this.props;

    const studies = allStudiesMetadata.map(study => {
      const studyName = study.name[0];
      return { key: studyName, text: studyName, value: studyName };
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
      const enrichmentStudyData = allStudiesMetadataCopy.filter(
        study => study.name.toString() === enrichmentStudy,
      );
      debugger;
      const enrichmentModelsAndAnnotations = enrichmentStudyData[0].enrichments;
      this.setState({
        enrichmentStudyMetadata: enrichmentStudyData[0],
        enrichmentModelsAndAnnotations: enrichmentModelsAndAnnotations,
      });
      const enrichmentModelsMapped = enrichmentModelsAndAnnotations.map(
        enrichment => {
          return {
            key: enrichment.modelID[0],
            text: enrichment.modelDisplay[0],
            value: enrichment.modelID[0],
          };
        },
      );

      this.setState({
        enrichmentModelsDisabled: false,
        enrichmentModels: enrichmentModelsMapped,
      });

      if (enrichmentModel !== '') {
        debugger;
        const enrichmentModelWithAnnotations = enrichmentModelsAndAnnotations.filter(
          model => model.modelID.toString() === enrichmentModel,
        );
        const enrichmentAnnotations =
          enrichmentModelWithAnnotations[0].annotations || [];
        const enrichmentAnnotationsMapped = enrichmentAnnotations.map(
          annotation => {
            return {
              key: annotation.annotationID,
              text: annotation.annotationDisplay,
              value: annotation.annotationID,
            };
          },
        );
        const uDataP = enrichmentAnnotations.map(a => a.annotationID[0]);
        this.setState({
          enrichmentAnnotationsDisabled: false,
          enrichmentAnnotations: enrichmentAnnotationsMapped,
        });

        // if (a !== '') {
        //   this.props.onSearchCriteriaChange(
        //     {
        //       enrichmentStudy: s,
        //       enrichmentModel: m,
        //       enrichmentAnnotation: a,
        //       enrichmentDescriptionAndTest: d,
        //     },
        //     false,
        //   );
        //   this.props.onSearchTransitionEnrichment(true);
        //   phosphoprotService
        //     .getAnnotationData(
        //       m,
        //       a,
        //       s + 'plots',
        //       t,
        //       this.props.onSearchTransitionEnrichment,
        //     )
        //     .then(dataFromService => {
        //       this.setState({
        //         uSettings: {
        //           ...this.state.uSettings,
        //           maxElements: dataFromService.length,
        //         },
        //       });
        //       this.annotationdata = dataFromService;
        //       this.props.onEnrichmentSearch({
        //         enrichmentResults: this.annotationdata,
        //       });
        //     })
        //     .catch(error => {
        //       console.error('Error during getAnnotationData', error);
        //     });
        // }
      }
    }
  };

  handleStudyChange = (evt, { name, value }) => {
    this.props.onSearchCriteriaChange(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false,
    });
    this.setState({
      enrichmentStudyHrefVisible: true,
      enrichmentStudyHref: `http://www.localhost:3000/${value}.html`,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true,
    });
  };

  handleModelChange = (evt, { name, value }) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false,
    });
    const { enrichmentModelsAndAnnotations } = this.state;
    const enrichmentModelsAndAnnotationsCopy = [
      ...enrichmentModelsAndAnnotations,
    ];
    const enrichmentModelWithAnnotations = enrichmentModelsAndAnnotationsCopy.filter(
      model => model.modelID.toString() === value,
    );
    const enrichmentAnnotations =
      enrichmentModelWithAnnotations[0].annotations || [];
    const enrichmentAnnotationsMapped = enrichmentAnnotations.map(
      annotation => {
        return {
          key: annotation.annotationID,
          text: annotation.annotationDisplay,
          value: annotation.annotationID,
        };
      },
    );
    this.setState({
      enrichmentAnnotationsDisabled: false,
      enrichmentAnnotations: enrichmentAnnotationsMapped,
    });
  };

  handleAnnotationChange = (evt, { name, value }) => {
    this.setState({
      multisetFiltersVisible: false,
    });
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchTransitionEnrichment(true);
    cancelRequestAnnotationData();
    let cancelToken = new CancelToken(e => {
      cancelRequestAnnotationData = e;
    });
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType,
        this.props.onSearchTransitionEnrichment,
        cancelToken,
      )
      .then(dataFromService => {
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            must: [],
            not: [],
            maxElements: dataFromService.length,
          },
          sigValue: [0.05],
        });
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata,
        });
        this.props.onColumns({
          enrichmentResults: this.annotationdata,
        });
      })
      .catch(error => {
        console.error('Error during getAnnotationData', error);
      });
  };

  removeNetworkSVG = () => {
    d3.select('div.tooltip-pieSlice').remove();
    d3.select('tooltipEdge').remove();
    d3.select(`#svg-${this.props.networkSettings.id}`).remove();
  };

  handlePValueTypeChange = (evt, { value }) => {
    this.props.onSearchTransitionEnrichment(true);
    this.props.onPValueTypeChange(value);
    this.removeNetworkSVG();
    if (!this.state.multisetFiltersVisible) {
      cancelRequestAnnotationData();
      let cancelToken = new CancelToken(e => {
        cancelRequestAnnotationData = e;
      });
      phosphoprotService
        .getAnnotationData(
          this.props.enrichmentModel,
          this.props.enrichmentAnnotation,
          this.props.enrichmentStudy + 'plots',
          value,
          this.props.onSearchTransitionEnrichment,
          cancelToken,
        )
        .then(dataFromService => {
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              // must: [],
              // not: [],
              // defaultSigValue: 0.05,
              maxElements: dataFromService.length,
            },
            // sigValue: 0.05
          });
          this.annotationdata = dataFromService;
          this.props.onEnrichmentSearch({
            enrichmentResults: this.annotationdata,
          });
        })
        .catch(error => {
          console.error('Error during getAnnotationData', error);
        });
    } else {
      const eSigV = this.state.sigValue;
      const eMust = this.state.uSettings.must;
      const eNot = this.state.uSettings.not;
      const eOperator = this.state.selectedOperator;
      console.log(value);
      this.getMultisetPlot(
        eSigV,
        this.props.enrichmentModel,
        this.props.enrichmentStudy + 'plots',
        this.props.enrichmentAnnotation,
        this.jsonToList(eOperator),
        value,
      );
      cancelRequestMultisetEnrichmentData();
      let cancelToken = new CancelToken(e => {
        cancelRequestMultisetEnrichmentData = e;
      });
      phosphoprotService
        .getMultisetEnrichmentData(
          this.props.enrichmentModel,
          eMust,
          eNot,
          this.props.enrichmentStudy + 'plots',
          eSigV,
          this.props.enrichmentAnnotation,
          this.jsonToList(eOperator),
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
            activateMultisetFilters: true,
          });
          this.props.onEnrichmentSearch({
            enrichmentResults: multisetResults,
          });
        })
        .catch(error => {
          console.error('Error during getMultisetEnrichmentData', error);
        });
    }
  };

  handleMultisetToggle = () => {
    return evt => {
      if (this.state.multisetFiltersVisible === false) {
        this.setState({
          multisetFiltersVisible: true,
        });
        this.updateQueryData({
          must: this.state.uSettings.must,
          not: this.state.uSettings.not,
          sigValue: this.state.sigValue,
          selectedCol: this.state.selectedCol,
          selectedOperator: this.state.selectedOperator,
        });
      } else {
        this.setState({
          multisetFiltersVisible: false,
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
    this.setState({
      multisetFiltersVisible: false,
    });
    console.log('Error during getMultisetEnrichmentData');
  };

  handleMultisetECloseError = () => {
    this.props.onSearchTransitionEnrichment(false);
    this.setState(
      {
        multisetFiltersVisible: true,
        reloadPlot: true,
      },
      this.updateQueryData(),
    );
    console.log('Error during getAnnotationData');
  };

  multisetTriggeredAnnotationChange = (name, value) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchTransitionEnrichment(true);
    cancelRequestAnnotationData();
    let cancelToken = new CancelToken(e => {
      cancelRequestAnnotationData = e;
    });
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType,
        this.handleMultisetECloseError,
        cancelToken,
      )
      .then(dataFromService => {
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata,
        });
      })
      .catch(error => {
        console.error('Error during getAnnotationData', error);
      });
  };
  addFilter = () => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.indexFilters = [...this.state.uSettings.indexFilters].concat(
      this.state.uSettings.indexFilters.length,
    );

    this.setState({
      selectedCol: [...this.state.selectedCol].concat(
        this.state.uSettings.defaultSelectedCol,
      ),
      selectedOperator: [...this.state.selectedOperator].concat(
        this.state.uSettings.defaultSelectedOperator,
      ),
      sigValue: [...this.state.sigValue].concat(
        this.state.uSettings.defaultSigValue,
      ),
      uSettings: uSetVP,
    });
  };
  removeFilter = index => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.indexFilters = [...uSetVP.indexFilters]
      .slice(0, index)
      .concat([...uSetVP.indexFilters].slice(index + 1));
    for (var i = index; i < uSetVP.indexFilters.length; i++) {
      uSetVP.indexFilters[i]--;
    }
    this.setState({
      selectedCol: [...this.state.selectedCol]
        .slice(0, index)
        .concat([...this.state.selectedCol].slice(index + 1)),
      selectedOperator: [...this.state.selectedOperator]
        .slice(0, index)
        .concat([...this.state.selectedOperator].slice(index + 1)),
      sigValue: [...this.state.sigValue]
        .slice(0, index)
        .concat([...this.state.sigValue].slice(index + 1)),
      uSettings: uSetVP,
    });
  };
  changeHoveredFilter = index => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettings: uSetVP });
  };
  handleDropdownChange = (evt, { name, value, index }) => {
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
    this.props.onDisablePlot();
    const eSigV = this.state.sigValue;
    const eMust = this.state.uSettings.must;
    const eNot = this.state.uSettings.not;
    const eOperator = this.state.selectedOperator;
    this.getMultisetPlot(
      eSigV,
      this.props.enrichmentModel,
      this.props.enrichmentStudy + 'plots',
      this.props.enrichmentAnnotation,
      this.jsonToList(eOperator),
      this.props.pValueType,
    );
    cancelRequestMultisetEnrichmentData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetEnrichmentData = e;
    });
    phosphoprotService
      .getMultisetEnrichmentData(
        this.props.enrichmentModel,
        eMust,
        eNot,
        this.props.enrichmentStudy + 'plots',
        eSigV,
        this.props.enrichmentAnnotation,
        this.jsonToList(eOperator),
        this.props.pValueType,
        this.handleMultisetEOpenError,
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
          activateMultisetFilters: true,
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: multisetResults,
        });
      })
      .catch(error => {
        console.error('Error during getMultisetEnrichmentData', error);
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
    eOperator,
  ) {
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    cancelRequestEnrichmentMultisetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestEnrichmentMultisetPlot = e;
    });
    phosphoprotService
      .getEnrichmentMultisetPlot(
        sigVal,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation,
        eOperator,
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
        console.error('Error during getEnrichmentMultisetPlot', error);
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
      enrichmentStudiesDisabled,
      enrichmentModelsDisabled,
      enrichmentAnnotationsDisabled,
      multisetFiltersVisible,
      activateMultisetFilters,
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
      activeIndexEnrichmentView,
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
      activateMultisetFilters &&
      multisetFiltersVisible &&
      activeIndexEnrichmentView === 0
    ) {
      EMultisetFilters = (
        <EnrichmentMultisetFilters
          {...this.props}
          {...this.state}
          onHandleDropdownChange={this.handleDropdownChange}
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

    if (isValidSearchEnrichment && activeIndexEnrichmentView === 0) {
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
