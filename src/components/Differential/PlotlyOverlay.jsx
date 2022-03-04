import React, { Component } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import { reviseLayout, clickDownload } from '../Shared/helpers';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlyOverlay extends Component {
  state = {
    data: null,
    layout: null,
  };

  componentDidUpdate(prevProps) {
    if (
      this.props.plotlyExport &&
      prevProps.plotlyExport !== this.props.plotlyExport
    ) {
      clickDownload(this.props.parentNode);
    }
  }

  render() {
    const {
      plotName,
      plotlyData,
      plotlyExportType,
      width,
      height,
    } = this.props;
    const parsedData = JSON.parse(plotlyData);
    const data = parsedData?.data || null;
    let layout = parsedData?.layout || null;
    if (layout) {
      layout = reviseLayout(layout, width, height);
    }
    const loader = data ? null : (
      <Dimmer active inverted>
        <Loader size="large">Loading...</Loader>
      </Dimmer>
    );
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displayModeBar: true,
      scrollZoom: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: plotlyExportType, // one of png, svg, jpeg, webp
        filename: `${plotName}_${`${this.props.featureId}`}`,
      },
    };

    return (
      <div>
        <Plot data={data} layout={layout} config={config} />
        <span id="PlotSingleFeatureDataLoader">{loader}</span>
      </div>
    );
  }
}
