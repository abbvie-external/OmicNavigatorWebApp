import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import './NetworkGraphTreeAlt.scss';
import { networkByCluster } from '../Shared/helpers';
import networkDataTreeEx from '../../services/networkDataTreeEx.json';

export default class NetworkGraphTreeEx extends Component {
  // static defaultProps = {
  //   networkDataAvailable: false,
  //   networkData: {},
  //   tests: {},
  //   networkSettings: {
  //     facets: {},
  //     propLabel: {},
  //     metaLabels: ['Description', 'Ontology'],
  //     meta: ['EnrichmentMap_GS_DESCR', 'EnrichmentMap_Name'],
  //     facetAndValueLabel: ['Test', 'pValue'],
  //     nodeLabel: 'EnrichmentMap_GS_DESCR',
  //     radiusScale: [10, 50],
  //     lineScale: [1, 10],
  //     nodeSize: 'EnrichmentMap_gs_size',
  //     linkSize: 'EnrichmentMap_Overlap_size',
  //     linkMetaLabels: ['Overlap Size', 'Source', 'Target'],
  //     linkMeta: ['EnrichmentMap_Overlap_size', 'source', 'target'],
  //     linkMetaLookup: ['EnrichmentMap_GS_DESCR', 'EnrichmentMap_GS_DESCR'],
  //     nodeColorScale: [0, 0.1, 1],
  //     nodeColors: ['red', 'white', 'blue']
  //   }
  // }

  state = {
    dataCombined: [],
    networkWidth: 0,
    networkContainerWidth: 0,
    networkHeight: 0,
    networkContainerHeight: 0,
    chartSettings: {
      title: '',
      // data: null,
      id: 'chart-network',
      margin: { top: 50, right: 50, bottom: 50, left: 50 },
      statLabel: '',
      statistic: '',
      formattedData: {},
      facets: []
      // propLabel: [],
    },
    chartObjs: {
      svg: null,
      mainDiv: null,
      chartDiv: null,
      g: null,
      gLinks: null,
      gNodes: null,
      tooltip: null
    },
    o1facets: [],
    minSet: null,
    maxSet: null,
    minLine: null,
    maxLine: null,
    radius: null
  };
  networkContainerRef = React.createRef();

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   let newState = {};
  //   if (nextProps.networkData !== prevState.prevNetworkData) {
  //     newState.networkData = nextProps.networkData;
  //     newState.prevNetworkData = nextProps.networkData;
  //   }

  //   if (nextProps.networkSettings !== prevState.prevNetworkSettings) {
  //     newState.networkSettings = nextProps.networkSettings;
  //     newState.prevNetworkSettings = nextProps.networkSettings;
  //   }
  //   return newState;
  // }

  componentDidMount() {
    this.setDimensions();
    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.windowResized();
      }, 200);
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.networkData !== prevProps.networkData) {
      this.prepareAndRenderTree(
        this.state.networkWidth,
        this.state.networkHeight
      );
    }
    if (this.props.networkSearchValue !== prevProps.networkSearchValue) {
      this.handleNodeSearch();
    }
    if (this.state.networkSortBy !== prevProps.networkSortBy) {
      // this.updateTree();
    }
  }

  // componentWillUnmount() {
  //   d3.select(`#svg-${this.state.chartSettings.id}`).remove();
  // }

  // handleNodeSearch = () => {
  //   let self = this;
  //   let svg = d3.select(`#svg-${this.state.chartSettings.id}`);
  //   let nodeLabels = svg.selectAll('.node-label');
  //   if (this.props.networkSearchValue === '') {
  //     nodeLabels.style('opactity', '1');
  //   } else {
  //     let keep = nodeLabels.filter(function(d, i) {
  //       let string = d.EnrichmentMap_GS_DESCR;
  //       return string.includes(self.props.networkSearchValue);
  //     });
  //     keep.style('opacity', '1');
  //     var link = svg.selectAll('.links');
  //     link.style('opacity', '0');
  //     d3.selectAll('.nodes, .links')
  //       .transition()
  //       .duration(5000)
  //       .style('opacity', 1);
  //   }
  // };

  handleNodeSearch = () => {
    // setTimeout(() => {
    let str = this.props.networkSearchValue;
    let nodeLabel = this.props.networkSettings.nodeLabel;
    if (str.length === 0) {
      d3.selectAll('.node-label').style('opacity', 1);
    } else {
      d3.selectAll('.node-label').style('opacity', 0);
      var keep = d3.selectAll('.node-label').filter(function(d) {
        return d[nodeLabel].toLowerCase().includes(str);
      });
      keep.style('opacity', 1);
    }
    // }, 300);
  };

  windowResized = () => {
    this.setDimensions();
  };

  setDimensions = () => {
    d3.select(`#svg-${this.state.chartSettings.id}`).remove();
    const { chartSettings } = this.state;
    // console.log(
    //   this.props.networkData.nodes.length,
    //   this.props.networkData.edges.length
    // );
    // const containerWidth = this.props.networkData.nodes.length * 20;
    const containerWidth = this.getWidth();
    // let's calculate height based on data...
    const containerHeight = this.getHeight();
    // const containerHeight = 5000;
    const width =
      containerWidth - chartSettings.margin.left - chartSettings.margin.right;
    const height =
      containerHeight - chartSettings.margin.top - chartSettings.margin.bottom;
    this.setState({
      networkContainerWidth: containerWidth,
      networkWidth: width,
      networkContainerHeight: containerHeight,
      networkHeight: height
    });
    this.prepareAndRenderTree(width, height);
  };

  getHeight() {
    if (this.networkContainerRef.current !== null) {
      return this.networkContainerRef.current.parentElement.offsetHeight;
    } else return 900;
  }
  getWidth() {
    if (this.networkContainerRef.current !== null) {
      return this.networkContainerRef.current.parentElement.offsetWidth;
    } else return 1200;
  }

  prepareAndRenderTree = (width, height) => {
    const { chartSettings } = this.state;
    const { networkSortBy, networkSortByChanged } = this.props;
    const self = this;
    // Prepare Data
    const { networkSettings } = this.props;
    const networkData = networkDataTreeEx;

    if (!networkSortByChanged) {
      const margin = { top: 40, right: 10, bottom: 10, left: 10 };
      // width = 960 - margin.left - margin.right,
      // height = 500 - margin.top - margin.bottom,
      // const color = d3.scaleOrdinal().range(d3.schemeCategory20c);

      // https://github.com/d3/d3-scale-chromatic/blob/master/README.md
      // const color = () => {
      //   const scale = d3.scaleOrdinal(d3.schemeCategory10);
      //   return d => scale(d.group);
      // };
      let color = d3
        .scaleLinear()
        .domain(networkSettings.nodeColorScale)
        .range(networkSettings.nodeColors);

      const treemap = d3.treemap().size([width, height]);

      const chartDiv = d3.select('#' + chartSettings.id);
      chartDiv
        .append('div')
        .attr('id', 'div-' + chartSettings.id)
        // .attr('class', 'network-chart-area nwChart')
        // .attr('width', '100%')
        // .attr('height', '100%')
        // .attr('viewBox', '0 0 ' + width + ' ' + height)
        // .attr('preserveAspectRatio', 'xMinYMin meet');
        .style('position', 'relative')
        .style('width', width + margin.left + margin.right + 'px')
        .style('height', height + margin.top + margin.bottom + 'px')
        .style('left', margin.left + 'px')
        .style('top', margin.top + 'px');

      const root = d3.hierarchy(networkData, d => d.children).sum(d => d.size);

      const tree = treemap(root);
      let Div = d3.select(`#div-${chartSettings.id}`);
      const node = Div.datum(root)
        .selectAll('.node')
        .data(tree.leaves())
        .enter()
        .append('div')
        .attr('class', 'node')
        .style('left', d => d.x0 + 'px')
        .style('top', d => d.y0 + 'px')
        .style('width', d => Math.max(0, d.x1 - d.x0 - 1) + 'px')
        .style('height', d => Math.max(0, d.y1 - d.y0 - 1) + 'px')
        .style('background', d => color(d.parent.data.name))
        .text(d => d.data.name);
    } else {
    }
  };

  // updateTree = () => {
  //   const value =
  //     this.props.networkSortBy === 'count'
  //       ? d => {
  //           return d.size ? 1 : 0;
  //         }
  //       : d => {
  //           return d.size;
  //         };

  //   const newRoot = d3.hierarchy(networkData, d => d.children).sum(value);

  //   node
  //     .data(treemap(newRoot).leaves())
  //     .transition()
  //     .duration(1500)
  //     .style('left', d => d.x0 + 'px')
  //     .style('top', d => d.y0 + 'px')
  //     .style('width', d => Math.max(0, d.x1 - d.x0 - 1) + 'px')
  //     .style('height', d => Math.max(0, d.y1 - d.y0 - 1) + 'px');
  // };

  render() {
    const { chartSettings } = this.state;
    return (
      <div
        ref={this.networkContainerRef}
        id={chartSettings.id}
        className="NetworkChartContainer"
      ></div>
    );
  }
}
