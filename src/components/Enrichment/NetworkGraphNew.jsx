import React, { Component } from 'react';
import { Icon, Popup, Grid, Search, Radio } from 'semantic-ui-react';
import _ from 'lodash';
import * as d3 from 'd3';
import './NetworkGraph.scss';

export default class NetworkGraph extends Component {
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
      // propLabel: []
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
    radius: null,
    lineScale: null
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
      this.prepareAndRenderNew(this.state.width, this.state.height);
    }
  }

  // componentWillUnmount() {
  //   d3.select(`#svg-${this.state.chartSettings.id}`).remove();
  // }

  windowResized = () => {
    this.setDimensions();
  };

  setDimensions = () => {
    d3.select(`#svg-${this.state.chartSettings.id}`).remove();
    const { chartSettings } = this.state;
    const containerWidth = this.getWidth();
    // let's calculate height based on data...
    // const containerHeight = this.getHeight();
    const containerHeight = 2000;
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
    this.prepareAndRenderNew(width, height);
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

  prepareAndRenderNew = (width, height) => {
    const { chartSettings } = this.state;

    // Prepare Data
    const {
      networkData
      // networkSettings
    } = this.props;
    // const self = this;
    let formattedNodes = _.map(networkData.nodes, function(o) {
      return o.data;
    });

    let formattedLinks = _.map(networkData.edges, function(o) {
      return o.data;
    });

    const links = formattedLinks.map(d => Object.create(d));
    const nodes = formattedNodes.map(d => Object.create(d));

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength([-300])
          .distanceMax([500])
      )

      .force('center', d3.forceCenter(width / 2, height / 2));

    const chartDiv = d3.select(`#${chartSettings.id}`);
    chartDiv
      .append('svg')
      .attr('id', 'svg-' + chartSettings.id)
      .attr('class', 'network-chart-area nwChart')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .attr('preserveAspectRatio', 'xMinYMin meet');

    let svg = d3.select(`#svg-${chartSettings.id}`);
    const minSetVar = _.min(
      _.map(nodes, function(o) {
        return o.EnrichmentMap_gs_size;
      })
    );
    const maxSetVar = _.max(
      _.map(nodes, function(o) {
        return o.EnrichmentMap_gs_size;
      })
    );
    const minLineVar = _.min(
      _.map(links, function(o) {
        return o.EnrichmentMap_Overlap_size;
      })
    );
    const maxLineVar = _.max(
      _.map(links, function(o) {
        return o.EnrichmentMap_Overlap_size;
      })
    );

    let radiusVar = d3.scaleSqrt().range([10, 50]);
    let lineScaleVar = d3.scaleLinear().range([1, 10]);

    radiusVar.domain([minSetVar, maxSetVar]);
    lineScaleVar.domain([minLineVar, maxLineVar]);
    const link = svg
      .append('g')
      .attr('stroke', '#1678c2')
      .attr('stroke-opacity', 0.5)
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      // .attr('stroke-width', d => Math.sqrt(d.value));
      .attr('stroke-width', d =>
        Math.sqrt(lineScaleVar(d.EnrichmentMap_Overlap_size))
      );

    const color = d3
      // .scaleLinear()
      .scaleOrdinal()
      .domain([0, 0.05, 0.1])
      .range(['#ff4400', 'white', '#2c3b78']);
    // https://github.com/d3/d3-scale-chromatic/blob/master/README.md
    // const color = () => {
    //   const scale = d3.scaleOrdinal(d3.schemeCategory10);
    //   return d => scale(d.group);
    // };

    const node = svg
      .append('g')
      .attr('class', 'nodes')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      // .selectAll('g')
      .data(nodes)
      .join('circle')
      .attr('r', 15)
      // .attr('r', d => this.getRadius(d, radiusVar, width, height))
      // .enter()
      // .append('g')
      // .attr('transform', d =>
      //   this.getTranslateRadius(d, radiusVar, width, height)
      // )
      .attr('fill', color)
      .call(this.drag(simulation));

    // .append('g')
    // .attr('class', 'nodes')
    // .selectAll('g')
    // .data(dataCombinedVar.nodes)
    // .enter()
    // .append('g')
    // .attr('transform', function(d) {
    //   return (
    //     'translate(' +
    //     Math.max(
    //       radiusVar(d.EnrichmentMap_gs_size),
    //       Math.min(width - radiusVar(d.EnrichmentMap_gs_size), d.x)
    //     ) +
    //     ',' +
    //     Math.max(
    //       radiusVar(d.EnrichmentMap_gs_size),
    //       Math.min(height - radiusVar(d.EnrichmentMap_gs_size), d.y)
    //     ) +
    //     ')'
    //   );
    // })

    node.append('title').text(d => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);
    });

    // invalidation.then(() => simulation.stop());

    return svg.node();
  };

  getRadius = (d, radiusVar, width, height) => {
    // return (
    // 'translate(' +
    let radiusX = Math.max(
      radiusVar(d.EnrichmentMap_gs_size),
      Math.min(width - radiusVar(d.EnrichmentMap_gs_size), d.x)
    );
    // ) +
    // ',' +
    let radiusY = Math.max(
      radiusVar(d.EnrichmentMap_gs_size),
      Math.min(height - radiusVar(d.EnrichmentMap_gs_size), d.y)
    );
    // ) +
    // ')'
    // );
  };

  drag = simulation => {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  render() {
    const { chartSettings } = this.state;

    const IconPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };

    const enrichmentViewToggle = (
      <div className="NetworkGraphToggle">
        <Popup
          trigger={
            <Icon
              bordered
              name="table"
              size="large"
              color="orange"
              className="NetworkGraphButtons"
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
              bordered
              name="chart pie"
              size="large"
              color="orange"
              className="NetworkGraphButtons"
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
    return (
      <div className="NetworkGraphWrapper">
        {enrichmentViewToggle}
        <Grid>
          <Grid.Row>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={6}
              tablet={6}
              largeScreen={3}
              widescreen={2}
            ></Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={6}
              tablet={6}
              largeScreen={4}
              widescreen={4}
            >
              <Search
                placeholder="Search Network"
                // loading={isLoading}
                // onResultSelect={this.handleResultSelect}
                // onSearchChange={_.debounce(this.handleSearchChange, 500, {
                //   leading: true,
                // })}
                // results={results}
                // value={value}
                // {...this.props}
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              id="NetworkGraphLabelsToggle"
              mobile={6}
              tablet={6}
              largeScreen={3}
              widescreen={4}
            >
              <Radio
                toggle
                label="Show Labels"
                checked={this.state.showNetworkLabels}
              />
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={6}
              tablet={6}
              largeScreen={3}
              widescreen={3}
            >
              <h3>toggle tbd</h3>
            </Grid.Column>
            <Grid.Column
              className="NetworkGraphFilters"
              mobile={6}
              tablet={6}
              largeScreen={3}
              widescreen={3}
            >
              <h3>legend</h3>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div
          ref={this.networkContainerRef}
          id={chartSettings.id}
          className="NetworkChartContainer"
        ></div>
      </div>
    );
  }
}
