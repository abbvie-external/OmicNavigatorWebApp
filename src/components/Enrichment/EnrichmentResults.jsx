import React, { Component } from 'react';
import { Popup, Icon } from 'semantic-ui-react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import SearchingAlt from '../Transitions/SearchingAlt';
import './EnrichmentResults.scss';
import _ from 'lodash';
import DOMPurify from 'dompurify';
import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap
} from '../utility/selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class EnrichmentResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      annotationData: [],
      enrichmentDataItem: [],
      enrichmentTerm: '',
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
      isViolinPlotLoading: false,
      isViolinPlotLoaded: false,
      barcodeSettings: {
        barcodeData: [],
        brushing: false,
        brushedData: [],
        // chartSize: { height: '200', width: '960' },
        lineID: '',
        statLabel: {},
        statistic: '',
        logFC: '',
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
  }

  componentDidMount() {
    const DescriptionAndTest = this.props.enrichmentDescriptionAndTest || '';
    if (DescriptionAndTest !== '') {
      const AllDescriptionsAndTests = this.props.enrichmentResults;
      const dataItemDescription = getDataItemDescription(DescriptionAndTest);
      const dataItemIndex = _.findIndex(AllDescriptionsAndTests, function(d) {
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
    const TestSiteVar = `${test}:${dataItem.Description}`;
    let xLargest = 0;
    let imageInfo = { key: '', title: '', svg: [] };
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

  showPhosphositePlus = dataItem => {
    return function() {
      var protein = (dataItem.Description
        ? dataItem.Description
        : dataItem.MajorityProteinIDsHGNC
      ).split(';')[0];
      let param = { queryId: -1, from: 0, searchStr: protein };
      phosphoprotService.postToPhosphositePlus(
        param,
        'https://www.phosphosite.org/proteinSearchSubmitAction.action'
      );
    };
  };

  getTableHelpers = (testSelectedTransitionCb, showBarcodePlotCb) => {
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
        testSelectedTransitionCb(true);
        const TestSiteVar = `${test}:${dataItem.Description}`;
        self.props.onSearchCriteriaChange(
          {
            enrichmentStudy: self.props.enrichmentStudy || '',
            enrichmentModel: self.props.enrichmentModel || '',
            enrichmentAnnotation: self.props.enrichmentAnnotation || '',
            enrichmentDescriptionAndTest: TestSiteVar || ''
          },
          false
        );
        let xLargest = 0;
        let imageInfo = { key: '', title: '', svg: [] };

        if (self.state.annotationData.length == 0) {
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
                  let BardcodeInfoObj = JSON.parse(
                    barcodeDataResponse['object']
                  );
                  let highest = barcodeDataResponse['highest'][0];
                  // if (!this.state.modelsToRenderViolin.includes(this.enrichmentModel)){
                  //   this.setState({ sizeVal = '0%' )};
                  // } else {
                  //   this.setState({ sizeVal = '50%')};
                  // }

                  showBarcodePlotCb(dataItem, BardcodeInfoObj, test, highest);
                });
              // });
            });
          //stored annodationdata and won't call the service after the first time...reset it when sc changes
        } else {
          dataItem.Annotation = _.find(self.state.annotationData, {
            Description: dataItem.Description
          }).Key;
          let term = dataItem.Annotation;

          self.setState({
            imageInfo: {
              ...self.state.imageInfo,
              key: `${test} : ${dataItem.Description}`,
              title: `${test} : ${dataItem.Description}`
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
        }
      };
    };

    addParams.getLink = (enrichmentStudy, enrichmentAnnotation, dataItem) => {
      let self = this;
      return function() {
        if (self.state.annotationData.length == 0) {
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

    return addParams;
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
    // let containerWidth = this.calculateWidth() * 0.95;
    // let containerHeight = this.calculateHeight() * 0.95;
    this.setState({
      isTestDataLoaded: true,
      barcodeSettings: {
        barcodeData: barcode,
        brushing: false,
        brushedData: [],
        // chartSize: { height: 250, width: containerWidth - 500 },
        lineID: '',
        statLabel: barcode[0].statLabel,
        statistic: 'statistic',
        logFC: 'logFC',
        highLabel: barcode[0].highLabel,
        lowLabel: barcode[0].lowLabel,
        highStat: highest,
        enableBrush: true
      }
    });
  };

  handleBarcodeChanges = changes => {
    if (changes.brushing !== undefined) {
      this.setState({
        barcodeSettings: {
          ...this.state.barcodeSettings,
          brushing: changes.brushing
        }
      });
    }

    if (changes.brushedData !== undefined) {
      if (changes.brushedData.length > 0) {
        this.setState({
          barcodeSettings: {
            ...this.state.barcodeSettings,
            brushedData: changes.brushedData
          }
        });
      } else {
        this.setState({
          barcodeSettings: {
            ...this.state.barcodeSettings,
            brushedData: []
          }
        });
      }
    }
  };

  handleTickBrush = info => {
    if (info !== undefined) {
      const { barcodeSettings } = this.state;
      // if (barcodeSettings.brushedData.length > 0) {
      if (info.brushedData !== undefined) {
        if (info.brushedData.length > 0) {
          // const barcodeInfo = JSON.parse(info.brushedData);
          const i = _.map(info.brushedData, function(d) {
            // d.statistic = _.find(barcodeSettings.barcodeData, {
            //   lineID: d[0].lineID,
            //   id_mult: d[0].id_mult
            // }).statistic;
            // d.logFC = _.find(barcodeSettings.barcodeData, {
            //   lineID: d[0].lineID,
            //   id_mult: d[0].id_mult
            // }).logFC;
            d.statistic = _.find(barcodeSettings.barcodeData, {
              lineID: d.lineID,
              id_mult: d.id_mult
            }).statistic;
            d.logFC = _.find(barcodeSettings.barcodeData, {
              lineID: d.lineID,
              id_mult: d.id_mult
            }).logFC;
            return d;
          });
          this.setState({
            isViolinPlotLoading: true,
            isViolinPlotLoaded: false
          });
          const boxPlotArray = i;
          const reducedBoxPlotArray = _.reduce(
            boxPlotArray,
            function(res, datum) {
              (res[datum.statLabel] || (res[datum.statLabel] = [])).push({
                cpm: datum.logFC,
                sample: datum.lineID,
                statistic: datum.statistic,
                id_mult: datum.id_mult
              });
              return res;
            },
            {}
          );
          const vData = _.mapValues(reducedBoxPlotArray, function(v: any) {
            return { values: v };
          });
          const ordered = {};
          Object.keys(vData)
            .sort()
            .forEach(function(key) {
              ordered[key] = vData[key];
            });

          // var kLSplit = document.getElementById('left-splitter');
          this.setState({
            // violinSettings: {
            violinData: ordered,
            // chartSize: { height: kLSplit.clientHeight + 25, width: kLSplit.clientWidth },
            // chartSize: {
            //   height: 400,
            //   width: 400
            // },
            // axisLabels: {
            //   xAxis: 'change this term',
            //   yAxis:
            //     "log<tspan baseline-shift='sub' font-size='14px'>2</tspan>(FC)"
            // },
            // id: 'violin-graph-1',
            // pointUniqueId: 'sample',
            // pointValue: 'cpm',
            // title: '',
            // subtitle: '',
            // tooltip: {
            //   show: true,
            //   fields: [
            //     { label: 'log(FC)', value: 'cpm', toFixed: true },
            //     { label: 'Protien', value: 'sample' }
            //   ]
            // },
            // xName: 'tissue'
            // },
            isViolinPlotLoading: false,
            isViolinPlotLoaded: true
          });
        } else {
          this.setState({
            violinData: [],
            isViolinPlotLoading: false,
            isViolinPlotLoaded: false
          });
          // if (this.plots.includes('violin')) {
          //   let index = this.plots.indexOf('violin');
          //   this.plots.splice(index, 1);
          // }
        }
      }
    }
  };

  handleTickData = info => {
    const { enrichmentStudy, enrichmentModel } = this.props;
    // let self = this;
    // if (this.state.barcodeSettings.barcodeData > 0) {
    if (info !== undefined) {
      if (this.state.barcodeSettings.barcodeData) {
        if (this.state.barcodeSettings.barcodeData.length > 0) {
          this.setState({
            SVGPlotLoaded: false,
            SVGPlotLoading: true
          });
          const dataItem = this.state.barcodeSettings.barcodeData.find(
            i => i.lineID === info.lineID
          );
          // let protein = dataItem.lineID;
          // this.plotDataAvailable = true;
          let id = dataItem.id_mult ? dataItem.id_mult : dataItem.id;

          let splitterHeight = document.getElementById('SVGSplitContainer')
            .clientHeight;
          let splitterWidth = document.getElementById('SVGSplitContainer')
            .clientWidth;

          var w = (splitterWidth - 50) * 0.86;
          var h = (splitterHeight - 40) * 0.94;

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
          // }
        }
      }
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

  //   const p = function (plot, i) {
  //     return new Promise(resolve => setTimeout(function () {

  //       if (self.plots.indexOf(plot) == -1) {
  //         self.plots.push(plot);
  //       }

  //       self._phosphoprotService.getPlot(id, plotType[i], self.selectedStudy.study + "plots").subscribe((svgMarkup) => {
  //         svgMarkup = svgMarkup.replace(/id="/g, 'id="' + id + '-' + i + '-');
  //         svgMarkup = svgMarkup.replace(/#glyph/g, '#' + id + '-' + i + '-glyph');
  //         svgMarkup = svgMarkup.replace(/#clip/g, '#' + id + '-' + i + '-clip');
  //         // svgMarkup = svgMarkup.replace(/<svg/g, '<svg preserveAspectRatio="none" style="width:' + self.calculateWidth() * .65 + 'px; height:' + self.calculateHeight() * .70 + 'px;" id="currentSVG-' + id + '-' + i + '"');
  //         svgMarkup = svgMarkup.replace(/<svg/g, '<svg preserveAspectRatio="none" style="width:' + (splitterWidth - 50) + 'px; height:' + (splitterHeight - 50) + 'px;" id="currentSVG-' + id + '-' + i + '"');
  //         //console.log(svgMarkup)
  //         var sanitizedSVG = self.sanitized.bypassSecurityTrustHtml(svgMarkup);

  //         var svgInfo = { "plotType": plotType[i], "svg": sanitizedSVG }
  //         resolve(
  //           self.imageInfo.svg[i] = svgInfo
  //         );

  //         self.currentSVGs.push(sanitizedSVG);

  //         if (i == 1){
  //           psp.style.visibility = "visible";
  //         }
  //       })
  //     }, 1000 * i))
  //   }

  //   //Promise.all(plotType.map(p))
  // }

  backToTable = () => {
    this.setState({
      isTestDataLoaded: false,
      isTestSelected: false,
      enrichmentNameLoaded: false
    });
    this.props.onSearchCriteriaChange(
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

  // enrichmentViewChange(choice) {
  //   return evt => {
  //     this.props.onEnrichmentViewChange({
  //       enrichmentView: choice
  //     });
  //   };
  // };

  render() {
    const {
      enrichmentResults,
      enrichmentColumns,
      enrichmentStudy,
      enrichmentModel,
      enrichmentAnnotation
    } = this.props;
    const enrichmentCacheKey = `${enrichmentStudy}-${enrichmentModel}-${enrichmentAnnotation}`;
    const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(
      this.testSelectedTransition,
      this.showBarcodePlot
    );

    const IconPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    const enrichmentViewToggle = (
      <div className="TableVsNetworkToggle">
        <Popup
          trigger={
            <Icon
              name="table"
              size="large"
              color="orange"
              bordered
              className="TableVsNetworkButtons"
              inverted={this.props.enrichmentView === 'table'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'table'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Table"
        />
        <Popup
          trigger={
            <Icon
              name="chart pie"
              size="large"
              color="orange"
              bordered
              className="TableVsNetworkButtons"
              inverted={this.props.enrichmentView === 'network'}
              onClick={this.props.onEnrichmentViewChange({
                enrichmentView: 'network'
              })}
            />
          }
          style={IconPopupStyle}
          inverted
          basic
          position="bottom left"
          content="View Network Graph"
        />
      </div>
    );

    if (!this.state.isTestSelected) {
      return (
        <div>
          {enrichmentViewToggle}
          <EZGrid
            uniqueCacheKey={enrichmentCacheKey}
            data={enrichmentResults}
            columnsConfig={enrichmentColumns}
            // totalRows={rows}
            // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={100}
            exportBaseName="Enrichment_Analysis"
            quickViews={quickViews}
            disableGeneralSearch
            disableGrouping
            disableColumnVisibilityToggle
            min-height="75vh"
            additionalTemplateInfo={additionalTemplateInfo}
            // extraHeaderItem={enrichmentViewToggle}
          />
        </div>
      );
    } else if (this.state.isTestSelected && !this.state.isTestDataLoaded) {
      return (
        <div>
          <SearchingAlt />
        </div>
      );
    } else {
      return (
        <div>
          <SplitPanesContainer
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
            onHandleBarcodeChanges={this.handleBarcodeChanges}
            onHandleTickBrush={this.handleTickBrush}
            onHandleTickData={this.handleTickData}
          ></SplitPanesContainer>
        </div>
      );
    }
  }
}

export default withRouter(EnrichmentResults);

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
