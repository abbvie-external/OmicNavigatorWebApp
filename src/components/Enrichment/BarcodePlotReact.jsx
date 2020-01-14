import React, { Component } from 'react';
import Axis from './Axis';
import './BarcodePlot.scss';
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
        margin: {
          top: 30,
          right: 25,
          bottom: 10,
          left: 20,
          selected: 20,
          max: 10
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
    this.unhighlightBrushedLines();
    // this.barcodeSVGRef.select(".brush").call(this.brushRef.move, null)
    // this.props.onHandleBarcodeChanges({
    //   brushedData: []
    // });
    // this.setState({
    //   settings: {
    //     ...this.state.settings,
    //     brushing: false
    //   }
    // });
  };

  handleLineClick = () => {
    console.log('line clicked');
    // this.unhighlightBrushedLines();
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
    containerWidth,
    xAxis
  ) {
    const self = this;
    let objsBrush = {};

    const brushingStart = function() {
      self.brushing = true;
      // self.unhighlightBrushedLines();
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
          maxLine
            .classed('MaxLine', true)
            .transition()
            .attr('y1', settings.margin.max);
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
      .extent([[0, -50], [containerWidth, horizontalSplitPaneSize]])
      .on('start', brushingStart)
      .on('brush', highlightBrushedLines)
      .on('end', endBrush);
    d3.selectAll('.barcode-axis').call(objsBrush);
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
        // strokeWidth={2}
        // opacity={0.5}
        onClick={this.handleLineClick}
        onMouseEnter={this.handleLineEnter}
        onMouseLeave={this.handleLineLeave}
      />
    ));

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
          <g
            id="tickAxis"
            transform={`translate(${(settings.margin.left,
            settings.margin.top)})`}
          ></g>
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
          <path d={`M 25 ${height} H ${width + 15}`} stroke="currentColor" />

          {barcodeTicks}
          <g className="x barcode-axis">{barcodeLines}</g>
        </svg>
      </div>
    );
  }
}

export default BarcodePlotReact;
