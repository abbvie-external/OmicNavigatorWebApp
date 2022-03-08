import React, { Component } from 'react';
// import { Dimmer, Loader } from 'semantic-ui-react';
import Plot from 'react-plotly.js';
import { reviseLayout, clickDownload } from '../Shared/helpers';
import '../Shared/PlotlyOverrides.scss';

export default class PlotlyMultiFeature extends Component {
  state = {
    json: {
      data: null,
      layout: null,
    },
    loading: true,
  };
  componentDidMount() {
    const json = this.getJson();
    // console.log("mounted");
    this.setState({
      json: {
        data: json.data,
        layout: json.layout,
      },
    });
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.plotlyExport &&
      prevProps.plotlyExport !== this.props.plotlyExport
    ) {
      clickDownload(this.props.parentNode);
    }
    if (
      prevProps.featureIdsString !== this.props.featureIdsString ||
      prevProps.plotId !== this.props.plotId ||
      prevProps.dimensions !== this.props.dimensions ||
      prevProps.plotlyData?.length !== this.props.plotlyData?.length
    ) {
      // debugger;
      // console.log("updated!");
      const json = this.getJson();
      this.setState({
        json: {
          data: json.data,
          layout: json.layout,
        },
      });
    }
  }

  // componentWillUnmount() {
  //   debugger;
  //   console.log("unmounted")
  //   this.setState({
  //     json: {
  //       data: null,
  //       layout: null,
  //     },
  //   });
  // }

  // purgePlot = () => {
  //   console.log("purge");
  //   this.setState({
  //     json: {
  //       data: null,
  //       layout: null,
  //     },
  //   });
  // }

  getJson = () => {
    const {
      differentialStudy,
      differentialModel,
      differentialTest,
      plotId,
      plotlyData,
      featureIdsString,
      width,
      height,
    } = this.props;
    const cacheKey = `PlotlyMultiFeature_${width}_${height}_${differentialStudy}_${differentialModel}_${differentialTest}_${featureIdsString}_${plotId}`;
    if (this[cacheKey] != null) {
      return this[cacheKey];
    } else {
      const parsedData = JSON.parse(plotlyData);
      const data = parsedData?.data || null;
      let layout = parsedData?.layout || null;
      if (layout) {
        layout = reviseLayout(layout, width, height);
      }
      this[cacheKey] = { data, layout };
      return { data, layout };
    }
  };

  handleInitialized = () => {
    this.setState({
      loading: false,
    });
  };

  render() {
    const { plotName, featuresLength, plotlyExportType } = this.props;
    // const loader = this.state.json?.data ? null : (
    //   <Dimmer active inverted>
    //   <Loader size="large">Loading...</Loader>
    // </Dimmer>
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
    // console.log(JSON.stringify(this.state.json?.data));
    return (
      <div>
        {this.state.json?.data && this.state.json?.layout && (
          <Plot
            data={this.state.json.data}
            layout={this.state.json.layout}
            config={config}
            // onPurge={this.purgePlot}
            // onInitialized={figure => this.setState({ figure, loading: false })}
            // onUpdate={figure => this.setState(figure)}
          />
        )}
        {/* <span id="PlotSingleFeatureDataLoader">
          {this.state.loading && loader}
        </span> */}
      </div>
    );
  }
}
