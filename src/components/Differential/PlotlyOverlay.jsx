import React, { Component } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import PlotlyConfig from '../Shared/PlotlyConfig.json';
import '../Shared/PlotlyOverrides.scss';
// import axios from 'axios';

export default class PlotlyOverlay extends Component {
  state = {
    data: null,
    layout: null,
  };

  reviseLayout = layout => {
    const { width, height } = this.props;
    layout.width = Math.floor(width * 0.9);
    layout.height = Math.floor(height * 0.9);
    return layout;
  };

  render() {
    const { plotlyData } = this.props;
    const parsedData = JSON.parse(plotlyData);
    const data = parsedData?.data || null;
    let layout = parsedData?.layout || null;
    if (layout) {
      layout = this.reviseLayout(layout);
    }
    const loader = data ? null : (
      <Dimmer active inverted>
        <Loader size="large">Loading...</Loader>
      </Dimmer>
    );
    return (
      <div>
        <Plot data={data} layout={layout} config={PlotlyConfig} />
        <span id="PlotSingleFeatureDataLoader">{loader}</span>
      </div>
    );
  }
}
