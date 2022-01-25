import React, { Component } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
// import axios from 'axios';

export default class PlotlyOverlay extends Component {
  state = {
    data: null,
    layout: null,
  };
  // async componentDidMount() {
  // const response = await fetch(this.props.plotlyDataUrl);
  // const json = await response;
  // this.setState({ data: response.data, layout: response.layout });
  // }

  // componentDidMount() {
  //   const { plotlyData } = this.props;
  //   const parsedData = JSON.parse(plotlyData);
  //   // const data = parsedData?.data || null;
  //   let layout = parsedData?.layout || null;
  //   if (layout) {
  //     layout = this.reviseLayout(layout);
  //   }
  // }

  // componentDidUpdate(prevState, prevProps) {
  //   if (
  //     prevProps.divWidthPt !== this.props.divWidthPt ||
  //     prevProps.divHeightPt !== this.props.divHeightPt
  //   ) {
  //     const { plotlyData } = this.props;
  //     const parsedData = JSON.parse(plotlyData);
  //     let layout = parsedData?.layout || null;
  //     if (layout) {
  //       layout = this.reviseLayout(layout);
  //     }
  //   }
  // }

  reviseLayout = layout => {
    const { width, height } = this.props;
    layout.width = Math.floor(width * 0.9);
    layout.height = Math.floor(height * 0.9);
    return layout;
    // this.setState({
    //   layout,
    // });
  };

  render() {
    const { plotlyData } = this.props;
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
    return (
      <div>
        <Plot data={data} layout={layout} />
        <span id="PlotSingleFeatureDataLoader">{loader}</span>
      </div>
    );
  }
}
