import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab } from 'semantic-ui-react';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
// import PlotSVG from './PlotSVG';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';
import SVGPlot from '../Shared/SVGPlot';
// import BarcodePlot from "./BarcodePlot";
import BarcodePlotReact from './BarcodePlotReact';
// import BarcodePlotReusable from "./BarcodePlotReusable";
import ViolinPlot from './ViolinPlot';
import FilteredPepplotTable from './FilteredPepplotTable';

class SplitPanesContainer extends Component {
  state = {
    activeSVGTabIndex: 0,
    horizontalSplitPaneSize:
      parseInt(sessionStorage.getItem('horizontalSplitPaneSize'), 10) || 250,
    verticalSplitPaneSize:
      parseInt(sessionStorage.getItem('verticalSplitPaneSize'), 10) || 525,
    activeViolinTableIndex: 0,
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.props.isTestSelected;
  // }

  handleSVGTabChange = activeTabIndex => {
    this.setState({
      activeSVGTabIndex: activeTabIndex,
    });
  };

  getBarcodePlot = () => {
    const { isTestDataLoaded } = this.props;
    // const d = barcodeSettings.barcodeData;
    // const absTAccessor = d => d.statistic;
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
        />
      );
    }
  };

  getViolinPlot() {
    const { isViolinPlotLoaded } = this.props;
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
        />
      );
    }
  }

  handleViolinTableTabChange = (e, { activeIndex }) => {
    this.setState({
      activeViolinTableIndex: activeIndex,
    });
  };

  getButtonActionsClass = () => {
    if (
      this.props.enrichmentModel === 'Timecourse Differential Phosphorylation'
    ) {
      return 'export-violin Hide';
    } else {
      return 'export-violin ShowBlock';
    }
  };

  getViolinAndTable = () => {
    const { displayViolinPlot } = this.props;
    const { activeViolinTableIndex } = this.state;
    const violinPlot = this.getViolinPlot();
    const violinAndTablePanes = [
      {
        menuItem: 'Box Plot',
        pane: (
          <Tab.Pane
            attached
            key="0"
            id="ViolinPlotTab"
            className="ViolinPlotTab"
            // as="div"
          >
            <div id="" className="ViolinPlotDiv">
              {violinPlot}
              <ViolinPlot
                className="ViolinPlotContainer"
                {...this.state}
                {...this.props}
              />
            </div>
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Statistic Table',
        pane: (
          <Tab.Pane
            attached
            key="1"
            id="TableResultsTab"
            className="TableResultsTab"
            // as="div"
          >
            <FilteredPepplotTable {...this.state} {...this.props} />
          </Tab.Pane>
        ),
      },
    ];

    const onlyTablePane = [
      {
        menuItem: 'Statistic Table',
        pane: (
          <Tab.Pane
            attached
            key="1"
            id="TableResultsTab"
            className="TableResultsTab"
            // as="div"
          >
            <FilteredPepplotTable {...this.state} {...this.props} />
          </Tab.Pane>
        ),
      },
    ];

    const selectedPlot = violinAndTablePanes[activeViolinTableIndex].menuItem;
    //const actionButtons = selectedPlot === "Statistic Table" ? <ButtonActions excelVisible={false} pngVisible={false} pdfVisible={false} txtVisible={true} exportButtonSize='mini' plot={'table'}/> : <ButtonActions excelVisible={false} pngVisibile={false} exportButtonSize='mini' plot={'violin'}/>;
    const ButtonActionsClass = this.getButtonActionsClass();
    const actionButtons =
      selectedPlot === 'Statistic Table' ? (
        ''
      ) : (
        <ButtonActions
          excelVisible={false}
          pdfVisible={false}
          exportButtonSize="mini"
          plot={'violin'}
        />
      );
    return (
      <div className="main">
        <div className={ButtonActionsClass}>{actionButtons}</div>
        <Tab
          className="ViolinAndTableTabsDiv"
          onTabChange={this.handleViolinTableTabChange}
          panes={displayViolinPlot ? violinAndTablePanes : onlyTablePane}
          // panes={violinAndTablePanes}
          activeIndex={activeViolinTableIndex}
          renderActiveOnly={false}
          menu={{
            stackable: true,
            secondary: true,
            pointing: true,
            className: 'ViolinAndTableMenu',
          }}
        />
      </div>
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
    const BarcodePlot = this.getBarcodePlot();
    const ViolinAndTable = this.getViolinAndTable();
    const SVGPlot = this.getSVGPlot();

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
                  maxSize={800}
                  onChange={size => this.splitPaneResized(size, 'vertical')}
                >
                  <div id="ViolinAndTableSplitContainer">{ViolinAndTable}</div>
                  <div id="SVGSplitContainer">{SVGPlot}</div>
                </SplitPane>
              </SplitPane>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(SplitPanesContainer);
