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
  Image
} from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import DOMPurify from 'dompurify';
import _ from 'lodash';
import * as d3 from 'd3';
import UpSetFilters from './UpSetFilters';

class EnrichmentSearchCriteria extends Component {
  static defaultProps = {
    tab: 'enrichment',
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    isValidSearchEnrichment: false,
    isSearching: false,
    upsetPlotAvailable: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActive: false,
    uData: []
  };

  constructor(props) {
    super(props);
    this.state = {
      enrichmentStudies: [],
      enrichmentStudyHrefVisible: false,
      enrichmentStudyHref: '',
      enrichmentModels: [],
      enrichmentAnnotations: [],
      enrichmentStudiesDisabled: false,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true,
      uAnchor: '',
      selectedCol: 'adj_P_Val',
      selectedOperator: '<',
      sigValue: 0.05,
      uSettings: {
        defaultSelectedCol: 'adj_P_Val',
        defaultSelectedOperator: '<',
        defaultSigValue: 0.05,
        useAnchor: false,
        must: [],
        not: [],
        displayMetaData: true,
        templateName: 'enrichment-upset',
        automaticUpdates: true,
        numElements: undefined,
        maxElements: undefined,
        heightScalar: 1,
        thresholdCols: ['adj_P_Val'],
        thresholdOperator: ['<', '>', '|<|', '|>|']
      },
      metaSvg: '',
      upsetFiltersVisible: false,
      activateUpSetFilters: false
    };
  }

  componentDidMount() {
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
      enrichmentStudyHref: `${value}.html`,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true
    });
    this.props.onSearchCriteriaChange({
      [name]: value,
      enrichmentModel: '',
      enrichmentAnnotation: ''
    });
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
    this.props.onSearchCriteriaChange({
      enrichmentStudy: this.props.enrichmentStudy,
      [name]: value,
      enrichmentAnnotation: ''
    });
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false,
      upsetPlotAvailable: false
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
      upsetFiltersVisible: false
    });
    this.props.onSearchCriteriaChange({
      enrichmentStudy: this.props.enrichmentStudy,
      enrichmentModel: this.props.enrichmentModel,
      [name]: value
    });
    this.props.onSearchTransition({
      [name]: value,
      isSearching: true
    });
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots'
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

  handleUpsetToggle = () => {
    return evt => {
      if (this.state.upsetFiltersVisible === false) {
        this.setState({
          upsetFiltersVisible: true
        });
        this.updateQueryData({
          must: this.state.uSettings.must,
          not: this.state.uSettings.not,
          sigValue: this.state.uSettings.defaultSigValue,
          // selectedCol: "adj_P_Val",
          selectedOperator: this.state.uSettings.defaultSelectedOperator
        });
      } else {
        this.setState({
          upsetFiltersVisible: false
        });
        const enrichmentAnnotationName = 'enrichmentAnnotation';
        const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
        this.upsetTriggeredAnnotationChange(
          enrichmentAnnotationName,
          enrichmentAnnotationVar
        );
      }
    };
  };

  upsetTriggeredAnnotationChange = (name, value) => {
    this.props.onSearchCriteriaChange({
      enrichmentStudy: this.props.enrichmentStudy,
      enrichmentModel: this.props.enrichmentModel,
      [name]: value
    });
    this.props.onSearchTransition({
      [name]: value,
      isSearching: true
    });
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots'
      )
      .then(dataFromService => {
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  updateQueryData = evt => {
    const eSigV = evt.sigValue || this.state.sigValue;
    const eMust = evt.must || this.state.uSettings.must;
    const eNot = evt.not || this.state.uSettings.not;
    const eOperator = evt.selectedOperator || this.state.selectedOperator;
    // const eCol = evt.selectedCol;
    this.setState({
      uSettings: {
        ...this.state.uSettings,
        must: eMust,
        not: eNot
      },
      sigValue: eSigV,
      selectedOperator: eOperator
      // selectedCol: eCol
    });
    let mustString = this.testToString(eMust);
    let notString = this.testToString(eNot);
    phosphoprotService
      .getUpsetEnrichmentData(
        this.props.enrichmentModel,
        mustString,
        notString,
        this.props.enrichmentStudy + 'plots',
        eSigV,
        this.props.enrichmentAnnotation,
        eOperator
      )
      .then(annotationData => {
        const multisetResults = annotationData;
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length,
            maxElements: this.state.uSettings.maxElements
          },
          activateUpSetFilters: true
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: multisetResults
        });
      });
    this.getUpSetPlot(
      eSigV,
      this.props.enrichmentModel,
      this.props.enrichmentStudy + 'plots',
      this.props.enrichmentAnnotation
    );
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

  getUpSetPlot(sigVal, enrichmentModel, enrichmentStudy, enrichmentAnnotation) {
    phosphoprotService
      .getEnrichmentUpSetPlot(
        sigVal,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation
      )
      .then(svgMarkupObj => {
        let svgMarkup = svgMarkupObj.data;
        let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
          ADD_TAGS: ['use']
        });
        let svgInfo = { plotType: 'UpSet', svg: sanitizedSVG };
        this.props.onGetUpsetPlot({
          svgInfo
        });
      });
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
      upsetFiltersVisible,
      activateUpSetFilters
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      isValidSearchEnrichment,
      isTestSelected,
      isSearching,
      upsetPlotAvailable,
      plotButtonActive
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
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

    let UpsetFilters;
    if (isValidSearchEnrichment && activateUpSetFilters) {
      UpsetFilters = (
        <Transition.Group animation="scale" duration={500}>
          {upsetFiltersVisible && (
            <UpSetFilters
              {...this.props}
              {...this.state}
              onUpdateQueryData={this.updateQueryData}
            />
          )}
        </Transition.Group>
      );
    }

    let PlotRadio;
    let UpsetRadio;

    if (isValidSearchEnrichment) {
      PlotRadio = (
        <Radio
          toggle
          label="View Plot"
          checked={plotButtonActive}
          onChange={this.props.onHandlePlotAnimation('uncover')}
          disabled={!upsetPlotAvailable}
        />
      );

      UpsetRadio = (
        <React.Fragment>
          <Divider />
          <Radio
            toggle
            label="Set Analysis"
            checked={upsetFiltersVisible}
            onChange={this.handleUpsetToggle()}
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
            className="enrichmentStudyDropdown"
            value={enrichmentStudy}
            options={enrichmentStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={enrichmentStudiesDisabled}
            width={13}
          />
          <span className="StudyHtmlIconDiv">{studyIcon}</span>
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
        </Form>
        <div className="UpsetContainer">
          <div className="SliderDiv UpsetRadio">{UpsetRadio}</div>
          <div className="UpsetFiltersDiv">{UpsetFilters}</div>
          <div className="SliderDiv PlotRadio">{PlotRadio}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(EnrichmentSearchCriteria);
