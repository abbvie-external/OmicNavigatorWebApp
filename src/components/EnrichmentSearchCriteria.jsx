import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select, Icon, Popup } from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class EnrichmentSearchCriteria extends Component {
  static defaultProps = {
    tab: 'enrichment',
    isValidSearchEnrichment: false,
    isSearching: false
  };

  constructor(props) {
    super(props);
    this.state = {
      study: '',
      studies: [],
      studyHrefVisible: false,
      studyHref: '',
      model: '',
      models: [],
      test: '',
      tests: [],
      studiesDisabled: false,
      modelsDisabled: true,
      testsDisabled: true
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
        studies: studiesArr
      });
    });
  };

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
      studyHrefVisible: true,
      studyHref: `${value}.html`,
      model: '',
      test: '',
      modelsDisabled: true,
      testsDisabled: true
    });
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false
    });
    const modelNamesParam =
      this.props.tab === 'pepplot' ? 'inferenceNames' : 'EnrichmentNames';
    phosphoprotService
      .getModelNames(modelNamesParam, value + 'plots')
      .then(modelsFromService => {
        this.allNames = modelsFromService;
        const modelsArr = _.map(_.keys(modelsFromService), function(modelName) {
          return { key: modelName, text: modelName, value: modelName };
        });
        this.setState({
          modelsDisabled: false,
          models: modelsArr
        });
      });
  };

  handleModelChange = (evt, { name, value }) => {
    this.setState({
      test: '',
      [name]: value
    });
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false
    });
    const testsArr = _.map(this.allNames[value], function(testName) {
      return { key: testName, text: testName, value: testName };
    });
    this.setState({
      testsDisabled: false,
      tests: testsArr
    });
  };

  handleTestChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
      studiesDisabled: true,
      modelsDisabled: true,
      testsDisabled: true
    });
    this.props.onSearchTransition({
      isSearching: true
    });
    const testResultsParam =
      this.props.tab === 'pepplot'
        ? 'getInferenceResults'
        : 'getEnrichmentResults';
    phosphoprotService
      .getTestData(
        this.props.tab,
        testResultsParam,
        this.state.model,
        value,
        this.state.study + 'plots'
      )
      .then(dataFromService => {
        this.testdata = dataFromService;
        this.setState({
          studiesDisabled: false,
          modelsDisabled: false,
          testsDisabled: false
        });
        this.props.onEnrichmentSearch({
          study: this.state.study,
          model: this.state.model,
          test: value,
          enrichmentResults: this.testdata
        });
      });
  };

  render() {
    const {
      study,
      studies,
      studyHref,
      studyHrefVisible,
      model,
      models,
      test,
      tests,
      studiesDisabled,
      modelsDisabled,
      testsDisabled
    } = this.state;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px'
    };

    let studyIcon;
    let studyName = `${study} Analysis Details`;

    if (studyHrefVisible) {
      studyIcon = (
        <Popup
          trigger={
            <a target="_blank" rel="noopener noreferrer" href={studyHref}>
              <Icon
                name="html5"
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
            <a target="_blank" rel="noopener noreferrer">
              <Icon name="html5" size="large" circular inverted disabled />
            </a>
          }
          style={StudyPopupStyle}
          basic
          inverted
          position="bottom center"
          content="Select A Study to view Analysis Details"
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
          name="study"
          value={study}
          options={studies}
          placeholder="Select A Study"
          onChange={this.handleStudyChange}
          disabled={studiesDisabled}
        />
        <Form.Field
          control={Select}
          required
          label="Model"
          name="model"
          value={model}
          options={models}
          placeholder="Select Model"
          onChange={this.handleModelChange}
          disabled={modelsDisabled}
        />
        <Form.Field
          control={Select}
          required
          name="test"
          value={test}
          options={tests}
          placeholder="Select Database"
          onChange={this.handleTestChange}
          disabled={testsDisabled}
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
