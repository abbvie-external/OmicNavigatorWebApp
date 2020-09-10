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
} from 'semantic-ui-react';
import { CancelToken } from 'axios';
// import DOMPurify from 'dompurify';
import '../Shared/SearchCriteria.scss';
import { phosphoprotService } from '../../services/phosphoprot.service';
import DifferentialMultisetFilters from './DifferentialMultisetFilters';

let cancelRequestGetReportLinkDifferential = () => {};
let cancelRequestPSCGetResultsTable = () => {};
let cancelRequestMultisetInferenceData = () => {};
let cancelRequestInferenceMultisetPlot = () => {};
class DifferentialSearchCriteria extends Component {
  state = {
    differentialStudies: [],
    differentialStudyHrefVisible: false,
    differentialStudyHref: '',
    differentialModels: [],
    differentialTests: [],
    differentialModelTooltip: '',
    differentialTestTooltip: '',
    differentialStudiesDisabled: true,
    differentialModelsDisabled: true,
    differentialTestsDisabled: true,
    uAnchorP: '',
    selectedColP: [],
    selectedOperatorP: [
      {
        key: '<',
        text: '<',
        value: '<',
      },
    ],
    sigValueP: [0.05],
    reloadPlotP: true,
    uSettingsP: {
      defaultselectedColP: [],
      defaultselectedOperatorP: {
        key: '<',
        text: '<',
        value: '<',
      },
      defaultSigValueP: [0.05],
      useAnchorP: true,
      hoveredFilter: -1,
      mustP: [],
      notP: [],
      displayMetaDataP: true,
      templateName: 'differential-multiset',
      numElementsP: 0,
      maxElementsP: 0,
      indexFiltersP: [0],
      metaSvgP: '',
      heightScalarP: 1,
      thresholdOperatorP: [
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
        {
          key: '|<|',
          text: '|<|',
          value: '|<|',
        },
        {
          key: '|>|',
          text: '|>|',
          value: '|>|',
        },
      ],
    },
    multisetFiltersVisibleP: false,
    activateMultisetFiltersP: false,
    uDataP: [],
    initialRenderP: true,
    // loadingDifferentialMultisetFilters: false,
  };

  componentDidMount() {
    this.setState({
      differentialStudiesDisabled: false,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.allStudiesMetadata !== prevProps.allStudiesMetadata ||
      this.props.differentialStudy !== prevProps.differentialStudy ||
      (this.props.featureToHighlightInDiffTable !==
        prevProps.featureToHighlightInDiffTable &&
        this.props.featureToHighlightInDiffTable !== '')
    ) {
      this.populateDropdowns();
    }
  }

  populateDropdowns = () => {
    const {
      allStudiesMetadata,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      onSearchCriteriaChange,
      onSearchTransitionDifferential,
    } = this.props;
    const studies = allStudiesMetadata.map(study => {
      const studyName = study.name;
      return {
        key: `${studyName}Differential`,
        text: studyName,
        value: studyName,
      };
    });
    this.setState({
      differentialStudies: studies,
    });
    if (differentialStudy !== '') {
      // loop through allStudiesMetadata to find the object with the name matching differentialStudy
      const allStudiesMetadataCopy = [...allStudiesMetadata];
      const differentialStudyData = allStudiesMetadataCopy.find(
        study => study.name === differentialStudy,
      );
      const differentialModelsAndTestsVar =
        differentialStudyData?.results || [];
      this.props.onSetStudyModelTestMetadata(
        differentialStudyData,
        differentialModelsAndTestsVar,
      );
      const differentialModelsMapped = differentialModelsAndTestsVar.map(
        result => {
          return {
            key: `${result.modelID}Differential`,
            text: result.modelID,
            value: result.modelID,
          };
        },
      );

      this.setState({
        differentialModelsDisabled: false,
        differentialModels: differentialModelsMapped,
      });
      this.getReportLink(differentialStudy, 'default');
      if (differentialModel !== '') {
        this.props.onHandlePlotTypesDifferential(differentialModel);
        const differentialModelWithTests = differentialModelsAndTestsVar.find(
          model => model.modelID === differentialModel,
        );
        const differentialModelTooltip =
          differentialModelWithTests?.modelDisplay || '';
        this.setState({
          differentialModelTooltip: differentialModelTooltip,
        });
        const differentialTestsMetadataVar =
          differentialModelWithTests?.tests || [];
        const differentialTestsMapped = differentialTestsMetadataVar.map(
          test => {
            return {
              key: `${test.testID}Differential`,
              text: test.testID,
              value: test.testID,
            };
          },
        );
        const uDataPMapped = differentialTestsMetadataVar.map(t => t.testID);
        this.setState({
          differentialTestsDisabled: false,
          differentialTests: differentialTestsMapped,
          uDataP: uDataPMapped,
        });
        this.props.onSetTestsMetadata(differentialTestsMetadataVar);
        this.getReportLink(differentialStudy, differentialModel);
        if (differentialTest !== '') {
          onSearchTransitionDifferential(true);
          phosphoprotService
            .getResultsTable(
              differentialStudy,
              differentialModel,
              differentialTest,
              onSearchTransitionDifferential,
            )
            .then(getResultsTableData => {
              this.handleGetResultsTableData(
                getResultsTableData,
                true,
                true,
                differentialTest,
              );
            })
            .catch(error => {
              console.error('Error during getResultsTable', error);
            });
          onSearchCriteriaChange(
            {
              differentialStudy: differentialStudy,
              differentialModel: differentialModel,
              differentialTest: differentialTest,
              differentialFeature: differentialFeature,
            },
            false,
          );
          const differentialTestMeta = differentialTestsMetadataVar.find(
            test => test.testID === differentialTest,
          );
          const differentialTestTooltip =
            differentialTestMeta?.testDisplay || '';
          this.setState({
            differentialTestTooltip,
            uAnchorP: differentialTest,
          });
          // if (differentialFeature !== '') {
          //   this.props.onGetPlot(differentialFeature, true);
          // }
        }
      }
    }
  };

  handleStudyChange = (evt, { name, value }) => {
    const { onSearchCriteriaChange, onSearchCriteriaReset } = this.props;
    onSearchCriteriaChange(
      {
        [name]: value,
        differentialModel: '',
        differentialTest: '',
      },
      true,
    );
    onSearchCriteriaReset({
      isValidSearchDifferential: false,
    });
    this.setState({
      differentialStudyHrefVisible: false,
      differentialModelsDisabled: true,
      differentialTestsDisabled: true,
      differentialModelTooltip: '',
      differentialTestTooltip: '',
    });
    this.getReportLink(value, 'default');
  };

  getReportLink = (study, model) => {
    cancelRequestGetReportLinkDifferential();
    let cancelToken = new CancelToken(e => {
      cancelRequestGetReportLinkDifferential = e;
    });
    phosphoprotService
      .getReportLink(study, model, null, cancelToken)
      .then(getReportLink => {
        const link = getReportLink.includes('http')
          ? getReportLink
          : // : `***REMOVED***/ocpu/library/${getReportLink}`;
            `${this.props.baseUrl}/ocpu/library/${getReportLink}`;
        this.setState({
          differentialStudyHrefVisible: true,
          differentialStudyHref: link,
        });
      })
      .catch(error => {
        console.error('Error during getReportLink', error);
      });
  };

  handleModelChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      onSearchCriteriaChange,
      onSearchCriteriaReset,
      differentialModelsAndTests,
    } = this.props;
    this.props.onHandlePlotTypesDifferential(value);
    onSearchCriteriaChange(
      {
        differentialStudy: differentialStudy,
        [name]: value,
        differentialTest: '',
      },
      true,
    );
    onSearchCriteriaReset({
      isValidSearchDifferential: false,
    });
    const differentialModelsAndTestsCopy = [...differentialModelsAndTests];
    const differentialModelWithTests = differentialModelsAndTestsCopy.find(
      model => model.modelID === value,
    );
    const differentialModelTooltip =
      differentialModelWithTests?.modelDisplay || '';
    const differentialTestsMetadataVar =
      differentialModelWithTests?.tests || [];
    const differentialTestsMapped = differentialTestsMetadataVar.map(test => {
      return {
        key: test.testID,
        text: test.testID,
        value: test.testID,
      };
    });
    const uDataP = differentialTestsMetadataVar.map(t => t.testID);
    this.setState({
      differentialTestsDisabled: false,
      differentialTests: differentialTestsMapped,
      uDataP: uDataP,
      differentialModelTooltip: differentialModelTooltip,
      differentialTestTooltip: '',
    });
    this.props.onSetTestsMetadata(differentialTestsMetadataVar);
    this.getReportLink(differentialStudy, value);
  };

  handleTestChange = (evt, { name, value }) => {
    const {
      differentialStudy,
      differentialModel,
      onMultisetQueriedP,
      onSearchCriteriaChange,
      onSearchTransitionDifferential,
    } = this.props;
    onSearchTransitionDifferential(true);
    onMultisetQueriedP(false);
    const differentialTestMeta = this.props.differentialTestsMetadata.find(
      test => test.testID === value,
    );
    const differentialTestTooltip = differentialTestMeta?.testDisplay || '';
    this.setState({
      differentialTestTooltip: differentialTestTooltip,
      reloadPlotP: true,
      multisetFiltersVisibleP: false,
      sigValP: this.state.uSettingsP.defaultSigValueP,
    });
    onSearchCriteriaChange(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
    );
    cancelRequestPSCGetResultsTable();
    let cancelToken = new CancelToken(e => {
      cancelRequestPSCGetResultsTable = e;
    });
    phosphoprotService
      .getResultsTable(
        differentialStudy,
        differentialModel,
        value,
        onSearchTransitionDifferential,
        cancelToken,
      )
      .then(getResultsTableData => {
        this.handleGetResultsTableData(getResultsTableData, true, true, value);
      })
      .catch(error => {
        console.error('Error during getResultsTable', error);
      });
  };

  handleGetResultsTableData = (
    tableData,
    resetMultiset,
    handleMaxElements,
    differentialTest,
  ) => {
    const { onDifferentialSearchUnfiltered, onDifferentialSearch } = this.props;
    if (resetMultiset) {
      this.setState({
        uSettingsP: {
          ...this.state.uSettingsP,
          mustP: [],
          notP: [],
          maxElementsP: handleMaxElements ? tableData.length : 0,
        },
        sigValueP: [0.05],
        uAnchorP: differentialTest,
      });
    }
    onDifferentialSearchUnfiltered({ differentialResults: tableData });
    onDifferentialSearch({ differentialResults: tableData });
  };

  handleMultisetToggle = () => {
    return evt => {
      if (this.state.multisetFiltersVisibleP === false) {
        // on toggle open
        this.props.onMultisetQueriedP(true);
        this.props.onSearchTransitionDifferential(true);
        if (this.state.selectedColP.length === 0) {
          const uSetVP = { ...this.state.uSettingsP };
          const defaultCol = this.props.thresholdColsP[0];
          uSetVP.defaultselectedColP = defaultCol;
          this.setState({
            selectedColP: [defaultCol],
            uSettingsP: uSetVP,
          });
        }
        this.setState(
          {
            reloadPlotP: true,
            multisetFiltersVisibleP: true,
          },
          function() {
            this.updateQueryDataP();
          },
        );
      } else {
        // on toggle close
        this.props.onMultisetQueriedP(false);
        this.setState({
          multisetFiltersVisibleP: false,
          reloadPlotP: false,
          initialRenderP: true,
        });
        const differentialTestName = 'differentialTest';
        const differentialTestVar = this.props.differentialTest;
        this.multisetTriggeredTestChange(
          differentialTestName,
          differentialTestVar,
        );
      }
    };
  };

  handleMultisetPOpenError = () => {
    cancelRequestInferenceMultisetPlot();
    this.setState({
      multisetFiltersVisibleP: false,
    });
    console.log('Error during getResultsIntersection');
  };

  handleMultisetPCloseError = () => {
    this.props.onSearchTransitionDifferential(false);
    this.props.onHandleDifferentialTableLoading(false);
    this.props.onHandleVolcanoTableLoading(false);
    this.setState(
      {
        multisetFiltersVisibleP: true,
        reloadPlotP: true,
      },
      this.updateQueryDataP(),
    );
    console.log('Error during getResultsTable');
  };

  multisetTriggeredTestChange = (name, value) => {
    const {
      differentialStudy,
      differentialModel,
      onSearchCriteriaChange,
      onSearchTransitionDifferential,
    } = this.props;
    onSearchTransitionDifferential(true);
    onSearchCriteriaChange(
      {
        differentialStudy: differentialStudy,
        differentialModel: differentialModel,
        [name]: value,
      },
      true,
    );
    cancelRequestPSCGetResultsTable();
    let cancelToken = new CancelToken(e => {
      cancelRequestPSCGetResultsTable = e;
    });
    phosphoprotService
      .getResultsTable(
        differentialStudy,
        differentialModel,
        value,
        this.handleMultisetPCloseError,
        cancelToken,
      )
      .then(getResultsTableData => {
        this.handleGetResultsTableData(
          getResultsTableData,
          false,
          false,
          value,
        );
      })
      .catch(error => {
        console.error('Error during getResultsTable', error);
      });
  };

  addFilterDifferential = () => {
    this.props.onHandleDifferentialTableLoading(true);
    this.props.onHandleVolcanoTableLoading(true);
    // this.setState({ loadingDifferentialMultisetFilters: true });
    // const uSetVP = _.cloneDeep(this.state.uSettingsP);
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...this.state.uSettingsP.indexFiltersP].concat(
      this.state.uSettingsP.indexFiltersP.length,
    );
    this.setState({
      selectedColP: [...this.state.selectedColP].concat(
        this.state.uSettingsP.defaultselectedColP,
      ),
      selectedOperatorP: [...this.state.selectedOperatorP].concat(
        this.state.uSettingsP.defaultselectedOperatorP,
      ),
      sigValueP: [...this.state.sigValueP].concat(
        this.state.uSettingsP.defaultSigValueP,
      ),
      uSettingsP: uSetVP,
    });
  };

  removeFilterDifferential = index => {
    this.props.onHandleDifferentialTableLoading(true);
    this.props.onHandleVolcanoTableLoading(true);
    // this.setState({ loadingDifferentialMultisetFilters: true });
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.indexFiltersP = [...uSetVP.indexFiltersP]
      .slice(0, index)
      .concat([...uSetVP.indexFiltersP].slice(index + 1));
    for (var i = index; i < uSetVP.indexFiltersP.length; i++) {
      uSetVP.indexFiltersP[i]--;
    }
    this.setState(
      {
        selectedColP: [...this.state.selectedColP]
          .slice(0, index)
          .concat([...this.state.selectedColP].slice(index + 1)),
        selectedOperatorP: [...this.state.selectedOperatorP]
          .slice(0, index)
          .concat([...this.state.selectedOperatorP].slice(index + 1)),
        sigValueP: [...this.state.sigValueP]
          .slice(0, index)
          .concat([...this.state.sigValueP].slice(index + 1)),
        uSettingsP: uSetVP,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };
  changeHoveredFilter = index => {
    const uSetVP = { ...this.state.uSettingsP };
    uSetVP.hoveredFilter = index;
    this.setState({ uSettingsP: uSetVP });
  };
  handleDropdownChange = (evt, { name, value, index }) => {
    this.props.onHandleDifferentialTableLoading(true);
    this.props.onHandleVolcanoTableLoading(true);
    const uSelVP = [...this.state[name]];
    uSelVP[index] = {
      key: value,
      text: value,
      value: value,
    };
    this.setState(
      {
        [name]: uSelVP,
        reloadPlotP: false,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };
  handleSigValuePInputChange = (name, value, index) => {
    if (!this.state.initialRenderP) {
      this.props.onHandleDifferentialTableLoading(true);
      this.props.onHandleVolcanoTableLoading(true);
    }
    const uSelVP = [...this.state[name]];
    uSelVP[index] = parseFloat(value);
    this.setState(
      {
        [name]: uSelVP,
        reloadPlotP: true,
        initialRenderP: false,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };
  handleSetChange = ({ mustP, notP }) => {
    this.props.onHandleDifferentialTableLoading(true);
    this.props.onHandleVolcanoTableLoading(true);
    const uSettingsVP = this.state.uSettingsP;
    uSettingsVP.mustP = mustP;
    uSettingsVP.notP = notP;
    this.setState(
      {
        uSettingsP: uSettingsVP,
        reloadPlotP: false,
      },
      function() {
        this.updateQueryDataP();
      },
    );
  };

  updateQueryDataP = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      onDifferentialSearch,
      onDisablePlot,
    } = this.props;
    const {
      selectedOperatorP,
      reloadPlotP,
      sigValueP,
      selectedColP,
      differentialTests,
    } = this.state;
    const eMustP = this.state.uSettingsP.mustP;
    const eNotP = this.state.uSettingsP.notP;
    if (reloadPlotP === true && differentialTests.length > 1) {
      onDisablePlot();
      this.getMultisetPlot(
        sigValueP,
        differentialModel,
        differentialStudy,
        this.jsonToList(selectedOperatorP),
        this.jsonToList(selectedColP),
      );
    }
    cancelRequestMultisetInferenceData();
    let cancelToken = new CancelToken(e => {
      cancelRequestMultisetInferenceData = e;
    });
    phosphoprotService
      .getResultsIntersection(
        differentialStudy,
        differentialModel,
        differentialTest,
        eMustP,
        eNotP,
        sigValueP,
        this.jsonToList(selectedOperatorP),
        this.jsonToList(selectedColP),
        this.handleMultisetPOpenError,
        cancelToken,
      )
      .then(inferenceData => {
        const multisetResultsP = inferenceData;
        this.setState({
          uSettingsP: {
            ...this.state.uSettingsP,
            numElementsP: multisetResultsP.length,
            maxElementsP: this.state.uSettingsP.maxElementsP,
            mustP: eMustP,
            notP: eNotP,
          },
          activateMultisetFiltersP: true,
          reloadPlotP: false,
          // loadingDifferentialMultisetFilters: false,
        });
        onDifferentialSearch({
          differentialResults: multisetResultsP,
        });
      })
      .catch(error => {
        console.error('Error during getResultsIntersection', error);
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
    differentialModel,
    differentialStudy,
    eOperatorP,
    eColP,
  ) {
    cancelRequestInferenceMultisetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestInferenceMultisetPlot = e;
    });
    phosphoprotService
      .getResultsUpset(
        differentialStudy,
        differentialModel,
        sigVal,
        eOperatorP,
        eColP,
        undefined,
        cancelToken,
      )
      .then(svgMarkupRaw => {
        let svgMarkup = svgMarkupRaw.data;
        svgMarkup = svgMarkup.replace(
          /<svg/g,
          '<svg preserveAspectRatio="xMinYMid meet" height="100%" width="inherit" id="multisetAnalysisSVG"',
        );
        // DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        //   if (
        //     node.hasAttribute('xlink:href') &&
        //     !node.getAttribute('xlink:href').match(/^#/)
        //   ) {
        //     node.remove();
        //   }
        // });
        // // Clean HTML string and write into our DIV
        // let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
        //   ADD_TAGS: ['use'],
        // });
        // let svgInfo = { plotType: 'Multiset', svg: sanitizedSVG };
        let svgInfo = { plotType: 'Multiset', svg: svgMarkup };
        this.props.onGetMultisetPlot({
          svgInfo,
        });
      })
      .catch(error => {
        console.error('Error during getResultsUpset', error);
      });
  }

  render() {
    const {
      differentialStudies,
      differentialStudyHref,
      differentialStudyHrefVisible,
      differentialModels,
      differentialModelTooltip,
      differentialTests,
      differentialTestTooltip,
      differentialStudiesDisabled,
      differentialModelsDisabled,
      differentialTestsDisabled,
      multisetFiltersVisibleP,
      activateMultisetFiltersP,
    } = this.state;

    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      isValidSearchDifferential,
      multisetPlotAvailable,
      plotButtonActive,
    } = this.props;

    const StudyPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      fontSize: '13px',
    };

    let studyIcon;
    let studyName = `${differentialStudy} Analysis Details`;

    if (differentialStudyHrefVisible) {
      studyIcon = (
        <Popup
          trigger={
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={differentialStudyHref}
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
          className="CustomTooltip"
          inverted
          basic
          position="bottom center"
          content={studyName}
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
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
          className="CustomTooltip"
          position="bottom center"
          content="Select a study and model to view Analysis Details"
          mouseEnterDelay={0}
          mouseLeaveDelay={0}
        />
      );
    }

    let PMultisetFilters;
    if (
      isValidSearchDifferential &&
      activateMultisetFiltersP &&
      multisetFiltersVisibleP
    ) {
      PMultisetFilters = (
        <DifferentialMultisetFilters
          {...this.props}
          {...this.state}
          onHandleDropdownChange={this.handleDropdownChange}
          onHandleSigValuePInputChange={this.handleSigValuePInputChange}
          onHandleSetChange={this.handleSetChange}
          onAddFilterDifferential={this.addFilterDifferential}
          onRemoveFilterDifferential={this.removeFilterDifferential}
          onChangeHoveredFilter={this.changeHoveredFilter}
        />
      );
    }

    let PlotRadio;
    let MultisetRadio;

    if (isValidSearchDifferential) {
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
            checked={multisetFiltersVisibleP}
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
            name="differentialStudy"
            value={differentialStudy}
            options={differentialStudies}
            placeholder="Select A Study"
            onChange={this.handleStudyChange}
            disabled={differentialStudiesDisabled}
            label={{
              children: 'Study',
              htmlFor: 'form-select-control-pstudy',
            }}
            search
            searchInput={{ id: 'form-select-control-pstudy' }}
            width={13}
            selectOnBlur={false}
            selectOnNavigation={false}
          />
          <span className="StudyHtmlIconDivP">{studyIcon}</span>
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="differentialModel"
                value={differentialModel}
                options={differentialModels}
                placeholder="Select Model"
                onChange={this.handleModelChange}
                disabled={differentialModelsDisabled}
                label={{
                  children: 'Model',
                  htmlFor: 'form-select-control-pmodel',
                }}
                search
                searchInput={{ id: 'form-select-control-pmodel' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={differentialModelTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialModelTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
          <Popup
            trigger={
              <Form.Field
                control={Select}
                name="differentialTest"
                value={differentialTest}
                options={differentialTests}
                placeholder="Select Test"
                onChange={this.handleTestChange}
                disabled={differentialTestsDisabled}
                label={{
                  children: 'Test',
                  htmlFor: 'form-select-control-ptest',
                }}
                search
                searchInput={{ id: 'form-select-control-ptest' }}
                selectOnBlur={false}
                selectOnNavigation={false}
              />
            }
            style={StudyPopupStyle}
            disabled={differentialTestTooltip === ''}
            className="CustomTooltip"
            inverted
            position="bottom right"
            content={differentialTestTooltip}
            mouseEnterDelay={1000}
            mouseLeaveDelay={0}
          />
        </Form>
        <div className="MultisetContainer">
          <div className="SliderDiv">
            <span className="MultisetRadio">{MultisetRadio}</span>
            <span className="PlotRadio">{PlotRadio}</span>
          </div>
          <div className="MultisetFiltersDiv">{PMultisetFilters}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(DifferentialSearchCriteria);
