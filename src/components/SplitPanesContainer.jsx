import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Header } from 'semantic-ui-react';
import Breadcrumbs from './Breadcrumbs';
import ButtonActions from './ButtonActions';
import PlotAccordion from './PlotAccordion';
import PlotSVG from './PlotSVG';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';

class SplitPanesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSVGTabIndex: 0,
      excelVisible: true,
      pngVisible: true,
      pdfVisible: true
      // returningToTable: false,
    };
  }

  static defaultProps = {
    isTestDataLoaded: false
  };

  componentDidMount() {}

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex
    });
  };

  render() {
    const { enrichmentModel, isTestDataLoaded } = this.props;
    // const splitPanes = (enrichmentModel === "Timecourse Differential Phosphorylation") ? twoPanes : threePanes;
    // const SplitPanes = getSplitPanes(enrichmentModel);
    // const BarcodeStyle = {
    //   height: '30vw !important'
    // };

    // const ViolinStyle = {
    //   width: '33% !important'
    // };

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
                  <Breadcrumbs
                    {...this.props}
                    // onNavigateBack={this.tableTransition}
                  />
                </Grid.Column>
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  <ButtonActions {...this.props} {...this.state} />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className="SplitPanesContainer">
                <SplitPane split="horizontal" defaultSize={400}>
                  <div>
                    <h2>BARCODE Timcecourse</h2>
                  </div>

                  <div>
                    <h2>SVG PLOTS Timecourse</h2>
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
                  <Breadcrumbs
                    {...this.props}
                    // onNavigateBack={this.tableTransition}
                  />
                </Grid.Column>
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  <ButtonActions {...this.props} {...this.state} />
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className="SplitPanesContainer">
                <SplitPane split="horizontal" defaultSize={250}>
                  <div>
                    <h2>BARCODE</h2>
                  </div>

                  <SplitPane split="vertical" defaultSize={400}>
                    <div>
                      <h2>VIOLIN</h2>
                    </div>

                    <div>
                      <h2>SVG PLOTS</h2>
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
