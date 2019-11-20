import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
// import * as _ from 'lodash';

class BarcodePlot extends Component {
  constructor(props) {
    super(props);
    // chartSize: { height: '200', width: '960' },
    // barcodeData: this.props.barcodeData || null,
    // enableBrush: this.props.settings.enableBrush || false,
    // height: this.props.settings.height || '',
    // highStat: this.props.settings.highStat || '',
    // highLabel: this.props.settings.highLabel || '',
    // lowLabel: this.props.settings.lowLabel || '',
    // lineID: this.props.settings.lineID || '',
    // logFC: this.props.settings.logFC || '',
    // statLabel: this.props.settings.statLabel || '',
    // statistic: this.props.settings.statistic || '',

    this.state = {
      // objs: {
      //   mainDiv: null,
      //   chartDiv: null,
      //   g: null,
      //   xAxis: null,
      //   tooltip: null,
      //   brush: null
      // },
      // passed or default chart settings
      settings: {
        axes: null,
        bottomLabel: null,
        brush: null,
        brushing: false,
        chartDiv: null,
        // chartSize: { height: '200', width: '960' },
        // barcodeData: this.props.barcodeData || null,
        // enableBrush: this.props.settings.enableBrush || false,
        g: null,
        // height: this.props.settings.height || '',
        // highStat: this.props.settings.highStat || '',
        height: null,
        id: 'chart-barcode',
        // highLabel: this.props.settings.highLabel || '',
        // lowLabel: this.props.settings.lowLabel || '',
        // lineID: this.props.settings.lineID || '',
        // logFC: this.props.settings.logFC || '',
        mainDiv: null,
        margin: { top: 65, right: 60, bottom: 75, left: 60 },
        // statLabel: this.props.settings.statLabel || '',
        // statistic: this.props.settings.statistic || '',
        svg: null,
        title: '',
        tooltip: null
      },
      width: null,
      xAxis: null,
      xScale: null
    };
    this.prepareAndRender = this.prepareAndRender.bind(this);
  }

  componentDidMount() {
    this.prepareAndRender();
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (this.props.barcodeSettings !== prevProps.barcodeSettings) {
  //     this.prepareAndRender();
  //   }
  // }

  prepareAndRender() {
    const { settings } = this.state;
    const { barcodeSettings } = this.props;
    // const chartSize, barcodeData, enableBrush, height, highStat, highLabel, lowLabel, lineID, logFC, statLabel, statisticj;
    // prepare settings
    let margin = settings.margin;
    let width =
      barcodeSettings.chartSize.width -
      settings.margin.left -
      settings.margin.right;
    let height =
      barcodeSettings.chartSize.height -
      settings.margin.top -
      settings.margin.bottom;

    //Scale the range of the data
    let domain = d3
      .scaleLinear()
      .range([5, width - 5])
      .domain([
        0,
        d3.extent(barcodeSettings.barcodeData, function(d) {
          return d[barcodeSettings.statistic];
        })[1]
      ]);

    let xScale = d3
      .scaleLinear()
      .range([5, width - 5])
      .domain([0, barcodeSettings.highStat]);

    let xAxis = d3.axisBottom(xScale);

    // prepare chart
    let chartDiv = d3.select('#' + settings.id);
    let svg = chartDiv
      .append('svg')
      .attr('id', 'svg-' + settings.id)
      .attr('class', 'barcode-chart-area bcChart')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr(
        'viewBox',
        '0 0 ' +
          barcodeSettings.chartSize.width +
          ' ' +
          barcodeSettings.chartSize.height
      )
      .attr('preserveAspectRatio', 'xMinYMin meet');

    let settingsHeight = chartDiv._groups[0][0].clientHeight;
    let g = svg
      .append('g')
      .attr(
        'transform',
        'translate(' + settings.margin.left + ',' + settings.margin.top + ')'
      )
      .attr('id', 'tickAxis');

    let bottomLabel = g
      .append('text')
      .attr(
        'transform',
        'translate(' + width / 2 + ' ,' + (height + margin.top - 25) + ')'
      )
      .style('text-anchor', 'middle')
      .text(barcodeSettings.statLabel);

    let lowLabel = g
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -5)
      .attr('x', 0 - height / 1 + 10)
      .text(barcodeSettings.lowLabel);

    let highLabel = g
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', width + 20)
      .attr('x', 0 - height / 1 + 10)
      .text(barcodeSettings.highLabel);

    let axes = g.append('g').attr('class', 'x barcode-axis');

    axes
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .attr('transform', 'translate(0,' + height + ')');
    let tooltip = g.append('text');
    tooltip.attr('class', 'barcode-tooltip');

    // render barcode plot
    let lines = g
      .selectAll('line.barcode-line')
      .data(barcodeSettings.barcodeData)
      .enter()
      .append('line')
      .attr('class', 'barcode-line')
      .attr('id', function(d) {
        return 'barcode-line-' + d[barcodeSettings.lineID];
      })
      .attr('x1', function(d, i) {
        return xScale(d[barcodeSettings.statistic]);
      })
      .attr('x2', function(d) {
        return xScale(d[barcodeSettings.statistic]);
      })
      .attr('y1', -20)
      .attr('y2', height)
      .style('stroke', function(d) {
        return '#2c3b78';
      })
      .style('stroke-width', 2)
      .style('opacity', function(d) {
        return 0.5;
      })

      // setup change events
      .on('mouseover', function(d) {
        if (barcodeSettings.brushing === false) {
          let toolTipPostition = parseInt(d3.select(this).attr('x1'));
          d3.select(this)
            .transition()
            .duration(100)
            .attr('y1', -40)
            .style('stroke-width', 3)
            .style('opacity', 1);

          if (xScale(d[barcodeSettings.statistic]) > width / 2) {
            tooltip.attr('text-anchor', 'end');
          } else {
            tooltip.attr('text-anchor', 'start');
          }

          tooltip
            .transition()
            .duration(100)
            .style('opacity', 1)
            .text(function() {
              return d.barcodeSettings.lineID;
            })
            .style('fill', function() {
              return '#2c3b78';
            })
            .attr('y', -22)
            .attr('x', function() {
              if (xScale(d[barcodeSettings.statistic]) > width / 2) {
                return toolTipPostition - 5;
              } else {
                return toolTipPostition + 5;
              }
            });
        }
      })

      .on('mouseout', function(d) {
        if (barcodeSettings.brushing == false) {
          d3.select(this)
            .transition()
            .delay(100)
            .attr('y1', -20)
            .style('stroke-width', 2)
            .style('opacity', function(d) {
              return 0.5;
            });
          tooltip
            .transition()
            .delay(100)
            .style('opacity', 0);
        }
      })

      .on('click', function(d) {
        if (barcodeSettings.brushing == false) {
          debugger;
          // self.tickData.emit(d);
        }
      });

    if (barcodeSettings.enableBrush) {
      debugger;
      this.makeBrush();
    }

    let t = svg.on('click', function() {
      debugger;
      // this.setState({
      //   ...barcodeSettings,
      //     brushing: false
      // })
      // this.unhighLight();
      // self.tickBrush.emit([]);
    });

    // this.setState({
    //   height: settingsHeight,
    //   margin: margin,
    //   objs: {
    //     axes: axes,
    //     bottomLabel: bottomLabel,
    //     // brush: brush || null,
    //     chartDiv: chartDiv || null,
    //     g: g || null,
    //     highLabel: highLabel,
    //     lowLabel: lowLabel,
    //     // mainDiv: mainDiv || null,
    //     svg: svg,
    //     tooltip: tooltip || null,
    //     xAxis: xAxis || null
    //   },
    //   settings: {
    //     chartSize: { height: '200', width: '960' },
    //     data: this.props.data,
    //     // enableBrush: enableBrush,
    //     height: height,
    //     highLabel: settings.highLabel || '',
    //     highStat: settings.highStat || '',
    //     id: 'chart-barcode',
    //     lineID: settings.lineID,
    //     lowLabel: lowLabel,
    //     margin: { top: 65, right: 60, bottom: 75, left: 60 },
    //     statLabel: settings.statLabel,
    //     statistic: settings.statistic,
    //     title: 'title test'
    //   },
    //   width: width,
    //   xScale: xScale
    // });
  }

  unhighLight() {
    d3.selectAll('line.barcode-line')
      .attr('y1', -20)
      .style('stroke-width', 2)
      .style('opacity', function(d) {
        return 0.5;
      });
  }

  makeBrush() {
    debugger;
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
    return <div id="chart-barcode" className="BarcodeChartWrapper"></div>;
  }
}

export default BarcodePlot;
