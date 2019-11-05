import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Select,
  Icon,
  Popup,
  Divider,
  Radio,
  Transition
} from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import DOMPurify from 'dompurify';
import _ from 'lodash';
import UpSetFilters from './UpSetFilters';

class PepplotSearchCriteria extends Component {
  static defaultProps = {
    tab: 'pepplot',
    pepplotStudy: '',
    pepplotModel: '',
    pepplotTest: '',
    isValidSearchPepplot: false,
    isSearching: false,
    upsetPlotAvailable: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActive: false
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
      pepplotTestsDisabled: true,
      uAnchor: '',
      selectedCol: {
        key: 'adj_P_Val',
        text: 'adj_P_Val',
        value: 'adj_P_Val'
      },
      selectedOperator: {
        key: '<',
        text: '<',
        value: '<'
      },
      sigValue: 0.05,
      uSettings: {
        defaultSelectedCol: {
          key: 'adj_P_Val',
          text: 'adj_P_Val',
          value: 'adj_P_Val'
        },
        defaultSelectedOperator: {
          key: '<',
          text: '<',
          value: '<'
        },
        defaultSigValue: 0.05,
        useAnchor: true,
        must: [],
        not: [],
        displayMetaData: true,
        templateName: 'pepplot-upset',
        numElements: undefined,
        maxElements: undefined,
        metaSvg: '',
        heightScalar: 1,
        thresholdCols: [
          {
            key: 'adj_P_Val',
            text: 'adj_P_Val',
            value: 'adj_P_Val'
          }
        ],
        thresholdOperator: [
          {
            key: '<',
            text: '<',
            value: '<'
          },
          {
            key: '>',
            text: '>',
            value: '>'
          },
          {
            key: '|<|',
            text: '|<|',
            value: '|<|'
          },
          {
            key: '|>|',
            text: '|>|',
            value: '|>|'
          }
        ]
      },
      upsetFiltersVisible: false,
      activateUpSetFilters: false,
      uData: []
    };
  }

  componentDidMount() {
    const s = this.props.pepplotStudy || '';
    const m = this.props.pepplotModel || '';
    const t = this.props.pepplotTest || '';
    const p = this.props.pepplotProteinSite || '';
    if (s !== '') {
      this.setState({
        pepplotStudyHrefVisible: true,
        pepplotStudyHref: `${s}.html`
      });
      phosphoprotService
        .getModelNames('inferenceNames', s + 'plots')
        .then(modelsFromService => {
          this.allNames = modelsFromService;
          const modelsArr = _.map(_.keys(modelsFromService), function(
            modelName
          ) {
            return { key: modelName, text: modelName, value: modelName };
          });
          this.setState({
            pepplotModelsDisabled: false,
            pepplotModels: modelsArr
          });
          if (m !== '') {
            const testsArr = _.map(this.allNames[m], function(testName) {
              return { key: testName, text: testName, value: testName };
            });
            const uDataArr = this.allNames[m];
            this.setState({
              pepplotTestsDisabled: false,
              pepplotTests: testsArr,
              uData: uDataArr
            });
          }
        });
    }

    if (t !== '') {
      this.props.onSearchCriteriaChange({
        pepplotStudy: s,
        pepplotModel: m,
        pepplotTest: t,
        pepplotProteinSite: p
      });
      this.setState({
        uAnchor: t
      });
      this.props.onSearchTransition({
        isSearching: true
      });
      phosphoprotService
        .getTestData(m, t, s + 'plots')
        .then(dataFromService => {
          this.testdata = dataFromService;
          // this.setState({
          //   pepplotStudiesDisabled: false,
          //   pepplotModelsDisabled: false,
          //   pepplotTestsDisabled: false
          // });
          this.props.onPepplotSearch({
            pepplotResults: this.testdata
          });
        });
    }
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
      pepplotStudyHref: `http://www.localhost:3000/${value}.html`,
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
    const uDataObj = this.allNames[value];
    this.setState({
      pepplotTestsDisabled: false,
      pepplotTests: testsArr,
      uData: uDataObj
    });
  };

  handleTestChange = (evt, { name, value }) => {
    this.setState({
      upsetFiltersVisible: false
    });
    // this.setState({
    //   pepplotStudiesDisabled: true,
    //   pepplotModelsDisabled: true,
    //   pepplotTestsDisabled: true
    // });
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
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            must: [],
            not: [],
            defaultSigValue: 0.05,
            maxElements: dataFromService.length
          },
          sigValue: 0.05,
          uAnchor: value
        });
        this.testdata = dataFromService;
        // this.setState({
        //   pepplotStudiesDisabled: false,
        //   pepplotModelsDisabled: false,
        //   pepplotTestsDisabled: false
        // });
        this.props.onPepplotSearch({
          pepplotResults: this.testdata
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
          sigValue: this.state.sigValue,
          selectedCol: this.state.selectedCol,
          selectedOperator: this.state.selectedOperator
        });
      } else {
        this.setState({
          upsetFiltersVisible: false
        });
        const pepplotTestName = 'pepplotTest';
        const pepplotTestVar = this.props.pepplotTest;
        this.upsetTriggeredTestChange(pepplotTestName, pepplotTestVar);
      }
    };
  };

  upsetTriggeredTestChange = (name, value) => {
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
        this.props.onPepplotSearch({
          pepplotResults: this.testdata
        });
      });
  };

  updateQueryData = evt => {
    this.props.onDisablePlot();
    const eSigV = evt.sigValue || this.state.sigValue;
    const eMust = evt.must || this.state.uSettings.must;
    const eNot = evt.not || this.state.uSettings.not;
    const eOperator = evt.selectedOperator || this.state.selectedOperator;
    const eCol = evt.selectedCol || this.state.selectedCol;
    let mustString = this.testToString(eMust);
    let notString = this.testToString(eNot);
    phosphoprotService
      .getUpsetInferenceData(
        this.props.pepplotModel,
        mustString,
        notString,
        this.props.pepplotStudy + 'plots',
        eSigV,
        this.props.pepplotTest,
        eOperator.text,
        eCol.text
      )
      .then(inferenceData => {
        const multisetResults = inferenceData;
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length,
            maxElements: this.state.uSettings.maxElements,
            must: eMust,
            not: eNot
          },
          activateUpSetFilters: true,
          sigValue: eSigV,
          selectedOperator: eOperator,
          selectedCol: eCol
        });
        this.props.onPepplotSearch({
          pepplotResults: multisetResults
        });
      });
    this.getUpSetPlot(
      eSigV,
      this.props.pepplotModel,
      this.props.pepplotStudy + 'plots'
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

  getUpSetPlot(sigVal, pepplotModel, pepplotStudy, pepplotAnnotation) {
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    phosphoprotService
      .getInferenceUpSetPlot(sigVal, pepplotModel, pepplotStudy)
      .then(svgMarkupObj => {
        let svgMarkup = svgMarkupObj.data;
        // svgMarkup = svgMarkup.replace(
        //   /<svg/g,
        //   '<svg preserveAspectRatio="xMinYMid meet" id="multisetAnalysisSVG"'
        // );
        svgMarkup = svgMarkup.replace(
          /<svg/g,
          '<svg preserveAspectRatio="xMinYMid meet" style="width:' +
            widthCalculation() * 0.8 +
            'px; height:' +
            heightCalculation() * 0.8 +
            'px;" id="multisetAnalysisSVG"'
        );
        // DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        //   if (
        //     node.hasAttribute('xlink:href') &&
        //     !node.getAttribute('xlink:href').match(/^#/)
        //   ) {
        //     node.remove();
        //   }
        // });
        // Clean HTML string and write into our DIV
        let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
          ADD_TAGS: ['use']
        });
        let svgInfo = { plotType: 'UpSet', svg: sanitizedSVG };
        this.props.onGetUpsetPlot({
          svgInfo
        });
      });
  }

  calculateHeight() {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    return h;
  }

  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    return w;
  }

  render() {
    const {
      pepplotStudies,
      pepplotStudyHref,
      pepplotStudyHrefVisible,
      pepplotModels,
      pepplotTests,
      pepplotStudiesDisabled,
      pepplotModelsDisabled,
      pepplotTestsDisabled,
      upsetFiltersVisible,
      activateUpSetFilters
    } = this.state;

    const {
      pepplotStudy,
      pepplotModel,
      pepplotTest,
      isValidSearchPepplot,
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
    if (isValidSearchPepplot && activateUpSetFilters && upsetFiltersVisible) {
      UpsetFilters = (
        <UpSetFilters
          {...this.props}
          {...this.state}
          onUpdateQueryData={this.updateQueryData}
        />
      );
    }

    let PlotRadio;
    let UpsetRadio;

    if (isValidSearchPepplot) {
      PlotRadio = (
        <Transition
          visible={!upsetPlotAvailable}
          animation="flash"
          duration={1500}
        >
          <Radio
            toggle
            label="View Plot"
            className={upsetPlotAvailable ? 'ViewPlotRadio' : ''}
            checked={plotButtonActive}
            onChange={this.props.onHandlePlotAnimation('uncover')}
            disabled={!upsetPlotAvailable}
          />
        </Transition>
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
            name="pepplotStudy"
            value={pepplotStudy}
            options={pepplotStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={pepplotStudiesDisabled}
            width={13}
          />
          <span className="StudyHtmlIconDiv">{studyIcon}</span>
          <Form.Field
            control={Select}
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
        <div className="UpsetContainer">
          <div className="SliderDiv">
            <span className="UpsetRadio">{UpsetRadio}</span>
            <span className="PlotRadio">{PlotRadio}</span>
          </div>
          <div className="UpsetFiltersDiv">{UpsetFilters}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(PepplotSearchCriteria);
