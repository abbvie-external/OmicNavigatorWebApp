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
      this.prepareAndRenderOld(this.state.width, this.state.height);
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
    this.prepareAndRenderOld(width, height);
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

  prepareAndRenderOld = (width, height) => {
    const { chartSettings } = this.state;

    // Prepare Data
    const { networkData, networkSettings } = this.props;
    const self = this;
    let formattedNodes = _.map(networkData.nodes, function(o) {
      return o.data;
    });

    let formattedLinks = _.map(networkData.edges, function(o) {
      return o.data;
    });

    this.setState({
      chartSettings: {
        ...this.state.chartSettings,
        formattedData: {
          nodes: formattedNodes,
          links: formattedLinks
        }
      }
    });

    _.forEach(formattedNodes, function(o1) {
      var picked = _.pick(o1, networkSettings.facets);
      let annotation = o1.EnrichmentMap_Name;
      let description = o1.EnrichmentMap_GS_DESCR;
      let metaData = { Annotation: annotation, Description: description };
      let i = 0;
      o1.facets = _.map(picked, value => {
        let prop = networkSettings.propLabel[i];
        i++;
        return {
          prop,
          value,
          metaData
        };
      });
      self.setState({
        o1facets: o1.facets
      });
    });

    let dataCombinedVar = {
      nodes: formattedNodes,
      links: formattedLinks
    };
    this.setState({
      dataCombined: {
        nodes: formattedNodes,
        links: formattedLinks
      }
    });
    var minSetVar = _.min(
      _.map(formattedNodes, function(o) {
        return o.EnrichmentMap_gs_size;
      })
    );
    var maxSetVar = _.max(
      _.map(formattedNodes, function(o) {
        return o.EnrichmentMap_gs_size;
      })
    );
    var minLineVar = _.min(
      _.map(formattedLinks, function(o) {
        return o.EnrichmentMap_Overlap_size;
      })
    );
    var maxLineVar = _.max(
      _.map(formattedLinks, function(o) {
        return o.EnrichmentMap_Overlap_size;
      })
    );

    let radiusVar = d3.scaleSqrt().range([10, 50]);
    let lineScaleVar = d3.scaleLinear().range([1, 10]);

    radiusVar.domain([minSetVar, maxSetVar]);
    lineScaleVar.domain([minLineVar, maxLineVar]);

    this.setState({
      minSet: minSetVar,
      maxSet: maxSetVar,
      minLine: minLineVar,
      maxLine: maxLineVar,
      radius: radiusVar,
      lineScale: lineScaleVar
    });

    // Prepare Settings (dimensions already calculated)

    // Prepare Chart
    const chartDiv = d3.select('#' + chartSettings.id);
    chartDiv
      .append('svg')
      .attr('id', 'svg-' + chartSettings.id)
      .attr('class', 'network-chart-area nwChart')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .attr('preserveAspectRatio', 'xMinYMin meet');

    // Prepare NetworkPlot
    let color = d3
      .scaleLinear()
      .domain([0, 0.05, 0.1])
      .range(['red', 'white', 'blue']);

    let arc = d3.arc();

    let pie = d3
      .pie()
      .sort(null)
      .value(function(d) {
        return 1;
      });

    let simulation = d3
      .forceSimulation()
      .force(
        'link',
        d3.forceLink().id(function(d) {
          return d.id;
        })
      )
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength([-800])
          .distanceMax([500])
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius(function(d) {
          return radiusVar(d.EnrichmentMap_gs_size);
        })
      )
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .stop();

    d3.timeout(function() {
      for (
        let i = 0,
          n = Math.ceil(
            Math.log(simulation.alphaMin()) /
              Math.log(1 - simulation.alphaDecay())
          );
        i < n;
        ++i
      ) {
        simulation.nodes(dataCombinedVar.nodes);

        simulation.force('link').links(dataCombinedVar.links);

        simulation.tick();
      }

      let svg = d3.select(`#svg-${chartSettings.id}`);
      let link = svg
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(dataCombinedVar.links)
        .enter()
        .append('line')
        .style('stroke', function(d) {
          return '#0080ff';
        })
        .style('stroke-opacity', function(d) {
          return 0.3;
        })
        .style('stroke-width', function(d) {
          return lineScaleVar(d.EnrichmentMap_Overlap_size);
        })
        .attr('x1', function(d) {
          return d.source.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y2', function(d) {
          return d.target.y;
        });

      let node = svg
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(dataCombinedVar.nodes)
        .enter()
        .append('g')
        .attr('transform', function(d) {
          return (
            'translate(' +
            Math.max(
              radiusVar(d.EnrichmentMap_gs_size),
              Math.min(width - radiusVar(d.EnrichmentMap_gs_size), d.x)
            ) +
            ',' +
            Math.max(
              radiusVar(d.EnrichmentMap_gs_size),
              Math.min(height - radiusVar(d.EnrichmentMap_gs_size), d.y)
            ) +
            ')'
          );
        })
        .call(
          d3
            .drag()
            .on('start', function() {
              dragstarted(this);
            })
            .on('drag', dragged)
            .on('end', dragended)
        );

      node.each(multiple);

      let labels = node
        .append('text')
        .attr('class', 'node-label')
        .text(function(d) {
          return d.EnrichmentMap_GS_DESCR;
        })
        .style('font-size', '.9em')
        .style('opacity', 1)
        .attr('x', 6)
        .attr('y', 3);

      let div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip-pieSlice')
        .style('opacity', 0);

      function multiple(d) {
        let geneSetSize = d.EnrichmentMap_gs_size;
        let r = radiusVar(geneSetSize);

        let node = d3.select(this);

        node
          .selectAll('path')
          .data(function(d) {
            return pie(d.facets);
          })
          .enter()
          .append('svg:path')
          .attr('d', arc.outerRadius(r).innerRadius(0))
          .attr('opacity', 0.75)
          .style('cursor', 'pointer')
          .attr('stroke', 'black')
          .style('fill', function(d) {
            if (d.data.value != null) return color(d.data.value);
            return '#d3d3d3';
          })
          .on('click', function(d) {
            pieClickEvent(d, this);
          })
          .on('mouseover', function(d, i) {
            d3.select(this)
              .transition()
              .duration('50')
              .attr('opacity', '.50')
              .attr('d', arc.outerRadius(50).innerRadius(0));
            div
              .transition()
              .duration(50)
              .style('opacity', 1);
            let pValueDisplay;
            if (Math.abs(d.data.value) > 0.001)
              pValueDisplay = d.data.value.toPrecision(3);
            else pValueDisplay = d.data.value.toExponential(3);

            div
              .html(
                `<b>Description: </b>` +
                  d.data.metaData.Description +
                  `<br/><b>Test: </b>` +
                  d.data.prop +
                  `<br/><b>pValue: </b>` +
                  pValueDisplay +
                  `<br/><b>Ontology: </b>` +
                  d.data.metaData.Annotation
              )
              .style('left', d3.event.pageX + 10 + 'px')
              .style('top', d3.event.pageY - 15 + 'px');
          })
          .on('mouseout', function(d, i) {
            d3.select(this)
              .transition()
              .duration('50')
              .attr('opacity', '.75')
              .attr('d', arc.outerRadius(r).innerRadius(0));
            div
              .transition()
              .duration('50')
              .style('opacity', 0);
          });
      }

      function pieClickEvent(d, o) {
        if (d3.event.defaultPrevented) return;
        // UNCOMMENT WHEN READY, PAUL
        // self.pieClick.emit(d.data);
      }

      function dragstarted(o) {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
        d3.selectAll('circle').style('fill', 'white');
      }

      function dragged(d) {
        d.x = d3.event.x;
        d.y = d3.event.y;
        let xPos = Math.max(
          radiusVar(d.EnrichmentMap_gs_size),
          Math.min(width - radiusVar(d.EnrichmentMap_gs_size), d.x)
        );
        let yPos = Math.max(
          radiusVar(d.EnrichmentMap_gs_size),
          Math.min(height - radiusVar(d.EnrichmentMap_gs_size), d.y)
        );

        d3.select(this).attr('transform', function(d) {
          return (
            'translate(' +
            Math.max(
              radiusVar(d.EnrichmentMap_gs_size),
              Math.min(width - radiusVar(d.EnrichmentMap_gs_size), d.x)
            ) +
            ',' +
            Math.max(
              radiusVar(d.EnrichmentMap_gs_size),
              Math.min(height - radiusVar(d.EnrichmentMap_gs_size), d.y)
            ) +
            ')'
          );
        });

        link
          .filter(function(l) {
            return l.source === d;
          })
          .attr('x1', xPos)
          .attr('y1', yPos);
        link
          .filter(function(l) {
            return l.target === d;
          })
          .attr('x2', xPos)
          .attr('y2', yPos);
      }

      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
    });
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
