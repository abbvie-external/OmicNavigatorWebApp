import React, { Component } from 'react';
import * as d3 from 'd3';

function translate(x, y) {
  return `translate(${x}, ${y})`;
}

class Slice extends Component {
  render() {
    let { value, label } = this.props;
    let arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(50);
    return (
      <g>
        <path d={arc(value)} fill="#fff" />
        {/* https://github.com/d3/d3/wiki/SVG-Shapes#arc_centroid */}
        <text
          transform={translate(...arc.centroid(value))}
          dy=".35em"
          className="label"
        >
          {label}
        </text>
      </g>
    );
  }
}

class Pie extends Component {
  constructor(props) {
    super(props);
    this.renderSlice = this.renderSlice.bind(this);
  }

  render() {
    let { x, y, data } = this.props;
    let pie = d3.pie();
    return <g transform={translate(x, y)}>{pie(data).map(this.renderSlice)}</g>;
  }

  renderSlice(value, i) {
    return (
      <Slice
        key={i}
        outerRadius={this.props.radius}
        value={value}
        label={value.data}
        fill="#FFF"
      />
    );
  }
}

class NetworkLegend extends Component {
  render() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    let minViewportSize = Math.min(width, height);
    let radius = (minViewportSize * 0.9) / 2;
    let x = width / 2;
    let y = height / 2;

    return (
      <svg width="100%" height="100%">
        <Pie
          x={x}
          y={y}
          radius={radius}
          data={this.props.networkSettings.propData}
        />
      </svg>
    );
  }
}

export default NetworkLegend;

//   ReactDOM.render(
//     <App data={[.25, .25, .25, .25]} />,
//     document.getElementById('app')
//   );
