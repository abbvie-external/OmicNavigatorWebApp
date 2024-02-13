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
  state = {
    json: {
      data: null,
      layout: null,
    },
    loading: true,
    plotlyInteractive: true,
  };
  componentDidMount() {
    this.getJson(this.props.cacheString);
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
    const { plotlyData, width, height, plotId } = this.props;
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
        loading: false,
      },
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
    const { plotName, featuresLength, plotlyExportType, errorMessage } =
      this.props;
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
        {this.state.json.data && this.state.json.layout ? (
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
            />
          </>
        ) : (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText NoSelect">{errorMessage}</h4>
          </div>
        )}
        <span id="PlotMultiFeatureDataLoader">
          {!this.state.loading && loadingDimmer}
        </span>
      </div>
    );
  }
}
