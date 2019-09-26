import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';

class ChartD3Dom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        title: '',
        data: this.props.data || null,
        id: 'chart-barcode',
        chartSize: { height: '200', width: '960' },
        margin: { top: 65, right: 60, bottom: 75, left: 60 },
        highLabel: this.props.settings.highLabel || '',
        lowLabel: this.props.settings.lowLabel || '',
        statLabel: this.props.settings.statLabel || '',
        statistic: this.props.settings.statistic || '',
        highStat: this.props.settings.highStat || '',
        height: this.props.settings.height || '',
        enableBrush: this.props.settings.enableBrush || false
      },
      objs: {},
      margin: {},
      height: null,
      width: null,
      xScale: null
    };
    this.makeChart = this.makeChart.bind(this);
    this.prepareSettings = this.prepareSettings.bind(this);
    this.prepareChart = this.prepareChart.bind(this);
    this.renderBarcodePlot = this.renderBarcodePlot.bind(this);
  }

  componentDidMount() {
    this.makeChart();
    // this.prepareSettings();
    // this.prepareChart();
    // this.renderBarcodePlot();
  }

  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }

  async makeChart() {
    await this.setStateAsync({
      objs: {
        mainDiv: null,
        chartDiv: null,
        g: null,
        xAxis: null,
        tooltip: null,
        brush: null
      }
    });
    this.prepareSettings();
  }

  async prepareSettings() {
    const { settings } = this.state;

    // let setting;
    // for (setting in settings) {
    //   if (settings.hasOwnProperty(setting)) {
    //     settings[setting] = settings[setting];
    //   }
    // }
    // const { settings, objs, margin, height, width, xScale} = this.state;

    const marginVar = settings.margin;
    const widthVar =
      settings.chartSize.width - settings.margin.left - settings.margin.right;
    const heightVar =
      settings.chartSize.height - settings.margin.top - settings.margin.bottom;
    await this.setStateAsync({
      margin: marginVar,
      width: widthVar,
      height: heightVar
    });
    //Scale the range of the data
    const domain = d3
      .scaleLinear()
      .range([5, widthVar - 5])
      .domain([
        0,
        d3.extent(settings.data, function(d) {
          return d[settings.statistic];
        })[1]
      ]);
    var max = domain.ticks()[domain.ticks().length - 1];

    const xScaleVar = d3
      .scaleLinear()
      .range([5, widthVar - 5])
      .domain([0, settings.highStat]);

    const objsXAxis = d3.axisBottom(xScaleVar);
    await this.setStateAsync({
      xScale: xScaleVar,
      objs: {
        ...this.state.objs,
        xAxis: objsXAxis
      }
    });
    this.prepareChart();
  }

  async prepareChart() {
    const { settings, width, height, margin } = this.state;
    const objsChartDiv = d3.select('#' + settings.id);
    // await this.setStateAsync({
    //     this.state.objs: {
    //     ... this.state.objs,
    //     chartDiv: d3.select("#" + settings.id)
    //   }
    // });
    const objsSvg = objsChartDiv
      .append('svg')
      .attr('id', 'svg-' + settings.id)
      .attr('class', 'barcode-chart-area bcChart')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr(
        'viewBox',
        '0 0 ' + settings.chartSize.width + ' ' + settings.chartSize.height
      )
      .attr('preserveAspectRatio', 'xMinYMin meet');
    // await this.setStateAsync({
    //     objs: {
    //       ...this.state.objs,
    //       svg: objsSvg
    //     }
    // });
    settings['height'] = objsChartDiv._groups[0][0].clientHeight;

    const objsG = objsSvg
      .append('g')
      .attr(
        'transform',
        'translate(' + settings.margin.left + ',' + settings.margin.top + ')'
      )
      .attr('id', 'tickAxis');

    const objsBottomlabel = objsG
      .append('text')
      .attr(
        'transform',
        'translate(' + width / 2 + ' ,' + (height + margin.top - 25) + ')'
      )
      .style('text-anchor', 'middle')
      .text(settings.statLabel);

    const objsLowLabel = objsG
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -5)
      .attr('x', 0 - height / 1 + 10)
      .text(settings.lowLabel);

    const objsHighLabel = objsG
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', width + 20)
      .attr('x', 0 - height / 1 + 10)
      .text(settings.highLabel);

    const objsAxes = objsG.append('g').attr('class', 'x barcode-axis');

    objsAxes
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(this.state.objs.xAxis)
      .attr('transform', 'translate(0,' + height + ')');
    const objsTooltip = objsG.append('text');
    objsTooltip.attr('class', 'barcode-tooltip');

    this.renderBarcodePlot();
  }

  renderBarcodePlot() {
    //     var lines = self.chart.objs.g
    //       .selectAll("line.barcode-line")
    //       .data(self.chart.settings.data)
    //       .enter()
    //       .append("line")
    //       .attr("class", "barcode-line")
    //       .attr("id", function(d) {
    //         return "barcode-line-" + d[self.chart.settings.lineID];
    //       })
    //       .attr("x1", function(d, i) {
    //         return self.chart.xScale(d[self.chart.settings.statistic]);
    //       })
    //       .attr("x2", function(d) {
    //         return self.chart.xScale(d[self.chart.settings.statistic]);
    //       })
    //       .attr("y1", -20)
    //       .attr("y2", self.chart.height)
    //       .style("stroke", function(d) {
    //         return "#2c3b78";
    //       })
    //       .style("stroke-width", 2)
    //       .style("opacity", function(d) {
    //         return 0.5;
    //       })
    //       .on("mouseover", function(d) {
    //         if (self.brushing == false) {
    //           let toolTipPostition = parseInt(d3.select(this).attr("x1"));
    //           d3.select(this)
    //             .transition()
    //             .duration(100)
    //             .attr("y1", -40)
    //             .style("stroke-width", 3)
    //             .style("opacity", 1);
    //           if (
    //             self.chart.xScale(d[self.chart.settings.statistic]) >
    //             self.chart.width / 2
    //           ) {
    //             self.chart.objs.tooltip.attr("text-anchor", "end");
    //           } else {
    //             self.chart.objs.tooltip.attr("text-anchor", "start");
    //           }
    //           self.chart.objs.tooltip
    //             .transition()
    //             .duration(100)
    //             .style("opacity", 1)
    //             .text(function() {
    //               return d.lineID;
    //             })
    //             .style("fill", function() {
    //               return "#2c3b78";
    //             })
    //             .attr("y", -22)
    //             .attr("x", function() {
    //               if (
    //                 self.chart.xScale(d[self.chart.settings.statistic]) >
    //                 self.chart.width / 2
    //               ) {
    //                 return toolTipPostition - 5;
    //               } else {
    //                 return toolTipPostition + 5;
    //               }
    //             });
    //         }
    //       })
    //       .on("mouseout", function(d) {
    //         if (self.brushing == false) {
    //           d3.select(this)
    //             .transition()
    //             .delay(100)
    //             .attr("y1", -20)
    //             .style("stroke-width", 2)
    //             .style("opacity", function(d) {
    //               return 0.5;
    //             });
    //           self.chart.objs.tooltip
    //             .transition()
    //             .delay(100)
    //             .style("opacity", 0);
    //         }
    //       })
    //       .on("click", function(d) {
    //         if (self.brushing == false) {
    //           self.tickData.emit(d);
    //         }
    //       });
    //     if (this.chart.settings.enableBrush) {
    //       this.makeBrush(self);
    //     }
    //     var t = self.chart.objs.svg.on("click", function() {
    //       self.brushing = false;
    //       self.unhighLight();
    //       self.tickBrush.emit([]);
    //     });
    //   }
    //   unhighLight() {
    //     d3.selectAll("line.barcode-line")
    //       .attr("y1", -20)
    //       .style("stroke-width", 2)
    //       .style("opacity", function(d) {
    //         return 0.5;
    //       });
  }

  makeBrush() {
    // const highlightBrushedTicks = function() {
    //   self.brushing = true;
    //   const ticks = d3.selectAll("line.barcode-line");
    //   if (d3.event.selection != null) {
    //     self.unhighLight();
    //     const brushedTicks = d3.brushSelection(this);
    //     const isBrushed = function(brushedTicks, x) {
    //       const xMin = brushedTicks[0][0],
    //         xMax = brushedTicks[1][0];
    //       const brushTest: boolean = xMin <= x && x <= xMax;
    //       return brushTest;
    //     };
    //     const brushed = ticks
    //       .filter(function() {
    //         const x = d3.select(this).attr("x1");
    //         return isBrushed(brushedTicks, x);
    //       })
    //       .attr("y1", -40)
    //       .style("stroke-width", 3)
    //       .style("opacity", 1.0);
    //     self.brushedData = brushed.data();
    //     self.tickBrush.emit(self.brushedData);
    //   }
    // };
    // self.chart.objs.brush = d3
    //   .brush()
    //   .extent([
    //     [0, -50],
    //     [
    //       self.chart.settings.chartSize.width,
    //       self.chart.settings.chartSize.height
    //     ]
    //   ])
    //   .on("brush", highlightBrushedTicks)
    //   .on("end", function() {
    //     self.endBrush();
    //   });
    // d3.selectAll(".x.barcode-axis").call(self.chart.objs.brush);
  }

  endBrush() {
    // if (this.brushedData.length == 1) {
    //   this.tickData.emit(this.brushedData[0]);
    //   this.brushedData = [];
    // }
  }

  clearBrush() {
    // self.chart.objs.g.call(self.chart.objs.brush.move, null);
  }

  render() {
    const {
      data,
      settings
      // highLabel,
      // lowLabel,
      // statLabel
    } = this.props;

    return <div id="chart-barcode" class="barcode-chart-wrapper"></div>;
  }
}

export default ChartD3Dom;
