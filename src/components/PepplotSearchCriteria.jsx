import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Select, Icon, Popup } from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';

class PepplotSearchCriteria extends Component {
  static defaultProps = {
    tab: 'pepplot',
    pepplotStudy: '',
    pepplotModel: '',
    pepplotTest: '',
    isValidSearchPepplot: false,
    isSearching: false
  };

  constructor(props) {
    super(props);
    this.state = {
      pepplotStudies: [],
      pepplotStudyHrefVisible: false,
      pepplotStudyHref: '',
      pepplotModels: [],
      pepplotTests: [],
      pepplotStudiesDisabled: false,
      pepplotModelsDisabled: true,
      pepplotTestsDisabled: true
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
        pepplotStudies: studiesArr
      });
    });
  };

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      pepplotStudyHrefVisible: true,
      pepplotStudyHref: `${value}.html`,
      pepplotModelsDisabled: true,
      pepplotTestsDisabled: true
    });
    this.props.onSearchCriteriaChange({
      [name]: value,
      pepplotModel: '',
      pepplotTest: ''
    });
    this.props.onSearchCriteriaReset({
      isValidSearchPepplot: false
    });
    phosphoprotService
      .getModelNames('inferenceNames', value + 'plots')
      .then(modelsFromService => {
        this.allNames = modelsFromService;
        const modelsArr = _.map(_.keys(modelsFromService), function(modelName) {
          return { key: modelName, text: modelName, value: modelName };
        });
        this.setState({
          pepplotModelsDisabled: false,
          pepplotModels: modelsArr
        });
      });
  };

  handleModelChange = (evt, { name, value }) => {
    this.props.onSearchCriteriaChange({
      pepplotStudy: this.props.pepplotStudy,
      [name]: value,
      pepplotTest: ''
    });
    this.props.onSearchCriteriaReset({
      isValidSearchPepplot: false
    });
    const testsArr = _.map(this.allNames[value], function(testName) {
      return { key: testName, text: testName, value: testName };
    });
    this.setState({
      pepplotTestsDisabled: false,
      pepplotTests: testsArr
    });
  };

  handleTestChange = (evt, { name, value }) => {
    this.setState({
      pepplotStudiesDisabled: true,
      pepplotModelsDisabled: true,
      pepplotTestsDisabled: true
    });
    this.props.onSearchCriteriaChange({
      pepplotStudy: this.props.pepplotStudy,
      pepplotModel: this.props.pepplotModel,
      [name]: value
    });
    this.props.onSearchTransition({
      [name]: value,
      isSearching: true
    });
    phosphoprotService
      .getTestData(
        this.props.pepplotModel,
        value,
        this.props.pepplotStudy + 'plots'
      )
      .then(dataFromService => {
        this.testdata = dataFromService;
        this.setState({
          pepplotStudiesDisabled: false,
          pepplotModelsDisabled: false,
          pepplotTestsDisabled: false
        });
        this.props.onPepplotSearch({
          pepplotResults: this.testdata
        });
      });
  };

  render() {
    const {
      pepplotStudies,
      pepplotStudyHref,
      pepplotStudyHrefVisible,
      pepplotModels,
      pepplotTests,
      pepplotStudiesDisabled,
      pepplotModelsDisabled,
      pepplotTestsDisabled
    } = this.state;

    const { pepplotStudy, pepplotModel, pepplotTest } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px'
    };

    let studyIcon;
    let studyName = `${pepplotStudy} Analysis Details`;

    if (pepplotStudyHrefVisible) {
      studyIcon = (
        <Popup
          trigger={
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={pepplotStudyHref}
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
          name="pepplotStudy"
          value={pepplotStudy}
          options={pepplotStudies}
          placeholder="Select A Study"
          onChange={this.handleStudyChange}
          disabled={pepplotStudiesDisabled}
        />
        <Form.Field
          control={Select}
          required
          label="Model"
          name="pepplotModel"
          value={pepplotModel}
          options={pepplotModels}
          placeholder="Select Model"
          onChange={this.handleModelChange}
          disabled={pepplotModelsDisabled}
        />
        <Form.Field
          control={Select}
          required
          name="pepplotTest"
          value={pepplotTest}
          options={pepplotTests}
          placeholder="Select Test"
          onChange={this.handleTestChange}
          disabled={pepplotTestsDisabled}
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
