import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select, Icon, Popup, Button } from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import DOMPurify from 'dompurify';
import _ from 'lodash';

class EnrichmentSearchCriteria extends Component {
  static defaultProps = {
    tab: 'enrichment',
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    isValidSearchEnrichment: false,
    isSearching: false
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
      upsetIcon: 'venndiagram.png',
      sigValue: 0.05,
      uData: [],
      uAnchor: '',
      uSettings: {
        defaultSigValue: 0.05,
        useAnchor: false,
        must: [],
        not: [],
        displayMetaData: true,
        templateName: 'enrichment-upset',
        automaticUpdates: true,
        numElements: undefined,
        maxElements: undefined,
        heightScalar: 1
      }
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
      enrichmentStudiesDisabled: true,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true
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
        this.annotationdata = dataFromService;
        this.setState({
          enrichmentStudiesDisabled: false,
          enrichmentModelsDisabled: false,
          enrichmentAnnotationsDisabled: false
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  handleUpsetToggle = () => {
    return evt => {
      if (this.state.upsetIcon === 'venndiagram.png') {
        this.setState({
          upsetIcon: 'venndiagramChosenAltGreen.png'
        });
        this.props.onUseUpsetAnalysis(true);
        this.updateQueryData({
          must: this.state.uSettings.must,
          not: this.state.uSettings.not,
          sig: this.state.sigValue
        });
      } else {
        this.setState({
          upsetIcon: 'venndiagram.png'
        });
        this.props.onUseUpsetAnalysis(false);
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
    this.setState({
      enrichmentStudiesDisabled: true,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true
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
        this.annotationdata = dataFromService;
        this.setState({
          enrichmentStudiesDisabled: false,
          enrichmentModelsDisabled: false,
          enrichmentAnnotationsDisabled: false
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  updateQueryData(e) {
    var sigValue = e.sig;
    var mustString = '';
    var notString = '';
    this.setState({
      uSettings: {
        ...this.state.uSettings,
        must: e.must,
        not: e.not,
        defaultSigValue: e.sig
      }
    });

    if (sigValue == 0) {
      return;
    } else {
      //Turn Must Tests and Not Tests into a...
      //single string separated by a ;
      //Used for service function call

      var mustString = this.testToString(e.must);
      var notString = this.testToString(e.not);

      phosphoprotService
        .getUpsetEnrichmentData(
          this.props.enrichmentModel,
          mustString,
          notString,
          this.props.enrichmentStudy + 'plots',
          this.state.sigValue,
          this.props.enrichmentAnnotation
        )
        .then(annotationData => {
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              numElements: annotationData.length
            }
          });
          //A Heuristic solution to trigger the ngOnChange in UpSet-Query
          // const uSettingsCopy = Object.assign({}, this.state.uSettings)

          let allKeys = _.keys(annotationData[0]);
          let ***REMOVED***_text_col = _.indexOf(allKeys, 'name_1006');

          let includeCols = ['Annotation'];
          if (***REMOVED***_text_col >= 0) {
            // this.show***REMOVED***TextCol = true;
            includeCols.push('name_1006');
          }
          let Columns = _.map(
            _.filter(_.keys(annotationData[0]), function(d) {
              return !_.includes(includeCols, d);
            }),
            function(d) {
              return { field: d };
            }
          );
          // this.loadItems();
          // this.queried = true;
          // this.gridLoading = false;
        });
      this.getUpSetPlot(
        sigValue,
        this.props.enrichmentModel,
        this.props.enrichmentStudy + 'plots',
        this.props.enrichmentAnnotation
      );
    }
  }

  testToString(solution) {
    var str = '';
    if (solution.length == 0) {
      return str;
    }
    for (var i = 0; i < solution.length; i++) {
      if (i == solution.length - 1) {
        str += solution[i] + '';
      } else {
        str += solution[i] + ';';
      }
    }
    return str;
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
      upsetIcon
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      isValidSearchEnrichment,
      isTestSelected,
      isSearching,
      useUpsetAnalysis
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
                className="StudyHTMLIcon"
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

    let upsetToggle = '';
    if (isValidSearchEnrichment && !isTestSelected && !isSearching) {
      upsetToggle = (
        <div className="UpsetToggleContainer">
          {/* <Divider /> */}
          {/* <span className="UpsetToggleText">ANALYSIS</span> */}
          <span className="">
            <Popup
              trigger={
                <img
                  className="UpsetIconImg"
                  src={upsetIcon}
                  alt="Upset Icon"
                  onClick={this.handleUpsetToggle()}
                />
              }
              style={StudyPopupStyle}
              basic
              inverted
              position="right center"
              content="Set Analysis"
            />
          </span>
        </div>
      );
    }

    let upsetFilters = '';
    if (
      isValidSearchEnrichment &&
      !isTestSelected &&
      !isSearching &&
      useUpsetAnalysis === true
    ) {
      upsetFilters = (
        <div className="UpsetFiltersContainer">
          {/* <Divider /> */}
          <span className="UpsetFilters">Upset Filters Go Here</span>
        </div>
      );
    }
    return (
      <React.Fragment>
        <Form className="SearchCriteriaContainer">
          <div className="FilterStudyContainer">
            <span className="FilterText">FILTERS</span>
            <span className="StudyHTML">{studyIcon}</span>
          </div>

          <Form.Field
            control={Select}
            required
            label="Study"
            name="enrichmentStudy"
            value={enrichmentStudy}
            options={enrichmentStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={enrichmentStudiesDisabled}
          />
          <Form.Field
            control={Select}
            required
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
            required
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
        {upsetToggle}
        {upsetFilters}
      </React.Fragment>
    );
  }
}

export default withRouter(EnrichmentSearchCriteria);
