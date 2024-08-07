import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import { reviseLayout, clickDownload, loadingDimmer } from '../Shared/helpers';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlyOverlay extends Component {
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
    const { plotlyData, width, height, plotId, errorMessagePlotlyOverlay } =
      this.props;
    if (!errorMessagePlotlyOverlay) {
      const parsedData = plotlyData ? JSON.parse(plotlyData) : null;
      const data = parsedData?.data || null;
      let layout = parsedData?.layout || null;
      if (layout) {
        layout = reviseLayout(layout, width, height, plotId);
      }
      this.setState({
        json: {
          data,
          layout,
        },
      });
    }
    this.setState({
      loading: false,
    });
  };

  render() {
    const {
      plotName,
      plotKey,
      featuresLength,
      plotlyExportType,
      errorMessagePlotlyOverlay,
    } = this.props;
    const filename =
      featuresLength > 1
        ? `${plotName}_(${featuresLength}-features)`
        : `${plotName}_${`${plotKey}`}`;
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displayModeBar: true,
      scrollZoom: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: plotlyExportType, // one of png, svg, jpeg, webp
        filename: filename,
      },
    };
    return (
      <div>
        {this.state.json.data &&
        this.state.json.layout &&
        !errorMessagePlotlyOverlay ? (
          <Plot
            data={this.state.json.data}
            layout={this.state.json.layout}
            config={config}
          />
        ) : (
          <h4 className="PlotInstructionsText NoSelect">
            {errorMessagePlotlyOverlay}
          </h4>
        )}
        <span id="PlotOverlayDataLoader">
          {this.state.loading && loadingDimmer}
        </span>
      </div>
    );
  }
}
