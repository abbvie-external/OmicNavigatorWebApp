import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab } from 'semantic-ui-react';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import SplitPane from 'react-split-pane-r17';
import './SplitPanesContainer.scss';
import EnrichmentSVGPlot from './EnrichmentSVGPlot';
import BarcodePlot from './BarcodePlot';
import ViolinPlot from './ViolinPlot';
import FilteredDifferentialTable from './FilteredDifferentialTable';

class SplitPanesContainer extends Component {
  state = {
    activeSvgTabIndexEnrichment: 0,
    horizontalSplitPaneSize:
      parseInt(localStorage.getItem('horizontalSplitPaneSize'), 10) || 250,
    verticalSplitPaneSize:
      parseInt(localStorage.getItem('verticalSplitPaneSize'), 10) || 525,
    activeViolinTableIndex: 0,
    elementTextKey: 'featureID',
  };
  filteredDifferentialGridRef = React.createRef();

  handleSVGTabChange = (activeTabIndex) => {
    this.setState({
      activeSvgTabIndexEnrichment: activeTabIndex,
    });
  };

  getBarcodePlot = () => {
    const { isTestDataLoaded } = this.props;
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
      plotDataEnrichment,
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
      plotDataEnrichment.key !== '' && plotDataEnrichment.key != null
        ? plotDataEnrichment.key.split(':')[0]
        : '';
    const selectedPlot = violinAndTablePanes[activeViolinTableIndex].menuItem;
    const ButtonActionsClass = this.getButtonActionsClass();
    const actionButtons =
      selectedPlot === 'Statistic Table' ? (
        <ButtonActions
          exportButtonSize={'mini'}
          excelVisible={true}
          pngVisible={false}
          pdfVisible={false}
          svgVisible={false}
          txtVisible={true}
          refFwd={this.filteredDifferentialGridRef}
          tab={'differential'}
          study={enrichmentStudy}
          model={enrichmentModel}
          test={testVar}
        />
      ) : (
        <ButtonActions
          exportButtonSize={'mini'}
          excelVisible={false}
          pngVisible={true}
          pdfVisible={false}
          svgVisible={true}
          txtVisible={false}
          plot={this.props.violinSettings.id}
          description={plotDataEnrichment.key}
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

  splitPaneResized = (size, paneType) => {
    if (size === undefined) return;
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
    const { verticalSplitPaneSize, horizontalSplitPaneSize } = this.state;
    const {
      enrichmentStudy,
      enrichmentModel,
      hasBarcodeData,
      enrichmentPlotDescriptions,
    } = this.props;
    const ViolinAndTable = this.getViolinAndTable();
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;

    if (hasBarcodeData) {
      const BarcodePlot = this.getBarcodePlot();
      return (
        <div className="PlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                computer={8}
                largeScreen={8}
                widescreen={8}
              >
                <EnrichmentBreadcrumbs {...this.props} />
              </Grid.Column>
              <Grid.Column
                mobile={16}
                tablet={16}
                computer={8}
                largeScreen={8}
                widescreen={8}
                className="elementTextCol"
              ></Grid.Column>

              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <SplitPane
                  className="ThreePlotsDiv SplitPanesWrapper"
                  split="horizontal"
                  size={horizontalSplitPaneSize}
                  minSize={185}
                  maxSize={400}
                  onDragFinished={(size) =>
                    this.splitPaneResized(size, 'horizontal')
                  }
                >
                  {BarcodePlot}
                  <SplitPane
                    className="BottomSplitPaneContainer"
                    split="vertical"
                    size={this.state.verticalSplitPaneSize}
                    minSize={315}
                    maxSize={1300}
                    onDragFinished={(size) =>
                      this.splitPaneResized(size, 'vertical')
                    }
                  >
                    <div id="ViolinAndTableSplitContainer">
                      {ViolinAndTable}
                    </div>
                    <div id="SVGSplitContainer">
                      <EnrichmentSVGPlot
                        divWidth={width - verticalSplitPaneSize - 300}
                        divHeight={height - horizontalSplitPaneSize - 51}
                        pxToPtRatio={105}
                        pointSize={12}
                        svgTabMax={1}
                        tab={this.props.tab}
                        plotDataEnrichment={this.props.plotDataEnrichment}
                        plotDataEnrichmentLength={
                          this.props.plotDataEnrichmentLength
                        }
                        svgExportName={this.props.svgExportName}
                        enrichmentPlotTypes={this.props.enrichmentPlotTypes}
                        // isEnrichmentPlotSVGLoaded={this.props.isEnrichmentPlotSVGLoaded}
                        SVGPlotLoaded={this.props.SVGPlotLoaded}
                        SVGPlotLoading={this.props.SVGPlotLoading}
                        HighlightedProteins={this.props.HighlightedProteins}
                        enrichmentStudy={enrichmentStudy}
                        enrichmentModel={enrichmentModel}
                        enrichmentPlotDescriptions={enrichmentPlotDescriptions}
                      />
                    </div>
                  </SplitPane>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    } else
      return (
        <div className="PlotsWrapper">
          <Grid className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                computer={8}
                largeScreen={8}
                widescreen={8}
              >
                <EnrichmentBreadcrumbs {...this.props} />
              </Grid.Column>
              <Grid.Column
                mobile={16}
                tablet={16}
                computer={8}
                largeScreen={8}
                widescreen={8}
                className="elementTextCol"
              ></Grid.Column>

              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <SplitPane
                  className="ThreePlotsDiv SplitPanesWrapper"
                  split="vertical"
                  size={this.state.verticalSplitPaneSize}
                  minSize={315}
                  maxSize={1300}
                  onDragFinished={(size) =>
                    this.splitPaneResized(size, 'vertical')
                  }
                >
                  <div id="ViolinAndTableSplitContainer">{ViolinAndTable}</div>
                  <div id="SVGSplitContainer">
                    <EnrichmentSVGPlot
                      divWidth={width - verticalSplitPaneSize - 300}
                      divHeight={height - 51}
                      pxToPtRatio={105}
                      pointSize={12}
                      svgTabMax={1}
                      tab={this.props.tab}
                      plotDataEnrichment={this.props.plotDataEnrichment}
                      plotDataEnrichmentLength={
                        this.props.plotDataEnrichmentLength
                      }
                      svgExportName={this.props.svgExportName}
                      enrichmentPlotTypes={this.props.enrichmentPlotTypes}
                      // isEnrichmentPlotSVGLoaded={this.props.isEnrichmentPlotSVGLoaded}
                      SVGPlotLoaded={this.props.SVGPlotLoaded}
                      SVGPlotLoading={this.props.SVGPlotLoading}
                      HighlightedProteins={this.props.HighlightedProteins}
                      enrichmentStudy={enrichmentStudy}
                      enrichmentModel={enrichmentModel}
                      enrichmentPlotDescriptions={enrichmentPlotDescriptions}
                    />
                  </div>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
  }
}

export default withRouter(SplitPanesContainer);
