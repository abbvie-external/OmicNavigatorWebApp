import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// import ButtonActions from './ButtonActions';
import SplitPanesContainer from './SplitPanesContainer';
import NetworkGraphTree from './NetworkGraphTree';
import SearchingAlt from '../Transitions/SearchingAlt';
import './EnrichmentResultsGraph.scss';
import * as d3 from 'd3';
// import _ from 'lodash';

class EnrichmentResultsGraph extends Component {
  static defaultProps = {
    enrichmentStudy: '',
    enrichmentModel: '',
    enrichmentAnnotation: '',
    enrichmentResults: [],
    enrichmentColumns: [],
    isTestSelected: false,
    showNetworkLabels: true
  };

  state = {
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
    isTestDataLoaded: false
  };

  componentDidMount() {}

  // componentWillUnmount() {
  //   d3.select("#svg-chart-network").remove();
  // }

  showBarcodePlot = (dataItem, barcode, test, largest) => {
    // this.bData = barcode;
    // this.bSettings = {
    //   lineID: "",
    //   statLabel: barcode[0].statLabel,
    //   statistic: 'statistic',
    //   highLabel: barcode[0].highLabel,
    //   lowLabel: barcode[0].lowLabel,
    //   highStat: largest,
    //   enableBrush: true
    // }
    this.setState({
      isTestDataLoaded: true
    });
  };

  testSelectedTransition = () => {
    this.setState({
      isTestSelected: true
    });
  };

  render() {
    if (!this.state.isTestSelected) {
      return (
        <div>
          <NetworkGraphTree {...this.props} {...this.state}></NetworkGraphTree>
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
          ></SplitPanesContainer>
        </div>
      );
    }
  }
}

export default withRouter(EnrichmentResultsGraph);
