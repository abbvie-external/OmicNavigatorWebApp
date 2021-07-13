import React from 'react';
import _ from 'lodash';
import './DifferentialVolcanoPlot.scss';
import * as d3 from 'd3';
import * as hexbin from 'd3-hexbin';
import ButtonActions from '../Shared/ButtonActions';

class DifferentialVolcanoPlot extends React.PureComponent {
  plotCirclesSorted = [];
  differentialResults = [];
  circles = [];
  bins = [];
  hexbin = hexbin.hexbin();
  objsBrush = {};

  state = {
    hoveredElement: 'bin' || 'circle',
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
    // sortedCircles: [],
    bins: [],
    loading: false,
    circles: [],
    showCircles: true,
    showBins: true,
    isBinClicked: false,
    clickedBin: null,
    xxAxis: '',
    yyAxis: '',
    currentResults: [],
    clickedElements: [],
  };

  componentDidMount() {
    window.addEventListener('resize', this.debouncedResizeListener);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResizeListener);
  }

  debouncedResizeListener = () => {
    let resizedFn;
    clearTimeout(resizedFn);
    resizedFn = _.debounce(() => {
      this.windowResized();
    }, 200);
  };

  setupVolcano() {
    const {
      volcanoHeight,
      volcanoWidth,
      doXAxisTransformation,
      xAxisLabel,
      doYAxisTransformation,
      yAxisLabel,
      differentialResultsUnfiltered,
    } = this.props;
    const { xScale, yScale } = this.scaleFactory(differentialResultsUnfiltered);

    this.xxAxis = d3.axisTop(xScale).ticks();
    this.yyAxis = d3.axisRight(yScale).ticks();

    const svg = d3
      .select('#volcano')
      .append('svg')
      .attr('width', volcanoWidth + 50)
      .attr('height', volcanoHeight + 20)
      .attr('id', 'VolcanoChart')
      .attr('class', 'VolcanoPlotSVG')
      .on('click', () => this.handleSVGClick());

    svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', volcanoWidth + 50)
      .attr('height', volcanoHeight + 20)
      .attr('x', 0)
      .attr('y', -15);

    var area = svg
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .attr('id', 'clip-path');

    d3.select('#clip-path')
      .append('g')
      .attr('class', 'volcanoPlotD3BrushSelection')
      .attr('fill', 'none');

    area.append('g').attr('id', 'filtered-elements');
    area.append('g').attr('id', 'nonfiltered-elements');

    d3.select('#VolcanoChart')
      .append('g')
      .attr('class', 'volcanoPlotXAxis NoSelect')
      .attr('id', 'yaxis-line')
      .attr('transform', 'translate(30, 0)')
      .call(this.yyAxis);

    d3.select('#VolcanoChart')
      .append('text')
      .attr('class', 'volcanoAxisLabel NoSelect')
      .attr('textAnchor', 'middle')
      .attr('transform', `rotate(-90,20,${volcanoHeight * 0.5 + 20})`)
      .attr('x', 60)
      .attr('y', `${volcanoHeight * 0.5 + 20}`)
      .attr('font-size', '18px')
      .style(
        'font-family',
        'Lato, Helvetica Neue, Arial, Helvetica, sans-serif',
      )
      .text(function() {
        return doYAxisTransformation ? '-log(' + yAxisLabel + ')' : yAxisLabel;
      });

    d3.select('#VolcanoChart')
      .append('g')
      .attr('class', 'volcanoPlotXAxis NoSelect')
      .attr('id', 'xaxis-line')
      .attr('transform', 'translate(0,' + (volcanoHeight - 25) + ')')
      .call(this.xxAxis);

    d3.select('#VolcanoChart')
      .append('text')
      .attr('class', 'volcanoAxisLabel NoSelect')
      .attr('x', volcanoWidth * 0.5 + 10)
      .attr('y', volcanoHeight - 5)
      .attr('font-size', '18px')
      .style(
        'font-family',
        'Lato, Helvetica Neue, Arial, Helvetica, sans-serif',
      )
      .text(function() {
        return doXAxisTransformation ? '-log(' + xAxisLabel + ')' : xAxisLabel;
      });

    svg.on('dblclick', () => {
      this.transitionZoom(differentialResultsUnfiltered, false);
      this.setState({
        clickedElements: [],
      });
    });
  }

  hexBinning(data) {
    const { volcanoWidth, volcanoHeight, differentialResults } = this.props;

    if (data.length > 2500) {
      const { xScale, yScale } = this.scaleFactory(data);
      const { bins, circles } = this.parseDataToBinsAndCircles(
        data,
        xScale,
        yScale,
      );

      this.bins = bins;
      this.circles = circles;

      this.renderBins(bins);
      this.renderCircles(circles);

      let volcanoState = {
        volcanoCircleText: this.props.volcanoCircleText,
        previousResult: data,
        currentResults: data,
        circles: circles,
        bins: bins,
      };

      this.setState({ ...volcanoState });
    } else {
      this.scaleFactory(data);

      this.renderCircles(data);

      let volcanoState = {
        volcanoCircleText: this.props.volcanoCircleText,
        currentResults: data,
        circles: data,
        bins: [],
      };
      this.setState({ ...volcanoState });
    }
    this.props.onHandleVolcanoCurrentState(data);
    this.setupBrush(volcanoWidth, volcanoHeight);

    this.props.onHandleUpdateDifferentialResults(differentialResults);
  }

  determineBinColor(binArray, length) {
    const color = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(binArray, d => d.length) / 5]);

    return color(length);
  }

  parseDataToBinsAndCircles(data, xScale, yScale) {
    const { xAxisLabel, yAxisLabel } = this.props;

    const hexb = hexbin
      .hexbin()
      .x(d => xScale(this.doTransform(d[xAxisLabel], 'x')))
      .y(d => yScale(this.doTransform(d[yAxisLabel], 'y')))
      .radius(5);

    let bins = [];
    bins = hexb(data);

    var circ = [];
    var b = [];

    bins.forEach((bin, index) => {
      if (bin.length <= 5) {
        circ.push(...bin.flatMap(b => b));
      } else {
        b.push(bin);
      }
    });

    return { bins: b, circles: circ };
  }

  renderBinsFilter(bins) {
    const svg = d3.select('#filtered-elements');

    svg
      .selectAll('path')
      .data(bins)
      .enter()
      .append('path')
      .attr('stroke', '#aab1c0')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1)
      .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(5)}`)
      .attr('fill', d => '#E0E1E2');
  }

  renderBins(bins) {
    if (d3.select('#nonfiltered-elements').size() !== 0) {
      const svg = d3.select('#nonfiltered-elements');
      svg
        .selectAll('path')
        .data(bins)
        .enter()
        .append('path')
        .attr('stroke', '#000')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1)
        .attr('class', 'bin')
        .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(5)}`)
        .attr('fill', d => this.determineBinColor(bins, d.length))
        .attr('id', d => `path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`)
        .attr('cursor', 'pointer')
        .on('mouseenter', d => {
          this.handleBinHover(d);
        })
        .on('mouseleave', d => {
          this.handleBinLeave(d, bins);
          d3.select('#tooltip').remove();
        })
        .on('click', (item, index) => {
          d3.event.stopPropagation();
          if (!d3.event.metaKey && !d3.event.ctrlKey) {
            d3.select('#tooltip').remove();
            d3.select('#nonfiltered-elements')
              .selectAll('circle')
              .remove();
            let circles = [...this.state.circles, ...item];
            this.renderCircles(circles);
            this.setState({
              circles: circles,
            });

            d3.select(
              `#path-${Math.ceil(item.x)}-${Math.ceil(item.y)}-${item.length}`,
            ).remove();
          }
        });
    }
  }
  renderCirclesFilter(circles) {
    const {
      differentialResultsUnfiltered,
      identifier,
      xAxisLabel,
      yAxisLabel,
    } = this.props;
    const { xScale, yScale } = this.scaleFactory(
      this.state.currentResults.length > 0
        ? this.state.currentResults
        : differentialResultsUnfiltered,
    );

    const svg = d3.select('#filtered-elements');
    svg
      .selectAll('circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('cx', d => `${xScale(this.doTransform(d[xAxisLabel], 'x'))}`)
      .attr('cy', d => `${yScale(this.doTransform(d[yAxisLabel], 'y'))}`)
      .attr('fill', '#E0E1E2')
      .attr('r', 2)
      .attr('stroke', '#aab1c0')
      .attr('strokeWidth', 0.4)
      .attr('class', 'volcanoPlot-dataPoint')
      .attr('circleid', d => `${d[identifier]}`)
      .attr('key', (d, index) => `${d[identifier]}_${index}`)
      .attr('data', d => JSON.stringify(d))
      .attr('ystatistic', d => `${this.doTransform(d[yAxisLabel], 'y')}`)
      .attr('xstatistic', d => `${this.doTransform(d[xAxisLabel], 'x')}`);
  }

  renderCircles = circles => {
    const {
      differentialResultsUnfiltered,
      identifier,
      xAxisLabel,
      yAxisLabel,
      differentialFeatureIdKey,
    } = this.props;
    const { xScale, yScale } = this.scaleFactory(
      this.state.currentResults.length > 0
        ? this.state.currentResults
        : differentialResultsUnfiltered,
    );

    if (d3.select('#nonfiltered-elements').size() !== 0) {
      const svg = d3.select('#nonfiltered-elements');
      svg
        .selectAll('circle')
        .data(circles)
        .enter()
        .append('circle')
        .attr('cx', d => `${xScale(this.doTransform(d[xAxisLabel], 'x'))}`)
        .attr('cy', d => `${yScale(this.doTransform(d[yAxisLabel], 'y'))}`)
        .attr('fill', '#1678c2')
        .attr('r', 2)
        .attr('stroke', '#000')
        .attr('strokeWidth', 0.4)
        .attr('class', 'volcanoPlot-dataPoint')
        .attr('id', d => `volcanoDataPoint-${d[identifier]}`)
        .attr('circleid', d => `${d[identifier]}`)
        .attr('key', (d, index) => `${d[identifier]}_${index}`)
        .attr('data', d => JSON.stringify(d))
        .attr('ystatistic', d => `${this.doTransform(d[yAxisLabel], 'y')}`)
        .attr('xstatistic', d => `${this.doTransform(d[xAxisLabel], 'x')}`)
        .attr('cursor', 'pointer')
        .on('mouseenter', e => {
          this.handleCircleHover(e);
        })
        .on('mouseleave', e => {
          this.handleCircleLeave(e);
          d3.select('#tooltip').remove();
        })
        .on('click', e => {
          d3.select('#tooltip').remove();
          d3.event.stopPropagation();
          const elem = d3.select(
            `circle[id='volcanoDataPoint-${e[identifier]}`,
          );

          if (d3.event.metaKey || d3.event.ctrlKey) {
            const { yAxisLabel } = this.props;

            if (
              elem.attr('class').endsWith('highlighted') ||
              elem.attr('class').endsWith('highlightedMax')
            ) {
              let elemData = JSON.parse(
                elem._groups[0][0].attributes.data.value,
              );

              let clickedElems = [
                ...this.state.clickedElements.filter(
                  elem =>
                    elem[differentialFeatureIdKey] !==
                    elemData[differentialFeatureIdKey],
                ),
              ];
              this.props.onHandleDotClick(e, clickedElems, 0);

              this.setState({
                clickedElements: clickedElems,
              });
            } else {
              let clickedElems = [
                ...this.state.clickedElements,
                ...[elem._groups[0][0]],
              ]
                .map(elem =>
                  elem.attributes
                    ? JSON.parse(elem.attributes.data.value)
                    : elem,
                )
                .sort(
                  (a, b) =>
                    this.doTransform(b[yAxisLabel], 'y') -
                    this.doTransform(a[yAxisLabel], 'y'),
                );
              this.props.onHandleDotClick(e, clickedElems, 0);

              this.setState({
                clickedElements: clickedElems,
              });
            }
          } else {
            this.props.onHandleDotClick(
              e,
              [JSON.parse(elem._groups[0][0].attributes.data.value)],
              0,
            );
            this.setState({
              clickedElements: [elem._groups[0][0]],
            });
          }
        });
      this.highlightBrushedCircles();
    }
  };

  scaleFactory(scaleData) {
    const { volcanoWidth, volcanoHeight, xAxisLabel, yAxisLabel } = this.props;

    var xMM = this.props.getMaxAndMin(scaleData, xAxisLabel);
    var yMM = this.props.getMaxAndMin(scaleData, yAxisLabel);
    xMM = [this.doTransform(xMM[0], 'x'), this.doTransform(xMM[1], 'x')];
    yMM = [this.doTransform(yMM[0], 'y'), this.doTransform(yMM[1], 'y')];

    const xScale = d3
      .scaleLinear()
      .domain([Math.min(...xMM), Math.max(...xMM)])
      .range([64, volcanoWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...yMM), Math.max(...yMM)])
      .range([volcanoHeight - 54, 10]);

    return {
      xScale: xScale,
      yScale: yScale,
      xMax: Math.max(...xMM),
      xMin: Math.min(...xMM),
      yMax: Math.max(...yMM),
      yMin: Math.min(...yMM),
    };
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
      isFilteredDifferential,
      isDataStreamingResultsTable,
      differentialResultsUnfiltered,
      HighlightedFeaturesArrVolcano,
      volcanoPlotsVisible,
    } = this.props;

    // this if/else if/else if statement in place to minimize re-renders - should cover all situations
    if (
      !isDataStreamingResultsTable &&
      volcanoPlotsVisible &&
      volcanoPlotsVisible !== prevProps.volcanoPlotsVisible
    ) {
      // user opens volcano plot any time after data finishes streaming
      let currentData =
        this.state.currentResults.length > 0
          ? this.state.currentResults
          : differentialResultsUnfiltered;
      d3.select('#VolcanoChart').remove();
      this.setupVolcano();
      this.hexBinning(differentialResultsUnfiltered);
      this.transitionZoom(currentData, false);
    } else if (
      !isDataStreamingResultsTable &&
      volcanoPlotsVisible &&
      (prevProps.xAxisLabel !== xAxisLabel ||
        prevProps.yAxisLabel !== yAxisLabel ||
        prevProps.doXAxisTransformation !== doXAxisTransformation ||
        prevProps.doYAxisTransformation !== doYAxisTransformation ||
        prevProps.volcanoHeight !== volcanoHeight ||
        prevProps.volcanoWidth !== volcanoWidth)
    ) {
      // volcano plot is open, user changes axis or height/widht (visible only whe volcano plot is open)
      d3.select('#VolcanoChart').remove();
      this.setupVolcano();
      this.hexBinning(this.state.currentResults);
      this.transitionZoom(this.state.currentResults, false);
    } else if (
      (volcanoPlotsVisible &&
        prevProps.isFilteredDifferential &&
        !isFilteredDifferential) ||
      (prevProps.isUpsetVisible && !this.props.isUpsetVisible)
    ) {
      // volcano plot is open, and set analysis "filter" is clicked OR set analysis is toggled off
      let currentData =
        this.state.currentResults.length > 0
          ? this.state.currentResults
          : differentialResultsUnfiltered;
      if (volcanoPlotsVisible) this.transitionZoom(currentData, false);
    }

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
        HighlightedFeaturesArrVolcano?.length > 0 &&
        this.state.brushedRawData == null)
    ) {
      const elems = HighlightedFeaturesArrVolcano.map(elem => {
        const el = document.getElementById(`volcanoDataPoint-${elem.key}`);
        return el ? d3.select(el)._groups[0][0] : null;
      }).filter(elem => elem);

      if (elems[0]) {
        this.handleBrushedText({ _groups: [elems] });
      } else {
        if (d3.select('#nonfiltered-elements').size() !== 0) {
          d3.select('#nonfiltered-elements')
            .selectAll('text')
            .remove();
        }
      }
    }

    if (
      !_.isEqual(
        _.sortBy(volcanoDifferentialTableRowOther),
        _.sortBy(prevProps.volcanoDifferentialTableRowOther),
      ) ||
      volcanoDifferentialTableRowMax !==
        prevProps.volcanoDifferentialTableRowMax
    ) {
      this.highlightBrushedCircles();
      this.props.onPageToFeature(volcanoDifferentialTableRowMax);
    }
  }

  getCircleOrBin = key => {
    const el = document.getElementById(`volcanoDataPoint-${key}`);
    if (el) {
      return { element: d3.select(el)._groups[0][0], type: 'circle' };
    } else {
      const { identifier } = this.props;
      const bin = this.state.bins.find(bin => {
        return bin.some(b => b[identifier] === key);
      });
      if (bin && bin.x && bin.y && bin.length) {
        return {
          element: d3.select(
            `#path-${Math.ceil(bin.x)}-${Math.ceil(bin.y)}-${bin.length}`,
          )._groups[0][0],
          type: 'bin',
        };
      } else return null;
    }
  };

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
    d3.select('#VolcanoChart').remove();
    this.setupVolcano();
    this.hexBinning(this.state.currentResults);
    this.transitionZoom(this.state.currentResults, false);
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
      // .attr('style', 'fill: #1678c2')
      // .attr('r', 2)
      .classed('highlighted', false)
      .classed('highlightedMax', false);

    this.setState({
      brushedRawData: null,
    });
  };

  highlightBrushedCircles = () => {
    const {
      volcanoDifferentialTableRowMax,
      volcanoDifferentialTableRowOther,
    } = this.props;
    if (d3.select('#nonfiltered-elements').size() !== 0) {
      if (
        !volcanoDifferentialTableRowMax?.length &&
        !volcanoDifferentialTableRowOther?.length
      ) {
        d3.select('#nonfiltered-elements')
          .selectAll('text')
          .remove();
      }

      // set circles back to default
      d3.select('#nonfiltered-elements')
        .selectAll('circle')
        .attr('style', 'fill: #1678c2')
        .attr('stroke', '#000')
        .attr('r', 2)
        .classed('highlighted', false)
        .classed('highlightedMax', false);
    }

    // set bins back to white
    d3.select('#nonfiltered-elements')
      .selectAll('path')
      .attr('fill', 'white')
      .attr('stroke', '#000')
      .attr('class', 'bin')
      .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(5)}`);
    // determine new bin color
    d3.select('#nonfiltered-elements')
      .selectAll('path')
      .attr('fill', d => this.determineBinColor(this.state.bins, d.length));

    if (volcanoDifferentialTableRowOther?.length > 0) {
      volcanoDifferentialTableRowOther.forEach(element => {
        // style all highlighted circles
        const highlightedCircleId = this.getCircleOrBin(element);
        const highlightedCircle = d3.select(highlightedCircleId?.element);
        if (highlightedCircle != null) {
          if (highlightedCircleId?.type === 'circle') {
            highlightedCircle.attr('r', 4);
            highlightedCircle
              .attr('style', 'fill: #ff7e05')
              .classed('highlighted', true);
            highlightedCircle.attr('r', 5);
            highlightedCircle.classed('highlighted', true);
            highlightedCircle.raise();
          } else {
            highlightedCircle
              .attr('fill', '#ff7e05')
              .classed('highlighted', true);
            highlightedCircle.attr('stroke', '#ff7e05');
            highlightedCircle.attr('stroke-width', '#ff7e05');
            highlightedCircle.classed('highlighted', true);
            highlightedCircle.raise();
          }
        }
      });
    }
    if (volcanoDifferentialTableRowMax?.length > 0) {
      // style max highlighted circle
      const maxCircleId = this.getCircleOrBin(volcanoDifferentialTableRowMax);
      if (maxCircleId) {
        const maxCircle = d3.select(maxCircleId.element);
        if (maxCircle != null) {
          if (maxCircleId.type === 'circle') {
            maxCircle
              .attr('style', 'fill: #ff4400')
              .classed('highlightedMax', true);
            maxCircle.attr('r', 5);
            maxCircle.classed('highlightedMax', true);
            maxCircle.raise();
          } else {
            maxCircle.attr('fill', '#ff4400').classed('highlightedMax', true);
            maxCircle.attr('stroke', '#000');
            maxCircle.attr('stroke-width', 1);
            maxCircle.attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(7)}`);
            maxCircle.classed('highlightedMax', true);
            maxCircle.raise();
          }
        }
      }
    }
  };

  handleBinHover = d => {
    if (!this.state.brushing) {
      const bin = d3.select(
        `#path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`,
      );
      const binClass = bin.attr('class');

      if (binClass.endsWith('highlightedMax')) {
        bin.attr('stroke', '#000');
        bin.attr('stroke-width', 1);
        bin.attr('fill', '#ff4400');
        bin.attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(8)}`);
        bin.raise();
      } else if (binClass.endsWith('highlighted')) {
        bin.attr('stroke', '#000');
        bin.attr('stroke-width', 1);
        bin.attr('fill', '#ff7e05');
        bin.attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(8)}`);
        bin.raise();
      } else {
        bin
          .attr('fill', '#1678c2')
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
          .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(7)}`)
          .raise();
      }

      this.setState({
        hoveredBin: d,
        hoveredElement: 'bin',
        hovering: true,
      });

      this.getToolTip();
    }
  };

  handleCircleHover = e => {
    const elem = d3.select(
      `circle[id='volcanoDataPoint-${e[this.props.identifier]}`,
    )._groups[0][0];
    if (!this.state.brushing) {
      const hoveredData = {
        id: elem.attributes['circleid'].value,
        xstat: elem.attributes['xstatistic'].value,
        ystat: elem.attributes['ystatistic'].value,
        position: [elem.attributes['cx'].value, elem.attributes['cy'].value],
      };
      const hoveredElement = `volcanoDataPoint-${elem.attributes['circleid'].value}`;
      const hoveredId = `#volcanoDataPoint-${elem.attributes['circleid'].value}`;
      const hovered = document.getElementById(hoveredElement);
      if (hovered != null) {
        const circle = d3.select(hovered) ?? null;
        if (circle != null) {
          circle.attr('r', 6);
          circle.raise();
          this.setState({
            hoveredElement: 'circle',
            hoveredCircleData: hoveredData,
            hoveredCircleId: hoveredId || null,
            hoveredCircleElement: hoveredElement,
            hovering: true,
          });
        }
      }

      this.getToolTip();
    }
  };
  handleCircleLeave(e) {
    d3.selectAll('circle.volcanoPlot-dataPoint').classed('hovered', false);
    const hovered = document.getElementById(this.state.hoveredCircleElement);
    if (hovered != null) {
      const hoveredCircle =
        d3.select(`circle[id='volcanoDataPoint-${e[this.props.identifier]}`)
          ._groups[0][0] ?? null;
      if (hoveredCircle != null) {
        if (
          hoveredCircle.attributes['class'].value.endsWith('highlightedMax')
        ) {
          hoveredCircle.attributes['r'].value = 5;
        } else if (
          hoveredCircle.attributes['class'].value.endsWith('highlighted')
        ) {
          hoveredCircle.attributes['r'].value = 4;
        } else {
          hoveredCircle.attributes['r'].value = 2;
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
  handleBinLeave = (d, bins) => {
    const bin = d3.select(
      `#path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`,
    );
    const binClass = bin.attr('class');

    if (binClass.endsWith('highlightedMax')) {
      bin.attr('stroke', '#000');
      bin.attr('stroke-width', 1);
      bin.attr('fill', '#ff4400');
      bin.attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(7)}`);
    } else if (binClass.endsWith('highlighted')) {
      bin.attr('stroke', '#000');
      bin.attr('stroke-width', 1);
      bin.attr('fill', '#ff7e05');
      bin.attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(7)}`);
    } else {
      bin
        .attr('fill', d => this.determineBinColor(bins, d.length))
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(5)}`);
    }
    this.setState({
      hovering: false,
    });
  };
  getToolTip() {
    const {
      hoveredCircleData,
      hovering,
      hoveredElement,
      hoveredBin,
    } = this.state;
    const {
      xAxisLabel,
      yAxisLabel,
      identifier,
      doXAxisTransformation,
      doYAxisTransformation,
    } = this.props;

    const clipPathHeight =
      d3
        .select('#clip-path')
        .node()
        .getBBox().height - 40;

    const clipPathWidth =
      d3
        .select('#clip-path')
        .node()
        .getBBox().width - 47;

    if (hovering) {
      if (hoveredElement === 'bin') {
        const bin = hoveredBin;
        const tooltipHeight = clipPathHeight - (bin.y * 1 + 10);
        const tooltipWidth = bin.x * 1 + 200;
        const xstat = bin
          .map(circle => this.doTransform(circle[xAxisLabel], 'x'))
          .reduce((reducer, stat) => reducer + stat);

        const ystat = bin
          .map(circle => this.doTransform(circle[yAxisLabel], 'y'))
          .reduce((reducer, stat) => reducer + stat);

        const xText = doXAxisTransformation
          ? 'Avg -log(' +
            xAxisLabel +
            '): ' +
            parseFloat(xstat / bin.length).toFixed(4)
          : 'Avg ' +
            xAxisLabel +
            ': ' +
            parseFloat(xstat / bin.length).toFixed(4);
        const yText = doYAxisTransformation
          ? 'Avg -log(' +
            yAxisLabel +
            '): ' +
            parseFloat(ystat / bin.length).toFixed(4)
          : 'Avg ' +
            yAxisLabel +
            ': ' +
            parseFloat(ystat / bin.length).toFixed(4);
        if (d3.select('#nonfiltered-elements').size() !== 0) {
          d3.select('#nonfiltered-elements')
            .append('svg')
            .attr('width', 200)
            .attr('height', 75)
            .attr(
              'x',
              bin.x >= 240
                ? tooltipWidth >= clipPathWidth
                  ? bin.x * 1 - (tooltipWidth - clipPathWidth - 20)
                  : bin.x * 1 - 170
                : bin.x * 1 + 15,
            )
            .attr('y', tooltipHeight <= 110 ? bin.y * 1 - 85 : bin.y * 1 + 10)
            .attr('id', 'tooltip')
            .attr('class', 'NoSelect')
            .append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#ff4400')
            .attr('rx', '5')
            .attr('ry', '5');
        }

        d3.select('#tooltip')
          .append('rect')
          .attr('width', '100%')
          .attr('height', '96%')
          .attr('fill', '#2e2e2e')
          .attr('stroke', '#000')
          .attr('rx', '3')
          .attr('ry', '3');

        d3.select('#tooltip')
          .append('text')
          .attr('fontSize', '13px')
          .attr('fill', '#FFF')
          .attr(
            'fontFamily',
            'Lato, Helvetica Neue, Arial, Helvetica, sans-serif',
          )
          .attr('textAnchor', 'left')
          .insert('tspan')
          .attr('x', 15)
          .attr('y', 23)
          .text(`Total features: ${bin.length}`)
          .insert('tspan')
          .attr('x', 15)
          .attr('y', 23 + 16)
          .text(xText)
          .insert('tspan')
          .attr('x', 15)
          .attr('y', 23 + 16 * 2)
          .text(yText);
      } else if (hoveredElement === 'circle') {
        const idText = identifier + ': ' + hoveredCircleData.id;
        const tooltipHeight =
          clipPathHeight - (hoveredCircleData.position[1] * 1 + 10);
        const tooltipWidth = hoveredCircleData.position[0] * 1 + 200;
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
        if (d3.select('#nonfiltered-elements').size() !== 0) {
          d3.select('#nonfiltered-elements')
            .append('svg')
            .attr('width', 200)
            .attr('height', 75)
            .attr(
              'x',
              hoveredCircleData.position[0] >= 240
                ? tooltipWidth >= clipPathWidth
                  ? hoveredCircleData.position[0] * 1 -
                    (tooltipWidth - clipPathWidth - 40)
                  : hoveredCircleData.position[0] * 1 - 170
                : hoveredCircleData.position[0] * 1 + 15,
            )
            .attr(
              'y',
              tooltipHeight <= 110
                ? hoveredCircleData.position[1] * 1 - 85
                : hoveredCircleData.position[1] * 1 + 10,
            )
            .attr('id', 'tooltip')
            .attr('class', 'NoSelect')
            .append('rect')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', '#ff4400')
            .attr('rx', '5')
            .attr('ry', '5');
        }

        d3.select('#tooltip')
          .append('rect')
          .attr('width', '100%')
          .attr('height', '96%')
          .attr('fill', '#2e2e2e')
          .attr('stroke', '#000')
          .attr('rx', '3')
          .attr('ry', '3');

        d3.select('#tooltip')
          .append('text')
          .attr('fontSize', '13px')
          .attr('fill', '#FFF')
          .attr(
            'fontFamily',
            'Lato, Helvetica Neue, Arial, Helvetica, sans-serif',
          )
          .attr('textAnchor', 'left')
          .insert('tspan')
          .attr('x', 15)
          .attr('y', 23)
          .text(idText)
          .insert('tspan')
          .attr('x', 15)
          .attr('y', 23 + 16)
          .text(xText)
          .insert('tspan')
          .attr('x', 15)
          .attr('y', 23 + 16 * 2)
          .text(yText);
      }
    } else {
      return null;
    }
  }

  updateVolcanoAfterUpsetFilter(data, xScale, yScale, clearHighlightedData) {
    const self = this;
    const {
      differentialResults,
      isUpsetVisible,
      differentialFeatureIdKey,
    } = self.props;

    d3.select('#clip-path')
      .selectAll('path')
      .remove();

    d3.select('#clip-path')
      .selectAll('circle')
      .remove();

    if (d3.select('#nonfiltered-elements').size() !== 0) {
      d3.select('#nonfiltered-elements')
        .selectAll('text')
        .remove();
    }

    if (isUpsetVisible) {
      const filteredElements = _.differenceBy(
        data,
        differentialResults,
        differentialFeatureIdKey,
      );

      const unfilteredObject = self.parseDataToBinsAndCircles(
        filteredElements,
        xScale,
        yScale,
      );

      const elementsToDisplay = _.uniqBy(
        _.differenceBy(data, filteredElements, differentialFeatureIdKey),
        differentialFeatureIdKey,
      );

      const filteredObject = self.parseDataToBinsAndCircles(
        elementsToDisplay,
        xScale,
        yScale,
      );

      if (data.length >= 2500 && elementsToDisplay.length >= 2500) {
        self.renderCirclesFilter(unfilteredObject.circles);
        self.renderBinsFilter(unfilteredObject.bins);
        self.renderCircles(filteredObject.circles);
        self.renderBins(filteredObject.bins);
      } else if (data.length >= 2500 && elementsToDisplay.length < 2500) {
        self.renderCirclesFilter(unfilteredObject.circles);
        self.renderBinsFilter(unfilteredObject.bins);
        self.renderCircles(elementsToDisplay);
      } else {
        self.renderCirclesFilter(data);
        self.renderCircles(elementsToDisplay);
      }

      self.props.onHandleVolcanoPlotSelectionChange(
        elementsToDisplay,
        clearHighlightedData,
      );
    } else {
      if (data.length >= 2500) {
        const unfilteredObject = self.parseDataToBinsAndCircles(
          data,
          xScale,
          yScale,
        );
        const removeDups = _.uniqBy(
          _.differenceBy(data, unfilteredObject, differentialFeatureIdKey),
          differentialFeatureIdKey,
        );
        const elementsToDisplay = self.parseDataToBinsAndCircles(
          removeDups,
          xScale,
          yScale,
        );
        self.renderCircles(elementsToDisplay.circles);
        self.renderBins(elementsToDisplay.bins);
      } else {
        const elementsToDisplay = _.uniqBy(data, differentialFeatureIdKey);
        self.renderCircles(elementsToDisplay);
      }
      self.props.onHandleVolcanoPlotSelectionChange(data, clearHighlightedData);
    }
  }

  transitionZoom(data, clearHighlightedData) {
    const self = this;
    const { xScale, yScale } = self.scaleFactory(data);

    const unfilteredObject = self.parseDataToBinsAndCircles(
      data,
      xScale,
      yScale,
    );

    this.updateVolcanoAfterUpsetFilter(
      data,
      xScale,
      yScale,
      clearHighlightedData,
    );

    const highlighted = d3
      .select('#nonfiltered-elements')
      .selectAll('[class$=highlighted')
      .attr('cx', function(d) {
        return xScale(self.doTransform(d[self.props.xAxisLabel], 'x'));
      })
      .attr('cy', function(d) {
        return yScale(self.doTransform(d[self.props.yAxisLabel], 'y'));
      });

    const highlightedMax = d3
      .select('#nonfiltered-elements')
      .selectAll('[class$=highlightedMax')
      .attr('cx', function(d) {
        return xScale(self.doTransform(d[self.props.xAxisLabel], 'x'));
      })
      .attr('cy', function(d) {
        return yScale(self.doTransform(d[self.props.yAxisLabel], 'y'));
      });

    const circleLabels = [
      ...highlighted?._groups[0],
      ...highlightedMax?._groups[0],
    ];

    if (!!circleLabels.length) {
      this.handleBrushedText({ _groups: [circleLabels] });

      this.props.onHandleDotClick(
        _,
        circleLabels
          .map(circle => JSON.parse(circle.attributes.data.value))
          .sort(
            (a, b) =>
              this.doTransform(b[this.props.yAxisLabel], 'y') -
              this.doTransform(a[this.props.yAxisLabel], 'y'),
          ),
        0,
      );
    }

    d3.select('#clip-path')
      .selectAll('path')
      .attr('opacity', 0);

    d3.select('.volcanoPlotD3BrushSelection').call(self.objsBrush.move, null);

    self.xxAxis = d3.axisTop(xScale).ticks();
    self.yyAxis = d3.axisRight(yScale).ticks();

    let t = d3
      .select('svg')
      .transition()
      .duration(200);
    d3.select('#xaxis-line')
      .transition(t)
      .call(self.xxAxis);
    d3.select('#yaxis-line')
      .transition(t)
      .call(self.yyAxis);

    const container = d3.select('#clip-path').transition(t);

    const circle = container.selectAll('circle');

    circle
      .transition(t)
      .attr('cx', function(d) {
        return xScale(self.doTransform(d[self.props.xAxisLabel], 'x'));
      })
      .attr('cy', function(d) {
        return yScale(self.doTransform(d[self.props.yAxisLabel], 'y'));
      });

    const bin = container.selectAll('path');

    bin
      .transition(t)
      .delay(100)
      .duration(100)
      .attr('opacity', 1);

    this.props.onHandleVolcanoCurrentState(data);
    self.setState({
      currentResults: data,
      bins: unfilteredObject.bins,
      circles: unfilteredObject.circles,
    });
  }

  setupBrush(width, height) {
    const self = this;
    this.objsBrush = {};

    const brushingStart = function() {
      self.setState({
        brushing: d3.brushSelection(this)?.length > 0 ? true : false,
        hoveredCircleData: {
          position: [],
          id: null,
          xstat: null,
          ystat: null,
        },
      });
    };
    const endBrush = function() {
      if (d3.event.selection != null) {
        const brush = d3.brushSelection(this);

        const isBrushed = function(x, y) {
          const brushTest =
            brush[0][0] <= x &&
            x <= brush[1][0] &&
            brush[0][1] <= y &&
            y <= brush[1][1];
          return brushTest;
        };

        const brushedBins = self.state.bins
          .filter(bin => {
            return isBrushed(bin.x, bin.y);
          })
          .flatMap(elem => elem);

        const circles = d3.selectAll('circle.volcanoPlot-dataPoint');

        const brushedCircles = circles.filter(function() {
          const x = d3.select(this).attr('cx');
          const y = d3.select(this).attr('cy');
          return isBrushed(x, y);
        });

        const brushedDataArr = brushedCircles._groups[0].map(a => {
          return JSON.parse(a.attributes.data.value);
        });

        const total = [...brushedBins, ...brushedDataArr];

        if (!!total.length) {
          self.transitionZoom(total, false);
        }
        d3.select('.volcanoPlotD3BrushSelection').call(
          self.objsBrush.move,
          null,
        );
        self.setState({ brushing: false });
      }
    };

    if (d3.selectAll('.brush').nodes().length > 0) {
      d3.selectAll('.brush').remove();
    }
    self.objsBrush = d3
      .brush()
      .extent([
        [0, -15],
        [width + 50, height + 20],
      ])
      .on('start', brushingStart)
      .on('end', endBrush);
    d3.selectAll('.volcanoPlotD3BrushSelection').call(self.objsBrush);
    const brush = d3
      .select('.volcanoPlotD3BrushSelection')
      .selectAll('rect.selection');
    if (
      brush.nodes().length !== 0 &&
      brush.nodes()[0].getAttribute('x') !== null &&
      (self.state.resizeScalarX !== 1 || self.state.resizeScalarY !== 1)
    ) {
      d3.select('.volcanoPlotD3BrushSelection').call(self.objsBrush.move, [
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
        objsBrushState: self.objsBrush,
      });
    } else {
      d3.select('.volcanoPlotD3BrushSelection').call(self.objsBrush.move, null);
    }
  }

  handleBrushedText = brushed => {
    // MAP brushedDataArr to circle text state
    const brushedCircleTextMapped = brushed?._groups[0].map(a => {
      if (!a || !a.attributes) return null;
      const columnData = JSON.parse(a.attributes['data'].nodeValue);
      const key = this.props.volcanoCircleLabel || 0;
      return {
        data: columnData[key],
        class: a.attributes['class'].nodeValue,
        id: a.attributes['id'].nodeValue,
        cx: a.attributes['cx'].nodeValue,
        cy: a.attributes['cy'].nodeValue,
        // class: a.attributes[1].nodeValue,
        // id: a.attributes[2].nodeValue,
        // cx: a.attributes[10].nodeValue,
        // cy: a.attributes[11].nodeValue,
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
    if (!brushedCircleTextMapped) return;
    const self = this;
    if (d3.select('#nonfiltered-elements').size() !== 0) {
      d3.select('#nonfiltered-elements')
        .selectAll('text')
        .remove();

      // if (d3.select('#nonfiltered-elements').size() !== 0) {
      // console.log(d3.select('#nonfiltered-elements').size());
      d3.select('#nonfiltered-elements')
        .selectAll('text')
        .data(brushedCircleTextMapped)
        .enter()
        .append('text')
        .attr('key', d => {
          if (d) {
            return `volcanoCircleText-${d.id}`;
          }
        })
        .attr('class', 'volcanoCircleTooltipText')
        .attr('transform', d => {
          if (d) {
            if (d.data) {
              //create temporary element to get text width in pixels
              let tempElem = document.createElement('span');
              document.body.appendChild(tempElem);
              tempElem.style.fontSize = `11px`;
              tempElem.style.position = 'absolute';
              tempElem.style.left = -1000;
              tempElem.style.top = -1000;
              tempElem.innerHTML = d.data;
              let width = tempElem.clientWidth;

              //remove temp element
              document.body.removeChild(tempElem);

              const cx =
                width + parseInt(d.cx) > self.props.volcanoWidth
                  ? parseInt(d.cx) - (8 + width)
                  : parseInt(d.cx) + 8;
              const cy = parseInt(d.cy) + 4;
              return `translate(${cx}, ${cy})rotate(0)`;
            }
          }
        })
        .style('font-size', '11px')
        .style('color', '#d3d3')
        .attr('textAnchor', d => {
          if (d) {
            const circleOnLeftSide = d.cx <= self.props.volcanoWidth / 2;
            return circleOnLeftSide ? 'start' : 'end';
          }
        })
        .style(
          'font-family',
          'Lato, Helvetica Neue, Arial, Helvetica, sans-serif',
        )
        .text(d => {
          if (d) {
            return d.data;
          }
        });
    }
    this.props.onUpdateVolcanoLabels(false);
  };

  handleSVGClick() {
    // this.props.onHandleVolcanoTableLoading(true);
    // this.unhighlightBrushedCircles();
    // this.props.onHandleVolcanoPlotSelectionChange(
    //   this.state.currentResults,
    //   true,
    // );
    // this.setState({
    //   brushing: false,
    //   resizeScalarX: 1,
    //   resizeScalarY: 1,
    //   volcanoCircleText: [],
    // });
    this.setState({
      clickedElements: [],
    });
    this.props.onHandleSelectedVolcano([]);
  }

  getXAxisLabelY(volcanoHeight) {
    if (volcanoHeight < 300) {
      return volcanoHeight - 19;
    } else if (volcanoHeight > 500) {
      return volcanoHeight - 10;
    } else return volcanoHeight - 15;
  }

  render() {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      xAxisLabel,
      yAxisLabel,
      identifier,
    } = this.props;

    const { volcanoCircleText } = this.state;

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
          <div id="volcano">{volcanoCircleText}</div>
        </>
      );
    } else {
      return null;
    }
  }
}
export default DifferentialVolcanoPlot;
