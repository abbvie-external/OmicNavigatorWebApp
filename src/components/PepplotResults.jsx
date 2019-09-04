import React, { Component } from 'react';
import { phosphoprotService } from '../services/phosphoprot.service';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import PlotContainer from './Plot';
import LoadingPlots from './LoadingPlots';
import { Dimmer, Loader } from 'semantic-ui-react';
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
      currentSVGs: [],
      isProteinSelected: this.props.isProteinSelected || false,
      isProteinDataLoaded: false
    };
    this.getProteinData = this.getProteinData.bind(this);
    this.backToGrid = this.backToGrid.bind(this);
    this.getPlot = this.getPlot.bind(this);
    this.getTableHelpers = this.getTableHelpers.bind(this);
    this.handleSVG = this.handleSVG.bind(this);
  }

  componentDidMount() {}

  handleSVG(imageInfo) {
    this.setState({
      imageInfo: imageInfo,
      isProteinDataLoaded: true
    });
  }

  getProteinData(id, dataItem, getPlotCb, imageInfo) {
    let self = this;
    const handleSVGCb = this.handleSVG;
    self.setState({
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
        .then(treeDataResponse => {
          // self.state.treeDataRaw = treeData;
          // console.log('here is the raw treedata');
          // console.log(treeDataResponse);
          self.setState({
            treeDataRaw: treeDataResponse
          });
          let tdCols = _.map(_.keys(treeDataResponse[0]), function(d) {
            return { field: d };
          });
          self.setState({
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
          self.setState({
            treeDataRaw: proteinDataResponse
          });
          // console.log('here is the raw treeData');
          // console.log(proteinDataResponse);
          let tdCols = _.map(_.keys(proteinDataResponse[0]), function(d) {
            return { key: d, field: d };
          });
          self.setState({
            treeDataColumns: tdCols
          });

          let proteinData = _.map(proteinDataResponse, function(d, i) {
            var entries = _.toPairs(d);
            entries = _.map(entries, function(e) {
              return { key: e[0], text: e[0], items: [{ text: e[1] }] };
            });
            return entries;
          });
          // console.log('this is proteinData');
          // console.log(proteinData);
          self.setState({
            treeData: proteinData[0]
          });
        })
        .then(function() {
          getPlotCb(id, plotType, study, imageInfo, handleSVGCb);
        });
    }
  }

  getPlot(id, plotType, study, imageInfo, handleSVGCb) {
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
  }

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
        let imageInfo = { key: '', title: '', svg: [] };
        if (dataItem.id_mult) {
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
        }
      };
    };
    return addParams;
  }

  backToGrid() {
    this.setState({
      isProteinSelected: false
    });
  }

  render() {
    const results = this.props.pepplotResults;
    const columns = this.props.pepplotColumns;
    const rows = this.props.pepplotResults.length;
    const additionalTemplateInfo = this.getTableHelpers(
      this.getProteinData,
      this.getPlot
    );
    if (!this.state.isProteinSelected) {
      return (
        <div>
          {/* <ButtonActions /> */}
          <EZGrid
            data={results}
            columnsConfig={columns}
            totalRows={rows}
            // use "rows" for itemsPerPage if you want all results. For dev, keep it lower so rendering is faster
            itemsPerPage={50}
            disableGeneralSearch={true}
            disableGrouping={true}
            disableColumnVisibilityToggle={true}
            height="75vh"
            additionalTemplateInfo={additionalTemplateInfo}
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
