import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import Breadcrumbs from './Breadcrumbs';
// import ButtonActions from './ButtonActions';
// import PlotSVG from './PlotSVG';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';
import BarcodePlot from './BarcodePlot';

class SplitPanesContainer extends Component {
  componentDidMount() {}

  render() {
    const {
      enrichmentModel,
      isTestDataLoaded,
      barcodeData,
      barcodeSettings
    } = this.props;

    if (!isTestDataLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Barcode, Violin, Dot Plots are Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      if (enrichmentModel === 'Timecourse Differential Phosphorylation') {
        return (
          <div className="">
            <Grid columns={2} className="">
              <Grid.Row className="ActionsRow">
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  {/* <Breadcrumbs
                    {...this.props}
                    // onNavigateBack={this.tableTransition}
                  /> */}
                </Grid.Column>
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  {/* <ButtonActions {...this.props} {...this.state} /> */}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className="SplitPanesContainer">
                <SplitPane
                  split="horizontal"
                  defaultSize={225}
                  minSize={200}
                  maxSize={300}
                >
                  <div>
                    <BarcodePlot
                      className="BarcodePlotContainer"
                      data={barcodeData}
                      settings={barcodeSettings}
                    />
                  </div>
                  <div>
                    <h2>SVG</h2>
                  </div>
                </SplitPane>
              </Grid.Row>
            </Grid>
          </div>
        );
      } else {
        return (
          <div className="">
            <Grid columns={2} className="">
              <Grid.Row className="ActionsRow">
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  {/* <Breadcrumbs
                    {...this.props}
                    // onNavigateBack={this.tableTransition}
                  /> */}
                </Grid.Column>
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  {/* <ButtonActions {...this.props} {...this.state} /> */}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className="SplitPanesContainer">
                <SplitPane
                  split="horizontal"
                  defaultSize={225}
                  minSize={200}
                  maxSize={300}
                >
                  <div>
                    <BarcodePlot
                      className="BarcodePlotContainer"
                      data={barcodeData}
                      settings={barcodeSettings}
                    />
                  </div>
                  <SplitPane
                    split="vertical"
                    defaultSize={400}
                    minSize={300}
                    maxSize={700}
                  >
                    <div>
                      <h2>VIOLIN</h2>
                    </div>

                    <div>
                      <h2>SVG</h2>
                    </div>
                  </SplitPane>
                </SplitPane>
              </Grid.Row>
            </Grid>
          </div>
        );
      }
    }
  }
}

export default withRouter(SplitPanesContainer);
