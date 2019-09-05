import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class PepplotSearchCriteria extends Component {
  static defaultProps = {
    tab: 'pepplot',
    isValidSearchPepplot: false,
    isSearching: false
  };

  constructor(props) {
    super(props);
    this.state = {
      study: '',
      studies: [],
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
      model: '',
      test: '',
      modelsDisabled: true,
      testsDisabled: true
    });
    this.props.onSearchCriteriaReset({
      isValidSearchPepplot: false
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
      isValidSearchPepplot: false
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
          disabled={this.state.studiesDisabled}
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
