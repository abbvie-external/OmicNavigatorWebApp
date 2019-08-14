import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Form, Select, Segment, Button } from 'semantic-ui-react';
import { phosphoprotService } from '../services/phosphoprot.service';

// Mock Data until services are wired up
const studies = [
  { key: 'p', text: '***REMOVED***', value: '***REMOVED***' },
  { key: 'h', text: '***REMOVED***', value: 'hpk1' },
  { key: 'c', text: '***REMOVED***', value: '***REMOVED***' }
];

// const studies = [{}];

const testCategories = [
  {
    key: 'd',
    text: 'DonorDifferentialPhosphorylation',
    value: 'donordifferentialphosphorylation'
  },
  {
    key: 't',
    text: 'TreatmentDifferentialPhosphorylation',
    value: 'treatmentdifferentialphosphorylation'
  }
];

const tests = [
  { key: 'd1d2', text: 'Donor1vDonor2', value: 'donor1vdonor2' },
  { key: 'd1d3', text: 'Donor1vDonor3', value: 'tesdonor1vdonor3tb' },
  { key: 'd2d3', text: 'Donor2vDonor3', value: 'tesdonor2vdonor3tb' }
];

class SearchCriteria extends Component {
  constructor() {
    super();
    this.state = {
      view: 'pepplot',
      study: '',
      model: '',
      test: '',
      modelsDisabled: true,
      testsDisabled: true,
      selectedView: '',
      selectedStudy: '',
      selectedModel: '',
      selectedTest: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleChange = (evt, { name, value }) => this.setState({ [name]: value });

  handleViewChange = choice => {
    return evt => {
      this.setState({
        view: choice,
        study: '',
        model: '',
        test: '',
        modelsDisabled: true,
        testsDisabled: true,
        selectedView: '',
        selectedStudy: '',
        selectedModel: '',
        selectedTest: ''
      });
    };
  };

  validSearch = () => {
    console.log('Add Validation that view, study, model, test have values');
  };

  handleSearch = e => {
    e.preventDefault();
    const { view, study, model, test } = this.state;
    this.setState({
      selectedView: view,
      selectedStudy: study,
      selectedModel: model,
      selectedTest: test
    });
    // this.props.history.push('/{view}');
  };

  componentDidMount() {
    this.populateStudies();
  }

  populateStudies = () => {
    phosphoprotService.getStudies();
    // phosphoprotService.getStudies()
    //   .then((studies) => (
    //     this.setState({
    //       modelsDisabled: false,
    //       studies: studies
    //     })
    // ));
  };

  render() {
    const {
      view,
      study,
      model,
      test,
      selectedView,
      selectedStudy,
      selectedModel,
      selectedTest
    } = this.state;

    return (
      <div className="SearchCriteriaContainer">
        <Form
          size="small"
          className="SearchCriteria"
          onSubmit={this.handleSearch.bind(this)}
        >
          <Segment className="">
            <Button.Group className="">
              <Button
                type="button"
                className="DifferentialButton"
                positive={this.state.view === 'pepplot'}
                onClick={this.handleViewChange('pepplot')}
              >
                Differential
              </Button>
              <Button.Or className="OrCircle" />
              <Button
                type="button"
                className="EnrichmentButton"
                positive={this.state.view === 'enrichment'}
                onClick={this.handleViewChange('enrichment')}
              >
                Enrichment
              </Button>
            </Button.Group>
          </Segment>

          <Segment>
            <Form.Field
              control={Select}
              required
              label="Study"
              name="study"
              value={study}
              options={studies}
              placeholder="Select A Study"
              onChange={this.handleChange}
            />
            <Form.Field
              control={Select}
              required
              label="Model"
              name="model"
              value={model}
              options={testCategories}
              placeholder="Select Model"
              onChange={this.handleChange}
            />
            <Form.Field
              control={Select}
              required
              name="test"
              value={test}
              options={tests}
              placeholder="Select Test"
              onChange={this.handleChange}
              label={{
                children: 'Test',
                htmlFor: 'form-select-control-gender'
              }}
              search
              searchInput={{ id: 'form-select-control-gender' }}
            />
            <Link
              to={{
                pathname: `/${this.state.view}`,
                state: {
                  view: this.state.view
                }
              }}
            >
              <Form.Button content="Search"></Form.Button>
            </Link>
          </Segment>
        </Form>
        <br></br>
        <strong>onChange:</strong>
        <pre>{JSON.stringify({ view, study, model, test }, null, 2)}</pre>
        {/* <strong>onSubmit:</strong>
        <pre>
          {JSON.stringify(
            { selectedView, selectedStudy, selectedModel, selectedTest },
            null,
            2
          )}
        </pre> */}
      </div>
    );
  }
}

export default withRouter(SearchCriteria);
