import React, { Component } from 'react';
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
        margin: { top: 45, right: 25, bottom: 40, left: 20 },
        svg: null,
        title: '',
        tooltip: null
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
    this.unhighLight();
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
    console.log('line clicked');
    // this.unhighLight();
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
    //         return "#2c3b78";
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

  unhighLight = () => {
    d3.selectAll('line.barcode-line')
      .attr('y1', -20)
      .style('stroke-width', 2)
      .style('stroke', '#2c3b78')
      .style('opacity', function(d) {
        return 0.5;
      });
  };

  render() {
    const { settings, containerWidth } = this.state;
    const { barcodeSettings, horizontalSplitPaneSize } = this.props;
    const width = containerWidth - settings.margin.left - settings.margin.right;
    const height =
      horizontalSplitPaneSize - settings.margin.top - settings.margin.bottom;
    const domain = d3
      .scaleLinear()
      .range([5, width - 5])
      .domain([
        0,
        d3.extent(barcodeSettings.barcodeData, function(d) {
          return d.statistic;
        })[1]
      ]);

    const xScale = d3
      .scaleLinear()
      .domain([0, barcodeSettings.highStat])
      .range([5, width - 5]);

    const xAxis = d3.axisBottom(xScale);

    return (
      <div
        ref={this.barcodeWrapperRef}
        id="chart-barcode"
        className="BarcodeChartWrapper"
      >
        <svg
          ref={this.barcodeSVGRef}
          id={`svg-${settings.id}`}
          className="barcode-chart-area bcChart barcode"
          height={height}
          width={width}
          viewBox={`0 0 ${containerWidth} ${horizontalSplitPaneSize}`}
          preserveAspectRatio="xMinYMin meet"
          onClick={this.handleSVGClick}
          cursor="crosshair"
          // {...props}
        >
          <text
            transform={`translate(${width / 2}, ${height + 30})`}
            textAnchor="middle"
          >
            {barcodeSettings.statLabel}
          </text>
          <text transform="rotate(-90)" y={-5} x={0 - height / 1 + 10}>
            {barcodeSettings.lowLabel}
          </text>
          <text transform="rotate(-90)" y={width + 20} x={0 - height / 1 + 10}>
            {barcodeSettings.highLabel}
          </text>

          <g
            className="barcode-axis"
            fill="none"
            pointerEvents="all"
            style={{
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <g
              className="x axis"
              // not sure about this
              transform={`translate(0, ${height})`}
              // end
              fontSize={10}
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              <path
                className="domain"
                stroke="#2c3b78"
                d="M65.5 161v-5.5h1194v5.5"
              />

              {barcodeSettings.barcodeData.map(b => (
                <g className="tick">
                  <path stroke="#2c3b78" d={`${b.statistic}`} />
                  <text
                    fill="#2c3b78"
                    y={9}
                    dy=".71em"
                    transform="translate(1259.5 155)"
                  >
                    {'5'}
                  </text>
                </g>
              ))}
            </g>
          </g>

          {/* <path
                className="prefix__barcode-line"
                stroke="#2c3b78"
                strokeWidth={2}
                opacity={0.5}
                d="M332.836 45v110M270.379 45v110M160.39 45v110M155.364 45v110M151.348 45v110M110.546 45v110M109.33 45v110M72.989 45v110M65.608 45v110"
            /> */}

          {barcodeSettings.barcodeData.map(d => (
            <line
              id={`barcode-line-${d.lineID}-${d.id_mult}`}
              className={`barcode-line-${d.lineID}-${d.id_mult}`}
              key={`${d.lineID}_${d.id_mult}`}
              x1={xScale(d.statistic)}
              x2={xScale(d.statistic)}
              y1={-20}
              y2={height}
              stroke="#2c3b78"
              strokeWidth={2}
              opacity={0.5}
              onClick={this.handleLineClick}
              onMouseEnter={this.handleLineEnter}
              onMouseLeave={this.handleLineLeave}
              // d={`${d.statistic}`}
            />
          ))}
        </svg>
      </div>
    );
  }
}

export default BarcodePlotReact;
