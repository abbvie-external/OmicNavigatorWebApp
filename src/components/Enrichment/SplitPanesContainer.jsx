import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
// import PlotSVG from './PlotSVG';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';
import SVGPlot from '../Shared/SVGPlot';
import BarcodePlot from './BarcodePlot';

class SplitPanesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSVGTabIndex: 0
    };
  }

  componentDidMount() {}

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex
    });
  };

  getBarcode = (
    isTestDataLoaded,
    props,
    state,
    barcodeData,
    barcodeSettings
  ) => {
    if (!isTestDataLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Barcode Plot is Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <BarcodePlot
          className="BarcodePlotContainer"
          {...state}
          {...props}
          // data={barcodeData}
          // settings={barcodeSettings}
        />
      );
    }
  };

  render() {
    const {
      enrichmentModel,
      isTestDataLoaded,
      barcodeData,
      barcodeSettings
    } = this.props;
    const Barcode = this.getBarcode(
      isTestDataLoaded,
      this.props,
      this.state,
      barcodeData,
      barcodeSettings
    );

    // if (!isTestDataLoaded) {
    //   return (
    //     <div>
    //       <Dimmer active inverted>
    //         <Loader size="large">Barcode, Violin, Dot Plots are Loading</Loader>
    //       </Dimmer>
    //     </div>
    //   );
    // } else {
    if (enrichmentModel === 'Timecourse Differential Phosphorylation') {
      return (
        <div className="ThreePlotsWrapper">
          <Grid columns={2} className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <EnrichmentBreadcrumbs
                  {...this.props}
                  // onNavigateBack={this.tableTransition}
                />
              </Grid.Column>
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                {/* <ButtonActions {...this.props} {...this.state} /> */}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <SplitPane
                className="SplitPanesWrapper"
                split="horizontal"
                defaultSize={225}
                minSize={200}
                maxSize={300}
              >
                <div id="BarcodeSplitContainer">{Barcode}</div>
                <div id="SVGSplitContainer">
                  <SVGPlot
                    {...this.props}
                    {...this.state}
                    onSVGTabChange={this.handleSVGTabChange}
                  />
                </div>
              </SplitPane>
            </Grid.Row>
          </Grid>
        </div>
      );
    } else {
      return (
        <div className="ThreePlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <EnrichmentBreadcrumbs
                  {...this.props}
                  // onNavigateBack={this.tableTransition}
                />
              </Grid.Column>
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                {/* <ButtonActions {...this.props} {...this.state} /> */}
              </Grid.Column>
            </Grid.Row>
            <SplitPane
              className="SplitPanesWrapper"
              split="horizontal"
              defaultSize={275}
              minSize={225}
              maxSize={325}
            >
              <div id="BarcodeSplitContainer">{Barcode}</div>
              <SplitPane
                split="vertical"
                defaultSize={400}
                minSize={300}
                maxSize={700}
              >
                <div id="ViolinSplitContainer">
                  <h2>VIOLIN</h2>
                </div>

                <div id="SVGSplitContainer">
                  <SVGPlot
                    {...this.props}
                    {...this.state}
                    // onSVGTabChange={this.handleSVGTabChange}
                  />
                </div>
              </SplitPane>
            </SplitPane>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(SplitPanesContainer);
