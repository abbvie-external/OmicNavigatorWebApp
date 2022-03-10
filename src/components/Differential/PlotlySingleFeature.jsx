import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import { reviseLayout, clickDownload, loadingDimmer } from '../Shared/helpers';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlySingleFeature extends Component {
  state = {
    json: {
      data: null,
      layout: null,
    },
    loading: true,
  };
  componentDidMount() {
    this.getJson();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.plotlyExport &&
      prevProps.plotlyExport !== this.props.plotlyExport
    ) {
      clickDownload(this.props.parentNode);
    }
    if (this.props.cacheString !== prevProps.cacheString) {
      this.getJson();
    }
  }

  getJson = () => {
    const { plotlyData, width, height } = this.props;
    const parsedData = JSON.parse(plotlyData);
    const data = parsedData?.data || null;
    let layout = parsedData?.layout || null;
    if (layout) {
      layout = reviseLayout(layout, width, height);
    }
    this.setState({
      json: {
        data,
        layout,
        loading: false,
      },
    });
  };

  render() {
    const { plotName, plotKey, plotlyExportType } = this.props;
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displayModeBar: true,
      scrollZoom: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: plotlyExportType, // one of png, svg, jpeg, webp
        filename: `${plotName}_${plotKey}`,
      },
    };
    return (
      <div>
        {this.state.json.data && this.state.json.layout && (
          <Plot
            data={this.state.json.data}
            layout={this.state.json.layout}
            config={config}
          />
        )}
        <span id="PlotSingleFeatureDataLoader">
          {!this.state.loading && loadingDimmer}
        </span>
      </div>
    );
  }
}
