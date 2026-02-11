import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import { Icon, Popup } from 'semantic-ui-react';
import { reviseLayout, clickDownload, loadingDimmer } from '../Shared/helpers';
import '../Shared/PlotlyOverrides.scss';

const PopupStyle = {
  backgroundColor: '2E2E2E',
  borderBottom: '2px solid var(--color-primary)',
  color: '#FFF',
  padding: '1em',
  fontSize: '13px',
};

export default class PlotlyMultiFeature extends Component {
  hasSignaledRenderReady = false;

  state = {
    json: {
      data: null,
      layout: null,
    },
    loading: true,
    plotlyInteractive: true,
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
    const {
      plotlyData,
      width,
      height,
      plotId,
      errorMessagePlotlyMultiFeature,
    } = this.props;
    if (!errorMessagePlotlyMultiFeature) {
      let parsedData = null;
      if (plotlyData) {
        try {
          parsedData = JSON.parse(plotlyData);
        } catch (err) {
          // Ensure parent knows this render is finished to avoid a stuck loader.
          this.signalRenderReady();
          this.setState({ loading: false, json: { data: null, layout: null } });
          return;
        }
      }
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

  handleClick = (e) => {
    if (e?.points?.length) {
      let exactLabel = isNaN(e.points[0].y);
      let feature = exactLabel ? e.points[0].y : e.points[0].text;
      // heatmaply, iheatmapr use .text, heatmap uses .y
      if (feature && this.state.plotlyInteractive) {
        this.props.onHandlePlotlyClick(feature, exactLabel);
      }
    }
  };

  togglePlotlyInteractive = () => {
    this.setState((prevState) => ({
      plotlyInteractive: !prevState.plotlyInteractive,
    }));
  };

  render() {
    const {
      plotName,
      featuresLength,
      plotlyExportType,
      errorMessagePlotlyMultiFeature,
    } = this.props;

    if (errorMessagePlotlyMultiFeature) {
      this.signalRenderReady();
    }

    const { plotlyInteractive } = this.state;
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displayModeBar: true,
      scrollZoom: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: plotlyExportType, // one of png, svg, jpeg, webp
        filename: `${plotName}_(${featuresLength}-features)`,
      },
    };
    return (
      <div>
        {this.state.json.data &&
        this.state.json.layout &&
        !errorMessagePlotlyMultiFeature ? (
          <>
            <Popup
              trigger={
                <Icon
                  name="mouse pointer"
                  size="small"
                  inverted
                  circular
                  onClick={this.togglePlotlyInteractive}
                  id={plotlyInteractive ? 'PrimaryBackground' : ''}
                  className="PlotlyInteractive"
                />
              }
              style={PopupStyle}
              position="left center"
              inverted
              basic
              content={
                plotlyInteractive
                  ? 'Disable Plotly click interactivity with scatter plot and table'
                  : 'Enable Plotly click interactivity with scatter plot and table'
              }
            />
            <Plot
              data={this.state.json.data}
              layout={this.state.json.layout}
              config={config}
              onClick={this.handleClick}
              onClickAnnotation={this.handleClickAnnotation}
              onSelected={this.handleSelected}
              onInitialized={this.signalRenderReady}
              onUpdate={this.signalRenderReady}
            />
          </>
        ) : (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText NoSelect">
              {errorMessagePlotlyMultiFeature}
            </h4>
          </div>
        )}
        <span id="PlotMultiFeatureDataLoader">
          {this.state.loading && loadingDimmer}
        </span>
      </div>
    );
  }
}
