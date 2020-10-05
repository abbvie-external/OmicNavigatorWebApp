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
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';
import DOMPurify from 'dompurify';
import { phosphoprotService } from '../../services/phosphoprot.service';
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
    differentialResults: [],
    // differentialResultsMounted: false,
    differentialResultsUnfiltered: [],
    /**
     * @type {QHGrid.ColumnConfig[]}
     */
    differentialColumns: [],
    filterableColumnsP: [],
    multisetPlotInfo: {
      title: '',
      svg: [],
    },
    isItemSelected: false,
    isProteinSVGLoaded: false,
    // isProteinDataLoaded: false,
    HighlightedFeaturesArrVolcano: [],
    volcanoDifferentialTableRowMax: [],
    volcanoDifferentialTableRowOther: [],
    maxObjectIdentifier: null,
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
    excelVisible: false,
    pngVisible: true,
    pdfVisible: false,
    svgVisible: true,
    multisetQueriedP: false,
    activeIndexDifferentialView: this.defaultActiveIndexDifferentialView || 0,
    thresholdColsP: [],
    differentialPlotTypes: [],
    differentialStudyMetadata: [],
    differentialModelsAndTests: [],
    differentialTestsMetadata: [],
    plotSVGWidth: null,
    plotSVGHeight: null,
    isVolcanoPlotSVGLoaded: true,
    itemsPerPageDifferentialTable:
      parseInt(localStorage.getItem('itemsPerPageDifferentialTable'), 10) || 45,
  };
  DifferentialViewContainerRef = React.createRef();
  differentialGridRef = React.createRef();

  componentDidUpdate(prevProps) {}

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageDifferentialTable: items,
    });
    localStorage.setItem('itemsPerPageDifferentialTable', items);
  };

  handleSearchTransitionDifferential = bool => {
    this.setState({
      isSearchingDifferential: bool,
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
    });
  };

  handleDifferentialSearchUnfiltered = searchResults => {
    this.setState({
      differentialResultsUnfiltered: searchResults.differentialResults,
      isProteinSVGLoaded: false,
      // isProteinDataLoaded: false,
      isItemSelected: false,
      HighlightedFeaturesArrVolcano: [],
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
      if (this.state.differentialStudyMetadata.plots != null) {
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
      });
    }
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
        getPlotCb(id, false);
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
        phosphoprotService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action',
        );
      };
    };

    addParams.showPlot = (dataItem, alphanumericTrigger) => {
      return function() {
        let value = dataItem[alphanumericTrigger];
        let imageInfo = { key: '', title: '', svg: [] };
        imageInfo.title = `Protein Intensity - ${alphanumericTrigger} ${value}`;
        imageInfo.key = `${alphanumericTrigger} ${value}`;
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

  // pageToFeature = featureToHighlight => {
  //   const { differentialFeatureIdKey } = this.props;
  //   const { differentialResults, itemsPerPageDifferentialTable } = this.state;
  //   if (this.differentialGridRef?.current != null) {
  //     const Index = _.findIndex(differentialResults, function(p) {
  //       return p[differentialFeatureIdKey] === featureToHighlight;
  //     });
  //     const pageNumber = Math.ceil((Index + 1) / itemsPerPageDifferentialTable);
  //     this.differentialGridRef.current.handlePageChange(pageNumber);
  //   }
  // };

  getPlot = (featureId, useVolcanoSVGSize) => {
    const { differentialPlotTypes } = this.state;
    const {
      differentialStudy,
      differentialModel,
      differentialFeature,
      differentialFeatureIdKey,
    } = this.props;
    let id = featureId != null ? featureId : differentialFeature;
    let imageInfo = { key: '', title: '', svg: [] };
    imageInfo.title = `Protein Intensity - ${differentialFeatureIdKey} ${featureId}`;
    imageInfo.key = `${differentialFeatureIdKey} ${featureId}`;
    let handleSVGCb = this.handleSVG;
    let currentSVGs = [];
    let handleItemSelectedCb = this.handleItemSelected;
    cancelRequestDifferentialResultsGetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestDifferentialResultsGetPlot = e;
    });
    let self = this;
    if (differentialPlotTypes.length > 0) {
      _.forEach(differentialPlotTypes, function(plot, i) {
        phosphoprotService
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
            svgMarkup = svgMarkup.replace(/id="/g, 'id="' + id + '-' + i + '-');
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

            // we want spline plot in zero index, rather than lineplot
            // if (i === 0) {
            imageInfo.svg.push(svgInfo);
            currentSVGs.push(sanitizedSVG);
            // } else {
            // imageInfo.svg.unshift(svgInfo);
            // currentSVGs.unshift(sanitizedSVG);
            // }
            handleSVGCb(imageInfo);
          })
          .catch(error => {
            self.handleItemSelected(false);
          });
      });
    }
  };

  handleSelectedVolcano = toHighlightArr => {
    this.setState({
      HighlightedFeaturesArrVolcano: toHighlightArr,
    });
    if (toHighlightArr.length > 0) {
      const MaxLine = toHighlightArr[0] || null;
      let volcanoDifferentialTableRowMaxVar = '';
      if (MaxLine !== {} && MaxLine != null) {
        volcanoDifferentialTableRowMaxVar = MaxLine.key;
      }
      // Once table multi-select is built, uncomment
      // const HighlightedFeaturesCopy = [...toHighlightArr];
      // const SelectedFeatures = HighlightedFeaturesCopy.slice(1);
      // let volcanoDifferentialTableRowOtherVar = [];
      // if (
      //   SelectedFeatures.length > 0 &&
      //   SelectedFeatures != null &&
      //   SelectedFeatures != {}
      // ) {
      //   SelectedFeatures.forEach(element => {
      //     volcanoDifferentialTableRowOtherVar.push(element.key);
      //   });
      // }
      const maxId = toHighlightArr[0].id || '';
      this.setState({
        volcanoDifferentialTableRowMax: volcanoDifferentialTableRowMaxVar,
        // volcanoDifferentialTableRowOther: volcanoDifferentialTableRowOtherVar,
      });
      this.handlePlotVolcano(maxId);
      // if (!tableClick) {
      // this.pageToFeature(maxId);
      // }
    } else {
      this.setState({
        volcanoDifferentialTableRowMax: '',
        // volcanoDifferentialTableRowOther: '',
      });
      this.handlePlotVolcano('');
    }
  };

  handlePlotVolcano = maxId => {
    if (maxId !== '') {
      if (this.state.maxObjectIdentifier !== maxId) {
        this.setState({
          isVolcanoPlotSVGLoaded: false,
          maxObjectIdentifier: maxId,
        });
        this.getPlot(maxId, true);
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
    const { differentialFeature } = this.props;
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
      let imageInfo = { key: '', title: '', svg: [] };
      imageInfo.title = `Protein Intensity - ${alphanumericTrigger} ${differentialFeature}`;
      imageInfo.key = `${alphanumericTrigger} ${differentialFeature}`;
      this.setState({
        imageInfo: imageInfo,
        // differentialResultsMounted: false,
        isItemSelected: true,
        isProteinSVGLoaded: false,
        // isProteinDataLoaded: false,
        currentSVGs: [],
      });
      this.getPlot(differentialFeature, false);
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
    const differentialAlphanumericColumnsMapped = differentialAlphanumericFields.map(
      f => {
        return {
          title: f,
          field: f,
          filterable: { type: 'multiFilter' },
          template: (value, item, addParams) => {
            if (f === alphanumericTrigger) {
              return (
                <div className="NoSelect">
                  <Popup
                    trigger={
                      <span
                        className="TableCellLink NoSelect"
                        onClick={addParams.showPlot(item, alphanumericTrigger)}
                      >
                        {splitValue(value)}
                      </span>
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={value}
                    inverted
                    basic
                  />
                  <Popup
                    trigger={
                      <img
                        src={icon}
                        alt="Phosophosite"
                        className="ExternalSiteIcon"
                        onClick={addParams.showPhosphositePlus(item)}
                      />
                    }
                    style={TableValuePopupStyle}
                    className="TablePopupValue"
                    content={iconText}
                    inverted
                    basic
                  />
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

  getView = () => {
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
    } else return <TransitionStill />;
  };

  // handleDifferentialResultsMounted = bool => {
  //   this.setState({
  //     differentialResultsMounted: bool,
  //   });
  // };

  informItemsPerPageDifferentialTable = items => {
    this.setState({
      itemsPerPageDifferentialTable: items,
    });
    localStorage.setItem('itemsPerPageDifferentialTable', items);
  };

  getTableAndPlotPanes = () => {
    const {
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
                    columnsConfig={differentialColumns}
                    totalRows={differentialRows}
                    // use "differentialRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
                    itemsPerPage={itemsPerPageDifferentialTable}
                    onInformItemsPerPage={
                      this.informItemsPerPageDifferentialTable
                    }
                    exportBaseName="Differential_Analysis"
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
                    // headerAttributes={<ButtonActions />}
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
              <ButtonActions {...this.props} {...this.state} />
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
                  ref={this.DifferentialViewContainerRef}
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
