import React, { Component } from 'react';
import Axis from './Axis';
// import PropTypes from 'prop-types';
// import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';

class BarcodePlotReact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      objs: {
        mainDiv: null,
        chartDiv: null,
        g: null,
        xAxis: null,
        tooltip: null,
        brush: null
      },
      // passed or default chart settings
      settings: {
        axes: null,
        bottomLabel: props.barcodeSettings.statLabel,
        brush: null,
        chartDiv: null,
        g: null,
        height: null,
        id: 'chart-barcode',
        mainDiv: null,
        margin: { top: 35, right: 25, bottom: 10, left: 20 },
        svg: null,
        title: '',
        tooltip: null,
        mainStrokeColor: '#2c3b78',
        alternativeStrokeColor: '#ff4400'
      },
      containerWidth: 0,
      xAxis: null,
      xScale: null
    };
    this.barcodeWrapperRef = React.createRef();
    this.barcodeSVGRef = React.createRef();
  }

  componentDidMount() {
    this.setWidth();

    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.setWidth();
      }, 200);
    });
  }

  setWidth() {
    const width = this.getWidth();
    this.setState({
      containerWidth: width
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      // this.props.barcodeSettings.brushedData !==
      //   prevProps.barcodeSettings.brushedData ||
      this.props.horizontalSplitPaneSize !== prevProps.horizontalSplitPaneSize
    ) {
      this.setWidth();
    }
  }

  getWidth() {
    if (this.barcodeWrapperRef.current !== undefined) {
      return this.barcodeWrapperRef.current.parentElement.offsetWidth;
    } else return 1200;
  }

  handleSVGClick = () => {
    this.unhighLight();
    this.props.onHandleBarcodeChanges({
      brushedData: []
    });
    this.setState({
      settings: {
        ...this.state.settings,
        brushing: false
      }
    });
  };

  handleLineClick = () => {
    console.log('line clicked');
    // this.unhighLight();
    // this.props.onHandleBarcodeChanges({
    //     brushedData: []
    // });
    // this.brushing = false;
  };

  handleLineEnter = () => {
    console.log('line entered');
    //   if (this.brushing === false) {
    //     const toolTipPosition = parseInt(d3.select(this).attr("x1"));
    //     d3.select(this)
    //       .transition()
    //       // .duration(100)
    //       .attr("y1", -40)
    //       .style("stroke-width", 3)
    //       .style("opacity", 1);

    //     if (xScale(d.statistic) > width / 2) {
    //       tooltip.attr("text-anchor", "end");
    //     } else {
    //       tooltip.attr("text-anchor", "start");
    //     }

    //     tooltip
    //       .transition()
    //       .duration(100)
    //       .style("opacity", 1)
    //       .text(function() {
    //         return d.lineID;
    //       })
    //       .style("fill", function() {
    //         return settings.mainStrokeColor;
    //       })
    //       .attr("y", -22)
    //       .attr("x", function() {
    //         if (xScale(d.statistic) > width / 2) {
    //           return toolTipPosition - 5;
    //         } else {
    //           return toolTipPosition + 5;
    //         }
    //       });
    //   }
  };

  handleLineLeave = () => {
    console.log('line left');
    // if (this.brushing === false) {
    //     d3.select(this)
    //     .transition()
    //     .delay(100)
    //     .attr('y1', -20)
    //     .style('stroke-width', 2)
    //     .style('opacity', function(d) {
    //         return 0.5;
    //     });
    //     tooltip
    //     .transition()
    //     .delay(100)
    //     .style('opacity', 0);
    // }
  };

  unhighLight = () => {
    const { settings } = this.state;
    d3.selectAll('line.barcode-line')
      .attr('y1', settings.margin.top)
      .style('stroke-width', 2)
      .style('stroke', settings.mainStrokeColor)
      .style('opacity', function(d) {
        return 0.5;
      });
  };

  getMaxObject(array) {
    if (array) {
      const max = Math.max.apply(
        Math,
        array.map(function(o) {
          return o.statistic;
        })
      );
      const obj = array.find(function(o) {
        return o.statistic == max;
      });

      return obj;
    }
  }

  setupBrush(
    barcodeSettings,
    settings,
    horizontalSplitPaneSize,
    containerWidth,
    xAxis
  ) {
    debugger;
    const self = this;
    let objsBrush = {};
    const highlightBrushedTicks = function() {
      self.brushing = true;
      const ticks = d3.selectAll('line.barcode-line');
      debugger;
      if (d3.event.selection !== undefined && d3.event.selection !== null) {
        self.unhighLight();
        const brushedTicks = d3.brushSelection(this);
        const isBrushed = function(brushedTicks, x) {
          const xMin = brushedTicks[0][0];
          const xMax = brushedTicks[1][0];
          const brushTest = xMin <= x && x <= xMax;
          return brushTest;
        };

        const brushed = ticks
          .filter(function() {
            const x = d3.select(this).attr('x1');
            return isBrushed(brushedTicks, x);
          })
          .attr('y1', -40)
          .style('stroke-width', 3)
          .style('opacity', 1.0);
        const brushedDataVar = brushed.data();
        debugger;
        // const brushedDataVar = self.props.brushedData;
        self.props.onHandleBarcodeChanges({
          brushedData: brushedDataVar
        });
        if (brushedDataVar.length > 0) {
          const line = self.getMaxObject(brushedDataVar);
          const maxTick = line;
          const id = line.lineID.replace(/\;/g, '') + '_' + line.id_mult;
          // self.updateToolTip(line, id, self);
          d3.selectAll('line.barcode-line').style(
            'stroke',
            settings.mainStrokeColor
          );
          d3.select('#' + 'barcode-line-' + id)
            .transition()
            .style('stroke', settings.alternativeStrokeColor)
            .attr('y1', -55);
        }
      }
    };

    const endBrush = function() {
      const maxLineData = self.getMaxObject(
        self.props.barcodeSettings.brushedData
      );
      self.props.onSetProteinForDiffView(maxLineData);
      self.props.onHandleMaxLinePlot(maxLineData);
      self.brushing = true;
    };

    objsBrush = d3
      .brush()
      .extent([[0, -50], [containerWidth, horizontalSplitPaneSize]])
      .on('brush', highlightBrushedTicks)
      .on('end', endBrush);
    // d3.selectAll('.barcode-axis').call(objsBrush);
    // d3.selectAll('.barcode-axis').call(objsBrush);
    // d3.selectAll(this.barcodeSVGRef.current).call(objsBrush);
  }

  render() {
    const { settings, containerWidth } = this.state;
    const { barcodeSettings, horizontalSplitPaneSize } = this.props;
    const barcodeData = barcodeSettings.barcodeData || [];
    const width = containerWidth - settings.margin.left - settings.margin.right;
    const height =
      horizontalSplitPaneSize - settings.margin.top - settings.margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([0, barcodeSettings.highStat])
      .range([5, width - 5]);
    // .padding(0.1);

    const ticks = xScale.ticks().map(value => ({
      value,
      xOffset: xScale(value)
    }));

    const xAxis = d3.axisBottom(xScale);
    this.setupBrush(
      barcodeSettings,
      settings,
      horizontalSplitPaneSize,
      containerWidth,
      xAxis
    );

    return (
      <div
        ref={this.barcodeWrapperRef}
        id={settings.id}
        className="BarcodeChartWrapper"
      >
        <svg
          ref={this.barcodeSVGRef}
          id={`svg-${settings.id}`}
          className="barcode-chart-area bcChart barcode"
          height={horizontalSplitPaneSize}
          width={containerWidth}
          viewBox={`0 0 ${containerWidth} ${horizontalSplitPaneSize}`}
          preserveAspectRatio="xMinYMin meet"
          onClick={this.handleSVGClick}
          cursor="crosshair"
          // {...props}
        >
          {/* <g
            id="tickAxis"
            transform={`translate(${settings.margin.left, settings.margin.top})`}
          > */}
          <text
            transform={`translate(${width / 2}, ${height + 35})`}
            textAnchor="middle"
          >
            {barcodeSettings.statLabel}
          </text>
          <text transform="rotate(-90)" y={15} x={0 - height / 1 + 10}>
            {barcodeSettings.lowLabel}
          </text>
          <text transform="rotate(-90)" y={width + 20} x={0 - height / 1 + 10}>
            {barcodeSettings.highLabel}
          </text>
          <path
            d={`M 25 ${height} H ${width + 15}`}
            stroke="currentColor"
            class="barcode-axis"
          />
          {ticks.map(({ value, xOffset }) => (
            <g key={value} transform={`translate(${xOffset + 20}, ${height})`}>
              <line y2="6" stroke="currentColor" />
              <text
                key={value}
                style={{
                  fontSize: '10px',
                  textAnchor: 'middle',
                  transform: 'translateY(20px)'
                }}
              >
                {value}
              </text>
            </g>
          ))}

          {barcodeData.map(d => (
            <line
              id={`barcode-line-${d.lineID}-${d.id_mult}`}
              className="barcode-line"
              key={`${d.lineID}_${d.id_mult}`}
              x1={xScale(d.statistic) + settings.margin.left}
              x2={xScale(d.statistic) + settings.margin.left}
              y1={settings.margin.top}
              y2={height}
              stroke={settings.mainStrokeColor}
              strokeWidth={2}
              opacity={0.5}
              onClick={this.handleLineClick}
              onMouseEnter={this.handleLineEnter}
              onMouseLeave={this.handleLineLeave}
              // d={`${d.statistic}`}
            />
          ))}
          {/* </g> */}
        </svg>
      </div>
    );
  }
}

export default BarcodePlotReact;
