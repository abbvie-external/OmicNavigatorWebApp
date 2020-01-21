import React, { Component, Fragment } from 'react';
// import PropTypes from 'prop-types';
// import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { select } from 'd3-selection';
import './ViolinPlot.scss';

class ViolinPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: {
        axisLabels: {
          xAxis: this.props.enrichmentTerm,
          yAxis: "log<tspan baseline-shift='sub' font-size='13px'>2</tspan>(FC)"
        },
        constrainExtremes: false,
        color: d3.scaleOrdinal(d3.schemeCategory10),
        // chartSize: { height: '700', width: '960' },
        // data: this.props.barcodeSettings.barcodeData || null,
        id: 'chart-violin',
        // id: 'violin-graph-1',
        margin: { top: 50, right: 40, bottom: 40, left: 50 },
        pointUniqueId: 'sample',
        pointValue: 'cpm',
        scale: 'linear',
        subtitle: '',
        title: '',
        tooltip: {
          show: true,
          fields: [
            { label: 'log(FC)', value: 'cpm', toFixed: true },
            { label: 'Protien', value: 'sample' }
          ]
        },
        // tooltip: {
        //   show: true,
        //   fields: [{ label: 'label1', value: 'value1', toFixed: true }]
        // },
        // xName: null,
        xName: 'tissue',
        yName: null,
        yTicks: 1
      },
      width: 400,
      height: 400,
      groupObjs: {},
      objs: {
        mainDiv: null,
        chartDiv: null,
        g: null,
        xAxis: null,
        yAxis: null,
        brush: null,
        tooltip: null
      },
      colorFunct: null,
      violinPlots: {},
      dataPlots: {},
      boxPlots: {},
      violinHeight: 400,
      violinWidth: 400
    };
    this.violinChartRef = React.createRef();
  }

  // export class ViolinGraph {
  //   public violinBrush = new EventEmitter();
  //   public dotClick = new EventEmitter();
  //   public dotHover = new EventEmitter();
  //   public settings: any;
  //   maxCircle;
  //   isHovering: boolean = true;

  //   chart: Chart = new Chart();

  //   constructor(data, settings) {
  //     this.chart.settings.data = data;
  //     this.settings = settings;
  //     const self = this;

  //     this.makeChart();
  //   }

  componentDidMount() {
    let width = this.getWidth();
    let height = this.getHeight();
    this.setState({ violinWidth: width, violinHeight: height }, () => {
      this.makeChart();
    });

    // let resizedFn;
    // window.addEventListener('resize', () => {
    // clearTimeout(resizedFn);
    // resizedFn = setTimeout(() => {
    //     this.makeChart();
    //     }, 200);
    // });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      // this.props.violinData !== prevProps.violinData ||
      this.props.verticalSplitPaneSize !== prevProps.verticalSplitPaneSize
    ) {
      //let heightChangedFn;
      // clearTimeout(heightChangedFn);
      // heightChangedFn = setTimeout(() => {
      //   this.redrawChart();
      // d3.select('.BarcodeChartWrapper svg').remove();
      d3.select('.violin-chart-wrapper')
        .selectAll('*')
        .remove();
      this.makeChart();
      // }, 1000);
    }
  }

  getWidth = () => {
    if (this.violinChartRef.current !== null) {
      return this.violinChartRef.current.parentElement.offsetWidth;
    } else return 350;
  };

  getHeight = () => {
    if (this.violinChartRef.current !== null) {
      return this.violinChartRef.current.parentElement.offsetHeight;
    } else return 600;
    // return 600;
  };

  makeChart = () => {
    const self = this;
    const { violinData } = this.props;
    const {
      violinHeight,
      violinWidth,
      settings,
      objs,
      violinPlots,
      dataPlots,
      boxPlots
    } = this.state;
    // groupObjs The data organized by grouping and sorted as well as any metadata for the groups

    function calcMetrics(values) {
      const metrics = {
        // These are the original non-scaled values
        max: null,
        upperOuterFence: null,
        upperInnerFence: null,
        quartile3: null,
        median: null,
        mean: null,
        iqr: null,
        quartile1: null,
        lowerInnerFence: null,
        lowerOuterFence: null,
        std: null,
        variance: null,
        n: null,
        min: null,
        bw: null
      };

      metrics.min = d3.min(values);
      metrics.quartile1 = d3.quantile(values, 0.25);
      metrics.median = d3.median(values);
      metrics.mean = d3.mean(values);
      metrics.quartile3 = d3.quantile(values, 0.75);
      metrics.max = d3.max(values);
      metrics.iqr = metrics.quartile3 - metrics.quartile1;
      metrics.std = d3.deviation(values);
      metrics.variance = d3.variance(values);
      metrics.n = values.length;
      metrics.bw =
        0.9 *
        d3.min([metrics.std, metrics.iqr / 1.349]) *
        Math.pow(metrics.n, -0.2);

      // The inner fences are the closest value to the IQR without going past it (assumes sorted lists)
      const LIF = metrics.quartile1 - 1.5 * metrics.iqr;
      const UIF = metrics.quartile3 + 1.5 * metrics.iqr;
      for (let i = 0; i <= values.length; i++) {
        if (values[i] < LIF) {
          continue;
        }
        if (!metrics.lowerInnerFence && values[i] >= LIF) {
          metrics.lowerInnerFence = values[i];
          continue;
        }
        if (values[i] > UIF) {
          metrics.upperInnerFence = values[i - 1];
          break;
        }
      }

      metrics.lowerOuterFence = metrics.quartile1 - 3 * metrics.iqr;
      metrics.upperOuterFence = metrics.quartile3 + 3 * metrics.iqr;
      if (!metrics.lowerInnerFence) {
        metrics.lowerInnerFence = metrics.min;
      }
      if (!metrics.upperInnerFence) {
        metrics.upperInnerFence = metrics.max;
      }
      return metrics;
    }

    let groupObjs = violinData;
    // let groupObjs = settings.data;
    let pointValue = settings.pointValue;

    for (const cName in groupObjs) {
      if (groupObjs.hasOwnProperty(cName)) {
        const pointValues = _.map(groupObjs[cName].values, function(d) {
          return d[pointValue];
        });
        pointValues.sort(d3.ascending);
        groupObjs[cName].metrics = {};
        groupObjs[cName].metrics = calcMetrics(pointValues);
      }
    }

    function formatAsFloat(d) {
      if (d % 1 !== 0) {
        return d3.format('.2f')(d);
      } else {
        return d3.format('.0f')(d);
      }
    }

    // Set base settings
    let divWidth = violinWidth;
    let divHeight = violinHeight;
    // let divWidth = settings.chartSize.width;
    // let divHeight = settings.chartSize.height;
    let width = violinWidth - settings.margin.left - settings.margin.right;
    // settings.chartSize.width - settings.margin.left - settings.margin.right;

    let height = violinHeight - settings.margin.top - settings.margin.bottom;
    // settings.chartSize.height - settings.margin.top - settings.margin.bottom;

    let xAxisLabel = settings.xAxisLabel || '';
    let yAxisLabel = settings.yAxisLabel || '';

    if (settings.axisLabels) {
      xAxisLabel = settings.axisLabels.xAxis;
      yAxisLabel = settings.axisLabels.yAxis;
    } else {
      xAxisLabel = settings.xName;
      yAxisLabel = settings.yName;
    }

    let yScale = d3.scaleLinear();
    let range = [];
    if (settings.constrainExtremes === true) {
      const fences = [];
      for (const cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          fences.push(groupObjs[cName].metrics.lowerInnerFence);
          fences.push(groupObjs[cName].metrics.upperInnerFence);
        }
      }
      range = d3.extent(fences);
    } else {
      const fences = [];
      for (const cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          fences.push(groupObjs[cName].metrics.min);
          fences.push(groupObjs[cName].metrics.max);
        }
      }
      range = d3.extent(fences);
    }

    let colorFunct = self.getColorFunct(settings.colors, groupObjs);

    // Build Scale functions
    range = Math.abs(range[1] - range[0]) * 0.05;

    yScale
      .range([height, 0])
      .domain([range[0] - range, range[1] + range])
      .nice()
      .clamp(true);

    let xScale = d3
      .scaleBand()
      .domain(Object.keys(groupObjs).sort())
      .range([0, width]);

    // Build Axes Functions
    objs.yAxis = d3
      .axisLeft(yScale)
      .tickFormat(self.formatAsFloat)
      .tickSizeOuter(0)
      .tickSizeInner(-width);
    objs.yAxis.tickArguments(objs.yAxis.tickArguments() * settings.yTicks);

    // Prepare the chart html elements
    objs.chartDiv = d3.select('#' + settings.id);
    objs.tooltip = objs.chartDiv.append('div');
    objs.tooltip.attr('class', 'violin-tooltip').style('display', 'none');

    // Create the svg
    objs.svg = objs.chartDiv
      .append('svg')
      .attr('class', 'chart-area vChart')
      .attr('id', 'svg-' + settings.id)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 ' + divWidth + ' ' + divHeight)
      .attr('preserveAspectRatio', 'xMinYMin meet');
    objs.g = objs.svg
      .append('g')
      .attr(
        'transform',
        'translate(' + settings.margin.left + ',' + settings.margin.top + ')'
      )
      .attr('id', 'main-g');

    // Create axes
    objs.axes = objs.g.append('g').attr('class', 'axis');
    objs.axes
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      // .call(objs.xAxis)
      .append('text')
      .attr('class', 'label')
      .attr('dy', '1.50em')
      .attr('y', -7)
      .style('font-size', '16px')
      // .style('font-weight', 'bold')
      .style('font-family', 'Lato')
      .style('text-ancohor', 'middle')
      .append('tspan')
      .html(function() {
        return xAxisLabel;
      })
      .attr('x', function() {
        let elem = d3.select('.label');
        // let size = elem.node().getBBox();
        // return width / 2 - size.width / 2;
        return width / 2;
      });

    objs.axes
      .append('g')
      .attr('class', 'y axis')
      .call(objs.yAxis)
      .append('text')
      .attr('class', 'label')
      .attr('dy', '.62em')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -48)
      .attr('id', 'yaxis-label')
      .style('fill', '#000')
      .style('font-size', '16px')
      // .style('font-weight', 'bold')
      .style('font-family', 'Lato')
      .style('text-ancohor', 'middle')
      .append('tspan')
      .html(function() {
        return yAxisLabel;
      });

    // Create Title
    const title = objs.g.append('g').attr('class', 'title');
    title
      .append('text')
      .attr('x', 10)
      .attr('y', -30)
      .style('fill', '#000')
      .style('font-size', '23px')
      // .style('font-weight', 'bold')
      .style('font-family', 'Lato')
      .style('text-anchor', 'left')
      .text(settings.title);

    const subtitle = objs.g
      .append('g')
      .attr('class', 'subtitle')
      .append('text')
      .attr('x', 10)
      .attr('y', -10)
      .style('fill', '#000')
      .style('font-size', '13px')
      //.style('font-weight', 'bold')
      .style('font-family', 'Lato')
      .style('text-anchor', 'left')
      .text(settings.subtitle);

    // render violin plot
    let showViolinPlot = true;

    const defaultOptions = {
      show: true,
      showViolinPlot: true,
      resolution: 207,
      bandwidth: 0.2,
      width: 90,
      interpolation: d3.curveCardinal,
      clamp: 1,
      colors: colorFunct,
      _yDomainVP: null
    };
    violinPlots.options = self.shallowCopy(defaultOptions);
    // PAUL - do we need this code?
    // for (const option in options) {
    //     if (options.hasOwnProperty(option)) {
    //         violinPlots.options[option] = options[option];
    //     }
    // }
    const vOpts = violinPlots.options;

    // Create violin plot objects
    for (const cName in groupObjs) {
      if (groupObjs.hasOwnProperty(cName)) {
        groupObjs[cName].violin = {};
        groupObjs[cName].violin.objs = {};
      }
    }

    violinPlots.change = function(updateOptions) {
      if (updateOptions) {
        for (const key in updateOptions) {
          if (updateOptions.hasOwnProperty(key)) {
            vOpts[key] = updateOptions[key];
          }
        }
      }

      for (const cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          groupObjs[cName].violin.objs.g.remove();
        }
      }
      violinPlots.prepareViolin();
      violinPlots.update();
    };

    violinPlots.reset = function() {
      violinPlots.change(defaultOptions);
    };

    violinPlots.show = function(opts) {
      if (opts !== undefined) {
        opts.show = true;
        if (opts.reset) {
          violinPlots.reset();
        }
      } else {
        opts = { show: true };
      }
      violinPlots.change(opts);
    };

    violinPlots.hide = function(opts) {
      if (opts !== undefined) {
        opts.show = false;
        if (opts.reset) {
          violinPlots.reset();
        }
      } else {
        opts = { show: false };
      }
      violinPlots.change(opts);
    };

    // Update the violin obj values
    violinPlots.update = function() {
      let cName, cViolinPlot;

      for (cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          const pointValues = _.map(groupObjs[cName].values, function(d) {
            return d[settings.pointValue];
          });

          cViolinPlot = groupObjs[cName].violin;

          // Build the violins sideways, so use the yScale for the xScale and make a new yScale
          var xVScale = yScale.copy(pointValues);

          // Create the Kernel Density Estimator Function
          cViolinPlot.kde = kernelDensityEstimator(
            eKernel(groupObjs[cName].metrics.bw),
            xVScale.ticks(512)
          );

          cViolinPlot.kdedata = cViolinPlot.kde(pointValues);

          let interpolateMax = groupObjs[cName].metrics.max;
          let interpolateMin = groupObjs[cName].metrics.min;

          if (vOpts.clamp === 0 || vOpts.clamp === -1) {
            // When clamp is 0, calculate the min and max that is needed to bring the violin plot to a point
            // interpolateMax = the Minimum value greater than the max where y = 0
            interpolateMax = d3.min(
              cViolinPlot.kdedata.filter(function(d) {
                return d.x > groupObjs[cName].metrics.max && d.y === 0;
              }),
              function(d: any) {
                return d.x;
              }
            );

            // interpolateMin = the Maximum value less than the min where y = 0
            interpolateMin = d3.max(
              cViolinPlot.kdedata.filter(function(d) {
                return d.x < groupObjs[cName].metrics.min && d.y === 0;
              }),
              function(d: any) {
                return d.x;
              }
            );

            // If clamp is -1 we need to extend the axises so that the violins come to a point
            if (vOpts.clamp === -1) {
              const kdeTester = eKernelTest(
                eKernel(groupObjs[cName].metrics.bw),
                pointValues
              );

              if (!interpolateMax) {
                let interMaxY = kdeTester(groupObjs[cName].metrics.max);
                let interMaxX = groupObjs[cName].metrics.max;
                // tslint:disable-next-line:no-shadowed-variable
                let count = 25; // Arbitrary limit to make sure we don't get an infinite loop
                while (count > 0 && interMaxY !== 0) {
                  interMaxY = kdeTester(interMaxX);
                  interMaxX += 1;
                  count -= 1;
                }
                interpolateMax = interMaxX;
              }

              if (!interpolateMin) {
                let interMinY = kdeTester(groupObjs[cName].metrics.min);
                let interMinX = groupObjs[cName].metrics.min;
                let count = 25; // Arbitrary limit to make sure we don't get an infinite loop
                while (count > 0 && interMinY !== 0) {
                  interMinY = kdeTester(interMinX);
                  interMinX -= 1;
                  count -= 1;
                }
                interpolateMin = interMinX;
              }
            }

            // Check to see if the new values are outside the existing chart range
            //   If they are assign them to the master _yDomainVP
            if (!vOpts._yDomainVP) {
              vOpts._yDomainVP = range.slice(0);
            }

            if (interpolateMin && interpolateMin < vOpts._yDomainVP[0]) {
              vOpts._yDomainVP[0] = interpolateMin;
            }

            if (interpolateMax && interpolateMax > vOpts._yDomainVP[1]) {
              vOpts._yDomainVP[1] = interpolateMax;
            }
          }

          if (vOpts.showViolinPlot) {
            xVScale = yScale.copy();

            // Need to recalculate the KDE because the xVScale changed
            cViolinPlot.kde = kernelDensityEstimator(
              eKernel(groupObjs[cName].metrics.bw),
              xVScale.ticks(512)
            );
            cViolinPlot.kdedata = cViolinPlot.kde(pointValues);
          }

          cViolinPlot.kdedata = cViolinPlot.kdedata
            .filter(function(d) {
              return !interpolateMin || d.x >= interpolateMin;
            })
            .filter(function(d) {
              return !interpolateMax || d.x <= interpolateMax;
            });
        }
      }

      for (cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          cViolinPlot = groupObjs[cName].violin;

          // Get the violin width
          const objBounds = self.getObjWidth(vOpts.width, cName, xScale);
          const width = (objBounds.right - objBounds.left) / 2;

          const max: any = d3.max(cViolinPlot.kdedata, function(d: any) {
            return d.y;
          });

          if (max) {
            const yVScale = d3
              .scaleLinear()
              .range([width, 0])
              .domain([0, max])
              .clamp(true);

            const area = d3
              .area()
              .curve(vOpts.interpolation)
              .x(function(d: any) {
                return xVScale(d.x);
              })
              .y0(width)
              .y1(function(d: any) {
                return yVScale(d.y);
              });

            const line = d3
              .line()
              .curve(vOpts.interpolation)
              .x(function(d: any) {
                return xVScale(d.x);
              })
              .y(function(d: any) {
                return yVScale(d.y);
              });

            if (cViolinPlot.objs.left.area) {
              cViolinPlot.objs.left.area
                .datum(cViolinPlot.kdedata)
                .attr('d', area);
              cViolinPlot.objs.left.line
                .datum(cViolinPlot.kdedata)
                .attr('d', line);

              cViolinPlot.objs.right.area
                .datum(cViolinPlot.kdedata)
                .attr('d', area);
              cViolinPlot.objs.right.line
                .datum(cViolinPlot.kdedata)
                .attr('d', line);
            }

            // Rotate the violins
            cViolinPlot.objs.left.g.attr(
              'transform',
              'rotate(90,0,0)   translate(0,-' +
                objBounds.left +
                ')  scale(1,-1)'
            );
            cViolinPlot.objs.right.g.attr(
              'transform',
              'rotate(90,0,0)  translate(0,-' + objBounds.right + ')'
            );
          }
        }
      }

      // Create the svg elements for the violin plot
      violinPlots.prepareViolin = function() {
        let cName, cViolinPlot;

        if (vOpts.colors) {
          violinPlots.color = self.getColorFunct(vOpts.colors, groupObjs);
        } else {
          violinPlots.color = colorFunct;
        }

        if (vOpts.show === false) {
          return;
        }

        for (cName in groupObjs) {
          if (groupObjs.hasOwnProperty(cName)) {
            cViolinPlot = groupObjs[cName].violin;

            cViolinPlot.objs.g = objs.g
              .append('g')
              .attr('class', 'violin-plot');
            cViolinPlot.objs.left = { area: null, line: null, g: null };
            cViolinPlot.objs.right = { area: null, line: null, g: null };

            cViolinPlot.objs.left.g = cViolinPlot.objs.g.append('g');
            cViolinPlot.objs.right.g = cViolinPlot.objs.g.append('g');

            if (vOpts.showViolinPlot !== false) {
              // Area
              cViolinPlot.objs.left.area = cViolinPlot.objs.left.g
                .append('path')
                .attr('class', 'area')
                .style('fill', violinPlots.color(cName))
                .style('opacity', '.3');
              cViolinPlot.objs.right.area = cViolinPlot.objs.right.g
                .append('path')
                .attr('class', 'area')
                .style('fill', violinPlots.color(cName))
                .style('opacity', '.3');
              // Lines
              cViolinPlot.objs.left.line = cViolinPlot.objs.left.g
                .append('path')
                .attr('class', 'line')
                .attr('fill', 'none')
                .style('stroke-width', '2px')
                .style('opacity', '1')
                .style('stroke', violinPlots.color(cName));
              cViolinPlot.objs.right.line = cViolinPlot.objs.right.g
                .append('path')
                .attr('class', 'line')
                .attr('fill', 'none')
                .style('stroke-width', '2px')
                .style('opacity', '1')
                .style('stroke', violinPlots.color(cName));
            }
          }
        }
      };

      function kernelDensityEstimator(kernel, x) {
        return function(sample) {
          return x.map(function(x1) {
            return {
              x: x1,
              y: d3.mean(sample, function(v: any) {
                return kernel(x1 - v);
              })
            };
          });
        };
      }

      function eKernel(scale) {
        return function(u) {
          u = u / scale;
          // gaussian
          return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
        };
      }

      // Used to find the roots for adjusting violin axis
      // Given an array, find the value for a single point, even if it is not in the domain
      function eKernelTest(kernel, array) {
        return function(testX) {
          return d3.mean(array, function(v: any) {
            return kernel(testX - v);
          });
        };
      }

      violinPlots.prepareViolin();

      // D3 inline style is needed to maintain style on export
      d3.selectAll('.violin-chart-wrapper .y.axis .tick line')
        .style('opacity', '0.6')
        .style('shape-rendering', 'crispEdges')
        .style('stroke', 'white')
        .style('stroke-dasharray', '2,1')
        .style('stroke-width', '1');

      // PAUL where do i set selector?
      // d3.select(window).on('resize.' + this.state.selector + '.violinPlot', violinPlots.update);
      violinPlots.update();
    };

    // renderDataPlots
    let showPlot = true;
    var id = '';

    // Defaults
    const defaultOptions2 = {
      show: true,
      showPlot: true,
      // PAUL showPlot: false
      plotType: 'scatter',
      pointSize: 6,
      showBeanLines: false,
      beanWidth: 20,
      colors: null
    };

    dataPlots.options = self.shallowCopy(defaultOptions2);
    // PAUL - do we need this code?
    // for (const option in options) {
    //     if (options.hasOwnProperty(option)) {
    //         dataPlots.options[option] = options[option];
    //     }
    // }
    const dOpts = dataPlots.options;

    // Create notch objects
    for (const cName in groupObjs) {
      if (groupObjs.hasOwnProperty(cName)) {
        groupObjs[cName].dataPlots = {};
        groupObjs[cName].dataPlots.objs = {};
      }
    }
    // The lines don't fit into a group bucket so they live under the dataPlot object
    dataPlots.objs = {};

    dataPlots.change = function(updateOptions) {
      if (updateOptions) {
        for (const key in updateOptions) {
          if (updateOptions.hasOwnProperty(key)) {
            dOpts[key] = updateOptions[key];
          }
        }
      }

      dataPlots.objs.g.remove();
      for (const cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          groupObjs[cName].dataPlots.objs.g.remove();
        }
      }
      dataPlots.preparePlots();
      dataPlots.update();
    };

    dataPlots.reset = function() {
      dataPlots.change(defaultOptions2);
    };
    dataPlots.show = function(opts) {
      if (opts !== undefined) {
        opts.show = true;
        if (opts.reset) {
          dataPlots.reset();
        }
      } else {
        opts = { show: true };
      }
      dataPlots.change(opts);
    };
    dataPlots.hide = function(opts) {
      if (opts !== undefined) {
        opts.show = false;
        if (opts.reset) {
          dataPlots.reset();
        }
      } else {
        opts = { show: false };
      }
      dataPlots.change(opts);
    };

    /**
     * Update the data plot obj values
     */
    dataPlots.update = function() {
      let cName, cGroup, cPlot;

      // Metrics lines
      if (dataPlots.objs.g) {
        const halfBand = xScale.bandwidth() / 2; // find the middle of each band
        for (const cMetric in dataPlots.objs.lines) {
          if (dataPlots.objs.lines.hasOwnProperty(cMetric)) {
            dataPlots.objs.lines[cMetric].line.x(function(d) {
              return xScale(d.x) + halfBand;
            });
            dataPlots.objs.lines[cMetric].g
              .datum(dataPlots.objs.lines[cMetric].values)
              .attr('d', dataPlots.objs.lines[cMetric].line);
          }
        }
      }

      for (cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          cGroup = groupObjs[cName];
          cPlot = cGroup.dataPlots;

          if (cPlot.objs.points) {
            // For scatter points and points with no scatter
            let plotBounds = null,
              scatterWidth = 0,
              width = 0;
            if (
              dOpts.plotType === 'scatter' ||
              typeof dOpts.plotType === 'number'
            ) {
              // Default scatter percentage is 20% of box width
              scatterWidth =
                typeof dOpts.plotType === 'number' ? dOpts.plotType : 20;
            }

            plotBounds = self.getObjWidth(scatterWidth, cName, xScale);
            width = plotBounds.right - plotBounds.left;

            for (let pt = 0; pt < cGroup.values.length; pt++) {
              cPlot.objs.points.pts[pt]
                .attr('cx', function() {
                  return plotBounds.middle + self.addJitter(true, width);
                })
                .attr('cy', function() {
                  return yScale(cGroup.values[pt][settings.pointValue]);
                });
            }
          }
        }
      }
    };

    // Create the svg elements for the data plots
    dataPlots.preparePlots = function() {
      let cName, cPlot;
      if (dOpts && dOpts.colors) {
        dataPlots.colorFunct = self.getColorFunct(dOpts.colors, groupObjs);
      } else {
        dataPlots.colorFunct = colorFunct;
      }

      if (dOpts.show === false) {
        return;
      }

      // for (cName in groupObjs) {
      //   if (groupObjs.hasOwnProperty(cName)) {
      //     cPlot = groupObjs[cName].dataPlots;

      //     // Points Plot
      //     if (dOpts.showPlot) {
      //       cPlot.objs.points = { g: null, pts: [] };
      //       cPlot.objs.points.g = objs.g
      //         .append('g')
      //         .attr('class', 'points-plot');
      //       for (let pt = 0; pt < groupObjs[cName].values.length; pt++) {
      //         var max = self.getMaxStat(groupObjs[cName].values);
      //         cPlot.objs.points.pts.push(
      //           cPlot.objs.points.g
      //             .append('circle')
      //             .attr('id', function(d: any) {
      //               var id = groupObjs[cName].values[pt][
      //                 settings.pointUniqueId
      //               ].replace(/\./g, '');
      //               var id_mult = groupObjs[cName].values[pt].id_mult;
      //               return 'violin_' + id.replace(/\;/g, '_') + '_' + id_mult;
      //             })
      //             .attr('class', 'point ' + settings.id + ' vPoint')
      //             .attr('stroke', 'black')
      //             .attr('r', function() {
      //               if (groupObjs[cName].values[pt].statistic === max) {
      //                 return dOpts.pointSize / 1;
      //               } else {
      //                 return dOpts.pointSize / 2;
      //               }
      //             })
      //             .attr('fill', function(d) {
      //               if (groupObjs[cName].values[pt].statistic === max) {
      //                 id = groupObjs[cName].values[pt];
      //                 self.maxCircle = id;
      //                 return 'orange';
      //               } else {
      //                 return dataPlots.colorFunct(cName);
      //               }
      //             })
      //         );
      //       }
      //     }

      //     const circleData = _.forEach(groupObjs[cName].values, function(
      //       value,
      //       key
      //     ) {
      //       value[settings.xName] = cName;
      //     });

      //     cPlot.objs.points.g
      //       .selectAll('circle')
      //       .data(circleData)
      //       .attr('pointer-events', 'all')
      //       .on('mouseover', function(d) {
      //         self.dotHover.emit({ object: d, action: 'mouseover' });
      //         self.isHovering = true;
      //         d3.select('#violin_' + self.getCircleId(d.sample, d.id_mult))
      //           .transition()
      //           .duration(100)
      //           .attr('cursor', 'pointer')
      //           .attr('r', 6);
      //         if (settings.tooltip.show) {
      //           const m = d3.mouse(objs.chartDiv.node());
      //           objs.tooltip
      //             .style('left', m[0] + 10 + 'px')
      //             .style('top', m[1] - 10 + 'px');
      //           objs.tooltip
      //             .transition()
      //             .delay(500)
      //             .duration(500)
      //             .style('opacity', 1)
      //             .style('display', null);
      //           return self.tooltipHover(d, objs);
      //         }
      //       })
      //       .on('mouseout', function(d) {
      //         d3.select('#violin_' + self.getCircleId(d.sample, d.id_mult))
      //           .transition()
      //           .duration(300)
      //           .attr('r', function(d) {
      //             if (self.maxCircle.sample !== d.sample) {
      //               return dOpts.pointSize / 2;
      //             } else {
      //               return dOpts.pointSize / 1;
      //             }
      //           });

      //         self.dotHover.emit({ object: d, action: 'mouseout' });
      //         if (self.isHovering) {
      //           objs.tooltip
      //             .transition()
      //             .duration(500)
      //             .style('opacity', 0);
      //         }
      //       })
      //       .on('click', function(d) {
      //         self.isHovering = false;
      //         var maxId = self.getCircleId(
      //           self.maxCircle.sample,
      //           self.maxCircle.id_mult
      //         );
      //         var id = self.getCircleId(d.sample, d.id_mult);
      //         self.dotClick.emit(d);

      //         d3.select('#violin_' + maxId)
      //           .transition()
      //           .duration(300)
      //           .attr('fill', '#1f77b4')
      //           .attr('r', dOpts.pointSize / 2);

      //         d3.select('#violin_' + id)
      //           .transition()
      //           .duration(100)
      //           .attr('fill', 'orange')
      //           .attr('r', dOpts.pointSize / 1);

      //         self.maxCircle = d;
      //         self.addToolTiptoMax(self.maxCircle, objs);
      //       });
      //   }
      // }
    };

    dataPlots.preparePlots();
    dataPlots.update();
    // Paul uncomment after foundation set
    // this.addToolTiptoMax(id, objs);

    // Defaults
    const defaultOptions3 = {
      show: true,
      showBox: true,
      showWhiskers: true,
      showMedian: true,
      showMean: false,
      medianCSize: 3.5,
      boxWidth: 30,
      lineWidth: null,
      outlierCSize: 2.5,
      colors: colorFunct
    };
    boxPlots.options = self.shallowCopy(defaultOptions3);
    for (const option in boxPlots.options) {
      if (boxPlots.options.hasOwnProperty(option)) {
        boxPlots.options[option] = boxPlots.options[option];
      }
    }
    const bOpts = boxPlots.options;

    // Create box plot objects
    for (const cName in groupObjs) {
      if (groupObjs.hasOwnProperty(cName)) {
        groupObjs[cName].boxPlot = {};
        groupObjs[cName].boxPlot.objs = {};
      }
    }

    boxPlots.change = function(updateOptions) {
      if (updateOptions) {
        for (const key in updateOptions) {
          if (updateOptions.hasOwnProperty(key)) {
            bOpts[key] = updateOptions[key];
          }
        }
      }

      for (const cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          groupObjs[cName].boxPlot.objs.g.remove();
        }
      }
      boxPlots.prepareBoxPlot();
      boxPlots.update();
    };

    boxPlots.reset = function() {
      boxPlots.change(defaultOptions3);
    };
    boxPlots.show = function(opts) {
      if (opts !== undefined) {
        opts.show = true;
        if (opts.reset) {
          boxPlots.reset();
        }
      } else {
        opts = { show: true };
      }
      boxPlots.change(opts);
    };
    boxPlots.hide = function(opts) {
      if (opts !== undefined) {
        opts.show = false;
        if (opts.reset) {
          boxPlots.reset();
        }
      } else {
        opts = { show: false };
      }
      boxPlots.change(opts);
    };

    // Update the box plot obj values
    boxPlots.update = function() {
      let cName, cBoxPlot;

      for (cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          cBoxPlot = groupObjs[cName].boxPlot;

          // Get the box width
          const objBounds = self.getObjWidth(bOpts.boxWidth, cName, xScale);
          const width = objBounds.right - objBounds.left;

          const sMetrics: any = {}; // temp var for scaled (plottable) metric values
          for (const attr in groupObjs[cName].metrics) {
            if (groupObjs[cName].metrics.hasOwnProperty(attr)) {
              sMetrics[attr] = null;
              sMetrics[attr] = yScale(groupObjs[cName].metrics[attr]);
            }
          }

          // Box
          if (cBoxPlot.objs.box) {
            cBoxPlot.objs.box
              .attr('x', objBounds.left)
              .attr('width', width)
              .attr('y', sMetrics.quartile3)
              .attr('rx', 1)
              .attr('ry', 1)
              .attr('height', -sMetrics.quartile3 + sMetrics.quartile1);
          }

          // Lines
          let lineBounds = null;
          if (bOpts.lineWidth) {
            lineBounds = self.getObjWidth(bOpts.lineWidth, cName, xScale);
          } else {
            lineBounds = objBounds;
          }
          // --Whiskers
          if (cBoxPlot.objs.upperWhisker) {
            cBoxPlot.objs.upperWhisker.fence
              .attr('x1', lineBounds.left)
              .attr('x2', lineBounds.right)
              .attr('y1', sMetrics.upperInnerFence)
              .attr('y2', sMetrics.upperInnerFence);
            cBoxPlot.objs.upperWhisker.line
              .attr('x1', lineBounds.middle)
              .attr('x2', lineBounds.middle)
              .attr('y1', sMetrics.quartile3)
              .attr('y2', sMetrics.upperInnerFence);

            cBoxPlot.objs.lowerWhisker.fence
              .attr('x1', lineBounds.left)
              .attr('x2', lineBounds.right)
              .attr('y1', sMetrics.lowerInnerFence)
              .attr('y2', sMetrics.lowerInnerFence);
            cBoxPlot.objs.lowerWhisker.line
              .attr('x1', lineBounds.middle)
              .attr('x2', lineBounds.middle)
              .attr('y1', sMetrics.quartile1)
              .attr('y2', sMetrics.lowerInnerFence);
          }

          // --Median
          if (cBoxPlot.objs.median) {
            cBoxPlot.objs.median.line
              .attr('x1', lineBounds.left)
              .attr('x2', lineBounds.right)
              .attr('y1', sMetrics.median)
              .attr('y2', sMetrics.median);
            cBoxPlot.objs.median.circle
              .attr('cx', lineBounds.middle)
              .attr('cy', sMetrics.median);
          }

          // --Mean
          if (cBoxPlot.objs.mean) {
            cBoxPlot.objs.mean.line
              .attr('x1', lineBounds.left)
              .attr('x2', lineBounds.right)
              .attr('y1', sMetrics.mean)
              .attr('y2', sMetrics.mean);
            cBoxPlot.objs.mean.circle
              .attr('cx', lineBounds.middle)
              .attr('cy', sMetrics.mean);
          }
        }
      }
    };

    /**
     * Create the svg elements for the box plot
     */
    boxPlots.prepareBoxPlot = function() {
      let cName, cBoxPlot;

      if (bOpts.colors) {
        boxPlots.colorFunct = self.getColorFunct(bOpts.colors, groupObjs);
      } else {
        boxPlots.colorFunct = colorFunct;
      }

      if (bOpts.show === false) {
        return;
      }

      for (cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          cBoxPlot = groupObjs[cName].boxPlot;

          cBoxPlot.objs.g = objs.g.append('g').attr('class', 'box-plot');

          // Plot Box (default show)
          if (bOpts.showBox) {
            cBoxPlot.objs.box = cBoxPlot.objs.g
              .append('rect')
              .attr('class', 'box')
              .attr('fill', boxPlots.colorFunct(cName))
              .attr('opacity', '0.4')
              .attr('stroke', boxPlots.colorFunct(cName))
              .attr('stroke-width', '2');
            // A stroke is added to the box with the group color, it is
            // hidden by default and can be shown through css with stroke-width
          }

          // Plot Median (default show)
          if (bOpts.showMedian) {
            cBoxPlot.objs.median = { line: null, circle: null };
            cBoxPlot.objs.median.line = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'median');
            cBoxPlot.objs.median.circle = cBoxPlot.objs.g
              .append('circle')
              .attr('class', 'median')
              .attr('r', bOpts.medianCSize)
              .attr('fill', boxPlots.colorFunct(cName));
          }

          // Plot Mean (default no plot)
          if (bOpts.showMean) {
            cBoxPlot.objs.mean = { line: null, circle: null };
            cBoxPlot.objs.mean.line = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'mean');
            cBoxPlot.objs.mean.circle = cBoxPlot.objs.g
              .append('circle')
              .attr('class', 'mean')
              .attr('r', bOpts.medianCSize)
              .attr('fill', boxPlots.colorFunct(cName));
          }

          // Plot Whiskers (default show)
          if (bOpts.showWhiskers) {
            cBoxPlot.objs.upperWhisker = { fence: null, line: null };
            cBoxPlot.objs.lowerWhisker = { fence: null, line: null };
            cBoxPlot.objs.upperWhisker.fence = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'upper whisker')
              .style('stroke', boxPlots.colorFunct(cName));
            cBoxPlot.objs.upperWhisker.line = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'upper whisker')
              .attr('stroke', boxPlots.colorFunct(cName));

            cBoxPlot.objs.lowerWhisker.fence = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'lower whisker')
              .attr('stroke', boxPlots.colorFunct(cName));
            cBoxPlot.objs.lowerWhisker.line = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'lower whisker')
              .attr('stroke', boxPlots.colorFunct(cName));
          }
        }
      }
    };
    boxPlots.prepareBoxPlot();
    boxPlots.update();
    return self.chart;
  };

  getCircleId = (id, id_mult) => {
    return id.replace(/;/g, '_') + '_' + id_mult;
  };

  addToolTiptoMax = (id, objs) => {
    var cx = Math.ceil(
      d3.select('#violin_' + this.getCircleId(id.sample, id.id_mult)).attr('cx')
    );
    var cy = Math.ceil(
      d3.select('#violin_' + this.getCircleId(id.sample, id.id_mult)).attr('cy')
    );
    var svg = document.getElementById('svg-violin-graph-1');
    var parent = document
      .getElementById('violin-graph-1')
      .getBoundingClientRect();
    var shape = document
      .getElementById('violin_' + this.getCircleId(id.sample, id.id_mult))
      .getBoundingClientRect();
    var relative = shape.left - parent.left;
    var res = this.getPos(cx, cy, svg, svg);

    objs.tooltip
      .transition()
      .duration(300)
      .style('left', relative + 20 + 'px')
      .style('top', res.y + 20 + 'px')
      .style('opacity', 1)
      .style('display', null);

    this.tooltipHover(id, objs);
  };

  getPos = (x, y, svg, element) => {
    var p = svg.createSVGPoint();
    var ctm = element.getCTM();
    p.x = x;
    p.y = y;
    return p.matrixTransform(ctm);
  };

  getMaxStat = array => {
    // finds the highest value based on t statistics
    // used to figure out which dot gets highlighted
    var max = Math.max.apply(
      Math,
      array.map(function(o) {
        return o.statistic;
      })
    );
    return max;
  };

  highlightPoint = selectedArray => {
    _.forEach(selectedArray.t.values, function(newPoint) {
      console.log('newPoint', newPoint);
      d3.select('#violin_' + newPoint.sample)
        .transition()
        .duration(100)
        .attr('r', 10)
        .attr('stroke-width', 2);
    });
  };

  unhighlightPoint = (unselectedArray, clearAll = false) => {
    if (clearAll) {
      const allPoints = d3.selectAll('.' + this.state.settings.id + '.vPoint');
      allPoints
        .attr(
          'class',
          'non_brushed point ' + this.state.settings.id + ' vPoint'
        )
        .attr('r', 3)
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('fill', function(d: any, i: any) {
          return this.state.dataPlots.colorFunct(d[this.state.settings.xName]);
        });
    }
    _.forEach(unselectedArray, function(oldPoint) {
      d3.select('#violin_' + oldPoint._row.replace(/\./g, ''))
        .transition()
        .duration(100)
        .attr('r', 3)
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('fill', function(d: any, i: any) {
          return this.state.dataPlots.colorFunct(d[this.state.settings.xName]);
        });
    });
  };

  tooltipHover = (d, objs) => {
    const tooltipFields = this.state.settings.tooltip.fields;

    let tooltipString = '';
    _.forEach(tooltipFields, function(field) {
      tooltipString +=
        `<span>` + field.label + ` = ` + d[field.value] + `</span><br/>`;
    });

    objs.tooltip.html(tooltipString);
    objs.tooltip.style('z-index', 100);
  };

  // moving this to ComponentDidUpdate
  // dUpdate = (chart, data, settings) => {
  //   d3.select('.violin-chart-wrapper')
  //     .selectAll('*')
  //     .remove();
  //   this.chart.settings.data = data;
  //   this.settings = settings;
  //   const self = this;
  //   this.makeChart();
  // };

  getColorFunct = (colorOptions, groupObjs) => {
    if (typeof colorOptions === 'function') {
      return colorOptions;
    } else if (Array.isArray(colorOptions)) {
      //  If an array is provided, map it to the domain
      const colorMap = {};
      let cColor = 0;
      for (const cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          colorMap[cName] = colorOptions[cColor];
          cColor = (cColor + 1) % colorOptions.length;
        }
      }
      return function(group) {
        return colorMap[group];
      };
    } else if (typeof colorOptions === 'object') {
      // if an object is provided, assume it maps to  the colors
      return function(group) {
        return colorOptions[group];
      };
    } else {
      return d3.scaleOrdinal(d3.schemeCategory10);
    }
  };

  formatAsFloat = d => {
    if (d % 1 !== 0) {
      return d3.format('.2f')(d);
    } else {
      return d3.format('.0f')(d);
    }
  };

  shallowCopy = oldObj => {
    const newObj = {};
    for (const i in oldObj) {
      if (oldObj.hasOwnProperty(i)) {
        newObj[i] = oldObj[i];
      }
    }
    return newObj;
  };

  addJitter = (doJitter, width) => {
    if (doJitter !== true || width === 0) {
      return 0;
    }
    return Math.floor(Math.random() * width) - width / 2;
  };

  getObjWidth = (objWidth, gName, xScale) => {
    const objSize = { left: null, right: null, middle: null };
    const width = xScale.bandwidth() * (objWidth / 100);
    const padding = (xScale.bandwidth() - width) / 2;
    const gShift = xScale(gName);
    objSize.middle = xScale.bandwidth() / 2 + gShift;
    objSize.left = padding + gShift;
    objSize.right = objSize.left + width;
    return objSize;
  };

  // handleViolinDotClickTest = () => {
  //   this.props.onViolinDotClick({
  //     dotHighlighted: []
  //   });
  // };

  render() {
    const { violinHeight, violinWidth } = this.state;
    return (
      <Fragment>
        <div
          id={this.state.settings.id}
          className="violin-chart-wrapper"
          ref={this.violinChartRef}
        ></div>
        {/* <svg
          ref={this.violinSVGRef}
          id="test-violin-dot"
          // className=""
          height={violinHeight}
          width={violinWidth}
          viewBox={`0 0 ${violinWidth} ${violinHeight}`}
          preserveAspectRatio="xMinYMin meet"
          onClick={e => this.props.onHandleViolinDotSelected(this.id, e)}
          // cursor="crosshair"
          // {...props}
        ></svg> */}
        <svg
          className="prefix__chart-area prefix__vChart"
          viewBox="0 0 880 557"
          preserveAspectRatio="xMinYMin meet"
          // {...props}
        >
          <g className="prefix__axis">
            <g className="prefix__x prefix__axis">
              <text
                className="prefix__label"
                dy="1.5em"
                y={-7}
                fontSize={18}
                fontWeight={700}
                fontFamily="Roboto"
                transform="translate(50 517)"
              >
                <tspan x={346.875}>{'GO:0000118'}</tspan>
              </text>
            </g>
            <g
              className="prefix__y prefix__axis"
              fill="none"
              fontSize={10}
              fontFamily="sans-serif"
              textAnchor="end"
            >
              <path
                className="prefix__domain"
                stroke="currentColor"
                d="M50.5 517.5v-467"
              />
              <g className="prefix__tick">
                <path
                  stroke="#fff"
                  opacity={0.6}
                  shapeRendering="crispedges"
                  strokeDasharray="2,1"
                  d="M50 517.5h790"
                />
                <text
                  fill="currentColor"
                  x={-3}
                  dy=".32em"
                  transform="translate(50 517.5)"
                >
                  {'-5'}
                </text>
              </g>
              <text
                className="prefix__label"
                dy=".62em"
                transform="rotate(-90 50 0)"
                x={-233.5}
                y={-48}
                fill="#000"
                fontSize={18}
                fontWeight={700}
                fontFamily="Roboto"
              >
                <tspan>
                  {'log'}
                  <tspan baselineShift="sub" fontSize={14}>
                    {'2'}
                  </tspan>
                  {'(FC)'}
                </tspan>
              </text>
            </g>
          </g>
          <g className="prefix__violin-plot">
            <path
              className="prefix__area"
              d="M294.812 455.865l-1.746-.849a4553.803 4553.803 0 00-7.003-3.396l-1.754-.85-1.753-.848-1.754-.85a14002.021 14002.021 0 01-7.006-3.396 3944.76 3944.76 0 01-6.975-3.396 2206.349 2206.349 0 01-6.916-3.396 1477.507 1477.507 0 01-6.83-3.397 1073.05 1073.05 0 01-6.715-3.396 814.14 814.14 0 01-6.569-3.396 633.544 633.544 0 01-6.392-3.397 500.348 500.348 0 01-4.659-2.547 421.52 421.52 0 01-4.527-2.547 356.005 356.005 0 01-4.382-2.548 300.97 300.97 0 01-4.224-2.547 254.39 254.39 0 01-4.051-2.547 214.78 214.78 0 01-3.866-2.547 181.016 181.016 0 01-3.667-2.548 152.227 152.227 0 01-3.457-2.547 127.72 127.72 0 01-3.235-2.547 106.933 106.933 0 01-3.002-2.548 89.395 89.395 0 01-1.867-1.698 79.308 79.308 0 01-1.757-1.698 70.382 70.382 0 01-1.644-1.698 62.521 62.521 0 01-1.53-1.698 55.637 55.637 0 01-1.412-1.698 49.65 49.65 0 01-1.294-1.699 44.483 44.483 0 01-1.175-1.698 40.07 40.07 0 01-1.056-1.698 36.35 36.35 0 01-.934-1.698 33.263 33.263 0 01-.814-1.698 30.763 30.763 0 01-.995-2.548 28.021 28.021 0 01-.726-2.547 26.392 26.392 0 01-.559-3.396 25.84 25.84 0 01-.106-3.397 27.114 27.114 0 01.205-2.547 29.346 29.346 0 01.434-2.547 32.82 32.82 0 01.41-1.698 35.933 35.933 0 01.501-1.699 39.8 39.8 0 01.588-1.698 44.561 44.561 0 01.668-1.698 50.41 50.41 0 01.743-1.698 57.634 57.634 0 01.813-1.698 66.658 66.658 0 01.875-1.698 78.147 78.147 0 011.415-2.548 102.636 102.636 0 011.517-2.547 143.792 143.792 0 011.594-2.547 229.055 229.055 0 011.647-2.548l.556-.849.557-.849.559-.849.558-.849a755.674 755.674 0 001.664-2.547 262.785 262.785 0 001.627-2.547 155.418 155.418 0 001.563-2.548 107.6 107.6 0 001.473-2.547 80.243 80.243 0 00.92-1.698 67.666 67.666 0 00.86-1.698 57.899 57.899 0 00.794-1.699 50.146 50.146 0 00.721-1.698 43.91 43.91 0 00.642-1.698 38.866 38.866 0 00.556-1.698 34.787 34.787 0 00.464-1.698 31.518 31.518 0 00.366-1.698 28.946 28.946 0 00.355-2.548 26.223 26.223 0 00.108-2.547 24.709 24.709 0 00-.263-3.396 24.422 24.422 0 00-.752-3.397 26.1 26.1 0 00-.896-2.547 28.742 28.742 0 00-.758-1.698 31.232 31.232 0 00-.888-1.698 34.368 34.368 0 00-1.017-1.699 38.213 38.213 0 00-1.146-1.698 42.842 42.842 0 00-1.275-1.698 48.342 48.342 0 00-1.402-1.698 54.813 54.813 0 00-1.527-1.698 62.368 62.368 0 00-1.65-1.698 71.14 71.14 0 00-1.77-1.699 81.284 81.284 0 00-1.885-1.698 92.986 92.986 0 00-1.998-1.698 106.471 106.471 0 00-2.107-1.698 122.02 122.02 0 00-2.21-1.698 139.99 139.99 0 00-3.497-2.548 172.546 172.546 0 00-3.7-2.547 213.968 213.968 0 00-3.882-2.547 268.15 268.15 0 00-4.04-2.547 342.171 342.171 0 00-4.176-2.548 450.382 450.382 0 00-4.287-2.547 626.877 626.877 0 00-4.37-2.547 976.822 976.822 0 00-4.429-2.548 2060.5 2060.5 0 00-2.97-1.698l-1.489-.849-1.488-.849-1.487-.849a2566.607 2566.607 0 01-4.448-2.547 1073.747 1073.747 0 01-4.403-2.548 662.375 662.375 0 01-4.332-2.547 465.65 465.65 0 01-4.233-2.547 348.211 348.211 0 01-4.107-2.547 269.109 269.109 0 01-3.955-2.548 211.759 211.759 0 01-3.778-2.547 168.192 168.192 0 01-3.576-2.547 134.106 134.106 0 01-2.26-1.698 115.356 115.356 0 01-2.155-1.699 99.177 99.177 0 01-2.042-1.698 85.19 85.19 0 01-1.924-1.698 73.1 73.1 0 01-1.799-1.698 62.667 62.667 0 01-1.67-1.698 53.699 53.699 0 01-1.536-1.698 46.032 46.032 0 01-1.396-1.699 39.526 39.526 0 01-1.253-1.698 34.06 34.06 0 01-1.106-1.698 29.528 29.528 0 01-.955-1.698 25.833 25.833 0 01-.8-1.698 22.894 22.894 0 01-.644-1.699 20.64 20.64 0 01-.483-1.698 19.013 19.013 0 01-.323-1.698 17.968 17.968 0 01-.176-2.547 17.431 17.431 0 01.344-3.397 18.612 18.612 0 01.422-1.698 20.055 20.055 0 01.589-1.698 22.12 22.12 0 01.755-1.698 24.863 24.863 0 01.921-1.698 28.355 28.355 0 011.086-1.698 32.675 32.675 0 011.25-1.699 37.915 37.915 0 011.411-1.698 44.171 44.171 0 011.572-1.698 51.55 51.55 0 011.73-1.698 60.165 60.165 0 011.884-1.698 70.136 70.136 0 012.036-1.699 81.594 81.594 0 012.186-1.698 94.675 94.675 0 012.332-1.698 109.532 109.532 0 012.473-1.698 126.327 126.327 0 012.612-1.698 145.24 145.24 0 012.745-1.698 166.476 166.476 0 012.876-1.699 190.26 190.26 0 013-1.698 216.857 216.857 0 014.724-2.547 262.7 262.7 0 014.979-2.547 316.834 316.834 0 015.215-2.548 380.929 380.929 0 015.434-2.547 457.253 457.253 0 015.635-2.547 548.987 548.987 0 015.816-2.547 660.747 660.747 0 015.979-2.548 799.499 799.499 0 016.122-2.547 976.267 976.267 0 018.354-3.396 1304.99 1304.99 0 018.531-3.397 1829.397 1829.397 0 018.665-3.396 2812.926 2812.926 0 018.756-3.396 5391.064 5391.064 0 018.806-3.397l2.205-.849 2.206-.849 2.205-.85a12890.36 12890.36 0 008.804-3.395 4647.21 4647.21 0 008.757-3.397 2878.887 2878.887 0 008.676-3.396 2098.988 2098.988 0 008.569-3.397 1655.009 1655.009 0 0010.521-4.245 1308.173 1308.173 0 0010.272-4.245 1078.62 1078.62 0 009.988-4.246 914.236 914.236 0 009.677-4.245 790.206 790.206 0 009.344-4.246 693.156 693.156 0 008.999-4.245 615.188 615.188 0 008.644-4.246 551.285 551.285 0 008.284-4.245 498.057 498.057 0 007.927-4.246l1.542-.849c.512-.283 1.529-.849 1.529-.849H445V455.866z"
              fill="#1f77b4"
              opacity={0.3}
            />
            <path
              className="prefix__line"
              fill="none"
              d="M294.812 455.865l-1.746-.849a4553.803 4553.803 0 00-7.003-3.396l-1.754-.85-1.753-.848-1.754-.85a14002.021 14002.021 0 01-7.006-3.396 3944.76 3944.76 0 01-6.975-3.396 2206.349 2206.349 0 01-6.916-3.396 1477.507 1477.507 0 01-6.83-3.397 1073.05 1073.05 0 01-6.715-3.396 814.14 814.14 0 01-6.569-3.396 633.544 633.544 0 01-6.392-3.397 500.348 500.348 0 01-4.659-2.547 421.52 421.52 0 01-4.527-2.547 356.005 356.005 0 01-4.382-2.548 300.97 300.97 0 01-4.224-2.547 254.39 254.39 0 01-4.051-2.547 214.78 214.78 0 01-3.866-2.547 181.016 181.016 0 01-3.667-2.548 152.227 152.227 0 01-3.457-2.547 127.72 127.72 0 01-3.235-2.547 106.933 106.933 0 01-3.002-2.548 89.395 89.395 0 01-1.867-1.698 79.308 79.308 0 01-1.757-1.698 70.382 70.382 0 01-1.644-1.698 62.521 62.521 0 01-1.53-1.698 55.637 55.637 0 01-1.412-1.698 49.65 49.65 0 01-1.294-1.699 44.483 44.483 0 01-1.175-1.698 40.07 40.07 0 01-1.056-1.698 36.35 36.35 0 01-.934-1.698 33.263 33.263 0 01-.814-1.698 30.763 30.763 0 01-.995-2.548 28.021 28.021 0 01-.726-2.547 26.392 26.392 0 01-.559-3.396 25.84 25.84 0 01-.106-3.397 27.114 27.114 0 01.205-2.547 29.346 29.346 0 01.434-2.547 32.82 32.82 0 01.41-1.698 35.933 35.933 0 01.501-1.699 39.8 39.8 0 01.588-1.698 44.561 44.561 0 01.668-1.698 50.41 50.41 0 01.743-1.698 57.634 57.634 0 01.813-1.698 66.658 66.658 0 01.875-1.698 78.147 78.147 0 011.415-2.548 102.636 102.636 0 011.517-2.547 143.792 143.792 0 011.594-2.547 229.055 229.055 0 011.647-2.548l.556-.849.557-.849.559-.849.558-.849a755.674 755.674 0 001.664-2.547 262.785 262.785 0 001.627-2.547 155.418 155.418 0 001.563-2.548 107.6 107.6 0 001.473-2.547 80.243 80.243 0 00.92-1.698 67.666 67.666 0 00.86-1.698 57.899 57.899 0 00.794-1.699 50.146 50.146 0 00.721-1.698 43.91 43.91 0 00.642-1.698 38.866 38.866 0 00.556-1.698 34.787 34.787 0 00.464-1.698 31.518 31.518 0 00.366-1.698 28.946 28.946 0 00.355-2.548 26.223 26.223 0 00.108-2.547 24.709 24.709 0 00-.263-3.396 24.422 24.422 0 00-.752-3.397 26.1 26.1 0 00-.896-2.547 28.742 28.742 0 00-.758-1.698 31.232 31.232 0 00-.888-1.698 34.368 34.368 0 00-1.017-1.699 38.213 38.213 0 00-1.146-1.698 42.842 42.842 0 00-1.275-1.698 48.342 48.342 0 00-1.402-1.698 54.813 54.813 0 00-1.527-1.698 62.368 62.368 0 00-1.65-1.698 71.14 71.14 0 00-1.77-1.699 81.284 81.284 0 00-1.885-1.698 92.986 92.986 0 00-1.998-1.698 106.471 106.471 0 00-2.107-1.698 122.02 122.02 0 00-2.21-1.698 139.99 139.99 0 00-3.497-2.548 172.546 172.546 0 00-3.7-2.547 213.968 213.968 0 00-3.882-2.547 268.15 268.15 0 00-4.04-2.547 342.171 342.171 0 00-4.176-2.548 450.382 450.382 0 00-4.287-2.547 626.877 626.877 0 00-4.37-2.547 976.822 976.822 0 00-4.429-2.548 2060.5 2060.5 0 00-2.97-1.698l-1.489-.849-1.488-.849-1.487-.849a2566.607 2566.607 0 01-4.448-2.547 1073.747 1073.747 0 01-4.403-2.548 662.375 662.375 0 01-4.332-2.547 465.65 465.65 0 01-4.233-2.547 348.211 348.211 0 01-4.107-2.547 269.109 269.109 0 01-3.955-2.548 211.759 211.759 0 01-3.778-2.547 168.192 168.192 0 01-3.576-2.547 134.106 134.106 0 01-2.26-1.698 115.356 115.356 0 01-2.155-1.699 99.177 99.177 0 01-2.042-1.698 85.19 85.19 0 01-1.924-1.698 73.1 73.1 0 01-1.799-1.698 62.667 62.667 0 01-1.67-1.698 53.699 53.699 0 01-1.536-1.698 46.032 46.032 0 01-1.396-1.699 39.526 39.526 0 01-1.253-1.698 34.06 34.06 0 01-1.106-1.698 29.528 29.528 0 01-.955-1.698 25.833 25.833 0 01-.8-1.698 22.894 22.894 0 01-.644-1.699 20.64 20.64 0 01-.483-1.698 19.013 19.013 0 01-.323-1.698 17.968 17.968 0 01-.176-2.547 17.431 17.431 0 01.344-3.397 18.612 18.612 0 01.422-1.698 20.055 20.055 0 01.589-1.698 22.12 22.12 0 01.755-1.698 24.863 24.863 0 01.921-1.698 28.355 28.355 0 011.086-1.698 32.675 32.675 0 011.25-1.699 37.915 37.915 0 011.411-1.698 44.171 44.171 0 011.572-1.698 51.55 51.55 0 011.73-1.698 60.165 60.165 0 011.884-1.698 70.136 70.136 0 012.036-1.699 81.594 81.594 0 012.186-1.698 94.675 94.675 0 012.332-1.698 109.532 109.532 0 012.473-1.698 126.327 126.327 0 012.612-1.698 145.24 145.24 0 012.745-1.698 166.476 166.476 0 012.876-1.699 190.26 190.26 0 013-1.698 216.857 216.857 0 014.724-2.547 262.7 262.7 0 014.979-2.547 316.834 316.834 0 015.215-2.548 380.929 380.929 0 015.434-2.547 457.253 457.253 0 015.635-2.547 548.987 548.987 0 015.816-2.547 660.747 660.747 0 015.979-2.548 799.499 799.499 0 016.122-2.547 976.267 976.267 0 018.354-3.396 1304.99 1304.99 0 018.531-3.397 1829.397 1829.397 0 018.665-3.396 2812.926 2812.926 0 018.756-3.396 5391.064 5391.064 0 018.806-3.397l2.205-.849 2.206-.849 2.205-.85a12890.36 12890.36 0 008.804-3.395 4647.21 4647.21 0 008.757-3.397 2878.887 2878.887 0 008.676-3.396 2098.988 2098.988 0 008.569-3.397 1655.009 1655.009 0 0010.521-4.245 1308.173 1308.173 0 0010.272-4.245 1078.62 1078.62 0 009.988-4.246 914.236 914.236 0 009.677-4.245 790.206 790.206 0 009.344-4.246 693.156 693.156 0 008.999-4.245 615.188 615.188 0 008.644-4.246 551.285 551.285 0 008.284-4.245 498.057 498.057 0 007.927-4.246l1.542-.849c.512-.283 1.529-.849 1.529-.849"
              strokeWidth={2}
              stroke="#1f77b4"
            />
            <g>
              <path
                className="prefix__area"
                d="M595.188 455.865l1.746-.849a4553.803 4553.803 0 017.003-3.396l1.754-.85 1.753-.848 1.754-.85a14002.021 14002.021 0 007.006-3.396 3944.76 3944.76 0 006.975-3.396 2206.349 2206.349 0 006.916-3.396 1477.507 1477.507 0 006.83-3.397 1073.05 1073.05 0 006.715-3.396 814.14 814.14 0 006.569-3.396 633.544 633.544 0 006.392-3.397 500.348 500.348 0 004.659-2.547 421.52 421.52 0 004.527-2.547 356.005 356.005 0 004.382-2.548 300.97 300.97 0 004.224-2.547 254.39 254.39 0 004.051-2.547 214.78 214.78 0 003.866-2.547 181.016 181.016 0 003.667-2.548 152.227 152.227 0 003.457-2.547 127.72 127.72 0 003.235-2.547 106.933 106.933 0 003.002-2.548 89.395 89.395 0 001.867-1.698 79.308 79.308 0 001.757-1.698 70.382 70.382 0 001.644-1.698 62.521 62.521 0 001.53-1.698 55.637 55.637 0 001.412-1.698 49.65 49.65 0 001.294-1.699 44.483 44.483 0 001.175-1.698 40.07 40.07 0 001.056-1.698 36.35 36.35 0 00.934-1.698 33.263 33.263 0 00.814-1.698 30.763 30.763 0 00.995-2.548 28.021 28.021 0 00.726-2.547 26.392 26.392 0 00.559-3.396 25.84 25.84 0 00.106-3.397 27.114 27.114 0 00-.205-2.547 29.346 29.346 0 00-.434-2.547 32.82 32.82 0 00-.41-1.698 35.933 35.933 0 00-.501-1.699 39.8 39.8 0 00-.588-1.698 44.561 44.561 0 00-.668-1.698 50.41 50.41 0 00-.743-1.698 57.634 57.634 0 00-.813-1.698 66.658 66.658 0 00-.875-1.698 78.147 78.147 0 00-1.415-2.548 102.636 102.636 0 00-1.517-2.547 143.792 143.792 0 00-1.594-2.547 229.055 229.055 0 00-1.647-2.548l-.556-.849-.557-.849-.559-.849-.558-.849a755.674 755.674 0 01-1.664-2.547 262.785 262.785 0 01-1.627-2.547 155.418 155.418 0 01-1.563-2.548 107.6 107.6 0 01-1.473-2.547 80.243 80.243 0 01-.92-1.698 67.666 67.666 0 01-.86-1.698 57.899 57.899 0 01-.794-1.699 50.146 50.146 0 01-.721-1.698 43.91 43.91 0 01-.642-1.698 38.866 38.866 0 01-.556-1.698 34.787 34.787 0 01-.464-1.698 31.518 31.518 0 01-.366-1.698 28.946 28.946 0 01-.355-2.548 26.223 26.223 0 01-.108-2.547 24.709 24.709 0 01.263-3.396 24.422 24.422 0 01.752-3.397 26.1 26.1 0 01.896-2.547 28.742 28.742 0 01.758-1.698 31.232 31.232 0 01.888-1.698 34.368 34.368 0 011.017-1.699 38.213 38.213 0 011.146-1.698 42.842 42.842 0 011.275-1.698 48.342 48.342 0 011.402-1.698 54.813 54.813 0 011.527-1.698 62.368 62.368 0 011.65-1.698 71.14 71.14 0 011.77-1.699 81.284 81.284 0 011.885-1.698 92.986 92.986 0 011.998-1.698 106.471 106.471 0 012.107-1.698 122.02 122.02 0 012.21-1.698 139.99 139.99 0 013.497-2.548 172.546 172.546 0 013.7-2.547 213.968 213.968 0 013.882-2.547 268.15 268.15 0 014.04-2.547 342.171 342.171 0 014.176-2.548 450.382 450.382 0 014.287-2.547 626.877 626.877 0 014.37-2.547 976.822 976.822 0 014.429-2.548 2060.5 2060.5 0 012.97-1.698l1.489-.849 1.488-.849 1.487-.849a2566.607 2566.607 0 004.448-2.547 1073.747 1073.747 0 004.403-2.548 662.375 662.375 0 004.332-2.547 465.65 465.65 0 004.233-2.547 348.211 348.211 0 004.107-2.547 269.109 269.109 0 003.955-2.548 211.759 211.759 0 003.778-2.547 168.192 168.192 0 003.576-2.547 134.106 134.106 0 002.26-1.698 115.356 115.356 0 002.155-1.699 99.177 99.177 0 002.042-1.698 85.19 85.19 0 001.924-1.698 73.1 73.1 0 001.799-1.698 62.667 62.667 0 001.67-1.698 53.699 53.699 0 001.536-1.698 46.032 46.032 0 001.396-1.699 39.526 39.526 0 001.253-1.698 34.06 34.06 0 001.106-1.698 29.528 29.528 0 00.955-1.698 25.833 25.833 0 00.8-1.698 22.894 22.894 0 00.644-1.699 20.64 20.64 0 00.483-1.698 19.013 19.013 0 00.323-1.698 17.968 17.968 0 00.176-2.547 17.431 17.431 0 00-.344-3.397 18.612 18.612 0 00-.422-1.698 20.055 20.055 0 00-.589-1.698 22.12 22.12 0 00-.755-1.698 24.863 24.863 0 00-.921-1.698 28.355 28.355 0 00-1.086-1.698 32.675 32.675 0 00-1.25-1.699 37.915 37.915 0 00-1.411-1.698 44.171 44.171 0 00-1.572-1.698 51.55 51.55 0 00-1.73-1.698 60.165 60.165 0 00-1.884-1.698 70.136 70.136 0 00-2.036-1.699 81.594 81.594 0 00-2.186-1.698 94.675 94.675 0 00-2.332-1.698 109.532 109.532 0 00-2.473-1.698 126.327 126.327 0 00-2.612-1.698 145.24 145.24 0 00-2.745-1.698 166.476 166.476 0 00-2.876-1.699 190.26 190.26 0 00-3-1.698 216.857 216.857 0 00-4.724-2.547 262.7 262.7 0 00-4.979-2.547 316.834 316.834 0 00-5.215-2.548 380.929 380.929 0 00-5.434-2.547 457.253 457.253 0 00-5.635-2.547 548.987 548.987 0 00-5.816-2.547 660.747 660.747 0 00-5.979-2.548 799.499 799.499 0 00-6.122-2.547 976.267 976.267 0 00-8.354-3.396 1304.99 1304.99 0 00-8.531-3.397 1829.397 1829.397 0 00-8.665-3.396 2812.926 2812.926 0 00-8.756-3.396 5391.064 5391.064 0 00-8.806-3.397l-2.205-.849-2.206-.849-2.205-.85a12890.36 12890.36 0 01-8.804-3.395 4647.21 4647.21 0 01-8.757-3.397 2878.887 2878.887 0 01-8.676-3.396 2098.988 2098.988 0 01-8.569-3.397 1655.009 1655.009 0 01-10.521-4.245 1308.173 1308.173 0 01-10.272-4.245 1078.62 1078.62 0 01-9.988-4.246 914.236 914.236 0 01-9.677-4.245 790.206 790.206 0 01-9.344-4.246 693.156 693.156 0 01-8.999-4.245 615.188 615.188 0 01-8.644-4.246 551.285 551.285 0 01-8.284-4.245 498.057 498.057 0 01-7.927-4.246 453.097 453.097 0 01-3.07-1.698H445V455.866z"
                fill="#1f77b4"
                opacity={0.3}
              />
              <path
                className="prefix__line"
                fill="none"
                d="M595.188 455.865l1.746-.849a4553.803 4553.803 0 017.003-3.396l1.754-.85 1.753-.848 1.754-.85a14002.021 14002.021 0 007.006-3.396 3944.76 3944.76 0 006.975-3.396 2206.349 2206.349 0 006.916-3.396 1477.507 1477.507 0 006.83-3.397 1073.05 1073.05 0 006.715-3.396 814.14 814.14 0 006.569-3.396 633.544 633.544 0 006.392-3.397 500.348 500.348 0 004.659-2.547 421.52 421.52 0 004.527-2.547 356.005 356.005 0 004.382-2.548 300.97 300.97 0 004.224-2.547 254.39 254.39 0 004.051-2.547 214.78 214.78 0 003.866-2.547 181.016 181.016 0 003.667-2.548 152.227 152.227 0 003.457-2.547 127.72 127.72 0 003.235-2.547 106.933 106.933 0 003.002-2.548 89.395 89.395 0 001.867-1.698 79.308 79.308 0 001.757-1.698 70.382 70.382 0 001.644-1.698 62.521 62.521 0 001.53-1.698 55.637 55.637 0 001.412-1.698 49.65 49.65 0 001.294-1.699 44.483 44.483 0 001.175-1.698 40.07 40.07 0 001.056-1.698 36.35 36.35 0 00.934-1.698 33.263 33.263 0 00.814-1.698 30.763 30.763 0 00.995-2.548 28.021 28.021 0 00.726-2.547 26.392 26.392 0 00.559-3.396 25.84 25.84 0 00.106-3.397 27.114 27.114 0 00-.205-2.547 29.346 29.346 0 00-.434-2.547 32.82 32.82 0 00-.41-1.698 35.933 35.933 0 00-.501-1.699 39.8 39.8 0 00-.588-1.698 44.561 44.561 0 00-.668-1.698 50.41 50.41 0 00-.743-1.698 57.634 57.634 0 00-.813-1.698 66.658 66.658 0 00-.875-1.698 78.147 78.147 0 00-1.415-2.548 102.636 102.636 0 00-1.517-2.547 143.792 143.792 0 00-1.594-2.547 229.055 229.055 0 00-1.647-2.548l-.556-.849-.557-.849-.559-.849-.558-.849a755.674 755.674 0 01-1.664-2.547 262.785 262.785 0 01-1.627-2.547 155.418 155.418 0 01-1.563-2.548 107.6 107.6 0 01-1.473-2.547 80.243 80.243 0 01-.92-1.698 67.666 67.666 0 01-.86-1.698 57.899 57.899 0 01-.794-1.699 50.146 50.146 0 01-.721-1.698 43.91 43.91 0 01-.642-1.698 38.866 38.866 0 01-.556-1.698 34.787 34.787 0 01-.464-1.698 31.518 31.518 0 01-.366-1.698 28.946 28.946 0 01-.355-2.548 26.223 26.223 0 01-.108-2.547 24.709 24.709 0 01.263-3.396 24.422 24.422 0 01.752-3.397 26.1 26.1 0 01.896-2.547 28.742 28.742 0 01.758-1.698 31.232 31.232 0 01.888-1.698 34.368 34.368 0 011.017-1.699 38.213 38.213 0 011.146-1.698 42.842 42.842 0 011.275-1.698 48.342 48.342 0 011.402-1.698 54.813 54.813 0 011.527-1.698 62.368 62.368 0 011.65-1.698 71.14 71.14 0 011.77-1.699 81.284 81.284 0 011.885-1.698 92.986 92.986 0 011.998-1.698 106.471 106.471 0 012.107-1.698 122.02 122.02 0 012.21-1.698 139.99 139.99 0 013.497-2.548 172.546 172.546 0 013.7-2.547 213.968 213.968 0 013.882-2.547 268.15 268.15 0 014.04-2.547 342.171 342.171 0 014.176-2.548 450.382 450.382 0 014.287-2.547 626.877 626.877 0 014.37-2.547 976.822 976.822 0 014.429-2.548 2060.5 2060.5 0 012.97-1.698l1.489-.849 1.488-.849 1.487-.849a2566.607 2566.607 0 004.448-2.547 1073.747 1073.747 0 004.403-2.548 662.375 662.375 0 004.332-2.547 465.65 465.65 0 004.233-2.547 348.211 348.211 0 004.107-2.547 269.109 269.109 0 003.955-2.548 211.759 211.759 0 003.778-2.547 168.192 168.192 0 003.576-2.547 134.106 134.106 0 002.26-1.698 115.356 115.356 0 002.155-1.699 99.177 99.177 0 002.042-1.698 85.19 85.19 0 001.924-1.698 73.1 73.1 0 001.799-1.698 62.667 62.667 0 001.67-1.698 53.699 53.699 0 001.536-1.698 46.032 46.032 0 001.396-1.699 39.526 39.526 0 001.253-1.698 34.06 34.06 0 001.106-1.698 29.528 29.528 0 00.955-1.698 25.833 25.833 0 00.8-1.698 22.894 22.894 0 00.644-1.699 20.64 20.64 0 00.483-1.698 19.013 19.013 0 00.323-1.698 17.968 17.968 0 00.176-2.547 17.431 17.431 0 00-.344-3.397 18.612 18.612 0 00-.422-1.698 20.055 20.055 0 00-.589-1.698 22.12 22.12 0 00-.755-1.698 24.863 24.863 0 00-.921-1.698 28.355 28.355 0 00-1.086-1.698 32.675 32.675 0 00-1.25-1.699 37.915 37.915 0 00-1.411-1.698 44.171 44.171 0 00-1.572-1.698 51.55 51.55 0 00-1.73-1.698 60.165 60.165 0 00-1.884-1.698 70.136 70.136 0 00-2.036-1.699 81.594 81.594 0 00-2.186-1.698 94.675 94.675 0 00-2.332-1.698 109.532 109.532 0 00-2.473-1.698 126.327 126.327 0 00-2.612-1.698 145.24 145.24 0 00-2.745-1.698 166.476 166.476 0 00-2.876-1.699 190.26 190.26 0 00-3-1.698 216.857 216.857 0 00-4.724-2.547 262.7 262.7 0 00-4.979-2.547 316.834 316.834 0 00-5.215-2.548 380.929 380.929 0 00-5.434-2.547 457.253 457.253 0 00-5.635-2.547 548.987 548.987 0 00-5.816-2.547 660.747 660.747 0 00-5.979-2.548 799.499 799.499 0 00-6.122-2.547 976.267 976.267 0 00-8.354-3.396 1304.99 1304.99 0 00-8.531-3.397 1829.397 1829.397 0 00-8.665-3.396 2812.926 2812.926 0 00-8.756-3.396 5391.064 5391.064 0 00-8.806-3.397l-2.205-.849-2.206-.849-2.205-.85a12890.36 12890.36 0 01-8.804-3.395 4647.21 4647.21 0 01-8.757-3.397 2878.887 2878.887 0 01-8.676-3.396 2098.988 2098.988 0 01-8.569-3.397 1655.009 1655.009 0 01-10.521-4.245 1308.173 1308.173 0 01-10.272-4.245 1078.62 1078.62 0 01-9.988-4.246 914.236 914.236 0 01-9.677-4.245 790.206 790.206 0 01-9.344-4.246 693.156 693.156 0 01-8.999-4.245 615.188 615.188 0 01-8.644-4.246 551.285 551.285 0 01-8.284-4.245 498.057 498.057 0 01-7.927-4.246 453.097 453.097 0 01-3.07-1.698"
                strokeWidth={2}
                stroke="#1f77b4"
              />
            </g>
          </g>
          <g className="prefix__box-plot" transform="translate(50 50)">
            <rect
              className="prefix__box"
              fill="#1f77b4"
              opacity={0.4}
              stroke="#1f77b4"
              strokeWidth={2}
              x={276.5}
              width={237}
              y={139.127}
              rx={1}
              ry={1}
              height={175.187}
            />
            <path className="prefix__median" d="M276.5 199.471h237" />
            <circle
              className="prefix__median"
              r={3.5}
              fill="#1f77b4"
              cx={395}
              cy={199.471}
            />
            <path
              className="prefix__upper prefix__whisker"
              stroke="#1f77b4"
              d="M276.5 29.336h237M395 139.127V29.336"
            />
            <path
              className="prefix__lower prefix__whisker"
              stroke="#1f77b4"
              d="M276.5 406.226h237M395 314.313v91.913"
            />
          </g>
          <g className="prefix__points-plot" transform="translate(50 50)">
            <circle
              className="prefix__point prefix__violin-graph-1 prefix__vPoint"
              stroke="#000"
              r={6}
              fill="orange"
              pointerEvents="all"
              cx={439}
              cy={88.429}
            />
          </g>
        </svg>
      </Fragment>
    );
  }
}

export default ViolinPlot;
