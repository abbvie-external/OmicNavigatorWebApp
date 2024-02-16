import React, { Component } from 'react';
import { Tab } from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import { roundToPrecision, isMultiModelMultiTest } from '../Shared/helpers';
import PlotlyMultiFeature from './PlotlyMultiFeature';
import './PlotsDynamic.scss';
import '../Shared/PlotlyOverrides.scss';

class TabMultiFeature extends Component {
  state = {
    svgPanesMultiFeature: [],
  };

  componentDidUpdate() {
    const {
      activeTabIndexPlotsMultiFeature,
      divHeight,
      divWidth,
      differentialHighlightedFeaturesData,
      differentialStudy,
      differentialModel,
      differentialTest,
      plotMultiFeatureData,
      multiFeaturePlotTypes,
    } = this.props;
    const featureIdsArr = differentialHighlightedFeaturesData.map((f) => f.id);
    const featureIdsString = featureIdsArr.toString();
    const featuresLength = differentialHighlightedFeaturesData?.length;
    const plotKey = plotMultiFeatureData.key;
    const plotLength = plotMultiFeatureData?.svg.length;
    const plotId =
      multiFeaturePlotTypes[activeTabIndexPlotsMultiFeature].plotID;
    const cacheStringArg = `multiFeaturePanes_${activeTabIndexPlotsMultiFeature}_${divHeight}_${divWidth}_${divHeight}_${plotId}_${plotKey}_${plotLength}_${featuresLength}_${featureIdsString}_${differentialStudy}_${differentialModel}_${differentialTest}`;
    this.getSVGPanesMultiFeature(cacheStringArg, featuresLength);
  }

  getSVGPanesMultiFeature = (cacheStringArg, featuresLength) => {
    if (this.cacheString === cacheStringArg) return;
    this.cacheString = cacheStringArg;
    const {
      activeTabIndexPlotsMultiFeature,
      plotMultiFeatureData,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotMultiFeatureDataLength,
      multiFeaturePlotTypes,
      differentialTest,
      differentialTestIdsCommon,
    } = this.props;
    let panes = [];
    let dimensions = '';
    let divWidthPt = 0;
    let divHeightPt = 0;
    let divWidthPadding = 0;
    let divHeightPadding = 0;
    if (plotMultiFeatureDataLength !== 0) {
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
      if (activeTabIndexPlotsMultiFeature < multiFeaturePlotTypes.length) {
        const s = plotMultiFeatureData?.svg[activeTabIndexPlotsMultiFeature];
        if (s) {
          const srcUrl = `${s.svg}${dimensions}`;
          const isPlotlyPlot = s.plotType.plotType.includes('plotly');
          const isMultiModelMultiTestVar = isMultiModelMultiTest(
            s.plotType.plotType,
          );
          const testIdNotCommon =
            !differentialTestIdsCommon.includes(differentialTest);
          const errorMessagePlotlyMultiFeature =
            isMultiModelMultiTestVar && testIdNotCommon
              ? `${s.plotType.plotDisplay} can not be created because the currently selected test is not present in all models`
              : `${s.plotType.plotDisplay} is not available for this
          combination of features`;
          const svgPanes = {
            menuItem: `${s.plotType.plotDisplay}`,
            render: () => (
              <Tab.Pane attached="true" as="div" key={cacheStringArg}>
                <div id="PlotsMultiFeatureContainer" className="svgSpan">
                  {isPlotlyPlot ? (
                    <PlotlyMultiFeature
                      cacheString={cacheStringArg}
                      plotlyData={s.svg}
                      height={divHeightPadding}
                      width={divWidthPadding}
                      plotName={s.plotType.plotDisplay}
                      plotId={s.plotType.plotID}
                      plotlyExport={this.props.plotlyExport}
                      plotlyExportType={this.props.plotlyExportType}
                      parentNode={
                        this.props.differentialDetailPlotsMultiFeatureRefFwd
                      }
                      featuresLength={featuresLength}
                      onHandlePlotlyClick={this.props.onHandlePlotlyClick}
                      differentialTest={this.props.differentialTest}
                      errorMessagePlotlyMultiFeature={
                        errorMessagePlotlyMultiFeature
                      }
                    />
                  ) : s.svg ? (
                    <SVG
                      cacheRequests={true}
                      src={srcUrl}
                      title={`${s.plotType.plotDisplay}`}
                      uniqueHash={`b2g9e2-${cacheStringArg}`}
                      uniquifyIDs={true}
                    />
                  ) : (
                    <div className="PlotInstructions">
                      <h4 className="PlotInstructionsText NoSelect">
                        {errorMessagePlotlyMultiFeature}
                      </h4>
                    </div>
                  )}
                </div>
              </Tab.Pane>
            ),
          };
          panes = panes.concat(svgPanes);
        }
      }
      this.setState({
        svgPanesMultiFeature: panes,
      });
    }
  };

  render() {
    return (
      <Tab
        menu={{
          secondary: true,
          pointing: true,
          className: 'Hide',
        }}
        panes={this.state.svgPanesMultiFeature}
        activeIndex={0}
      />
    );
  }
}

export default TabMultiFeature;
