import React, { Component } from 'react';
import _ from 'lodash';
import './DifferentialVolcanoPlot.scss';
import * as d3 from 'd3';
import ButtonActions from '../Shared/ButtonActions';

class DifferentialVolcanoPlot extends Component {
  state = {
    differentialIsSVGLoaded: true,
    hoveredCircleData: {
      position: [],
      id: null,
      xstat: null,
      ystat: null,
    },
    hovering: false,
    hoveredTextScalar: 12,
    tooltipPosition: null,
    // brushedCirclesData: [],
    // brushedCircles: [],
    brushing: false,
    resizeScalarX: 1,
    resizeScalarY: 1,
    volcanoCircleText: [],
  };

  componentDidMount() {
    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.windowResized();
      }, 200);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      volcanoDifferentialTableRowOther,
      volcanoDifferentialTableRowMax,
      volcanoCircleLabel,
      volcanoHeight,
      volcanoWidth,
      xAxisLabel,
      yAxisLabel,
      doXAxisTransformation,
      doYAxisTransformation,
      updateVolcanoLabels,
    } = this.props;

    if (
      volcanoCircleLabel != null &&
      prevProps.volcanoCircleLabel !== volcanoCircleLabel &&
      this.state.brushedRawData != null
    ) {
      this.handleBrushedText(this.state.brushedRawData);
    }

    if (
      updateVolcanoLabels ||
      (volcanoCircleLabel != null &&
        prevProps.volcanoCircleLabel !== volcanoCircleLabel &&
        this.props.volcanoDifferentialTableAll?.length > 0 &&
        this.state.brushedRawData == null)
    ) {
      const elems = this.props.volcanoDifferentialTableAll.map(elem => {
        const el = document.getElementById(`volcanoDataPoint-${elem.key}`);
        return d3.select(el)._groups[0][0];
      });

      this.handleBrushedText({ _groups: [elems] });
    }

    if (
      !_.isEqual(
        _.sortBy(volcanoDifferentialTableRowOther),
        _.sortBy(prevProps.volcanoDifferentialTableRowOther),
      ) ||
      volcanoDifferentialTableRowMax !==
        prevProps.volcanoDifferentialTableRowMax
    ) {
      // excessive styling needed for proper display across all export types
      // style all circles back to default
      const allCircles = d3.selectAll('circle.volcanoPlot-dataPoint');
      allCircles.attr('style', 'fill: #1678c2');
      allCircles.attr('r', 2);
      allCircles.classed('highlighted', false);
      allCircles.classed('highlightedMax', false);
      const selectedCircles = d3.selectAll(
        'circle.volcanoPlot-dataPoint.selected',
      );
      // style all brushed circles
      selectedCircles
        .attr('style', 'fill: #00aeff')
        .classed('highlighted', true);
      selectedCircles.attr('r', 2.5);
      selectedCircles.raise();
      if (volcanoDifferentialTableRowOther?.length > 0) {
        volcanoDifferentialTableRowOther.forEach(element => {
          // style all highlighted circles
          const highlightedCircleId = document.getElementById(
            `volcanoDataPoint-${element}`,
          );
          const highlightedCircle = d3.select(highlightedCircleId);
          if (highlightedCircle != null) {
            highlightedCircle.attr('r', 4);
            highlightedCircle
              .attr('style', 'fill: #ff7e05')
              .classed('highlighted', true);
            highlightedCircle.attr('r', 5);
            highlightedCircle.classed('highlightedMax', true);
            highlightedCircle.raise();
          }
        });
      }
      if (volcanoDifferentialTableRowMax?.length > 0) {
        // style max highlighted circle
        const maxCircleId = document.getElementById(
          `volcanoDataPoint-${volcanoDifferentialTableRowMax}`,
        );
        const maxCircle = d3.select(maxCircleId);
        if (maxCircle != null) {
          maxCircle.attr('style', 'fill: #ff4400').classed('highlighted', true);
          maxCircle.attr('r', 5);
          maxCircle.classed('highlightedMax', true);
          maxCircle.raise();
        }
      }
    }
    if (
      prevProps.volcanoHeight !== volcanoHeight ||
      prevProps.volcanoWidth !== volcanoWidth
    ) {
      this.resizeBrushSelection();
    }
    if (
      prevProps.xAxisLabel !== xAxisLabel ||
      prevProps.yAxisLabel !== yAxisLabel ||
      prevProps.doXAxisTransformation !== doXAxisTransformation ||
      prevProps.doYAxisTransformation !== doYAxisTransformation
    ) {
      this.removeViolinBrush();
    }
    console.log(this.props.isVolcanoPlotSVGLoaded);
    if (
      this.props.isVolcanoPlotSVGLoaded &&
      this.props.isVolcanoPlotSVGLoaded !== prevProps.isVolcanoPlotSVGLoaded // ||
      // (this.state.differentialIsSVGLoaded &&
      //   this.state.differentialIsSVGLoaded !== prevState.differentialIsSVGLoaded)
    ) {
      // || (this.props.maxObjectIdentifier === "" && this.props.maxObjectIdentifier !== prevProps.maxObjectIdentifier)){
      this.setState({ volcanoCursorLoading: false });
    }
  }

  removeViolinBrush = () => {
    const brush = d3
      .select('.volcanoPlotD3BrushSelection')
      .selectAll('rect.selection');
    const brushObjs = this.state.objsBrushState;
    if (
      brush.nodes().length !== 0 &&
      brush.nodes()[0].getAttribute('x') !== null &&
      brushObjs != null
    ) {
      d3.select('.volcanoPlotD3BrushSelection').call(brushObjs.move, null);
    }
  };

  resizeBrushSelection = () => {
    this.removeViolinBrush();
    // add resizing later after priorities
  };

  windowResized = () => {
    this.removeViolinBrush();
  };

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
    circles
      .attr('style', 'fill: #1678c2')
      .attr('r', 2)
      .classed('selected', false)
      .classed('highlighted', false)
      .classed('highlightedMax', false);

    this.setState({
      brushedRawData: null,
    });
  };

  handleCircleHover = e => {
    const hoveredData = {
      id: e.target.attributes['circleid'].value,
      xstat: e.target.attributes['xstatistic'].value,
      ystat: e.target.attributes['ystatistic'].value,
      position: [
        e.target.attributes['cx'].value,
        e.target.attributes['cy'].value,
      ],
    };
    const hoveredElement = `volcanoDataPoint-${e.target.attributes['circleid'].value}`;
    const hoveredId = `#volcanoDataPoint-${e.target.attributes['circleid'].value}`;
    const hovered = document.getElementById(hoveredElement);
    if (hovered != null) {
      const circle = d3.select(hovered) ?? null;
      if (circle != null) {
        circle.attr('r', 6);
        circle.raise();
        this.setState({
          hoveredCircleData: hoveredData,
          hoveredCircleId: hoveredId || null,
          hoveredCircleElement: hoveredElement,
          hovering: true,
        });
      }
    }
  };
  handleCircleLeave() {
    d3.selectAll('circle.volcanoPlot-dataPoint').classed('hovered', false);
    const hovered = document.getElementById(this.state.hoveredCircleElement);
    if (hovered != null) {
      const hoveredCircle = d3.select(hovered) ?? null;
      if (hoveredCircle != null) {
        if (!hoveredCircle.empty()) {
          if (hoveredCircle.attr('class').endsWith('selected')) {
            hoveredCircle.attr('r', 2.5);
          } else if (hoveredCircle.attr('class').endsWith('highlightedMax')) {
            hoveredCircle.attr('r', 5);
          } else if (hoveredCircle.attr('class').endsWith('highlighted')) {
            hoveredCircle.attr('r', 4);
          } else {
            hoveredCircle.attr('r', 2);
          }
        }
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
    }
  }
  getToolTip() {
    const { hoveredCircleData, hovering } = this.state;
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
        <svg
          x={
            hoveredCircleData.position[0] >= 240
              ? hoveredCircleData.position[0] * 1 - 170
              : hoveredCircleData.position[0] * 1 + 15
          }
          y={hoveredCircleData.position[1] * 1 + 10}
          width="200"
          height="75"
        >
          <rect width="100%" height="100%" fill="#ff4400" rx="5" ry="5"></rect>
          <rect
            width="100%"
            height="95%"
            fill="#2e2e2e"
            stroke="#000"
            rx="3"
            ry="3"
          ></rect>
          <text
            fontSize="13px"
            fill="#FFF"
            fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
            textAnchor="left"
          >
            <tspan x={15} y={23}>
              {idText}
            </tspan>
            <tspan x={15} y={23 + 16}>
              {xText}
            </tspan>
            <tspan x={15} y={23 + 16 * 2}>
              {yText}
            </tspan>
          </text>
        </svg>
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
    const endBrush = function() {
      // self.props.onHandleVolcanoTableLoading(true);
      if (d3.event.selection != null) {
        const brushedCircles = d3.brushSelection(this);
        const isBrushed = function(x, y) {
          const brushTest =
            brushedCircles[0][0] <= x &&
            x <= brushedCircles[1][0] &&
            brushedCircles[0][1] <= y &&
            y <= brushedCircles[1][1];
          return brushTest;
        };

        // style all circles back to default
        const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
        circles.attr('style', 'fill: #1678c2');
        circles.attr('r', 2);
        circles.classed('selected', false);
        circles.classed('highlighted', false);
        circles.classed('highlightedMax', false);

        // style all brushed circles
        const brushed = circles.filter(function() {
          const x = d3.select(this).attr('cx');
          const y = d3.select(this).attr('cy');
          return isBrushed(x, y);
        });
        brushed.attr('style', 'fill: #00aeff');
        brushed.attr('r', 2.5);
        brushed.classed('selected', true);
        self.setState({ brushedRawData: brushed });
        self.handleBrushedText(brushed);

        const brushedDataArr = brushed._groups[0].map(a => {
          return JSON.parse(a.attributes.data.value);
        });
        if (brushedDataArr.length > 0) {
          self.setState({
            brushedCirclesData: brushedDataArr,
            brushedCircles: brushed,
          });
        }
        self.props.handleVolcanoPlotSelectionChange(brushedDataArr);
      }
    };

    if (d3.selectAll('.brush').nodes().length > 0) {
      d3.selectAll('.brush').remove();
    }
    objsBrush = d3
      .brush()
      .extent([
        [-100, -20],
        [width + 100, height + 20],
      ])
      .on('start', brushingStart)
      .on('end', endBrush);
    d3.selectAll('.volcanoPlotD3BrushSelection').call(objsBrush);
    const brush = d3
      .select('.volcanoPlotD3BrushSelection')
      .selectAll('rect.selection');
    if (
      brush.nodes().length !== 0 &&
      brush.nodes()[0].getAttribute('x') !== null &&
      (self.state.resizeScalarX !== 1 || self.state.resizeScalarY !== 1)
    ) {
      d3.select('.volcanoPlotD3BrushSelection').call(objsBrush.move, [
        [
          parseFloat(brush.nodes()[0].getAttribute('x')) *
            self.state.resizeScalarX,
          parseFloat(brush.nodes()[0].getAttribute('y')) *
            self.state.resizeScalarY,
        ],
        [
          (parseFloat(brush.nodes()[0].getAttribute('x')) +
            parseFloat(brush.nodes()[0].getAttribute('width'))) *
            self.state.resizeScalarX,
          (parseFloat(brush.nodes()[0].getAttribute('y')) +
            parseFloat(brush.nodes()[0].getAttribute('height'))) *
            self.state.resizeScalarY,
        ],
      ]);
      self.setState({
        resizeScalarX: 1,
        resizeScalarY: 1,
        objsBrushState: objsBrush,
      });
    }
  }

  handleBrushedText = brushed => {
    // MAP brushedDataArr to circle text state
    const brushedCircleTextMapped = brushed._groups[0].map(a => {
      const columnData = JSON.parse(a.attributes[4].nodeValue);
      const key = this.props.volcanoCircleLabel || 0;
      return {
        data: columnData[key],
        class: a.attributes[1].nodeValue,
        id: a.attributes[2].nodeValue,
        cx: a.attributes[10].nodeValue,
        cy: a.attributes[11].nodeValue,
        // r: a.attributes[0].nodeValue,
        // circleid: a.attributes[3].nodeValue,
        // stroke: a.attributes[5].nodeValue,
        // stoke-width: a.attributes[6].nodeValue,
        // fill: a.attributes[7].nodeValue
        // xstatistic: a.attributes[5 8].nodeValue,
        // ystatistic: a.attributes[6 9].nodeValue,
        // cursor: a.attributes[9 12].nodeValue,
        // style: a.attributes[10 13].nodeValue,
        // stroke: a.attributes[11].nodeValue,
        // stoke-width: a.attributes[12].nodeValue,
        // fill: a.attributes[13].nodeValue
      };
    });
    const self = this;
    const brushedCircleText = brushedCircleTextMapped.map(circle => {
      const circleOnLeftSide = circle.cx <= self.props.volcanoWidth / 2;
      const textAnchor = circleOnLeftSide ? 'start' : 'end';
      const cx = circleOnLeftSide
        ? parseInt(circle.cx) + 5
        : parseInt(circle.cx) - 5;
      const cy = parseInt(circle.cy) + 4;
      return (
        <text
          key={`volcanoCircleText-${circle.id}`}
          className="volcanoCircleTooltipText"
          transform={`translate(${cx}, ${cy})rotate(0)`}
          fontSize="11px"
          textAnchor={textAnchor}
          fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
        >
          {circle.data}
        </text>
      );
    });
    this.setState({
      volcanoCircleText: brushedCircleText,
    });
    this.props.onUpdateVolcanoLabels(false);
  };

  handleSVGClick = () => {
    // this.props.onHandleVolcanoTableLoading(true);
    this.unhighlightBrushedCircles();
    this.props.handleVolcanoPlotSelectionChange([]);
    this.setState(
      {
        brushing: false,
        resizeScalarX: 1,
        resizeScalarY: 1,
        volcanoCircleText: [],
      }, //,
      //this.props.turnOffCursor()
    );

    // setTimeout(
    //   () => this.setState({differentialIsSVGLoaded: true }),
    //   1000
    // );
  };

  // getRadius(val) {
  //   const otherFeatures = this.props.volcanoDifferentialTableRowOther.includes(
  //     val,
  //   );
  //   if (val === this.props.volcanoDifferentialTableRowMax) {
  //     return 5;
  //   } else if (otherFeatures) {
  //     return 4;
  //   } else return 2;
  // }

  getXAxisLabelY(volcanoHeight) {
    if (volcanoHeight < 300) {
      return volcanoHeight - 19;
    } else if (volcanoHeight > 500) {
      return volcanoHeight - 10;
    } else return volcanoHeight - 15;
  }

  getLabelSizes = () => {
    const { volcanoHeight, volcanoWidth } = this.props;
    if (volcanoHeight > 600 && volcanoWidth > 400) {
      var min_dim = Math.min(volcanoHeight / 600, volcanoWidth / 400);
      var scale_factor = 12 + min_dim * 8;
      return scale_factor + 'px';
    } else {
      return '12px';
    }
  };

  getXLabelPosY = xAxisLabelY => {
    const { volcanoHeight, volcanoWidth } = this.props;
    if (volcanoHeight > 600 && volcanoWidth > 400) {
      var scale_factor = (volcanoHeight / 600) * 10;
      return xAxisLabelY + scale_factor;
    } else {
      return xAxisLabelY;
    }
  };

  getYTicks = () => {
    const { volcanoHeight, volcanoWidth } = this.props;
    if (volcanoHeight > 600 && volcanoWidth > 400) {
      var min_dim = Math.min(volcanoHeight / 600, volcanoWidth / 400);
      var scale_factor = 12 + min_dim * 6;
      return scale_factor + 'px';
    } else {
      return '12px';
    }
  };

  getXYtransform = () => {
    const { volcanoHeight, volcanoWidth } = this.props;
    if (volcanoHeight > 600 && volcanoWidth > 400) {
      var scale_factor = 20 + 5 * (volcanoHeight / 600);
      return 'translateY(' + scale_factor + 'px)';
    } else {
      return 'translateY(20px)';
    }
  };

  render() {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialResults,
      volcanoWidth,
      volcanoHeight,
      differentialResultsUnfiltered,
      xAxisLabel,
      yAxisLabel,
      identifier,
      doXAxisTransformation,
      doYAxisTransformation,
    } = this.props;

    const { volcanoCircleText, volcanoCursorLoading } = this.state;

    if (differentialResultsUnfiltered.length === 0) {
      return null;
    }
    var xMM = this.props.getMaxAndMin(
      differentialResultsUnfiltered,
      xAxisLabel,
    );
    var yMM = this.props.getMaxAndMin(
      differentialResultsUnfiltered,
      yAxisLabel,
    );
    xMM = [this.doTransform(xMM[0], 'x'), this.doTransform(xMM[1], 'x')];
    yMM = [this.doTransform(yMM[0], 'y'), this.doTransform(yMM[1], 'y')];

    const xScale = d3
      .scaleLinear()
      .domain([Math.min(...xMM), Math.max(...xMM)])
      .range([64, volcanoWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...yMM), Math.max(...yMM)])
      // .range([volcanoHeight * 0.79, 10]);
      .range([volcanoHeight - 54, 10]);

    const yAxis = (
      <line
        className="volcanoPlotYAxis NoSelect"
        x1={60}
        x2={60}
        y1={0}
        y2={volcanoHeight - 50}
        stroke="#000"
        strokeWidth={1}
      />
    );
    const xAxis = (
      <line
        className="volcanoPlotXAxis NoSelect"
        x1={60}
        x2={volcanoWidth}
        y1={volcanoHeight - 50}
        y2={volcanoHeight - 50}
        stroke="#000"
        strokeWidth={1}
      />
    );

    const xAxisTicks = xScale.ticks().map(value => ({
      value,
      xOffset: xScale(value),
    }));

    const xPlotTicks = xAxisTicks.map(({ value, xOffset }) => (
      <g
        key={
          value !== undefined
            ? `xplotick-${value}-g`
            : `xplottick-${identifier}-g`
        }
        className="individualTick NoSelect"
        transform={`translate(${xOffset}, ${volcanoHeight - 50})`}
      >
        <line y2="8" stroke="#000" strokeWidth={1} />
        <text
          key={
            value !== undefined
              ? `xplottick-${value}-text`
              : `xplottick-${identifier}-text`
          }
          style={{
            fontSize: this.getYTicks(),
            textAnchor: 'middle',
            transform: this.getXYtransform(),
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
        key={
          value !== undefined
            ? `yplottick-${value}-g`
            : `yplottick-${identifier}-g`
        }
        className="individualTick NoSelect"
        transform={`translate(0,${yOffset})`}
      >
        <line x1={50} x2={60} stroke="#000" strokeWidth={1} />
        <text
          key={
            value !== undefined
              ? `yplottick-${value}-text`
              : `yplottick-${identifier}-text`
          }
          style={{
            fontSize: this.getYTicks(),
            textAnchor: 'middle',
            transform: `translate(40px, 3px)`,
          }}
        >
          {value}
        </text>
      </g>
    ));
    let self = this;
    var filteredOutPlotCircles = null;
    if (differentialResultsUnfiltered.length !== differentialResults.length) {
      filteredOutPlotCircles = differentialResultsUnfiltered.map(
        (val, index) => (
          <circle
            cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
            cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
            key={`${val[identifier] + '_' + index}`}
            r={2}
            opacity={0.3}
          ></circle>
        ),
      );
    }
    const plotCircles = differentialResults.map((val, index) => (
      <circle
        // r={this.getRadius(val[this.props.differentialFeatureIdKey])}
        r={2}
        className={
          volcanoCursorLoading
            ? 'volcanoPlot-dataPoint CursorWait'
            : 'volcanoPlot-dataPoint'
        }
        id={`volcanoDataPoint-${val[identifier]}`}
        circleid={`${val[identifier]}`}
        key={`${val[identifier] + '_' + index}`}
        data={`${JSON.stringify(val)}`}
        stroke={'#000'}
        strokeWidth={0.4}
        fill={'#1678c2'}
        onMouseEnter={e => this.handleCircleHover(e)}
        onMouseLeave={() => this.handleCircleLeave()}
        onClick={function(e) {
          e.persist();
          self.setState(
            { volcanoCursorLoading: true },
            () =>
              setTimeout(function() {
                self.props.onHandleDotClick(
                  e,
                  JSON.parse(e.target.attributes.data.value),
                  0,
                );
              }, 4),
            //setTimeout(self.turnOffCursor(), 1000);
            //self.setState({differentialIsSVGLoaded: true});
          );

          // function temp1(){
          //   self.props.onHandleDotClick(
          //     e,
          //     JSON.parse(e.target.attributes.data.value),
          //     0,
          //   );
          // }

          // self.setState({ volcanoCursorLoading: true, differentialIsSVGLoaded: false },
          //   [temp1(),
          //   setTimeout(self.setState({differentialIsSVGLoaded: true}), 500)]);

          // setTimeout(self.setState({differentialIsSVGLoaded: true}), 500);

          // self.setState({ volcanoCursorLoading: true, differentialIsSVGLoaded: false });
          // setTimeout(self.props.onHandleDotClick(
          //   e,
          //   JSON.parse(e.target.attributes.data.value),
          //   0,
          // ), 500);
          // setTimeout(self.setState({differentialIsSVGLoaded: true}), 500);

          // self.setState({ volcanoCursorLoading: true });
          // self.props.onHandleDotClick(
          //   e,
          //   JSON.parse(e.target.attributes.data.value),
          //   0,
          // );
        }}
        xstatistic={`${this.doTransform(val[xAxisLabel], 'x')}`}
        ystatistic={`${this.doTransform(val[yAxisLabel], 'y')}`}
        cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
        cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
        // cursor="pointer"
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
    const xAxisLabelY = this.getXAxisLabelY(volcanoHeight);
    const PlotName = `${differentialStudy}_${differentialModel}_${differentialTest}_scatter`;
    if (identifier !== null && xAxisLabel !== null && yAxisLabel !== null) {
      return (
        <>
          <div id="VolcanoPlotDiv">
            <ButtonActions
              exportButtonSize="mini"
              plotName={PlotName}
              plot="VolcanoChart"
              excelVisible={false}
              pdfVisible={false}
              pngVisible={true}
              svgVisible={true}
            />
          </div>
          <svg
            id="VolcanoChart"
            className={
              volcanoCursorLoading
                ? 'VolcanoPlotSVG CursorWaitRect'
                : 'VolcanoPlotSVG'
            }
            width={volcanoWidth + 20}
            height={volcanoHeight}
            ref={this.volcanoSVGRef}
            onClick={function() {
              //console.log("dif1: " + self.state.differentialIsSVGLoaded + " " + self.state.volcanoCursorLoading);
              //debugger;
              //      self.setState({ volcanoCursorLoading: true }, () => setTimeout(function() {
              // function(){
              //   self.handleSVGClick();
              //   self.setState({differentialIsSVGLoaded: false });
              // }
              //console.log("dif2: " + self.state.differentialIsSVGLoaded + " " + self.state.volcanoCursorLoading);
              //        self.handleSVGClick();
              //        self.props.turnOffCursor();
              //      }), 4);
              self.handleSVGClick();
              //console.log("dif2: " + self.state.differentialIsSVGLoaded + " " + self.state.volcanoCursorLoading);
              //self.props.isVolcanoPlotSVGLoaded = false;
              //self.handleSVGClick();
              // self.setState({ differentialIsSVGLoaded: false });
              // self.setState({ differentialIsSVGLoaded: true });
              //debugger;
              //const overlay = d3.selectAll("overlay");
              //overlay.style("cursor", "pointer");
            }}
            //onClick={() => this.handleSVGClick()}
          >
            <g className="volcanoPlotD3BrushSelection" />
            {yAxis}
            {xAxis}
            {/*X Axis Label*/}
            <text
              className="volcanoAxisLabel NoSelect"
              x={volcanoWidth * 0.5 + 10}
              y={this.getXLabelPosY(xAxisLabelY)}
              fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
              fontSize={this.getLabelSizes()}
            >
              {xAxisText}
            </text>
            {/*Y Axis Label*/}
            <text
              className="volcanoAxisLabel NoSelect"
              textAnchor="middle"
              transform={`rotate(-90,20,${volcanoHeight * 0.5 + 20})`}
              x="60"
              y={`${volcanoHeight * 0.5 + 20}`}
              fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
              fontSize={this.getLabelSizes()}
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
            {volcanoCircleText}
          </svg>
        </>
      );
    } else {
      return null;
    }
  }
}
export default DifferentialVolcanoPlot;
