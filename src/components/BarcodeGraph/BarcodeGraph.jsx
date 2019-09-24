import React from 'react';
import PropTypes from 'prop-types';
import { Provider as BusProvider, useBus, useListener } from 'react-bus';
import * as d3 from 'd3';
import * as _ from 'lodash';
import Chart from './Chart/Chart';

import { useChartDimensions, accessorPropsType } from './utils';

const BarcodeGraph = ({
  data,
  settings,
  xAccessor,
  yAccessor,
  highLabel,
  lowLabel,
  statLabel
}) => {
  const [ref, dimensions] = useChartDimensions({
    marginBottom: 77
  });

  return (
    <div className="BarcodeGraph" ref={ref}>
      <Chart dimensions={dimensions} settings={settings} data={data}></Chart>
    </div>
  );
};

BarcodeGraph.propTypes = {
  xAccessor: accessorPropsType,
  yAccessor: accessorPropsType,
  highLabel: PropTypes.string,
  lowLabel: PropTypes.string,
  statLabel: PropTypes.string
};

BarcodeGraph.defaultProps = {
  xAccessor: d => d.x,
  yAccessor: d => d.y
};
export default BarcodeGraph;
