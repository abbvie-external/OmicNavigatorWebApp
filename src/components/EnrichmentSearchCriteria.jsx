import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select, Icon, Popup } from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class EnrichmentSearchCriteria extends Component {
  static defaultProps = {
    tab: 'enrichment',
    enrichmentStudy: '',
    enrichmentModel: '',
    annotation: '',
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
      annotations: [],
      enrichmentStudiesDisabled: false,
      enrichmentModelsDisabled: true,
      annotationsDisabled: true
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
      annotationsDisabled: true
    });
    this.props.onSearchCriteriaChange({
      [name]: value,
      enrichmentModel: '',
      annotation: ''
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
      annotation: ''
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
      annotationsDisabled: false,
      annotations: annotationsArr
    });
  };

  handleAnnotationChange = (evt, { name, value }) => {
    this.setState({
      enrichmentStudiesDisabled: true,
      enrichmentModelsDisabled: true,
      annotationsDisabled: true
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
          annotationsDisabled: false
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  render() {
    const {
      enrichmentStudies,
      enrichmentStudyHref,
      enrichmentStudyHrefVisible,
      enrichmentModels,
      annotations,
      enrichmentStudiesDisabled,
      enrichmentModelsDisabled,
      annotationsDisabled
    } = this.state;

    const { enrichmentStudy, enrichmentModel, annotation } = this.props;

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

    return (
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
          name="annotation"
          value={annotation}
          options={annotations}
          placeholder="Select Database"
          onChange={this.handleAnnotationChange}
          disabled={annotationsDisabled}
          label={{
            children: 'Database',
            htmlFor: 'form-select-control-test'
          }}
          search
          searchInput={{ id: 'form-select-control-test' }}
        />
      </Form>
    );
  }
}

export default withRouter(EnrichmentSearchCriteria);
