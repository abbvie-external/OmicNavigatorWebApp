import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Button, Tab } from 'semantic-ui-react';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
// import PlotSVG from './PlotSVG';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';
import SVGPlot from '../Shared/SVGPlot';
import BarcodePlot from './BarcodePlot';
import BarcodePlotReact from './BarcodePlotReact';
import BarcodePlotReusable from './BarcodePlotReusable';
import ViolinPlot from './ViolinPlot';
import FilteredPepplotTable from './FilteredPepplotTable';

class SplitPanesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSVGTabIndex: 0,
      proteinForDiffView: '',
      horizontalSplitPaneSize:
        parseInt(localStorage.getItem('horizontalSplitPaneSize'), 10) || 250,
      verticalSplitPaneSize:
        parseInt(localStorage.getItem('verticalSplitPaneSize'), 10) || 415,
      activeViolinTableIndex: 0,
      violinDotSelected: null
    };
  }

  componentDidMount() {}

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex
    });
  };

  setProteinForDiffView = proteinSite => {
    this.setState({
      proteinForDiffView: proteinSite
    });
  };

  getBarcodePlot = () => {
    const { isTestDataLoaded, barcodeSettings } = this.props;
    const d = barcodeSettings.barcodeData;
    const absTAccessor = d => d.statistic;
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
        <BarcodePlotReact
          className="BarcodePlotContainer"
          {...this.state}
          {...this.props}
          onSetProteinForDiffView={this.setProteinForDiffView}
        />
        // <BarcodePlot
        //   className="BarcodePlotContainer"
        //   {...this.state}
        //   {...this.props}
        //   onSetProteinForDiffView={this.setProteinForDiffView}
        // />
        // <BarcodePlotReusable
        //   data={barcodeSettings.barcodeData}
        //   xAccessor={absTAccessor}
        //   label="test"
        // />
      );
    }
  };

  getViolinPlot() {
    const { isViolinPlotLoading, isViolinPlotLoaded } = this.props;
    // isViolinPlotLoaded
    if (!isViolinPlotLoaded) {
      return (
        <div className="PlotInstructionsDiv">
          <h4 className="PlotInstructionsText">
            Select barcode line/s to display Violin Plot
          </h4>
        </div>
      );
    } else {
      return (
        <ViolinPlot
          className="ViolinPlotContainer"
          {...this.state}
          {...this.props}
          onHandleViolinDotSelected={this.handleViolinDotSelected}
        />
      );
    }
  }

  handleViolinDotSelected = e => {
    debugger;
    this.setState({
      violinDotSelected: 'test'
    });
  };

  handleViolinTableTabChange = (e, { activeIndex }) => {
    this.setState({
      activeViolinTableIndex: activeIndex
    });
  };

  getViolinAndTable = () => {
    const { activeViolinTableIndex } = this.state;
    const violinPlot = this.getViolinPlot();
    const violinAndTablePanes = [
      {
        menuItem: 'Box Plot',
        pane: (
          <Tab.Pane
            attached
            key="1"
            id="ViolinPlotTab"
            className="ViolinPlotTab"
            // as="div"
          >
            <div id="" className="ViolinPlotDiv">
              {violinPlot}
            </div>
          </Tab.Pane>
        )
      },
      {
        menuItem: 'Statistic Table',
        pane: (
          <Tab.Pane
            attached
            key="2"
            id="TableResultsTab"
            className="TableResultsTab"
            // as="div"
          >
            <FilteredPepplotTable {...this.state} {...this.props} />
          </Tab.Pane>
        )
      }
    ];

    return (
      <Tab
        className="ViolinAndTableTabsDiv"
        onTabChange={this.handleViolinTableTabChange}
        panes={violinAndTablePanes}
        activeIndex={activeViolinTableIndex}
        renderActiveOnly={false}
        menu={{
          stackable: true,
          secondary: true,
          pointing: true,
          className: 'ViolinAndTableMenu'
        }}
      />
    );
  };

  getSVGPlot = () => {
    const tabChangeCb = this.handleSVGTabChange;
    const { SVGPlotLoaded, SVGPlotLoading } = this.props;
    if (!SVGPlotLoaded & !SVGPlotLoading) {
      return (
        <div className="PlotInstructionsDiv">
          <h4 className="PlotInstructionsText">
            Select barcode line/s to display SVG Plot
          </h4>
        </div>
      );
    } else if (!SVGPlotLoaded & SVGPlotLoading) {
      return (
        <Dimmer active inverted>
          <Loader size="large">SVG Plot is Loading</Loader>
        </Dimmer>
      );
    } else {
      return (
        <SVGPlot {...this.props} {...this.state} onSVGTabChange={tabChangeCb} />
      );
    }
  };

  splitPaneResized(size, paneType) {
    if (paneType === 'horizontal') {
      this.setState({
        horizontalSplitPaneSize: size
      });
    } else {
      this.setState({
        verticalSplitPaneSize: size
      });
    }
    localStorage.setItem(`${paneType}SplitPaneSize`, size);
  }

  render() {
    const BarcodePlot = this.getBarcodePlot();
    const ViolinAndTable = this.getViolinAndTable();
    const SVGPlot = this.getSVGPlot();

    // if (!isTestDataLoaded) {
    //   return (
    //     <div>
    //       <Dimmer active inverted>
    //         <Loader size="large">Barcode, Violin, Dot Plots are Loading</Loader>
    //       </Dimmer>
    //     </div>
    //   );
    // } else {
    if (this.props.displayViolinPlot) {
      return (
        <div className="PlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={12}
                widescreen={12}
              >
                <EnrichmentBreadcrumbs {...this.props} />
              </Grid.Column>
              {/* <Grid.Column mobile={16} tablet={16} largeScreen={4} widescreen={4}>
                <Button primary className="ViewDiffTableButton" onClick={this.props.onViewDiffTable}>
                  View Differential Table
                </Button>
              </Grid.Column> */}
              {/* <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.props} {...this.state} />
              </Grid.Column> */}

              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <SplitPane
                  className="ThreePlotsDiv SplitPanesWrapper"
                  split="horizontal"
                  defaultSize={this.state.horizontalSplitPaneSize}
                  minSize={150}
                  maxSize={400}
                  onChange={size => this.splitPaneResized(size, 'horizontal')}
                >
                  {BarcodePlot}
                  {/* <BarcodePlotReusable
                    data={this.props.barcodeSettings.barcodeData}
                  /> */}
                  <SplitPane
                    className="BottomSplitPaneContainer"
                    split="vertical"
                    defaultSize={this.state.verticalSplitPaneSize}
                    minSize={315}
                    maxSize={1000}
                    onChange={size => this.splitPaneResized(size, 'vertical')}
                  >
                    <div id="ViolinAndTableSplitContainer">
                      {ViolinAndTable}
                    </div>
                    <div id="SVGSplitContainer">{SVGPlot}</div>
                  </SplitPane>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    } else {
      return (
        <div className="PlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <EnrichmentBreadcrumbs {...this.props} />
              </Grid.Column>
              {/* <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions {...this.props} {...this.state} />
              </Grid.Column> */}
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <SplitPane
                  className="TwoPlotsDiv SplitPanesWrapper"
                  split="horizontal"
                  defaultSize={this.state.horizontalSplitPaneSize}
                  minSize={150}
                  maxSize={400}
                  onChange={size => this.splitPaneResized(size, 'horizontal')}
                >
                  {BarcodePlot}
                  {/* <BarcodePlotReusable
                    data={this.props.barcodeSettings.barcodeData}
                  /> */}
                  <div id="SVGSplitContainer">{SVGPlot}</div>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(SplitPanesContainer);
