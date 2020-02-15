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
    networkWidth: 1200,
    networkContainerWidth: 1200,
    networkHeight: 900,
    networkContainerHeight: 900,
    chartSettings: {
      title: '',
      // data: null,
      id: 'chart-network',
      // chartSize: { height: "900", width: "1600" },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
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
  networkSVGRef = React.createRef();

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

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (this.props.networkData !== prevProps.networkData) {
  //     this.prepareAndRender();
  //   }
  // }

  windowResized = () => {
    this.setDimensions();
  };

  setDimensions = () => {
    const { chartSettings } = this.state;
    const containerWidth = this.getWidth();
    const containerHeight = this.getHeight();
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
    this.prepareAndRender();
  };

  getHeight() {
    if (this.networkContainerRef.current !== null) {
      return this.networkSVGRef.current.parentElement.offsetHeight;
    } else return 900;
  }
  getWidth() {
    if (this.networkContainerRef.current !== null) {
      return this.networkSVGRef.current.parentElement.offsetWidth;
    } else return 1200;
  }

  prepareAndRender = () => {
    const {
      chartSettings,
      // chartObjs,
      networkWidth,
      networkHeight
    } = this.state;
    // Make Chart (already have chartObj null defaults in state)

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

    // Prepare Chart (svg is already inline JSX with attributes created in this function)

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

    // let svg = chartObjs.svg;
    // let svg = d3.select(`svg-${chartSettings.id}`);
    let width = networkWidth;
    let height = networkHeight;

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

    //   d3.timeout(function() {
    //     for (
    //       let i = 0,
    //         n = Math.ceil(
    //           Math.log(simulation.alphaMin()) /
    //             Math.log(1 - simulation.alphaDecay())
    //         );
    //       i < n;
    //       ++i
    //     ) {
    //       simulation.nodes(dataCombinedVar.nodes);

    //       simulation.force('link').links(dataCombinedVar.links);

    //       simulation.tick();
    //     }

    //     let svg = d3.select(`svg-${chartSettings.id}`);
    //     let link = svg
    //       .append('g')
    //       .attr('class', 'links')
    //       .selectAll('line')
    //       .data(dataCombinedVar.links)
    //       .enter()
    //       .append('line')
    //       .style('stroke', function(d) {
    //         return '#0080ff';
    //       })
    //       .style('stroke-opacity', function(d) {
    //         return 0.3;
    //       })
    //       .style('stroke-width', function(d) {
    //         return lineScaleVar(d.EnrichmentMap_Overlap_size);
    //       })
    //       .attr('x1', function(d) {
    //         return d.source.x;
    //       })
    //       .attr('y1', function(d) {
    //         return d.source.y;
    //       })
    //       .attr('x2', function(d) {
    //         return d.target.x;
    //       })
    //       .attr('y2', function(d) {
    //         return d.target.y;
    //       });

    //     let node = svg
    //       .append('g')
    //       .attr('class', 'nodes')
    //       .selectAll('g')
    //       .data(dataCombinedVar.nodes)
    //       .enter()
    //       .append('g')
    //       .attr('transform', function(d) {
    //         return (
    //           'translate(' +
    //           Math.max(
    //             radiusVar(d.EnrichmentMap_gs_size),
    //             Math.min(networkWidth - radiusVar(d.EnrichmentMap_gs_size), d.x)
    //           ) +
    //           ',' +
    //           Math.max(
    //             radiusVar(d.EnrichmentMap_gs_size),
    //             Math.min(networkHeight - radiusVar(d.EnrichmentMap_gs_size), d.y)
    //           ) +
    //           ')'
    //         );
    //       })
    //       .call(
    //         d3
    //           .drag()
    //           .on('start', function() {
    //             dragstarted(this);
    //           })
    //           .on('drag', dragged)
    //           .on('end', dragended)
    //       );

    //     node.each(multiple);

    //     let labels = node
    //       .append('text')
    //       .attr('class', 'node-label')
    //       .text(function(d) {
    //         return d.EnrichmentMap_GS_DESCR;
    //       })
    //       .style('font-size', '1em')
    //       .style('opacity', 1)
    //       .attr('x', 6)
    //       .attr('y', 3);

    //     let div = d3
    //       .select('body')
    //       .append('div')
    //       .attr('class', 'tooltip-pieSlice')
    //       .style('opacity', 0);

    //     function multiple(d) {
    //       let geneSetSize = d.EnrichmentMap_gs_size;
    //       let r = radiusVar(geneSetSize);

    //       let node = d3.select(this);

    //       node
    //         .selectAll('path')
    //         .data(function(d) {
    //           return pie(d.facets);
    //         })
    //         .enter()
    //         .append('svg:path')
    //         .attr('d', arc.outerRadius(r).innerRadius(0))
    //         .attr('opacity', 0.75)
    //         .style('cursor', 'pointer')
    //         .attr('stroke', 'black')
    //         .style('fill', function(d) {
    //           if (d.data.value != null) return color(d.data.value);
    //           return '#d3d3d3';
    //         })
    //         .on('click', function(d) {
    //           pieClickEvent(d, this);
    //         })
    //         .on('mouseover', function(d, i) {
    //           d3.select(this)
    //             .transition()
    //             .duration('50')
    //             .attr('opacity', '.50')
    //             .attr('d', arc.outerRadius(50).innerRadius(0));
    //           div
    //             .transition()
    //             .duration(50)
    //             .style('opacity', 1);
    //           let pValueDisplay;
    //           if (Math.abs(d.data.value) > 0.001)
    //             pValueDisplay = d.data.value.toPrecision(3);
    //           else pValueDisplay = d.data.value.toExponential(3);

    //           div
    //             .html(
    //               `<b>Description: </b>` +
    //                 d.data.metaData.Description +
    //                 `<br/><b>Test: </b>` +
    //                 d.data.prop +
    //                 `<br/><b>pValue: </b>` +
    //                 pValueDisplay +
    //                 `<br/><b>Ontology: </b>` +
    //                 d.data.metaData.Annotation
    //             )
    //             .style('left', d3.event.pageX + 10 + 'px')
    //             .style('top', d3.event.pageY - 15 + 'px');
    //         })
    //         .on('mouseout', function(d, i) {
    //           d3.select(this)
    //             .transition()
    //             .duration('50')
    //             .attr('opacity', '.75')
    //             .attr('d', arc.outerRadius(r).innerRadius(0));
    //           div
    //             .transition()
    //             .duration('50')
    //             .style('opacity', 0);
    //         });
    //     }

    //     function pieClickEvent(d, o) {
    //       if (d3.event.defaultPrevented) return;
    //       // UNCOMMENT WHEN READY, PAUL
    //       // self.pieClick.emit(d.data);
    //     }

    //     function dragstarted(o) {
    //       d3.event.sourceEvent.stopPropagation();
    //       d3.event.sourceEvent.preventDefault();
    //       d3.selectAll('circle').style('fill', 'white');
    //     }

    //     function dragged(d) {
    //       d.x = d3.event.x;
    //       d.y = d3.event.y;
    //       let xPos = Math.max(
    //         radiusVar(d.EnrichmentMap_gs_size),
    //         Math.min(networkWidth - radiusVar(d.EnrichmentMap_gs_size), d.x)
    //       );
    //       let yPos = Math.max(
    //         radiusVar(d.EnrichmentMap_gs_size),
    //         Math.min(networkHeight - radiusVar(d.EnrichmentMap_gs_size), d.y)
    //       );

    //       d3.select(this).attr('transform', function(d) {
    //         return (
    //           'translate(' +
    //           Math.max(
    //             radiusVar(d.EnrichmentMap_gs_size),
    //             Math.min(networkWidth - radiusVar(d.EnrichmentMap_gs_size), d.x)
    //           ) +
    //           ',' +
    //           Math.max(
    //             radiusVar(d.EnrichmentMap_gs_size),
    //             Math.min(networkHeight - radiusVar(d.EnrichmentMap_gs_size), d.y)
    //           ) +
    //           ')'
    //         );
    //       });

    //       link
    //         .filter(function(l) {
    //           return l.source === d;
    //         })
    //         .attr('x1', xPos)
    //         .attr('y1', yPos);
    //       link
    //         .filter(function(l) {
    //           return l.target === d;
    //         })
    //         .attr('x2', xPos)
    //         .attr('y2', yPos);
    //     }

    //     function dragended(d) {
    //       if (!d3.event.active) simulation.alphaTarget(0);
    //       d.fx = d3.event.x;
    //       d.fy = d3.event.y;
    //     }
    //   });
  };

  render() {
    const {
      chartSettings,
      networkContainerHeight,
      networkContainerWidth
      // networkWidth,
      // networkHeight,
      // o1facets,
      // dataCombined,
      // minSet,
      // maxSet,
      // minLine,
      // maxLine,
      // radius,
      // lineScale
    } = this.state;
    // const { networkData, networkSettings } = this.props;
    // debugger;

    // const formattedD = chartSettings.formattedData;
    // const fdNodes = formattedD.nodes;
    // const fdLinks = formattedD.links;
    // const o1F = o1facets;
    // const dataC = dataCombined;
    // const minS = minSet;
    // const maxS = maxSet;
    // const minL = minLine;
    // const maxL = maxLine;
    // const rad = radius;
    // const lineS = lineScale;

    // const lineLinks = fdLinks.map(l => {
    //   return (
    //     <g className="prefix__links" stroke="#0080ff" strokeOpacity={0.3}>
    //       <path
    //         opacity={0.5}
    //         strokeWidth={1.268}
    //         d="M746.499 280.228l-113.421-87.21"
    //       />
    //     </g>
    //   );
    // });

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
              // type="button"
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
              // type="button"
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
        >
          <svg
            ref={this.networkSVGRef}
            id={`svg-${chartSettings.id}`}
            className="network-chart-area nwChart"
            height={networkContainerHeight}
            width={networkContainerWidth}
            viewBox={`0 0 ${networkContainerWidth} ${networkContainerHeight}`}
            preserveAspectRatio="xMinYMin meet"
            // {...this.props}
          >
            {/* LINE LINKS */}
            {/* {lineLinks} */}
            {/* <g className="prefix__links" stroke="#0080ff" strokeOpacity={0.3}>
              <path
                opacity={0.5}
                strokeWidth={1.268}
                d="M746.499 280.228l-113.421-87.21"
              />
            </g> */}
            {/* NODES */}
            {/* <g className="prefix__nodes">
              <path
                d="M712.615 288.599a28.622 28.622 0 0118.397 6.696l-18.397 21.926z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#b5b5ff"
              />
              <path
                d="M731.012 295.295a28.622 28.622 0 019.79 16.956l-28.187 4.97z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#0202ff"
              />
              <path
                d="M740.802 312.25a28.622 28.622 0 01-3.4 19.282l-24.787-14.311z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#0404ff"
              />
              <path
                d="M737.402 331.532a28.622 28.622 0 01-14.998 12.584l-9.79-26.895z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#0202ff"
              />
              <path
                d="M722.404 344.116a28.622 28.622 0 01-19.579 0l9.79-26.895z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#2121ff"
              />
              <path
                d="M702.825 344.116a28.622 28.622 0 01-14.998-12.584l24.788-14.311z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#2727ff"
              />
              <path
                d="M687.827 331.532a28.622 28.622 0 01-3.4-19.281l28.188 4.97z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#ff4949"
              />
              <path
                d="M684.428 312.25a28.622 28.622 0 019.789-16.955l18.398 21.926z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#0202ff"
              />
              <path
                d="M694.217 295.295a28.622 28.622 0 0118.398-6.696v28.622z"
                opacity={0.75}
                stroke="#000"
                cursor="pointer"
                fill="#3131ff"
              /> */}
            {/* NODE TEXT */}
            {/* <text
                className="prefix__node-label"
                x={6}
                y={3}
                fontSize="1em"
                transform="translate(712.615 317.22)"
              >
                {'enzyme binding'}
              </text>
            </g> */}
          </svg>
        </div>
      </div>
    );
  }
}
