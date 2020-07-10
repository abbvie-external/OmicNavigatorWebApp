import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import PepplotBreadcrumbs from './PepplotBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
// import PepplotAccordion from './PepplotAccordion';
// import MetafeaturesTable from './MetafeaturesTable';
// import SplitPane from 'react-split-pane';
import PepplotPlotTabs from './PepplotPlotTabs';
import '../Enrichment/SplitPanesContainer.scss';
// import SVGPlot from '../Shared/SVGPlot';
import './PepplotPlot.scss';

class PepplotPlot extends Component {
  static defaultProps = {
    // isProteinDataLoaded: false,
    isProteinSVGLoaded: true,
  };

  state = {
    activePepplotPlotTabsIndex: 0,
    excelVisible: true,
    pngVisible: true,
    pdfVisible: false,
    svgVisible: true,
    metafeaturesSplitPaneSize:
      parseInt(sessionStorage.getItem('metafeaturesSplitPaneSize'), 10) || 525,
  };

  handlePepplotPlotTabChange = activeTabIndex => {
    this.setState({
      activePepplotPlotTabsIndex: activeTabIndex,
    });
  };

  splitPaneResized(size, paneType) {
    if (paneType === 'horizontal') {
      this.setState({
        horizontalSplitPaneSize: size,
      });
    } else {
      this.setState({
        verticalSplitPaneSize: size,
      });
    }
    sessionStorage.setItem(`${paneType}SplitPaneSize`, size);
  }

  render() {
    if (!this.props.isProteinSVGLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Plots are Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <div className="PlotWrapper">
          <Grid columns={2} className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <PepplotBreadcrumbs {...this.props} />
              </Grid.Column>
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.props} {...this.state} />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Grid columns={2} className="PlotContainer">
            <Grid.Row className="PlotContainerRow">
              <Grid.Column
                // className="PepplotAccordionContainer"
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <PepplotPlotTabs
                  {...this.props}
                  {...this.state}
                  onPepplotPlotTableChange={this.handlePepplotPlotTabChange}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(PepplotPlot);
