import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class PepplotSearchCriteria extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: this.props.tab || 'pepplot',
      study: this.props.study || '',
      studies: this.props.studies || [],
      model: this.props.model || '',
      models: this.props.models || [],
      test: this.props.test || '',
      tests: this.props.tests || [],
      modelsDisabled: this.props.modelsDisabled || true,
      testsDisabled: this.props.testsDisabled || true,
      isValidSearchPepplot: this.props.isValidSearchPepplot || false,
      pepplotResults: this.props.pepplotResults || []
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
    if (localStorage.studies) {
      const studiesArrStored = JSON.parse(localStorage.studies || []);
      this.setState({
        studies: studiesArrStored
      });
    } else {
      phosphoprotService.getStudies().then(studiesFromService => {
        const studiesArr = studiesFromService.map(study => {
          return { key: study, text: study, value: study };
        });
        this.setState({
          studies: studiesArr
        });
        localStorage.studies = JSON.stringify(studiesArr);
      });
    }
  }

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
      model: '',
      test: '',
      modelsDisabled: true,
      testsDisabled: true
    });
    this.props.onSearchCriteriaReset({
      isValidSearchPepplot: false
    });
    const modelNamesParam =
      this.state.tab === 'pepplot' ? 'inferenceNames' : 'EnrichmentNames';
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
      isValidSearchPepplot: false
    });
    const testsArr = _.map(this.allNames[value], function(testName) {
      return { key: testName, text: testName, value: testName };
    });
    this.setState({
      testsDisabled: false,
      isValidSearchPepplot: false,
      tests: testsArr
    });
  };

  handleTestChange = (evt, { name, value }) => {
    this.setState({
      [name]: value,
      testsDisabled: true
    });
    const testResultsParam =
      this.state.tab === 'pepplot'
        ? 'getInferenceResults'
        : 'getEnrichmentResults';
    phosphoprotService
      .getTestData(
        this.state.tab,
        testResultsParam,
        this.state.model,
        value,
        this.state.study + 'plots'
      )
      .then(dataFromService => {
        this.testdata = dataFromService;
        this.setState({
          testsDisabled: false
        });
        this.props.onPepplotSearch({
          study: this.state.study,
          model: this.state.model,
          test: value,
          pepplotResults: this.testdata
        });
      });
  };

  render() {
    return (
      <Form className="SearchCriteriaContainer">
        <p className="FilterText">FILTERS</p>
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
    );
  }
}

export default withRouter(PepplotSearchCriteria);
