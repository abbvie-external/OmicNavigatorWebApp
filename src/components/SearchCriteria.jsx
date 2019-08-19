import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Form, Select } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class SearchCriteria extends Component {
  constructor() {
    super();
    this.state = {
      view: 'pepplot',
      study: '',
      studies: [],
      model: '',
      models: [],
      test: '',
      tests: [],
      modelsDisabled: true,
      testsDisabled: true,
      searchDisabled: true
    };
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleStudyChange = this.handleStudyChange.bind(this);
    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.populateStudies = this.populateStudies.bind(this);
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

  handleViewChange = choice => {
    return evt => {
      this.setState({
        view: choice,
        study: '',
        model: '',
        test: '',
        modelsDisabled: true,
        testsDisabled: true,
        searchDisabled: true
      });
    };
  };

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
      model: '',
      test: '',
      modelsDisabled: true,
      testsDisabled: true,
      searchDisabled: true
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
      searchDisabled: true,
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
        // committing here, next step is to integrate this data into the grid...
      });
  };

  validSearch = () => {
    console.log('Add Validation that view, study, model, test have values');
  };

  handleSearch = evt => {
    evt.preventDefault();
    // const { view, study, model, test } = this.state;
    // this.setState({
    // });
    // this.props.history.push('/{view}');
  };

  render() {
    const { view, study, model, test } = this.state;

    return (
      <div className="SearchCriteriaContainer">
        <Form
          size="medium"
          className="SearchCriteria"
          onSubmit={this.handleSearch.bind(this)}
        >
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

export default withRouter(SearchCriteria);
