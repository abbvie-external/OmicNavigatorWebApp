/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Icon, Popup } from 'semantic-ui-react';
import * as d3 from 'd3';
import * as _ from 'lodash-es';
// import { select } from "d3-selection";
import './ViolinPlot.scss';

class ViolinPlot extends Component {
  state = {
    displayElementTextViolin:
      JSON.parse(sessionStorage.getItem('displayElementTextViolin')) || false,
    violinContainerHeight:
      this.violinContainerRef?.current?.parentElement?.offsetHeight ||
      window.screen.height - this.props.horizontalSplitPaneSize - 51,
    violinHeight:
      this.violinContainerRef?.current?.parentElement?.offsetHeight ||
      window.screen.height -
        this.props.horizontalSplitPaneSize -
        this.props.violinSettings.margin.top -
        this.props.violinSettings.margin.bottom -
        51,
    violinContainerWidth: this.props.verticalSplitPaneSize,
    violinWidth:
      this.props.verticalSplitPaneSize -
      this.props.violinSettings.margin.left -
      this.props.violinSettings.margin.right,
  };

  chart = {};
  maxCircle;
  violinContainerRef = React.createRef();
  brushedData = [];

  componentDidMount() {
    let resizedFn;
    window.addEventListener('resize', () => {
      clearTimeout(resizedFn);
      resizedFn = setTimeout(() => {
        this.windowResized();
      }, 200);
    });
    this.initiateViolinPlot(true);
  }

  componentDidUpdate(prevProps, prevState) {
    const { violinData, HighlightedProteins } = this.props;
    if (violinData !== prevProps.violinData) {
      const label = this.props.barcodeSettings.statLabel;
      let prevValues = prevProps?.violinData?.[label]?.values ?? [];
      let currentValues = violinData?.[label]?.values ?? [];
      var isSame =
        prevValues.length === currentValues.length &&
        prevValues.every(
          (o, i) =>
            Object.keys(o).length === Object.keys(currentValues[i]).length &&
            Object.keys(o).every(k => o[k] === currentValues[i][k]),
        );
      if (!isSame) {
        this.initiateViolinPlot(true);
      }
    }
    if (HighlightedProteins !== prevProps.HighlightedProteins) {
      const self = this;
      this.isHovering = false;
      // set all dots back to small, blue
      const dOpts = this.chart.dataPlots.options;
      d3.selectAll(`.vPoint`)
        .transition()
        .duration(300)
        .attr('fill', '#1678C2')
        .attr('r', dOpts.pointSize * 1);
      const chartSVG = d3.select(`#${this.props.violinSettings.id}`);
      chartSVG.selectAll('g.circleText').remove();
      if (HighlightedProteins.length > 0) {
        HighlightedProteins.forEach(element => {
          const highlightedDotId = element.featureID;
          const dot = d3.select(`circle[id='violin_${highlightedDotId}']`);
          dot
            .transition()
            .duration(100)
            .attr('fill', '#FF7E38')
            .attr('stroke', '#000')
            .attr('r', dOpts.pointSize * 1.5);
          const circleText = self.chart.objs.svg
            .append('g')
            .attr('class', 'circleText');
          circleText
            .append('text')
            .attr('x', parseInt(dot.attr('cx')) + parseInt(70))
            .attr('y', parseInt(dot.attr('cy')) + parseInt(20))
            .style('fill', 'black')
            .attr('font-size', '10px')
            .attr('font-family', 'Arial')
            .text(highlightedDotId);
        });
      }
      // if max protein exists, get id
      if (HighlightedProteins[0]?.featureID) {
        const maxDotId = HighlightedProteins[0].featureID;
        d3.select(`circle[id='violin_${maxDotId}']`)
          .transition()
          .duration(100)
          .attr('fill', '#FF4400')
          .attr('stroke', '#000')
          .attr('r', dOpts.pointSize * 2);
        this.maxCircle = maxDotId;
        this.addToolTiptoMax(HighlightedProteins[0]);
        d3.select(`circle[id='violin_${maxDotId}']`).raise();
      }
      const opacityVar = this.state.displayElementTextViolin ? 1 : 0;
      chartSVG.selectAll('g.circleText').attr('opacity', opacityVar);
    }
  }

  createViolinPlot = () => {
    d3.select(`#${this.props.violinSettings.id}`).remove();
    d3.selectAll(`.violin-tooltip`).remove();
    this.makeChart();
    this.prepareData();
    this.prepareSettings();
    this.prepareChart();
    this.renderViolinPlot({ showViolinPlot: true });
    this.renderBoxPlot({});
    this.makeBrush();
    this.renderDataPlots({ showPlot: true });
  };

  getColorFunct = colorOptions => {
    const self = this;
    if (typeof colorOptions === 'function') {
      return colorOptions;
    }
    if (Array.isArray(colorOptions)) {
      //  If an array is provided, map it to the domain
      const colorMap = {};
      let cColor = 0;
      Object.keys(self.chart.groupObjs).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, key)) {
          colorMap[key] = colorOptions[cColor];
          cColor = (cColor + 1) % colorOptions.length;
        }
      });
      return group => {
        return colorMap[group];
      };
    }
    if (typeof colorOptions === 'object') {
      // if an object is provided, assume it maps to  the colors
      return group => {
        return colorOptions[group];
      };
    }
    return d3.scaleOrdinal(d3.schemeCategory10);
  };

  shallowCopy = oldObj => {
    const newObj = {};
    Object.keys(oldObj).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(oldObj, key)) {
        newObj[key] = oldObj[key];
      }
    });
    return newObj;
  };

  kernelDensityEstimator = (kernel, x) => {
    return sample => {
      return x.map(x1 => {
        return {
          x: x1,
          y: d3.mean(sample, v => {
            return kernel(x1 - v);
          }),
        };
      });
    };
  };

  eKernel = scale => {
    return u => {
      let u2 = u;
      u2 /= scale;
      // gaussian
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u2 * u2);
    };
  };

  // Used to find the roots for adjusting violin axis
  // Given an array, find the value for a single point, even if it is not in the domain
  eKernelTest = (kernel, array) => {
    return testX => {
      return d3.mean(array, v => {
        return kernel(testX - v);
      });
    };
  };

  getObjWidth = (objWidth, gName, self) => {
    const objSize = { left: null, right: null, middle: null };
    const width = self.chart.xScale.bandwidth() * (objWidth / 100);
    const padding = (self.chart.xScale.bandwidth() - width) / 2;
    const gShift = self.chart.xScale(gName);
    objSize.middle = self.chart.xScale.bandwidth() / 2 + gShift;
    objSize.left = padding + gShift;
    objSize.right = objSize.left + width;
    return objSize;
  };

  getMaxStat = array => {
    // finds the highest value based on t statistics
    // used to figure out which dot gets highlighted

    const statArray = array.map(o => {
      return o.statistic;
    });
    const max = Math.max(...statArray);
    return max;
  };

  addToolTiptoMax = id => {
    if (id != null) {
      const self = this;
      d3.select(`circle[id='violin_${id.featureID}']`);
      const cx = Math.ceil(
        d3.select(`circle[id='violin_${id.featureID}']`).attr('cx'),
      );
      const cy = Math.ceil(
        d3.select(`circle[id='violin_${id.featureID}']`).attr('cy'),
      );

      const svg = document.getElementById(`${this.props.violinSettings.id}`);
      let parent = '';
      parent = document
        .getElementById(this.props.violinSettings.id)
        .getBoundingClientRect();

      const shape = document
        .getElementById(`violin_${id.featureID}`)
        .getBoundingClientRect();
      const relative = shape.left - parent.left;

      const res = self.getPos(cx, cy, svg, svg);
      const opacity = this.state.displayElementTextViolin ? 0 : 1;
      self.chart.objs.tooltip
        .transition()
        .duration(300)
        .style('left', `${relative + 20}px`)
        .style('top', `${res.y + 20}px`)
        .style('opacity', () => {
          return opacity;
        })
        .style('display', null);
      id.cpm = _.find(this.props.barcodeSettings.barcodeData, function(o) {
        return o.featureID === id.featureID;
      }).logFoldChange;
      this.tooltipHover(id);
    }
  };

  getPos = (x, y, svg, element) => {
    const p = svg.createSVGPoint();
    const ctm = element.getCTM();
    p.x = x;
    p.y = y;
    return p.matrixTransform(ctm);
  };

  addJitter = (doJitter, width) => {
    if (doJitter !== true || width === 0) {
      return 0;
    }
    return Math.floor(Math.random() * width) - width / 2;
  };

  makeBrush() {
    var self = this;
    // const brushingStart = function() {
    // };
    const highlightBrushedCircles = function() {
      const circles = d3.selectAll(
        '.' + self.props.violinSettings.id + '.vPoint',
      );
      if (d3.event.selection != null) {
        const brush_coords = d3.brushSelection(this);
        // style brushed circles
        // tslint:disable-next-line:no-shadowed-variable
        const isBrushed = function(brush_coords, cx, cy) {
          const x0 = brush_coords[0][0],
            x1 = brush_coords[1][0],
            y0 = brush_coords[0][1],
            y1 = brush_coords[1][1];

          const brushTest = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
          return brushTest;
        };
        const chartSVG = d3.select(`#${self.props.violinSettings.id}`);
        chartSVG.selectAll('.brushed').classed('brushed', false);
        const brushed = circles
          .filter(function() {
            const cx = d3.select(this).attr('cx'),
              cy = d3.select(this).attr('cy');
            return isBrushed(brush_coords, cx, cy);
          })
          .attr(
            'class',
            'brushed point ' + self.props.violinSettings.id + ' vPoint',
          )
          .attr('opacity', 1.0);
        circles.filter(function() {
          const cx = d3.select(this).attr('cx'),
            cy = d3.select(this).attr('cy');
          return !isBrushed(brush_coords, cx, cy);
        });
        self.brushedData = brushed.data();
        if (self.brushedData.length > 0) {
          const sortedData = self.brushedData.sort(
            (a, b) => b.statistic - a.statistic,
          );
          self.props.onHandleProteinSelected(sortedData);
        }
      }
    };
    self.chart.objs.brush = d3
      .brush()
      .extent([
        [0, 0],
        [self.state.violinContainerWidth, self.state.violinContainerHeight],
      ])
      // .on('start', brushingStart)
      // .on('brush', highlightBrushedCircles);
      .on('end', highlightBrushedCircles);
    self.chart.objs.g
      .append('g')
      .attr('class', 'violinBrush')
      .call(self.chart.objs.brush);
  }

  clearBrush(self) {
    d3.selectAll('.violinBrush').call(self.chart.objs.brush.move, null);
  }

  tooltipHover = (d, override) => {
    const tooltipFields = this.props.violinSettings.tooltip.fields;
    let tooltipString = '';
    _.forEach(tooltipFields, field => {
      if (d[field.value] != null && d[field.value] !== '') {
        tooltipString += `<span>${field.label} = ${d[field.value]}</span><br/>`;
      }
    });
    this.chart.objs.tooltip.html(tooltipString);
    this.chart.objs.tooltip.style('z-index', 100);
    if (override) {
      this.chart.objs.tooltip.style('opacity', 1);
    }
  };

  makeChart = () => {
    const self = this;
    self.chart.data = self.props.violinData;

    self.chart.groupObjs = {}; // The data organized by grouping and sorted as well as any metadata for the groups
    self.chart.objs = {
      mainDiv: null,
      chartDiv: null,
      g: null,
      xAxis: null,
      yAxis: null,
      brush: null,
      tooltip: null,
    };
    self.chart.colorFunct = null;
  };

  prepareData = () => {
    const self = this;
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
        bw: null,
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
        0.9 * d3.min([metrics.std, metrics.iqr / 1.349]) * metrics.n ** -0.2;

      // The inner fences are the closest value to the IQR without going past it (assumes sorted lists)
      const LIF = metrics.quartile1 - 1.5 * metrics.iqr;
      const UIF = metrics.quartile3 + 1.5 * metrics.iqr;
      for (let i = 0; i <= values.length; i += 1) {
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

    self.chart.groupObjs = self.chart.data;

    Object.keys(self.chart.groupObjs).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, key)) {
        const pointValues = self.chart.groupObjs[key].values.map(
          d => d[self.props.violinSettings.pointValue],
        );
        pointValues.sort(d3.ascending);
        self.chart.groupObjs[key].metrics = {};
        self.chart.groupObjs[key].metrics = calcMetrics(pointValues);
      }
    });
  };

  prepareSettings = () => {
    const self = this;
    function formatAsFloat(d) {
      if (d % 1 !== 0) {
        return d3.format('.2f')(d);
      }
      return d3.format('.0f')(d);
    }

    // Set base settings
    self.chart.margin = self.props.violinSettings.margin;
    // self.chart.divWidth = self.state.violinContainerWidth;
    // self.chart.divHeight = self.state.violinContainerHeight;
    self.chart.width = self.state.violinWidth;
    self.chart.height = self.state.violinHeight;
    self.chart.xAxisLabel = self.props.enrichmentTerm;
    self.chart.yAxisLabel = self.props.violinSettings.axisLabels.yAxis;
    self.chart.yScale = d3.scaleLinear();

    if (self.props.violinSettings.constrainExtremes === true) {
      const fences = [];

      Object.keys(self.chart.groupObjs).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, key)) {
          fences.push(self.chart.groupObjs[key].metrics.lowerInnerFence);
          fences.push(self.chart.groupObjs[key].metrics.upperInnerFence);
        }
      });
      self.chart.range = d3.extent(fences);
    } else {
      const fences = [];
      Object.keys(self.chart.groupObjs).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, key)) {
          fences.push(self.chart.groupObjs[key].metrics.min);
          fences.push(self.chart.groupObjs[key].metrics.max);
        }
      });
      self.chart.range = d3.extent(fences);
    }

    self.chart.colorFunct = self.getColorFunct(
      self.props.violinSettings.colors,
    );

    // Build Scale functions
    const range = Math.abs(self.chart.range[1] - self.chart.range[0]) * 0.05;
    self.chart.yScale
      .range([self.chart.height, 0])
      .domain([self.chart.range[0] - range, self.chart.range[1] + range])
      .nice()
      .clamp(true);
    self.chart.xScale = d3
      .scaleBand()
      .domain(Object.keys(self.chart.groupObjs).sort())
      .range([0, self.chart.width]);

    // Build Axes Functions
    self.chart.objs.yAxis = d3
      .axisLeft(self.chart.yScale)
      .tickFormat(formatAsFloat);
    // .tickSizeOuter(0)
    // .tickSizeInner(-self.chart.width)
    // .tickPadding(
    //   Math.max.apply(Math, this.chart.yScale.ticks())
    //     ? parseInt(
    //         Math.max.apply(Math, this.chart.yScale.ticks()).toString().length,
    //       ) * 8
    //     : 0,
    // );
    self.chart.objs.yAxis.tickArguments(
      self.chart.objs.yAxis.tickArguments() * self.props.violinSettings.yTicks,
    );
  };

  prepareChart = () => {
    const self = this;
    self.chart.objs.chartDiv = d3.select(
      `#${self.props.violinSettings.parentId}`,
    );
    self.chart.objs.tooltip = self.chart.objs.chartDiv.append('div');
    self.chart.objs.tooltip
      .attr('class', 'violin-tooltip')
      .style('display', 'none');

    // Create the svg
    self.chart.objs.svg = self.chart.objs.chartDiv
      .append('svg')
      .attr('class', 'chart-area vChart')
      .attr('id', `${self.props.violinSettings.id}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr(
        'viewBox',
        `0 0 ${self.state.violinContainerWidth} ${self.state.violinContainerHeight}`,
      );
    // .attr('preserveAspectRatio', 'xMinYMin meet');

    self.chart.objs.g = self.chart.objs.svg
      .append('g')
      .attr(
        'transform',
        `translate(${self.chart.margin.left},${self.chart.margin.top})`,
      )
      .attr('id', 'main-g');

    // Create axes
    self.chart.objs.axes = self.chart.objs.g.append('g').attr('class', 'axis');
    self.chart.objs.axes
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${self.chart.height})`)
      // .call(self.chart.objs.xAxis)
      .append('text')
      .attr(
        'font-family',
        '"Lato", "Helvetica Neue", "Arial", Helvetica, sans-serif',
      )
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('class', 'vXLabel vLabelStyles')
      .attr('dy', '1.50em')
      .attr('y', -7)
      .append('tspan')
      .html(() => {
        return self.chart.xAxisLabel;
      })
      .attr('x', () => {
        const elem = d3.select('.vXLabel');
        // const size =
        elem.node().getBBox();
        // return self.chart.width / 2 - size.width / 2;
        return self.chart.width / 2;
      });

    self.chart.objs.axes
      .append('g')
      .attr('class', 'yaxis')
      .call(self.chart.objs.yAxis)
      .append('text')
      .attr('class', 'vLabelStyles')
      .attr('id', 'yaxis-label')
      .attr(
        'font-family',
        '"Lato", "Helvetica Neue", "Arial", Helvetica, sans-serif',
      )
      .attr('font-size', '15px')
      .attr('font-weight', 'bold')
      .attr('dy', '.62em')
      .attr('transform', 'rotate(-90)')
      .attr('x', -self.chart.height / 2)
      .attr('y', -55)
      .style('fill', '#000')
      .append('tspan')
      .html(() => {
        return self.chart.yAxisLabel;
      });

    // Create Title
    const title = self.chart.objs.g.append('g').attr('class', 'title');
    title
      .append('text')
      .attr('x', 10)
      .attr('y', -30)
      .style('fill', '#000')
      .text(self.props.violinSettings.title);

    //const subtitle =
    self.chart.objs.g
      .append('g')
      .attr('class', 'subtitle')
      .append('text')
      .attr('x', 10)
      .attr('y', -10)
      .style('fill', '#000')
      .text(self.props.violinSettings.subtitle);
  };

  renderViolinPlot = options => {
    const self = this;
    self.chart.violinPlots = {};

    const defaultOptions = {
      show: true,
      showViolinPlot: true,
      resolution: 207,
      bandwidth: 0.2,
      width: 90,
      interpolation: d3.curveCardinal,
      clamp: 1,
      colors: self.chart.colorFunct,
      yDomainVP: null,
    };
    self.chart.violinPlots.options = self.shallowCopy(defaultOptions);
    Object.keys(options).forEach(option => {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        self.chart.violinPlots.options[option] = options[option];
      }
    });
    const vOpts = self.chart.violinPlots.options;

    // Create violin plot objects
    Object.keys(self.chart.groupObjs).forEach(cName => {
      if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
        self.chart.groupObjs[cName].violin = {};
        self.chart.groupObjs[cName].violin.objs = {};
      }
    });

    self.chart.violinPlots.change = updateOptions => {
      if (updateOptions) {
        Object.keys(updateOptions).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(updateOptions, key)) {
            vOpts[key] = updateOptions[key];
          }
        });
      }

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          self.chart.groupObjs[cName].violin.objs.g.remove();
        }
      });

      self.chart.violinPlots.prepareViolin();
      self.chart.violinPlots.update();
    };

    self.chart.violinPlots.reset = () => {
      self.chart.violinPlots.change(defaultOptions);
    };
    self.chart.violinPlots.show = opts => {
      let tempOpts = opts;
      if (opts !== undefined) {
        tempOpts.show = true;
        if (opts.reset) {
          self.chart.violinPlots.reset();
        }
      } else {
        tempOpts = { show: true };
      }
      self.chart.violinPlots.change(tempOpts);
    };

    self.chart.violinPlots.hide = opts => {
      let tempOpts = opts;
      if (opts !== undefined) {
        tempOpts.show = false;
        if (opts.reset) {
          self.chart.violinPlots.reset();
        }
      } else {
        tempOpts = { show: false };
      }
      self.chart.violinPlots.change(tempOpts);
    };

    /**
     * Update the violin obj values
     */
    self.chart.violinPlots.update = () => {
      // let cName;
      let cViolinPlot;
      let xVScale;
      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          const pointValues = _.map(self.chart.groupObjs[cName].values, d => {
            return d[self.props.violinSettings.pointValue];
          });
          cViolinPlot = self.chart.groupObjs[cName].violin;

          // Build the violins sideways, so use the yScale for the xScale and make a new yScale
          // tslint:disable-next-line:no-var-keyword
          xVScale = self.chart.yScale.copy(pointValues);

          // Create the Kernel Density Estimator Function
          cViolinPlot.kde = self.kernelDensityEstimator(
            self.eKernel(self.chart.groupObjs[cName].metrics.bw),
            xVScale.ticks(512),
          );
          cViolinPlot.kdedata = cViolinPlot.kde(pointValues);

          let interpolateMax = self.chart.groupObjs[cName].metrics.max;
          let interpolateMin = self.chart.groupObjs[cName].metrics.min;

          if (vOpts.clamp === 0 || vOpts.clamp === -1) {
            // When clamp is 0, calculate the min and max that is needed to bring the violin plot to a point
            // interpolateMax = the Minimum value greater than the max where y = 0
            interpolateMax = d3.min(
              cViolinPlot.kdedata.filter(d => {
                return (
                  d.x > self.chart.groupObjs[cName].metrics.max && d.y === 0
                );
              }),
              d => {
                return d.x;
              },
            );
            // interpolateMin = the Maximum value less than the min where y = 0
            interpolateMin = d3.max(
              cViolinPlot.kdedata.filter(d => {
                return (
                  d.x < self.chart.groupObjs[cName].metrics.min && d.y === 0
                );
              }),
              d => {
                return d.x;
              },
            );
            // If clamp is -1 we need to extend the axises so that the violins come to a point
            if (vOpts.clamp === -1) {
              const kdeTester = self.eKernelTest(
                self.eKernel(self.chart.groupObjs[cName].metrics.bw),
                pointValues,
              );
              if (!interpolateMax) {
                let interMaxY = kdeTester(
                  self.chart.groupObjs[cName].metrics.max,
                );
                let interMaxX = self.chart.groupObjs[cName].metrics.max;
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
                let interMinY = kdeTester(
                  self.chart.groupObjs[cName].metrics.min,
                );
                let interMinX = self.chart.groupObjs[cName].metrics.min;
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
            if (!vOpts.yDomainVP) {
              vOpts.yDomainVP = self.chart.range.slice(0);
            }
            if (interpolateMin && interpolateMin < vOpts.yDomainVP[0]) {
              vOpts.yDomainVP[0] = interpolateMin;
            }
            if (interpolateMax && interpolateMax > vOpts.yDomainVP[1]) {
              vOpts.yDomainVP[1] = interpolateMax;
            }
          }

          if (vOpts.showViolinPlot) {
            xVScale = self.chart.yScale.copy();

            // Need to recalculate the KDE because the xVScale changed
            cViolinPlot.kde = self.kernelDensityEstimator(
              self.eKernel(self.chart.groupObjs[cName].metrics.bw),
              xVScale.ticks(512),
            );
            cViolinPlot.kdedata = cViolinPlot.kde(pointValues);
          }

          cViolinPlot.kdedata = cViolinPlot.kdedata
            .filter(d => {
              return !interpolateMin || d.x >= interpolateMin;
            })
            .filter(d => {
              return !interpolateMax || d.x <= interpolateMax;
            });
        }
      });
      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          cViolinPlot = self.chart.groupObjs[cName].violin;

          // Get the violin width
          const objBounds = self.getObjWidth(vOpts.width, cName, self);
          const width = (objBounds.right - objBounds.left) / 2;

          const max = d3.max(cViolinPlot.kdedata, d => {
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
              .x(d => {
                return xVScale(d.x);
              })
              .y0(width)
              .y1(d => {
                return yVScale(d.y);
              });

            const line = d3
              .line()
              .curve(vOpts.interpolation)
              .x(d => {
                return xVScale(d.x);
              })
              .y(d => {
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
              `rotate(90,0,0)   translate(0,-${objBounds.left})  scale(1,-1)`,
            );
            cViolinPlot.objs.right.g.attr(
              'transform',
              `rotate(90,0,0)  translate(0,-${objBounds.right})`,
            );
          }
        }
      });
    };

    /**
     * Create the svg elements for the violin plot
     */
    self.chart.violinPlots.prepareViolin = () => {
      // let cName;
      let cViolinPlot;

      if (vOpts.colors) {
        self.chart.violinPlots.color = self.getColorFunct(vOpts.colors, self);
      } else {
        self.chart.violinPlots.color = self.chart.colorFunct;
      }

      if (vOpts.show === false) {
        return;
      }

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          cViolinPlot = self.chart.groupObjs[cName].violin;

          cViolinPlot.objs.g = self.chart.objs.g
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
              .style('fill', self.chart.violinPlots.color(cName))
              .style('opacity', '.3');
            cViolinPlot.objs.right.area = cViolinPlot.objs.right.g
              .append('path')
              .attr('class', 'area')
              .style('fill', self.chart.violinPlots.color(cName))
              .style('opacity', '.3');
            // Lines
            cViolinPlot.objs.left.line = cViolinPlot.objs.left.g
              .append('path')
              .attr('class', 'line')
              .attr('fill', 'none')
              .style('stroke-width', '2px')
              .style('opacity', '1')
              .style('stroke', self.chart.violinPlots.color(cName));
            cViolinPlot.objs.right.line = cViolinPlot.objs.right.g
              .append('path')
              .attr('class', 'line')
              .attr('fill', 'none')
              .style('stroke-width', '2px')
              .style('opacity', '1')
              .style('stroke', self.chart.violinPlots.color(cName));
          }
        }
      });
    };

    self.chart.violinPlots.prepareViolin();

    // D3 inline style is needed to maintain style on export
    d3.selectAll('.violin-chart-wrapper .y.axis .tick line')
      .style('opacity', '0.6')
      .style('shape-rendering', 'crispEdges')
      .style('stroke', 'white')
      .style('stroke-dasharray', '2,1')
      .style('stroke-width', '1');

    d3.select(window).on(
      `resize.${self.chart.selector}.violinPlot`,
      self.chart.violinPlots.update,
    );
    self.chart.violinPlots.update();
    return self.chart;
  };

  renderBoxPlot = options => {
    const self = this;
    self.chart.boxPlots = {};

    // Defaults
    const defaultOptions = {
      show: true,
      showBox: true,
      showWhiskers: true,
      showMedian: true,
      showMean: false,
      medianCSize: 1,
      boxWidth: 30,
      lineWidth: null,
      outlierCSize: 2.5,
      colors: self.chart.colorFunct,
    };
    self.chart.boxPlots.options = self.shallowCopy(defaultOptions);
    Object.keys(options).forEach(option => {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        self.chart.boxPlots.options[option] = options[option];
      }
    });
    const bOpts = self.chart.boxPlots.options;

    // Create box plot objects
    Object.keys(self.chart.groupObjs).forEach(cName => {
      if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
        self.chart.groupObjs[cName].boxPlot = {};
        self.chart.groupObjs[cName].boxPlot.objs = {};
      }
    });

    self.chart.boxPlots.change = updateOptions => {
      if (updateOptions) {
        Object.keys(updateOptions).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(updateOptions, key)) {
            bOpts[key] = updateOptions[key];
          }
        });
      }

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          self.chart.groupObjs[cName].boxPlot.objs.g.remove();
        }
      });
      self.chart.boxPlots.prepareBoxPlot();
      self.chart.boxPlots.update();
    };

    self.chart.boxPlots.reset = () => {
      self.chart.boxPlots.change(defaultOptions);
    };
    self.chart.boxPlots.show = opts => {
      let newOpts = opts;
      if (opts !== undefined) {
        newOpts.show = true;
        if (opts.reset) {
          self.chart.boxPlots.reset();
        }
      } else {
        newOpts = { show: true };
      }
      self.chart.boxPlots.change(newOpts);
    };
    self.chart.boxPlots.hide = opts => {
      let newOpts = opts;
      if (opts !== undefined) {
        newOpts.show = false;
        if (opts.reset) {
          self.chart.boxPlots.reset();
        }
      } else {
        newOpts = { show: false };
      }
      self.chart.boxPlots.change(newOpts);
    };

    /**
     * Update the box plot obj values
     */
    self.chart.boxPlots.update = () => {
      // let cName;
      let cBoxPlot;

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          cBoxPlot = self.chart.groupObjs[cName].boxPlot;

          // Get the box width
          const objBounds = self.getObjWidth(bOpts.boxWidth, cName, self);
          const width = objBounds.right - objBounds.left;

          const sMetrics = {}; // temp var for scaled (plottable) metric values
          Object.keys(self.chart.groupObjs[cName].metrics).forEach(attr => {
            if (
              Object.prototype.hasOwnProperty.call(
                self.chart.groupObjs[cName].metrics,
                attr,
              )
            ) {
              sMetrics[attr] = null;
              sMetrics[attr] = self.chart.yScale(
                self.chart.groupObjs[cName].metrics[attr],
              );
            }
          });

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
            lineBounds = self.getObjWidth(bOpts.lineWidth, cName, self);
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
      });
    };

    /**
     * Create the svg elements for the box plot
     */
    self.chart.boxPlots.prepareBoxPlot = () => {
      // let cName;
      let cBoxPlot;

      if (bOpts.colors) {
        self.chart.boxPlots.colorFunct = self.getColorFunct(bOpts.colors);
      } else {
        self.chart.boxPlots.colorFunct = self.chart.colorFunct;
      }

      if (bOpts.show === false) {
        return;
      }

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          cBoxPlot = self.chart.groupObjs[cName].boxPlot;

          cBoxPlot.objs.g = self.chart.objs.g
            .append('g')
            .attr('class', 'box-plot');

          // Plot Box (default show)
          if (bOpts.showBox) {
            cBoxPlot.objs.box = cBoxPlot.objs.g
              .append('rect')
              // .attr('class', 'box')
              .attr('fill-opacity', '0.4')
              .attr('fill', self.chart.boxPlots.colorFunct(cName))
              .attr('opacity', '0.4')
              .attr('stroke', self.chart.boxPlots.colorFunct(cName))
              .attr('stroke-width', '2');
            // A stroke is added to the box with the group color, it is
            // hidden by default and can be shown through css with stroke-width
          }

          // Plot Median (default show)
          if (bOpts.showMedian) {
            cBoxPlot.objs.median = { line: null, circle: null };
            cBoxPlot.objs.median.line = cBoxPlot.objs.g
              .append('line')
              .attr('stroke', 'black');
            cBoxPlot.objs.median.circle = cBoxPlot.objs.g
              .append('circle')
              .attr('class', 'median')
              .attr('r', bOpts.medianCSize)
              .attr('fill', self.chart.boxPlots.colorFunct(cName));
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
              .attr('fill', self.chart.boxPlots.colorFunct(cName));
          }

          // Plot Whiskers (default show)
          if (bOpts.showWhiskers) {
            cBoxPlot.objs.upperWhisker = { fence: null, line: null };
            cBoxPlot.objs.lowerWhisker = { fence: null, line: null };
            cBoxPlot.objs.upperWhisker.fence = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'upper whisker')
              .style('stroke', self.chart.boxPlots.colorFunct(cName));
            cBoxPlot.objs.upperWhisker.line = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'upper whisker')
              .attr('stroke', self.chart.boxPlots.colorFunct(cName));

            cBoxPlot.objs.lowerWhisker.fence = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'lower whisker')
              .attr('stroke', self.chart.boxPlots.colorFunct(cName));
            cBoxPlot.objs.lowerWhisker.line = cBoxPlot.objs.g
              .append('line')
              .attr('class', 'lower whisker')
              .attr('stroke', self.chart.boxPlots.colorFunct(cName));
          }
        }
      });
    };
    self.chart.boxPlots.prepareBoxPlot();

    // d3.select(window).on('resize.' + self.chart.selector + '.boxPlot', self.chart.boxPlots.update);
    self.chart.boxPlots.update(self);
    return self.chart;
  };

  renderDataPlots = options => {
    const self = this;
    // const id = '';
    self.chart.dataPlots = {};

    // Defaults
    const defaultOptions = {
      show: true,
      showPlot: false,
      plotType: 'scatter',
      pointSize: 3,
      showBeanLines: false,
      beanWidth: 20,
      colors: null,
    };
    self.chart.dataPlots.options = self.shallowCopy(defaultOptions);
    Object.keys(options).forEach(option => {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        self.chart.dataPlots.options[option] = options[option];
      }
    });
    const dOpts = self.chart.dataPlots.options;

    // Create notch objects
    Object.keys(self.chart.groupObjs).forEach(cName => {
      if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
        self.chart.groupObjs[cName].dataPlots = {};
        self.chart.groupObjs[cName].dataPlots.objs = {};
      }
    });
    // The lines don't fit into a group bucket so they live under the dataPlot object
    self.chart.dataPlots.objs = {};

    self.chart.dataPlots.change = updateOptions => {
      if (updateOptions) {
        Object.keys(updateOptions).forEach(key => {
          if (Object.prototype.hasOwnProperty.call(updateOptions, key)) {
            dOpts[key] = updateOptions[key];
          }
        });
      }

      self.chart.dataPlots.objs.g.remove();
      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          self.chart.groupObjs[cName].dataPlots.objs.g.remove();
        }
      });
      self.chart.dataPlots.preparePlots();
      self.chart.dataPlots.update();
    };

    self.chart.dataPlots.reset = () => {
      self.chart.dataPlots.change(defaultOptions);
    };
    self.chart.dataPlots.show = opts => {
      let newOpts = opts;
      if (opts !== undefined) {
        newOpts.show = true;
        if (opts.reset) {
          self.chart.dataPlots.reset();
        }
      } else {
        newOpts = { show: true };
      }
      self.chart.dataPlots.change(newOpts);
    };
    self.chart.dataPlots.hide = opts => {
      let newOpts = opts;
      if (opts !== undefined) {
        newOpts.show = false;
        if (opts.reset) {
          self.chart.dataPlots.reset();
        }
      } else {
        newOpts = { show: false };
      }
      self.chart.dataPlots.change(newOpts);
    };

    /**
     * Update the data plot obj values
     */
    self.chart.dataPlots.update = () => {
      // let cName;
      // let cGroup;
      let cPlot;

      // Metrics lines
      if (self.chart.dataPlots.objs.g) {
        const halfBand = self.chart.xScale.bandwidth() / 2; // find the middle of each band
        Object.keys(self.chart.dataPlots.objs.lines).forEach(cMetric => {
          if (
            Object.prototype.hasOwnProperty.call(
              self.chart.dataPlots.objs.lines,
              cMetric,
            )
          ) {
            self.chart.dataPlots.objs.lines[cMetric].line.x(d => {
              return self.chart.xScale(d.x) + halfBand;
            });
            self.chart.dataPlots.objs.lines[cMetric].g
              .datum(self.chart.dataPlots.objs.lines[cMetric].values)
              .attr('d', self.chart.dataPlots.objs.lines[cMetric].line);
          }
        });
      }

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          const cGroup = self.chart.groupObjs[cName];
          cPlot = cGroup.dataPlots;

          if (cPlot.objs.points) {
            // For scatter points and points with no scatter
            let plotBounds = null;
            let scatterWidth = 0;
            let width = 0;
            if (
              dOpts.plotType === 'scatter' ||
              typeof dOpts.plotType === 'number'
            ) {
              // Default scatter percentage is 20% of box width
              scatterWidth =
                typeof dOpts.plotType === 'number' ? dOpts.plotType : 20;
            }

            plotBounds = self.getObjWidth(scatterWidth, cName, self);
            width = plotBounds.right - plotBounds.left;

            for (let pt = 0; pt < cGroup.values.length; pt += 1) {
              cPlot.objs.points.pts[pt]
                .attr('cx', () => {
                  return plotBounds.middle + self.addJitter(true, width);
                })
                .attr('cy', () => {
                  return self.chart.yScale(
                    cGroup.values[pt][self.props.violinSettings.pointValue],
                  );
                });
            }
          }
        }
      });
    };

    /**
     * Create the svg elements for the data plots
     */
    self.chart.dataPlots.preparePlots = () => {
      // let cName;
      let cPlot;

      if (dOpts && dOpts.colors) {
        self.chart.dataPlots.colorFunct = self.getColorFunct(dOpts.colors);
      } else {
        self.chart.dataPlots.colorFunct = self.chart.colorFunct;
      }

      if (dOpts.show === false) {
        return;
      }

      //Double Click Behavior
      self.chart.objs.svg.on('dblclick', function() {
        d3.selectAll(`.violin-tooltip`).style('display', 'none');
        self.brushedData = [];
        self.clearBrush(self);
        const chartSVG = d3.select(`#${self.props.violinSettings.id}`);
        chartSVG.selectAll('.brushed').classed('brushed', false);
        self.props.onHandleProteinSelected([]);
      });

      Object.keys(self.chart.groupObjs).forEach(cName => {
        if (Object.prototype.hasOwnProperty.call(self.chart.groupObjs, cName)) {
          cPlot = self.chart.groupObjs[cName].dataPlots;

          // Points Plot
          if (dOpts.showPlot) {
            cPlot.objs.points = { g: null, pts: [] };
            cPlot.objs.points.g = self.chart.objs.g
              .append('g')
              .attr('class', 'points-plot');
            for (
              let pt = 0;
              pt < self.chart.groupObjs[cName].values.length;
              pt += 1
            ) {
              const max = self.getMaxStat(self.chart.groupObjs[cName].values);
              cPlot.objs.points.pts.push(
                cPlot.objs.points.g
                  .append('circle')
                  .attr('id', d => {
                    // return (
                    //   'violin_' +
                    //   self.chart.groupObjs[cName].values[pt][
                    //     self.chart.settings.pointUniqueId
                    //   ].replace(/\./g, '')
                    // );
                    // const id = self.chart.groupObjs[cName].values[pt][
                    //   self.props.violinSettings.pointUniqueId
                    // ].replace(/\./g, '');
                    const idMult =
                      self.chart.groupObjs[cName].values[pt].featureID;
                    return `violin_${idMult}`;
                  })
                  .attr('class', `point ${self.props.violinSettings.id} vPoint`)
                  .attr('stroke', 'black')
                  // .attr('r', dOpts.pointSize / 2) // Options is diameter, r takes radius so divide by 2
                  .attr('r', () => {
                    if (
                      self.chart.groupObjs[cName].values[pt].statistic === max
                    ) {
                      return dOpts.pointSize * 2;
                    }
                    return dOpts.pointSize * 1;
                  })
                  .attr('fill', d => {
                    if (
                      self.chart.groupObjs[cName].values[pt].statistic === max
                    ) {
                      const id = self.chart.groupObjs[cName].values[pt];
                      self.maxCircle = id;
                      return '#FF4400';
                    }
                    return self.chart.dataPlots.colorFunct(cName);
                  }),
              );
            }
          }

          const circleData = _.forEach(
            self.chart.groupObjs[cName].values,
            // ,
            // (value, key) => {
            //   value[self.props.violinSettings.xName] = cName;
            // },
          );
          cPlot.objs.points.g
            .selectAll('circle')
            .data(circleData)
            .attr('pointer-events', 'all')
            .on('mouseover', d => {
              // var id = d.sample.replace(/\;/g, "_");
              // self.dotHover.emit({ object: d, action: 'mouseover' });
              self.isHovering = true;
              if (self.maxCircle === d.featureID) {
                d3.select(`circle[id='violin_${d.featureID}']`)
                  .transition()
                  .duration(100)
                  .attr('cursor', 'pointer')
                  .attr('r', dOpts.pointSize * 2.5);
              } else {
                d3.select(`circle[id='violin_${d.featureID}']`)
                  .transition()
                  .duration(100)
                  .attr('cursor', 'pointer')
                  .attr('r', dOpts.pointSize * 2);
              }
              if (self.props.violinSettings.tooltip.show) {
                const m = d3.mouse(self.chart.objs.chartDiv.node());
                const opacity = this.state.displayElementTextViolin ? 0 : 1;
                self.chart.objs.tooltip
                  .style('left', `${m[0] + 10}px`)
                  .style('top', `${m[1] - 10}px`)
                  .transition()
                  .delay(500)
                  .duration(500)
                  .style('opacity', () => {
                    return opacity;
                  })
                  .style('fill', '#f46d43')
                  .style('display', null);

                return self.tooltipHover(d, true);
              }
              return null;
            })
            .on('mouseout', d => {
              // var id = d.sample.replace(/\;/g, "_");
              d3.select(`circle[id='violin_${d.featureID}']`)
                .transition()
                .duration(300)
                .attr('r', x => {
                  const inBrush = this.brushedData.findIndex(
                    d => d.featureID === x.featureID,
                  );
                  if (self.maxCircle !== x.featureID) {
                    if (inBrush > 0) {
                      return dOpts.pointSize * 1.5;
                    } else {
                      return dOpts.pointSize * 1;
                    }
                  }
                  return dOpts.pointSize * 2;
                });

              // self.dotHover.emit({ object: d, action: 'mouseout' });
              if (self.isHovering) {
                if (self.maxCircle !== d.featureID) {
                  self.chart.objs.tooltip
                    .transition()
                    .duration(500)
                    .style('opacity', 0);
                }
              }
            })
            .on('click', d => {
              self.isHovering = false;
              const inBrush = this.brushedData.findIndex(function(x) {
                return x.featureID === d.featureID;
              });
              if (inBrush > 0) {
                const HighlightedProteins = [...this.brushedData];
                HighlightedProteins.splice(inBrush, 1);
                HighlightedProteins.unshift(d);
                self.props.onHandleProteinSelected(HighlightedProteins);
              } else {
                this.brushedData = [];
                this.clearBrush(self);
                self.props.onHandleProteinSelected([
                  {
                    sample: d.sample,
                    featureID: d.featureID,
                    cpm: d.statistic,
                  },
                ]);
              }
              self.maxCircle = d.featureID;
              self.addToolTiptoMax(d);
            });
        }
      });
    };

    self.chart.dataPlots.preparePlots();
    self.chart.dataPlots.update();
    return self.chart;
  };

  windowResized = () => {
    // this.initiateViolinPlot(true);
  };

  initiateViolinPlot = resetDimensions => {
    const { violinSettings, verticalSplitPaneSize } = this.props;
    d3.select(`#${violinSettings.id}`).remove();
    if (resetDimensions) {
      // we calculate height based on the containerRef
      let containerHeight = this.getHeight();
      if (containerHeight === 0) {
        containerHeight = 400;
      }
      const height =
        containerHeight -
        violinSettings.margin.top -
        violinSettings.margin.bottom;

      const containerWidth = verticalSplitPaneSize;
      const width =
        verticalSplitPaneSize -
        violinSettings.margin.left -
        violinSettings.margin.right;

      this.setState(
        {
          violinContainerHeight: containerHeight,
          violinHeight: height,
          violinContainerWidth: containerWidth,
          violinWidth: width,
        },
        function() {
          this.createViolinPlot();
        },
      );
    } else {
      this.createViolinPlot();
    }
  };

  getHeight = () => {
    if (this.violinContainerRef.current !== null) {
      return this.violinContainerRef.current.parentElement.offsetHeight;
    }
    return window.screen.height - this.props.horizontalSplitPaneSize - 51;
  };

  handleElementText = (removeText, highlighted) => {
    const self = this;
    const chartSVG = d3.select(`#${self.props.violinSettings.id}`);
    if (removeText) {
      chartSVG.selectAll('g.circleText').remove();
      chartSVG.selectAll('.brushed').classed('brushed', false);
      return;
    }
    if (!self.state.displayElementTextViolin) {
      chartSVG.selectAll('g.circleText').attr('opacity', 0);
    } else {
      chartSVG.selectAll('g.circleText').attr('opacity', 1);
    }
  };

  handleElementTextChange = () => {
    const opacity = this.state.displayElementTextViolin ? 1 : 0;
    const display = this.state.displayElementTextViolin ? null : 'none';
    this.chart.objs.tooltip
      .transition()
      .duration(300)
      .style('opacity', () => {
        return opacity;
      })
      .style('display', display);
    sessionStorage.setItem(
      'displayElementTextViolin',
      !this.state.displayElementTextViolin,
    );
    this.setState(
      { displayElementTextViolin: !this.state.displayElementTextViolin },
      function() {
        this.handleElementText(false, this.props.HighlightedProteins);
      },
    );
  };

  render() {
    const { violinSettings } = this.props;
    const { displayElementTextViolin } = this.state;
    return (
      <>
        <span className="TextToggleButton">
          <Popup
            trigger={
              <Icon
                name="font"
                size="small"
                inverted
                circular
                onClick={this.handleElementTextChange}
                id={displayElementTextViolin ? 'PrimaryBackground' : 'black'}
              />
            }
            style={{
              backgroundColor: '#2E2E2E',
              borderBottom: '2px solid var(--color-primary)',
              color: '#FFF',
              padding: '1em',
              fontSize: '13px',
            }}
            className=""
            basic
            content={displayElementTextViolin ? 'Hide Labels' : 'Show Labels'}
          />
        </span>
        <div
          ref={this.violinContainerRef}
          id={violinSettings.parentId}
          className="violin-chart-wrapper"
        />
      </>
    );
  }
}

export default ViolinPlot;
