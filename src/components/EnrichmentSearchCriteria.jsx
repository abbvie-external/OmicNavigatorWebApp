import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Form,
  Select,
  Icon,
  Popup,
  Divider,
  Radio,
  Transition,
  Button
} from 'semantic-ui-react';
import './SearchCriteria.scss';
import { phosphoprotService } from '../services/phosphoprot.service';
import _ from 'lodash';
import UpSetFilters from './UpSetFilters';

class EnrichmentSearchCriteria extends Component {
  static defaultProps = {
    tab: 'enrichment',
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    pValueType: 'nomimal',
    isValidSearchEnrichment: false,
    isSearching: false,
    upsetPlotAvailable: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActive: false,
    uData: []
  };

  constructor(props) {
    super(props);
    this.state = {
      enrichmentStudies: [],
      enrichmentStudyHrefVisible: false,
      enrichmentStudyHref: '',
      enrichmentModels: [],
      enrichmentAnnotations: [],
      enrichmentStudiesDisabled: false,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true,
      uAnchor: '',
      selectedCol: {
        key: 'adj_P_Val',
        text: 'Adjusted P Value',
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
          text: 'Adjusted P Value',
          value: 'adj_P_Val'
        },
        defaultSelectedOperator: {
          key: '<',
          text: '<',
          value: '<'
        },
        defaultSigValue: 0.05,
        useAnchor: false,
        must: [],
        not: [],
        displayMetaData: true,
        templateName: 'enrichment-upset',
        numElements: undefined,
        maxElements: undefined,
        metaSvg: '',
        heightScalar: 1,
        thresholdCols: [
          {
            key: 'adj_P_Val',
            text: 'Adjusted P Value',
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
      activateUpSetFilters: false
    };
  }

  componentDidMount() {
    const s = this.props.enrichmentStudy || '';
    const m = this.props.enrichmentModel || '';
    const a = this.props.enrichmentAnnotation || '';
    const t = this.props.pValueType || 'nominal';

    if (s !== '') {
      this.setState({
        enrichmentStudyHrefVisible: true,
        enrichmentStudyHref: `${s}.html`
      });
      phosphoprotService
        .getModelNames('EnrichmentNames', s + 'plots')
        .then(modelsFromService => {
          this.allNames = modelsFromService;
          const modelsArr = _.map(_.keys(modelsFromService), function(
            modelName
          ) {
            return { key: modelName, text: modelName, value: modelName };
          });
          this.setState({
            enrichmentModelsDisabled: false,
            enrichmentModels: modelsArr
          });
          if (m !== '') {
            const annotationsArr = _.map(this.allNames[m], function(
              annotationName
            ) {
              return {
                key: annotationName,
                text: annotationName,
                value: annotationName
              };
            });
            this.setState({
              enrichmentAnnotationsDisabled: false,
              enrichmentAnnotations: annotationsArr
            });
          }
        });
    }

    if (a !== '') {
      this.props.onSearchCriteriaChange(
        {
          enrichmentStudy: s,
          enrichmentModel: m,
          enrichmentAnnotation: a
        },
        false
      );
      this.props.onSearchTransition();
      phosphoprotService
        .getAnnotationData(m, a, s + 'plots', t)
        .then(dataFromService => {
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              maxElements: dataFromService.length
            }
          });
          this.annotationdata = dataFromService;
          this.props.onEnrichmentSearch({
            enrichmentResults: this.annotationdata
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
        enrichmentStudies: studiesArr
      });
    });
  };

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      enrichmentStudyHrefVisible: true,
      enrichmentStudyHref: `http://www.localhost:3000/${value}.html`,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true
    });
    this.props.onSearchCriteriaChange(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: ''
      },
      true
    );
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
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: ''
      },
      true
    );
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
      enrichmentAnnotationsDisabled: false,
      enrichmentAnnotations: annotationsArr
    });
  };

  handleAnnotationChange = (evt, { name, value }) => {
    this.setState({
      upsetFiltersVisible: false
    });
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value
      },
      true
    );
    this.props.onSearchTransition();
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType
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
          sigValue: 0.05
        });
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
        });
      });
  };

  handlePValueTypeChange = (evt, { value }) => {
    this.props.onSearchTransition();
    this.props.onPValueTypeChange(value);
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        this.props.enrichmentAnnotation,
        this.props.enrichmentStudy + 'plots',
        value
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
          sigValue: 0.05
        });
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
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
        const enrichmentAnnotationName = 'enrichmentAnnotation';
        const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
        this.upsetTriggeredAnnotationChange(
          enrichmentAnnotationName,
          enrichmentAnnotationVar
        );
      }
    };
  };

  upsetTriggeredAnnotationChange = (name, value) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value
      },
      true
    );
    this.props.onSearchTransition();
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType
      )
      .then(dataFromService => {
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata
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
    this.setState({
      sigValue: eSigV,
      selectedOperator: eOperator,
      selectedCol: eCol
    });
    this.getUpSetPlot(
      eSigV,
      this.props.enrichmentModel,
      this.props.enrichmentStudy + 'plots',
      this.props.enrichmentAnnotation,
      eOperator
    );
    phosphoprotService
      .getUpsetEnrichmentData(
        this.props.enrichmentModel,
        mustString,
        notString,
        this.props.enrichmentStudy + 'plots',
        eSigV,
        this.props.enrichmentAnnotation,
        eOperator.value
      )
      .then(annotationData => {
        const multisetResults = annotationData;
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length,
            maxElements: this.state.uSettings.maxElements,
            must: eMust,
            not: eNot
          },
          activateUpSetFilters: true
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: multisetResults
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

  getUpSetPlot(
    sigVal,
    enrichmentModel,
    enrichmentStudy,
    enrichmentAnnotation,
    eOperator
  ) {
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    phosphoprotService
      .getEnrichmentUpSetPlot(
        sigVal,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation,
        eOperator.value
      )
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
      enrichmentStudies,
      enrichmentStudyHref,
      enrichmentStudyHrefVisible,
      enrichmentModels,
      enrichmentAnnotations,
      enrichmentStudiesDisabled,
      enrichmentModelsDisabled,
      enrichmentAnnotationsDisabled,
      upsetFiltersVisible,
      activateUpSetFilters
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      isValidSearchEnrichment,
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
    if (
      isValidSearchEnrichment &&
      activateUpSetFilters &&
      upsetFiltersVisible
    ) {
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

    if (isValidSearchEnrichment) {
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
            name="enrichmentStudy"
            value={enrichmentStudy}
            options={enrichmentStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={enrichmentStudiesDisabled}
            width={13}
          />
          <span className="StudyHtmlIconDivE">{studyIcon}</span>
          <Form.Field
            control={Select}
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
            name="enrichmentAnnotation"
            value={enrichmentAnnotation}
            options={enrichmentAnnotations}
            placeholder="Select Database"
            onChange={this.handleAnnotationChange}
            disabled={enrichmentAnnotationsDisabled}
            label={{
              children: 'Database',
              htmlFor: 'form-select-control-test'
            }}
            search
            searchInput={{ id: 'form-select-control-test' }}
          />
          <label
            className={
              enrichmentAnnotationsDisabled ? 'greyText' : 'normalText'
            }
          >
            P Values
          </label>
          <Button.Group className="PValueTypeContainer" size="small">
            <Button
              type="button"
              className="pValueButton"
              value="nominal"
              name="nominal"
              positive={pValueType === 'nominal'}
              onClick={this.handlePValueTypeChange}
              disabled={enrichmentAnnotationsDisabled}
            >
              Nominal
            </Button>
            <Button.Or className="OrCircle" />
            <Button
              type="button"
              className="pValueButton"
              value="adjusted"
              name="adjusted"
              positive={pValueType === 'adjusted'}
              onClick={this.handlePValueTypeChange}
              disabled={enrichmentAnnotationsDisabled}
            >
              Adjusted
            </Button>
          </Button.Group>
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

export default withRouter(EnrichmentSearchCriteria);
