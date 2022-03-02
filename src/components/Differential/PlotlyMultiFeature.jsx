import React, { Component } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
// import PlotlyConfig from '../Shared/PlotlyConfig.json';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlyMultiFeature extends Component {
  state = {
    data: null,
    layout: null,
  };

  componentDidUpdate(prevProps) {
    debugger;
    if (
      this.props.plotlyExport &&
      prevProps.plotlyExport !== this.props.plotlyExport
    ) {
      // setTimeout(()=>this.clickDownload(), 1000);
      this.clickDownload();
    }
  }

  reviseLayout = layout => {
    const { width, height } = this.props;
    layout.width = Math.floor(width * 0.9);
    layout.height = Math.floor(height * 0.9);
    return layout;
  };

  clickDownload = () => {
    // debugger;
    // const evt = new KeyboardEvent('click', {
    //   key: 'Escape',
    //   bubbles: true,
    // });
    // document.querySelectorAll('[data-title="Download plot"]')?.dispatchEvent(evt);
    setTimeout(
      () =>
        document.querySelectorAll('[data-title="Download plot"]')[0]?.click(),
      1000,
    );
  };

  render() {
    const { plotlyData, plotlyExportType } = this.props;
    // const { layout } = this.state;
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
    const config = {
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displayModeBar: true,
      scrollZoom: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: plotlyExportType, // one of png, svg, jpeg, webp
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
