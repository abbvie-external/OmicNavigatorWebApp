import React, { Component } from 'react';
import { phosphoprotService } from '../../services/phosphoprot.service';
import { CancelToken } from 'axios';
import { withRouter } from 'react-router-dom';
import ButtonActions from '../Shared/ButtonActions';
import PepplotPlot from './PepplotPlot';
import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import _ from 'lodash';
import DOMPurify from 'dompurify';
import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import {
  getFieldValue,
  getField,
  typeMap,
} from '../utility/selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../utility/selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

let cancelRequestPepplotResultsGetPlot = () => {};
class PepplotResults extends Component {
  static defaultProps = {
    pepplotStudy: '',
    pepplotModel: '',
    pepplotTest: '',
    pepplotProteinSite: '',
    pepplotResults: [],
    pepplotColumns: [],
  };

  state = {
    treeDataRaw: [],
    treeData: [],
    treeDataColumns: [],
    plotType: [],
    imageInfo: {
      key: null,
      title: '',
      svg: [],
    },
    currentSVGs: [],
    isSVGDataLoaded: false,
    isItemSelected: false,
    isProteinSVGLoaded: false,
    itemsPerPageInformed: 100,
    pepplotRows: this.props.pepplotResults.length || 1000,
  };
  pepplotGridRef = React.createRef();
  // PepplotViewContainerRef = React.createRef();

  componentDidMount() {
    const ProteinSite = this.props.pepplotProteinSite || '';
    if (ProteinSite !== '') {
      const Proteins = this.props.pepplotResults;
      const Index = _.findIndex(Proteins, function(p) {
        return firstValue(p.Protein_Site) === ProteinSite;
      });
      const dataItem = Proteins[Index];
      this.getProteinPageFromUrl(
        this.getProteinData,
        this.getPlot,
        this.props.pepplotModel,
        dataItem,
      );
    }

    if (
      this.props.tab === 'pepplot' &&
      this.props.proteinToHighlightInDiffTable !== '' &&
      this.props.proteinToHighlightInDiffTable !== undefined
    ) {
      this.pageToProtein(
        this.props.pepplotResults,
        this.props.proteinToHighlightInDiffTable,
        this.state.itemsPerPageInformed,
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.tab === 'pepplot' &&
      this.props.proteinToHighlightInDiffTable !== '' &&
      this.props.proteinToHighlightInDiffTable !== undefined
    ) {
      this.pageToProtein(
        this.props.pepplotResults,
        this.props.proteinToHighlightInDiffTable,
        this.state.itemsPerPageInformed,
      );
    }
  }

  pageToProtein = (data, proteinToHighlight, itemsPerPage) => {
    if (this.pepplotGridRef.current !== null) {
      const Index = _.findIndex(data, function(p) {
        return p.Protein_Site === proteinToHighlight;
      });
      const pageNumber = Math.ceil(Index / itemsPerPage);
      this.pepplotGridRef.current.handlePageChange(
        {},
        { activePage: pageNumber },
      );
    }
  };

  getProteinPageFromUrl = (
    getProteinDataCb,
    getPlotCb,
    pepplotModel,
    dataItem,
  ) => {
    let imageInfo = { key: '', title: '', svg: [] };
    switch (pepplotModel) {
      case 'Differential Expression':
        imageInfo.title = 'Protein Intensity - ' + dataItem.MajorityProteinIDs;
        imageInfo.key = dataItem.MajorityProteinIDs;
        break;
      default:
        imageInfo.title = 'Phosphosite Intensity - ' + dataItem.Protein_Site;
        imageInfo.key = dataItem.Protein_Site;
    }
    getProteinDataCb(
      dataItem.id_mult ? dataItem.id_mult : dataItem.id,
      dataItem,
      getPlotCb,
      imageInfo,
    );
  };

  handleSVG = imageInfo => {
    this.setState({
      imageInfo: imageInfo,
      isProteinSVGLoaded: true,
    });
  };

  // handleGetPlotError = bool => {
  //   this.setState({
  //     isItemSelected: bool,
  //   });
  // };

  getProteinData = (id, dataItem, getPlotCb, imageInfo) => {
    this.setState({
      imageInfo: imageInfo,
      isItemSelected: true,
      isProteinSVGLoaded: false,
      isProteinDataLoaded: false,
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      currentSVGs: [],
    });
    const ProteinSiteVar = firstValue(dataItem.Protein_Site, true);
    this.props.onSearchCriteriaChange(
      {
        pepplotStudy: this.props.pepplotStudy || '',
        pepplotModel: this.props.pepplotModel || '',
        pepplotTest: this.props.pepplotTest || '',
        pepplotProteinSite: ProteinSiteVar || '',
      },
      false,
    );
    let pepplotModel = this.props.pepplotModel;
    let pepplotStudy = this.props.pepplotStudy;
    let plotType = ['splineplot'];
    switch (pepplotModel) {
      case 'DonorDifferentialPhosphorylation':
        plotType = ['dotplot'];
        break;
      case 'TreatmentDifferentialPhosphorylation':
        plotType = ['splineplot'];
        break;
      case 'Treatment and or Strain Differential Phosphorylation':
        plotType = ['StrainStimDotplot', 'StimStrainDotplot'];
        break;
      case 'Timecourse Differential Phosphorylation':
        plotType = ['splineplot', 'lineplot'];
        break;
      case 'Differential Expression':
        if (pepplotStudy === '***REMOVED***') {
          plotType = ['proteinlineplot'];
        } else {
          plotType = ['proteindotplot'];
        }
        break;
      case 'Differential Phosphorylation':
        if (pepplotStudy === '***REMOVED***') {
          plotType = ['proteinlineplot'];
        } else {
          plotType = ['proteindotplot'];
        }
        break;
      case 'No Pretreatment Timecourse Differential Phosphorylation':
        plotType = ['splineplot.modelII', 'lineplot.modelII'];
        break;
      case 'Ferrostatin Pretreatment Timecourse Differential Phosphorylation':
        plotType = ['splineplot.modelIII', 'lineplot.modelIII'];
        break;
      default:
        plotType = ['dotplot'];
    }
    const handleSVGCb = this.handleSVG;
    getPlotCb(id, plotType, pepplotStudy, imageInfo, handleSVGCb);
    if (pepplotModel !== 'Differential Expression') {
      phosphoprotService
        .getSiteData(id, pepplotStudy + 'plots', this.handleGetSiteDataError)
        .then(treeDataResponse => {
          this.setState({
            treeDataRaw: treeDataResponse,
          });
          let tdCols = _.map(_.keys(treeDataResponse[0]), function(d) {
            return { key: d, field: d };
          });
          this.setState({
            treeDataColumns: tdCols,
          });
          let tD = _.map(treeDataResponse, function(d, i) {
            let entries = _.toPairs(d);

            entries = _.map(entries, function(e) {
              return { key: e[0], text: e[0], items: [{ text: e[1] }] };
            });
            return {
              key: i + 1,
              text: 'Peptide' + (i + 1) + '  (' + d.Modified_sequence + ')',
              items: entries,
            };
          });
          this.setState({
            treeData: tD,
            isProteinDataLoaded: true,
          });
        })
        .catch(error => {
          console.error('Error during getSiteData', error);
        });
    } else {
      phosphoprotService
        .getProteinData(id, pepplotStudy + 'plots', this.handleGetSiteDataError)
        .then(proteinDataResponse => {
          this.setState({
            treeDataRaw: proteinDataResponse,
          });
          let tdCols = _.map(_.keys(proteinDataResponse[0]), function(d) {
            return { key: d, field: d };
          });
          this.setState({
            treeDataColumns: tdCols,
          });

          let proteinData = _.map(proteinDataResponse, function(d, i) {
            var entries = _.toPairs(d);
            entries = _.map(entries, function(e) {
              return { key: e[0], text: e[0], items: [{ text: e[1] }] };
            });
            return {
              key: i + 1,
              text: 'Differential Expression Data',
              items: entries,
            };
          });
          this.setState({
            treeData: proteinData,
            isProteinDataLoaded: true,
          });
        })
        .catch(error => {
          console.error('Error during getProteinData', error);
        });
    }
  };

  handleGetSiteDataError = bool => {
    this.setState({
      isProteinDataLoaded: true,
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
    });
    this.props.onSearchCriteriaChange(
      {
        pepplotStudy: this.props.pepplotStudy || '',
        pepplotModel: this.props.pepplotModel || '',
        pepplotTest: this.props.pepplotTest || '',
        pepplotProteinSite: '',
      },
      false,
    );
  };

  getPlot = (id, plotType, pepplotStudy, imageInfo, handleSVGCb) => {
    // let self = this;
    let currentSVGs = [];
    // keep whatever dimension is less (height or width)
    // then multiply the other dimension by original svg ratio (height 595px, width 841px)
    // let PepplotPlotSVGHeight = this.calculateHeight(this);
    let PepplotPlotSVGWidth = this.calculateWidth(this);
    // if (PepplotPlotSVGHeight > PepplotPlotSVGWidth) {
    let PepplotPlotSVGHeight = PepplotPlotSVGWidth * 0.70749;
    // } else {
    //   PepplotPlotSVGWidth = PepplotPlotSVGHeight * 1.41344;
    // }
    cancelRequestPepplotResultsGetPlot();
    let cancelToken = new CancelToken(e => {
      cancelRequestPepplotResultsGetPlot = e;
    });
    _.forEach(plotType, function(plot, i) {
      phosphoprotService
        .getPlot(
          id,
          plotType[i],
          pepplotStudy + 'plots',
          undefined,
          cancelToken,
        )
        .then(svgMarkupObj => {
          let svgMarkup = svgMarkupObj.data;
          svgMarkup = svgMarkup.replace(/id="/g, 'id="' + id + '-' + i + '-');
          svgMarkup = svgMarkup.replace(
            /#glyph/g,
            '#' + id + '-' + i + '-glyph',
          );
          svgMarkup = svgMarkup.replace(/#clip/g, '#' + id + '-' + i + '-clip');
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
          let svgInfo = { plotType: plotType[i], svg: sanitizedSVG };

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
          console.error('Error during getPlot', error);
        });
    });
  };

  // calculateHeight() {
  //   var h = Math.max(
  //     document.documentElement.clientHeight,
  //     window.innerHeight || 0
  //   );
  //   // 90 for top menu and header
  //   return h - 90;
  // }

  calculateWidth() {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    if (w > 1199) {
      return w * 0.5;
    } else if (w < 1200 && w > 767) {
      return w * 0.4;
    } else return w * 0.8;
  }

  // calculateHeight(self) {
  //   let containerHeight =
  //     self.PepplotViewContainerRef.current !== null
  //       ? self.PepplotViewContainerRef.current.parentElement.offsetHeight
  //       : document.documentElement.clientHeight * .95;
  //   return containerHeight;
  // }

  // calculateWidth(self) {
  //   let containerWidth =
  //     self.PepplotViewContainerRef.current !== null
  //       ? self.PepplotViewContainerRef.current.parentElement.offsetWidth
  //       : document.documentElement.clientWidth * 0.95;
  //   return containerWidth;
  //}

  getTableHelpers = (
    getProteinDataCb,
    getPlotCb,
    proteinToHighlightInDiffTable,
  ) => {
    let addParams = {};
    addParams.rowHighlightMax = proteinToHighlightInDiffTable;
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

    addParams.showPlot = (pepplotModel, dataItem) => {
      return function() {
        let imageInfo = { key: '', title: '', svg: [] };
        switch (pepplotModel) {
          case 'Differential Expression':
            imageInfo.title =
              'Protein Intensity - ' + dataItem.MajorityProteinIDs;
            imageInfo.key = dataItem.MajorityProteinIDs;
            break;
          default:
            imageInfo.title =
              'Phosphosite Intensity - ' + dataItem.Protein_Site;
            imageInfo.key = dataItem.Protein_Site;
        }
        getProteinDataCb(
          dataItem.id_mult ? dataItem.id_mult : dataItem.id,
          dataItem,
          getPlotCb,
          imageInfo,
        );
      };
    };
    return addParams;
  };

  backToTable = () => {
    this.setState({
      isItemSelected: false,
      isProteinDataLoaded: false,
      isProteinSVGLoaded: false,
    });
    this.props.onSearchCriteriaChange(
      {
        pepplotStudy: this.props.pepplotStudy || '',
        pepplotModel: this.props.pepplotModel || '',
        pepplotTest: this.props.pepplotTest || '',
        pepplotProteinSite: '',
      },
      false,
    );
  };

  informItemsPerPage = items => {
    this.setState({
      itemsPerPageInformed: items,
    });
  };

  render() {
    const {
      pepplotStudy,
      pepplotModel,
      pepplotTest,
      pepplotColumns,
      pepplotResults,
      proteinToHighlightInDiffTable,
      proteinHighlightInProgress,
    } = this.props;

    const {
      isItemSelected,
      isProteinSVGLoaded,
      pepplotRows,
      itemsPerPageInformed,
    } = this.state;
    let pepplotCacheKey = `${pepplotStudy}-${pepplotModel}-${pepplotTest}`;
    if (
      proteinToHighlightInDiffTable !== '' &&
      proteinToHighlightInDiffTable !== null &&
      proteinToHighlightInDiffTable !== undefined
    ) {
      pepplotCacheKey = `${pepplotStudy}-${pepplotModel}-${pepplotTest}-${proteinToHighlightInDiffTable}`;
    }
    // const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(
      this.getProteinData,
      this.getPlot,
      proteinToHighlightInDiffTable,
    );
    if (!isItemSelected || proteinHighlightInProgress) {
      return (
        <div id="PepplotGrid">
          <EZGrid
            ref={this.pepplotGridRef}
            onInformItemsPerPage={this.informItemsPerPage}
            uniqueCacheKey={pepplotCacheKey}
            data={pepplotResults}
            columnsConfig={pepplotColumns}
            totalRows={pepplotRows}
            // use "pepplotRows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={itemsPerPageInformed}
            exportBaseName="Differential_Phosphorylation_Analysis"
            // quickViews={quickViews}
            disableGeneralSearch
            disableGrouping
            disableColumnVisibilityToggle
            // disableFilters
            min-height="75vh"
            additionalTemplateInfo={additionalTemplateInfo}
            headerAttributes={<ButtonActions />}
          />
        </div>
      );
    } else if (isItemSelected && !isProteinSVGLoaded) {
      return (
        <div>
          <LoaderActivePlots />
        </div>
      );
    } else {
      return (
        <div>
          <PepplotPlot
            // ref={this.PepplotViewContainerRef}
            {...this.props}
            {...this.state}
            onBackToTable={this.backToTable}
          ></PepplotPlot>
        </div>
      );
    }
  }
}

export default withRouter(PepplotResults);

function firstValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    return firstValue;
  }
}
