import React, { Component, Fragment } from 'react';
import Axis from './Axis';
import './BarcodePlot.scss';
import Tooltip from './useTooltip';
// import PropTypes from 'prop-types';
// import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';

class BarcodePlotReact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredLine: null,
      highlightedLine: null,
      tooltipPosition: null,
      tooltipTextAnchor: 'start',
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
        brushing: false,
        chartDiv: null,
        g: null,
        height: props.horizontalSplitPaneSize - 50,
        id: 'chart-barcode',
        mainDiv: null,
        margin: {
          top: 30,
          right: 25,
          bottom: 20,
          left: 20,
          selected: 15,
          max: 5
        },
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
        this.windowResized();
      }, 200);
    });
  }

  windowResized = () => {
    this.setState({
      highlightedLine: null,
      hoveredLine: null
    });
    debugger;
    // this.barcodeSVGRef.current.getElementsByClassName('selection')[0].remove();
    // this.barcodeSVGRef.current = null;
    // const brush = d3.selectAll('.selection');
    // d3.selectAll('.selection').call(brush.move, null);
    // this.barcodeSVGRef.current.select(".brush").call(this.brushRef.move, null);
    this.setWidth();
  };

  setWidth = () => {
    const width = this.getWidth();
    this.setState({
      containerWidth: width
    });
  };

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
    if (this.barcodeWrapperRef.current !== null) {
      return this.barcodeWrapperRef.current.parentElement.offsetWidth;
    } else return 1200;
  }

  handleSVGClick = () => {
    this.unhighlightBrushedLines();
    // this.barcodeSVGRef.select(".brush").call(this.brushRef.move, null)
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
    this.setState({
      settings: {
        ...this.state.settings,
        brushing: false
      }
    });
    this.unhighlightBrushedLines();
    this.props.onHandleBarcodeChanges({
      brushedData: []
    });
  };

  handleLineEnter = event => {
    if (this.state.settings.brushing === false) {
      const lineDataId = event.target.attributes[7].nodeValue;
      const statistic = event.target.attributes[9].nodeValue;
      const textAnchor = statistic > this.state.width / 2 ? 'end' : 'start';
      const ttPosition =
        textAnchor === 'end'
          ? event.target.attributes[2].nodeValue - 5
          : event.target.attributes[2].nodeValue + 5;

      this.setState({
        // highlightedLine: null,
        hoveredLine: lineDataId,
        tooltipPosition: ttPosition,
        tooltipTextAnchor: textAnchor
      });

      //   d3.select(this)
      //     .attr("y1", -40)
      //     .style("stroke-width", 3)
      //     .style("opacity", 1);

      //   if (xScale(d.statistic) > width / 2) {
      //     tooltip.attr("text-anchor", "end");
      //   } else {
      //     tooltip.attr("text-anchor", "start");
      //   }

      //   tooltip
      //     .style("opacity", 1)
      //     .text(function() {
      //       return d.lineID;
      //     })
      //     .style("fill", function() {
      //       return settings.mainStrokeColor;
      //     })
      //     .attr("y", -22)
      //     .attr("x", function() {
      //       if (xScale(d.statistic) > width / 2) {
      //         return toolTipPosition - 5;
      //       } else {
      //         return toolTipPosition + 5;
      //       }
      //     });
      // }
    }
  };

  handleLineLeave = () => {
    if (this.state.settings.brushing === false) {
      this.setState({
        // highlightedLine: null,
        hoveredLine: null
      });
    }
  };

  unhighlightBrushedLines = () => {
    const { settings } = this.state;
    const lines = d3.selectAll('line.barcode-line');
    lines.classed('selected', false);
    lines.classed('MaxLine', false);
    d3.selectAll('line.barcode-line').attr('y1', settings.margin.top);
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
    width,
    xAxis,
    height
  ) {
    const self = this;
    let objsBrush = {};

    const brushingStart = function() {
      self.setState({
        settings: {
          ...self.state.settings,
          brushing: true
        },
        highlightedLine: null,
        hoveredLine: null
      });
    };

    const highlightBrushedLines = function() {
      if (d3.event.selection !== undefined && d3.event.selection !== null) {
        const brushedLines = d3.brushSelection(this);
        const isBrushed = function(brushedLines, x) {
          const xMin = brushedLines[0][0];
          const xMax = brushedLines[1][0];
          const brushTest = xMin <= x && x <= xMax;
          return brushTest;
        };

        const lines = d3
          .selectAll('line.barcode-line')
          .attr('y1', settings.margin.top)
          .classed('selected', false)
          .classed('MaxLine', false);

        const brushed = lines
          .filter(function() {
            const x = d3.select(this).attr('x1');
            return isBrushed(brushedLines, x);
          })
          .attr('y1', settings.margin.selected)
          .classed('selected', true);

        const brushedArr = brushed._groups[0];
        const brushedDataVar = brushedArr.map(a => {
          return {
            x2: a.attributes[2].nodeValue,
            id_mult: a.attributes[6].nodeValue,
            lineID: a.attributes[7].nodeValue,
            logFC: a.attributes[8].nodeValue,
            statistic: a.attributes[9].nodeValue
          };
        });
        // const brushedDataVar = brushed.data();
        self.props.onHandleBarcodeChanges({
          brushedData: brushedDataVar
        });
        if (brushedDataVar.length > 0) {
          const maxLineObject = self.getMaxObject(brushedDataVar);
          const maxLineId = `${maxLineObject.lineID.replace(/\;/g, '')}_${
            maxLineObject.id_mult
          }`;
          // self.updateToolTip(line, id, self);
          const maxLine = d3.select('#' + 'barcode-line-' + maxLineId);
          maxLine.classed('MaxLine', true).attr('y1', settings.margin.max);

          const statistic = maxLineObject.statisic;
          const textAnchor = statistic > self.state.width / 2 ? 'end' : 'start';
          const ttPosition =
            textAnchor === 'end' ? maxLineObject.x2 - 5 : maxLineObject.x2 + 5;

          self.setState({
            hoveredLine: null,
            highlightedLine: maxLineObject.lineID,
            tooltipPosition: ttPosition,
            tooltipTextAnchor: textAnchor
          });
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
      // .brush()
      .brush()
      .extent([[settings.margin.left + 4, 0], [width + 15, height]])
      .on('start', brushingStart)
      .on('brush', highlightBrushedLines)
      .on('end', endBrush);
    d3.selectAll('.barcode-axis').call(objsBrush);
    // d3.selectAll(this.barcodeSVGRef.current).call(objsBrush);
  }

  getTooltip = () => {
    const {
      hoveredLine,
      highlightedLine,
      tooltipPosition,
      tooltipTextAnchor
    } = this.state;
    if (hoveredLine) {
      return (
        <text
          transform={`translate(${tooltipPosition}, 25)`}
          fontSize="14px"
          textAnchor={tooltipTextAnchor}
        >
          {hoveredLine}
        </text>
      );
    } else if (highlightedLine) {
      return (
        <text
          transform={`translate(${tooltipPosition}, 15)`}
          fontSize="14px"
          textAnchor={tooltipTextAnchor}
        >
          {highlightedLine}
        </text>
      );
    } else return null;
  };

  render() {
    const {
      settings,
      containerWidth,
      hoveredLine,
      tooltipPosition
    } = this.state;
    debugger;
    const {
      barcodeSettings,
      horizontalSplitPaneSize,
      violinDotSelected
    } = this.props;
    const barcodeData = barcodeSettings.barcodeData || [];
    const width = containerWidth - settings.margin.left - settings.margin.right;
    const height =
      horizontalSplitPaneSize - settings.margin.top - settings.margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([0, barcodeSettings.highStat])
      .range([5, width - 5]);
    // .padding(0.1);

    const xAxisTicks = xScale.ticks().map(value => ({
      value,
      xOffset: xScale(value)
    }));

    const xAxis = d3.axisBottom(xScale);
    const barcodeTicks = xAxisTicks.map(({ value, xOffset }) => (
      <g
        key={value}
        className="individualTick"
        transform={`translate(${xOffset + 20}, ${height})`}
      >
        <line y2="8" stroke="currentColor" />
        <text
          key={value}
          style={{
            fontSize: '12px',
            textAnchor: 'middle',
            transform: 'translateY(20px)'
          }}
        >
          {value}
        </text>
      </g>
    ));

    const barcodeLines = barcodeData.map(d => (
      <line
        id={`barcode-line-${d.lineID.replace(/\;/g, '')}_${d.id_mult}`}
        // id={`barcode-line-${d.lineID}-${d.id_mult}`}
        className="barcode-line"
        key={`${d.lineID}_${d.id_mult}`}
        x1={xScale(d.statistic) + settings.margin.left}
        x2={xScale(d.statistic) + settings.margin.left}
        y1={settings.margin.top}
        y2={height}
        id_mult={d.id_mult}
        lineid={d.lineID}
        logfc={d.logFC}
        statistic={d.statistic}
        // stroke={settings.mainStrokeColor}
        strokeWidth={2}
        opacity={0.5}
        onClick={this.handleLineClick}
        // onMouseEnter={this.handleLineEnter}
        // onMouseLeave={this.handleLineLeave}
        onMouseEnter={e => this.handleLineEnter(e)}
        onMouseLeave={this.handleLineLeave}
        cursor="crosshair"
      />
    ));

    const yScale = d3
      .scaleLinear()
      .domain([0, height])
      .range([height - settings.margin.bottom, settings.margin.top]);

    const tooltip = this.getTooltip();

    this.setupBrush(
      barcodeSettings,
      settings,
      horizontalSplitPaneSize,
      width,
      xAxis,
      height
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
          // cursor="crosshair"
          // {...props}
        >
          {/* X Axis */}
          <path d={`M 25 ${height} H ${width + 15}`} stroke="currentColor" />

          {/* X Axis Ticks */}
          {barcodeTicks}

          {/* X Axis Label */}
          <text
            transform={`translate(${width / 2}, ${height + 35})`}
            textAnchor="middle"
          >
            {barcodeSettings.statLabel}
          </text>

          {/* Y Axis Left Label */}
          <text transform="rotate(-90)" y={15} x={0 - height / 1 + 10}>
            {barcodeSettings.lowLabel}
          </text>

          {/* Y Axis Right Label */}
          <text transform="rotate(-90)" y={width + 27} x={0 - height / 1 + 10}>
            {barcodeSettings.highLabel}
          </text>
          <g className="x barcode-axis"></g>
          {/* Barcode Lines & Tooltip */}
          {barcodeLines}
          {tooltip}
        </svg>
      </div>
    );
  }
}

export default BarcodePlotReact;
