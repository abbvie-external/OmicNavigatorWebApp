import React, { Component } from 'react';
import { Grid, Menu, Popup, Sidebar, Tab } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import DifferentialSearchCriteria from './DifferentialSearchCriteria';
import VolcanoPlotIcon from '../../resources/VolcanoPlotIcon.png';
import VolcanoPlotIconSelected from '../../resources/VolcanoPlotIconSelected.png';
import tableIcon from '../../resources/tableIcon.png';
import tableIconSelected from '../../resources/tableIconSelected.png';
import DifferentialPlot from './DifferentialPlot';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import ButtonActions from '../Shared/ButtonActions';
import {
  formatNumberForDisplay,
  splitValue,
  getLinkout,
  scrollElement,
} from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';
import DOMPurify from 'dompurify';
import { omicNavigatorService } from '../../services/omicNavigator.service';
import DifferentialVolcano from './DifferentialVolcano';
import { CancelToken } from 'axios';
import _ from 'lodash';
import './Differential.scss';
import '../Shared/Table.scss';
// eslint-disable-next-line no-unused-vars
import QHGrid, { EZGrid } from '***REMOVED***';
import '***REMOVED***/dist/index.css';

let cancelRequestDifferentialResultsGetPlot = () => {};
class Differential extends Component {
  defaultActiveIndexDifferentialView =
    parseInt(sessionStorage.getItem('differentialViewTab'), 10) || 0;

  static defaultProps = {
    differentialStudy: '',
    differentialModel: '',
    differentialTest: '',
    differentialFeature: '',
  };

  state = {
    isValidSearchDifferential: false,
    isSearchingDifferential: false,
    isDifferentialTableLoading: false,
    isVolcanoTableLoading: false,
    // differentialResults: [],
    // differentialResultsMounted: false,
    // differentialResultsUnfiltered: [],
    /**
     * @type {QHGrid.ColumnConfig[]}
     */
    // differentialColumns: [],
    filterableColumnsP: [],
    multisetPlotInfo: {
      title: '',
      svg: [],
    },
    isItemSelected: false,
    isProteinSVGLoaded: false,
    // isProteinDataLoaded: false,
    // HighlightedFeaturesArrVolcano: [],
    // HighlightedFeaturesArrDifferential: [],
    // differentialTableRowMax: '',
    // differentialTableRowOther: [],
    // volcanoDifferentialTableRowMax: '',
    // volcanoDifferentialTableRowOther: [],
    // maxObjectIdentifier: null,
    imageInfo: {
      key: null,
      title: '',
      svg: [],
    },
    activeSVGTabIndex: 0,
    multisetPlotAvailable: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActive: false,
    multisetQueriedP: false,
    activeIndexDifferentialView: this.defaultActiveIndexDifferentialView || 0,
    thresholdColsP: [],
    tabsMessage: 'Select a feature to display plots and data',
    // differentialPlotTypes: [],
    differentialStudyMetadata: [],
    differentialModelsAndTests: [],
    differentialTestsMetadata: [],
    // modelSpecificMetaFeaturesExist: true,
    plotSVGWidth: null,
    plotSVGHeight: null,
    isVolcanoPlotSVGLoaded: true,
    itemsPerPageDifferentialTable:
      parseInt(localStorage.getItem('itemsPerPageDifferentialTable'), 10) || 45,
  };
  differentialViewContainerRef = React.createRef();
  differentialGridRef = React.createRef();

  componentDidMount() {
    const { featureToHighlightInDiffTable } = this.props;
    if (featureToHighlightInDiffTable !== '') {
      // this.setState(
      //   {
      //     differentialTableRowMax: featureToHighlightInDiffTable,
      //   },
      //   function() {
      //     this.pageToFeature(featureToHighlightInDiffTable);
      //   },
      // );
      this.handleSelectedDifferential(
        [
          {
            id: featureToHighlightInDiffTable,
            value: featureToHighlightInDiffTable,
            key: featureToHighlightInDiffTable,
          },
        ],
        true,
      );
    }
  }

  componentDidUpdate(prevProps) {
    const { featureToHighlightInDiffTable } = this.props;
    const currentData = this.differentialGridRef?.current?.qhGridRef?.current
      ?.data;
    if (
      featureToHighlightInDiffTable !== '' &&
      currentData != null &&
      prevProps.featureToHighlightInDiffTable !== featureToHighlightInDiffTable
    ) {
      // this.setState(
      //   {
      //     differentialTableRowMax: featureToHighlightInDiffTable,
      //   },
      //   function() {
      //     this.pageToFeature(featureToHighlightInDiffTable);
      //   },
      // );
      this.handleSelectedDifferential(
        [
          {
            id: featureToHighlightInDiffTable,
            value: featureToHighlightInDiffTable,
            key: featureToHighlightInDiffTable,
          },
        ],
        true,
      );
    }
  }

  pageToFeature = featureToHighlight => {
    if (featureToHighlight !== '') {
      const {
        differentialFeatureIdKey,
        // differentialResults
      } = this.props;
      // const { itemsPerPageVolcanoTable } = this.state;
      const currentData = this.differentialGridRef?.current?.qhGridRef?.current
        ?.data;
      if (currentData != null) {
        const itemsPerPage = this.differentialGridRef?.current?.qhGridRef
          ?.current?.props.itemsPerPage;
        const Index = _.findIndex(currentData, function(p) {
          // const Index = _.findIndex(differentialResults, function(p) {
          return p[differentialFeatureIdKey] === featureToHighlight;
        });
        const pageNumber = Math.ceil((Index + 1) / itemsPerPage);
        if (pageNumber > 0) {
          this.differentialGridRef.current.handlePageChange(pageNumber);
          scrollElement(this, 'differentialGridRef', 'rowHighlightMax');
        }
      }
    } else {
      this.differentialGridRef.current.handlePageChange(1);
    }
  };

  // informItemsPerPage = items => {
  //   this.setState({
  //     itemsPerPageDifferentialTable: items,
  //   });
  //   localStorage.setItem('itemsPerPageDifferentialTable', items);
  // };

  handleSearchTransitionDifferential = bool => {
    this.setState({
      isSearchingDifferential: bool,
    });
  };

  handleSearchTransitionDifferentialAlt = bool => {
    this.setState({
      isVolcanoTableLoading: bool,
      isDifferentialTableLoading: bool,
    });
  };

  handleMultisetQueriedP = value => {
    this.setState({
      multisetQueriedP: value,
      // isVolcanoPlotSVGLoaded: !value,
    });
  };

  // handleVolcanoPlotSVGLoaded = bool => {
  //   this.setState({
  //     isVolcanoPlotSVGLoaded: bool,
  //   });
  // };

  setStudyModelTestMetadata = (studyData, modelsAndTests) => {
    this.setState(
      {
        differentialStudyMetadata: studyData,
        differentialModelsAndTests: modelsAndTests,
      },
      function() {
        this.handlePlotTypesDifferential(this.props.differentialModel);
      },
    );
  };

  setTestsMetadata = testsData => {
    this.setState({
      differentialTestsMetadata: testsData,
    });
  };

  handleDifferentialSearch = searchResults => {
    /**
     * @type {QHGrid.ColumnConfig<{}>[]}
     */
    let columns = [{}];
    // need this check for page refresh
    if (this.props.differentialFeature !== '') {
      this.setState({
        isItemSelected: true,
      });
    } else {
      this.setState({
        isItemSelected: false,
      });
    }
    if (searchResults.differentialResults?.length > 0) {
      columns = this.getConfigCols(searchResults);
    }
    //   const statToSort =
    //     'P.Value' in sortedDifferentialResults[0] ? 'P.Value' : 'P_Value';
    //   sortedDifferentialResults = sortedDifferentialResults.sort(
    //     (a, b) => a[statToSort] - b[statToSort],
    //   );
    this.setState({
      differentialResults: searchResults.differentialResults,
      differentialColumns: columns,
      isSearchingDifferential: false,
      isValidSearchDifferential: true,
      isDifferentialTableLoading: false,
      isVolcanoTableLoading: false,
      // differentialResultsMounted: false,
      plotButtonActive: false,
      visible: false,
      // isProteinSVGLoaded: false,
      HighlightedFeaturesArrVolcano: [],
      HighlightedFeaturesArrDifferential: [],
    });
  };

  handleDifferentialSearchUnfiltered = searchResults => {
    this.setState({
      differentialResultsUnfiltered: searchResults.differentialResults,
      isProteinSVGLoaded: false,
      // isProteinDataLoaded: false,
      isItemSelected: false,
      HighlightedFeaturesArrVolcano: [],
      HighlightedFeaturesArrDifferential: [],
    });
  };

  handleDifferentialTableLoading = bool => {
    this.setState({
      isDifferentialTableLoading: bool,
    });
  };

  handleVolcanoTableLoading = bool => {
    this.setState({
      isVolcanoTableLoading: bool,
    });
  };

  handlePlotTypesDifferential = differentialModel => {
    if (differentialModel !== '') {
      if (this.state.differentialStudyMetadata?.plots != null) {
        const differentialModelData = this.state.differentialStudyMetadata.plots.find(
          model => model.modelID === differentialModel,
        );
        this.setState({
          differentialPlotTypes: differentialModelData?.plots,
        });
      }
    }
  };
  handleSearchCriteriaChange = (changes, scChange) => {
    this.props.onSearchCriteriaToTop(changes, 'differential');
    this.setState({
      visible: false,
      plotButtonActive: false,
    });
    if (scChange) {
      this.setState({
        multisetPlotAvailable: false,
        imageInfo: { key: null, title: '', svg: [] },
        tabsMessage: 'Select a feature to display plots and data',
        // differentialResults: [],
        // differentialResultsMounted: false,
        // differentialResultsUnfiltered: [],
        isProteinDataLoaded: false,
        HighlightedFeaturesArrVolcano: [],
        HighlightedFeaturesArrDifferential: [],
        differentialTableRowMax: '',
        differentialTableRowOther: [],
        volcanoDifferentialTableRowMax: '',
        volcanoDifferentialTableRowOther: [],
        maxObjectIdentifier: null,
        isVolcanoPlotSVGLoaded: true,
        isItemSelected: false,
        isProteinSVGLoaded: true,
      });
    }
    if (
      changes.differentialModel !== '' &&
      changes.differentialModel !== this.props.differentialModel
    ) {
      this.doMetaFeaturesExist(
        changes.differentialStudy,
        changes.differentialModel,
      );
    }
  };

  doMetaFeaturesExist = (differentialStudy, differentialModel) => {
    omicNavigatorService
      .getMetaFeatures(differentialStudy, differentialModel)
      .then(getMetaFeaturesResponseData => {
        const exist = getMetaFeaturesResponseData.length > 0 ? true : false;
        this.setState({
          modelSpecificMetaFeaturesExist: exist,
        });
      });
  };

  disablePlot = () => {
    this.setState({
      multisetPlotAvailable: false,
    });
  };

  hidePGrid = () => {
    this.setState({
      isValidSearchDifferential: false,
      multisetPlotAvailable: false,
      plotButtonActive: false,
      visible: false,
      isItemSelected: false,
      // differentialResultsMounted: false,
      isProteinSVGLoaded: false,
    });
  };

  handlePlotAnimation = animation => () => {
    this.setState(prevState => ({
      animation,
      visible: !prevState.visible,
      plotButtonActive: !prevState.plotButtonActive,
    }));
  };

  handleDirectionChange = direction => () =>
    this.setState({ direction: direction, visible: false });

  handleMultisetPlot = multisetPlotResults => {
    this.setState({
      multisetPlotInfo: {
        title: multisetPlotResults.svgInfo.plotType,
        svg: multisetPlotResults.svgInfo.svg,
      },
      multisetPlotAvailable: true,
    });
  };
  getProteinData = (id, dataItem, getPlotCb, imageInfo) => {
    const { differentialFeatureIdKey } = this.props;
    this.setState(
      {
        imageInfo: imageInfo,
        isItemSelected: true,
        // differentialResultsMounted: false,
        isProteinSVGLoaded: false,
        // isProteinDataLoaded: false,
        currentSVGs: [],
      },
      function() {
        this.handleSearchCriteriaChange(
          {
            differentialStudy: this.props.differentialStudy || '',
            differentialModel: this.props.differentialModel || '',
            differentialTest: this.props.differentialTest || '',
            differentialFeature: dataItem[differentialFeatureIdKey] || '',
          },
          false,
        );
        getPlotCb(id);
      },
    );
  };
  getTableHelpers = (
    getProteinDataCb,
    getPlotCb,
    differentialFeatureIdKeyVar,
  ) => {
    let addParams = {};
    addParams.showPhosphositePlus = dataItem => {
      let protein = dataItem.symbol
        ? dataItem.symbol
        : dataItem[differentialFeatureIdKeyVar];
      return function() {
        const param = {
          proteinNames: protein,
          queryId: -1,
          from: 0,
        };
        omicNavigatorService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action',
        );
      };
    };

    addParams.showPlot = (dataItem, alphanumericTrigger) => {
      return function() {
        let value = dataItem[alphanumericTrigger];
        let imageInfo = { key: null, title: '', svg: [] };
        imageInfo.title = `${alphanumericTrigger} ${value}`;
        imageInfo.key = `${value}`;
        getProteinDataCb(
          dataItem[alphanumericTrigger],
          dataItem,
          getPlotCb,
          imageInfo,
        );
      };
    };
    addParams.elementId = differentialFeatureIdKeyVar;
    this.setState({ additionalTemplateInfoDifferentialTable: addParams });
  };

  getPlot = featureId => {
    const {
      differentialPlotTypes,
      modelSpecificMetaFeaturesExist,
    } = this.state;
    // let differentialPlotTypes = [];
    const {
      differentialStudy,
      differentialModel,
      differentialFeature,
      differentialFeatureIdKey,
    } = this.props;
    let id = featureId != null ? featureId : differentialFeature;
    let imageInfo = { key: null, title: '', svg: [] };
    imageInfo.title = `${differentialFeatureIdKey} ${featureId}`;
    imageInfo.key = `${featureId}`;
    let handleSVGCb = this.handleSVG;
    let currentSVGs = [];
    let handleItemSelectedCb = this.handleItemSelected;
    cancelRequestDifferentialResultsGetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestDifferentialResultsGetPlot = e;
    });
    let self = this;
    let featureidSpecificMetaFeaturesExist =
      sessionStorage.getItem(
        `${differentialStudy}-${differentialModel}-${featureId}-MetaFeaturesExist`,
      ) || true;
    let featureidSpecificMetaFeaturesExistParsed = JSON.parse(
      featureidSpecificMetaFeaturesExist,
    );

    // differentialPlotTypes.length = 0;
    // modelSpecificMetaFeaturesExist = false;
    // featureidSpecificMetaFeaturesExist = false;
    if (
      differentialPlotTypes.length === 0 &&
      (!modelSpecificMetaFeaturesExist ||
        !featureidSpecificMetaFeaturesExistParsed)
    ) {
      this.handleItemSelected(false);
      this.setState({
        imageInfo: {
          key: null,
          title: '',
          svg: [],
        },
        isProteinSVGLoaded: true,
        isVolcanoPlotSVGLoaded: true,
        tabsMessage: 'No plots or feature data available',
      });
      let stateObj = {
        differentialStudy: this.props.differentialStudy || '',
        differentialModel: this.props.differentialModel || '',
        differentialTest: this.props.differentialTest || '',
        differentialFeature: '',
      };
      this.props.onSearchCriteriaToTop(stateObj, 'differential');
    } else {
      if (
        modelSpecificMetaFeaturesExist &&
        featureidSpecificMetaFeaturesExistParsed
      ) {
        this.getMetaFeaturesTable(featureId);
      }
      if (differentialPlotTypes.length !== 0) {
        _.forEach(differentialPlotTypes, function(plot, i) {
          omicNavigatorService
            .plotStudy(
              differentialStudy,
              differentialModel,
              id,
              differentialPlotTypes[i].plotID,
              handleItemSelectedCb,
              cancelToken,
            )
            .then(svgMarkupObj => {
              let svgMarkup = svgMarkupObj.data;
              if (svgMarkup != null || svgMarkup !== []) {
                svgMarkup = svgMarkup.replace(
                  /id="/g,
                  'id="' + id + '-' + i + '-',
                );
                svgMarkup = svgMarkup.replace(
                  /#glyph/g,
                  '#' + id + '-' + i + '-glyph',
                );
                svgMarkup = svgMarkup.replace(
                  /#clip/g,
                  '#' + id + '-' + i + '-clip',
                );
                svgMarkup = svgMarkup.replace(
                  /<svg/g,
                  `<svg preserveAspectRatio="xMinYMin meet" id="currentSVG-${id}-${i}"`,
                );
                DOMPurify.addHook('afterSanitizeAttributes', function(node) {
                  if (
                    node.hasAttribute('xlink:href') &&
                    !node.getAttribute('xlink:href').match(/^#/)
                  ) {
                    node.remove();
                  }
                });
                // Clean HTML string and write into our DIV
                let sanitizedSVG = DOMPurify.sanitize(svgMarkup, {
                  ADD_TAGS: ['use'],
                });
                let svgInfo = {
                  plotType: differentialPlotTypes[i],
                  svg: sanitizedSVG,
                };
                imageInfo.svg.push(svgInfo);
                currentSVGs.push(sanitizedSVG);
                handleSVGCb(imageInfo);
              } else {
                handleItemSelectedCb(false);
              }
            })
            .catch(error => {
              self.handleItemSelected(false);
            });
        });
      } else {
        this.setState({
          imageInfo: {
            key: null,
            title: '',
            svg: [],
          },
          isProteinSVGLoaded: true,
          isVolcanoPlotSVGLoaded: true,
        });
      }
    }
  };

  getMetaFeaturesTable = featureId => {
    const { differentialStudy, differentialModel } = this.props;
    omicNavigatorService
      .getMetaFeaturesTable(
        differentialStudy,
        differentialModel,
        featureId,
        this.handleGetMetaFeaturesTableError,
      )
      .then(getMetaFeaturesTableResponseData => {
        const metafeaturesData =
          getMetaFeaturesTableResponseData.length > 0
            ? getMetaFeaturesTableResponseData
            : [];
        if (getMetaFeaturesTableResponseData.length === 0) {
          sessionStorage.setItem(
            `${differentialStudy}-${differentialModel}-${featureId}-MetaFeaturesExist`,
            false,
          );
          // this.handleGetMetaFeaturesTableError,
          // 10/9/20 - PAUL - revisit and make decision on metafeature alerts
          // toast.error(
          //   `Feature ${featureId} does not have any feature data.`,
          // );
        }
        this.setState({
          metafeaturesData: metafeaturesData,
          // areDifferentialPlotTabsReady: true,
        });
      })
      .catch(error => {
        console.error('Error during getMetaFeaturesTable', error);
      });
  };

  handleGetMetaFeaturesTableError = () => {
    const { differentialStudy, differentialModel } = this.props;
    sessionStorage.setItem(
      `${differentialStudy}-${differentialModel}-MetaFeaturesExist`,
      false,
    );
    this.setState({
      areDifferentialPlotTabsReady: true,
    });
  };

  handleSelectedVolcano = toHighlightArr => {
    //if(toHighlightArr !== this.state.HighlightedFeaturesArrVolcano){
    this.setState({
      HighlightedFeaturesArrVolcano: toHighlightArr,
    });
    if (toHighlightArr.length > 0) {
      const MaxLine = toHighlightArr[0] || null;
      let volcanoDifferentialTableRowMaxVar = '';
      if (MaxLine !== {} && MaxLine != null) {
        volcanoDifferentialTableRowMaxVar = MaxLine.key;
      }
      const HighlightedFeaturesCopy = [...toHighlightArr];
      const SelectedFeatures = HighlightedFeaturesCopy.slice(1);
      let volcanoDifferentialTableRowOtherVar = [];
      if (
        SelectedFeatures.length > 0 &&
        SelectedFeatures != null &&
        SelectedFeatures !== {}
      ) {
        SelectedFeatures.forEach(element => {
          volcanoDifferentialTableRowOtherVar.push(element.key);
        });
      }
      const maxId = toHighlightArr[0].id || '';
      this.setState({
        volcanoDifferentialTableRowMax: volcanoDifferentialTableRowMaxVar,
        volcanoDifferentialTableRowOther: volcanoDifferentialTableRowOtherVar,
      });
      this.handlePlotVolcano(maxId);
    } else {
      this.setState({
        volcanoDifferentialTableRowMax: '',
        volcanoDifferentialTableRowOther: [],
      });
      this.handlePlotVolcano('');
    }
    //}
  };

  handlePlotVolcano = maxId => {
    if (maxId !== '') {
      if (this.state.maxObjectIdentifier !== maxId) {
        this.setState({
          isVolcanoPlotSVGLoaded: false,
          maxObjectIdentifier: maxId,
        });
        this.getPlot(maxId);
      }
    } else {
      this.setState({
        isVolcanoPlotSVGLoaded: true,
        maxObjectIdentifier: '',

        imageInfo: {
          key: null,
          title: '',
          svg: [],
        },
      });
    }
  };

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex,
    });
  };
  handleItemSelected = bool => {
    this.setState({
      isItemSelected: bool,
    });
  };
  handleSVG = imageInfo => {
    this.setState({
      imageInfo: imageInfo,
      isProteinSVGLoaded: true,
      isVolcanoPlotSVGLoaded: true,
    });
  };
  backToTable = () => {
    this.setState({
      // differentialResultsMounted: false,
      isItemSelected: false,
      // isProteinDataLoaded: false,
      isProteinSVGLoaded: false,
    });
    this.handleSearchCriteriaChange(
      {
        differentialStudy: this.props.differentialStudy || '',
        differentialModel: this.props.differentialModel || '',
        differentialTest: this.props.differentialTest || '',
        differentialFeature: '',
      },
      false,
    );
  };
  getConfigCols = testData => {
    const pepResults = testData.differentialResults;
    const {
      differentialStudy,
      differentialModel,
      differentialFeature,
    } = this.props;
    const {
      differentialPlotTypes,
      modelSpecificMetaFeaturesExist,
    } = this.state;
    // let differentialPlotTypes = [];
    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    let icon = phosphosite_icon;
    let iconText = 'PhosphoSitePlus';
    let differentialAlphanumericFields = [];
    let differentialNumericFields = [];
    const firstObject = pepResults[0];
    for (let [key, value] of Object.entries(firstObject)) {
      if (typeof value === 'string' || value instanceof String) {
        differentialAlphanumericFields.push(key);
      } else {
        differentialNumericFields.push(key);
      }
    }
    const alphanumericTrigger = differentialAlphanumericFields[0];
    if (differentialFeature !== '') {
      let imageInfo = { key: null, title: '', svg: [] };
      imageInfo.title = `${alphanumericTrigger} ${differentialFeature}`;
      imageInfo.key = `${differentialFeature}`;
      this.setState({
        imageInfo: imageInfo,
        // differentialResultsMounted: false,
        isItemSelected: true,
        isProteinSVGLoaded: false,
        // isProteinDataLoaded: false,
        currentSVGs: [],
      });
      this.getPlot(differentialFeature);
    }
    this.props.onHandleDifferentialFeatureIdKey(
      'differentialFeatureIdKey',
      alphanumericTrigger,
    );
    this.getTableHelpers(
      this.getProteinData,
      this.getPlot,
      alphanumericTrigger,
    );

    // let featureSpecificMetafeatures = `${differentialStudy}-${differentialModel}-${differentialFeature}-MetaFeaturesExist`;
    // let featureidSpecificMetaFeaturesExist =
    //   sessionStorage.getItem(featureSpecificMetafeatures) || true;
    // let featureidSpecificMetaFeaturesExistParsed = JSON.parse(
    //   featureidSpecificMetaFeaturesExist,
    // );
    const noPlotsNorMetafeatures =
      differentialPlotTypes.length === 0 &&
      // (
      !modelSpecificMetaFeaturesExist;
    //|| !featureidSpecificMetaFeaturesExistParsed;
    // );

    if (differentialPlotTypes.length === 0) {
      this.setState({
        tabsMessage: 'No plots available',
      });
    }
    if (differentialPlotTypes.length === 0 && noPlotsNorMetafeatures) {
      this.setState({
        tabsMessage: 'No plots or feature data available',
      });
    }
    const differentialAlphanumericColumnsMapped = differentialAlphanumericFields.map(
      f => {
        return {
          title: f,
          field: f,
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            const featureIdClass = noPlotsNorMetafeatures
              ? 'TableCellBold NoSelect'
              : 'TableCellLink NoSelect';
            const featureIdClick = noPlotsNorMetafeatures
              ? null
              : addParams.showPlot(item, alphanumericTrigger);
            let linkout = getLinkout(
              item,
              addParams,
              icon,
              iconText,
              TableValuePopupStyle,
              alphanumericTrigger,
            );
            if (f === alphanumericTrigger) {
              return (
                <div className="NoSelect">
                  <Popup
                    trigger={
                      <span className={featureIdClass} onClick={featureIdClick}>
                        {splitValue(value)}
                      </span>
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
                    inverted
                    basic
                  />
                  {linkout}
                </div>
              );
            } else {
              return (
                <div className="NoSelect">
                  <Popup
                    trigger={
                      <span className="NoSelect">{splitValue(value)}</span>
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
                    inverted
                    basic
                  />
                </div>
              );
            }
          },
        };
      },
    );
    const thresholdColsDifferential = this.listToJson(
      differentialNumericFields,
    );
    this.setState({
      thresholdColsP: thresholdColsDifferential,
    });
    this.setState({ filterableColumnsP: [...differentialNumericFields] });
    const differentialNumericColumnsMapped = differentialNumericFields.map(
      c => {
        return {
          title: c,
          field: c,
          type: 'number',
          filterable: { type: 'numericFilter' },
          exportTemplate: value => (value ? `${value}` : 'N/A'),
          template: (value, item, addParams) => {
            return (
              <div className="NoSelect">
                <Popup
                  trigger={
                    <span className="TableValue NoSelect">
                      {formatNumberForDisplay(value)}
                    </span>
                  }
                  style={TableValuePopupStyle}
                  className="TablePopupValue"
                  content={value}
                  inverted
                  basic
                />
              </div>
            );
          },
        };
      },
    );
    const configCols = differentialAlphanumericColumnsMapped.concat(
      differentialNumericColumnsMapped,
    );
    return configCols;
  };

  listToJson(list) {
    var valueJSON = [];
    for (var i = 0; i < list.length; i++) {
      valueJSON.push({
        key: list[i],
        text: list[i],
        value: list[i],
      });
    }
    return valueJSON;
  }

  getMessage = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;
    if (differentialStudy === '') {
      return 'study';
    } else if (differentialModel === '') {
      return 'model';
    } else if (differentialTest === '') {
      return 'test';
    } else return '';
  };

  getView = () => {
    const message = this.getMessage();
    if (this.state.isItemSelected && !this.state.isProteinSVGLoaded) {
      return <LoaderActivePlots />;
    } else if (this.state.isSearchingDifferential) {
      return <TransitionActive />;
    } else if (this.state.isItemSelected && this.state.isProteinSVGLoaded) {
      return (
        <DifferentialPlot
          {...this.props}
          {...this.state}
          onBackToTable={this.backToTable}
        ></DifferentialPlot>
      );
    } else if (
      this.state.isValidSearchDifferential &&
      !this.state.isSearchingDifferential &&
      !this.state.isItemSelected
    ) {
      const TableAndPlotPanes = this.getTableAndPlotPanes();
      return (
        <Tab
          className="TableAndPlotContainer"
          panes={TableAndPlotPanes}
          onTabChange={this.handleTablePlotTabChange}
          activeIndex={this.state.activeIndexDifferentialView}
          renderActiveOnly={false}
          menu={{
            attached: true,
            className: 'TableAndPlotMenuContainer',
          }}
        />
      );
    } else return <TransitionStill stillMessage={message} />;
  };

  // handleDifferentialResultsMounted = bool => {
  //   this.setState({
  //     differentialResultsMounted: bool,
  //   });
  // };

  // informItemsPerPageDifferentialTable = items => {
  //   this.setState({
  //     itemsPerPageDifferentialTable: items,
  //   });
  //   localStorage.setItem('itemsPerPageDifferentialTable', items);
  // };

  rowLevelPropsCalcDifferential = item => {
    let className;
    const { differentialFeatureIdKey } = this.props;
    const { differentialTableRowMax, differentialTableRowOther } = this.state;
    /* eslint-disable eqeqeq */
    if (item[differentialFeatureIdKey] === differentialTableRowMax) {
      className = 'rowHighlightMax';
    }
    if (differentialTableRowOther?.includes(item[differentialFeatureIdKey])) {
      className = 'rowHighlightOther';
    }
    return {
      className,
    };
  };

  handleRowClickDifferential = (event, item, index) => {
    const { differentialFeatureIdKey } = this.props;
    const highlightedFeature = item[differentialFeatureIdKey];
    if (item !== null && event?.target?.className !== 'ExternalSiteIcon') {
      event.stopPropagation();
      const PreviouslyHighlighted = [
        ...this.state.HighlightedFeaturesArrDifferential,
      ];
      if (event.shiftKey) {
        const allTableData =
          this.differentialGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        const indexMaxFeature = _.findIndex(allTableData, function(d) {
          return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
        });
        const sliceFirst = index < indexMaxFeature ? index : indexMaxFeature;
        const sliceLast = index > indexMaxFeature ? index : indexMaxFeature;
        const shiftedTableData = allTableData.slice(sliceFirst, sliceLast + 1);
        const shiftedTableDataArray = shiftedTableData.map(function(d) {
          return {
            id: d[differentialFeatureIdKey],
            value: d[differentialFeatureIdKey],
            key: d[differentialFeatureIdKey],
          };
        });
        this.handleSelectedDifferential(shiftedTableDataArray, false);
      } else if (event.ctrlKey) {
        const allTableData =
          this.differentialGridRef.current?.qhGridRef.current?.getSortedData() ||
          [];
        let selectedTableDataArray = [];

        const alreadyHighlighted = PreviouslyHighlighted.some(
          d => d.id === highlightedFeature,
        );
        // already highlighted, remove it from array
        if (alreadyHighlighted) {
          selectedTableDataArray = PreviouslyHighlighted.filter(
            i => i.id !== highlightedFeature,
          );
          this.handleSelectedDifferential(selectedTableDataArray, false);
        } else {
          // not yet highlighted, add it to array
          const indexMaxFeature = _.findIndex(allTableData, function(d) {
            return d[differentialFeatureIdKey] === PreviouslyHighlighted[0]?.id;
          });
          const mappedFeature = {
            id: item[differentialFeatureIdKey],
            value: item[differentialFeatureIdKey],
            key: item[differentialFeatureIdKey],
          };
          const lowerIndexThanMax = index < indexMaxFeature ? true : false;
          if (lowerIndexThanMax) {
            // add to beginning of array if max
            PreviouslyHighlighted.unshift(mappedFeature);
          } else {
            // just add to array if not max
            PreviouslyHighlighted.push(mappedFeature);
          }
          selectedTableDataArray = [...PreviouslyHighlighted];
          this.handleSelectedDifferential(selectedTableDataArray, false);
        }
      } else {
        this.handleSelectedDifferential(
          [
            {
              id: item[differentialFeatureIdKey],
              value: item[differentialFeatureIdKey],
              key: item[differentialFeatureIdKey],
            },
          ],
          false,
        );
      }
    }
    // else {
    //   this.props.onPagedToFeature();
    // }
  };

  handleSelectedDifferential = (toHighlightArr, pageToFeature) => {
    this.setState({
      HighlightedFeaturesArrDifferential: toHighlightArr,
    });
    if (toHighlightArr.length > 0) {
      const MaxLine = toHighlightArr[0] || null;
      let differentialTableRowMaxVar = '';
      if (MaxLine !== {} && MaxLine != null) {
        differentialTableRowMaxVar = MaxLine.key;
      }
      const HighlightedFeaturesCopy = [...toHighlightArr];
      const SelectedFeatures = HighlightedFeaturesCopy.slice(1);
      let differentialTableRowOtherVar = [];
      if (
        SelectedFeatures.length > 0 &&
        SelectedFeatures != null &&
        SelectedFeatures !== {}
      ) {
        SelectedFeatures.forEach(element => {
          differentialTableRowOtherVar.push(element.key);
        });
      }
      this.setState({
        differentialTableRowMax: differentialTableRowMaxVar,
        differentialTableRowOther: differentialTableRowOtherVar,
      });
      if (pageToFeature) {
        this.pageToFeature(differentialTableRowMaxVar);
      }
    } else {
      this.setState({
        differentialTableRowMax: '',
        differentialTableRowOther: [],
      });
    }
  };

  getTableAndPlotPanes = () => {
    const {
      tab,
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;
    const { multisetQueriedP } = this.state;

    const {
      additionalTemplateInfoDifferentialTable,
      differentialResults,
      itemsPerPageDifferentialTable,
      differentialColumns,
      isVolcanoTableLoading,
    } = this.state;
    const differentialRows = differentialResults.length || 1000;
    // const getExportDataDifferential =
    //   this.differentialGridRef.current?.qhGridRef.current?.getSortedData() ||
    //   null;
    let differentialCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}`;
    if (multisetQueriedP) {
      differentialCacheKey = `${differentialStudy}-${differentialModel}-${differentialTest}-${multisetQueriedP}`;
    }
    return [
      {
        menuItem: (
          <Menu.Item
            key="0"
            className="TableAndPlotButtons TableButton"
            name="Table"
            color="orange"
          >
            <img
              src={
                this.state.activeIndexDifferentialView === 0
                  ? tableIconSelected
                  : tableIcon
              }
              alt="Table Icon"
              id="TableButton"
            />
          </Menu.Item>
        ),
        pane: (
          <Tab.Pane key="0" className="DifferentialContentPane">
            {/* <div id="DifferentialGrid"> */}
            <Grid>
              <Grid.Row>
                <div className="FloatRight AbsoluteExport">
                  <ButtonActions
                    excelVisible={true}
                    pngVisible={false}
                    pdfVisible={false}
                    svgVisible={false}
                    txtVisible={true}
                    refFwd={this.differentialGridRef}
                    exportButtonSize={'medium'}
                    tab={tab}
                    study={differentialStudy}
                    model={differentialModel}
                    test={differentialTest}
                  />
                </div>
                <Grid.Column
                  className="ResultsTableWrapper"
                  mobile={16}
                  tablet={16}
                  largeScreen={16}
                  widescreen={16}
                >
                  <EZGrid
                    ref={this.differentialGridRef}
                    uniqueCacheKey={differentialCacheKey}
                    data={differentialResults}
                    // getExportData={getExportDataDifferential}
                    columnsConfig={differentialColumns || []}
                    totalRows={differentialRows}
                    // use "differentialRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
                    itemsPerPage={itemsPerPageDifferentialTable}
                    // onInformItemsPerPage={
                    //   this.informItemsPerPageDifferentialTable
                    // }
                    // exportBaseName="Differential_Analysis"
                    loading={isVolcanoTableLoading}
                    // quickViews={quickViews}
                    // disableGeneralSearch
                    disableGrouping
                    disableColumnVisibilityToggle
                    disableColumnReorder
                    // disableFilters
                    min-height="75vh"
                    additionalTemplateInfo={
                      additionalTemplateInfoDifferentialTable
                    }
                    // onRowClick={this.handleRowClickDifferential}
                    rowLevelPropsCalc={this.rowLevelPropsCalcDifferential}
                  />
                  {/* </div> */}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Tab.Pane>
        ),
      },
      {
        menuItem: (
          <Menu.Item
            key="1"
            className="TableAndPlotButtons PlotButton"
            name="plot"
            // color="orange"
          >
            <img
              src={
                this.state.activeIndexDifferentialView === 1
                  ? VolcanoPlotIconSelected
                  : VolcanoPlotIcon
              }
              alt="Plot Icon"
              id="PlotButton"
            />
          </Menu.Item>
        ),
        pane: (
          <Tab.Pane
            key="1"
            className="DifferentialContentPane"
            id="DifferentialContentPane"
          >
            <DifferentialVolcano
              {...this.state}
              {...this.props}
              handleVolcanoPlotSelectionChange={
                this.handleVolcanoPlotSelectionChange
              }
              onHandleSelectedVolcano={this.handleSelectedVolcano}
              onVolcanoSVGSizeChange={this.handleVolcanoSVGSizeChange}
              onSVGTabChange={this.handleSVGTabChange}
              onHandleVolcanoTableLoading={this.handleVolcanoTableLoading}
              // onHandleVolcanoPlotSVGLoaded={this.handleVolcanoPlotSVGLoaded}
            />
          </Tab.Pane>
        ),
      },
    ];
  };

  handleTablePlotTabChange = (e, { activeIndex }) => {
    sessionStorage.setItem(`differentialViewTab`, activeIndex);
    this.setState({ activeIndexDifferentialView: activeIndex });
  };

  render() {
    const differentialView = this.getView();
    const { multisetPlotInfo, animation, direction, visible } = this.state;
    const { tab, differentialStudy, differentialModel } = this.props;
    const VerticalSidebar = ({ animation, visible }) => (
      <Sidebar
        as={'div'}
        animation={animation}
        direction={direction}
        icon="labeled"
        vertical="true"
        visible={visible}
        width="very wide"
        className="VerticalSidebarPlot"
      >
        <Grid className="">
          <Grid.Row className="ActionsRow">
            <Grid.Column
              mobile={16}
              tablet={16}
              largeScreen={16}
              widescreen={16}
            >
              <ButtonActions
                exportButtonSize={'medium'}
                excelVisible={false}
                pngVisible={true}
                pdfVisible={false}
                svgVisible={true}
                txtVisible={false}
                plot={'differentialMultisetAnalysisSVG'}
                tab={tab}
                study={differentialStudy}
                model={differentialModel}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div
          className="MultisetSvgOuter"
          dangerouslySetInnerHTML={{ __html: multisetPlotInfo.svg }}
        ></div>
      </Sidebar>
    );
    return (
      <Grid>
        <Grid.Row className="DifferentialContainer">
          <Grid.Column
            className="SidebarContainer"
            mobile={16}
            tablet={16}
            largeScreen={4}
            widescreen={4}
          >
            <DifferentialSearchCriteria
              {...this.state}
              {...this.props}
              onSearchTransitionDifferential={
                this.handleSearchTransitionDifferential
              }
              onSearchTransitionDifferentialAlt={
                this.handleSearchTransitionDifferentialAlt
              }
              onDifferentialSearch={this.handleDifferentialSearch}
              onDifferentialSearchUnfiltered={
                this.handleDifferentialSearchUnfiltered
              }
              onSearchCriteriaChange={this.handleSearchCriteriaChange}
              onSearchCriteriaReset={this.hidePGrid}
              onDisablePlot={this.disablePlot}
              onGetMultisetPlot={this.handleMultisetPlot}
              onHandlePlotAnimation={this.handlePlotAnimation}
              onMultisetQueriedP={this.handleMultisetQueriedP}
              onSetStudyModelTestMetadata={this.setStudyModelTestMetadata}
              onSetTestsMetadata={this.setTestsMetadata}
              onHandlePlotTypesDifferential={this.handlePlotTypesDifferential}
              onGetPlot={this.getPlot}
              onHandleDifferentialTableLoading={
                this.handleDifferentialTableLoading
              }
              onHandleVolcanoTableLoading={this.handleVolcanoTableLoading}
            />
          </Grid.Column>
          <Grid.Column
            className="DifferentialContentContainer"
            mobile={16}
            tablet={16}
            largeScreen={12}
            widescreen={12}
          >
            <Sidebar.Pushable as={'span'}>
              <VerticalSidebar
                animation={animation}
                direction={direction}
                visible={visible}
              />
              <Sidebar.Pusher>
                <div
                  className="DifferentialViewContainer"
                  ref={this.differentialViewContainerRef}
                >
                  {differentialView}
                </div>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withRouter(Differential);
