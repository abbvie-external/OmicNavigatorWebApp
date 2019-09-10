import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import ButtonActions from './ButtonActions';
import PlotContainer from './Plot';
import LoadingPlots from './LoadingPlots';
import _ from 'lodash';
import DOMPurify from 'dompurify';

import QHGrid from '../utility/QHGrid';
import EZGrid from '../utility/EZGrid';
import QuickViewModal from '../utility/QuickViewModal';
import { getFieldValue, getField, typeMap } from '../selectors/QHGridSelector';
export * from '../utility/FilterTypeConfig';
export * from '../selectors/quickViewSelector';
export { QHGrid, EZGrid, QuickViewModal };
export { getField, getFieldValue, typeMap };

class PepplotResults extends Component {
  static defaultProps = {
    study: '',
    model: '',
    test: '',
    pepplotResults: [],
    pepplotColumns: [],
    isProteinSelected: false
  };

  constructor(props) {
    super(props);
    this.state = {
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
      isProteinDataLoaded: false
    };
  }

  componentDidMount() {}

  handleSVG = imageInfo => {
    this.setState({
      imageInfo: imageInfo,
      isProteinDataLoaded: true
    });
  };

  getProteinData = (id, dataItem, getPlotCb, imageInfo) => {
    const handleSVGCb = this.handleSVG;
    this.setState({
      imageInfo: imageInfo,
      isProteinSelected: true,
      isProteinDataLoaded: false,
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      currentSVGs: []
    });

    let model = this.props.model;
    let study = this.props.study;

    let plotType = ['splineplot'];
    switch (model) {
      case 'DonorDifferentialPhosphorylation':
        plotType = ['dotplot'];
        break;
      case 'TreatmentDifferentialPhosphorylation':
        plotType = ['splineplot'];
        break;
      case 'Treatment and/or Strain Differential Phosphorylation':
        plotType = ['StrainStimDotplot', 'StimStrainDotplot'];
        break;
      case 'Timecourse Differential Phosphorylation':
        plotType = ['splineplot', 'lineplot'];
        break;
      case 'Differential Expression':
        if (study === '***REMOVED***') {
          plotType = ['proteinlineplot'];
        } else {
          plotType = ['proteindotplot'];
        }
        break;
      case 'Differential Phosphorylation':
        if (study === '***REMOVED***') {
          plotType = ['proteinlineplot'];
        } else {
          plotType = ['proteindotplot'];
        }
        break;
      default:
        plotType = ['dotplot'];
    }

    if (model !== 'Differential Expression') {
      phosphoprotService
        .getSiteData(id, study + 'plots')
        .then(treeDataResponse => {
          this.setState({
            treeDataRaw: treeDataResponse
          });
          let tdCols = _.map(_.keys(treeDataResponse[0]), function(d) {
            return { key: d, field: d };
          });
          this.setState({
            treeDataColumns: tdCols
          });
          let tD = _.map(treeDataResponse, function(d, i) {
            let entries = _.toPairs(d);

            entries = _.map(entries, function(e) {
              return { key: e[0], text: e[0], items: [{ text: e[1] }] };
            });
            return {
              key: i + 1,
              text: 'Peptide' + (i + 1) + '  (' + d.Modified_sequence + ')',
              items: entries
            };
          });
          this.setState({
            treeData: tD
          });
        })
        .then(function() {
          getPlotCb(id, plotType, study, imageInfo, handleSVGCb);
        });
    } else {
      phosphoprotService
        .getProteinData(id, study + 'plots')
        .then(proteinDataResponse => {
          this.setState({
            treeDataRaw: proteinDataResponse
          });
          let tdCols = _.map(_.keys(proteinDataResponse[0]), function(d) {
            return { key: d, field: d };
          });
          this.setState({
            treeDataColumns: tdCols
          });

          let proteinData = _.map(proteinDataResponse, function(d, i) {
            var entries = _.toPairs(d);
            entries = _.map(entries, function(e) {
              return { key: e[0], text: e[0], items: [{ text: e[1] }] };
            });
            return {
              key: i + 1,
              text: 'Differential Expression Data',
              items: entries
            };
          });
          // console.log('this is proteinData');
          // console.log(proteinData);
          this.setState({
            treeData: proteinData
          });
        })
        .then(function() {
          getPlotCb(id, plotType, study, imageInfo, handleSVGCb);
        });
    }
  };

  getPlot = (id, plotType, study, imageInfo, handleSVGCb) => {
    let currentSVGs = [];
    debugger;
    let heightCalculation = this.calculateHeight;
    let widthCalculation = this.calculateWidth;
    _.forEach(plotType, function(plot, i) {
      phosphoprotService
        .getPlot(id, plotType[i], study + 'plots')
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
              widthCalculation() * 0.7 +
              'px; height:' +
              heightCalculation() * 0.7 +
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

  getTableHelpers = (getProteinDataCb, getPlotCb) => {
    let addParams = {};
    addParams.showPhosphositePlus = dataItem => {
      return function() {
        var protein = (dataItem.Protein
          ? dataItem.Protein
          : dataItem.MajorityProteinIDsHGNC
        ).split(';')[0];
        let param = { proteinNames: protein, queryId: -1, from: 0 };
        phosphoprotService.postToPhosphositePlus(
          param,
          'https://www.phosphosite.org/proteinSearchSubmitAction.action'
        );
      };
    };

    addParams.showPlot = (model, dataItem) => {
      return function() {
        let imageInfo = { key: '', title: '', svg: [] };
        switch (model) {
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
          imageInfo
        );
      };
    };
    return addParams;
  };

  backToGrid = () => {
    this.setState({
      isProteinSelected: false
    });
  };

  render() {
    const results = this.props.pepplotResults;
    const columns = this.props.pepplotColumns;
    const rows = this.props.pepplotResults.length;
    const quickViews = [];
    const additionalTemplateInfo = this.getTableHelpers(
      this.getProteinData,
      this.getPlot
    );
    if (!this.state.isProteinSelected) {
      return (
        <div>
          <EZGrid
            data={results}
            columnsConfig={columns}
            // totalRows={rows}
            // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={100}
            exportBaseName="Differential_Phosphorylation_Analysis"
            quickViews={quickViews}
            disableGeneralSearch
            disableGrouping
            disableColumnVisibilityToggle
            height="75vh"
            additionalTemplateInfo={additionalTemplateInfo}
            headerAttributes={<ButtonActions />}
          />
        </div>
      );
    } else if (
      this.state.isProteinSelected &&
      !this.state.isProteinDataLoaded
    ) {
      return (
        <div>
          <LoadingPlots />
        </div>
      );
    } else {
      return (
        <div>
          <PlotContainer
            {...this.state}
            onBackToGrid={this.backToGrid}
          ></PlotContainer>
        </div>
      );
    }
  }
}

export default withRouter(PepplotResults);
