import React, { Component } from 'react';
import {
  Form,
  Select,
  Icon,
  Popup,
  Divider,
  Radio,
  Transition,
  Button,
} from 'semantic-ui-react';
import { CancelToken } from 'axios';
import '../Shared/SearchCriteria.scss';
import { phosphoprotService } from '../../services/phosphoprot.service';
import _ from 'lodash';
// import { toast } from 'react-toastify';
import EnrichmentMultisetFilters from './EnrichmentMultisetFilters';

let cancelRequestAnnotationData = () => {};
let cancelRequestMultisetEnrichmentData = () => {};
let cancelRequestEnrichmentMultisetPlot = () => {};

class EnrichmentSearchCriteria extends Component {
  // static defaultProps = {
  //   tab: 'enrichment',
  //   enrichmentStudy: '',
  //   enrichmentModel: '',
  //   enrichmentAnnotation: '',
  //   pValueType: 'nomimal',
  //   isValidSearchEnrichment: false,
  //   isSearching: false,
  //   multisetPlotAvailable: false,
  //   animation: 'uncover',
  //   direction: 'left',
  //   visible: false,
  //   plotButtonActive: false,
  //   uData: []
  // };

  state = {
    enrichmentStudies: [],
    enrichmentStudyHrefVisible: false,
    enrichmentStudyHref: '',
    enrichmentModels: [],
    enrichmentAnnotations: [],
    enrichmentResultsErrorCb: this.props.onSearchTransition || undefined,
    enrichmentStudiesDisabled: false,
    enrichmentModelsDisabled: true,
    enrichmentAnnotationsDisabled: true,
    uAnchor: '',
    selectedCol: [
      {
        key: 'adj_P_Val',
        text: 'Adjusted P Value',
        value: 'adj_P_Val',
      },
    ],
    selectedOperator: [
      {
        key: '<',
        text: '<',
        value: '<',
      },
    ],
    sigValue: [0.05],
    uSettings: {
      defaultSelectedCol: {
        key: 'adj_P_Val',
        text: 'Adjusted P Value',
        value: 'adj_P_Val',
      },
      defaultSelectedOperator: {
        key: '<',
        text: '<',
        value: '<',
      },
      defaultSigValue: 0.05,
      useAnchor: false,
      hoveredFilter: -1,
      indexFilters: [0],
      must: [],
      not: [],
      displayMetaData: true,
      templateName: 'enrichment-multiset',
      numElements: undefined,
      maxElements: undefined,
      metaSvg: '',
      heightScalar: 1,
      thresholdCols: [
        {
          key: 'adj_P_Val',
          text: 'adj_P_Val',
          value: 'adj_P_Val',
        },
      ],
      thresholdOperator: [
        {
          key: '<',
          text: '<',
          value: '<',
        },
        {
          key: '>',
          text: '>',
          value: '>',
        },
      ],
    },
    multisetFiltersVisible: false,
    activateMultisetFilters: false,
  };

  componentDidMount() {
    const s = this.props.enrichmentStudy || '';
    const m = this.props.enrichmentModel || '';
    const a = this.props.enrichmentAnnotation || '';
    const t = this.props.pValueType || 'nominal';
    const d = this.props.enrichmentDescriptionAndTest || '';

    if (s !== '') {
      this.setState({
        enrichmentStudyHrefVisible: true,
        enrichmentStudyHref: `http://www.localhost:3000/${s}.html`,
      });
      phosphoprotService
        .getModelNames('EnrichmentNames', s + 'plots')
        .then(modelsFromService => {
          this.allNames = modelsFromService;
          const modelsArr = _.map(_.keys(modelsFromService), function(
            modelName,
          ) {
            return { key: modelName, text: modelName, value: modelName };
          });
          this.setState({
            enrichmentModelsDisabled: false,
            enrichmentModels: modelsArr,
          });
          if (m !== '') {
            const annotationsArr = _.map(this.allNames[m], function(
              annotationName,
            ) {
              return {
                key: annotationName,
                text: annotationName,
                value: annotationName,
              };
            });
            this.setState({
              enrichmentAnnotationsDisabled: false,
              enrichmentAnnotations: annotationsArr,
            });
          }
        });
    }

    if (a !== '') {
      this.props.onSearchCriteriaChange(
        {
          enrichmentStudy: s,
          enrichmentModel: m,
          enrichmentAnnotation: a,
          enrichmentDescriptionAndTest: d,
        },
        false,
      );
      this.props.onSearchTransition(true);
      phosphoprotService
        .getAnnotationData(
          m,
          a,
          s + 'plots',
          t,
          this.state.enrichmentResultsErrorCb,
          undefined,
        )
        .then(dataFromService => {
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              maxElements: dataFromService.length,
            },
          });
          this.annotationdata = dataFromService;
          this.props.onEnrichmentSearch({
            enrichmentResults: this.annotationdata,
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
        enrichmentStudies: studiesArr,
      });
    });
  };

  handleStudyChange = (evt, { name, value }) => {
    this.setState({
      enrichmentStudyHrefVisible: true,
      enrichmentStudyHref: `http://www.localhost:3000/${value}.html`,
      enrichmentModelsDisabled: true,
      enrichmentAnnotationsDisabled: true,
    });
    this.props.onSearchCriteriaChange(
      {
        [name]: value,
        enrichmentModel: '',
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false,
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
          enrichmentModels: modelsArr,
        });
      });
  };

  handleModelChange = (evt, { name, value }) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        [name]: value,
        enrichmentAnnotation: '',
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchCriteriaReset({
      isValidSearchEnrichment: false,
    });
    const annotationsArr = _.map(this.allNames[value], function(
      annotationName,
    ) {
      return {
        key: annotationName,
        text: annotationName,
        value: annotationName,
      };
    });
    this.setState({
      enrichmentAnnotationsDisabled: false,
      enrichmentAnnotations: annotationsArr,
    });
  };

  handleAnnotationChange = (evt, { name, value }) => {
    this.setState({
      multisetFiltersVisible: false,
    });
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchTransition(true);
    cancelRequestAnnotationData();
    let cancelToken = new CancelToken(e => {
      cancelRequestAnnotationData = e;
    });
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType,
        this.state.enrichmentResultsErrorCb,
        cancelToken,
      )
      .then(dataFromService => {
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            must: [],
            not: [],
            defaultSigValue: 0.05,
            maxElements: dataFromService.length,
          },
          sigValue: [0.05],
        });
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata,
        });
      });
  };

  handlePValueTypeChange = (evt, { value }) => {
    this.props.onSearchTransition(true);
    this.props.onPValueTypeChange(value);

    if (!this.state.multisetFiltersVisible) {
      cancelRequestAnnotationData();
      let cancelToken = new CancelToken(e => {
        cancelRequestAnnotationData = e;
      });
      phosphoprotService
        .getAnnotationData(
          this.props.enrichmentModel,
          this.props.enrichmentAnnotation,
          this.props.enrichmentStudy + 'plots',
          value,
          this.state.enrichmentResultsErrorCb,
          cancelToken,
        )
        .then(dataFromService => {
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              // must: [],
              // not: [],
              // defaultSigValue: 0.05,
              maxElements: dataFromService.length,
            },
            // sigValue: 0.05
          });
          this.annotationdata = dataFromService;
          this.props.onEnrichmentSearch({
            enrichmentResults: this.annotationdata,
          });
        });
    } else {
      const eSigV = this.state.sigValue;
      const eMust = this.state.uSettings.must;
      const eNot = this.state.uSettings.not;
      const eOperator = this.state.selectedOperator;
      console.log(value);
      this.getMultisetPlot(
        eSigV,
        this.props.enrichmentModel,
        this.props.enrichmentStudy + 'plots',
        this.props.enrichmentAnnotation,
        this.jsonToList(eOperator),
        value,
      );
      cancelRequestMultisetEnrichmentData();
      let cancelToken = new CancelToken(e => {
        cancelRequestMultisetEnrichmentData = e;
      });
      phosphoprotService
        .getMultisetEnrichmentData(
          this.props.enrichmentModel,
          eMust,
          eNot,
          this.props.enrichmentStudy + 'plots',
          eSigV,
          this.props.enrichmentAnnotation,
          this.jsonToList(eOperator),
          value,
          undefined,
          cancelToken,
        )
        .then(annotationData => {
          const multisetResults = annotationData;
          this.setState({
            uSettings: {
              ...this.state.uSettings,
              numElements: multisetResults.length,
              maxElements: this.state.uSettings.maxElements,
              must: eMust,
              not: eNot,
            },
            activateMultisetFilters: true,
          });
          this.props.onEnrichmentSearch({
            enrichmentResults: multisetResults,
          });
        });
    }
  };

  handleMultisetToggle = () => {
    return evt => {
      if (this.state.multisetFiltersVisible === false) {
        this.setState({
          multisetFiltersVisible: true,
        });
        this.updateQueryData({
          must: this.state.uSettings.must,
          not: this.state.uSettings.not,
          sigValue: this.state.sigValue,
          selectedCol: this.state.selectedCol,
          selectedOperator: this.state.selectedOperator,
        });
      } else {
        this.setState({
          multisetFiltersVisible: false,
        });
        const enrichmentAnnotationName = 'enrichmentAnnotation';
        const enrichmentAnnotationVar = this.props.enrichmentAnnotation;
        this.multisetTriggeredAnnotationChange(
          enrichmentAnnotationName,
          enrichmentAnnotationVar,
        );
      }
    };
  };

  multisetTriggeredAnnotationChange = (name, value) => {
    this.props.onSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy,
        enrichmentModel: this.props.enrichmentModel,
        [name]: value,
        enrichmentDescriptionAndTest: '',
      },
      true,
    );
    this.props.onSearchTransition(true);
    cancelRequestAnnotationData();
    let cancelToken = new CancelToken(e => {
      cancelRequestAnnotationData = e;
    });
    phosphoprotService
      .getAnnotationData(
        this.props.enrichmentModel,
        value,
        this.props.enrichmentStudy + 'plots',
        this.props.pValueType,
        this.state.enrichmentResultsErrorCb,
        cancelToken,
      )
      .then(dataFromService => {
        this.annotationdata = dataFromService;
        this.props.onEnrichmentSearch({
          enrichmentResults: this.annotationdata,
        });
      });
  };
  addFilter = () => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.indexFilters = [...this.state.uSettings.indexFilters].concat(
      this.state.uSettings.indexFilters.length,
    );

    this.setState({
      selectedCol: [...this.state.selectedCol].concat(
        this.state.uSettings.defaultSelectedCol,
      ),
      selectedOperator: [...this.state.selectedOperator].concat(
        this.state.uSettings.defaultSelectedOperator,
      ),
      sigValue: [...this.state.sigValue].concat(
        this.state.uSettings.defaultSigValue,
      ),
      uSettings: uSetVP,
    });
  };
  removeFilter = index => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.indexFilters = [...uSetVP.indexFilters]
      .slice(0, index)
      .concat([...uSetVP.indexFilters].slice(index + 1));
    for (var i = index; i < uSetVP.indexFilters.length; i++) {
      uSetVP.indexFilters[i]--;
    }
    this.setState({
      selectedCol: [...this.state.selectedCol]
        .slice(0, index)
        .concat([...this.state.selectedCol].slice(index + 1)),
      selectedOperator: [...this.state.selectedOperator]
        .slice(0, index)
        .concat([...this.state.selectedOperator].slice(index + 1)),
      sigValue: [...this.state.sigValue]
        .slice(0, index)
        .concat([...this.state.sigValue].slice(index + 1)),
      uSettings: uSetVP,
    });
  };
  changeHoveredFilter = index => {
    const uSetVP = { ...this.state.uSettings };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettings: uSetVP });
  };
  handleDropdownChange = (evt, { name, value, index }) => {
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState(
      {
        [name]: uSelVP,
        reloadPlot: false
      },
      function() {
        this.updateQueryData();
      },
    );
  };
  handleInputChange = (evt, { name, value, index }) => {
    const uSelVP = [...this.state[name]];
    uSelVP[index] = parseFloat(value);
    this.setState(
      {
        [name]: uSelVP,
        reloadPlot: true,
      },
      function() {
        this.updateQueryData();
      },
    );
  };
  handleSetChange = ({ must, not }) => {
    const uSettingsVP = this.state.uSettings;
    uSettingsVP.must = must;
    uSettingsVP.not = not;
    this.setState(
      {
        uSettings: uSettingsVP,
        reloadPlot: false,
      },
      function() {
        this.updateQueryData();
      },
    );
  };

  updateQueryData = () => {
    this.props.onDisablePlot();
    const eSigV = this.state.sigValue;
    const eMust = this.state.uSettings.must;
    const eNot = this.state.uSettings.not;
    const eOperator = this.state.selectedOperator;

    this.getMultisetPlot(
      eSigV,
      this.props.enrichmentModel,
      this.props.enrichmentStudy + 'plots',
      this.props.enrichmentAnnotation,
      this.jsonToList(eOperator),
      this.props.pValueType,
    );
    cancelRequestMultisetEnrichmentData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetEnrichmentData = e;
    });
    phosphoprotService
      .getMultisetEnrichmentData(
        this.props.enrichmentModel,
        eMust,
        eNot,
        this.props.enrichmentStudy + 'plots',
        eSigV,
        this.props.enrichmentAnnotation,
        this.jsonToList(eOperator),
        this.props.pValueType,
        undefined,
        cancelToken,
      )
      .then(annotationData => {
        const multisetResults = annotationData;
        this.setState({
          uSettings: {
            ...this.state.uSettings,
            numElements: multisetResults.length,
            maxElements: this.state.uSettings.maxElements,
            must: eMust,
            not: eNot,
          },
          activateMultisetFilters: true,
        });
        this.props.onEnrichmentSearch({
          enrichmentResults: multisetResults,
        });
      });
  };
  jsonToList(json) {
    var valueList = [];
    for (var i = 0; i < json.length; i++) {
      valueList.push(json[i].value);
    }
    return valueList;
  }

  getMultisetPlot(
    sigVal,
    enrichmentModel,
    enrichmentStudy,
    enrichmentAnnotation,
    eOperator,
  ) {
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    cancelRequestEnrichmentMultisetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestEnrichmentMultisetPlot = e;
    });
    phosphoprotService
      .getEnrichmentMultisetPlot(
        sigVal,
        enrichmentModel,
        enrichmentStudy,
        enrichmentAnnotation,
        eOperator,
        this.props.pValueType,
        undefined,
        cancelToken,
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
            'px;" id="multisetAnalysisSVG"',
        );
        let svgInfo = { plotType: 'Multiset', svg: svgMarkup };
        this.props.onGetMultisetPlot({
          svgInfo,
        });
      });
  }

  calculateHeight() {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0,
    );
    return h;
  }

  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
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
      multisetFiltersVisible,
      activateMultisetFilters,
    } = this.state;

    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      isValidSearchEnrichment,
      multisetPlotAvailable,
      plotButtonActive,
      isTestDataLoaded,
      activeIndexEnrichmentView 
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
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

    let EMultisetFilters;
    if (
      isValidSearchEnrichment &&
      activateMultisetFilters &&
      multisetFiltersVisible &&
      activeIndexEnrichmentView === 0
    ) {
      EMultisetFilters = (
        <EnrichmentMultisetFilters
          {...this.props}
          {...this.state}
          onHandleDropdownChange={this.handleDropdownChange}
          onHandleInputChange={this.handleInputChange}
          onHandleSetChange={this.handleSetChange}
          onAddFilter={this.addFilter}
          onRemoveFilter={this.removeFilter}
          onChangeHoveredFilter={this.changeHoveredFilter}
        />
      );
    }

    let PlotRadio;
    let MultisetRadio;

    if (isValidSearchEnrichment && activeIndexEnrichmentView === 0) {
      PlotRadio = (
        <Transition
          visible={!multisetPlotAvailable}
          animation="flash"
          duration={1500}
        >
          <Radio
            toggle
            label="View Plot"
            className={multisetPlotAvailable ? 'ViewPlotRadio' : ''}
            checked={plotButtonActive}
            onChange={this.props.onHandlePlotAnimation('uncover')}
            disabled={!multisetPlotAvailable}
          />
        </Transition>
      );
      MultisetRadio = (
         <React.Fragment>
           <Divider />
           <Radio
             toggle
             label="Set Analysis"
             checked={multisetFiltersVisible}
             onChange={this.handleMultisetToggle()}
           />
         </React.Fragment>
       );
    }

    return (
      <React.Fragment>
        <Form className="SearchCriteriaContainer">
          <Form.Field
            control={Select}
            name="enrichmentStudy"
            value={enrichmentStudy}
            options={enrichmentStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={enrichmentStudiesDisabled}
            width={13}
            label={{
              children: 'Study',
              htmlFor: 'form-select-control-estudy',
            }}
            search
            searchInput={{ id: 'form-select-control-estudy' }}
            selectOnBlur={false}
            selectOnNavigation={false}
          />
          <span className="StudyHtmlIconDivE">{studyIcon}</span>
          <Form.Field
            control={Select}
            name="enrichmentModel"
            value={enrichmentModel}
            options={enrichmentModels}
            placeholder="Select Model"
            onChange={this.handleModelChange}
            disabled={enrichmentModelsDisabled}
            label={{
              children: 'Model',
              htmlFor: 'form-select-control-emodel',
            }}
            search
            searchInput={{ id: 'form-select-control-emodel' }}
            selectOnBlur={false}
            selectOnNavigation={false}
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
              htmlFor: 'form-select-control-edatabase',
            }}
            search
            searchInput={{ id: 'form-select-control-edatabase' }}
            selectOnBlur={false}
            selectOnNavigation={false}
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
        <div
          className={
            !isTestDataLoaded
              ? 'ShowBlock MultisetContainer'
              : 'Hide MultisetContainer'
          }
        >
          <div className="SliderDiv">
            <span className="MultisetRadio">{MultisetRadio}</span>
            <span className="PlotRadio">{PlotRadio}</span>
          </div>
          <div className="MultisetFiltersDiv">{EMultisetFilters}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default EnrichmentSearchCriteria;
