import React, { Component } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import PlotlyConfig from '../Shared/PlotlyConfig.json';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlyMultiFeature extends Component {
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

  getDataAndLayout = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      plotId,
      plotlyData,
      featureIdsString,
      dimensions,
    } = this.props;
    const cacheKey = `PlotlyMultiFeature_${dimensions}_${differentialStudy}_${differentialModel}_${differentialTest}_${featureIdsString}_${plotId}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const parsedData = JSON.parse(plotlyData);
      const data = parsedData?.data || null;
      let layout = parsedData?.layout || null;
      if (layout) {
        layout = this.reviseLayout(layout);
      }
      this[cacheKey] = { data, layout };
      return { data, layout };
    }
  };

  render() {
    const dataAndLayout = this.getDataAndLayout();
    // console.log(dataAndLayout);
    const loader = dataAndLayout.data ? null : (
      <Dimmer active inverted>
        <Loader size="large">Loading...</Loader>
      </Dimmer>
    );
    return (
      <div>
        <Plot
          data={dataAndLayout.data}
          layout={dataAndLayout.layout}
          config={PlotlyConfig}
        />
        <span id="PlotSingleFeatureDataLoader">{loader}</span>
      </div>
    );
  }
}
