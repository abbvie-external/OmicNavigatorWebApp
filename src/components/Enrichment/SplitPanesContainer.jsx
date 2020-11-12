import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab } from 'semantic-ui-react';
// import _ from 'lodash';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import SplitPane from 'react-split-pane';
import './SplitPanesContainer.scss';
import SVGPlot from '../Shared/SVGPlot';
import BarcodePlot from './BarcodePlot';
import ViolinPlot from './ViolinPlot';
import FilteredDifferentialTable from './FilteredDifferentialTable';

class SplitPanesContainer extends Component {
  state = {
    activeSVGTabIndex: 0,
    horizontalSplitPaneSize:
      parseInt(localStorage.getItem('horizontalSplitPaneSize'), 10) || 250,
    verticalSplitPaneSize:
      parseInt(localStorage.getItem('verticalSplitPaneSize'), 10) || 525,
    activeViolinTableIndex: 0,
  };
  filteredDifferentialGridRef = React.createRef();

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
            <Loader size="large">Loading Plot</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <BarcodePlot
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
        <div className="PlotInstructions">
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
    const {
      displayViolinPlot,
      enrichmentStudy,
      enrichmentModel,
      imageInfo,
    } = this.props;
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
            <FilteredDifferentialTable
              {...this.state}
              {...this.props}
              filteredDifferentialGridRef={this.filteredDifferentialGridRef}
            />
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
            <FilteredDifferentialTable {...this.state} {...this.props} />
          </Tab.Pane>
        ),
      },
    ];

    const testVar =
      imageInfo.key !== '' && imageInfo.key != null
        ? imageInfo.key.split(':')[0]
        : '';
    const selectedPlot = violinAndTablePanes[activeViolinTableIndex].menuItem;
    const ButtonActionsClass = this.getButtonActionsClass();
    const actionButtons =
      selectedPlot === 'Statistic Table' ? (
        <ButtonActions
          excelVisible={true}
          pngVisible={false}
          pdfVisible={false}
          svgVisible={false}
          txtVisible={true}
          refFwd={this.filteredDifferentialGridRef}
          exportButtonSize={'mini'}
          tab={'differential'}
          study={enrichmentStudy}
          model={enrichmentModel}
          test={testVar}
        />
      ) : (
        <ButtonActions
          excelVisible={false}
          pngVisible={true}
          pdfVisible={false}
          svgVisible={true}
          txtVisible={false}
          plot={this.props.violinSettings.id}
          exportButtonSize={'mini'}
          description={imageInfo.key}
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
        <div className="PlotInstructions">
          <h4 className="PlotInstructionsText">
            Select barcode line/s to display SVG Plot
          </h4>
        </div>
      );
    } else if (!SVGPlotLoaded & SVGPlotLoading) {
      return (
        <Dimmer active inverted>
          <Loader size="large">Loading Plots</Loader>
        </Dimmer>
      );
    } else {
      return (
        <SVGPlot {...this.props} {...this.state} onSVGTabChange={tabChangeCb} />
      );
    }
  };

  splitPaneResized = (size, paneType) => {
    if (paneType === 'horizontal') {
      this.setState({
        horizontalSplitPaneSize: size,
      });
    } else {
      this.setState({
        verticalSplitPaneSize: size,
      });
    }
    localStorage.setItem(`${paneType}SplitPaneSize`, size);
  };

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
                size={this.state.horizontalSplitPaneSize}
                minSize={185}
                maxSize={400}
                onDragFinished={size =>
                  this.splitPaneResized(size, 'horizontal')
                }
              >
                {BarcodePlot}
                {/* <BarcodePlotReusable
                  data={this.props.barcodeSettings.barcodeData}
                /> */}
                <SplitPane
                  className="BottomSplitPaneContainer"
                  split="vertical"
                  size={this.state.verticalSplitPaneSize}
                  minSize={315}
                  maxSize={1300}
                  onDragFinished={size =>
                    this.splitPaneResized(size, 'vertical')
                  }
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
