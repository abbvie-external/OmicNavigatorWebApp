import React, { Component, useMemo } from 'react';
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
      tab: this.props.tab || 'pepplot',
      study: this.props.study || '',
      model: this.props.model || '',
      test: this.props.test || '',
      pepplotResults: this.props.pepplotResults || [],
      pepplotColumns: this.props.pepplotColumns || [],
      treeDataRaw: [],
      treeData: [],
      treeDataColumns: [],
      plotType: [],
      imageInfo: {
        title: '',
        svg: []
      },
      // currentSVGs: [],
      isProteinSelected: false
    };

    this.getProteinData = this.getProteinData.bind(this);
    this.getPlot = this.getPlot.bind(this);
    this.getTableHelpers = this.getTableHelpers.bind(this);
  }

  componentDidMount() {}

  getProteinData(id, dataItem, plotCb, imageInfo) {
    let treeDataRaw = [];
    let treeData = [];
    let treeDataColumns = [];
    // let imageInfo.svg = [];
    this.setState({
      isProteinSelected: true
    });
    // this.state.isProteinSelected = true;
    // this.forceUpdate();
    // this.setState({
    //   currentSVGs = [],
    //   treeDataRaw = [],
    //   treeData = [];
    //   treeDataColumns = [];
    //   imageInfo.svg = [];
    // })
    let model = this.props.searchCriteria.model;
    let study = this.props.searchCriteria.study;
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
          treeDataRaw = treeData;
          console.log('here is the raw treedata');
          console.log(treeDataRaw);
          treeDataColumns = _.map(_.keys(treeData[0]), function(d) {
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
        })
        .then(function() {
          plotCb(id, plotType, study, imageInfo);
        });
    } else {
      phosphoprotService
        .getProteinData(id, study + 'plots')
        .then(proteinData => {
          treeDataRaw = proteinData;
          console.log('here is the raw treeData');
          console.log(treeDataRaw);
          treeDataColumns = _.map(_.keys(proteinData[0]), function(d) {
            return { field: d };
          });

          proteinData = _.map(proteinData, function(d, i) {
            var entries = _.toPairs(d);
            entries = _.map(entries, function(e) {
              return { text: e[0], items: [{ text: e[1] }] };
            });
            return entries;
          });

          console.log('this is proteinData');
          console.log(proteinData);
          treeData = proteinData[0];
        })
        .then(function() {
          plotCb(id, plotType, study, imageInfo);
        });
    }
  }

  getPlot(id, plotType, study, imageInfo) {
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
          var sanitizedSVG = DOMPurify.sanitize(svgMarkup);
          debugger;
          let svgInfo = { plotType: plotType[i], svg: svgMarkup };
          imageInfo.svg.push(svgInfo);
          // add local state for some of these objects~
          currentSVGs.push(svgMarkup);
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

  getTableHelpers(proteinCb, plotCb) {
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
          proteinCb(
            dataItem.id_mult ? dataItem.id_mult : dataItem.id,
            dataItem,
            plotCb,
            imageInfo
          );
        }
      };
    };
    return addParams;
  }

  render() {
    const results = this.props.searchCriteria.pepplotResults;
    const columns = this.props.searchCriteria.pepplotColumns;
    const rows = this.props.searchCriteria.pepplotResults.length;
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
