import DOMPurify from 'dompurify';
import _ from 'lodash';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Menu, Popup, Sidebar, Tab } from 'semantic-ui-react';
import { CancelToken } from 'axios';
import go_icon from '../../resources/go.png';
import msig_icon from '../../resources/msig.ico';
import networkIcon from '../../resources/networkIcon.png';
import networkIconSelected from '../../resources/networkIconSelected.png';
import phosphosite_icon from '../../resources/phosphosite.ico';
import reactome_icon from '../../resources/reactome.jpg';
import tableIcon from '../../resources/tableIcon.png';
import tableIconSelected from '../../resources/tableIconSelected.png';
import networkDataNew from '../../services/networkDataNew.json';
import { phosphoprotService } from '../../services/phosphoprot.service';
import ButtonActions from '../Shared/ButtonActions';
import * as d3 from 'd3';
import {
  formatNumberForDisplay,
  splitValue
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

let plotCancel = () => {};
class Enrichment extends Component {
  defaultEnrichmentActiveIndex =
    parseInt(sessionStorage.getItem('enrichmentViewTab'), 10) || 0;

  state = {
    isValidSearchEnrichment: false,
    isSearching: false,
    enrichmentIcon: '',
    enrichmentIconText: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    activeIndexEnrichmentView: this.defaultEnrichmentActiveIndex || 0,
    multisetPlotInfo: {
      title: '',
      svg: []
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
    displayViolinPlot: false,
    // networkDataAvailable: false,
    networkData: {
      nodes: [],
      edges: []
    },
    networkDataNew: {},
    networkDataMock: {},
    networkDataLoaded: false,
    networkGraphReady: false,
    tests: {},
    nodeCutoff: 0.1,
    edgeCutoff: 0.375,
    // networkSortBy: ['significance', 'edgecount', 'nodecount']
    networkSortBy: 'significance',
    // legendIsOpen: true,
    // legendIsOpen: JSON.parse(sessionStorage.getItem('legendOpen')) || true,
    networkSettings: {
      facets: {},
      propLabel: {},
      metaLabels: ['Description', 'Ontology'],
      meta: ['EnrichmentMap_GS_DESCR', 'EnrichmentMap_Name'],
      facetAndValueLabel: ['Test', 'pValue'],
      nodeLabel: 'EnrichmentMap_GS_DESCR',
      radiusScale: [10, 50],
      lineScale: [1, 10],
      nodeSize: 'EnrichmentMap_gs_size',
      linkSize: 'EnrichmentMap_Overlap_size',
      linkMetaLabels: ['Overlap Size', 'Source', 'Target'],
      linkMeta: ['EnrichmentMap_Overlap_size', 'source', 'target'],
      linkMetaLookup: ['EnrichmentMap_GS_DESCR', 'EnrichmentMap_GS_DESCR'],
      nodeColorScale: [0, 0.1, 1],
      nodeColors: ['red', 'white', 'blue'],
      colorMostSignificantTest: '#FFD700',
      colorHighestLinkCoefficient: '#FFD700',
      title: '',
      // data: null,
      id: 'chart-network',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      // statLabel: '',
      // statistic: '',
      // formattedData: {},
      // facets: []
      // propLabel: [],
      duration: 1000
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
      svg: []
    },
    currentSVGs: [],
    isTestSelected: false,
    isTestDataLoaded: false,
    SVGPlotLoading: false,
    SVGPlotLoaded: false,
    isViolinPlotLoaded: false,
    barcodeSettings: {
      barcodeData: [],
      brushedData: [],
      // chartSize: { height: '200', width: '960' },
      lineID: '',
      statLabel: {},
      statistic: 'statistic',
      logFC: 'logFC',
      highLabel: {},
      lowLabel: {},
      highStat: null,
      enableBrush: false
    },
    // violinSettings: {
    violinData: []
    // chartSize: { height: kLSplit.clientHeight + 25, width: kLSplit.clientWidth },
    //   chartSize: {
    //     height: 400,
    //     width: 400
    //   },
    //   axisLabels: {
    //     xAxis: '',
    //     yAxis: "log<tspan baseline-shift='sub' font-size='14px'>2</tspan>(FC)"
    //   },
    //   id: 'violin-graph-1',
    //   pointUniqueId: 'sample',
    //   pointValue: 'cpm',
    //   title: '',
    //   subtitle: '',
    //   tooltip: {
    //     show: true,
    //     fields: [
    //       { label: 'log(FC)', value: 'cpm', toFixed: true },
    //       { label: 'Protein', value: 'sample' }
    //     ]
    //   },
    //   xName: 'tissue'
    // }
  };
  EnrichmentViewContainerRef = React.createRef();

  componentDidMount() {
    this.getTableHelpers(this.testSelectedTransition, this.showBarcodePlot);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.enrichmentResults !== prevState.enrichmentResults) {
      const DescriptionAndTest = this.props.enrichmentDescriptionAndTest || '';
      if (DescriptionAndTest !== '') {
        const AllDescriptionsAndTests = this.state.enrichmentResults;
        const ResultsLength = this.state.enrichmentResults.length;
        if (ResultsLength > 0) {
          const dataItemDescription = getDataItemDescription(
            DescriptionAndTest
          );
          const dataItemIndex = _.findIndex(AllDescriptionsAndTests, function(
            d
          ) {
            return d.Description === dataItemDescription;
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
            this.showBarcodePlot
          );
        }
      }
    }
  }

  getThreePlotsFromUrl = (
    enrichmentStudy,
    enrichmentModel,
    enrichmentAnnotation,
    dataItem,
    test,
    testSelectedTransitionCb,
    showBarcodePlotCb
  ) => {
    let self = this;
    testSelectedTransitionCb(true);
    // const TestSiteVar = `${test}:${dataItem.Description}`;
    // let xLargest = 0;
    // let imageInfo = { key: '', title: '', svg: [] };
    phosphoprotService
      .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
      .then(annotationDataResponse => {
        const annotationDataParsed = JSON.parse(annotationDataResponse);
        self.setState({
          annotationData: annotationDataParsed
        });
        dataItem.Annotation = _.find(annotationDataParsed, {
          Description: dataItem.Description
        }).Key;
        let term = dataItem.Annotation;

        self.setState({
          imageInfo: {
            ...self.state.imageInfo,
            key: `${test}:${dataItem.Description}`,
            title: `${test}:${dataItem.Description}`
          },
          enrichmentNameLoaded: true,
          enrichmentDataItem: dataItem,
          enrichmentTerm: term
        });

        phosphoprotService
          .getBarcodeData(
            enrichmentStudy + 'plots',
            enrichmentModel,
            enrichmentAnnotation,
            test,
            dataItem.Annotation
          )
          .then(barcodeDataResponse => {
            let BardcodeInfoObj = JSON.parse(barcodeDataResponse['object']);
            let highest = barcodeDataResponse['highest'][0];
            // if (!this.state.modelsToRenderViolin.includes(this.enrichmentModel)){
            //   this.setState({ sizeVal = '0%' )};
            // } else {
            //   this.setState({ sizeVal = '50%')};
            // }

            showBarcodePlotCb(dataItem, BardcodeInfoObj, test, highest);
          });
      });
  };

  handleSearchTransition = bool => {
    this.setState({
      isSearching: bool
    });
  };

  handleEnrichmentSearch = searchResults => {
    const columns = this.getConfigCols(searchResults);
    this.getNetworkData();
    this.setState({
      networkGraphReady: false,
      enrichmentResults: searchResults.enrichmentResults,
      enrichmentColumns: columns,
      isSearching: false,
      isValidSearchEnrichment: true,
      plotButtonActive: false,
      visible: false,
      isTestSelected: false,
      isTestDataLoaded: false
    });
  };

  handleSearchCriteriaChange = (changes, scChange) => {
    this.props.onSearchCriteriaToTop(changes, 'enrichment');
    if (
      changes.enrichmentModel ===
        'Treatment and or Strain Differential Phosphorylation' ||
      changes.enrichmentModel ===
        'Ferrostatin vs Untreated Differential Phosphorylation'
    ) {
      this.setState({
        displayViolinPlot: true
      });
    }
    this.setState({
      plotButtonActive: false,
      visible: false
    });
    if (scChange) {
      this.setState({
        multisetPlotAvailable: false
      });
    }
  };

  disablePlot = () => {
    this.setState({
      multisetPlotAvailable: false
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
      displayViolinPlot: false
    });
  };

  handlePlotAnimation = animation => () => {
    this.setState(prevState => ({
      animation,
      visible: !prevState.visible,
      plotButtonActive: !this.state.plotButtonActive
    }));
  };

  onViolinDataLoaded = bool => {
    this.setState({
      violinDataLoaded: bool
    });
  };

  handleDirectionChange = direction => () =>
    this.setState({ direction: direction, visible: false });

  handleMultisetPlot = multisetPlotResults => {
    this.setState({
      multisetPlotInfo: {
        title: multisetPlotResults.svgInfo.plotType,
        svg: multisetPlotResults.svgInfo.svg
      },
      multisetPlotAvailable: true
    });
  };

  getConfigCols = annotationData => {
    const enrResults = annotationData.enrichmentResults;
    const {
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation
    } = this.props;
    let initConfigCols = [];

    const TableValuePopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
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
      enrichmentIconText: iconText
    });

    let allKeys = _.keys(enrResults[0]);

    let ***REMOVED***_text_col = _.indexOf(allKeys, 'name_1006');
    if (***REMOVED***_text_col >= 0) {
      const Col_Name_1006 = {
        title: 'name_1006',
        field: 'name_1006',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
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
      };
      initConfigCols.push(Col_Name_1006);
    }

    let descripton_text_col = _.indexOf(allKeys, 'Description');
    if (descripton_text_col >= 0) {
      const Col_Name_Description = {
        title: 'Description',
        field: 'Description',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
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
                      item
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
        }
      };
      initConfigCols.push(Col_Name_Description);
    }

    let annotation_text_col = _.indexOf(allKeys, 'Annotation');
    if (annotation_text_col >= 0) {
      const Col_Name_Annotation = {
        title: 'Annotation',
        field: 'Annotation',
        filterable: { type: 'alphanumericFilter' },
        template: (value, item, addParams) => {
          return (
            <div>
              <Popup
                trigger={
                  <span className="TableValue">{splitValue(value)}</span>
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
      };
      initConfigCols.push(Col_Name_Annotation);
    }

    const relevantConfigColumns = _.filter(allKeys, function(key) {
      return (
        key !== 'name_1006' && key !== 'Description' && key !== 'Annotation'
      );
    });

    const uDataRelevantFields = _.filter(allKeys, function(key) {
      return key !== 'Description' && key !== 'Annotation';
    });
    // multiset svg rebuilds based on uData...if there are no results we need to override this from being passed down
    if (uDataRelevantFields.length !== 0) {
      this.setState({
        uData: uDataRelevantFields
      });
    }

    const additionalConfigColumns = relevantConfigColumns.map(c => {
      return {
        title: c,
        field: c,
        type: 'number',
        filterable: { type: 'numericFilter' },
        exportTemplate: value => (value ? `${value}` : 'N/A'),
        template: (value, item, addParams) => {
          if (enrichmentStudy === '***REMOVED***' || '***REMOVED***') {
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
                        c
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
          } else
            return (
              <div>
                <Popup
                  trigger={
                    <span className="TableValue">
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
        }
      };
    });

    const configCols = initConfigCols.concat(additionalConfigColumns);
    return configCols;
  };

  getNetworkData = () => {
    this.removeNetworkSVG();
    const {
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      enrichmentStudy
    } = this.props;
    const pValueTypeParam = pValueType === 'adjusted' ? 0.1 : 1;
    phosphoprotService
      .getEnrichmentNetwork(
        enrichmentModel,
        enrichmentAnnotation,
        '',
        pValueTypeParam,
        enrichmentStudy + 'plots'
      )
      // .then(EMData => {
      //   this.setState({
      //     networkDataAvailable: true,
      //     networkData: EMData.elements,
      //     // networkData: networkDataMock,
      //     networkDataLoaded: true
      //   });
      // });
      .then(EMData => {
        this.setState({
          // networkDataAvailable: true,
          networkData: EMData.elements,
          tests: EMData.tests,
          networkDataNew: networkDataNew
        });
        let facets = [];
        for (var i = 0; i < EMData.tests.length; i++) {
          let rplcSpaces = EMData.tests[i].replace(/ /g, '_');
          facets.push('EnrichmentMap_pvalue_' + rplcSpaces + '_');
        }
        this.setState({
          networkSettings: {
            ...this.state.networkSettings,
            facets: facets,
            propLabel: EMData.tests
            // metaLabels: ["Description", "Ontology"],
            // meta: ["EnrichmentMap_GS_DESCR", "EnrichmentMap_Name"],
            // facetAndValueLabel: ["Test", "pValue"],
            // nodeLabel: "EnrichmentMap_GS_DESCR",
            // radiusScale: [10, 50],
            // lineScale: [1, 10],
            // nodeSize: "EnrichmentMap_gs_size",
            // linkSize: "EnrichmentMap_Overlap_size",
            // linkMetaLabels: ["Overlap Size", "Source", "Target"],
            // linkMeta: ["EnrichmentMap_Overlap_size", "source", "target"],
            // linkMetaLookup: [
            //   "EnrichmentMap_GS_DESCR",
            //   "EnrichmentMap_GS_DESCR"
            // ],
            // nodeColorScale: [0, 0.1, 1],
            // nodeColors: ["red", "white", "blue"]
          },
          networkDataLoaded: true,
          networkGraphReady: true
        });
      });
  };

  calculateHeight(self) {
    let containerHeight =
      self.EnrichmentViewContainerRef.current !== null
        ? self.EnrichmentViewContainerRef.current.parentElement.offsetHeight
        : 900;
    let barcodeHeight =
      parseInt(sessionStorage.getItem('horizontalSplitPaneSize'), 10) || 250;
    // subtracting 120 due to menu and plot margin
    return containerHeight - barcodeHeight - 120;
  }

  calculateWidth(self) {
    let containerWidth =
      self.EnrichmentViewContainerRef.current !== null
        ? self.EnrichmentViewContainerRef.current.parentElement.offsetWidth
        : 1200;
    let violinWidth =
      parseInt(sessionStorage.getItem('verticalSplitPaneSize'), 10) || 525;
    // subtracting 80 due to plot margin
    return containerWidth - violinWidth - 60;
  }

  showBarcodePlot = (dataItem, barcode, test, highest) => {
    this.setState({
      isTestDataLoaded: true,
      barcodeSettings: {
        ...this.state.barcodeSettings,
        barcodeData: barcode,
        statLabel: barcode[0].statLabel,
        highLabel: barcode[0].highLabel,
        lowLabel: barcode[0].lowLabel,
        highStat: highest,
        enableBrush: true
      }
    });
  };

  handleBarcodeChanges = changes => {
    // const { barcodeSettings } = this.state;
    let self = this;
    if (changes.brushedData.length > 0) {
      const boxPlotArray = _.map(changes.brushedData, function(d) {
        d.statistic = _.find(self.state.barcodeSettings.barcodeData, {
          lineID: d.lineID,
          id_mult: d.id_mult
        }).statistic;
        d.logFC = _.find(self.state.barcodeSettings.barcodeData, {
          lineID: d.lineID,
          id_mult: d.id_mult
        }).logFC;
        return d;
      });

      // this.setState({
      //   isViolinPlotLoaded: false
      // });
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
            id_mult: datum.id_mult
          });
          return res;
        },
        {}
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
          brushedData: changes.brushedData
        }
      });
    } else {
      this.setState({
        violinData: [],
        isViolinPlotLoaded: false,
        barcodeSettings: {
          ...this.state.barcodeSettings,
          brushedData: []
        },
        SVGPlotLoaded: false,
        SVGPlotLoading: false
        // imageInfo: {
        //   key: null,
        //   title: '',
        //   svg: []
        // }
      });
    }
  };

  handleMaxLinePlot = info => {
    const { enrichmentStudy, enrichmentModel } = this.props;
    // let self = this;
    // if (this.state.barcodeSettings.barcodeData > 0) {
    if (info != null) {
      if (this.state.barcodeSettings.barcodeData?.length > 0) {
        this.setState({
          SVGPlotLoaded: false,
          SVGPlotLoading: true
        });
        const dataItem = this.state.barcodeSettings.barcodeData.find(
          i => i.lineID === info.lineID
        );
        let id = dataItem.id_mult ? dataItem.id_mult : dataItem.id;
        // var psp = document.getElementById('psp-icon');
        // psp.style.visibility = "hidden";
        // psp.style.left = w.toString() + "px";
        // psp.style.bottom = h.toString() + "px";
        let plotType = ['splineplot'];
        switch (enrichmentModel) {
          case 'DonorDifferentialPhosphorylation':
            plotType = ['dotplot'];
            break;
          case 'Treatment and or Strain Differential Phosphorylation':
            plotType = ['StrainStimDotplot', 'StimStrainDotplot'];
            break;
          case 'Timecourse Differential Phosphorylation':
            plotType = ['lineplot', 'splineplot'];
            break;
          case 'Differential Expression':
            plotType = ['proteindotplot'];
            break;
          case 'Differential Phosphorylation':
            plotType = ['phosphodotplot'];
            break;
          case 'No Pretreatment Timecourse Differential Phosphorylation':
            plotType = ['lineplot.modelII', 'splineplot.modelII'];
            break;
          case 'Ferrostatin Pretreatment Timecourse Differential Phosphorylation':
            plotType = ['lineplot.modelIII', 'splineplot.modelIII'];
            break;
          default:
            plotType = ['dotplot'];
        }
        let imageInfo = { key: '', title: '', svg: [] };
        imageInfo.title = this.state.imageInfo.title;
        imageInfo.key = this.state.imageInfo.key;
        const handleSVGCb = this.handleSVG;
        this.getPlot(id, plotType, enrichmentStudy, imageInfo, handleSVGCb);
      }
    } else {
      plotCancel();
      this.setState({
        SVGPlotLoaded: false,
        SVGPlotLoading: false
        // imageInfo: {
        //   ...this.state.imageInfo,
        //   svg: []
        // },
      });
    }
  };

  getPlot = (id, plotType, enrichmentStudy, imageInfo, handleSVGCb) => {
    let currentSVGs = [];
    // keep whatever dimension is less (height or width)
    // then multiply the other dimension by original svg ratio (height 595px, width 841px)
    let EnrichmentPlotSVGHeight = this.calculateHeight(this);
    let EnrichmentPlotSVGWidth = this.calculateWidth(this);
    if (EnrichmentPlotSVGHeight + 60 > EnrichmentPlotSVGWidth) {
      EnrichmentPlotSVGHeight = EnrichmentPlotSVGWidth * 0.70749;
    } else {
      EnrichmentPlotSVGWidth = EnrichmentPlotSVGHeight * 1.41344;
    }
    plotCancel();
    let cancelToken = new CancelToken(e => {
      plotCancel = e;
    });

    _.forEach(plotType, function(plot, i) {
      phosphoprotService
        .getPlot(
          id,
          plotType[i],
          enrichmentStudy + 'plots',
          undefined,
          cancelToken
        )
        .then(svgMarkupObj => {
          let svgMarkup = svgMarkupObj.data;
          svgMarkup = svgMarkup.replace(/id="/g, 'id="' + id + '-' + i + '-');
          svgMarkup = svgMarkup.replace(
            /#glyph/g,
            '#' + id + '-' + i + '-glyph'
          );
          svgMarkup = svgMarkup.replace(/#clip/g, '#' + id + '-' + i + '-clip');
          svgMarkup = svgMarkup.replace(
            /<svg/g,
            `<svg preserveAspectRatio="xMinYMin meet" style="width:${EnrichmentPlotSVGWidth}px" height:${EnrichmentPlotSVGHeight} id="currentSVG-${id}-${i}"`
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
            ADD_TAGS: ['use']
          });
          let svgInfo = { plotType: plotType[i], svg: sanitizedSVG };

          // we want spline plot in zero index, rather than lineplot
          if (i === 0) {
            imageInfo.svg.push(svgInfo);
            currentSVGs.push(sanitizedSVG);
          } else {
            // splice(position, numberOfItemsToRemove, item)
            // imageInfo.svg.u
            imageInfo.svg.unshift(svgInfo);
            currentSVGs.unshift(sanitizedSVG);
          }
          handleSVGCb(imageInfo);
        });
    });
  };

  handleSVG = imageInfo => {
    this.setState({
      imageInfo: imageInfo,
      SVGPlotLoaded: true,
      SVGPlotLoading: false
    });
  };

  testSelected = (
    enrichmentStudy,
    enrichmentModel,
    enrichmentAnnotation,
    dataItem,
    test
  ) => {
    this.testSelectedTransition(true);
    const TestSiteVar = `${test}:${dataItem.Description}`;
    this.handleSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy || '',
        enrichmentModel: this.props.enrichmentModel || '',
        enrichmentAnnotation: this.props.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest: TestSiteVar || ''
      },
      true
    );
    // let xLargest = 0;
    // let imageInfo = { key: '', title: '', svg: [] };
    // if (this.state.annotationData.length === 0) {
    phosphoprotService
      .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
      .then(annotationDataResponse => {
        const annotationDataParsed = JSON.parse(annotationDataResponse);
        this.setState({
          annotationData: annotationDataParsed
        });
        dataItem.Annotation = _.find(annotationDataParsed, {
          Description: dataItem.Description
        }).Key;
        let term = dataItem.Annotation;

        this.setState({
          imageInfo: {
            ...this.state.imageInfo,
            key: `${test}:${dataItem.Description}`,
            title: `${test}:${dataItem.Description}`,
            dataItem: dataItem
          },
          enrichmentNameLoaded: true,
          enrichmentDataItem: dataItem,
          enrichmentTerm: term
        });

        phosphoprotService
          .getBarcodeData(
            enrichmentStudy + 'plots',
            enrichmentModel,
            enrichmentAnnotation,
            test,
            dataItem.Annotation
          )
          .then(barcodeDataResponse => {
            let BardcodeInfoObj = JSON.parse(barcodeDataResponse['object']);
            let highest = barcodeDataResponse['highest'][0];
            // if (!this.state.modelsToRenderViolin.includes(this.enrichmentModel)){
            //   this.setState({ sizeVal = '0%' )};
            // } else {
            //   this.setState({ sizeVal = '50%')};
            // }
            this.showBarcodePlot(dataItem, BardcodeInfoObj, test, highest);
          });
        // });
      });
  };

  getTableHelpers = () => {
    let addParams = {};
    addParams.barcodeData = (
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation,
      dataItem,
      test
    ) => {
      let self = this;
      return function() {
        self.testSelected(
          enrichmentStudy,
          enrichmentModel,
          enrichmentAnnotation,
          dataItem,
          test
        );
        //stored annodationdata and won't call the service after the first time...reset it when sc changes
        // } else {
        //   dataItem.Annotation = _.find(self.state.annotationData, {
        //     Description: dataItem.Description
        //   }).Key;
        //   let term = dataItem.Annotation;

        //   self.setState({
        //     imageInfo: {
        //       ...self.state.imageInfo,
        //       key: `${test} : ${dataItem.Description}`,
        //       title: `${test} : ${dataItem.Description}`
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

        //       showBarcodePlotCb(dataItem, BardcodeInfoObj, test, highest);
        //     });
        // }
      };
    };

    addParams.getLink = (enrichmentStudy, enrichmentAnnotation, dataItem) => {
      let self = this;
      return function() {
        if (self.state.annotationData.length === 0) {
          phosphoprotService
            .getDatabaseInfo(enrichmentStudy + 'plots', enrichmentAnnotation)
            .then(annotationDataResponse => {
              const annotationDataParsed = JSON.parse(annotationDataResponse);
              dataItem.Annotation = _.find(annotationDataParsed, {
                Description: dataItem.Description
              }).Key;
              const database = enrichmentAnnotation;
              if (database === 'REACTOME') {
                window.open(
                  'https://reactome.org/content/detail/' + dataItem.Annotation,
                  '_blank'
                );
              } else if (database.substring(0, 2) === 'GO') {
                window.open(
                  'http://amigo.geneontology.org/amigo/term/' +
                    dataItem.Annotation,
                  '_blank'
                );
              } else if (database.substring(0, 4) === 'msig') {
                window.open(
                  'http://software.broadinstitute.org/gsea/msigdb/cards/' +
                    dataItem.Annotation,
                  '_blank'
                );
              } else if (database === 'PSP') {
                self.showPhosphositePlus('', dataItem);
              }
            });
        } else {
          dataItem.Annotation = _.find(self.state.annotationData, {
            Description: dataItem.Description
          }).Key;
          const database = enrichmentAnnotation;
          if (database === 'REACTOME') {
            window.open(
              'https://reactome.org/content/detail/' + dataItem.Annotation,
              '_blank'
            );
          } else if (database.substring(0, 2) === 'GO') {
            window.open(
              'http://amigo.geneontology.org/amigo/term/' + dataItem.Annotation,
              '_blank'
            );
          } else if (database.substring(0, 4) === 'msig') {
            window.open(
              'http://software.broadinstitute.org/gsea/msigdb/cards/' +
                dataItem.Annotation,
              '_blank'
            );
          } else if (database === 'PSP') {
            self.showPhosphositePlus('', dataItem);
          }
        }
      };
    };

    this.setState({
      additionalTemplateInfoEnrichmentTable: addParams
    });
  };

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
        svg: []
      }
    });
    this.handleSearchCriteriaChange(
      {
        enrichmentStudy: this.props.enrichmentStudy || '',
        enrichmentModel: this.props.enrichmentModel || '',
        enrichmentAnnotation: this.props.enrichmentAnnotation || '',
        enrichmentDescriptionAndTest: ''
      },
      false
    );
  };

  testSelectedTransition = bool => {
    this.setState({
      isTestSelected: bool
    });
  };

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformedEnrichmentMain: items
    });
  };

  handleTableNetworkTabChange = (e, { activeIndex }) => {
    sessionStorage.setItem(`enrichmentViewTab`, activeIndex);
    this.setState({ activeIndexEnrichmentView: activeIndex });
  };

  getView = () => {
    if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div className="SearchingAltDiv">
          <SearchingAlt />
        </div>
      );
    } else if (this.state.isTestSelected && this.state.isTestDataLoaded) {
      return (
        <div>
          <SplitPanesContainer
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
            onHandleMaxLinePlot={this.handleMaxLinePlot}
            onHandleBarcodeChanges={this.handleBarcodeChanges}
          ></SplitPanesContainer>
        </div>
      );
    } else if (this.state.isValidSearchEnrichment && !this.state.isSearching) {
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
            className: 'TableAndNetworkMenuContainer'
            // tabular: false
            // stackable: true,
            // secondary: true,
            // pointing: true,
            // color: 'orange',
            // inverted: true,
          }}
        />
      );
    } else if (this.state.isSearching) {
      return <TransitionActive />;
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
              onHandlePlotAnimation={this.handlePlotAnimation}
              onDisplayViolinPlot={this.displayViolinPlot}
            />
          </Tab.Pane>
        )
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
            <EnrichmentResultsGraph
              {...this.props}
              {...this.state}
              onHandlePlotAnimation={this.handlePlotAnimation}
              onDisplayViolinPlot={this.displayViolinPlot}
              onHandlePieClick={this.testSelected}
              onHandleNetworkSortByChange={this.handleNetworkSortByChange}
              // onHandleLegendOpen={this.handleLegendOpen}
              // onHandleLegendClose={this.handleLegendClose}
              onHandleInputChange={this.handleInputChange}
              onHandleSliderChange={this.handleSliderChange}
              // onNetworkGraphReady={this.handleNetworkGraphReady}
            />
          </Tab.Pane>
        )
      }
    ];
  };

  handleNetworkGraphReady = bool => {
    this.setState({
      networkGraphReady: bool
    });
  };

  removeNetworkSVG = () => {
    d3.select('div.tooltip-pieSlice').remove();
    d3.select(`#svg-${this.state.networkSettings.id}`).remove();
  };

  handleNetworkSortByChange = (evt, { value }) => {
    this.removeNetworkSVG();
    this.setState({
      networkSortBy: value
      // networkGraphReady: false
    });
  };

  // handleInputChange = _.debounce((evt, { name, value }) => {
  //   this.setState({
  //     [name]: value
  //   });
  // }, 500);

  handleInputChange = (evt, { name, value }) => {
    this.removeNetworkSVG();
    this.setState({
      [name]: value
      // networkGraphReady: false
    });
  };

  // handleSliderChange = _.debounce(obj => {
  //   this.setState(obj);
  // }, 500);

  handleSliderChange = obj => {
    // this.setState({
    //   networkGraphReady: false
    // });
    this.removeNetworkSVG();
    this.setState(obj);
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
              onSearchTransition={this.handleSearchTransition}
              onEnrichmentSearch={this.handleEnrichmentSearch}
              onSearchCriteriaChange={this.handleSearchCriteriaChange}
              onSearchCriteriaReset={this.hideEGrid}
              onDisablePlot={this.disablePlot}
              onGetMultisetPlot={this.handleMultisetPlot}
              onHandlePlotAnimation={this.handlePlotAnimation}
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
