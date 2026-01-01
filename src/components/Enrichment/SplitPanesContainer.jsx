import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab } from 'semantic-ui-react';
import EnrichmentBreadcrumbs from './EnrichmentBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import SplitPane from 'react-split-pane-r17';
import './SplitPanesContainer.scss';
import BarcodePlot from './BarcodePlot';
import ViolinPlot from './ViolinPlot';
import FilteredDifferentialTable from './FilteredDifferentialTable';
import PlotsMultiFeature from '../Differential/PlotsMultiFeature';
import PlotsSingleFeature from '../Differential/PlotsSingleFeature';

class SplitPanesContainer extends Component {
  // Smooth redraw during SplitPane drag without spamming localStorage
  _pendingDragSizes = { horizontal: null, vertical: null };
  _dragRafId = null;

  state = {
    activeSvgTabIndexEnrichment: 0,
    // Persisted split sizes (enrichment-scoped; fall back to legacy keys if present)
    horizontalSplitPaneSize:
      parseInt(localStorage.getItem('enrichmentHorizontalSplitPaneSize'), 10) ||
      parseInt(localStorage.getItem('horizontalSplitPaneSize'), 10) ||
      250,
    verticalSplitPaneSize:
      parseInt(localStorage.getItem('enrichmentVerticalSplitPaneSize'), 10) ||
      parseInt(localStorage.getItem('verticalSplitPaneSize'), 10) ||
      525,
    activeViolinTableIndex: 0,
    elementTextKey: 'featureID',
  };
  filteredDifferentialGridRef = React.createRef();

  componentDidUpdate(prevProps, prevState) {
    const prevCount = prevProps.HighlightedProteins
      ? prevProps.HighlightedProteins.length
      : 0;
    const currCount = this.props.HighlightedProteins
      ? this.props.HighlightedProteins.length
      : 0;

    const { activeSvgTabIndexEnrichment } = this.state;
    const hasMultiFeature = this.props.plotMultiFeatureAvailable;

    const prevSelected = prevProps.selectedProteinId;
    const currSelected = this.props.selectedProteinId;

    const canChangeTabs = this.props.enableSvgTabChangeOnSelection !== false;

    if (
      canChangeTabs &&
      currSelected &&
      currSelected !== prevSelected &&
      activeSvgTabIndexEnrichment !== 0
    ) {
      this.handleSVGTabChange(0);
    }

    if (currCount >= 2 && currCount !== prevCount && hasMultiFeature) {
      if (canChangeTabs) {
        this.handleSVGTabChange(1);
      }
    }

    if (
      canChangeTabs &&
      activeSvgTabIndexEnrichment === 1 &&
      currCount < 2 &&
      prevCount >= 2
    ) {
      this.handleSVGTabChange(0);
    }
  }

  componentWillUnmount() {
    if (this._dragRafId) {
      cancelAnimationFrame(this._dragRafId);
      this._dragRafId = null;
    }
  }

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
            className="TableResultsTab two-col-sticky"
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

  // Called while dragging (SplitPane onChange). Updates state at most once per animation frame.
  splitPaneDragging = (size, paneType) => {
    if (size === undefined) return;
    this._pendingDragSizes[paneType] = size;
    if (this._dragRafId) return;
    this._dragRafId = requestAnimationFrame(() => {
      const next = {};
      if (this._pendingDragSizes.horizontal !== null) {
        next.horizontalSplitPaneSize = this._pendingDragSizes.horizontal;
        this._pendingDragSizes.horizontal = null;
      }
      if (this._pendingDragSizes.vertical !== null) {
        next.verticalSplitPaneSize = this._pendingDragSizes.vertical;
        this._pendingDragSizes.vertical = null;
      }
      this._dragRafId = null;
      if (Object.keys(next).length) {
        this.setState(next);
      }
    });
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
    const key =
      paneType === 'horizontal'
        ? 'enrichmentHorizontalSplitPaneSize'
        : 'enrichmentVerticalSplitPaneSize';
    localStorage.setItem(key, String(size));
  };

  renderFeaturePlotTabs = (
    width,
    height,
    verticalSplitPaneSize,
    horizontalSplitPaneSize,
    enrichmentStudy,
    enrichmentModel,
    enrichmentPlotDescriptions,
  ) => {
    const {
      plotMultiFeatureAvailable,
      HighlightedProteins,
      enrichmentPlotTypes,
      enrichmentAnnotation,
      enrichmentAnnotationIdsCommon,
      enrichmentMultiFeaturePlotTypes,
      plotMultiFeatureData,
      plotMultiFeatureDataLoaded,
      plotMultiFeatureDataLength,
      plotMultiFeatureMax,
      svgExportName,
      tab,
      onHandleProteinSelected,
      SVGPlotLoaded,
      SVGPlotLoading,
      plotDataEnrichment,
      plotDataEnrichmentLength,
      // Data for feature labels in gear popup
      hasBarcodeData,
      barcodeSettings,
      filteredDifferentialResults,
      filteredDifferentialFeatureIdKey,
    } = this.props;

    const { activeSvgTabIndexEnrichment } = this.state;

    // Same width/height logic you already had, unified
    const contentWidth = width - verticalSplitPaneSize - 300;
    const multiContentWidth = width - verticalSplitPaneSize - 500;

    const contentHeight = height - (horizontalSplitPaneSize || 0) - 55;
    const multiContentHeight = contentHeight - 45;

    // 1. Determine the feature ID key based on data source
    const featureIdKey = hasBarcodeData
      ? 'featureID'
      : filteredDifferentialFeatureIdKey;

    // 2. Get the table data for label lookups
    const tableData = hasBarcodeData
      ? barcodeSettings?.barcodeData || []
      : filteredDifferentialResults || [];

    // 3. Transform HighlightedProteins to have .key/.id/.value properties
    //    PlotsMultiFeature expects: { key, id, value } for getFeaturesList()
    //    Enrichment has: { featureID, sample, cpm }
    // Single-feature plot types (exclude multiFeature plot types)
    const singleFeaturePlotTypes = (enrichmentPlotTypes || []).filter(
      (p) => !p.plotType?.includes('multiFeature'),
    );

    const transformedHighlightedFeatures = (HighlightedProteins || []).map(
      (protein) => ({
        ...protein,
        key: protein.featureID || protein.key || protein.id,
        id: protein.featureID || protein.key || protein.id,
        value: protein.featureID || protein.key || protein.id,
      }),
    );

    return (
      <div className="EnrichmentPlots">
        <Tab
          className="EnrichmentRightTabs"
          menu={{ secondary: true, pointing: true }}
          renderActiveOnly={false}
          activeIndex={activeSvgTabIndexEnrichment}
          onTabChange={(e, data) => {
            const nextIndex = data.activeIndex;
            this.handleSVGTabChange(nextIndex);
          }}
          panes={[
            {
              menuItem: 'Single-Feature Plots',
              pane: (
                <Tab.Pane
                  key="single-feature-plots-pane"
                  attached={false}
                  className="SingleFeaturePlotPane"
                >
                  <PlotsSingleFeature
                    plotSingleFeatureData={plotDataEnrichment}
                    plotSingleFeatureDataLength={plotDataEnrichmentLength}
                    plotSingleFeatureDataLoaded={SVGPlotLoaded}
                    isLoading={SVGPlotLoading}
                    // unified dimensions for single-feature
                    divWidth={multiContentWidth}
                    divHeight={multiContentHeight}
                    pxToPtRatio={105}
                    pointSize={12}
                    svgTabMax={1}
                    tab={tab}
                    upperPlotsVisible={true}
                    svgExportName={svgExportName}
                    differentialStudy={enrichmentStudy}
                    differentialModel={enrichmentModel}
                    differentialTest={enrichmentAnnotation}
                    differentialTestIdsCommon={
                      enrichmentAnnotationIdsCommon || []
                    }
                    differentialPlotTypes={enrichmentPlotTypes}
                    singleFeaturePlotTypes={singleFeaturePlotTypes}
                    differentialPlotDescriptions={enrichmentPlotDescriptions}
                    modelSpecificMetaFeaturesExist={false}
                    onGetPlotTransitionRef={
                      this.props.onGetSingleFeaturePlotTransitionEnrichment
                    }
                    showFullScreenButton={
                      !!this.props.onGetSingleFeaturePlotTransitionEnrichment
                    }
                  />
                </Tab.Pane>
              ),
            },
            {
              menuItem: 'Multi-Feature Plots',
              disabled: !plotMultiFeatureAvailable,
              pane: (
                <Tab.Pane
                  attached={false}
                  className="MultiFeaturePlotPane"
                  key="multi-feature-plots-pane"
                >
                  <PlotsMultiFeature
                    // enrichment mapped into differential-style props
                    differentialPlotTypes={enrichmentPlotTypes}
                    differentialStudy={enrichmentStudy}
                    differentialModel={enrichmentModel}
                    differentialTest={enrichmentAnnotation}
                    differentialTestIdsCommon={
                      enrichmentAnnotationIdsCommon || []
                    }
                    modelSpecificMetaFeaturesExist={false}
                    multiFeaturePlotTypes={
                      enrichmentMultiFeaturePlotTypes || []
                    }
                    plotMultiFeatureData={plotMultiFeatureData}
                    plotMultiFeatureDataLoaded={plotMultiFeatureDataLoaded}
                    isLoading={
                      !plotMultiFeatureDataLoaded &&
                      (HighlightedProteins?.length || 0) >= 2
                    }
                    plotMultiFeatureDataLength={plotMultiFeatureDataLength}
                    plotMultiFeatureMax={plotMultiFeatureMax}
                    svgExportName={svgExportName}
                    // unified dimensions for multi-feature (same as Differential)
                    divWidth={multiContentWidth}
                    divHeight={multiContentHeight}
                    pointSize={12}
                    pxToPtRatio={105}
                    svgTabMax={1}
                    tab={tab}
                    upperPlotsVisible={true}
                    showFullScreen={
                      !!this.props
                        .onGetMultifeaturePlotTransitionOverlayEnrichment
                    }
                    // selection syncing
                    onHandleAllChecked={() => onHandleProteinSelected([])}
                    onHandleHighlightedFeaturesDifferential={(arr) =>
                      onHandleProteinSelected(arr)
                    }
                    onGetMultifeaturePlotTransitionAlt={
                      this.props
                        .onGetMultifeaturePlotTransitionOverlayEnrichment
                    }
                    // Interaction handlers
                    onHandlePlotlyClick={
                      this.props.onHandlePlotlyClickEnrichment
                    }
                    onRemoveSelectedFeature={
                      this.props.onRemoveSelectedFeatureEnrichment
                    }
                    onMultiFeatureBullpenOpenChange={
                      this.props.onMultiFeatureBullpenOpenChangeEnrichment
                    }
                    differentialHighlightedFeaturesData={
                      transformedHighlightedFeatures
                    }
                    differentialTableData={tableData}
                    differentialFeatureIdKey={featureIdKey}
                  />
                </Tab.Pane>
              ),
            },
          ]}
        />
      </div>
    );
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

    // WITH BARCODE BRANCH
    if (hasBarcodeData) {
      console.log('Rendering with barcode data');
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
                {/* Top: Barcode, Bottom: Violin+Table vs Right Plots */}
                <SplitPane
                  className="ThreePlotsDiv SplitPanesWrapper"
                  split="horizontal"
                  size={horizontalSplitPaneSize}
                  minSize={185}
                  maxSize={400}
                  onChange={(size) => this.splitPaneDragging(size, 'horizontal')}
                  onDragFinished={(size) =>
                    this.splitPaneResized(size, 'horizontal')
                  }
                >
                  {BarcodePlot}

                  <SplitPane
                    className="BottomSplitPaneContainer"
                    split="vertical"
                    size={verticalSplitPaneSize}
                    minSize={315}
                    maxSize={1300}
                    onChange={(size) => this.splitPaneDragging(size, 'vertical')}
                    onDragFinished={(size) =>
                      this.splitPaneResized(size, 'vertical')
                    }
                  >
                    <div id="ViolinAndTableSplitContainer">
                      {ViolinAndTable}
                    </div>

                    <div id="SVGSplitContainer">
                      {this.renderFeaturePlotTabs(
                        width,
                        height,
                        verticalSplitPaneSize,
                        horizontalSplitPaneSize,
                        enrichmentStudy,
                        enrichmentModel,
                        enrichmentPlotDescriptions,
                      )}
                    </div>
                  </SplitPane>
                </SplitPane>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }

    // NO BARCODE BRANCH
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
              {/* Simple vertical split: Left = Violin+Table, Right = Plots */}
              <SplitPane
                className="ThreePlotsDiv SplitPanesWrapper"
                split="vertical"
                size={verticalSplitPaneSize}
                minSize={315}
                maxSize={1300}
                onChange={(size) => this.splitPaneDragging(size, 'vertical')}
                onDragFinished={(size) =>
                  this.splitPaneResized(size, 'vertical')
                }
              >
                <div id="ViolinAndTableSplitContainer">{ViolinAndTable}</div>

                <div id="SVGSplitContainer">
                  {this.renderFeaturePlotTabs(
                    width,
                    height,
                    verticalSplitPaneSize,
                    0, // no barcode → same as your old (height - 51) case
                    enrichmentStudy,
                    enrichmentModel,
                    enrichmentPlotDescriptions,
                  )}
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