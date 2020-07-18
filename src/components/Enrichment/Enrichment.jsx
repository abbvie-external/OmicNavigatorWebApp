import DOMPurify from 'dompurify';
import _ from 'lodash';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Menu, Popup, Sidebar, Tab, Message } from 'semantic-ui-react';
import { CancelToken } from 'axios';
import go_icon from '../../resources/go.png';
import msig_icon from '../../resources/msig.ico';
import networkIcon from '../../resources/networkIcon.png';
import networkIconSelected from '../../resources/networkIconSelected.png';
import phosphosite_icon from '../../resources/phosphosite.ico';
import reactome_icon from '../../resources/reactome.jpg';
import tableIcon from '../../resources/tableIcon.png';
import tableIconSelected from '../../resources/tableIconSelected.png';
import { phosphoprotService } from '../../services/phosphoprot.service';
import ButtonActions from '../Shared/ButtonActions';
import * as d3 from 'd3';
import {
  formatNumberForDisplay,
  splitValue,
  // getIconInfo
} from '../Shared/helpers';
import '../Shared/Table.scss';
import SearchingAlt from '../Transitions/SearchingAlt';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import './Enrichment.scss';
import EnrichmentResultsGraph from './EnrichmentResultsGraph';
import EnrichmentResultsTable from './EnrichmentResultsTable';
import EnrichmentSearchCriteria from './EnrichmentSearchCriteria';
import SplitPanesContainer from './SplitPanesContainer';

let cancelRequestEnrichmentGetPlot = () => {};
class Enrichment extends Component {
  defaultEnrichmentActiveIndex =
    parseInt(sessionStorage.getItem('enrichmentViewTab'), 10) || 0;

  state = {
    isValidSearchEnrichment: false,
    isSearchingEnrichment: false,
    enrichmentIcon: '',
    enrichmentIconText: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    enrichmentFeatureID: '',
    enrichmentPlotSVGHeight: 0,
    enrichmentPlotSVGWidth: 0,
    activeIndexEnrichmentView: this.defaultEnrichmentActiveIndex || 0,
    multisetPlotInfo: {
      title: '',
      svg: [],
    },
    multisetPlotAvailable: false,
    animation: 'uncover',
    direction: 'left',
    visible: false,
    plotButtonActive: false,
    uData: [],
    excelVisible: false,
    pngVisible: true,
    pdfVisible: false,
    svgVisible: true,
    displayViolinPlot: true,
    // networkDataAvailable: false,
    networkData: {
      nodes: [],
      links: [],
      tests: [],
    },
    unfilteredNetworkData: {
      nodes: [],
      links: [],
      tests: [],
    },
    filterNetworkFromUpset: [],
    networkDataLoaded: false,
    networkGraphReady: false,
    networkDataError: false,
    tests: {},
    nodeCutoff: sessionStorage.getItem('nodeCutoff') || 0.1,
    linkCutoff: sessionStorage.getItem('linkCutoff') || 0.4,
    linkType: sessionStorage.getItem('linkType') || 0.5,
    filteredNodesTotal: 0,
    filteredLinksTotal: 0,
    totalNodes: 0,
    totalLinks: 0,
    legendIsOpen: true,
    // legendIsOpen: JSON.parse(sessionStorage.getItem('legendOpen')) || true,
    networkSettings: {
      facets: {},
      propLabel: {},
      metaLabels: ['description', 'termID'],
      meta: ['description', 'termID'],
      facetAndValueLabel: ['Test', 'pValue'],
      nodeLabel: 'description',
      radiusScale: [10, 50],
      lineScale: [1, 10],
      nodeSize: 'geneSetSize',
      linkSize: 'overlapSize',
      linkMetaLabels: ['Overlap Size', 'Source', 'Target'],
      linkMeta: ['overlapSize', 'source', 'target'],
      linkMetaLookup: ['description', 'description'],
      nodeColorScale: [0, 0.1, 1],
      nodeColors: ['red', 'white', 'blue'],
      mostSignificantColorScale: ['#B78628', '#DBA514', '#FCC201'],
      title: '',
      id: 'chart-network',
      margin: { top: 50, right: 50, bottom: 50, left: 0 },
      duration: 1000,
    },
    annotationData: [],
    enrichmentDataItem: [],
    enrichmentTerm: '',
    itemsPerPageInformedEnrichmentMain: null,
    treeDataRaw: [],
    treeData: [],
    treeDataColumns: [],
    plotType: [],
    imageInfo: {
      key: null,
      title: '',
      svg: [],
      dataItem: '',
    },
    cachedSVGs: [],
    isTestSelected: false,
    isTestDataLoaded: false,
    SVGPlotLoading: false,
    SVGPlotLoaded: false,
    isViolinPlotLoaded: false,
    barcodeSettings: {
      barcodeData: [],
      brushedData: [],
      lineID: '',
      statLabel: {},
      statistic: 'statistic',
      logFC: 'logFC',
      highLabel: {},
      lowLabel: {},
      highStat: null,
      enableBrush: false,
    },
    violinSettings: {
      axisLabels: {
        xAxis: 'abs(t)',
        yAxis: "log<tspan baseline-shift='sub' font-size='14px'>2</tspan>FC",
      },
      // axisLabels: { xAxis: this.term, yAxis: "log<tspan baseline-shift='sub' font-size='14px'>2</tspan>(FC)" },
      id: 'violin-graph-1',
      pointUniqueId: 'sample',
      pointValue: 'cpm',
      title: '',
      subtitle: '',
      tooltip: {
        show: true,
        fields: [
          { label: 'log(FC)', value: 'cpm', toFixed: true },
          { label: 'Feature', value: 'sample' },
          // { label: 'featureID', value: 'featureID' },
          // { label: 'abs(t)', value: 'statistic', toFixed: true },
        ],
      },
      xName: 'tissue',
      constrainExtremes: false,
      color: d3.scaleOrdinal(d3.schemeCategory10),
      margin: { top: 10, right: 10, bottom: 50, left: 50 },
      scale: 'linear',
      yName: null,
      yTicks: 1,
    },
    violinData: [],
    HighlightedProteins: [],
    enrichmentPlotTypes: [],
    enrichmentStudyMetadata: [],
    enrichmentModelsAndAnnotations: [],
    enrichmentAnnotationsMetadata: [],
    enrichmentFeatureIdKey: '',
    multisetFiltersVisible: false,
    reloadPlot: false,
    networkSigValue: '0.05',
    networkOperator: '<',
    networkTestsMust: [],
    networkTestsNot: [],
    previousEnrichmentStudy: '',
    previousEnrichmentModel: '',
    previousEnrichmentAnnotation: '',
  };
  EnrichmentViewContainerRef = React.createRef();

  componentDidMount() {
    this.getTableHelpers(this.testSelectedTransition, this.showBarcodePlot);
    // let resizedFn;
    // window.addEventListener('resize', () => {
    //   clearTimeout(resizedFn);
    //   resizedFn = setTimeout(() => {
    //     this.windowResized();
    //   }, 200);
    // });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.enrichmentResults !== prevState.enrichmentResults) {
      const DescriptionAndTest = this.props.enrichmentDescriptionAndTest || '';
      if (DescriptionAndTest !== '') {
        const AllDescriptionsAndTests = this.state.enrichmentResults;
        const ResultsLength = this.state.enrichmentResults.length;
        if (ResultsLength > 0) {
          const dataItemDescription = getDataItemDescription(
            DescriptionAndTest,
          );
          const dataItemIndex = _.findIndex(AllDescriptionsAndTests, function(
            d,
          ) {
            return d.description === dataItemDescription;
          });
          const dataItem = AllDescriptionsAndTests[dataItemIndex];
          const test = getTestName(DescriptionAndTest);
          // const testNameIndex = _.findIndex(dataItem, function(n) {
          //   return n.key === testName;
          // });
          // const test = dataItem[testNameIndex];
          this.getThreePlotsFromUrl(
            this.props.enrichmentStudy,
            this.props.enrichmentModel,
            this.props.enrichmentAnnotation,
            dataItem,
            test,
            this.testSelectedTransition,
            this.showBarcodePlot,
          );
        }
      }
    }
  }

  // windowResized = () => {
  //   this.setState({
  //     nodeCutoff: this.state.nodeCutoff,
  //     linkCutoff: this.state.linkCutoff,
  //   });
  // };

  getThreePlotsFromUrl = (
    enrichmentStudy,
    enrichmentModel,
    enrichmentAnnotation,
    dataItem,
    test,
    testSelectedTransitionCb,
    showBarcodePlotCb,
  ) => {
    let self = this;
    testSelectedTransitionCb(true);
    // const TestSiteVar = `${test}:${dataItem.description}`;
    // let xLargest = 0;
    // let imageInfo = { key: '', title: '', svg: [] };
    // phosphoprotService
    //   .getDatabaseInfo(
    //     enrichmentStudy + 'plots',
    //     enrichmentAnnotation,
    //     this.handleGetDatabaseInfoError,
    //   )
    //   .then(annotationDataResponse => {
    //     const annotationDataParsed = JSON.parse(annotationDataResponse);
    //     self.setState({
    //       annotationData: annotationDataParsed,
    //     });
    //     dataItem.Annotation = _.find(annotationDataParsed, {
    //       Description: dataItem.description,
    //     }).Key;
    let term = dataItem.termID;
    self.setState({
      imageInfo: {
        ...self.state.imageInfo,
        key: `${test}:${dataItem.description}`,
        title: `${test}:${dataItem.description}`,
      },
      enrichmentNameLoaded: true,
      enrichmentDataItem: dataItem,
      enrichmentTerm: term,
    });

    phosphoprotService
      .getBarcodeData(
        enrichmentStudy,
        enrichmentModel,
        test,
        enrichmentAnnotation,
        term,
        this.handleGetBarcodeDataError,
      )
      .then(barcodeDataResponse => {
        if (barcodeDataResponse?.data?.length > 0) {
          const logFoldChangeArr = barcodeDataResponse.data.map(
            b => b.logFoldChange,
          );
          const isZero = logFoldChangeVal => logFoldChangeVal === 0;
          if (logFoldChangeArr.every(isZero)) {
            this.setState({
              displayViolinPlot: false,
            });
          } else {
            this.setState({
              displayViolinPlot: true,
            });
          }
          showBarcodePlotCb(barcodeDataResponse, dataItem);
        }
      })
      .catch(error => {
        console.error('Error during getBarcodeData', error);
      });
    // })
    // .catch(error => {
    //   console.error('Error during getDatabaseInfo', error);
    // });
  };

  handleSearchTransitionEnrichment = bool => {
    this.setState({
      isSearchingEnrichment: bool,
    });
  };

  setStudyModelAnnotationMetadata = (studyData, modelsAndAnnotations) => {
    this.setState(
      {
        enrichmentStudyMetadata: studyData,
        enrichmentModelsAndAnnotations: modelsAndAnnotations,
      },
      function() {
        this.handlePlotTypesEnrichment(this.props.enrichmentModel);
      },
    );
  };

  setAnnotationsMetadata = annotationsData => {
    this.setState({
      enrichmentAnnotationsMetadata: annotationsData,
    });
  };

  handleMulisetFiltersVisible = bool => {
    this.setState({
      multisetFiltersVisible: bool,
    });
  };

  handleNetworkSigValue = val => {
    this.setState({
      networkSigValue: val.toString(),
    });
  };

  handleNetworkOperator = op => {
    this.setState({
      networkOperator: op,
    });
  };
  handleNetworkTests = (must, not) => {
    this.setState({
      networkTestsMust: must,
      networkTestsNot: not,
    });
  };

  handleEnrichmentSearch = searchResults => {
    this.removeNetworkSVG();
    this.setState({ networkGraphReady: false });

    // PAUL - talk to justin about this - has to do with column reordering, i think
    // if (this.state.enrichmentColumns.length === 0) {
    //   this.handleColumns(searchResults);
    // }
    let columns = [];
    if (searchResults.enrichmentResults?.length > 0) {
      columns = this.getConfigCols(searchResults);
    }
    this.getNetworkData(searchResults.enrichmentResults);
    this.setState({
      networkDataError: false,
      enrichmentResults: searchResults.enrichmentResults,
      isSearching: false,
      isSearchingEnrichment: false,
      isValidSearchEnrichment: true,
      plotButtonActive: false,
      visible: false,
      isTestSelected: false,
      isTestDataLoaded: false,
      enrichmentColumns: columns,
    });
  };

  // handleColumns = searchResults => {
  //   const columns = this.getConfigCols(searchResults);
  //   this.setState({ enrichmentColumns: columns });
  // };

  handlePlotTypesEnrichment = enrichmentModel => {
    if (enrichmentModel !== '') {
      if (this.state.enrichmentStudyMetadata.plots != null) {
        const enrichmentModelData = this.state.enrichmentStudyMetadata.plots.find(
          model => model.modelID === enrichmentModel,
        );
        this.setState({
          enrichmentPlotTypes: enrichmentModelData.plots,
        });
      }
    }
  };

  handleSearchCriteriaChange = (changes, scChange) => {
    this.props.onSearchCriteriaToTop(changes, 'enrichment');
    this.setState({
      plotButtonActive: false,
      visible: false,
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

  hideEGrid = () => {
    this.setState({
      isTestSelected: false,
      isTestDataLoaded: false,
      isValidSearchEnrichment: false,
      multisetPlotAvailable: false,
      plotButtonActive: false,
      visible: false,
      // displayViolinPlot: false,
    });
  };

  handlePlotAnimation = animation => () => {
    this.setState(prevState => ({
      animation,
      visible: !prevState.visible,
      plotButtonActive: !this.state.plotButtonActive,
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

  getConfigCols = annotationData => {
    const enrResults = annotationData.enrichmentResults;
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
    } = this.props;
    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };
    let icon = '';
    let iconText = '';
    // let dbShort = '';
    if (enrichmentAnnotation === 'REACTOME') {
      icon = reactome_icon;
      iconText = 'Reactome';
      // dbShort = 'REACTOME';
    } else if (enrichmentAnnotation.substring(0, 2) === 'GO') {
      icon = go_icon;
      iconText = 'AmiGO 2';
      if (enrichmentAnnotation.substring(3, 4) === 'B') {
        // dbShort = 'GOBP';
      } else if (enrichmentAnnotation.substring(3, 4) === 'C') {
        // dbShort = 'GOCC';
      } else if (enrichmentAnnotation.substring(3, 4) === 'M') {
        // dbShort = 'GOMF';
      }
    } else if (enrichmentAnnotation.substring(0, 4) === 'msig') {
      icon = msig_icon;
      iconText = 'GSEA MSigDB';
    } else if (enrichmentAnnotation === 'PSP') {
      icon = phosphosite_icon;
      iconText = 'PhosphoSitePlus';
    }
    this.setState({
      enrichmentIcon: icon,
      enrichmentIconText: iconText,
    });
    let enrichmentAlphanumericFields = [];
    let enrichmentNumericFields = [];
    const firstObject = enrResults[0];
    for (let [key, value] of Object.entries(firstObject)) {
      if (typeof value === 'string' || value instanceof String) {
        enrichmentAlphanumericFields.push(key);
      } else {
        enrichmentNumericFields.push(key);
      }
    }
    const alphanumericTrigger = enrichmentAlphanumericFields[0];
    this.setState({ enrichmentFeatureIdKey: alphanumericTrigger });
    const enrichmentAlphanumericColumnsMapped = enrichmentAlphanumericFields.map(
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
                      <span className="TableValue  NoSelect">
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
                        alt={iconText}
                        className="ExternalSiteIcon"
                        onClick={addParams.getLink(
                          enrichmentStudy,
                          enrichmentAnnotation,
                          item,
                        )}
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
                    trigger={
                      <span className="TableValue  NoSelect">
                        {splitValue(value)}
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
            }
          },
        };
      },
    );

    // multiset svg rebuilds based on uData...if there are no results we need to override this from being passed down
    if (enrichmentNumericFields.length !== 0) {
      this.setState({
        uData: enrichmentNumericFields,
      });
    }
    const enrichmentNumericColumnsMapped = enrichmentNumericFields.map(c => {
      return {
        title: c,
        field: c,
        type: 'number',
        filterable: { type: 'numericFilter' },
        exportTemplate: value => (value ? `${value}` : 'N/A'),
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span
                    className="TableCellLink"
                    onClick={addParams.barcodeData(
                      enrichmentStudy,
                      enrichmentModel,
                      enrichmentAnnotation,
                      item,
                      c,
                    )}
                  >
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
    });

    const configCols = enrichmentAlphanumericColumnsMapped.concat(
      enrichmentNumericColumnsMapped,
    );
    return configCols;
  };

  removeNetworkSVG = () => {
    d3.select('div.tooltip-pieSlice').remove();
    d3.select('tooltipLink').remove();
    d3.select(`#svg-${this.state.networkSettings.id}`).remove();
  };

  getNetworkData = enrichmentResults => {
    const {
      enrichmentModel,
      enrichmentAnnotation,
      // pValueType,
      enrichmentStudy,
    } = this.props;
    const {
      networkData,
      previousEnrichmentStudy,
      previousEnrichmentModel,
      previousEnrichmentAnnotation,
      unfilteredNetworkData,
    } = this.state;
    if (
      enrichmentStudy !== previousEnrichmentStudy ||
      enrichmentModel !== previousEnrichmentModel ||
      enrichmentAnnotation !== previousEnrichmentAnnotation ||
      networkData.nodes.length === 0
    ) {
      this.setState({
        previousEnrichmentStudy: enrichmentStudy,
        previousEnrichmentModel: enrichmentModel,
        previousEnrichmentAnnotation: enrichmentAnnotation,
      });
      phosphoprotService
        .getEnrichmentsNetwork(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          this.handleGetEnrichmentNetworkError,
        )
        .then(getEnrichmentNetworkResponseData => {
          this.setState(
            {
              unfilteredNetworkData: getEnrichmentNetworkResponseData,
            },
            this.handleEnrichmentNetworkData(
              getEnrichmentNetworkResponseData,
              enrichmentResults,
            ),
          );
        })
        .catch(error => {
          console.error('Error during getEnrichmentNetwork', error);
        });
    } else {
      this.handleEnrichmentNetworkData(
        unfilteredNetworkData,
        enrichmentResults,
      );
    }
  };

  handleEnrichmentNetworkData = (unfilteredNetworkData, enrichmentResults) => {
    // const pValueTypeParam = pValueType === 'adjusted' ? 0.1 : 1;
    let networkDataVar = { ...unfilteredNetworkData };
    const tests = unfilteredNetworkData.tests;
    const enrichmentResultsDescriptions = [...enrichmentResults].map(
      r => r.description,
    );
    const filteredNodes = unfilteredNetworkData.nodes.filter(n =>
      enrichmentResultsDescriptions.includes(n.description),
    );
    networkDataVar.nodes = filteredNodes;
    this.setState({
      // networkDataAvailable: true,
      networkData: networkDataVar,
      tests: tests,
      // totalNodes: data.nodes.length,
      totalNodes: unfilteredNetworkData.nodes.length,
      totalLinks: unfilteredNetworkData.links.length,
    });
    let facets = [];
    let pieData = [];
    const isArray = Array.isArray(tests);
    const testsLength = typeof tests === 'string' ? 1 : tests.length;
    if (isArray) {
      for (var i = 0; i < testsLength; i++) {
        let rplcSpaces = unfilteredNetworkData.tests[i].replace(/ /g, '_');
        facets.push('EnrichmentMap_pvalue_' + rplcSpaces + '_');
        pieData.push(100 / testsLength);
      }
    } else {
      facets.push(tests);
      pieData.push(testsLength);
    }
    this.setState({
      networkSettings: {
        ...this.state.networkSettings,
        facets: facets,
        propLabel: tests,
        propData: pieData,
      },
      networkDataLoaded: true,
      networkGraphReady: true,
    });
  };

  handleGetEnrichmentNetworkError = () => {
    this.setState({
      networkSettings: {
        ...this.state.networkSettings,
        facets: [],
        propLabel: [],
        propData: [],
      },
      networkDataError: true,
    });
  };

  calculateHeight = () => {
    let containerHeight =
      this.EnrichmentViewContainerRef.current !== null
        ? this.EnrichmentViewContainerRef.current.parentElement.offsetHeight
        : 900;
    let barcodeHeight =
      parseInt(sessionStorage.getItem('horizontalSplitPaneSize'), 10) || 250;
    // subtracting 120 due to menu and plot margin
    return containerHeight - barcodeHeight - 120;
  };

  calculateWidth = () => {
    let containerWidth =
      this.EnrichmentViewContainerRef.current !== null
        ? this.EnrichmentViewContainerRef.current.parentElement.offsetWidth
        : 1200;
    let violinWidth =
      parseInt(sessionStorage.getItem('verticalSplitPaneSize'), 10) || 525;
    // subtracting 80 due to plot margin
    return containerWidth - violinWidth - 60;
  };

  showBarcodePlot = (barcodeData, dataItem) => {
    // sorting by statistic is being handled by backend
    // const barcodeDataSorted = barcodeData.data.sort(
    //   (a, b) => b.statistic - a.statistic,
    // );
    this.setState({
      isTestDataLoaded: true,
      barcodeSettings: {
        ...this.state.barcodeSettings,
        barcodeData: barcodeData.data,
        statLabel: barcodeData.labelStat,
        highLabel: barcodeData.labelHigh,
        lowLabel: barcodeData.labelLow,
        highStat: barcodeData.highest,
        enableBrush: true,
      },
    });
  };

  handleBarcodeChanges = changes => {
    let self = this;
    if (changes.brushedData.length > 0) {
      const boxPlotArray = _.map(changes.brushedData, function(d) {
        d.statistic = _.find(self.state.barcodeSettings.barcodeData, {
          featureID: d.featureID,
        }).statistic;
        d.logFC = _.find(self.state.barcodeSettings.barcodeData, {
          featureID: d.featureID,
        }).logFoldChange;
        return d;
      });
      const reducedBoxPlotArray = _.reduce(
        boxPlotArray,
        function(res, datum) {
          // (res[datum.statLabel] || (res[datum.statLabel] = [])).push({
          (
            res[self.state.barcodeSettings.statLabel] ||
            (res[self.state.barcodeSettings.statLabel] = [])
          ).push({
            cpm: datum.logFC,
            sample: datum.lineID,
            statistic: datum.statistic,
            featureID: datum.featureID,
          });
          return res;
        },
        {},
      );

      const vData = _.mapValues(reducedBoxPlotArray, function(v) {
        return { values: v };
      });
      const ordered = {};
      Object.keys(vData)
        .sort()
        .forEach(function(key) {
          ordered[key] = vData[key];
        });

      this.setState({
        violinData: ordered,
        isViolinPlotLoaded: true,
        barcodeSettings: {
          ...this.state.barcodeSettings,
          brushedData: changes.brushedData,
        },
      });
    } else {
      this.setState({
        violinData: [],
        isViolinPlotLoaded: false,
        barcodeSettings: {
          ...this.state.barcodeSettings,
          brushedData: [],
        },
        SVGPlotLoaded: false,
        SVGPlotLoading: false,
        // imageInfo: {
        //   key: null,
        //   title: '',
        //   svg: []
        // }
      });
    }
  };

  handleHighlightedLineReset = emptyArr => {
    this.setState(emptyArr);
  };

  handleProteinSelected = toHighlightArray => {
    const prevHighestValueObject = this.state.HighlightedProteins[0]?.featureID;
    const highestValueObject = toHighlightArray[0];
    if (
      this.state.barcodeSettings.barcodeData?.length > 0 &&
      toHighlightArray.length > 0
    ) {
      this.setState({
        HighlightedProteins: toHighlightArray,
      });
      if (
        highestValueObject?.featureID !== prevHighestValueObject ||
        this.state.SVGPlotLoaded === false
      ) {
        this.setState({
          SVGPlotLoaded: false,
          SVGPlotLoading: true,
        });
        const dataItem = this.state.barcodeSettings.barcodeData.find(
          i => i.featureID === highestValueObject?.featureID,
        );
        let id = dataItem.featureID || '';
        this.getPlot(id);
      }
    } else {
      cancelRequestEnrichmentGetPlot();
      this.setState({
        SVGPlotLoaded: false,
        SVGPlotLoading: false,
        HighlightedProteins: [],
        // imageInfo: {
        //   ...this.state.imageInfo,
        //   svg: []
        // },
      });
    }
  };

  getPlot = featureId => {
    const { enrichmentPlotTypes } = this.state;
    const { enrichmentStudy, enrichmentModel } = this.props;
    const self = this;
    let handleSVGCb = this.handleSVG;
    if (featureId !== this.state.enrichmentFeatureID) {
      this.setState({
        enrichmentFeatureID: featureId,
      });
      let id = featureId != null ? featureId : '';
      let imageInfoCopy = { ...this.state.imageInfo };
      // let imageInfo = { key: '', title: '', svg: [] };
      // imageInfo.title = this.state.imageInfo.title;
      // imageInfo.key = this.state.imageInfo.key;
      // let currentSVGs = [];

      let handlePlotStudyError = this.handlePlotStudyError;
      // keep whatever dimension is less (height or width)
      // then multiply the other dimension by original svg ratio (height 595px, width 841px)
      let EnrichmentPlotSVGHeight = this.calculateHeight();
      let EnrichmentPlotSVGWidth = this.calculateWidth();
      // EnrichmentPlotSVGHeight = EnrichmentPlotSVGWidth * 0.70749;
      if (EnrichmentPlotSVGHeight + 60 > EnrichmentPlotSVGWidth) {
        EnrichmentPlotSVGHeight = EnrichmentPlotSVGWidth * 0.70749;
      } else {
        EnrichmentPlotSVGWidth = EnrichmentPlotSVGHeight * 1.41344;
      }
      cancelRequestEnrichmentGetPlot();
      let cancelToken = new CancelToken(e => {
        cancelRequestEnrichmentGetPlot = e;
      });
      if (enrichmentPlotTypes.length > 0) {
        _.forEach(enrichmentPlotTypes, function(plot, i) {
          phosphoprotService
            .plotStudy(
              enrichmentStudy,
              enrichmentModel,
              id,
              enrichmentPlotTypes[i].plotID,
              handlePlotStudyError,
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
                `<svg preserveAspectRatio="xMinYMin meet" width="${EnrichmentPlotSVGWidth}" height="${EnrichmentPlotSVGHeight}" id="currentSVG-${id}-${i}"`,
                // `<svg preserveAspectRatio="xMinYMin meet" style="width:${EnrichmentPlotSVGWidth}px" height:${EnrichmentPlotSVGHeight} id="currentSVG-${id}-${i}"`,
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
                plotType: enrichmentPlotTypes[i],
                svg: sanitizedSVG,
              };
              // imageInfo.svg.push(svgInfo);
              // currentSVGs.push(sanitizedSVG);
              imageInfoCopy.svg.push(svgInfo);
              handleSVGCb(imageInfoCopy);
              // handleSVGCb(imageInfo);
            })
            .catch(error => {
              console.error('Error during getPlot', error);
            });
        });
      }
    } else {
      const { enrichmentPlotSVGWidth, enrichmentPlotSVGHeight } = this.state;
      let id = this.state.enrichmentFeatureID;
      let cachedSVGs = this.state.imageInfo.svg;
      let imageInfoCopy = { ...this.state.imageInfo };
      if (cachedSVGs.length > 0) {
        _.forEach(cachedSVGs, function(cachedSVG, i) {
          const resizedSVG = cachedSVG.svg;
          resizedSVG.replace(
            /<svg/g,
            // `<svg preserveAspectRatio="xMinYMin meet" style="width:${enrichmentPlotSVGWidth}px" width:${enrichmentPlotSVGWidth}pt" height:${enrichmentPlotSVGHeight}pt" id="currentSVG-${id}-${i}"`,
            // `<svg preserveAspectRatio="xMinYMin meet" style="width:${enrichmentPlotSVGWidth}px" height:${enrichmentPlotSVGHeight} id="currentSVG-${id}-${i}"`,
            `<svg preserveAspectRatio="xMinYMin meet" width="${enrichmentPlotSVGWidth}" height="${enrichmentPlotSVGHeight}" id="currentSVG-${id}-${i}"`,
          );
          let svgInfo = {
            plotType: self.state.imageInfo.svg[i].plotType,
            svg: resizedSVG,
          };
          imageInfoCopy.svg.splice(i, 1, svgInfo);
          handleSVGCb(imageInfoCopy);
        });
      }
    }
  };

  handleEnrichmentSVGSizeChange = id => {
    // keep whatever dimension is less (height or width)
    // then multiply the other dimension by original svg ratio (height 595px, width 841px)
    let EnrichmentPlotSVGHeight = this.calculateHeight();
    let EnrichmentPlotSVGWidth = this.calculateWidth();
    // EnrichmentPlotSVGHeight = EnrichmentPlotSVGWidth * 0.70749;
    if (EnrichmentPlotSVGHeight + 60 > EnrichmentPlotSVGWidth) {
      EnrichmentPlotSVGHeight = EnrichmentPlotSVGWidth * 0.70749;
    } else {
      EnrichmentPlotSVGWidth = EnrichmentPlotSVGHeight * 1.41344;
    }
    this.setState(
      {
        SVGPlotLoaded: true,
        SVGPlotLoading: false,
        enrichmentPlotSVGHeight: EnrichmentPlotSVGHeight,
        enrichmentPlotSVGWidth: EnrichmentPlotSVGWidth,
      },
      function() {
        this.getPlot(id);
      },
    );
  };

  handleSVG = imageInfo => {
    this.setState({
      imageInfo: imageInfo,
      SVGPlotLoaded: true,
      SVGPlotLoading: false,
    });
  };

  handlePlotStudyError = () => {
    this.setState({
      SVGPlotLoaded: false,
      SVGPlotLoading: false,
      // imageInfo: {
      //   ...this.state.imageInfo,
      //   svg: []
      // },
    });
  };

  handleGetBarcodeDataError = () => {
    this.testSelectedTransition(false);
    this.handleSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy || '',
        enrichmentModel: this.props.enrichmentModel || '',
        enrichmentAnnotation: this.props.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest: '',
      },
      false,
    );
  };

  testSelected = (
    enrichmentStudy,
    enrichmentModel,
    enrichmentAnnotation,
    dataItem,
    test,
  ) => {
    this.testSelectedTransition(true);
    const TestSiteVar = `${test}:${dataItem.description}`;
    this.handleSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy || '',
        enrichmentModel: this.props.enrichmentModel || '',
        enrichmentAnnotation: this.props.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest: TestSiteVar || '',
      },
      true,
    );
    let term = dataItem.termID;
    this.setState({
      imageInfo: {
        ...this.state.imageInfo,
        key: `${test}:${dataItem.description}`,
        title: `${test}:${dataItem.description}`,
        dataItem: dataItem,
      },
      enrichmentNameLoaded: true,
      enrichmentDataItem: dataItem,
      enrichmentTerm: term,
    });
    phosphoprotService
      .getBarcodeData(
        enrichmentStudy,
        enrichmentModel,
        test,
        enrichmentAnnotation,
        term,
        this.handleGetBarcodeDataError,
      )
      .then(barcodeDataResponse => {
        if (barcodeDataResponse?.data?.length > 0) {
          const logFoldChangeArr = barcodeDataResponse.data.map(
            b => b.logFoldChange,
          );
          const isZero = logFoldChangeVal => logFoldChangeVal === 0;
          if (logFoldChangeArr.every(isZero)) {
            this.setState({
              displayViolinPlot: false,
            });
          } else {
            this.setState({
              displayViolinPlot: true,
            });
          }
          this.showBarcodePlot(barcodeDataResponse, dataItem);
        }
      })
      .catch(error => {
        console.error('Error during getBarcodeData', error);
      });
  };

  getTableHelpers = () => {
    let addParams = {};
    addParams.barcodeData = (
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      dataItem,
      test,
    ) => {
      let self = this;
      return function() {
        self.testSelected(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          dataItem,
          test,
        );
        //stored annodationdata and won't call the service after the first time...reset it when sc changes
        // } else {
        //   dataItem.Annotation = _.find(self.state.annotationData, {
        //     Description: dataItem.description
        //   }).Key;
        //   let term = dataItem.Annotation;

        //   self.setState({
        //     imageInfo: {
        //       ...self.state.imageInfo,
        //       key: `${test} : ${dataItem.description}`,
        //       title: `${test} : ${dataItem.description}`
        //     },
        //     enrichmentNameLoaded: true,
        //     enrichmentDataItem: dataItem,
        //     enrichmentTerm: term
        //   });

        //   phosphoprotService
        //     .getBarcodeData(
        //       enrichmentStudy + 'plots',
        //       enrichmentModel,
        //       enrichmentAnnotation,
        //       test,
        //       dataItem.Annotation
        //     )
        //     .then(barcodeDataResponse => {
        //       let BardcodeInfoObj = JSON.parse(barcodeDataResponse['object']);
        //       let highest = barcodeDataResponse['highest'][0];
        //       // if (!this.state.modelsToRenderViolin.includes(this.enrichmentModel)){
        //       //   this.setState({ sizeVal = '0%' )};
        //       // } else {
        //       //   this.setState({ sizeVal = '50%')};
        //       // }

        //       showBarcodePlotCb(barcodeDataResponse);
        //     });
        // }
      };
    };

    addParams.getLink = (enrichmentStudy, enrichmentAnnotation, dataItem) => {
      let self = this;
      return function() {
        const database = enrichmentAnnotation;
        if (database === 'REACTOME') {
          window.open(
            'https://reactome.org/content/detail/' + dataItem.termID,
            '_blank',
          );
        } else if (database.substring(0, 2) === 'GO') {
          window.open(
            'http://amigo.geneontology.org/amigo/term/' + dataItem.termID,
            '_blank',
          );
        } else if (database.substring(0, 4) === 'msig') {
          window.open(
            'http://software.broadinstitute.org/gsea/msigdb/cards/' +
              dataItem.termID,
            '_blank',
          );
        } else if (database === 'PSP') {
          self.showPhosphositePlus('', dataItem);
        }
        // }
      };
    };

    this.setState({
      additionalTemplateInfoEnrichmentTable: addParams,
    });
  };

  handleLegendOpen = () => {
    this.setState({ legendIsOpen: true }, () => this.createLegend());
  };

  handleLegendClose = () => {
    this.setState({ legendIsOpen: false });
  };

  createLegend = () => {
    const self = this;
    const singleTest = typeof this.state.networkSettings.propLabel === 'string';
    var svg = d3
      .selectAll('.legend')
      .append('svg')
      .data([this.state.networkSettings.propLabel])
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + 300 + ' ' + 250)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    var legend = svg.append('g');
    legend.append('g').attr('class', 'slices');
    legend.append('g').attr('class', 'labels');
    legend.append('g').attr('class', 'lines');
    legend.append('g').attr('class', 'gradient');
    legend.append('g').attr('class', 'mostSignificant');

    var width = 300,
      height = 300,
      radius = 50;

    let pie = d3
      .pie()
      .sort(null)
      .value(1);
    let arc = d3
      .arc()
      .outerRadius(radius)
      .innerRadius(0);

    if (singleTest) {
      arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(90)
        .startAngle(0)
        .endAngle(2 * Math.PI);
    }

    legend.attr('transform', 'translate(' + width / 2 + ',' + height / 3 + ')');

    /* ------- PIE SLICES -------*/
    var slice = legend
      .select('.slices')
      .selectAll('path.slice')
      .data(pie);

    slice
      .enter()
      .insert('path')
      .style('fill', '#d3d3d3')
      .attr('class', 'slice')
      .attr('stroke', 'black')
      .attr('d', arc);

    /* ------- TEXT LABELS -------*/
    var text = legend
      .select('.labels')
      .selectAll('text')
      .data(pie);
    if (!singleTest) {
      text
        .enter()
        .append('text')
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('dy', '.35em')
        // .attr('transform', 'rotate(' + 10 + ')')
        .style('font-size', '.8em')
        .text(function(d) {
          return d.data;
        })
        .attr('x', function(d) {
          var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
          d.cx = Math.cos(a) * (radius - 10);
          return (d.x = Math.cos(a) * (radius + 30));
        })
        .attr('y', function(d) {
          var a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
          d.cy = Math.sin(a) * (radius - 10);
          return (d.y = Math.sin(a) * (radius + 30));
        })
        .style('text-anchor', 'middle')
        .each(function(d) {
          var bbox = this.getBBox();
          d.sx = d.x - bbox.width / 2 - 2;
          d.ox = d.x + bbox.width / 2 + 2;
          d.sy = d.oy = d.y + 5;
        });

      text
        .enter()
        .append('path')
        .attr('class', 'pointer')
        .style('fill', 'none')
        .style('stroke', 'black')

        .attr('d', function(d) {
          if (d.cx > d.ox) {
            return (
              'M' +
              d.sx +
              ',' +
              d.sy +
              'L' +
              d.ox +
              ',' +
              d.oy +
              ' ' +
              d.cx +
              ',' +
              d.cy
            );
          } else {
            return (
              'M' +
              d.ox +
              ',' +
              d.oy +
              'L' +
              d.sx +
              ',' +
              d.sy +
              ' ' +
              d.cx +
              ',' +
              d.cy
            );
          }
        });
    }

    if (singleTest) {
      text
        .enter()
        .append('text')
        .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
        .attr('dy', '.35em')
        // .attr('transform', 'rotate(' + 10 + ')')
        .style('font-size', '.8em')
        .text(function(d) {
          return d.data;
        });
      text
        .enter()
        .append('path')
        .attr('class', 'pointer')
        .style('fill', 'none')
        .style('stroke', 'black');
    }

    // Create the svg:defs element and the main gradient definition.
    var svgDefs = svg.append('defs');

    var mainGradient = svgDefs
      .append('linearGradient')
      .attr('id', 'mainGradient');

    // Create the stops of the main gradient. Each stop will be assigned
    // a class to style the stop using CSS.
    mainGradient
      .append('stop')
      .attr('class', 'stop-left')
      .attr('offset', '0');

    mainGradient
      .append('stop')
      .attr('class', 'stop-middle')
      .attr('offset', '0.5');

    mainGradient
      .append('stop')
      .attr('class', 'stop-right')
      .attr('offset', '1');

    // Use the gradient to set the shape fill, via CSS.
    var gradient = legend.selectAll('.gradient');

    gradient
      .append('rect')
      .classed('filled', true)
      .attr('x', -50)
      .attr('y', this.state.networkSettings.propLabel.length > 2 ? 100 : 60)
      .attr('width', 100)
      .attr('height', 15);

    var y = d3
      .scaleLinear()
      .range([0, 50, 100])
      .domain([0, 0.1, 1]);

    var yAxis = d3
      .axisBottom()
      .scale(y)
      .ticks(2);

    gradient
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(-50,115)')
      .call(yAxis);
    gradient
      .append('text')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('x', -10)
      .attr('y', 2)
      .attr('dy', '.35em')
      .text('pValue')
      .attr('transform', 'translate(-85,105)');

    //most  color scale
    var mostSignificantColorScale = d3
      .scaleLinear()
      .range(self.state.networkSettings.mostSignificantColorScale);
    //Append a linearGradient element to the defs and give it a unique id
    var mostSignificantGradient = svgDefs
      .append('linearGradient')
      .attr('id', 'most-significant-linear-gradient')
      // DIAGONAL GRADIENT
      .attr('x1', '70%')
      .attr('y1', '70%')
      .attr('x2', '30%')
      .attr('y2', '30%');

    //Append multiple color stops by using D3's data/enter step
    mostSignificantGradient
      .selectAll('stop')
      .data(mostSignificantColorScale.range())
      .enter()
      .append('stop')
      .attr('offset', function(d, i) {
        return i / (mostSignificantColorScale.range().length - 1);
      })
      .attr('stop-color', function(d) {
        return d;
      });

    const mostSignificant = legend.selectAll('.mostSignificant');

    mostSignificant
      .append('text')
      .attr('font-family', 'Lato,Arial,Helvetica,sans-serif')
      .attr('x', -120)
      .attr('y', 150)
      .attr('dy', '.35em')
      .text('Most significant of all tests in chart');

    // SQUARE
    mostSignificant
      .append('rect')
      .attr('x', 100)
      .attr('y', 141)
      .attr('width', 20)
      .attr('height', 20)
      .style('stroke', '#000')
      .style('fill', 'url(#most-significant-linear-gradient)');

    // CIRCLE
    // mostSignificant
    //   .append('circle')
    //   .attr('r', 10)
    //   .attr('cx', 110)
    //   .attr('cy', 151)
    //   .style('stroke', 'black')
    //   .style('fill', 'ffd700')
    //   .style('stroke-width', '1')
    //   .style('stroke', 'black');

    // SLICE
    // mostSignificant
    //   .append('circle')
    //   .attr('r', 5)
    //   .attr('cx', 100)
    //   .attr('cy', 151)
    //   .style('fill', 'transparent')
    //   .style('stroke', 'ffd700')
    //   .style('stroke-width', '20')
    //   .style('stroke-dasharray', 'calc(35 * 31.42 / 140) 31.42')
  };

  // getLegend = () => {
  //   let tests = this.state.networkSettings.propLabel;
  //   // let pieSlices = tests.length;
  //   let labels = {};
  //   let lines = {};
  //   let gradient = {};
  //   let width = 300;
  //   let height = 300;
  //   let x = width / 2;
  //   let y = height / 2;
  //   let radius = 50;
  //   let slices = d3.pie().value(1);

  //   let arc = d3
  //     .arc()
  //     .outerRadius(radius)
  //     .innerRadius(0);

  //   function getXattribute(d) {
  //     let a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
  //     d.cx = Math.cos(a) * (radius - 10);
  //     return (d.x = Math.cos(a) * (radius + 30));
  //   }

  //   function getYattribute(d) {
  //     let a = d.startAngle + (d.endAngle - d.startAngle) / 2 - Math.PI / 2;
  //     d.cy = Math.sin(a) * (radius - 10);
  //     return (d.y = Math.sin(a) * (radius + 30));
  //   }

  //   let legend = slices.map(s => {
  //     return (
  //       <>
  //         <g className="slices">
  //           <path className="slice" stroke="#000" d={arc} fill="#d3d3d3" />
  //         </g>
  //         <g className="prefix__labels">
  //           <text
  //             dy=".35em"
  //             x={getXattribute(s)}
  //             y={getYattribute(s)}
  //             fontSize=".75em"
  //             textAnchor="middle"
  //             transform={`translate(${width / 2} ${height / 3})`}
  //           >
  //             {s.data}
  //           </text>
  //           <path
  //             className="prefix__pointer"
  //             d="M250.108 48.431h-87.079l15.255 23.285M247.162 161.569h-81.187l12.31-33.285M66.736 161.569h53.39l1.59-33.285M132.853 48.431H54.01l67.706 23.285"
  //             fill="none"
  //             stroke="#000"
  //           />
  //         </g>
  //         <g className="prefix__gradient">
  //           <path className="prefix__filled" d="M100 200h100v15H100z" />
  //           <g
  //             className="prefix__y prefix__axis"
  //             fill="none"
  //             fontSize={10}
  //             fontFamily="sans-serif"
  //             textAnchor="middle"
  //           >
  //             <path
  //               className="prefix__domain"
  //               stroke="currentColor"
  //               d="M100.5 221v-5.5h100v5.5"
  //             />
  //             <g className="prefix__tick">
  //               <path stroke="currentColor" d="M100.5 215v6" />
  //               <text
  //                 fill="currentColor"
  //                 y={9}
  //                 dy=".71em"
  //                 transform="translate(100.5 215)"
  //               >
  //                 {'0.0'}
  //               </text>
  //             </g>
  //           </g>
  //           <text y={s.data} dy=".35em" transform="translate(65 205)">
  //             {'pValue'}
  //           </text>
  //         </g>
  //       </>
  //     );
  //   });

  //   return (
  //     <svg viewBox="0 0 300 250" preserveAspectRatio="xMinYMin meet">
  //       {legend}
  //       <defs>
  //         <linearGradient id="prefix__mainGradient">
  //           <stop offset={0} stopColor="red" />
  //           <stop offset={0.5} stopColor="#fff" />
  //           <stop offset={1} stopColor="#00f" />
  //         </linearGradient>
  //       </defs>
  //     </svg>
  //   );
  // };

  backToTable = () => {
    this.setState({
      isTestDataLoaded: false,
      isTestSelected: false,
      enrichmentNameLoaded: false,
      SVGPlotLoaded: false,
      SVGPlotLoading: false,
      imageInfo: {
        key: null,
        title: '',
        svg: [],
        dataItem: [],
      },
    });
    this.handleSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy || '',
        enrichmentModel: this.props.enrichmentModel || '',
        enrichmentAnnotation: this.props.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest: '',
      },
      false,
    );
    this.handleLegendClose();
  };

  testSelectedTransition = bool => {
    this.setState({
      isTestSelected: bool,
    });
  };

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformedEnrichmentMain: items,
    });
  };
  columnReorder = columns => {
    this.setState({ enrichmentColumns: columns });
    const columnsArr = columns.map(e => {
      return e.title;
    });
    const uDataRelevantFields = _.filter(columnsArr, function(key) {
      return key !== 'description' && key !== 'Annotation';
    });
    // multiset svg rebuilds based on uData...if there are no results we need to override this from being passed down
    if (uDataRelevantFields.length !== 0) {
      this.setState({
        uData: uDataRelevantFields,
      });
    }
  };

  handleTableNetworkTabChange = (e, { activeIndex }) => {
    sessionStorage.setItem(`enrichmentViewTab`, activeIndex);
    this.setState({ activeIndexEnrichmentView: activeIndex });
    if (activeIndex === 1) {
      this.handleLegendOpen();
    }
  };

  getView = () => {
    if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div className="SearchingAltDiv">
          <SearchingAlt />
        </div>
      );
    } else if (this.state.isSearchingEnrichment) {
      return <TransitionActive />;
    } else if (this.state.isTestSelected && this.state.isTestDataLoaded) {
      return (
        <div>
          <SplitPanesContainer
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
            onHandleProteinSelected={this.handleProteinSelected}
            onHandleHighlightedLineReset={this.handleHighlightedLineReset}
            onHandleBarcodeChanges={this.handleBarcodeChanges}
            onHandleEnrichmentSVGSizeChange={this.handleEnrichmentSVGSizeChange}
          ></SplitPanesContainer>
        </div>
      );
    } else if (
      this.state.isValidSearchEnrichment &&
      !this.state.isSearchingEnrichment
    ) {
      const TableAndNetworkPanes = this.getTableAndNetworkPanes();
      return (
        <Tab
          className="TableAndNetworkContainer"
          onTabChange={this.handleTableNetworkTabChange}
          panes={TableAndNetworkPanes}
          activeIndex={this.state.activeIndexEnrichmentView}
          renderActiveOnly={false}
          menu={{
            attached: true,
            className: 'TableAndNetworkMenuContainer',
            // tabular: false
            // stackable: true,
            // secondary: true,
            // pointing: true,
            // color: 'orange',
            // inverted: true,
          }}
        />
      );
    } else return <TransitionStill />;
  };

  getTableAndNetworkPanes = () => {
    return [
      {
        menuItem: (
          <Menu.Item
            key="0"
            className="TableAndNetworkButtons TableButton"
            name="table"
            color="orange"
            // active={this.state.activeIndexEnrichmentView === 0}
            inverted={(this.state.activeIndexEnrichmentView === 0).toString()}
          >
            {/* <Icon
              name="table"
              size="large"
              color="orange"
              inverted={this.state.activeIndexEnrichmentView === 0}
            /> */}
            <img
              src={
                this.state.activeIndexEnrichmentView === 0
                  ? tableIconSelected
                  : tableIcon
              }
              alt="Table Icon"
              id="TableButton"
            />
          </Menu.Item>
        ),
        pane: (
          <Tab.Pane
            key="0"
            className="EnrichmentContentPane"
            id="EnrichmentContentPaneTable"
            // ref="EnrichmentContentPaneTable"
          >
            <EnrichmentResultsTable
              {...this.props}
              {...this.state}
              columnReorder={this.columnReorder}
              onHandlePlotAnimation={this.handlePlotAnimation}
              onDisplayViolinPlot={this.displayViolinPlot}
            />
          </Tab.Pane>
        ),
      },
      {
        menuItem: (
          <Menu.Item
            key="1"
            className="TableAndNetworkButtons NetworkButton"
            name="network"
          >
            <img
              src={
                this.state.activeIndexEnrichmentView === 1
                  ? networkIconSelected
                  : networkIcon
              }
              alt="Network Icon"
              id="NetworkButton"
            />
          </Menu.Item>
        ),
        pane: (
          <Tab.Pane
            key="1"
            className="EnrichmentContentPane"
            id="EnrichmentContentPane"
            // ref="EnrichmentContentPaneGraph"
          >
            {!this.state.networkDataError ? (
              <EnrichmentResultsGraph
                {...this.props}
                {...this.state}
                onHandlePlotAnimation={this.handlePlotAnimation}
                onDisplayViolinPlot={this.displayViolinPlot}
                onHandlePieClick={this.testSelected}
                onHandleNodeCutoffInputChange={this.handleNodeCutoffInputChange}
                onHandleNodeCutoffSliderChange={
                  this.handleNodeCutoffSliderChange
                }
                onHandleLinkCutoffInputChange={this.handleLinkCutoffInputChange}
                onHandleLinkCutoffSliderChange={
                  this.handleLinkCutoffSliderChange
                }
                onHandleLinkTypeInputChange={this.handleLinkTypeInputChange}
                onHandleLinkTypeSliderChange={this.handleLinkTypeSliderChange}
                onHandleTotals={this.handleTotals}
                onHandleLegendOpen={this.handleLegendOpen}
                onHandleLegendClose={this.handleLegendClose}
                onCreateLegend={this.createLegend}
              />
            ) : (
              <Message
                className="NetworkGraphUnavailableMessage"
                icon="search"
                header="Network Graph Unavailable"
                content="Please Revise Search"
              />
            )}
          </Tab.Pane>
        ),
      },
    ];
  };

  handleTotals = (filteredNodesLength, filteredLinksLength) => {
    this.setState({
      filteredNodesTotal: filteredNodesLength,
      filteredLinksTotal: filteredLinksLength,
    });
  };

  handleNodeCutoffInputChange = value => {
    if (this.state.nodeCutoff !== value) {
      this.setState({
        nodeCutoff: value,
      });
      sessionStorage.setItem('nodeCutoff', value);
    }
  };

  handleLinkCutoffInputChange = value => {
    if (this.state.linkCutoff !== value) {
      this.setState({
        linkCutoff: value,
      });
      sessionStorage.setItem('linkCutoff', value);
    }
  };

  handleLinkTypeInputChange = value => {
    if (this.state.linkType !== value) {
      this.setState({
        linkType: value,
      });
      sessionStorage.setItem('linkType', value);
    }
  };

  handleNodeCutoffSliderChange = value => {
    if (this.state.nodeCutoff !== value) {
      this.setState({ nodeCutoff: value });
    }
    sessionStorage.setItem('nodeCutoff', value);
  };

  handleLinkCutoffSliderChange = value => {
    if (this.state.linkCutoff !== value) {
      this.setState({ linkCutoff: value });
    }
    sessionStorage.setItem('linkCutoff', value);
  };

  handleLinkTypeSliderChange = value => {
    if (this.state.linkType !== value) {
      this.setState({ linkType: value });
    }
    sessionStorage.setItem('linkType', value);
  };

  // handleLegendOpen = () => {
  //   // sessionStorage.setItem('legendOpen', 'true');
  //   this.setState({ legendIsOpen: true });
  //   // this.timeout = setTimeout(() => {
  //   //   this.setState({ legendIsOpen: false });
  //   // }, 2500);
  // };

  // handleLegendClose = () => {
  //   // sessionStorage.setItem('legendOpen', 'false');
  //   this.setState({ legendIsOpen: false });
  //   // clearTimeout(this.timeout);
  // };

  render() {
    const enrichmentView = this.getView();
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
        <Grid.Row className="EnrichmentContainer">
          <Grid.Column
            className="SidebarContainer"
            mobile={16}
            tablet={16}
            largeScreen={4}
            widescreen={4}
          >
            <EnrichmentSearchCriteria
              {...this.state}
              {...this.props}
              onSearchTransitionEnrichment={
                this.handleSearchTransitionEnrichment
              }
              onEnrichmentSearch={this.handleEnrichmentSearch}
              onColumns={this.handleColumns}
              onSearchCriteriaChange={this.handleSearchCriteriaChange}
              onSearchCriteriaReset={this.hideEGrid}
              onDisablePlot={this.disablePlot}
              onGetMultisetPlot={this.handleMultisetPlot}
              onHandlePlotAnimation={this.handlePlotAnimation}
              onHandlePlotTypesEnrichment={this.handlePlotTypesEnrichment}
              onSetStudyModelAnnotationMetadata={
                this.setStudyModelAnnotationMetadata
              }
              onSetAnnotationsMetadata={this.setAnnotationsMetadata}
              onHandleMulisetFiltersVisible={this.handleMulisetFiltersVisible}
              onHandleNetworkSigValue={this.handleNetworkSigValue}
              onHandleNetworkOperator={this.handleNetworkOperator}
              onHandleNetworkTests={this.handleNetworkTests}
            />
          </Grid.Column>
          <Grid.Column
            className="EnrichmentContentContainer"
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
                  className="EnrichmentViewContainer"
                  ref={this.EnrichmentViewContainerRef}
                >
                  {enrichmentView}
                </div>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default withRouter(Enrichment);

function getDataItemDescription(value) {
  if (value) {
    const dataItem = value.split(':')[1];
    return dataItem;
  }
}

function getTestName(value) {
  if (value) {
    const test = value.split(':')[0];
    return test;
  }
}
