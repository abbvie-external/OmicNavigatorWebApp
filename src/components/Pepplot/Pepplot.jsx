import React, { Component } from 'react';
import { Grid, Menu, Popup, Sidebar, Tab } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import PepplotSearchCriteria from './PepplotSearchCriteria';
import VolcanoPlotIcon from '../../resources/VolcanoPlotIcon.png';
import VolcanoPlotIconSelected from '../../resources/VolcanoPlotIconSelected.png';
import tableIcon from '../../resources/tableIcon.png';
import tableIconSelected from '../../resources/tableIconSelected.png';
import PepplotResults from './PepplotResults';
import PepplotPlot from './PepplotPlot';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import ButtonActions from '../Shared/ButtonActions';
import { formatNumberForDisplay, splitValue } from '../Shared/helpers';
import phosphosite_icon from '../../resources/phosphosite.ico';
import DOMPurify from 'dompurify';
import { phosphoprotService } from '../../services/phosphoprot.service';
import { CancelToken } from 'axios';
// import PepplotVolcano from './PepplotVolcano';

import _ from 'lodash';
import './Pepplot.scss';
import '../Shared/Table.scss';

let cancelRequestPepplotResultsGetPlot = () => {};
class Pepplot extends Component {
  defaultActiveIndexPepplotView =
    parseInt(sessionStorage.getItem('pepplotViewTab'), 10) || 0;

  static defaultProps = {
    pepplotStudy: '',
    pepplotModel: '',
    pepplotTest: '',
    pepplotProteinSite: '',
  };

  state = {
    isValidSearchPepplot: false,
    isSearchingPepplot: false,
    showProteinPage: false,
    pepplotResults: [],
    pepplotResultsUnfiltered: [],
    pepplotColumns: [],
    filterableColumnsP: [],
    multisetPlotInfo: {
      title: '',
      svg: [],
    },
    isItemSelected: false,
    isProteinSVGLoaded: false,
    // isProteinDataLoaded: false,
    selectedFromTableData: [],
    imageInfo: {
      key: null,
      title: '',
      svg: [],
    },
    // treeDataRaw: [],
    // treeData: [],
    // treeDataColumns: [],
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
    multisetQueried: false,
    activeIndexPepplotView: this.defaultActiveIndexPepplotView || 0,
    thresholdColsP: [],
    pepplotPlotTypes: [],
    pepplotStudyMetadata: [],
    pepplotModelsAndTests: [],
    pepplotTestsMetadata: [],
    pepplotFeatureIdKey: '',
  };

  componentDidMount() {
    // this.getTableHelpers(
    //   this.getProteinData,
    //   this.getPlot,
    //   this.state.selectedFromTableData,
    // );
  }

  componentDidUpdate = (prevProps, prevState) => {
    // if (
    //   this.props.tab === 'pepplot' &&
    //   this.props.proteinToHighlightInDiffTable !== '' &&
    //   this.props.proteinToHighlightInDiffTable !== undefined
    // ) {
    //   this.pageToProtein(
    //     this.state.pepplotResults,
    //     this.props.proteinToHighlightInDiffTable,
    //     this.state.itemsPerPageInformed,
    //   );
    // }
  };

  handleSearchTransitionPepplot = bool => {
    this.setState({
      isSearchingPepplot: bool,
    });
  };

  handleMultisetQueried = value => {
    this.setState({
      multisetQueried: value,
    });
  };

  setStudyModelTestMetadata = (studyData, modelsAndTests) => {
    this.setState(
      {
        pepplotStudyMetadata: studyData,
        pepplotModelsAndTests: modelsAndTests,
      },
      function() {
        this.handlePlotTypes(this.props.pepplotModel);
      },
    );
  };

  setTestsMetadata = testsData => {
    this.setState({
      pepplotTestsMetadata: testsData,
    });
  };

  handlePepplotSearch = searchResults => {
    let columns = [];
    if (searchResults.pepplotResults?.length > 0) {
      columns = this.getConfigCols(searchResults);
    }
    this.setState({
      pepplotResults: searchResults.pepplotResults,
      pepplotColumns: columns,
      isSearchingPepplot: false,
      isValidSearchPepplot: true,
      showProteinPage: false,
      plotButtonActive: false,
      visible: false,
    });
  };
  handlePepplotSearchUnfiltered = searchResults => {
    this.setState({
      pepplotResultsUnfiltered: searchResults.pepplotResults,
      isProteinSVGLoaded: false,
      // isProteinDataLoaded: false,
      isItemSelected: false,
      selectedFromTableData: [],
    });
  };

  handlePlotTypes = pepplotModel => {
    if (pepplotModel !== '') {
      if (this.state.pepplotStudyMetadata.plots != null) {
        const pepplotModelData = this.state.pepplotStudyMetadata.plots.find(
          model => model.modelID === pepplotModel,
        );
        this.setState({
          pepplotPlotTypes: pepplotModelData.plots,
        });
      }
    }
  };
  handleSearchCriteriaChange = (changes, scChange) => {
    this.props.onSearchCriteriaToTop(changes, 'pepplot');
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
      isValidSearchPepplot: false,
      multisetPlotAvailable: false,
      plotButtonActive: false,
      visible: false,
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
    const { pepplotFeatureIdKey } = this.state;
    this.setState({
      imageInfo: imageInfo,
      isItemSelected: true,
      isProteinSVGLoaded: false,
      // isProteinDataLoaded: false,
      // treeDataRaw: [],
      // treeData: [],
      // treeDataColumns: [],
      currentSVGs: [],
    });
    // const ProteinSiteVar = firstValue(dataItem.Protein_Site, true);
    debugger;
    this.handleSearchCriteriaChange(
      {
        pepplotStudy: this.props.pepplotStudy || '',
        pepplotModel: this.props.pepplotModel || '',
        pepplotTest: this.props.pepplotTest || '',
        pepplotProteinSite: dataItem[pepplotFeatureIdKey] || '',
        // pepplotProteinSite: ProteinSiteVar || '',
      },
      false,
    );
    // const { pepplotModel, pepplotStudy } = this.props;
    // const { pepplotPlotTypes } = this.state;
    // const handleSVGCb = this.handleSVG;
    getPlotCb(id);
    // id,
    // pepplotPlotTypes,
    // pepplotStudy,
    // pepplotModel,
    // imageInfo,
    // handleSVGCb,

    // LEAVE - will use when we add Tree Data / Accordion back in
    // if (pepplotModel !== 'Differential Expression') {
    //   phosphoprotService
    //     .getSiteData(id, pepplotStudy + 'plots')
    //     .then(treeDataResponse => {
    //       this.setState({
    //         treeDataRaw: treeDataResponse,
    //       });
    //       let tdCols = _.map(_.keys(treeDataResponse[0]), function(d) {
    //         return { key: d, field: d };
    //       });
    //       this.setState({
    //         treeDataColumns: tdCols,
    //       });
    //       let tD = _.map(treeDataResponse, function(d, i) {
    //         let entries = _.toPairs(d);

    //         entries = _.map(entries, function(e) {
    //           return { key: e[0], text: e[0], items: [{ text: e[1] }] };
    //         });
    //         return {
    //           key: i + 1,
    //           text: 'Peptide' + (i + 1) + '  (' + d.Modified_sequence + ')',
    //           items: entries,
    //         };
    //       });
    //       this.setState({
    //         treeData: tD,
    //         isProteinDataLoaded: true,
    //       });
    //     });
    // } else {
    //   phosphoprotService
    //     .getProteinData(id, pepplotStudy + 'plots')
    //     .then(proteinDataResponse => {
    //       this.setState({
    //         treeDataRaw: proteinDataResponse,
    //       });
    //       let tdCols = _.map(_.keys(proteinDataResponse[0]), function(d) {
    //         return { key: d, field: d };
    //       });
    //       this.setState({
    //         treeDataColumns: tdCols,
    //       });

    //       let proteinData = _.map(proteinDataResponse, function(d, i) {
    //         var entries = _.toPairs(d);
    //         entries = _.map(entries, function(e) {
    //           return { key: e[0], text: e[0], items: [{ text: e[1] }] };
    //         });
    //         return {
    //           key: i + 1,
    //           text: 'Differential Expression Data',
    //           items: entries,
    //         };
    //       });
    //       this.setState({
    //         treeData: proteinData,
    //       });
    //     });
    // }
  };
  getTableHelpers = (
    getProteinDataCb,
    getPlotCb,
    proteinToHighlightInDiffTable,
  ) => {
    let addParams = {};
    const { pepplotFeatureIdKey } = this.state;
    if (
      proteinToHighlightInDiffTable.length > 0 &&
      proteinToHighlightInDiffTable != null
    ) {
      addParams.rowHighlightOther = [];
      proteinToHighlightInDiffTable.forEach(element => {
        // addParams.rowHighlightOther.push(element.Protein_Site);
        addParams.rowHighlightOther.push(element[pepplotFeatureIdKey]);
      });
    }
    addParams.showPhosphositePlus = dataItem => {
      return function() {
        var protein = (dataItem.Protein
          ? dataItem.Protein
          : dataItem.MajorityProteinIDsHGNC
        ).split(';')[0];
        let param = { proteinNames: protein, queryId: -1, from: 0 };
        phosphoprotService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action',
        );
      };
    };

    addParams.showPlot = (dataItem, alphanumericTrigger) => {
      return function() {
        let imageInfo = { key: '', title: '', svg: [] };
        imageInfo.title =
          'Protein Intensity - ' + dataItem[alphanumericTrigger];
        imageInfo.key = dataItem[alphanumericTrigger];
        getProteinDataCb(
          dataItem[alphanumericTrigger],
          dataItem,
          getPlotCb,
          imageInfo,
        );
      };
    };
    this.setState({ additionalTemplateInfoPepplotTable: addParams });
  };

  getPlot = featureId =>
    // id
    // pepplotPlotTypes,
    // pepplotStudy,
    // pepplotModel,
    // imageInfo,
    // handleSVGCb,
    {
      debugger;
      // test this state
      const { pepplotFeatureIdKey, pepplotPlotTypes } = this.state;
      const { pepplotStudy, pepplotModel, pepplotProteinSite } = this.props;
      let id = featureId != null ? featureId : pepplotProteinSite;
      // let id = pepplotProteinSite;
      // pepplotPlotTypes,
      // pepplotStudy,
      // pepplotModel,
      // imageInfo,
      // handleSVGCb,
      let imageInfo = { key: '', title: '', svg: [] };
      imageInfo.title = 'Protein Intensity - ' + pepplotFeatureIdKey;
      imageInfo.key = pepplotFeatureIdKey;
      let handleSVGCb = this.handleSVG;

      // let self = this;
      let currentSVGs = [];
      // keep whatever dimension is less (height or width)
      // then multiply the other dimension by original svg ratio (height 595px, width 841px)
      // let PepplotPlotSVGHeight = this.calculateHeight(this);
      let PepplotPlotSVGWidth = this.calculateWidth() * 0.7;
      // if (PepplotPlotSVGHeight > PepplotPlotSVGWidth) {
      let PepplotPlotSVGHeight = PepplotPlotSVGWidth * 0.70749;
      // } else {
      //   PepplotPlotSVGWidth = PepplotPlotSVGHeight * 1.41344;
      // }
      let handleItemSelectedCb = this.handleItemSelected;
      cancelRequestPepplotResultsGetPlot();
      let cancelToken = new CancelToken(e => {
        cancelRequestPepplotResultsGetPlot = e;
      });
      if (pepplotPlotTypes.length > 0) {
        _.forEach(pepplotPlotTypes, function(plot, i) {
          phosphoprotService
            .plotStudy(
              pepplotStudy,
              pepplotModel,
              id,
              pepplotPlotTypes[i].plotID,
              handleItemSelectedCb,
              cancelToken,
            )
            .then(svgMarkupObj => {
              let svgMarkup = svgMarkupObj.data;
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
                `<svg preserveAspectRatio="xMinYMin meet" style="width:${PepplotPlotSVGWidth}px" height:${PepplotPlotSVGHeight} id="currentSVG-${id}-${i}"`,
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
                plotType: pepplotPlotTypes[i],
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
              debugger;
              handleSVGCb(imageInfo);
            })
            .catch(error => {
              this.handleItemSelected(false);
            });
        });
      }
    };
  getProteinPageFromUrl = (
    getProteinDataCb,
    getPlotCb,
    pepplotModel,
    dataItem,
  ) => {
    debugger;
    let imageInfo = { key: '', title: '', svg: [] };
    imageInfo.title =
      'Protein Intensity - ' + dataItem[this.state.pepplotFeatureIdKey];
    imageInfo.key = dataItem[this.state.pepplotFeatureIdKey];
    getProteinDataCb(
      dataItem[this.state.pepplotFeatureIdKey],
      dataItem,
      getPlotCb,
      imageInfo,
    );
  };
  pageToProtein = (data, proteinToHighlight, itemsPerPage) => {
    const { pepplotFeatureIdKey } = this.state;
    if (this.pepplotGridRef?.current != null) {
      const Index = _.findIndex(data, function(p) {
        return p[pepplotFeatureIdKey] === proteinToHighlight;
        // return p.Protein_Site === proteinToHighlight;
      });
      const pageNumber = Math.ceil(Index / itemsPerPage);
      this.pepplotGridRef.current.handlePageChange(
        {},
        { activePage: pageNumber },
      );
    }
  };
  // handleSelectedFromTable = toHighlightArr => {
  //   const { pepplotStudy, pepplotModel } = this.props;
  //   this.setState({ selectedFromTableData: toHighlightArr });
  //   this.getTableHelpers(this.getProteinData, this.getPlot, toHighlightArr);
  //   if (toHighlightArr.length === 0) {
  //     this.setState({
  //       isProteinSVGLoaded: false,
  //       // isProteinDataLoaded: false,
  //       isItemSelected: false,
  //       selectedFromTableData: [],
  //     });
  //   } else if (toHighlightArr.length === 1) {
  //     this.setState({ isProteinSVGLoaded: false });
  //     //TODO: Get SVG and plot info.
  //     let plotType = ['splineplot'];
  //     switch (pepplotModel) {
  //       case 'DonorDifferentialPhosphorylation':
  //         plotType = ['dotplot'];
  //         break;
  //       case 'TreatmentDifferentialPhosphorylation':
  //         plotType = ['splineplot'];
  //         break;
  //       case 'Treatment and or Strain Differential Phosphorylation':
  //         plotType = ['StrainStimDotplot', 'StimStrainDotplot'];
  //         break;
  //       case 'Timecourse Differential Phosphorylation':
  //         plotType = ['splineplot', 'lineplot'];
  //         break;
  //       case 'Differential Expression':
  //         if (pepplotStudy === '***REMOVED***') {
  //           plotType = ['proteinlineplot'];
  //         } else {
  //           plotType = ['proteindotplot'];
  //         }
  //         break;
  //       case 'Differential Phosphorylation':
  //         if (pepplotStudy === '***REMOVED***') {
  //           plotType = ['proteinlineplot'];
  //         } else {
  //           plotType = ['proteindotplot'];
  //         }
  //         break;
  //       case 'No Pretreatment Timecourse Differential Phosphorylation':
  //         plotType = ['splineplot.modelII', 'lineplot.modelII'];
  //         break;
  //       case 'Ferrostatin Pretreatment Timecourse Differential Phosphorylation':
  //         plotType = ['splineplot.modelIII', 'lineplot.modelIII'];
  //         break;
  //       default:
  //         plotType = ['dotplot'];
  //     }
  //     let id = toHighlightArr[0]?.id_mult
  //       ? toHighlightArr[0]?.id_mult
  //       : toHighlightArr[0]?.id;
  //     let imageInfo = { key: '', title: '', svg: [] };
  //     switch (pepplotModel) {
  //       case 'Differential Expression':
  //         imageInfo.title =
  //           'Protein Intensity - ' + toHighlightArr[0].MajorityProteinIDs;
  //         imageInfo.key = toHighlightArr[0].MajorityProteinIDs;
  //         break;
  //       default:
  //         imageInfo.title =
  //           'Phosphosite Intensity - ' + toHighlightArr[0].Protein_Site;
  //         imageInfo.key = toHighlightArr[0].Protein_Site;
  //     }
  //     const handleSVGCb = this.handleSVG;
  //     this.getPlot(id, plotType, pepplotStudy, imageInfo, handleSVGCb);
  //   } else {
  //     this.setState({ isProteinSVGLoaded: false });
  //   }
  // };
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
    });
  };
  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    if (w > 1199) {
      return w * 0.7;
    } else if (w < 1200 && w > 767) {
      return w * 0.6;
    } else return w * 0.8;
  }
  backToTable = () => {
    this.setState({
      isItemSelected: false,
      // isProteinDataLoaded: false,
      isProteinSVGLoaded: true,
    });
    this.handleSearchCriteriaChange(
      {
        pepplotStudy: this.props.pepplotStudy || '',
        pepplotModel: this.props.pepplotModel || '',
        pepplotTest: this.props.pepplotTest || '',
        pepplotProteinSite: '',
      },
      false,
    );
  };
  getConfigCols = testData => {
    const pepResults = testData.pepplotResults;
    // const { pepplotModel } = this.props;
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
    let pepplotAlphanumericFields = [];
    let pepplotNumericFields = [];
    const firstObject = pepResults[0];
    for (let [key, value] of Object.entries(firstObject)) {
      if (typeof value === 'string' || value instanceof String) {
        pepplotAlphanumericFields.push(key);
      } else {
        pepplotNumericFields.push(key);
      }
    }
    const alphanumericTrigger = pepplotAlphanumericFields[0];
    console.log(alphanumericTrigger);
    console.log(this.state.pepplotFeatureIdKey);
    console.log(this.state.pepplotPlotTypes);
    console.log(this.props.pepplotProteinSite);
    this.setState(
      { pepplotFeatureIdKey: alphanumericTrigger },
      this.getTableHelpers(
        this.getProteinData,
        this.getPlot,
        this.state.selectedFromTableData,
      ),
    );
    const pepplotAlphanumericColumnsMapped = pepplotAlphanumericFields.map(
      f => {
        return {
          title: f,
          field: f,
          filterable: { type: 'alphanumericFilter' },
          template: (value, item, addParams) => {
            if (f === alphanumericTrigger) {
              return (
                <div>
                  <Popup
                    trigger={
                      <span
                        className="TableCellLink"
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
                <div>
                  <Popup
                    trigger={<span>{splitValue(value)}</span>}
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
    const thresholdColsPepplot = this.listToJson(pepplotNumericFields);
    this.setState({
      thresholdColsP: thresholdColsPepplot,
    });
    this.setState({ filterableColumnsP: [...pepplotNumericFields] });
    const pepplotNumericColumnsMapped = pepplotNumericFields.map(c => {
      return {
        title: c,
        field: c,
        type: 'number',
        filterable: { type: 'numericFilter' },
        exportTemplate: value => (value ? `${value}` : 'N/A'),
        template: (value, item, addParams) => {
          return (
            <p>
              <Popup
                trigger={
                  <span className="TableValue  NoSelect">
                    {formatNumberForDisplay(value)}
                  </span>
                }
                style={TableValuePopupStyle}
                className="TablePopupValue"
                content={value}
                inverted
                basic
              />
            </p>
          );
        },
      };
    });
    const configCols = pepplotAlphanumericColumnsMapped.concat(
      pepplotNumericColumnsMapped,
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
    } else if (this.state.isItemSelected && this.state.isProteinSVGLoaded) {
      return (
        <PepplotPlot
          // ref={this.PepplotViewContainerRef}
          {...this.props}
          {...this.state}
          onBackToTable={this.backToTable}
        ></PepplotPlot>
      );
    } else if (
      this.state.isValidSearchPepplot &&
      !this.state.showProteinPage &&
      !this.state.isSearchingPepplot
    ) {
      const TableAndPlotPanes = this.getTableAndPlotPanes();
      return (
        <Tab
          className="TableAndPlotContainer"
          panes={TableAndPlotPanes}
          onTabChange={this.handleTablePlotTabChange}
          activeIndex={this.state.activeIndexPepplotView}
          renderActiveOnly={false}
          menu={{
            attached: true,
            className: 'TableAndPlotMenuContainer',
          }}
        />
      );
    } else if (this.state.isSearchingPepplot) {
      return <TransitionActive />;
    } else return <TransitionStill />;
  };

  getTableAndPlotPanes = () => {
    return [
      {
        menuItem: (
          <Menu.Item
            key="0"
            className="TableAndNPlotButtons TableButton"
            name="Table"
            color="orange"
          >
            <img
              src={
                this.state.activeIndexPepplotView === 0
                  ? tableIconSelected
                  : tableIcon
              }
              alt="Table Icon"
              id="TableButton"
            />
          </Menu.Item>
        ),
        pane: (
          <Tab.Pane key="0" className="PepplotContentPane">
            <PepplotResults
              {...this.state}
              {...this.props}
              // onSearchCriteriaChange={this.handleSearchCriteriaChange}
              onHandlePlotAnimation={this.handlePlotAnimation}
            />
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
                this.state.activeIndexPepplotView === 1
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
            className="PepplotContentPane"
            id="PepplotContentPane"
          >
            {/* <PepplotVolcano
              {...this.state}
              {...this.props}
              handleVolcanoPlotSelectionChange={
                this.handleVolcanoPlotSelectionChange
              }
              onSelectFromTable={this.handleSelectedFromTable}
              onSVGTabChange={this.handleSVGTabChange}
            /> */}
          </Tab.Pane>
        ),
      },
    ];
  };

  handleTablePlotTabChange = (e, { activeIndex }) => {
    sessionStorage.setItem(`pepplotViewTab`, activeIndex);
    this.setState({ activeIndexPepplotView: activeIndex });
  };

  render() {
    const pepplotView = this.getView();
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
          className="MultisetSvgSpan"
          id="MultisetSvgOuter"
          dangerouslySetInnerHTML={{ __html: multisetPlotInfo.svg }}
        ></div>
      </Sidebar>
    );
    return (
      <Grid>
        <Grid.Row className="PepplotContainer">
          <Grid.Column
            className="SidebarContainer"
            mobile={16}
            tablet={16}
            largeScreen={4}
            widescreen={4}
          >
            <PepplotSearchCriteria
              {...this.state}
              {...this.props}
              onSearchTransitionPepplot={this.handleSearchTransitionPepplot}
              onPepplotSearch={this.handlePepplotSearch}
              onPepplotSearchUnfiltered={this.handlePepplotSearchUnfiltered}
              onSearchCriteriaChange={this.handleSearchCriteriaChange}
              onSearchCriteriaReset={this.hidePGrid}
              onDisablePlot={this.disablePlot}
              onGetMultisetPlot={this.handleMultisetPlot}
              onHandlePlotAnimation={this.handlePlotAnimation}
              onMultisetQueried={this.handleMultisetQueried}
              onSetStudyModelTestMetadata={this.setStudyModelTestMetadata}
              onSetTestsMetadata={this.setTestsMetadata}
              onHandlePlotTypes={this.handlePlotTypes}
            />
          </Grid.Column>
          <Grid.Column
            className="PepplotContentContainer"
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
                <div className="PepplotViewContainer">{pepplotView}</div>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withRouter(Pepplot);

function firstValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    return firstValue;
  }
}
