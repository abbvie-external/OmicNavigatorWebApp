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
import _ from 'lodash';
import UpSetFiltersPepplot from './UpSetFiltersPepplot';

class PepplotSearchCriteria extends Component {
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
      uAnchorP: '',
      selectedColP: {
        key: 'adj_P_Val',
        text: 'adj_P_Val',
        value: 'adj_P_Val'
      },
      selectedOperatorP: {
        key: '<',
        text: '<',
        value: '<'
      },
      sigValueP: 0.05,
      reloadPlot: true,
      uSettingsP: {
        defaultselectedColP: {
          key: 'adj_P_Val',
          text: 'adj_P_Val',
          value: 'adj_P_Val'
        },
        defaultselectedOperatorP: {
          key: '<',
          text: '<',
          value: '<'
        },
        defaultsigValueP: 0.05,
        useAnchorP: true,
        mustP: [],
        notP: [],
        displayMetaDataP: true,
        templateName: 'pepplot-upset',
        numElementsP: undefined,
        maxElementsP: undefined,
        metaSvgP: '',
        heightScalarP: 1,
        thresholdColsP: [
          {
            key: 'adj_P_Val',
            text: 'adj_P_Val',
            value: 'adj_P_Val'
          }
        ],
        thresholdOperatorP: [
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
      upsetFiltersVisibleP: false,
      activateUpSetFiltersP: false,
      uDataP: []
    };
  }

  componentDidMount() {
    debugger;
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
            const uDataPArr = this.allNames[m];
            this.setState({
              pepplotTestsDisabled: false,
              pepplotTests: testsArr,
              uDataP: uDataPArr
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
        uAnchorP: t
      });
      this.props.onSearchTransition({
        isSearching: true
      });
      phosphoprotService
        .getTestData(m, t, s + 'plots')
        .then(dataFromService => {
          this.setState({
            uSettingsP: {
              ...this.state.uSettingsP,
              maxElementsP: dataFromService.length
            }
          });
          this.testdata = dataFromService;
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
    const uDataPObj = this.allNames[value];
    this.setState({
      pepplotTestsDisabled: false,
      pepplotTests: testsArr,
      uDataP: uDataPObj
    });
  };

  handleTestChange = (evt, { name, value }) => {
    this.setState({
      reloadPlot: true,
      upsetFiltersVisibleP: false
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
        this.setState({
          uSettingsP: {
            ...this.state.uSettingsP,
            mustP: [],
            notP: [],
            defaultsigValueP: 0.05,
            maxElementsP: dataFromService.length
          },
          sigValueP: 0.05,
          uAnchorP: value
        });
        this.testdata = dataFromService;
        this.props.onPepplotSearch({
          pepplotResults: this.testdata
        });
      });
  };

  handleUpsetToggle = () => {
    return evt => {
      if (this.state.upsetFiltersVisibleP === false) {
        this.setState({
          upsetFiltersVisibleP: true
        });
        this.props.onMultisetQueried(true);
        this.updateQueryDataP({
          mustP: this.state.uSettingsP.mustP,
          notP: this.state.uSettingsP.notP,
          sigValueP: this.state.sigValueP,
          selectedColP: this.state.selectedColP,
          selectedOperatorP: this.state.selectedOperatorP
        });
      } else {
        this.setState({
          upsetFiltersVisibleP: false,
          reloadPlot: true
        });
        this.props.onMultisetQueried(false);
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

  updateQueryDataP = evt => {
    const eSigVP = evt.sigValueP || this.state.sigValueP;
    const eMustP = evt.mustP || this.state.uSettingsP.mustP;
    const eNotP = evt.notP || this.state.uSettingsP.notP;
    const eOperatorP = evt.selectedOperatorP || this.state.selectedOperatorP;
    const eColP = evt.selectedColP || this.state.selectedColP;
    let mustPString = this.testToString(eMustP);
    let notPString = this.testToString(eNotP);
    this.setState({
      sigValueP: eSigVP,
      selectedOperatorP: eOperatorP,
      selectedColP: eColP
    });
    if (eSigVP !== this.state.sigValueP || this.state.reloadPlot === true) {
      this.props.onDisablePlot();
      this.getUpSetPlot(
        eSigVP,
        this.props.pepplotModel,
        this.props.pepplotStudy + 'plots',
        eOperatorP,
        eColP
      );
    }
    phosphoprotService
      .getUpsetInferenceData(
        this.props.pepplotModel,
        mustPString,
        notPString,
        this.props.pepplotStudy + 'plots',
        eSigVP,
        this.props.pepplotTest,
        eOperatorP.text,
        eColP.text
      )
      .then(inferenceData => {
        const multisetResultsP = inferenceData;
        this.setState({
          uSettingsP: {
            ...this.state.uSettingsP,
            numElementsP: multisetResultsP.length,
            maxElementsP: this.state.uSettingsP.maxElementsP,
            mustP: eMustP,
            notP: eNotP
          },
          activateUpSetFiltersP: true,
          reloadPlot: false
        });
        this.props.onPepplotSearch({
          pepplotResults: multisetResultsP
        });
      });
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

  getUpSetPlot(sigVal, pepplotModel, pepplotStudy, eOperatorP, eColP) {
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    phosphoprotService
      .getInferenceUpSetPlot(
        sigVal,
        pepplotModel,
        pepplotStudy,
        eOperatorP,
        eColP
      )
      .then(svgMarkupObj => {
        let svgMarkup = svgMarkupObj.data;
        svgMarkup = svgMarkup.replace(
          /<svg/g,
          '<svg preserveAspectRatio="xMinYMid meet" style="width:' +
            widthCalculation() * 0.8 +
            'px; height:' +
            heightCalculation() * 0.8 +
            'px;" id="multisetAnalysisSVG"'
        );
        let svgInfo = { plotType: 'UpSet', svg: svgMarkup };
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
      upsetFiltersVisibleP,
      activateUpSetFiltersP
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

    let UpsetFiltersPepplot;
    if (isValidSearchPepplot && activateUpSetFiltersP && upsetFiltersVisibleP) {
      UpsetFiltersPepplot = (
        <UpSetFiltersPepplot
          {...this.props}
          {...this.state}
          onUpdateQueryDataP={this.updateQueryDataP}
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
            checked={upsetFiltersVisibleP}
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
          <div className="UpsetFiltersDiv">{UpsetFiltersPepplot}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(PepplotSearchCriteria);
