import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import { reviseLayout, clickDownload, loadingDimmer } from '../Shared/helpers';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlySingleFeature extends Component {
  hasSignaledRenderReady = false;

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
      this.hasSignaledRenderReady = false;

      this.getJson();
    }
  }

  signalRenderReady = () => {
    if (this.hasSignaledRenderReady) return;
    this.hasSignaledRenderReady = true;
    if (typeof this.props.onRenderReady === 'function') {
      this.props.onRenderReady();
    }
  };

  getJson = () => {
    const { plotlyData, width, height, errorMessagePlotlySingleFeature } =
      this.props;
    if (!errorMessagePlotlySingleFeature) {
      let parsedData = null;
      if (plotlyData) {
        try {
          parsedData = JSON.parse(plotlyData);
        } catch (err) {
          console.warn('PlotlySingleFeature: failed to parse plotlyData', err);
          this.signalRenderReady();
          this.setState({ loading: false, json: { data: null, layout: null } });
          return;
        }
      }
      const data = parsedData?.data || null;
      let layout = parsedData?.layout || null;
      if (layout) {
        layout = reviseLayout(layout, width, height);
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
      plotlyExportType,
      errorMessagePlotlySingleFeature,
    } = this.props;

    if (errorMessagePlotlySingleFeature) {
      this.signalRenderReady();
    }
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
        {this.state.json.data &&
        this.state.json.layout &&
        !errorMessagePlotlySingleFeature ? (
          <Plot
            data={this.state.json.data}
            layout={this.state.json.layout}
            config={config}
            onInitialized={this.signalRenderReady}
            onUpdate={this.signalRenderReady}
          />
        ) : (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText NoSelect">
              {errorMessagePlotlySingleFeature}
            </h4>
          </div>
        )}
        <span id="PlotSingleFeatureDataLoader">
          {this.state.loading && loadingDimmer}
        </span>
      </div>
    );
  }
}
