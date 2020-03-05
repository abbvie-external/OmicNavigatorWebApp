import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import './NetworkGraphThresholdSlider.scss';

export default class NetworkGraphThresholdSlider extends Component {
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
    // if (this.props.networkSearchValue !== prevProps.networkSearchValue) {
    //   this.handleNodeSearch();
    // }
  }

  windowResized = () => {
    this.setDimensions();
  };

  setDimensions = () => {
    d3.select(`#svg-${this.state.chartSettings.id}`).remove();
    const { chartSettings } = this.state;
    console.log(
      this.props.networkData.nodes.length,
      this.props.networkData.edges.length
    );
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
    const { networkData, networkSettings } = this.props;
    // const self = this;
    // let cluster = networkData.clusters[0];
    // let links = cluster.links;
    // let nodes = cluster.nodes;
    let nodes = networkData.nodes;
    let links = networkData.links;
    let color = d3
      .scaleLinear()
      .domain([0, 0.05, 0.1])
      .range(['red', 'white', 'blue']);

    let simulation = d3
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

    let x = d3
      .scaleLinear()
      .domain([0, 20])
      .range([250, 80])
      .clamp(true);

    let brush = d3.brush().extent([[0, 0], [width, height]]);

    let svg = d3
      .select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    let links_g = svg.append('g');

    let nodes_g = svg.append('g');

    const xScale = d3
      .scaleLinear()
      .range([5, width - 5])
      .domain([0, 1]);

    const xAxis = d3.axisBottom(xScale);
    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + (width - 20) + ',0)')
      .call(xAxis)
      .select('.domain')
      .select(function() {
        return this.parentNode.appendChild(this.cloneNode(true));
      })
      .attr('class', 'halo');

    let slider = svg
      .append('g')
      .attr('class', 'slider')
      .call(brush);

    slider.selectAll('.extent,.resize').remove();

    let handle = slider
      .append('circle')
      .attr('class', 'handle')
      .attr('transform', 'translate(' + (width - 20) + ',0)')
      .attr('r', 5);

    svg
      .append('text')
      .attr('x', width - 15)
      .attr('y', 60)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .style('opacity', 0.5)
      .text('co-occurence threshold');

    links.forEach(function(d, i) {
      d.i = i;
    });

    function brushed() {
      let value = brush.extent()[0];

      if (d3.event.sourceEvent) {
        value = x.invert(d3.mouse(this)[1]);
        brush.extent([value, value]);
      }
      handle.attr('cy', x(value));
      let threshold = value;

      let thresholded_links = links.filter(function(d) {
        return d.value > threshold;
      });

      simulation.links(thresholded_links);

      let link = links_g
        .selectAll('.link')
        .data(thresholded_links, function(d) {
          return d.i;
        });

      link
        .enter()
        .append('line')
        .attr('class', 'link')
        .style('stroke-width', function(d) {
          return Math.sqrt(d.value);
        });

      link.exit().remove();

      simulation.on('tick', function() {
        link
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

        node
          .attr('cx', function(d) {
            return d.x;
          })
          .attr('cy', function(d) {
            return d.y;
          });
      });

      simulation.start();
    }

    simulation.nodes(nodes);

    let node = nodes_g
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .style('fill', function(d) {
        return color(d.group);
      })
      .call(simulation.drag);

    node.append('title').text(function(d) {
      return d.description;
    });

    brush.on('brush', brushed);

    //   slider.call(brush.extent([5, 5])).call(brush.event);
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
