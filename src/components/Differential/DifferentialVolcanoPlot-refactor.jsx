import React, { Component } from 'react';
import _, { filter } from 'lodash';
import './DifferentialVolcanoPlot.scss';
import { Step, Loader, Button, Breadcrumb } from 'semantic-ui-react';
import * as d3 from 'd3';
import * as hexbin from 'd3-hexbin';
import ButtonActions from '../Shared/ButtonActions';
import { pointer } from 'd3';

class DifferentialVolcanoPlot extends React.PureComponent {
  plotCirclesSorted = [];
  // differentialResultsUnfiltered = [];
  differentialResults = [];
  // differentialResultsUpsetFiltered = [];
  circles = [];
  bins = [];
  hexbin = hexbin.hexbin();

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
    zoom: { history: [], activeIndex: 0, historyLastViewed: {} },
    loading: false,
    circles: [],
    filterState: {},
    showCircles: true,
    showBins: true,
    isBinClicked: false,
    clickedBin: null,
  };

  componentDidMount() {
    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.windowResized();
      }, 200);
    });

    // this.hexBinning(this.createCircleElements(this.differentialResults));
    this.hexBinning(this.differentialResults);
  }

  setLastViewed = (obj, data, breadCrumbIndex) => {
    let newObj = Object.assign(obj, {
      [breadCrumbIndex]: data,
    });
    return newObj;
  };

  hexBinning(data, breadCrumb = false, breadCrumbIndex = 0, reset = false) {
    // const results = data.map(elem => JSON.parse(elem.props.data));
    // d3.select('#hexagon-container').remove();
    const {
      volcanoWidth,
      volcanoHeight,
      // xAxisLabel,
      // yAxisLabel,
      // identifier,
    } = this.props;

    // const width = volcanoWidth;
    // const height = volcanoHeight;

    if (data.length > 5000) {
      // const {
      //   volcanoWidth,
      //   volcanoHeight,
      //   xAxisLabel,
      //   yAxisLabel,
      //   identifier,
      // } = this.props;

      // const width = volcanoWidth;
      // const height = volcanoHeight;

      // const svg = d3.select('svg');

      // const results = data.map(elem => JSON.parse(elem.props.data));

      // var xMM = this.props.getMaxAndMin(results, xAxisLabel);
      // var yMM = this.props.getMaxAndMin(results, yAxisLabel);
      // xMM = [this.doTransform(xMM[0], 'x'), this.doTransform(xMM[1], 'x')];
      // yMM = [this.doTransform(yMM[0], 'y'), this.doTransform(yMM[1], 'y')];

      // const xScale = d3
      //   .scaleLinear()
      //   .domain([Math.min(...xMM), Math.max(...xMM)])
      //   .range([64, volcanoWidth]);

      // const yScale = d3
      //   .scaleLinear()
      //   .domain([Math.min(...yMM), Math.max(...yMM)])
      //   // .range([volcanoHeight * 0.79, 10]);
      //   .range([volcanoHeight - 54, 10]);

      // const plotCircles = results.map((val, index) => (
      //   <circle
      //     // r={this.getRadius(val[this.props.differentialFeatureIdKey])}
      //     r={2}
      //     className="volcanoPlot-dataPoint"
      //     id={`volcanoDataPoint-${val[identifier]}`}
      //     circleid={`${val[identifier]}`}
      //     key={`${val[identifier] + '_' + index}`}
      //     data={`${JSON.stringify(val)}`}
      //     stroke={'#000'}
      //     strokeWidth={0.4}
      //     fill={'#1678c2'}
      //     onMouseEnter={e => this.handleCircleHover(e)}
      //     onMouseLeave={() => this.handleCircleLeave()}
      //     onClick={e =>
      //       this.props.onHandleDotClick(
      //         e,
      //         JSON.parse(e.target.attributes.data.value),
      //         0,
      //       )
      //     }
      //     xstatistic={`${this.doTransform(val[xAxisLabel], 'x')}`}
      //     ystatistic={`${this.doTransform(val[yAxisLabel], 'y')}`}
      //     cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
      //     cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
      //     cursor="pointer"
      //   ></circle>
      // ));

      // this.plotCirclesSorted = plotCircles.sort(
      //   (a, b) => a.props.cx - b.props.cx,
      // );

      // this.plotCirclesSorted = this.createCircleElements(
      //   data,
      //   breadCrumb,
      //   !breadCrumb ? this.state.zoom.history.length : breadCrumbIndex,
      // );

      // const hexb = hexbin
      //   .hexbin()
      //   .x(d => d.props.cx)
      //   .y(d => d.props.cy)
      //   .size({ volcanoWidth, volcanoHeight })
      //   .radius(5);
      // // .radius((2 * width) / (height - 1));

      // let bins = [];
      const { bins, circles } = this.parseDataToBinsAndCircles(data);

      this.bins = bins;
      this.circles = circles;

      this.renderBins(bins);
      this.renderCircles(circles);

      // var circ = [];
      // var b = [];

      // bins.forEach((bin, index) => {
      //   if (bin.length <= 5) {
      //     circ.push(...bin.flatMap(b => b));
      //   } else {
      //     b.push(bin);
      //   }
      // });

      // console.log('circles', circ);
      // console.log('bins', b);

      // this.circles = circ;

      // const color = d3
      //   .scaleSequential(d3.interpolateBlues)
      //   .domain([0, d3.max(bins, d => d.length) / 5]);

      // svg
      //   .append('g')
      //   .attr('stroke', '#000')
      //   .attr('stroke-opacity', 1)
      //   .attr('stroke-width', 1)
      //   .attr('id', 'hexagon-container')
      //   .selectAll('path')
      //   .data(bins)
      //   .join('path')
      //   .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(5)}`)
      //   .attr('fill', d => this.determineBinColor(bins, d.length))
      //   .attr('id', d => `path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`)
      //   .on('mouseenter', d => {
      //     d3.select(`#path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`)
      //       .attr('stroke', '#00aeff')
      //       .attr('fill', '#00aeff')
      //       .attr('cursor', 'pointer')
      //       .attr('stroke-width', 5)
      //       .raise();

      //     this.setState({
      //       hoveredBin: d,
      //       hoveredElement: 'bin',
      //       // hoveredCircleData: hoveredData,
      //       // hoveredCircleId: hoveredId || null,
      //       // hoveredCircleElement: hoveredElement,
      //       hovering: true,
      //     });
      //   })
      //   .on('mouseleave', d => {
      //     const bin = d3.select(
      //       `#path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`,
      //     );

      //     if (bin.attr('class') !== 'highlighted') {
      //       bin
      //         .attr('fill', d => this.determineBinColor(bins, d.length))
      //         .attr('stroke', '#000')
      //         .attr('stroke-width', 1);
      //     }
      //     this.setState({
      //       // hoveredCircleData: hoveredData,
      //       // hoveredCircleId: hoveredId || null,
      //       // hoveredCircleElement: hoveredElement,
      //       hovering: false,
      //     });
      //   })
      //   .on('click', (item, index) => {
      //     // this.hexBinning(item);
      //     d3.select(
      //       `#path-${Math.ceil(item.x)}-${Math.ceil(item.y)}-${item.length}`,
      //     )
      //       .attr('stroke', '#000')
      //       .attr('stroke-width', 5)
      //       .classed('highlighted', true);
      //     this.props.handleVolcanoPlotSelectionChange([
      //       ...item.map(elem => JSON.parse(elem.props.data)),
      //     ]);
      //     d3.event.stopPropagation();
      //   });

      // this.props.onUpdateBreadcrumbIndex(
      //   !breadCrumb ? this.state.zoom.history.length : breadCrumbIndex,
      // );

      // console.log(
      //   isFilteredDifferential
      //     ? [...this.state.zoom.history.splice(breadCrumbIndex, 1, data)]
      //     : 'nope',
      // );

      let volcanoState = {
        currentResults: data,
        circles: circles,
        bins: bins,
        zoom: {
          history: !breadCrumb
            ? [
                ...this.state.zoom.history,
                this.createCircleElements(
                  this.props.differentialResultsUnfiltered,
                ),
              ]
            : reset
            ? [data]
            : // : isFilteredDifferential
              // ? this.state.zoom.history.splice(breadCrumbIndex, 1, data)
              [...this.state.zoom.history],
          activeIndex: !breadCrumb
            ? this.state.zoom.history.length
            : breadCrumbIndex,
          historyLastViewed: !reset
            ? this.setLastViewed(
                this.state.zoom.historyLastViewed,
                data,
                !breadCrumb ? this.state.zoom.history.length : breadCrumbIndex,
              )
            : {
                0: this.state.zoom.history[0],
              },
        },
      };

      this.setState({ ...volcanoState });
      this.props.onHandleVolcanoState(
        volcanoState.zoom,
        this.bins.flatMap(elem => elem).length + this.circles.length,
      );
    } else {
      // const results = data.map(elem => JSON.parse(elem.props.data));
      // console.log('results', data);

      this.plotCirclesSorted = this.createCircleElements(data);

      this.circles = this.plotCirclesSorted;

      let volcanoState = {
        currentResults: data,
        circles: [this.plotCirclesSorted],
        bins: [],
        zoom: {
          history: !breadCrumb
            ? [
                ...this.state.zoom.history,
                this.createCircleElements(
                  this.props.differentialResultsUnfiltered,
                ),
              ]
            : reset
            ? [data]
            : // : isFilteredDifferential
              // ? [...this.state.zoom.history.splice(breadCrumbIndex, 1, data)]
              [...this.state.zoom.history],
          activeIndex: !breadCrumb
            ? this.state.zoom.history.length
            : breadCrumbIndex,
          historyLastViewed: !reset
            ? this.setLastViewed(
                this.state.zoom.historyLastViewed,
                data,
                !breadCrumb ? this.state.zoom.history.length : breadCrumbIndex,
              )
            : {
                0: this.state.zoom.history[0],
              },
        },
      };
      this.setState({ ...volcanoState });
      this.props.onHandleVolcanoState(
        volcanoState.zoom,
        this.plotCirclesSorted.length,
      );
    }

    // this.props.onUpdateBreadcrumbIndex(
    //   !breadCrumb ? this.state.zoom.history.length : breadCrumbIndex,
    // );

    this.setupBrush(volcanoWidth, volcanoHeight);

    // this.differentialResultsUnfiltered = data.map(elem =>
    //   JSON.parse(elem.props.data),
    // );

    // this.differentialResults = this.differentialResultsUnfiltered;

    this.differentialResults = data;

    this.props.onHandleUpdateDifferentialResults(this.differentialResults);

    if (reset || breadCrumb) {
      this.props.handleVolcanoPlotSelectionChange(data);
    }

    // if (
    //   brush.nodes().length !== 0 &&
    //   brush.nodes()[0].getAttribute('x') !== null
    // ) {
    //   d3.select('.volcanoPlotD3BrushSelection').call(brush.move, null);
    // }
  }

  binHoverEnter(elem) {
    // console.log(
    //   'bin',
    //   this.state.bins.find(bin => bin.x === elem),
    // );

    if (!this.state.brushing) {
      const bin = d3
        .select(`#${elem.target.id}`)
        .attr('stroke', '#00aeff')
        .attr('fill', '#00aeff')
        .attr('cursor', 'pointer')
        .attr('stroke-width', 5)
        .raise();

      this.setState({
        hoveredBin: bin.attr('data'),
        hoveredElement: 'bin',
        hovering: true,
      });
    }
  }

  binHoverLeave(elem) {
    const bin = d3.select(`#${elem.target.id}`);

    if (bin.attr('class') !== 'highlighted') {
      bin
        .attr('fill', d =>
          this.determineBinColor(
            this.state.bins,
            JSON.parse(bin.attr('data')).circles.length,
          ),
        )
        .attr('stroke', '#000')
        .attr('stroke-width', 1);

      this.setState({
        hovering: false,
      });
    }
  }

  determineBinColor(binArray, length) {
    const color = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(binArray, d => d.length) / 5]);

    return color(length);
  }

  parseDataToBinsAndCircles(data) {
    const { volcanoWidth, volcanoHeight, xAxisLabel, yAxisLabel } = this.props;
    const { xScale, yScale } = this.scaleFactory(data);

    const hexb = hexbin
      .hexbin()
      .x(d => xScale(this.doTransform(d[xAxisLabel], 'x')))
      .y(d => yScale(this.doTransform(d[yAxisLabel], 'y')))
      .size({ volcanoWidth, volcanoHeight })
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

  renderBins(bins) {
    const svg = d3.select('svg');

    // svg
    //   .selectAll('path')
    //   .data(bins)
    //   .enter()
    //   .append('path')
    //   .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon()}`);
    svg
      .selectAll('path')
      .data(bins)
      .enter()
      .append('path')
      .attr('stroke', '#000')
      .attr('stroke-opacity', 1)
      .attr('stroke-width', 1)
      .attr('id', 'hexagon-container')

      // .join('path')
      // .append('path')
      .attr('d', d => `M${d.x},${d.y}${this.hexbin.hexagon(5)}`)
      .attr('fill', d => this.determineBinColor(bins, d.length))
      .attr('id', d => `path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`)
      .on('mouseenter', d => {
        d3.select(`#path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`)
          .attr('stroke', '#00aeff')
          .attr('fill', '#00aeff')
          .attr('cursor', 'pointer')
          .attr('stroke-width', 5)
          .raise();

        this.setState({
          hoveredBin: d,
          hoveredElement: 'bin',
          hovering: true,
        });
      })
      .on('mouseleave', d => {
        const bin = d3.select(
          `#path-${Math.ceil(d.x)}-${Math.ceil(d.y)}-${d.length}`,
        );

        if (bin.attr('class') !== 'highlighted') {
          bin
            .attr('fill', d => this.determineBinColor(bins, d.length))
            .attr('stroke', '#000')
            .attr('stroke-width', 1);
        }
        this.setState({
          hovering: false,
        });
      });
    // .on('click', (item, index) => {
    //   // this.hexBinning(item);
    //   d3.select(
    //     `#path-${Math.ceil(item.x)}-${Math.ceil(item.y)}-${item.length}`,
    //   )
    //     .attr('stroke', '#000')
    //     .attr('stroke-width', 5)
    //     .classed('highlighted', true);
    //   this.props.handleVolcanoPlotSelectionChange([
    //     ...item.map(elem => JSON.parse(elem.props.data)),
    //   ]);
    //   d3.event.stopPropagation();
    // });
  }

  renderCircles(circles) {
    const {
      differentialResultsUnfiltered,
      identifier,
      xAxisLabel,
      yAxisLabel,
    } = this.props;
    const { xScale, yScale } = this.scaleFactory(differentialResultsUnfiltered);

    const svg = d3.select('svg');
    svg
      .selectAll('circle')
      .data(circles)
      .enter()
      .append('circle')
      .attr('id', 'circle-container')
      // .join('circle')
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
      .on('mouseenter', e => this.handleCircleHover(e))
      .on('mouseleave', () => this.handleCircleLeave())
      .on('click', e => {
        d3.event.stopPropagation();
        const elem = d3.select(`#volcanoDataPoint-${e[identifier]}`)
          ._groups[0][0];
        this.props.onHandleDotClick(
          e,
          JSON.parse(elem.attributes.data.value),
          0,
        );
      });
  }

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
      // .range([volcanoHeight * 0.79, 10]);
      .range([volcanoHeight - 54, 10]);

    // let [xMin, xMax] = [Math.min(...xMM), Math.max(...xMM)];
    // let [yMin, yMax] = [Math.min(...yMM), Math.max(...yMM)];

    return {
      xScale: xScale,
      yScale: yScale,
      xMax: Math.max(...xMM),
      xMin: Math.min(...xMM),
      yMax: Math.max(...yMM),
      yMin: Math.min(...yMM),
    };
  }

  createCircleElements(data, breadcrumb = false, index) {
    const {
      volcanoWidth,
      volcanoHeight,
      xAxisLabel,
      yAxisLabel,
      identifier,
      differentialResultsUnfiltered,
      isFilteredDifferential,
      differentialResults,
      isUpsetVisible,
    } = this.props;

    // const width = volcanoWidth;
    // const height = volcanoHeight;

    // const scaleData =
    //   isUpsetVisible &&
    //   isFilteredDifferential &&
    //   !this.state.brushing &&
    //   !breadcrumb
    //     ? differentialResultsUnfiltered
    //     : isUpsetVisible &&
    //       !isFilteredDifferential &&
    //       this.state.brushing &&
    //       !breadcrumb
    //     ? data
    //     : isUpsetVisible &&
    //       !isFilteredDifferential &&
    //       !this.state.brushing &&
    //       !breadcrumb
    //     ? data
    //     : isUpsetVisible &&
    //       !isFilteredDifferential &&
    //       !this.state.brushing &&
    //       breadcrumb
    //     ? data
    //     : !isUpsetVisible
    //     ? data
    //     : differentialResultsUnfiltered;

    // const scaleData =
    //   this.state.zoom.history && this.state.zoom.history[0]
    //     ? this.state.zoom.history[index].map(elem =>
    //         JSON.parse(elem.props.data),
    //       )
    //     : differentialResultsUnfiltered;

    // console.log(
    //   !breadcrumb
    //     ? differentialResultsUnfiltered
    //     : this.state.zoom.history[index].map(elem =>
    //         JSON.parse(elem.props.data),
    //       ),
    //   breadcrumb,
    //   index,
    // );

    let scaleData = !breadcrumb
      ? differentialResultsUnfiltered
      : this.state.zoom.history[index].map(elem => JSON.parse(elem.props.data));

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
      // .range([volcanoHeight * 0.79, 10]);
      .range([volcanoHeight - 54, 10]);

    let [xMin, xMax] = [Math.min(...xMM), Math.max(...xMM)];
    let [yMin, yMax] = [Math.min(...yMM), Math.max(...yMM)];

    if (isFilteredDifferential) {
      return data
        .filter(val => {
          const x = this.doTransform(val[xAxisLabel], 'x');
          const y = this.doTransform(val[yAxisLabel], 'y');

          return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
        })
        .map((val, index) => (
          <circle
            // r={this.getRadius(val[this.props.differentialFeatureIdKey])}
            r={2}
            className="volcanoPlot-dataPoint"
            id={`volcanoDataPoint-${val[identifier]}`}
            circleid={`${val[identifier]}`}
            key={`${val[identifier] + '_' + index}`}
            data={`${JSON.stringify(val)}`}
            stroke={'#000'}
            strokeWidth={0.4}
            fill={'#1678c2'}
            onMouseEnter={e => this.handleCircleHover(e)}
            onMouseLeave={() => this.handleCircleLeave()}
            onClick={e =>
              this.props.onHandleDotClick(
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
    } else {
      return data.map((val, index) => (
        <circle
          // r={this.getRadius(val[this.props.differentialFeatureIdKey])}
          r={2}
          className="volcanoPlot-dataPoint"
          id={`volcanoDataPoint-${val[identifier]}`}
          circleid={`${val[identifier]}`}
          key={`${val[identifier] + '_' + index}`}
          data={`${JSON.stringify(val)}`}
          stroke={'#000'}
          strokeWidth={0.4}
          fill={'#1678c2'}
          onMouseEnter={e => this.handleCircleHover(e)}
          onMouseLeave={() => this.handleCircleLeave()}
          onClick={e =>
            this.props.onHandleDotClick(
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
    }

    // this.plotCirclesSorted = plotCircles.sort(
    //   (a, b) => a.props.cx - b.props.cx,
    // );

    // console.log('plotcircles', plotCircles);

    // return plotCircles.sort((a, b) => a.props.cx - b.props.cx);
  }

  // static getDerivedStateFromProps = ({ multisetPlotAvailableDifferential }) => {
  //   return {
  //     upsetVisible: multisetPlotAvailableDifferential,
  //   };
  // };

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
      isUpsetVisible,
      isFilteredDifferential,
      differentialResults,
      differentialResultsUnfiltered,
    } = this.props;

    if (prevProps.doYAxisTransformation !== this.props.doYAxisTransformation) {
      this.hexBinning(
        this.createCircleElements(
          this.state.zoom.historyLastViewed[
            this.state.zoom.activeIndex
          ].map(elem => JSON.parse(elem.props.data)),
        ),
        true,
        this.state.zoom.activeIndex,
      );
    }

    // if (!prevProps.isFilteredDifferential && isFilteredDifferential) {

    //   console.log(
    //     this.setLastViewed(
    //       this.state.filterState,
    //       this.props.filterState,
    //       this.state.zoom.activeIndex,
    //     ),
    //   );
    //   // if (this.state.filterState.length > 0) {
    //   //   let index = this.state.filterState.findIndex(
    //   //     item => item.index === this.state.zoom.activeIndex,
    //   //   );
    //   //   if (index >= 0) {
    //   //     let array = [...this.state.filterState];
    //   //     array.splice(index, 1, {
    //   //       ...this.props.filterState,
    //   //       index: this.state.zoom.activeIndex,
    //   //     });
    //   //     this.setState({
    //   //       filterState: [...array],
    //   //     });
    //   //   } else {
    //   //     this.setState({
    //   //       filterState: [
    //   //         ...this.state.filterState,
    //   //         { ...this.props.filterState, index: this.state.zoom.activeIndex },
    //   //       ],
    //   //     });
    //   //   }
    //   // } else {
    //   //   this.setState({
    //   //     filterState: [
    //   //       { ...this.props.filterState, index: this.state.zoom.activeIndex },
    //   //     ],
    //   //   });
    //   // }
    // }

    if (
      isUpsetVisible &&
      isFilteredDifferential &&
      this.differentialResults.length !== differentialResults.length
    ) {
      this.hexBinning(
        this.createCircleElements(differentialResults),
        true,
        this.state.zoom.activeIndex,
      );
    } else if (!isUpsetVisible && prevProps.isUpsetVisible) {
      console.log('690', this.state.zoom.activeIndex);
      this.hexBinning(
        this.createCircleElements(
          this.state.zoom.history[this.state.zoom.activeIndex].map(elem =>
            JSON.parse(elem.props.data),
          ),
        ),
        true,
        this.state.zoom.activeIndex,
      );
    } else if (prevState.zoom.activeIndex !== this.state.zoom.activeIndex) {
      this.hexBinning(
        this.createCircleElements(
          isUpsetVisible
            ? this.state.zoom.historyLastViewed[
                this.state.zoom.activeIndex
              ].map(elem => JSON.parse(elem.props.data))
            : this.state.zoom.history[this.state.zoom.activeIndex].map(elem =>
                JSON.parse(elem.props.data),
              ),
        ),
        true,
        this.state.zoom.activeIndex,
      );
    } else if (!prevState.isBinClicked && this.state.isBinClicked) {
      this.hexBinning(this.state.clickedBin);
      this.setState({ isBinClicked: false });
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
        [volcanoDifferentialTableRowMax, ...volcanoDifferentialTableRowOther]
          .length > 0 &&
        this.state.brushedRawData == null)
    ) {
      const elems = [
        volcanoDifferentialTableRowMax,
        ...volcanoDifferentialTableRowOther,
      ].map(elem => {
        const el = document.getElementById(`volcanoDataPoint-${elem}`);
        return el ? d3.select(el)._groups[0][0] : null;
      });
      this.handleBrushedText({ _groups: [elems.map(elem => elem)] });
    }

    if (
      !_.isEqual(
        _.sortBy(volcanoDifferentialTableRowOther),
        _.sortBy(prevProps.volcanoDifferentialTableRowOther),
      ) ||
      volcanoDifferentialTableRowMax !==
        prevProps.volcanoDifferentialTableRowMax
    ) {
      // var self = this;
      // excessive styling needed for proper display across all export types
      // style all circles back to default
      const allCircles = d3.selectAll('circle.volcanoPlot-dataPoint');
      allCircles.attr('style', 'fill: #1678c2');
      allCircles.attr('stroke', '#000');
      allCircles.attr('r', 2);
      allCircles.classed('highlighted', false);
      allCircles.classed('highlightedMax', false);
      const selectedCircles = d3.selectAll(
        'circle.volcanoPlot-dataPoint.selected',
      );

      // allBins.attr('fill', d => {
      //   console.log('bins', d);
      //   this.determineBinColor(this.state.bins, d.length);
      // });
      // allBins.classed('highlighted', false);
      // allBins.classed('highlightedMax', false);
      // allBins.attr('stroke', '#000');

      // style all brushed circles
      selectedCircles
        .attr('style', 'fill: #00aeff')
        .classed('highlighted', true);
      selectedCircles.attr('r', 2.5);
      selectedCircles.raise();
      if (volcanoDifferentialTableRowOther?.length > 0) {
        volcanoDifferentialTableRowOther.forEach(element => {
          // style all highlighted circles
          // const highlightedCircleId = document.getElementById(
          //   `volcanoDataPoint-${element}`,
          // );
          const highlightedCircleId = this.getCircleOrBin(element);
          const highlightedCircle = d3.select(highlightedCircleId.element);
          if (highlightedCircle != null) {
            if (highlightedCircleId.type === 'circle') {
              highlightedCircle.attr('r', 4);
              highlightedCircle
                .attr('style', 'fill: #ff7e05')
                .classed('highlighted', true);
              highlightedCircle.attr('r', 5);
              highlightedCircle.classed('highlightedMax', true);
              highlightedCircle.raise();
            } else {
              highlightedCircle
                .attr('fill', '#ff7e05')
                .classed('highlighted', true);
              highlightedCircle.attr('stroke', '#ff7e05');
              highlightedCircle.attr('stroke-width', '#ff7e05');
              highlightedCircle.classed('highlightedMax', true);
              highlightedCircle.raise();
            }
          }
        });
      }
      if (volcanoDifferentialTableRowMax?.length > 0) {
        // style max highlighted circle
        // const maxCircleId = document.getElementById(
        //   `volcanoDataPoint-${volcanoDifferentialTableRowMax}`,
        // );
        const maxCircleId = this.getCircleOrBin(volcanoDifferentialTableRowMax);
        const maxCircle = d3.select(maxCircleId.element);
        if (maxCircle != null) {
          if (maxCircleId.type === 'circle') {
            maxCircle
              .attr('style', 'fill: #ff4400')
              .classed('highlighted', true);
            maxCircle.attr('r', 5);
            maxCircle.classed('highlightedMax', true);
            maxCircle.raise();
          } else {
            maxCircle.attr('fill', '#ff4400').classed('highlighted', true);
            maxCircle.attr('stroke', '#ff4400');
            maxCircle.attr('stroke-width', '#ff4400');
            maxCircle.classed('highlightedMax', true);
            maxCircle.raise();
          }
        }
      }
    }
    if (
      prevProps.volcanoHeight !== volcanoHeight ||
      prevProps.volcanoWidth !== volcanoWidth
    ) {
      this.resizeBrushSelection();
      this.hexBinning(
        this.createCircleElements(
          this.state.zoom.historyLastViewed[
            this.state.zoom.activeIndex
          ].map(elem => JSON.parse(elem.props.data)),
        ),
        true,
        this.state.zoom.activeIndex,
      );
    }
    if (
      prevProps.xAxisLabel !== xAxisLabel ||
      prevProps.yAxisLabel !== yAxisLabel ||
      prevProps.doXAxisTransformation !== doXAxisTransformation ||
      prevProps.doYAxisTransformation !== doYAxisTransformation
    ) {
      this.removeViolinBrush();
      this.hexBinning(
        this.createCircleElements(
          this.state.zoom.historyLastViewed[
            this.state.zoom.activeIndex
          ].map(elem => JSON.parse(elem.props.data)),
        ),
        true,
        this.state.zoom.activeIndex,
      );
    }
  }

  // onChartDataToggle = (bins, circles, data) => {
  //   this.setState({ showBins: bins, showCircles: circles });
  //   this.props.onHandleTableDataChange(
  //     data.map(elem => JSON.parse(elem.props.data)),
  //   );
  // };

  getCircleOrBin = key => {
    const el = document.getElementById(`volcanoDataPoint-${key}`);
    if (el) {
      return { element: d3.select(el)._groups[0][0], type: 'circle' };
    } else {
      const bin = this.state.bins.find(bin => {
        return bin.some(b => b.props.id === `volcanoDataPoint-${key}`);
      });

      return {
        element: d3.select(
          `#path-${Math.ceil(bin.x)}-${Math.ceil(bin.y)}-${bin.length}`,
        )._groups[0][0],
        type: 'bin',
      };
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
    // console.log('865', this.state.zoom.history.length - 1);
    // this.hexBinning(
    //   this.plotCirclesSorted,
    //   true,
    //   this.state.zoom.history.length - 1,
    // );
  };

  resizeBrushSelection = () => {
    this.removeViolinBrush();
    // add resizing later after priorities
  };

  windowResized = () => {
    this.removeViolinBrush();
    this.hexBinning(
      this.plotCirclesSorted,
      true,
      this.state.zoom.history.length - 1,
    );
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
    const elem = d3.select(`#volcanoDataPoint-${e[this.props.identifier]}`)
      ._groups[0][0];
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
    }
  };
  handleCircleLeave() {
    d3.selectAll('circle.volcanoPlot-dataPoint').classed('hovered', false);
    const hovered = document.getElementById(this.state.hoveredCircleElement);
    if (hovered != null) {
      const hoveredCircle = d3.select(hovered)._groups[0][0] ?? null;
      if (hoveredCircle != null) {
        // if (!hoveredCircle.empty()) {
        if (hoveredCircle.attributes['class'].value.endsWith('selected')) {
          hoveredCircle.attributes['r'].value = 2.5;
        } else if (
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
        // }
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

    if (hovering) {
      if (hoveredElement === 'bin') {
        const bin = hoveredBin;
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
        return (
          <svg
            x={bin.x >= 240 ? bin.x * 1 - 170 : bin.x * 1 + 15}
            y={bin.y * 1 + 10}
            width="200"
            height="75"
          >
            <rect
              width="100%"
              height="100%"
              fill="#ff4400"
              rx="5"
              ry="5"
            ></rect>
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
                {`Total features: ${bin.length}`}
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
      } else if (hoveredElement === 'circle') {
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
            <rect
              width="100%"
              height="100%"
              fill="#ff4400"
              rx="5"
              ry="5"
            ></rect>
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
      }
    } else {
      return null;
    }
  }

  setupBrush(width, height) {
    const self = this;
    let objsBrush = {};

    const brushingStart = function() {
      self.setState({
        brushing: d3.brushSelection(this)?.length ? true : false,
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
        const brush = d3.brushSelection(this);
        // let start = brushedCircles[0][0];
        // let end = brushedCircles[1][0];

        // let circles = self.search(self.plotCirclesSorted, start);

        const isBrushed = function(x, y) {
          const brushTest =
            brush[0][0] <= x &&
            x <= brush[1][0] &&
            brush[0][1] <= y &&
            y <= brush[1][1];
          return brushTest;
        };

        // // style all circles back to default
        // // const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
        // const circles = d3.selectAll('path');
        // // console.log('circles', circles);
        // circles.attr('style', 'fill: #1678c2');
        // circles.attr('r', 2);
        // circles.classed('selected', false);
        // circles.classed('highlighted', false);
        // circles.classed('highlightedMax', false);

        // if (self.differentialResults.length > 5000) {
        const brushedBins = self.state.bins
          .filter(bin => {
            return isBrushed(bin.x, bin.y);
          })
          .flatMap(elem => elem);
        // self.hexBinning(brushedBins);
        // } else {
        // style all circles back to default
        const circles = d3.selectAll('circle.volcanoPlot-dataPoint');
        circles.attr('style', 'fill: #1678c2');
        circles.attr('r', 2);
        circles.classed('selected', false);
        circles.classed('highlighted', false);
        circles.classed('highlightedMax', false);

        const brushedCircles = circles.filter(function() {
          const x = d3.select(this).attr('cx');
          const y = d3.select(this).attr('cy');
          return isBrushed(x, y);
        });

        brushedCircles.attr('style', 'fill: #00aeff');
        brushedCircles.attr('r', 2.5);
        brushedCircles.classed('selected', true);

        self.handleBrushedText(brushedCircles);

        // if (!!brushedBins.length && !!brushedCircles._groups[0].length) {
        const brushedDataArr = brushedCircles._groups[0].map(a => {
          return JSON.parse(a.attributes.data.value);
        });

        // console.log('brushed data arr', brushedDataArr);
        // console.log('brushed bins', brushedBins);
        // console.log('try this', [
        //   ...brushedDataArr,
        //   ...brushedBins.map(elem => JSON.parse(elem.props.data)),
        // ]);

        const total = [
          ...brushedBins,
          ...self.createCircleElements(brushedDataArr),
        ];

        self.props.onHandleZoom(
          total,
          self.state.zoom.activeIndex + 1,
          self.state.zoom,
        );

        // if (brushedBins.length > 0) {
        self.hexBinning(total);
        // }

        self.setState({ brushedRawData: brushedCircles, brushing: false });

        if (brushedDataArr.length > 0) {
          self.setState({
            brushedCirclesData: brushedDataArr,
            brushedCircles: brushedCircles,
          });
        }
        // self.hexBinning(brushed);
        self.props.handleVolcanoPlotSelectionChange([
          ...brushedDataArr,
          ...brushedBins,
        ]);
        // }
        // }

        // style all brushed circles
        // const brushed = self.state.bins
        //   .filter(bin => {
        //     // const x = d3.select(this).attr('x');
        //     // const y = d3.select(this).attr('y');
        //     return isBrushed(bin.x, bin.y);
        //   })
        // .flatMap(elem => elem.slice(elem.length - 2, elem.length));
        // .flatMap(elem => elem);
        // brushed.attr('style', 'fill: #00aeff');
        // brushed.attr('r', 2.5);
        // brushed.classed('selected', true);

        // self.handleBrushedText(brushed);

        // const brushedDataArr = brushed._groups[0].map(a => {
        //   return JSON.parse(a.attributes.data.value);
        // });

        // console.log('bins', self.state.bins);
        // console.log('brushed', brushed);
        // self.hexBinning(brushed);
        // if (brushedDataArr.length > 0) {
        //   self.setState({
        //     brushedCirclesData: brushedDataArr,
        //     brushedCircles: brushed,
        //   });
        // }
        // self.props.handleVolcanoPlotSelectionChange(brushedDataArr);

        // self.setState({ brushedRawData: brushed });
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
    } else {
      d3.select('.volcanoPlotD3BrushSelection').call(objsBrush.move, null);
    }
  }

  handleBrushedText = brushed => {
    // MAP brushedDataArr to circle text state
    const brushedCircleTextMapped = brushed._groups[0].map(a => {
      const columnData = JSON.parse(a.attributes['data'].value);
      const key = this.props.volcanoCircleLabel || 0;
      return {
        data: columnData[key],
        class: a.attributes['class'].value,
        id: a.attributes['id'].value,
        cx: a.attributes['cx'].value,
        cy: a.attributes['cy'].value,
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

  handleSVGClick() {
    // this.props.onHandleVolcanoTableLoading(true);
    this.unhighlightBrushedCircles();
    this.props.handleVolcanoPlotSelectionChange(this.state.currentResults);
    this.setState({
      brushing: false,
      resizeScalarX: 1,
      resizeScalarY: 1,
      volcanoCircleText: [],
    });
  }

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
      isFilteredDifferential,
      isUpsetVisible,
    } = this.props;

    // console.log('render', differentialResultsUnfiltered);

    const { volcanoCircleText } = this.state;

    // console.log('results', differentialResults);
    // console.log('unfiltered', differentialResultsUnfiltered);

    // this.differentialResultsUnfiltered =
    //   this.differentialResultsUnfiltered.length <= 0
    //     ? differentialResultsUnfiltered
    //     : this.differentialResultsUnfiltered;

    this.differentialResults =
      this.differentialResults.length <= 0
        ? differentialResults
        : this.differentialResults;

    // console.log('results', this.differentialResults);
    // console.log('results from props', differentialResults);

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
            fontSize: '12px',
            textAnchor: 'middle',
            transform: `translate(40px, 3px)`,
          }}
        >
          {value}
        </text>
      </g>
    ));
    // var filteredOutPlotCircles = null;
    // if (
    //   this.differentialResultsUnfiltered.length !==
    //   this.differentialResults.length
    // ) {
    //   filteredOutPlotCircles = differentialResultsUnfiltered.map(
    //     (val, index) => (
    //       <circle
    //         cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
    //         cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
    //         key={`${val[identifier] + '_' + index}`}
    //         r={2}
    //         opacity={0.3}
    //       ></circle>
    //     ),
    //   );
    //   const { bins, circles } = this.createBins(
    //     this.createCircleElements(differentialResultsUnfiltered),
    //   );
    // }

    const { bins, circles } =
      (differentialResultsUnfiltered.length !== differentialResults.length ||
        differentialResultsUnfiltered.length === differentialResults.length) &&
      isUpsetVisible
        ? differentialResultsUnfiltered.length > 5000
          ? this.createBins(
              this.createCircleElements(differentialResultsUnfiltered),
            )
          : {
              bins: null,
              circles: this.createCircleElements(differentialResultsUnfiltered),
            }
        : { bins: null, circles: null };

    // if (isUpsetVisible) {
    //   this.hexBinning(this.createCircleElements(differentialResults));
    // }

    // console.log('bins', bins);
    // console.log('circles', circles);
    // const plotCircles = this.differentialResults.map((val, index) => (
    //   <circle
    //     // r={this.getRadius(val[this.props.differentialFeatureIdKey])}
    //     r={2}
    //     className="volcanoPlot-dataPoint"
    //     id={`volcanoDataPoint-${val[identifier]}`}
    //     circleid={`${val[identifier]}`}
    //     key={`${val[identifier] + '_' + index}`}
    //     data={`${JSON.stringify(val)}`}
    //     stroke={'#000'}
    //     strokeWidth={0.4}
    //     fill={'#1678c2'}
    //     onMouseEnter={e => this.handleCircleHover(e)}
    //     onMouseLeave={() => this.handleCircleLeave()}
    //     onClick={e =>
    //       this.props.onHandleDotClick(
    //         e,
    //         JSON.parse(e.target.attributes.data.value),
    //         0,
    //       )
    //     }
    //     xstatistic={`${this.doTransform(val[xAxisLabel], 'x')}`}
    //     ystatistic={`${this.doTransform(val[yAxisLabel], 'y')}`}
    //     cx={`${xScale(this.doTransform(val[xAxisLabel], 'x'))}`}
    //     cy={`${yScale(this.doTransform(val[yAxisLabel], 'y'))}`}
    //     cursor="pointer"
    //   ></circle>
    // ));

    // this.plotCirclesSorted = plotCircles.sort(
    //   (a, b) => a.props.cx - b.props.cx,
    // );

    const hoveredCircleTooltip = this.getToolTip();

    // this.setupBrush(volcanoWidth, volcanoHeight);

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
            {/* <Button.Group size="mini">
              <Button
                onClick={() =>
                  this.onChartDataToggle(false, true, this.state.circles)
                }
              >
                Dots
              </Button>
              <Button.Or />
              <Button
                onClick={() =>
                  this.setState({ showBins: true, showCircles: false })
                }
              >
                Bins
              </Button>
              <Button.Or />
              <Button
                onClick={() =>
                  this.setState({ showBins: true, showCircles: true })
                }
              >
                Hybrid
              </Button>
            </Button.Group> */}
          </div>
          <div className="breadcrumb-container">
            <Button onClick={() => this.hexBinning(differentialResults)}>
              Click me
            </Button>
            {this.state.zoom?.history?.length > 0 ? (
              <Step.Group size="mini">
                {this.state.zoom.history.map((zoom, index) => (
                  <Step
                    key={`${zoom.length}-${index}`}
                    onClick={() => {
                      this.props.onHandleBreadcrumbClick(
                        this.state.zoom.history[index].map(elem =>
                          JSON.parse(elem.props.data),
                        ),
                        index,
                        this.props.isUpsetVisible
                          ? this.state.filterState[index]
                          : {},
                        true,
                      );

                      this.hexBinning(
                        this.createCircleElements(
                          this.state.zoom.historyLastViewed[index].map(elem =>
                            JSON.parse(elem.props.data),
                          ),
                        ),
                        true,
                        index,
                      );
                    }}
                    active={
                      index === this.state.zoom.activeIndex ? true : false
                    }
                  >
                    <Step.Content>
                      <Step.Description>
                        {this.state.zoom.history[index].length}
                      </Step.Description>
                    </Step.Content>
                  </Step>
                ))}
              </Step.Group>
            ) : null}
            {this.state.loading ? <Loader active inline /> : null}
            {this.state.zoom?.history?.length > 1 ? (
              <span
                className="clear-button"
                onClick={() => {
                  this.hexBinning(
                    this.createCircleElements(
                      this.state.zoom.history[0].map(elem =>
                        JSON.parse(elem.props.data),
                      ),
                    ),
                    true,
                    0,
                    true,
                  );

                  this.props.onHandleBreadcrumbClick(
                    this.state.zoom.history[0].map(elem =>
                      JSON.parse(elem.props.data),
                    ),
                    0,
                    this.props.isUpsetVisible
                      ? {
                          ...this.state.filterState[0],
                          mustDifferential: [],
                          notDifferential: [],
                          selectedColP: [
                            {
                              key: 'P.Value',
                              text: 'P.Value',
                              value: 'P.Value',
                            },
                          ],
                          selectedOperatorP: [
                            { key: '<', text: '<', value: '<' },
                          ],
                          sigValueP: [0.05],
                        }
                      : {},
                    true,
                  );
                }}
              >
                clear all
              </span>
            ) : null}
          </div>
          <svg
            id="VolcanoChart"
            className="VolcanoPlotSVG"
            width={volcanoWidth + 20}
            height={volcanoHeight}
            ref={this.volcanoSVGRef}
            onClick={() => this.handleSVGClick()}
          >
            <g className="volcanoPlotD3BrushSelection" />
            {yAxis}
            {xAxis}
            {/*X Axis Label*/}
            <text
              className="volcanoAxisLabel NoSelect"
              x={volcanoWidth * 0.5 + 10}
              y={xAxisLabelY}
              fontFamily="Lato, Helvetica Neue, Arial, Helvetica, sans-serif"
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
            {/* <g filter="url(#constantOpacity)">{filteredOutPlotCircles}</g> */}
            <g filter="url(#constantOpacity)">
              {bins
                ? bins.map((elem, index) => {
                    return (
                      <path
                        // stroke="black"
                        // fill="blue"
                        d={`M${elem.x},${elem.y}${this.hexbin.hexagon(5)}`}
                        key={`path-${Math.ceil(elem.x)}-${Math.ceil(elem.y)}-${
                          elem.length
                        }-${index}`}
                        opacity={0.3}
                      />
                    );
                  })
                : null}
              {circles
                ? circles.map((val, index) => {
                    return (
                      <circle
                        cx={val.props.cx}
                        cy={val.props.cy}
                        key={`${val.props[identifier] + '_' + index}`}
                        r={2}
                        opacity={0.3}
                      ></circle>
                    );
                  })
                : null}
            </g>
            {/* {plotCircles} */}
            {/* {this.plotCirclesSorted} */}
            {/* {this.plotCirclesSorted.length <= 5000
              ? this.plotCirclesSorted
              : null} */}
            {/* {this.state.bins.map(elem => {
              return (
                <path
                  stroke="black"
                  fill="blue"
                  d={`M${elem.x},${elem.y}${this.hexbin.hexagon(5)}`}
                  id={`path-${Math.ceil(elem.x)}-${Math.ceil(elem.y)}-${
                    elem.length
                  }}`}
                />
              );
            })} */}
            {/* {this.state.showBins
              ? this.state.bins.map((elem, index) => {
                  return (
                    <path
                      stroke="#000"
                      strokeOpacity="1"
                      strokeWidth="1"
                      d={`M${elem.x},${elem.y}${this.hexbin.hexagon(5)}`}
                      fill={this.determineBinColor(
                        this.state.bins,
                        elem.length,
                      )}
                      id={`path-${Math.ceil(elem.x)}-${Math.ceil(elem.y)}-${
                        elem.length
                      }`}
                      key={`path-${Math.ceil(elem.x)}-${Math.ceil(elem.y)}-${
                        elem.length
                      }-${index}`}
                      onMouseEnter={e => this.binHoverEnter(e)}
                      onMouseLeave={e => this.binHoverLeave(e)}
                      onClick={e => {
                        this.props.onHandleZoom(
                          JSON.parse(
                            d3.select(e.target).attr('data'),
                          ).circles.map(elem => JSON.parse(elem.props.data)),
                          this.state.zoom.activeIndex + 1,
                          this.state.zoom,
                        );
                        this.setState({
                          isBinClicked: true,
                          hovering: false,
                          clickedBin: JSON.parse(
                            d3.select(e.target).attr('data'),
                          ).circles,
                        });
                      }}
                      data={JSON.stringify({
                        circles: elem,
                        x: elem.x,
                        y: elem.y,
                      })}
                    />
                  );
                })
              : null} */}
            {/* {this.state.showCircles ? this.state.circles : null} */}
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
