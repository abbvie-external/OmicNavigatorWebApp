import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
// import ButtonActions from './ButtonActions';
// import TableHelpers from '../utility/TableHelpers';
import Plot from './Plot';
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
  constructor(props) {
    super(props);
    this.state = {
      // tab: this.props.tab || 'pepplot',
      // study: this.props.study || '',
      // model: this.props.model || '',
      // test: this.props.test || '',
      // pepplotResults: this.props.pepplotResults || [],
      // pepplotColumns: this.props.pepplotColumns || [],
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      plotType: [],
      imageInfo: {
        title: '',
        svg: []
      },
      currentSVGs: [],
      isProteinSelected: false
    };

    this.getProteinData = this.getProteinData.bind(this);
    this.getPlot = this.getPlot.bind(this);
    this.getTableHelpers = this.getTableHelpers.bind(this);
  }

  componentDidMount() {}

  getProteinData(id, dataItem, getPlotCb, imageInfo) {
    debugger;
    let self = this;
    self.setState({
      imageInfo: imageInfo,
      isProteinSelected: true,
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      currentSVGs: []
      // imageInfo.svg = []
    });

    let model = this.props.model;
    let study = this.props.study;

    let plotType = ['splineplot'];
    switch (model) {
      case 'DonorDifferentialPhosphorylation':
        plotType = ['dotplot'];
        break;
      case 'Treatment and/or Strain Differential Phosphorylation':
        plotType = ['StrainStimDotplot', 'StimStrainDotplot'];
        break;
      case 'Timecourse Differential Phosphorylation':
        plotType = ['splineplot', 'lineplot'];
        break;
      case 'Differential Expression':
        plotType = ['proteindotplot'];
        break;
      case 'Differential Phosphorylation':
        plotType = ['phosphodotplot'];
        break;
      default:
        plotType = ['dotplot'];
    }

    if (model !== 'Differential Expression') {
      phosphoprotService
        .getSiteData(id, study + 'plots')
        .then(treeData => {
          self.state.treeDataRaw = treeData;
          // console.log('here is the raw treedata');
          // console.log(treeDataRaw);
          self.state.treeDataColumns = _.map(_.keys(treeData[0]), function(d) {
            return { field: d };
          });
          treeData = _.map(treeData, function(d, i) {
            let entries = _.toPairs(d);

            entries = _.map(entries, function(e) {
              return { text: e[0], items: [{ text: e[1] }] };
            });
            return {
              text: 'Peptide' + (i + 1) + '  (' + d.Modified_sequence + ')',
              items: entries
            };
          });
          self.state.treeData = treeData;
        })
        .then(function() {
          getPlotCb(id, plotType, study, imageInfo, self);
        });
    } else {
      phosphoprotService
        .getProteinData(id, study + 'plots')
        .then(proteinData => {
          self.state.treeDataRaw = proteinData;
          // console.log('here is the raw treeData');
          // console.log(treeDataRaw);
          self.state.treeDataColumns = _.map(_.keys(proteinData[0]), function(
            d
          ) {
            return { field: d };
          });

          proteinData = _.map(proteinData, function(d, i) {
            var entries = _.toPairs(d);
            entries = _.map(entries, function(e) {
              return { text: e[0], items: [{ text: e[1] }] };
            });
            return entries;
          });

          // console.log('this is proteinData');
          // console.log(proteinData);
          self.state.treeData = proteinData[0];
        })
        .then(function() {
          getPlotCb(id, plotType, study, imageInfo, self);
        });
    }
  }

  getPlot(id, plotType, study, imageInfo, self) {
    let currentSVGs = [];
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
            '<svg preserveAspectRatio="none" style="width:' +
              heightCalculation() * 0.65 +
              'px; height:' +
              widthCalculation() * 0.7 +
              'px;" id="currentSVG-' +
              id +
              '-' +
              i +
              '"'
          );
          let sanitizedSVG = DOMPurify.sanitize(svgMarkup);
          let svgInfo = { plotType: plotType[i], svg: sanitizedSVG };
          imageInfo.svg.push(svgInfo);
          // add local state for some of these objects~
          currentSVGs.push(sanitizedSVG);
          debugger;
        });
    });
  }

  calculateHeight(): number {
    var h = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
    return h;
  }

  calculateWidth(): number {
    var w = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    return w;
  }

  getTableHelpers(getProteinDataCb, getPlotCb) {
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
        let imageInfo = { title: '', svg: [] };
        if (dataItem.id_mult) {
          switch (model) {
            case 'Differential Expression':
              imageInfo.title =
                'Protein Intensity - ' + dataItem.MajorityProteinIDs;
              break;
            default:
              imageInfo.title =
                'Phosphosite Intensity - ' + dataItem.Protein_Site;
          }
          getProteinDataCb(
            dataItem.id_mult ? dataItem.id_mult : dataItem.id,
            dataItem,
            getPlotCb,
            imageInfo
          );
        }
      };
    };
    return addParams;
  }

  render() {
    const results = this.props.pepplotResults;
    const columns = this.props.pepplotColumns;
    const rows = this.props.pepplotResults.length;
    const additionalTemplateInfo = this.getTableHelpers(
      this.getProteinData,
      this.getPlot
    );

    if (!this.isProteinSelected) {
      return (
        <div>
          <EZGrid
            data={results}
            columnsConfig={columns}
            totalRows={rows}
            // use "rows" for itemsPerPage if you want all results. For dev, keep it at 500 so rendering doesn't take too long
            itemsPerPage={500}
            height="65vh"
            additionalTemplateInfo={additionalTemplateInfo}
          />
        </div>
      );
    } else {
      return (
        <div>
          <Plot {...this.props}></Plot>
        </div>
      );
    }
  }
}

export default PepplotResults;
