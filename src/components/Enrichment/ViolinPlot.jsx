import React, { Component } from 'react';
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
        axisLabels: null,
        // axisLabels: {
        //     xAxisLabel: "",
        //     yAxisLabel: ""
        // },
        constrainExtremes: false,
        color: d3.scaleOrdinal(d3.schemeCategory10),
        chartSize: { height: '700', width: '960' },
        data: this.props.barcodeSettings.barcodeData || null,
        id: 'chart-violin',
        margin: { top: 50, right: 40, bottom: 40, left: 50 },
        pointUniqueId: '',
        pointValue: '',
        scale: 'linear',
        subtitle: '',
        title: '',
        tooltip: {
          show: true,
          fields: [{ label: 'label1', value: 'value1', toFixed: true }]
        },
        xName: null,
        yName: null,
        yTicks: 1
      },
      width: 0,
      height: 0,
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
      boxPlots: {}
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
    // let width = this.getWidth();
    // let height = this.getHeight();
    // this.setState({ width: width, height: height }, () => {
    this.makeChart();
    // });

    // let resizedFn;
    // window.addEventListener('resize', () => {
    // clearTimeout(resizedFn);
    // resizedFn = setTimeout(() => {
    //     this.makeChart();
    //     }, 200);
    // });
  }

  // getWidth = () => {
  //     if (this.violinChartRef.current !== null) {
  //     return this.violinChartRef.current.parentElement.offsetWidth;
  //     } else return 380;
  // }

  // getHeight = () => {
  //     if (this.violinChartRef.current !== null) {
  //     return this.violinChartRef.current.parentElement.offsetHeight;
  //     } else return 450;
  // }

  makeChart = () => {
    const self = this;
    const { settings, objs, violinPlots, dataPlots, boxPlots } = this.state;
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

    let groupObjs = settings.data;
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
    let divWidth = settings.chartSize.width;
    let divHeight = settings.chartSize.height;

    let width =
      settings.chartSize.width - settings.margin.left - settings.margin.right;

    let height =
      settings.chartSize.height - settings.margin.top - settings.margin.bottom;

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
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('font-family', 'Roboto')
      .style('text-ancohor', 'middle')
      .append('tspan')
      .html(function() {
        return xAxisLabel;
      })
      .attr('x', function() {
        let elem = d3.select('.label');
        let size = elem.node().getBBox();
        return width / 2 - size.width / 2;
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
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('font-family', 'Roboto')
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
      .style('font-size', '25px')
      .style('font-weight', 'bold')
      .style('font-family', 'Roboto')
      .style('text-anchor', 'left')
      .text(settings.title);

    const subtitle = objs.g
      .append('g')
      .attr('class', 'subtitle')
      .append('text')
      .attr('x', 10)
      .attr('y', -10)
      .style('fill', '#000')
      .style('font-size', '15px')
      //.style('font-weight', 'bold')
      .style('font-family', 'Roboto')
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

      for (cName in groupObjs) {
        if (groupObjs.hasOwnProperty(cName)) {
          cPlot = groupObjs[cName].dataPlots;

          // Points Plot
          if (dOpts.showPlot) {
            cPlot.objs.points = { g: null, pts: [] };
            cPlot.objs.points.g = objs.g
              .append('g')
              .attr('class', 'points-plot');
            for (let pt = 0; pt < groupObjs[cName].values.length; pt++) {
              var max = self.getMaxStat(groupObjs[cName].values);
              cPlot.objs.points.pts.push(
                cPlot.objs.points.g
                  .append('circle')
                  .attr('id', function(d: any) {
                    var id = groupObjs[cName].values[pt][
                      settings.pointUniqueId
                    ].replace(/\./g, '');
                    var id_mult = groupObjs[cName].values[pt].id_mult;
                    return 'violin_' + id.replace(/\;/g, '_') + '_' + id_mult;
                  })
                  .attr('class', 'point ' + settings.id + ' vPoint')
                  .attr('stroke', 'black')
                  .attr('r', function() {
                    if (groupObjs[cName].values[pt].statistic == max) {
                      return dOpts.pointSize / 1;
                    } else {
                      return dOpts.pointSize / 2;
                    }
                  })
                  .attr('fill', function(d) {
                    if (groupObjs[cName].values[pt].statistic == max) {
                      id = groupObjs[cName].values[pt];
                      self.maxCircle = id;
                      return 'orange';
                    } else {
                      return dataPlots.colorFunct(cName);
                    }
                  })
              );
            }
          }

          const circleData = _.forEach(groupObjs[cName].values, function(
            value,
            key
          ) {
            value[settings.xName] = cName;
          });

          cPlot.objs.points.g
            .selectAll('circle')
            .data(circleData)
            .attr('pointer-events', 'all')
            .on('mouseover', function(d) {
              self.dotHover.emit({ object: d, action: 'mouseover' });
              self.isHovering = true;
              d3.select('#violin_' + self.getCircleId(d.sample, d.id_mult))
                .transition()
                .duration(100)
                .attr('cursor', 'pointer')
                .attr('r', 6);
              if (settings.tooltip.show) {
                const m = d3.mouse(objs.chartDiv.node());
                objs.tooltip
                  .style('left', m[0] + 10 + 'px')
                  .style('top', m[1] - 10 + 'px');
                objs.tooltip
                  .transition()
                  .delay(500)
                  .duration(500)
                  .style('opacity', 1)
                  .style('display', null);
                return self.tooltipHover(d, objs);
              }
            })
            .on('mouseout', function(d) {
              d3.select('#violin_' + self.getCircleId(d.sample, d.id_mult))
                .transition()
                .duration(300)
                .attr('r', function(d) {
                  if (self.maxCircle.sample != d.sample) {
                    return dOpts.pointSize / 2;
                  } else {
                    return dOpts.pointSize / 1;
                  }
                });

              self.dotHover.emit({ object: d, action: 'mouseout' });
              if (self.isHovering) {
                objs.tooltip
                  .transition()
                  .duration(500)
                  .style('opacity', 0);
              }
            })
            .on('click', function(d) {
              self.isHovering = false;
              var maxId = self.getCircleId(
                self.maxCircle.sample,
                self.maxCircle.id_mult
              );
              var id = self.getCircleId(d.sample, d.id_mult);
              self.dotClick.emit(d);

              d3.select('#violin_' + maxId)
                .transition()
                .duration(300)
                .attr('fill', '#1f77b4')
                .attr('r', dOpts.pointSize / 2);

              d3.select('#violin_' + id)
                .transition()
                .duration(100)
                .attr('fill', 'orange')
                .attr('r', dOpts.pointSize / 1);

              self.maxCircle = d;
              self.addToolTiptoMax(self.maxCircle, objs);
            });
        }
      }
    };

    dataPlots.preparePlots();
    dataPlots.update();
    this.addToolTiptoMax(id, objs);

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
    return id.replace(/\;/g, '_') + '_' + id_mult;
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

  dUpdate = (chart, data, settings) => {
    d3.select('.violin-chart-wrapper')
      .selectAll('*')
      .remove();

    this.chart.settings.data = data;
    this.settings = settings;
    const self = this;
    this.makeChart();
  };

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

  render() {
    return (
      <div
        id={this.state.settings.id}
        id="violin-chart-wrapper"
        className="ViolinChartWrapper"
        ref={this.violinChartRef}
      ></div>
    );
  }
}

export default ViolinPlot;
