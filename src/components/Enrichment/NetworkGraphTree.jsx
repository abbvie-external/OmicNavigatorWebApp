import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import './NetworkGraph.scss';
import { networkByCluster } from '../Shared/helpers';

export default class NetworkGraphTree extends Component {
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
    if (this.props.networkData.nodes.length > 0) {
      this.setDimensions();
      let resizedFn;
      window.addEventListener('resize', () => {
        clearTimeout(resizedFn);
        resizedFn = setTimeout(() => {
          this.windowResized();
        }, 200);
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.networkData !== prevProps.networkData) {
      if (this.state.networkHeight === 0) {
        this.setDimensions();
      } else {
        this.prepareAndRenderTree(
          this.state.networkWidth,
          this.state.networkHeight
        );
      }
    }
    if (this.props.networkSearchValue !== prevProps.networkSearchValue) {
      this.handleNodeSearch();
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
    if (this.props.networkData.nodes.length > 0) {
      console.log(
        this.props.networkData.nodes.length,
        this.props.networkData.edges.length
      );
      const containerWidth = this.props.networkData.nodes.length * 20;
      // const containerWidth = this.getWidth();
      // let's calculate height based on data...
      const containerHeight = this.getHeight();
      // const containerHeight = 5000;
      const width =
        containerWidth - chartSettings.margin.left - chartSettings.margin.right;
      const height =
        containerHeight -
        chartSettings.margin.top -
        chartSettings.margin.bottom;
      this.setState({
        networkContainerWidth: containerWidth,
        networkWidth: width,
        networkContainerHeight: containerHeight,
        networkHeight: height
      });
      this.prepareAndRenderTree(width, height);
    }
  };

  getHeight() {
    if (this.networkContainerRef.current !== null) {
      return this.networkContainerRef.current.parentElement.offsetHeight > 0
        ? this.networkContainerRef.current.parentElement.offsetHeight
        : 715;
    } else return 715;
  }
  // getWidth() {
  //   if (this.networkContainerRef.current !== null) {
  //     return this.networkContainerRef.current.parentElement.offsetWidth;
  //   } else return 1200;
  // }

  prepareAndRenderTree = (width, height) => {
    const { chartSettings } = this.state;
    const self = this;
    // Prepare Data
    const { networkData, networkSettings } = this.props;
    let formattedNodes = _.map(networkData.nodes, function(o) {
      return o.data;
    });

    let formattedLinks = _.map(networkData.edges, function(o) {
      return o.data;
    });

    // this.setState({
    //   chartSettings: {
    //     ...this.state.chartSettings,
    //     formattedData: {
    //       nodes: formattedNodes,
    //       links: formattedLinks
    //     }
    //   }
    // });

    _.forEach(formattedNodes, function(o1) {
      let picked = _.pick(o1, networkSettings.facets);
      // let annotation = o1.EnrichmentMap_Name;
      // let description = o1.EnrichmentMap_GS_DESCR;
      // let metaData = { Annotation: annotation, Description: description };
      let metaData = {};
      _.forEach(networkSettings.metaLabels, (value, i) => {
        metaData[value] = o1[networkSettings.meta[i]];
      });

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
      //   self.setState({
      //     o1facets: o1.facets
      //   });
    });

    let dataCombinedVar = {
      nodes: formattedNodes,
      links: formattedLinks
    };
    // this.setState({
    //   dataCombined: {
    //     nodes: formattedNodes,
    //     links: formattedLinks
    //   }
    // });
    let minSetVar = _.min(
      _.map(formattedNodes, function(o) {
        return o[networkSettings.nodeSize];
      })
    );
    let maxSetVar = _.max(
      _.map(formattedNodes, function(o) {
        return o[networkSettings.nodeSize];
      })
    );
    let minLineVar = _.min(
      _.map(formattedLinks, function(o) {
        return o[networkSettings.linkSize];
      })
    );
    let maxLineVar = _.max(
      _.map(formattedLinks, function(o) {
        return o[networkSettings.linkSize];
      })
    );

    let radius = d3.scaleSqrt();
    let radiusVar = radius
      .range(networkSettings.radiusScale)
      .domain([minSetVar, maxSetVar]);
    let lineScaleBase = d3.scaleLinear();
    let lineScaleVar = lineScaleBase
      .range(networkSettings.lineScale)
      .domain([minLineVar, maxLineVar]);

    // this.setState({
    //   minSet: minSetVar,
    //   maxSet: maxSetVar,
    //   minLine: minLineVar,
    //   maxLine: maxLineVar,
    //   radius: radiusVar,
    //   lineScale: lineScaleVar
    // });
    dataCombinedVar = networkByCluster(dataCombinedVar);

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
      .domain(networkSettings.nodeColorScale)
      .range(networkSettings.nodeColors);

    let arc = d3.arc();

    let pie = d3
      .pie()
      .sort(null)
      .value(function(d) {
        return 1;
      });

    function sumBySize(d) {
      let sumofRadii = _.sumBy(d.nodes, function(o) {
        return radiusVar(o[networkSettings.nodeSize]);
      });
      //return Math.sqrt(sumofRadii + d.size);
      return sumofRadii + d.size;
    }
    let treemap = d3
      .treemap()
      .tile(d3.treemapResquarify)
      .size([width, height])
      .round(true)
      .paddingInner(1);
    let root = d3
      .hierarchy(dataCombinedVar)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
      })
      .sum(sumBySize)
      .sort(function(a, b) {
        return b.height - a.height || b.value - a.value;
      });

    treemap(root);

    let chartSVG = d3.select(`#svg-${chartSettings.id}`);
    let cell = chartSVG
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', function(d) {
        return 'translate(' + d.x0 + ',' + d.y0 + ')';
      });

    cell
      .append('rect')
      .attr('id', function(d) {
        return d.data.id;
      })
      .attr('width', function(d) {
        return d.x1 - d.x0;
      })
      .attr('height', function(d) {
        return d.y1 - d.y0;
      })
      .attr('fill', '#fdfcfb')
      .style('stroke-opacity', 0.25)
      .style('stroke', 'grey');
    cell.each(function(d, i) {
      let cellWidth = d.x1 - d.x0;
      let cellHeight = d.y1 - d.y0;

      let simulation = d3
        .forceSimulation(d.data.nodes)
        .force(
          'link',
          d3.forceLink(d.data.links).id(function(d) {
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
        .force('center', d3.forceCenter(cellWidth / 2, cellHeight / 2))
        .force(
          'collision',
          d3.forceCollide().radius(function(d) {
            return radiusVar(d[networkSettings.nodeSize]);
          })
        )
        .stop();
      //
      for (
        let i = 0,
          n = Math.ceil(
            Math.log(simulation.alphaMin()) /
              Math.log(1 - simulation.alphaDecay())
          );
        i < n;
        ++i
      ) {
        simulation.tick();
      }
      let link = d3
        .select(this)
        .append('g')
        .attr('class', 'links')
        .selectAll('line')
        //.data(d.data.links)
        .data(d.data.links)
        .enter()
        .append('line')
        .style('stroke', function(d) {
          return '#0080ff';
        })
        .style('stroke-opacity', function(d) {
          return 0.3;
        })
        .style('stroke-width', function(d) {
          return lineScaleVar(d[networkSettings.linkSize]);
        })
        .attr('x1', function(d) {
          return Math.max(
            radiusVar(d.source[networkSettings.nodeSize]),
            Math.min(
              cellWidth - radiusVar(d.source[networkSettings.nodeSize]),
              d.source.x
            )
          );
        })
        .attr('y1', function(d) {
          return Math.max(
            radiusVar(d.source[networkSettings.nodeSize]),
            Math.min(
              cellHeight - radiusVar(d.source[networkSettings.nodeSize]),
              d.source.y
            )
          );
        })
        .attr('x2', function(d) {
          return Math.max(
            radiusVar(d.target[networkSettings.nodeSize]),
            Math.min(
              cellWidth - radiusVar(d.target[networkSettings.nodeSize]),
              d.target.x
            )
          );
        })
        .attr('y2', function(d) {
          return Math.max(
            radiusVar(d.target[networkSettings.nodeSize]),
            Math.min(
              cellHeight - radiusVar(d.target[networkSettings.nodeSize]),
              d.target.y
            )
          );
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
          let linkHTML = '';
          _.forEach(networkSettings.linkMetaLabels, (value, i) => {
            console.log(d);
            let lookup = networkSettings.linkMetaLookup[i]
              ? d[networkSettings.linkMeta[i]][
                  networkSettings.linkMetaLookup[i]
                ]
              : d[networkSettings.linkMeta[i]];
            linkHTML += `<b>` + value + `: </b>` + lookup + `<br/>`;
          });
          div
            .html(linkHTML)
            .style('left', d3.event.pageX + 10 + 'px')
            .style('top', d3.event.pageY - 15 + 'px');
        })
        .on('mouseout', function(d, i) {
          console.log('mouseout');
          // d3.select(this).transition()
          //     .duration('50')
          //     .attr('opacity', '.75')
          //     .attr("d", arc.outerRadius(r).innerRadius(0));
          div
            .transition()
            .duration('50')
            .style('opacity', 0);
        });

      //   chartSVG = d3.select(`#svg-${chartSettings.id}`);

      //   let node = chartSVG
      debugger;
      var node = d3
        .select(this)
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(d.data.nodes)
        .enter()
        .append('g')
        .attr('transform', function(d) {
          return (
            'translate(' +
            Math.max(
              radiusVar(d[networkSettings.nodeSize]),
              Math.min(cellWidth - radiusVar(d[networkSettings.nodeSize]), d.x)
            ) +
            ',' +
            Math.max(
              radiusVar(d[networkSettings.nodeSize]),
              Math.min(cellHeight - radiusVar(d[networkSettings.nodeSize]), d.y)
            ) +
            ')'
          );
        })

        // .on("click", function (d) { doSomething(this) })
        .call(
          d3
            .drag()
            .on('start', function() {
              dragstarted(this);
            })
            .on('drag', function(d) {
              ondrag(d, cellHeight, cellWidth, this);
            })
            .on('end', dragended)
        );

      node.each(multiple);

      let labels = node
        .append('text')
        .attr('class', 'node-label')
        .text(function(d) {
          return d[networkSettings.nodeLabel];
        })
        .style('font-size', '1em')
        .style('opacity', 1)
        .attr('x', 12)
        .attr('y', 3);

      let div = d3
        .select('body')
        .append('div')
        .attr('class', 'tooltip-pieSlice')
        .style('opacity', 0);

      function multiple(d) {
        // let geneSetSize = networkSettings.nodeSize;
        let r = radiusVar(d[networkSettings.nodeSize]);
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
                  d.data.metaData.Ontology
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
      function dragstarted(o) {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
      }
      function pieClickEvent(d, o) {
        // if (d3.event.defaultPrevented) return;
        d3.select('.tooltip-pieSlice').remove();
        self.props.onPieClick(d.data);
      }

      function ondrag(d, cellHeight, cellWidth, me) {
        d.x = d3.event.x;
        d.y = d3.event.y;
        let xPos = Math.max(
          radiusVar(d[networkSettings.nodeSize]),
          Math.min(cellWidth - radiusVar(d[networkSettings.nodeSize]), d.x)
        );
        let yPos = Math.max(
          radiusVar(d[networkSettings.nodeSize]),
          Math.min(cellHeight - radiusVar(d[networkSettings.nodeSize]), d.y)
        );

        d3.select(me).attr('transform', function(d) {
          return (
            'translate(' +
            Math.max(
              radiusVar(d[networkSettings.nodeSize]),
              Math.min(cellWidth - radiusVar(d[networkSettings.nodeSize]), d.x)
            ) +
            ',' +
            Math.max(
              radiusVar(d[networkSettings.nodeSize]),
              Math.min(cellHeight - radiusVar(d[networkSettings.nodeSize]), d.y)
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
    return (
      <div
        ref={this.networkContainerRef}
        id={chartSettings.id}
        className="NetworkChartContainer"
      ></div>
    );
  }
}
