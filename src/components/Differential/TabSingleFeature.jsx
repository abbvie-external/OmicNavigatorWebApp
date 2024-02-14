import React, { Component } from 'react';
import { Tab } from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import { roundToPrecision, isMultiModelMultiTest } from '../Shared/helpers';
import MetafeaturesTableDynamic from './MetafeaturesTableDynamic';
import PlotlySingleFeature from './PlotlySingleFeature';
import './PlotsDynamic.scss';
import '../Shared/PlotlyOverrides.scss';

class TabSingleFeature extends Component {
  state = {
    svgPanesSingleFeature: [],
  };

  componentDidUpdate() {
    const {
      activeTabIndexPlotsSingleFeature,
      divHeight,
      divWidth,
      differentialStudy,
      differentialModel,
      differentialTest,
      plotSingleFeatureData,
      singleFeaturePlotTypes,
    } = this.props;
    const plotKey = plotSingleFeatureData.key;
    const plotLength = plotSingleFeatureData?.svg.length;
    const plotId =
      singleFeaturePlotTypes[activeTabIndexPlotsSingleFeature]?.plotID;
    const isMetaFeatureTab =
      activeTabIndexPlotsSingleFeature < singleFeaturePlotTypes.length
        ? false
        : true;
    const cacheStringArg = `singleFeaturePanes_${activeTabIndexPlotsSingleFeature}_${divHeight}_${divWidth}_${plotId}_${isMetaFeatureTab}_${plotKey}_${plotLength}_${plotId}_${differentialStudy}_${differentialModel}_${differentialTest}`;
    this.getSVGPanesSingleFeature(cacheStringArg);
  }

  getSVGPanesSingleFeature = (cacheStringArg) => {
    if (this.cacheString === cacheStringArg) return;
    this.cacheString = cacheStringArg;
    const {
      activeTabIndexPlotsSingleFeature,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialTestIdsCommon,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotSingleFeatureData,
      plotOverlayLoaded,
      modelSpecificMetaFeaturesExist,
      singleFeaturePlotTypes,
    } = this.props;
    let panes = [];
    let dimensions = '';
    let divWidthPt = 0;
    let divHeightPt = 0;
    let divWidthPadding = 0;
    let divHeightPadding = 0;
    if (divWidth && divHeight && pxToPtRatio) {
      divWidthPadding = divWidth * 0.95;
      divHeightPadding = divHeight * 0.95 - 38;
      divWidthPt = roundToPrecision(divWidthPadding / pxToPtRatio, 1);
      divHeightPt = roundToPrecision(divHeightPadding / pxToPtRatio, 1);
      const divWidthPtString = `width=${divWidthPt}`;
      const divHeightPtString = `&height=${divHeightPt}`;
      const pointSizeString = `&pointsize=${pointSize}`;
      dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
    }
    if (activeTabIndexPlotsSingleFeature < singleFeaturePlotTypes.length) {
      const s = plotSingleFeatureData?.svg[activeTabIndexPlotsSingleFeature];
      if (s) {
        const srcUrl = `${s.svg}${dimensions}`;
        const isPlotlyPlot = s.plotType.plotType.includes('plotly');
        const isMultiModelMultiTestVar = isMultiModelMultiTest(
          s.plotType.plotType,
        );
        const testIdNotCommon =
          !differentialTestIdsCommon.includes(differentialTest);
        const errorMessagePlotlySingleFeature =
          isMultiModelMultiTestVar && testIdNotCommon
            ? `${s.plotType.plotDisplay} can not be created because the currently selected test is not present in all models`
            : `${s.plotType.plotDisplay} is not available for feature ${plotSingleFeatureData.key}`;
        const svgPanes = {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane attached="true" as="div" key={cacheStringArg}>
              <div id="PlotsSingleFeatureContainer" className="svgSpan">
                {isPlotlyPlot ? (
                  <PlotlySingleFeature
                    cacheString={cacheStringArg}
                    plotlyData={s.svg}
                    height={divHeightPadding}
                    width={divWidthPadding}
                    plotName={s.plotType.plotDisplay}
                    plotKey={plotSingleFeatureData.key}
                    plotlyExport={this.props.plotlyExport}
                    plotlyExportType={this.props.plotlyExportType}
                    parentNode={
                      this.props.differentialDetailPlotsSingleFeatureRefFwd
                    }
                    errorMessagePlotlySingleFeature={
                      errorMessagePlotlySingleFeature
                    }
                  />
                ) : s.svg ? (
                  <SVG
                    cacheRequests={true}
                    src={srcUrl}
                    title={`${s.plotType.plotDisplay}`}
                    uniqueHash={`a1f8d1-${cacheStringArg}`}
                    uniquifyIDs={true}
                  />
                ) : (
                  <div className="PlotInstructions">
                    <h4 className="PlotInstructionsText NoSelect">
                      {errorMessagePlotlySingleFeature}
                    </h4>
                  </div>
                )}
              </div>
            </Tab.Pane>
          ),
        };
        panes = panes.concat(svgPanes);
      }
    } else {
      // if the activeTabIndex is the same as the singleFeaturePlotTypes length, it indicates app should display the Metafeatures tab
      if (modelSpecificMetaFeaturesExist !== false) {
        let metafeaturesTab = [
          {
            menuItem: 'Feature Data',
            render: () => (
              <Tab.Pane attached="true" as="div">
                <MetafeaturesTableDynamic
                  ref={this.props.metafeaturesTableDynamicRef}
                  differentialStudy={differentialStudy}
                  differentialModel={differentialModel}
                  plotOverlayLoaded={plotOverlayLoaded}
                  plotSingleFeatureData={plotSingleFeatureData}
                  modelSpecificMetaFeaturesExist={
                    modelSpecificMetaFeaturesExist
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
      svgPanesSingleFeature: panes,
    });
  };

  render() {
    return (
      <Tab
        menu={{
          secondary: true,
          pointing: true,
          className: 'Hide',
        }}
        panes={this.state.svgPanesSingleFeature}
        activeIndex={0}
      />
    );
  }
}

export default React.forwardRef((props, ref) => (
  <TabSingleFeature {...props} metafeaturesTableDynamicRef={ref} />
));
