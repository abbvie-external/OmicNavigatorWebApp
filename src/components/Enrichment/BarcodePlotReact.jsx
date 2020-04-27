import React, { Component } from 'react';
// import Axis from "./Axis";
import './BarcodePlotReact.scss';
// import Tooltip from "./useTooltip";
import * as d3 from 'd3';
// import * as _ from "lodash";

class BarcodePlotReact extends Component {
  state = {
    barcodeWidth: 0,
    barcodeContainerWidth: 0,
    xScale: null,
    hoveredLineId: null,
    hoveredLineName: null,
    highlightedLineName: null,
    tooltipPosition: null,
    tooltipTextAnchor: 'start',
    settings: {
      brushing: false,
      bottomLabel: '',
      barcodeHeight: 0,
      id: 'chart-barcode',
      margin: {
        top: 40,
        right: 40,
        bottom: 10,
        left: 20,
        hovered: 20,
        selected: 20,
        highlighted: 10,
        max: 5,
      },
    },
  };

  barcodeContainerRef = React.createRef();

  barcodeSVGRef = React.createRef();

  componentDidMount() {
    this.setWidth(true);
    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.windowResized();
      }, 200);
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const self = this;
    if (
      self.props.horizontalSplitPaneSize !== prevProps.horizontalSplitPaneSize
    ) {
      this.setWidth(false);
    }
    // Much of this code can be refactored into a function, as it is used below.
    if (self.props.HighlightedProteins !== prevProps.HighlightedProteins) {
      d3.selectAll(`.MaxLine`)
        .attr('y1', self.state.settings.margin.selected)
        .classed('MaxLine', false);
      d3.selectAll(`.HighlightedLine`)
        .attr('y1', self.state.settings.margin.selected)
        .classed('HighlightedLine', false);
      const HighlightedProteins = self.props.HighlightedProteins.slice(1);
      HighlightedProteins.forEach(element => {
        const lineId = `${element.sample.replace(/;/g, '')}_${element.id_mult}`;
        const highlightedLine = d3.select(`#barcode-line-${lineId}`);
        highlightedLine
          .classed('HighlightedLine', true)
          .attr('y1', self.state.settings.margin.highlighted);
      });
      if (self.props.HighlightedProteins[0]?.sample !== '') {
        const maxLineId = `${self.props.HighlightedProteins[0]?.sample.replace(
          /;/g,
          '',
        )}_${self.props.HighlightedProteins[0].id_mult}`;
        const maxLine = d3.select(`#barcode-line-${maxLineId}`);
        maxLine
          .classed('MaxLine', true)
          .attr('y1', self.state.settings.margin.max);
        const maxLineData = {
          x2: maxLine.attr('x2'),
          id_mult: maxLine.attr('id_mult'),
          lineID: maxLine.attr('lineid'),
          logFC: maxLine.attr('logfc'),
          statistic: maxLine.attr('statistic'),
        };
        const statistic = maxLineData.statistic;
        const textAnchor =
          statistic > self.props.barcodeSettings.highStat / 2 ? 'end' : 'start';
        const ttPosition =
          textAnchor === 'end' ? maxLineData.x2 - 5 : maxLineData.x2 + 5;
        self.setState({
          hoveredLineId: null,
          hoveredLineName: null,
          highlightedLineName: maxLineData.lineID,
          tooltipPosition: ttPosition,
          tooltipTextAnchor: textAnchor,
        });
      }
    }
  }

  windowResized = () => {
    this.setState({
      highlightedLineName: null,
      hoveredLineId: null,
      hoveredLineName: null,
    });
    // this.barcodeSVGRef.current.getElementsByClassName('selection')[0].remove();
    // this.barcodeSVGRef.current = null;
    // const brush = d3.selectAll('.selection');
    // d3.selectAll('.selection').call(brush.move, null);
    // this.barcodeSVGRef.current.select(".brush").call(this.brushRef.move, null);
    this.setWidth(false);
  };

  setWidth = initialBrush => {
    const { settings } = this.state;
    const containerWidth = this.getWidth();
    const width = containerWidth - settings.margin.left - settings.margin.right;
    this.setState({
      barcodeContainerWidth: containerWidth,
      barcodeWidth: width,
    });

    const barcodeHeight =
      this.props.horizontalSplitPaneSize -
      this.state.settings.margin.top -
      this.state.settings.margin.bottom;
    this.setupBrush(width, barcodeHeight, this.state.settings, initialBrush);
  };

  getWidth() {
    if (this.barcodeContainerRef.current !== null) {
      return this.barcodeContainerRef.current.parentElement.offsetWidth;
    }
    return 1200;
  }

  handleSVGClick = event => {
    this.unhighlightBrushedLines();
    // this.barcodeSVGRef.select(".brush").call(this.brushRef.move, null)
    this.props.onHandleBarcodeChanges({
      brushedData: [],
    });
    this.props.onHandleLineSelected([]);
    this.setState({
      settings: {
        ...this.state.settings,
        brushing: false,
      },
    });
  };

  handleLineEnter = event => {
    if (this.state.settings.brushing === false) {
      const lineIdMult = event.target.attributes[6].nodeValue;
      const lineName = event.target.attributes[7].nodeValue;
      const lineStatistic = event.target.attributes[9].nodeValue;
      const textAnchor =
        lineStatistic > this.props.barcodeSettings.highStat / 2
          ? 'end'
          : 'start';
      const textPosition =
        textAnchor === 'end'
          ? event.target.attributes[2].nodeValue - 5
          : event.target.attributes[2].nodeValue + 5;
      const lineId = `#barcode-line-${lineName.replace(
        /;/g,
        '',
      )}_${lineIdMult}`;
      const hoveredLine = d3.select(lineId);
      hoveredLine
        .classed('HoveredLine', true)
        .attr('y1', this.state.settings.margin.hovered);
      this.setState({
        hoveredLineId: lineId,
        hoveredLineName: lineName,
        tooltipPosition: textPosition,
        tooltipTextAnchor: textAnchor,
      });
    }
  };

  handleLineLeave = () => {
    if (this.state.settings.brushing === false) {
      const hoveredLine = d3.select(this.state.hoveredLineId);
      hoveredLine
        .classed('HoveredLine', false)
        .attr('y1', this.state.settings.margin.top);
      this.setState({
        hoveredLineId: null,
        hoveredLineName: null,
        tooltipPosition: null,
        tooltipTextAnchor: null,
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
        }),
      );
      const obj = array.find(function(o) {
        return o.statistic === max;
      });
      return obj;
    }
  }

  setupBrush(barcodeWidth, barcodeHeight, settings, initialBrush) {
    const self = this;
    let objsBrush = {};

    const brushingStart = function() {
      self.setState({
        settings: {
          ...self.state.settings,
          brushing: true,
        },
        highlightedLineName: null,
        hoveredLineId: null,
        hoveredLineName: null,
      });
      // }
      //}
    };

    const highlightBrushedLines = function() {
      if (d3.event.selection != null) {
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
        // const brushedDataVar = brushed.data();
        const brushedDataVar = brushedArr.map(a => {
          return {
            x2: a.attributes[2].nodeValue,
            id_mult: a.attributes[6].nodeValue,
            lineID: a.attributes[7].nodeValue,
            logFC: a.attributes[8].nodeValue,
            statistic: a.attributes[9].nodeValue,
          };
        });
        self.props.onHandleBarcodeChanges({
          brushedData: brushedDataVar,
        });
        if (brushedDataVar.length > 0) {
          const maxLineObject = self.getMaxObject(brushedDataVar);
          const maxLineId = `${maxLineObject.lineID.replace(/;/g, '')}_${
            maxLineObject.id_mult
          }`;
          const maxLine = d3.select(`#barcode-line-${maxLineId}`);
          maxLine.classed('MaxLine', true).attr('y1', settings.margin.max);
          const statistic = maxLineObject.statistic;
          const textAnchor =
            statistic > self.props.barcodeSettings.highStat / 2
              ? 'end'
              : 'start';
          const ttPosition =
            textAnchor === 'end' ? maxLineObject.x2 - 5 : maxLineObject.x2 + 5;
          self.setState({
            hoveredLineId: null,
            hoveredLineName: null,
            highlightedLineName: maxLineObject.lineID,
            tooltipPosition: ttPosition,
            tooltipTextAnchor: textAnchor,
          });
        }
      } else {
        self.handleSVGClick(null);
      }
    };

    const endBrush = function() {
      const selection = d3.event.selection;
      if (selection == null) {
        self.handleSVGClick(null);
      } else {
        if (self.props.barcodeSettings.brushedData.length > 0) {
          const maxLineData = self.getMaxObject(
            self.props.barcodeSettings.brushedData,
          );
          const maxLineDataArr = [maxLineData];
          const highlightedLineArray = maxLineDataArr.map(function(m) {
            return {
              sample: m.lineID,
              id_mult: m.id_mult,
              cpm: m.statistic,
            };
          });
          self.props.onHandleLineSelected(highlightedLineArray);
        } else {
          self.props.onHandleLineSelected([]);
          self.setState({
            tooltipPosition: null,
            tooltipTextAnchor: null,
            highlightedLineName: null,
          });
        }
      }
    };

    //Remove existing brushes
    if (d3.selectAll('.brush').nodes().length > 0) {
      d3.selectAll('.brush').remove();
    }

    objsBrush = d3
      .brush()
      .extent([
        [settings.margin.left + 4, 0],
        [barcodeWidth + 15, barcodeHeight],
      ])
      .on('start', brushingStart)
      .on('brush', highlightBrushedLines)
      .on('end', endBrush);

    d3.selectAll('.x.barcode-axis')
      .append('g')
      .attr('class', 'brush')
      .call(objsBrush);

    if (initialBrush) {
      const quatileTicks = d3.selectAll('line').filter(function() {
        return d3.select(this).attr('id');
      });
      const quartile = Math.round(quatileTicks.nodes().length * 0.25);
      setTimeout(function() {
        d3.select('.brush').call([objsBrush][0].move, [
          [quatileTicks.nodes()[quartile].getAttribute('x1'), 60],
          [quatileTicks.nodes()[0].getAttribute('x1'), barcodeHeight - 30],
        ]);
      }, 5);
    } else {
      // reposition the brushed rect on window resize, or horizontal pane resize
      const selectedTicks = d3.selectAll('line').filter(function() {
        return d3.select(this).classed('selected');
      });

      const highestTickIndex = selectedTicks.nodes().length - 1;

      d3.select('.brush').call([objsBrush][0].move, [
        [selectedTicks.nodes()[highestTickIndex].getAttribute('x1'), 60],
        [selectedTicks.nodes()[0].getAttribute('x1'), barcodeHeight - 30],
      ]);
    }
    // d3.selectAll(this.barcodeSVGRef.current).call(objsBrush);
    // const brushed = d3.selectAll('.selected');
    // const brushedArr = brushed._groups[0];
    // // const brushedDataVar = brushed.data();
    // const brushedDataVar = brushedArr.map(a => {
    //   return {
    //     x2: a.attributes[2].nodeValue,
    //     id_mult: a.attributes[6].nodeValue,
    //     lineID: a.attributes[7].nodeValue,
    //     logFC: a.attributes[8].nodeValue,
    //     statistic: a.attributes[9].nodeValue,
    //   };
    // });
    // self.props.onHandleBarcodeChanges({
    //   brushedData: brushedDataVar,
    // });
  }

  getTooltip = () => {
    const {
      // hoveredLineId,
      hoveredLineName,
      highlightedLineName,
      tooltipPosition,
      tooltipTextAnchor,
    } = this.state;
    if (hoveredLineName) {
      return (
        <text
          className="BarcodeTooltipText"
          transform={`translate(${tooltipPosition}, 30)`}
          fontSize="14px"
          textAnchor={tooltipTextAnchor}
        >
          &nbsp;&nbsp;{hoveredLineName}
        </text>
      );
    }
    if (highlightedLineName) {
      return (
        <text
          className="BarcodeTooltipText"
          transform={`translate(${tooltipPosition}, 15)`}
          fontSize="14px"
          textAnchor={tooltipTextAnchor}
        >
          &nbsp;&nbsp;{highlightedLineName}
        </text>
      );
    }
    return null;
  };

  render() {
    const {
      barcodeWidth,
      barcodeContainerWidth,
      settings,
      // hoveredLineId,
      // hoveredLineName,
      // tooltipPosition
    } = this.state;

    const { horizontalSplitPaneSize, barcodeSettings } = this.props;

    const barcodeHeight =
      horizontalSplitPaneSize - settings.margin.top - settings.margin.bottom;
    // const yScale = d3
    //   .scaleLinear()
    //   .domain([0, barcodeHeight])
    //   .range([barcodeHeight - settings.margin.bottom, settings.margin.top]);

    const xScale = d3
      .scaleLinear()
      .domain([0, barcodeSettings.highStat])
      .range([5, barcodeWidth - 5]);

    const xAxisTicks = xScale.ticks().map(value => ({
      value,
      xOffset: xScale(value),
    }));

    const barcodeTicks = xAxisTicks.map(({ value, xOffset }) => (
      <g
        key={value}
        className="individualTick"
        transform={`translate(${xOffset + 20}, ${barcodeHeight})`}
      >
        <line y2="8" stroke="currentColor" />
        <text
          key={value}
          style={{
            fontSize: '12px',
            textAnchor: 'middle',
            transform: 'translateY(20px)',
          }}
        >
          {value}
        </text>
      </g>
    ));

    const barcodeLines = barcodeSettings.barcodeData.map(d => (
      <line
        id={`barcode-line-${d.lineID.replace(/;/g, '')}_${d.id_mult}`}
        className="barcode-line"
        key={`${d.lineID}_${d.id_mult}`}
        x1={xScale(d.statistic) + settings.margin.left}
        x2={xScale(d.statistic) + settings.margin.left}
        y1={settings.margin.top}
        y2={barcodeHeight}
        id_mult={d.id_mult}
        lineid={d.lineID}
        logfc={d.logFC}
        statistic={d.statistic}
        onClick={e => this.handleSVGClick(e)}
        onMouseEnter={e => this.handleLineEnter(e)}
        onMouseLeave={this.handleLineLeave}
        cursor="crosshair"
      />
    ));

    const tooltip = this.getTooltip();

    return (
      <div
        ref={this.barcodeContainerRef}
        id={settings.id}
        className="BarcodeChartContainer"
      >
        <svg
          ref={this.barcodeSVGRef}
          id={`svg-${settings.id}`}
          className="barcode-chart-area bcChart barcode"
          height={horizontalSplitPaneSize}
          width={barcodeContainerWidth}
          viewBox={`0 0 ${barcodeContainerWidth} ${horizontalSplitPaneSize}`}
          preserveAspectRatio="xMinYMin meet"
          onClick={e => this.handleSVGClick(e)}
        >
          {/* X Axis */}
          <path
            d={`M 25 ${barcodeHeight} H ${barcodeWidth + 15}`}
            stroke="currentColor"
          />

          {/* X Axis Ticks */}
          {barcodeTicks}

          {/* X Axis Label */}
          <text
            className="BarcodeLabel"
            transform={`translate(${barcodeWidth / 2}, ${barcodeHeight + 35})`}
            textAnchor="middle"
          >
            {barcodeSettings.statLabel}
          </text>

          {/* Y Axis Left Label */}
          <text
            className="BarcodeLabel"
            transform="rotate(-90)"
            y={15}
            x={0 - barcodeHeight / 1 + 10}
          >
            {barcodeSettings.lowLabel}
          </text>

          {/* Y Axis Right Label */}
          <text
            className="BarcodeLabel"
            transform="rotate(-90)"
            y={barcodeWidth + 27}
            x={0 - barcodeHeight / 1 + 10}
          >
            {barcodeSettings.highLabel}
          </text>

          <g className="x barcode-axis" />
          {/* Barcode Lines & Tooltip */}
          {barcodeLines}
          {tooltip}
        </svg>
      </div>
    );
  }
}

export default BarcodePlotReact;
