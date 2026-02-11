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
      multiFeaturePlotTypes[activeTabIndexPlotsMultiFeature]?.plotID;
    const cacheStringArg = `multiFeaturePanes_${activeTabIndexPlotsMultiFeature}_${divHeight}_${divWidth}_${divHeight}_${plotId}_${plotKey}_${plotLength}_${featuresLength}_${featureIdsString}_${differentialStudy}_${differentialModel}_${differentialTest}`;
    this.getSVGPanesMultiFeature(cacheStringArg, featuresLength);
  }

  getSVGPanesMultiFeature = (cacheStringArg, featuresLength) => {
    if (this.cacheString === cacheStringArg) return;
    this.cacheString = cacheStringArg;

    if (typeof this.props.onActivePlotRenderStart === 'function') {
      this.props.onActivePlotRenderStart(cacheStringArg);
    }
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

    // If there is no plot payload (e.g., not enough features yet), ensure we don't get stuck in a loading state.
    if (plotMultiFeatureDataLength === 0) {
      if (typeof this.props.onActivePlotRenderReady === 'function') {
        this.props.onActivePlotRenderReady(cacheStringArg);
      }
      this.setState({ svgPanesMultiFeature: [] });
      return;
    }

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
          let svg =
            plotMultiFeatureData.svg[activeTabIndexPlotsMultiFeature].svg;
          let errorMessagePlotlyMultiFeature = null;
          if (
            // !isPlotlyPlot &&
            (typeof svg === 'string' || svg instanceof String) &&
            svg.startsWith('Error:')
          ) {
            errorMessagePlotlyMultiFeature = svg;
          }
          if (isMultiModelMultiTestVar && testIdNotCommon) {
            errorMessagePlotlyMultiFeature = `${s.plotType.plotDisplay} can not be created because the currently selected test is not present in all models`;
          }
          // ${s.plotType.plotDisplay} is not available for this combination of features`;
          const willRenderErrorPane = !!errorMessagePlotlyMultiFeature;
          if (willRenderErrorPane && typeof this.props.onActivePlotRenderReady === 'function') {
            this.props.onActivePlotRenderReady(cacheStringArg);
          }
          const svgPanes = {
            menuItem: `${s.plotType.plotDisplay}`,
            render: () => (
              <Tab.Pane attached="true" as="div" key={cacheStringArg}>
                <div id="PlotsMultiFeatureContainer" className="svgSpan">
                  {isPlotlyPlot && !errorMessagePlotlyMultiFeature ? (
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
                      onRenderReady={() => {
                        if (
                          typeof this.props.onActivePlotRenderReady ===
                          'function'
                        ) {
                          this.props.onActivePlotRenderReady(cacheStringArg);
                        }
                      }}
                    />
                  ) : s.svg && !errorMessagePlotlyMultiFeature ? (
                    <SVG
                      cacheRequests={true}
                      src={srcUrl}
                      title={`${s.plotType.plotDisplay}`}
                      uniqueHash={`b2g9e2-${cacheStringArg}`}
                      uniquifyIDs={true}
                      onLoad={() => {
                        if (typeof this.props.onActivePlotRenderReady === 'function') {
                          this.props.onActivePlotRenderReady(cacheStringArg);
                        }
                      }}
                      onError={() => {
                        if (typeof this.props.onActivePlotRenderReady === 'function') {
                          this.props.onActivePlotRenderReady(cacheStringArg);
                        }
                      }}
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
        } else {
          // Safety: if the pane data is unexpectedly missing, avoid a stuck loader.
          if (typeof this.props.onActivePlotRenderReady === 'function') {
            this.props.onActivePlotRenderReady(cacheStringArg);
          }
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
