import React, { Component } from 'react';
import './PepplotVolcanoPlot.scss';
import * as d3 from 'd3';

class PepplotVolcanoPlot extends Component {
  state = {
    plotName: 'pepplotVolcanoPlot',
    hoveredCircleData: {
      position: [],
      id: null,
      xstat: null,
      ystat: null,
    },
    hovering: false,
    hoveredTextScalar: 12,
    tooltipPosition: null,
    brushedCirclesData: [],
    brushing: false,
    resize: false,
  };

  volcanoSVGRef = React.createRef();

  componentDidUpdate(prevProps) {
    const { selectedFromTableData, volcanoWidth } = this.props;
    const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
    if (prevProps.volcanoWidth !== volcanoWidth) {
      this.setState({ resize: true });
    }
    circles.classed('highlighted', false);
    selectedFromTableData.forEach(element => {
      const circleid = `${element.id_mult}`;
      const highlightedLine = d3.select(`#volcanoDataPoint-${circleid}`);
      highlightedLine.classed('highlighted', true);
    });
  }
  doTransform(value, axis) {
    const { doXAxisTransformation, doYAxisTransformation } = this.props;
    if (axis === 'x' && doXAxisTransformation) {
      return -Math.log10(value);
    } else if (axis === 'y' && doYAxisTransformation) {
      return -Math.log10(value);
    } else {
      return value;
    }
  }

  unhighlightBrushedCircles = () => {
    const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
    circles.classed('selected', false);
    circles.classed('highlighted', false);
  };
  handleCircleHover = e => {
    const { brushing } = this.state;
    if (!brushing) {
      const hoveredData = {
        id: e.target.attributes['circleid'].value,
        xstat: e.target.attributes['xstatistic'].value,
        ystat: e.target.attributes['ystatistic'].value,
        position: [
          e.target.attributes['cx'].value,
          e.target.attributes['cy'].value,
        ],
      };
      const circle = d3
        .selectAll('circle.volcanoPlot-dataPoint')
        .filter(function() {
          return d3.select(this).attr('id') === e.target.attributes['id'].value;
        });
      circle.classed('hovered', true);
      this.setState({
        hoveredCircleData: hoveredData,
        hovering: true,
      });
    }
  };
  handleCircleLeave() {
    //const circles =
    d3.selectAll('circle.volcanoPlot-dataPoint').classed('hovered', false);
    this.setState({
      hoveredCircleData: {
        position: [],
        id: null,
        xstat: null,
        ystat: null,
      },
      hovering: false,
    });
  }
  getToolTip() {
    const { hoveredCircleData, hovering, hoveredTextScalar } = this.state;
    const {
      xAxisLabel,
      yAxisLabel,
      identifier,
      doXAxisTransformation,
      doYAxisTransformation,
    } = this.props;

    if (hovering) {
      const idText = identifier + ': ' + hoveredCircleData.id;
      const xText = doXAxisTransformation
        ? '-log(' +
          xAxisLabel +
          '): ' +
          parseFloat(hoveredCircleData.xstat).toFixed(4)
        : xAxisLabel + ': ' + parseFloat(hoveredCircleData.xstat).toFixed(4);
      const yText = doYAxisTransformation
        ? '-log(' +
          yAxisLabel +
          '): ' +
          parseFloat(hoveredCircleData.ystat).toFixed(4)
        : yAxisLabel + ': ' + parseFloat(hoveredCircleData.ystat).toFixed(4);
      return (
        <text fontSize="14px" fontWeight="bold">
          <tspan
            x={hoveredCircleData.position[0] * 1 + 10}
            y={hoveredCircleData.position[1]}
          >
            {idText}
          </tspan>
          <tspan
            x={hoveredCircleData.position[0] * 1 + 10}
            y={hoveredCircleData.position[1] * 1 + hoveredTextScalar}
          >
            {xText}
          </tspan>
          <tspan
            x={hoveredCircleData.position[0] * 1 + 10}
            y={hoveredCircleData.position[1] * 1 + 2 * hoveredTextScalar}
          >
            {yText}
          </tspan>
        </text>
      );
    } else {
      return null;
    }
  }

  setupBrush(width, height) {
    const self = this;
    let objsBrush = {};

    const brushingStart = function() {
      self.setState({
        brushing: true,
        hoveredCircleData: {
          position: [],
          id: null,
          xstat: null,
          ystat: null,
        },
      });
    };
    const highlightBrushedCircles = function() {
      if (d3.event.selection !== undefined && d3.event.selection !== null) {
        const brushedCircles = d3.brushSelection(this);
        const isBrushed = function(x, y) {
          const brushTest =
            brushedCircles[0][0] <= x &&
            x <= brushedCircles[1][0] &&
            brushedCircles[0][1] <= y &&
            y <= brushedCircles[1][1];
          return brushTest;
        };

        const circles = d3
          .selectAll('circle.volcanoPlot-dataPoint')
          .classed('selected', false);

        const brushed = circles
          .filter(function() {
            const x = d3.select(this).attr('cx');
            const y = d3.select(this).attr('cy');
            return isBrushed(x, y);
          })
          .classed('selected', true);

        const brushedDataArr = brushed._groups[0].map(a => {
          return JSON.parse(a.attributes.data.value);
        });
        if (brushedDataArr.length > 0) {
          self.setState({ brushedCirclesData: brushedDataArr });
        }
      }
    };
    const endBrush = function() {
      const selection = d3.event.selection;
      if (selection == null) {
        self.handleSVGClick();
      } else {
        self.props.handleVolcanoPlotSelectionChange(
          self.state.brushedCirclesData,
        );
      }
    };

    if (d3.selectAll('.brush').nodes().length > 0) {
      d3.selectAll('.brush').remove();
    }
    objsBrush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('start', brushingStart)
      .on('brush', highlightBrushedCircles)
      .on('end', endBrush);

    d3.selectAll('.volcanoPlotD3BrushSelection').call(objsBrush);
  }

  handleSVGClick() {
    this.unhighlightBrushedCircles();
    this.props.handleVolcanoPlotSelectionChange([]);
    this.setState({ brushing: false });
  }

  render() {
    const {
      pepplotResults,
      volcanoWidth,
      volcanoHeight,
      pepplotResultsUnfiltered,
      xAxisLabel,
      yAxisLabel,
      identifier,
      doXAxisTransformation,
      doYAxisTransformation,
    } = this.props;

    if (pepplotResultsUnfiltered.length === 0) {
      return null;
    }
    var xMM = this.props.getMaxAndMin(pepplotResultsUnfiltered, xAxisLabel);
    var yMM = this.props.getMaxAndMin(pepplotResultsUnfiltered, yAxisLabel);
    xMM = [this.doTransform(xMM[0], 'x'), this.doTransform(xMM[1], 'x')];
    yMM = [this.doTransform(yMM[0], 'y'), this.doTransform(yMM[1], 'y')];

    const xScale = d3
      .scaleLinear()
      .domain([Math.min(...xMM), Math.max(...xMM)])
      .range([volcanoWidth * 0.1, volcanoWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...yMM), Math.max(...yMM)])
      .range([volcanoHeight * 0.9, 0]);

    const yAxis = (
      <line
        className="volcanoPlotYAxis"
        x1={volcanoWidth * 0.1}
        x2={volcanoWidth * 0.1}
        y1={0}
        y2={volcanoHeight - volcanoHeight * 0.05}
      />
    );
    const xAxis = (
      <line
        className="volcanoPlotXAxis"
        x1={0}
        x2={volcanoWidth}
        y1={volcanoHeight - volcanoHeight * 0.1}
        y2={volcanoHeight - volcanoHeight * 0.1}
      />
    );

    const xAxisTicks = xScale.ticks().map(value => ({
      value,
      xOffset: xScale(value),
    }));

    const xPlotTicks = xAxisTicks.map(({ value, xOffset }) => (
      <g
        key={value}
        className="individualTick"
        transform={`translate(${xOffset}, ${volcanoHeight -
          volcanoHeight * 0.1})`}
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
    const yAxisTicks = yScale.ticks().map(value => ({
      value,
      yOffset: yScale(value),
    }));

    const yPlotTicks = yAxisTicks.map(({ value, yOffset }) => (
      <g
        key={value}
        className="individualTick"
        transform={`translate(0,${yOffset})`}
      >
        <line
          x1={volcanoWidth * 0.085}
          x2={volcanoWidth * 0.1}
          stroke="currentColor"
        />
        <text
          key={value}
          style={{
            fontSize: '12px',
            textAnchor: 'middle',
            transform: `translate(20px, 3px)`,
          }}
        >
          {value}
        </text>
      </g>
    ));
    var filteredOutPlotCircles = null;
    if (pepplotResultsUnfiltered.length !== pepplotResults.length) {
      filteredOutPlotCircles = pepplotResultsUnfiltered.map(val => (
        <circle
          cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
          cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
          key={`${val[identifier]}`}
          r={2}
          opacity={0.3}
        ></circle>
      ));
    }
    const plotCircles = pepplotResults.map(val => (
      <circle
        r={2}
        className="volcanoPlot-dataPoint"
        id={`volcanoDataPoint-${val[identifier]}`}
        circleid={`${val[identifier]}`}
        key={`${val[identifier]}`}
        data={`${JSON.stringify(val)}`}
        onMouseEnter={e => this.handleCircleHover(e)}
        onMouseLeave={() => this.handleCircleLeave()}
        onClick={e =>
          this.props.handleRowClick(
            e,
            JSON.parse(e.target.attributes.data.value),
            0,
          )
        }
        xstatistic={`${this.doTransform(val[xAxisLabel], 'x')}`}
        ystatistic={`${this.doTransform(val[yAxisLabel], 'y')}`}
        cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
        cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
        cursor="pointer"
      ></circle>
    ));

    const hoveredCircleTooltip = this.getToolTip();

    this.setupBrush(volcanoWidth, volcanoHeight);

    const xAxisText = doXAxisTransformation
      ? '-log(' + xAxisLabel + ')'
      : xAxisLabel;
    const yAxisText = doYAxisTransformation
      ? '-log(' + yAxisLabel + ')'
      : yAxisLabel;

    if (identifier !== null && xAxisLabel !== null && yAxisLabel !== null) {
      return (
        <div
          className="volcanoPlotContainer"
          style={
            this.props.selectedFromTableData.length === 1 &&
            this.props.isProteinSVGLoaded
              ? { float: 'left' }
              : { float: 'none' }
          }
        >
          <svg
            id="pepplotVolcanoPlot"
            className="volcanoPlotSVG"
            width={volcanoWidth}
            height={volcanoHeight}
            ref={this.volcanoSVGRef}
            onClick={() => this.handleSVGClick()}
          >
            <g className="volcanoPlotD3BrushSelection" />
            {yAxis}
            {xAxis}
            {/*X Axis Label*/}
            <text
              className="axisLabel"
              transform={`translate(${volcanoWidth / 2}, ${volcanoHeight})`}
            >
              {xAxisText}
            </text>
            {/*Y Axis Label*/}
            <text
              className="axisLabel"
              transform={`rotate(-90,0,${volcanoHeight * 0.5})`}
              x="0"
              y={`${volcanoHeight * 0.5}`}
            >
              {yAxisText}
            </text>

            {xPlotTicks}
            {yPlotTicks}
            <filter id="constantOpacity">
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 .3 .3" />
              </feComponentTransfer>
            </filter>
            <g filter="url(#constantOpacity)">{filteredOutPlotCircles}</g>
            {plotCircles}
            {hoveredCircleTooltip}
          </svg>
        </div>
      );
    } else {
      return null;
    }
  }
}
export default PepplotVolcanoPlot;
