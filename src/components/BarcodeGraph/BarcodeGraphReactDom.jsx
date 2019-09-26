import React from 'react';
import PropTypes from 'prop-types';
import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';

import Chart from './Chart/Chart';
import Circles from './Chart/Circles';
import Axis from './Chart/Axis';
import Line from './Chart/Line';
import Gradient from './Chart/Gradient';
import {
  useChartDimensions,
  accessorPropsType,
  useUniqueId
} from './Chart/utils';

const BarcodeGraph = ({
  data,
  settings
  // xAccessor,
  // highLabel,
  // lowLabel,
  // statLabel
}) => {
  const [ref, dimensions] = useChartDimensions({
    width: 1000,
    height: 1000,
    marginBottom: 77,
    marginTop: 65,
    marginRight: 60,
    marginLeft: 60,
    boundedHeight: 800,
    boundedWidth: 800
  });

  // const xScale = d3.scaleLinear()
  //   .domain(d3.extent(data, xAccessor))
  //   .range([dimensions.boundedHeight, 0])
  //   .nice()

  // const xAccessorScaled = d => xScale(xAccessor(d))
  return (
    <div className="BarcodeGraph" ref={ref}>
      <Chart dimensions={dimensions} settings={settings} data={data}>
        {/* <Axis
        dimension="x"
        scale={xScale}
        formatTick={}
      /> */}
      </Chart>
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
