import React from 'react';
import PropTypes from 'prop-types';
import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';

import Chart from './Chart/Chart';
import Circles from './Chart/Circles';
import Axis from './Chart/Axis';
import Line from './Chart/Line';
// import Gradient from './Chart/Gradient';
import {
  useChartDimensions,
  accessorPropsType,
  useUniqueId
} from './Chart/utils';

const BarcodeGraph = ({
  data
  // xLabel,
  // yLabel
  //settings
  // xAccessor,
  // highLabel,
  // lowLabel,
  // statLabel
}) => {
  debugger;
  // const [ref, dimensions] = useChartDimensions({
  //   width: 750,
  //   height: 200,
  //   marginBottom: 77,
  //   marginTop: 65,
  //   marginRight: 60,
  //   marginLeft: 60,
  //   boundedHeight: 150,
  //   boundedWidth: 700
  // });

  // const xScale = d3.scaleLinear()
  //   .domain(d3.extent(data, xAccessor))
  //   .range([dimensions.boundedHeight, 0])
  //   .nice()

  // const xAccessorScaled = d => xScale(xAccessor(d))
  return (
    <div
      id="chart-barcode"
      className="BarcodeChartWrapper"
      // ref={this.barcodeChartRef}
    >
      {/* <div className="BarcodeGraph" 
    > */}
      <svg
        id="svg-chart-barcode"
        className="barcode-chart-area bcChart barcode"
        viewBox="0 0 1324 230"
        preserveAspectRatio="xMinYMin meet"
        // {...props}
      >
        <text transform="translate(662 195)" textAnchor="middle">
          {'abs(t)'}
        </text>
        <text transform="rotate(-90 62.5 2.5)" y={-5} x={-80}>
          {'Small Effect'}
        </text>
        <text transform="rotate(-90 62.5 2.5)" y={1224} x={-80}>
          {'Large Effect'}
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
            fontSize={10}
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            <path
              className="domain"
              stroke="#2c3b78"
              d="M65.5 161v-5.5h1194v5.5"
            />
            <g className="tick">
              <path stroke="#2c3b78" d="M1150.955 155v6" />
              <text
                fill="#2c3b78"
                y={9}
                dy=".71em"
                transform="translate(1150.955 155)"
              >
                {'10'}
              </text>
            </g>
          </g>
          <path
            className="overlay"
            cursor="crosshair"
            d="M60 15h1324v280H60z"
          />
        </g>
        {data.map((d, i) => (
          <path
            className={`barcode-line-${d.lineID}`}
            key={`key-${d.lineID}`}
            stroke="#2c3b78"
            strokeWidth={2}
            opacity={0.5}
            d="M332.836 45v110M270.379 45v110M160.39 45v110M155.364 45v110M151.348 45v110M110.546 45v110M109.33 45v110M72.989 45v110M65.608 45v110"
          />
        ))}
      </svg>
    </div>
  );
};

// BarcodeGraph.propTypes = {
//   xAccessor: accessorPropsType,
//   highLabel: PropTypes.string,
//   lowLabel: PropTypes.string,
//   statLabel: PropTypes.string
// };

// BarcodeGraph.defaultProps = {
//   xAccessor: d => d.x,
// };
export default BarcodeGraph;
