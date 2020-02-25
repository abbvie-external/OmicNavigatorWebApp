import React, { Component } from 'react';
import { Grid, Popup, Sidebar } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import DOMPurify from 'dompurify';
import EnrichmentSearchCriteria from './EnrichmentSearchCriteria';
import EnrichmentResultsGraph from './EnrichmentResultsGraph';
import EnrichmentResultsTable from './EnrichmentResultsTable';
import TransitionActive from '../Transitions/TransitionActive';
import TransitionStill from '../Transitions/TransitionStill';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from '../Transitions/SearchingAlt';
import ButtonActions from '../Shared/ButtonActions';
import networkDataNew from '../../services/networkDataNew.json';
import {
  formatNumberForDisplay,
  splitValue
  // getIconInfo
} from '../Shared/helpers';
import _ from 'lodash';
import './Enrichment.scss';
import '../Shared/Table.scss';
import msig_icon from '../../resources/msig.ico';
import phosphosite_icon from '../../resources/phosphosite.ico';
import reactome_icon from '../../resources/reactome.jpg';
import go_icon from '../../resources/go.png';
import { phosphoprotService } from '../../services/phosphoprot.service';

class Enrichment extends Component {
  state = {
    isValidSearchEnrichment: false,
    isSearching: false,
    enrichmentIcon: '',
    enrichmentIconText: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    enrichmentView: 'table',
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
    networkDataAvailable: false,
    networkData: {},
    networkDataNew: {},
    tests: {},
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
      nodeColors: ['red', 'white', 'blue']
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

  componentDidMount() {
    this.getTableHelpers(this.testSelectedTransition, this.showBarcodePlot);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.enrichmentResults !== prevState.enrichmentResults) {
      debugger;
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
        debugger;
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
    const {
      enrichmentModel,
      enrichmentAnnotation,
      pValueType,
      enrichmentStudy
    } = this.props;
    const pValueTypeParam = pValueType === 'adjusted' ? 0.1 : 1;
    phosphoprotService
      .getEnrichmentMap(
        enrichmentModel,
        enrichmentAnnotation,
        '',
        pValueTypeParam,
        enrichmentStudy + 'plots'
      )
      .then(EMData => {
        this.setState({
          networkDataAvailable: true,
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
          }
        });
      });
  };

  // setHeight(e) {
  //   let bHeight = e;
  //   let splitterHeight = this.dialogHeight - 77;
  //   let height = (100 - Math.ceil(((splitterHeight - bHeight) / splitterHeight) * 100) - 1.35);
  //   this.s = height.toString() + "%";
  // }

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
        }
      });
    }
  };

  handleMaxLinePlot = info => {
    const { enrichmentStudy, enrichmentModel } = this.props;
    // let self = this;
    // if (this.state.barcodeSettings.barcodeData > 0) {
    if (info !== undefined && info !== null) {
      if (this.state.barcodeSettings.barcodeData) {
        if (this.state.barcodeSettings.barcodeData.length > 0) {
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
      }
    } else {
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
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    _.forEach(plotType, function(plot, i) {
      phosphoprotService
        .getPlot(id, plotType[i], enrichmentStudy + 'plots')
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
            '<svg preserveAspectRatio="xMinYMid meet" style="width:' +
              widthCalculation() * 0.5 +
              'px; height:' +
              heightCalculation() * 0.5 +
              'px;" id="currentSVG-' +
              id +
              '-' +
              i +
              '"'
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
          imageInfo.svg.push(svgInfo);
          currentSVGs.push(sanitizedSVG);
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
    debugger;
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
        //   debugger;
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
              debugger;
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
      enrichmentNameLoaded: false
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

  handleEnrichmentViewChange = choice => {
    return evt => {
      this.setState({
        enrichmentView: choice.enrichmentView
      });
    };
  };

  getView = () => {
    if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div>
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
    } else if (
      this.state.isValidSearchEnrichment &&
      !this.state.isSearching &&
      this.state.enrichmentView === 'table'
    ) {
      return (
        <EnrichmentResultsTable
          {...this.props}
          {...this.state}
          onEnrichmentViewChange={this.handleEnrichmentViewChange}
          onHandlePlotAnimation={this.handlePlotAnimation}
          onDisplayViolinPlot={this.displayViolinPlot}
        />
      );
    } else if (
      this.state.isValidSearchEnrichment &&
      !this.state.isSearching &&
      this.state.enrichmentView === 'network'
    ) {
      return (
        <EnrichmentResultsGraph
          {...this.props}
          {...this.state}
          onEnrichmentViewChange={this.handleEnrichmentViewChange}
          onHandlePlotAnimation={this.handlePlotAnimation}
          onDisplayViolinPlot={this.displayViolinPlot}
          onHandlePieClick={this.testSelected}
        />
      );
    } else if (this.state.isSearching) {
      return <TransitionActive />;
    } else return <TransitionStill />;
  };

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
              <Sidebar.Pusher>{enrichmentView}</Sidebar.Pusher>
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
