import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class EnrichmentSearchCriteria extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: this.props.tab || 'enrichment',
      study: this.props.study || '',
      studies: this.props.studies || [],
      model: this.props.model || '',
      models: this.props.models || [],
      test: this.props.test || '',
      tests: this.props.tests || [],
      modelsDisabled: this.props.modelsDisabled,
      testsDisabled: this.props.testsDisabled || true,
      isValidSearchEnrichment: this.props.isValidSearchEnrichment || false,
      enrichmentResults: this.props.enrichmentResults || []
    };

    this.populateStudies = this.populateStudies.bind(this);
    this.handleStudyChange = this.handleStudyChange.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleTestChange = this.handleTestChange.bind(this);
  }

  componentDidMount() {
    this.populateStudies();
  }

  populateStudies() {
    phosphoprotService.getStudies().then(studiesFromService => {
      const studiesArr = studiesFromService.map(study => {
        return { key: study, text: study, value: study };
      });
      this.setState({
        studies: studiesArr
      });
    });
  }

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
      model: '',
      test: '',
      modelsDisabled: true,
      testsDisabled: true,
      isValidSearchEnrichment: false
    });
    this.state.study = value;
    const modelNamesParam =
      this.state.tab === 'pepplot' ? 'inferenceNames' : 'EnrichmentNames';
    phosphoprotService
      .getModelNames(modelNamesParam, this.state.study + 'plots')
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
    const testsArr = _.map(this.allNames[value], function(testName) {
      return { key: testName, text: testName, value: testName };
    });
    this.setState({
      testsDisabled: false,
      isValidSearchEnrichment: false,
      tests: testsArr
    });
  };

  handleTestChange = (evt, { name, value }) => {
    this.setState({
      [name]: value
    });
    this.state.test = value;
    const testResultsParam =
      this.state.tab === 'pepplot'
        ? 'getInferenceResults'
        : 'getEnrichmentResults';
    phosphoprotService
      .getTestData(
        this.state.tab,
        testResultsParam,
        this.state.model,
        this.state.test,
        this.state.study + 'plots'
      )
      .then(dataFromService => {
        this.data = dataFromService;
        this.setState({
          isValidSearchEnrichment: true
        });
        this.handleEnrichmentSearch(this.data);
      });
  };

  handleEnrichmentSearch = data => {
    this.props.onEnrichmentSearch({
      enrichmentResults: data
    });
  };

  render() {
    const { tab, study, model, test } = this.state;

    return (
      <div className="SearchCriteriaContainer">
        <Form className="SearchCriteria">
          <p className="CondensedBoldText">FILTERS</p>
          <Form.Field
            control={Select}
            required
            label="Study"
            name="study"
            value={this.state.study}
            options={this.state.studies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
          />
          <Form.Field
            control={Select}
            required
            label="Model"
            name="model"
            value={this.state.model}
            options={this.state.models}
            placeholder="Select Model"
            onChange={this.handleModelChange}
            disabled={this.state.modelsDisabled}
          />
          <Form.Field
            control={Select}
            required
            name="test"
            value={this.state.test}
            options={this.state.tests}
            placeholder="Select Test"
            onChange={this.handleTestChange}
            disabled={this.state.testsDisabled}
            label={{
              children: 'Test',
              htmlFor: 'form-select-control-test'
            }}
            search
            searchInput={{ id: 'form-select-control-test' }}
          />
        </Form>
      </div>
    );
  }
}

export default withRouter(EnrichmentSearchCriteria);
