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
  Button
} from 'semantic-ui-react';
import '../Shared/SearchCriteria.scss';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
// import { toast } from 'react-toastify';
import EnrichmentMultisetFilters from './EnrichmentMultisetFilters';

class EnrichmentSearchCriteria extends Component {
  static defaultProps = {
    tab: 'enrichment',
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    pValueType: 'nomimal',
    isValidSearchEnrichment: false,
    isSearching: false,
    multisetPlotAvailable: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActive: false,
    uData: []
  };

  state = {
    enrichmentStudies: [],
    enrichmentStudyHrefVisible: false,
    enrichmentStudyHref: '',
    enrichmentModels: [],
    enrichmentAnnotations: [],
    enrichmentResultsErrorCb: this.props.onSearchTransition || undefined,
    enrichmentStudiesDisabled: false,
    enrichmentModelsDisabled: true,
    enrichmentAnnotationsDisabled: true,
    uAnchor: '',
    selectedCol: {
      key: 'adj_P_Val',
      text: 'Adjusted P Value',
      value: 'adj_P_Val'
    },
    selectedOperator: {
      key: '<',
      text: '<',
      value: '<'
    },
    sigValue: 0.05,
    uSettings: {
      defaultSelectedCol: {
        key: 'adj_P_Val',
        text: 'Adjusted P Value',
        value: 'adj_P_Val'
      },
      defaultSelectedOperator: {
        key: '<',
        text: '<',
        value: '<'
      },
      defaultSigValue: 0.05,
      useAnchor: false,
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
          text: 'Adjusted P Value',
          value: 'adj_P_Val'
        }
      ],
      thresholdOperator: [
        {
          key: '<',
          text: '<',
          value: '<'
        },
        {
          key: '>',
          text: '>',
          value: '>'
        },
        {
          key: '|<|',
          text: '|<|',
          value: '|<|'
        },
        {
          key: '|>|',
          text: '|>|',
          value: '|>|'
        }
      ]
    },
    multisetFiltersVisible: false,
    activateMultisetFilters: false
  };

  componentDidMount() {
    const s = this.props.enrichmentStudy || '';
    const m = this.props.enrichmentModel || '';
    const a = this.props.enrichmentAnnotation || '';
    const t = this.props.pValueType || 'nominal';
    const d = this.props.enrichmentDescriptionAndTest || '';

    if (s !== '') {
      this.setState({
        enrichmentStudyHrefVisible: true,
        enrichmentStudyHref: `http://www.localhost:3000/${s}.html`
      });
      phosphoprotService
        .getModelNames('EnrichmentNames', s + 'plots')
        .then(modelsFromService => {
          this.allNames = modelsFromService;
          const modelsArr = _.map(_.keys(modelsFromService), function(
            modelName
          ) {
            return { key: modelName, text: modelName, value: modelName };
          });
          this.setState({
            enrichmentModelsDisabled: false,
            enrichmentModels: modelsArr
          });
          if (m !== '') {
            const annotationsArr = _.map(this.allNames[m], function(
              annotationName
            ) {
              return {
                key: annotationName,
                text: annotationName,
                value: annotationName
              };
            });
            this.setState({
              enrichmentAnnotationsDisabled: false,
              enrichmentAnnotations: annotationsArr
            });
          }
        });
    }

    if (a !== '') {
      this.props.onSearchCriteriaChange(
        {
          enrichmentStudy: s,
          enrichmentModel: m,
          enrichmentAnnotation: a,
          enrichmentDescriptionAndTest: d
        },
        false
      );
      this.props.onSearchTransition(true);
      phosphoprotService
        .getAnnotationData(
          m,
          a,
          s + 'plots',
          t,
          this.state.enrichmentResultsErrorCb
        )
        .then(dataFromService => {
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              maxElements: dataFromService.length
            }
          });
          this.annotationdata = dataFromService;
          this.props.onEnrichmentSearch({
            enrichmentResults: this.annotationdata
          });
        });
    }

    this.populateStudies();
  }

  populateStudies = () => {
    phosphoprotService.getStudies().then(studiesFromService => {
      const studiesArr = studiesFromService.map(study => {
        return { key: study, text: study, value: study };
      });
      this.setState({
        enrichmentStudies: studiesArr
      });
    });
  };

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      enrichmentStudyHrefVisible: true,
      enrichmentStudyHref: `http://www.localhost:3000/${value}.html`,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true
    });
    this.props.onSearchCriteriaChange(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: ''
      },
      true
    );
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false
    });
    phosphoprotService
      .getModelNames('EnrichmentNames', value + 'plots')
      .then(modelsFromService => {
        this.allNames = modelsFromService;
        const modelsArr = _.map(_.keys(modelsFromService), function(modelName) {
          return { key: modelName, text: modelName, value: modelName };
        });
        this.setState({
          enrichmentModelsDisabled: false,
          enrichmentModels: modelsArr
        });
      });
  };

  handleModelChange = (evt, { name, value }) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: ''
      },
      true
    );
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false
    });
    const annotationsArr = _.map(this.allNames[value], function(
      annotationName
    ) {
      return {
        key: annotationName,
        text: annotationName,
        value: annotationName
      };
    });
    this.setState({
      enrichmentAnnotationsDisabled: false,
      enrichmentAnnotations: annotationsArr
    });
  };

  handleAnnotationChange = (evt, { name, value }) => {
    this.setState({
      multisetFiltersVisible: false
    });
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: ''
      },
      true
    );
    this.props.onSearchTransition(true);
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType,
        this.state.enrichmentResultsErrorCb
      )
      .then(dataFromService => {
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            must: [],
            not: [],
            defaultSigValue: 0.05,
            maxElements: dataFromService.length
          },
          sigValue: 0.05
        });
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  handlePValueTypeChange = (evt, { value }) => {
    this.props.onSearchTransition(true);
    this.props.onPValueTypeChange(value);

    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        this.props.enrichmentAnnotation,
        this.props.enrichmentStudy + 'plots',
        value,
        this.state.enrichmentResultsErrorCb
      )
      .then(dataFromService => {
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            // must: [],
            // not: [],
            // defaultSigValue: 0.05,
            maxElements: dataFromService.length
          }
          // sigValue: 0.05
        });
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });

    //     if (this.state.activateMultisetFilters) {
    // call getMultisetEnrichmentData include nominal vs adjusted
  };

  handleMultisetToggle = () => {
    return evt => {
      if (this.state.multisetFiltersVisible === false) {
        this.setState({
          multisetFiltersVisible: true
        });
        this.updateQueryData({
          must: this.state.uSettings.must,
          not: this.state.uSettings.not,
          sigValue: this.state.sigValue,
          selectedCol: this.state.selectedCol,
          selectedOperator: this.state.selectedOperator
        });
      } else {
        this.setState({
          multisetFiltersVisible: false
        });
        const enrichmentAnnotationName = 'enrichmentAnnotation';
        const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
        this.multisetTriggeredAnnotationChange(
          enrichmentAnnotationName,
          enrichmentAnnotationVar
        );
      }
    };
  };

  multisetTriggeredAnnotationChange = (name, value) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: ''
      },
      true
    );
    this.props.onSearchTransition(true);
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType,
        this.state.enrichmentResultsErrorCb
      )
      .then(dataFromService => {
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  updateQueryData = evt => {
    this.props.onDisablePlot();
    const eSigV = evt.sigValue || this.state.sigValue;
    const eMust = evt.must || this.state.uSettings.must;
    const eNot = evt.not || this.state.uSettings.not;
    const eOperator = evt.selectedOperator || this.state.selectedOperator;
    const eCol = evt.selectedCol || this.state.selectedCol;
    let mustString = this.testToString(eMust);
    let notString = this.testToString(eNot);
    this.setState({
      sigValue: eSigV,
      selectedOperator: eOperator,
      selectedCol: eCol
    });
    this.getMultisetPlot(
      eSigV,
      this.props.enrichmentModel,
      this.props.enrichmentStudy + 'plots',
      this.props.enrichmentAnnotation,
      eOperator
    );
    phosphoprotService
      .getMultisetEnrichmentData(
        this.props.enrichmentModel,
        mustString,
        notString,
        this.props.enrichmentStudy + 'plots',
        eSigV,
        this.props.enrichmentAnnotation,
        eOperator.value
      )
      .then(annotationData => {
        const multisetResults = annotationData;
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length,
            maxElements: this.state.uSettings.maxElements,
            must: eMust,
            not: eNot
          },
          activateMultisetFilters: true
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: multisetResults
        });
      });
  };

  testToString(solution) {
    var str = '';
    if (solution !== undefined) {
      if (solution.length === 0) {
        return str;
      }
      for (var i = 0; i < solution.length; i++) {
        if (i === solution.length - 1) {
          str += solution[i] + '';
        } else {
          str += solution[i] + ';';
        }
      }
      return str;
    } else return str;
  }

  getMultisetPlot(
    sigVal,
    enrichmentModel,
    enrichmentStudy,
    enrichmentAnnotation,
    eOperator
  ) {
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    phosphoprotService
      .getEnrichmentMultisetPlot(
        sigVal,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation,
        eOperator.value
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
            'px;" id="multisetAnalysisSVG"'
        );
        let svgInfo = { plotType: 'Multiset', svg: svgMarkup };
        this.props.onGetMultisetPlot({
          svgInfo
        });
      });
  }

  calculateHeight() {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    return h;
  }

  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
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
      activateMultisetFilters
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      isValidSearchEnrichment,
      multisetPlotAvailable,
      plotButtonActive
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px'
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
      multisetFiltersVisible
    ) {
      EMultisetFilters = (
        <EnrichmentMultisetFilters
          {...this.props}
          {...this.state}
          onUpdateQueryData={this.updateQueryData}
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
            label="Study"
            name="enrichmentStudy"
            value={enrichmentStudy}
            options={enrichmentStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={enrichmentStudiesDisabled}
            width={13}
          />
          <span className="StudyHtmlIconDivE">{studyIcon}</span>
          <Form.Field
            control={Select}
            label="Model"
            name="enrichmentModel"
            value={enrichmentModel}
            options={enrichmentModels}
            placeholder="Select Model"
            onChange={this.handleModelChange}
            disabled={enrichmentModelsDisabled}
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
              htmlFor: 'form-select-control-test'
            }}
            search
            searchInput={{ id: 'form-select-control-test' }}
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
        <div className="MultisetContainer">
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

export default withRouter(EnrichmentSearchCriteria);
