import React, { Component } from 'react';
import {
  Tab,
  // Loader,
  // Dimmer
} from 'semantic-ui-react';
import MetafeaturesTable from './MetafeaturesTable';
import PlotlyOverlay from './PlotlyOverlay';
import './PlotsDynamic.scss';
import '../Shared/PlotlyOverrides.scss';
import { isMultiModelMultiTest } from '../Shared/helpers';

class TabOverlay extends Component {
  state = {
    svgPanesOverlay: [],
  };

  componentDidUpdate() {
    const {
      activeTabIndexPlotsOverlay,
      divHeight,
      divWidth,
      differentialHighlightedFeaturesData,
      differentialStudy,
      differentialModel,
      differentialTest,
      plotOverlayData,
      singleFeaturePlotTypes,
      multiFeaturePlotTypes,
    } = this.props;
    const featureIdsArr = differentialHighlightedFeaturesData.map((f) => f.id);
    const featureIdsString = featureIdsArr.toString();
    const featuresLength = differentialHighlightedFeaturesData?.length;
    const plotKey = plotOverlayData.key;
    const plotLength = plotOverlayData?.svg.length;
    const overlayPlotTypes =
      featuresLength > 1 ? multiFeaturePlotTypes : singleFeaturePlotTypes;
    const plotId = overlayPlotTypes[activeTabIndexPlotsOverlay]?.plotID;
    const cacheStringArg = `overlayPanes_${activeTabIndexPlotsOverlay}_${divHeight}_${divWidth}_${divHeight}_${plotId}_${plotKey}_${plotLength}_${featuresLength}_${featureIdsString}_${differentialStudy}_${differentialModel}_${differentialTest}`;
    this.getSVGPanesOverlay(cacheStringArg, featuresLength, overlayPlotTypes);
  }

  getWidth = () => {
    if (this.props.differentialPlotsOverlayRefFwd?.current !== null) {
      return this.props.differentialPlotsOverlayRefFwd.current.offsetParent
        .offsetWidth;
    }
    return 1200;
  };

  getHeight = () => {
    if (this.props.differentialPlotsOverlayRefFwd?.current !== null) {
      return this.props.differentialPlotsOverlayRefFwd.current.offsetParent
        .offsetHeight;
    }
    return 700;
  };

  //     if (activeTabIndexPlotsOverlay < overlayPlotsTypes.length) {
  //       const plotId =
  //         overlayPlotsTypes[activeTabIndexPlotsOverlay].plotType.plotID;
  //       const plotKey = plotOverlayData.key;
  //       // const cacheKey = `overlayFeaturePanes_${differentialStudy}_${differentialModel}_${differentialTest}_${plotKey}_${plotId}_${activeTabIndexPlotsOverlay}`;
  //       // if (this[cacheKey] != null) {
  //       //   return this[cacheKey];
  //       // } else {
  //       const s = plotOverlayData?.svg[activeTabIndexPlotsOverlay];
  //       const featuresLength = this.props.differentialHighlightedFeaturesData
  //         .length;

  getSVGPanesOverlay = (cacheStringArg, featuresLength, overlayPlotTypes) => {
    if (this.cacheString === cacheStringArg) return;
    this.cacheString = cacheStringArg;
    // if (!this.props.plotOverlayLoaded) {
    //   return (
    // <LoaderActivePlots />
    //     <div className="PlotsMetafeaturesDimmer">
    //       <Dimmer active inverted>
    //         <Loader size="large">Loading...</Loader>
    //       </Dimmer>
    //     </div>
    //   );
    // } else {
    const {
      activeTabIndexPlotsOverlay,
      plotOverlayData,
      modelSpecificMetaFeaturesExist,
      differentialTest,
      differentialTestIdsCommon,
    } = this.props;
    // since this call is in render, index determines the one tab to display (svg, plotly or feature data)
    let panes = [];
    if (activeTabIndexPlotsOverlay < overlayPlotTypes?.length) {
      if (plotOverlayData && plotOverlayData.svg?.length) {
        const s = plotOverlayData?.svg[activeTabIndexPlotsOverlay];
        if (s) {
          const svgContainerWidth = this.getWidth();
          const svgContainerHeight = this.getHeight();
          const isPlotlyPlot = s.plotType.plotType.includes('plotly');
          const isMultiModelMultiTestVar = isMultiModelMultiTest(
            s.plotType.plotType,
          );
          const testIdNotCommon =
            !differentialTestIdsCommon.includes(differentialTest);
          const errorMessagePlotlyOverlay =
            isMultiModelMultiTestVar && testIdNotCommon
              ? `${s.plotType.plotDisplay} can not be created because the currently selected test is not present in all models`
              : `${s.plotType.plotDisplay} is not available for feature ${s.plotType.plotKey}`;
          const svgPanes = {
            menuItem: `${s.plotType.plotDisplay}`,
            render: () => (
              <Tab.Pane attached="true" as="div" key={cacheStringArg}>
                <div id="PlotsOverlayContainer" className="svgSpan">
                  {isPlotlyPlot ? (
                    <PlotlyOverlay
                      cacheString={cacheStringArg}
                      plotlyData={s.svg}
                      height={svgContainerHeight}
                      width={svgContainerWidth}
                      plotName={s.plotType.plotDisplay}
                      plotId={s.plotType.plotID}
                      plotlyExport={this.props.plotlyExport}
                      plotlyExportType={this.props.plotlyExportType}
                      parentNode={this.props.differentialPlotsOverlayRefFwd}
                      // parentNode={this.differentialPlotsOverlayRef}
                      featuresLength={featuresLength}
                      // plotId={plotId}
                      plotType={s.plotType.plotType}
                      plotKey={plotOverlayData?.key}
                      errorMessagePlotlyOverlay={errorMessagePlotlyOverlay}
                    />
                  ) : (
                    <div
                      id="PlotsOverlayContainer"
                      className="svgSpan"
                      dangerouslySetInnerHTML={{ __html: s.svg }}
                    ></div>
                  )}
                </div>
              </Tab.Pane>
            ),
          };
          panes = panes.concat(svgPanes);
        }
      }
    } else {
      // if the activeTabIndex is the same as the overlayPlotTypes length, it indicates app should display the Metafeatures tab
      const isMultifeaturePlot =
        plotOverlayData?.key?.includes('features') || false;
      if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
        let metafeaturesTab = [
          {
            menuItem: 'Feature Data',
            render: () => (
              <Tab.Pane attached="true" as="div">
                <MetafeaturesTable
                  ref={this.props.metafeaturesTableRef}
                  differentialStudy={this.props.differentialStudy}
                  differentialModel={this.props.differentialModel}
                  differentialFeature={this.props.differentialFeature}
                  plotOverlayLoaded={this.props.plotOverlayLoaded}
                  plotOverlayData={this.props.plotOverlayData}
                  modelSpecificMetaFeaturesExist={
                    this.props.modelSpecificMetaFeaturesExist
                  }
                />
              </Tab.Pane>
            ),
          },
        ];
        panes = panes.concat(metafeaturesTab);
      }
    }
    this.setState({
      svgPanesOverlay: panes,
    });
    // }
  };

  render() {
    return (
      <Tab
        menu={{
          secondary: true,
          pointing: true,
          className: 'Hide',
        }}
        panes={this.state.svgPanesOverlay}
        activeIndex={0}
      />
    );
  }
}

export default React.forwardRef((props, ref) => (
  <TabOverlay {...props} metafeaturesTableRef={ref} />
));
