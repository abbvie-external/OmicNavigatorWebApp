import React, { Component } from 'react';
import { Tab, Popup, Icon, Label } from 'semantic-ui-react';
import PlotsSingleFeature from './PlotsSingleFeature';
import PlotsMultiFeature from './PlotsMultiFeature';
import './PlotsDynamic.scss';

const maxWidthPopupStyle = {
  backgroundColor: '2E2E2E',
  borderBottom: '2px solid var(--color-primary)',
  color: '#FFF',
  padding: '1em',
  maxWidth: '15vw',
  fontSize: '13px',
};

class PlotsDynamic extends Component {
  state = {
    activeTabIndexPlotsDynamic: 0,
    featuresListOpen: false,
  };

  componentDidUpdate(prevProps) {
    if (this.props.enableTabChangeOnSelection) {
      if (
        prevProps.plotSingleFeatureData?.key !==
        this.props.plotSingleFeatureData?.key
      ) {
        this.setState({ activeTabIndexPlotsDynamic: 0 });
      }
      if (
        prevProps.plotMultiFeatureData?.title !==
        this.props.plotMultiFeatureData?.title
      ) {
        if (
          this.props.plotMultiFeatureData?.title === '' ||
          this.props.differentialHighlightedFeaturesData?.length < 2
        ) {
          this.setState({ activeTabIndexPlotsDynamic: 0 });
        } else {
          this.setState({ activeTabIndexPlotsDynamic: 1 });
        }
      }
    }
  }

  handlePlotOverlaySingleFeature = () => {
    const { plotSingleFeatureData } = this.props;
    const key = plotSingleFeatureData.key;
    this.props.onGetPlotTransitionRef(key, null, plotSingleFeatureData, true);
  };

  handleTabChange = (e, { activeIndex }) => {
    if (activeIndex !== this.state.activeTabIndexPlotsDynamic) {
      this.setState({
        activeTabIndexPlotsDynamic: activeIndex,
      });
    }
  };

  render() {
    const { volcanoPlotVisible, plotMultiFeatureAvailable } = this.props;
    const Toggle = (
      <span
        className="VolcanoPlotToggle"
        id={volcanoPlotVisible ? '' : 'VolcanoPlotToggle'}
      >
        <Popup
          trigger={
            <Label
              circular
              id="VolcanoPlotToggleLabel"
              onClick={this.props.onHandleVolcanoVisability}
              // size={volcanoPlotVisible ? '' : 'large'}
            >
              <Icon
                // size={dynamicSizeLarger}
                // size={volcanoPlotVisible ? '' : 'large'}
                name={volcanoPlotVisible ? 'angle left' : 'angle right'}
              />
              {/* {volcanoPlotVisible ? '<' : '>'} */}
            </Label>
          }
          style={maxWidthPopupStyle}
          // className="TablePopupValue"
          content={
            volcanoPlotVisible ? 'Hide Scatter Plot' : 'Show Scatter Plot'
          }
          inverted
          basic
        />
      </span>
    );

    let panes = [];
    if (plotMultiFeatureAvailable) {
      panes = [
        {
          menuItem: 'Single-Feature Plots',
          pane: (
            <Tab.Pane
              key="single-feature-plots-pane"
              className="SingleFeaturePlotPane"
            >
              {/* SINGLE-FEATURE PLOT COMPONENT */}
              <PlotsSingleFeature
                // higher level props
                tab={this.props.tab}
                differentialStudy={this.props.differentialStudy}
                differentialModel={this.props.differentialModel}
                differentialTest={this.props.differentialTest}
                differentialTestIdsCommon={this.props.differentialTestIdsCommon}
                differentialFeature={this.props.differentialFeature}
                differentialPlotTypes={this.props.differentialPlotTypes}
                // for plot dimension calculations
                divWidth={this.props.differentialDynamicPlotWidth}
                volcanoWidth={this.props.volcanoWidth}
                divHeight={this.props.upperPlotsDivHeight}
                upperPlotsHeight={this.props.upperPlotsHeight}
                pxToPtRatio={this.props.pxToPtRatio}
                pointSize={this.props.pointSize}
                // plot info
                plotSingleFeatureDataLength={
                  this.props.plotSingleFeatureDataLength
                }
                plotSingleFeatureData={this.props.plotSingleFeatureData}
                plotSingleFeatureDataLoaded={
                  this.props.plotSingleFeatureDataLoaded
                }
                // to determine tabs or dropdowns
                svgTabMax={this.props.svgTabMax}
                // to be used by resuable export
                svgExportName={this.props.svgExportName}
                // to determine updates, dynamic rendered ui and loaders
                activeTabIndexPlotsDynamic={
                  this.state.activeTabIndexPlotsDynamic
                }
                upperPlotsVisible={this.props.upperPlotsVisible}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
                // functional props to call
                onHandleAllChecked={this.props.onHandleAllChecked}
                onHandleHighlightedFeaturesDifferential={
                  this.props.onHandleHighlightedFeaturesDifferential
                }
                onGetPlotTransitionRef={this.props.onGetPlotTransitionRef}
                singleFeaturePlotTypes={this.props.singleFeaturePlotTypes}
                differentialPlotDescriptions={
                  this.props.differentialPlotDescriptions
                }
              />
            </Tab.Pane>
          ),
        },
        {
          menuItem: 'Multi-Feature Plots',
          pane: (
            <Tab.Pane
              key="multi-feature-plots-pane"
              className="MultiFeaturePlotPane"
            >
              {/* MULTI-FEATURE PLOT COMPONENT */}
              <PlotsMultiFeature
                differentialStudy={this.props.differentialStudy}
                differentialModel={this.props.differentialModel}
                differentialTest={this.props.differentialTest}
                differentialTestIdsCommon={this.props.differentialTestIdsCommon}
                differentialPlotTypes={this.props.differentialPlotTypes}
                // for plot dimension calculations
                divWidth={this.props.differentialDynamicPlotWidth}
                volcanoWidth={this.props.volcanoWidth}
                divHeight={this.props.upperPlotsDivHeight}
                upperPlotsHeight={this.props.upperPlotsHeight}
                pxToPtRatio={this.props.pxToPtRatio}
                pointSize={this.props.pointSize}
                // plot info
                plotMultiFeatureDataLength={
                  this.props.plotMultiFeatureDataLength
                }
                plotMultiFeatureData={this.props.plotMultiFeatureData}
                plotMultiFeatureDataLoaded={
                  this.props.plotMultiFeatureDataLoaded
                }
                // to determine tabs or dropdowns
                svgTabMax={this.props.svgTabMax}
                // to be used by resuable export
                svgExportName={this.props.svgExportName}
                // to determine updates, dynamic rendered ui and loaders
                activeTabIndexPlotsDynamic={
                  this.state.activeTabIndexPlotsDynamic
                }
                upperPlotsVisible={this.props.upperPlotsVisible}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
                // functional props to call
                onHandleAllChecked={this.props.onHandleAllChecked}
                onHandleHighlightedFeaturesDifferential={
                  this.props.onHandleHighlightedFeaturesDifferential
                }
                // multi-feature specific
                onGetMultifeaturePlotTransitionAlt={
                  this.props.onGetMultifeaturePlotTransitionAlt
                }
                differentialHighlightedFeaturesData={
                  this.props.differentialHighlightedFeaturesData
                }
                plotMultiFeatureMax={this.props.plotMultiFeatureMax}
                onRemoveSelectedFeature={this.props.onRemoveSelectedFeature}
                multiFeaturePlotTypes={this.props.multiFeaturePlotTypes}
                onHandlePlotlyClick={this.props.onHandlePlotlyClick}
                differentialPlotDescriptions={
                  this.props.differentialPlotDescriptions
                }
              />
            </Tab.Pane>
          ),
        },
      ];
    } else {
      panes = [
        {
          menuItem: 'Single-Feature Plots',
          pane: (
            <Tab.Pane
              key="single-feature-plots-pane"
              className="SingleFeaturePlotPane"
            >
              {/* SINGLE-FEATURE PLOT COMPONENT WO/ MULTI-FEATURE */}
              <PlotsSingleFeature
                // higher level props
                tab={this.props.tab}
                differentialStudy={this.props.differentialStudy}
                differentialModel={this.props.differentialModel}
                differentialTest={this.props.differentialTest}
                differentialTestIdsCommon={this.props.differentialTestIdsCommon}
                differentialFeature={this.props.differentialFeature}
                differentialPlotTypes={this.props.differentialPlotTypes}
                // for plot dimension calculations
                divWidth={this.props.differentialDynamicPlotWidth}
                volcanoWidth={this.props.volcanoWidth}
                divHeight={this.props.upperPlotsDivHeight}
                upperPlotsHeight={this.props.upperPlotsHeight}
                pxToPtRatio={this.props.pxToPtRatio}
                pointSize={this.props.pointSize}
                // plot info
                plotSingleFeatureDataLength={
                  this.props.plotSingleFeatureDataLength
                }
                plotSingleFeatureData={this.props.plotSingleFeatureData}
                plotSingleFeatureDataLoaded={
                  this.props.plotSingleFeatureDataLoaded
                }
                // to determine tabs or dropdowns
                svgTabMax={this.props.svgTabMax}
                // to be used by resuable export
                svgExportName={this.props.svgExportName}
                // to be used by dynamic rendered ui and loaders
                activeTabIndexPlotsDynamic={
                  this.state.activeTabIndexPlotsDynamic
                }
                upperPlotsVisible={this.props.upperPlotsVisible}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
                // functional props to call
                onHandleAllChecked={this.props.onHandleAllChecked}
                onHandleHighlightedFeaturesDifferential={
                  this.props.onHandleHighlightedFeaturesDifferential
                }
                onGetPlotTransitionRef={this.props.onGetPlotTransitionRef}
                singleFeaturePlotTypes={this.props.singleFeaturePlotTypes}
                differentialPlotDescriptions={
                  this.props.differentialPlotDescriptions
                }
              />
            </Tab.Pane>
          ),
        },
      ];
    }

    return (
      <>
        {Toggle}
        <Tab
          onTabChange={this.handleTabChange}
          panes={panes}
          activeIndex={this.state.activeTabIndexPlotsDynamic}
          renderActiveOnly={false}
          menu={{
            stackable: true,
            secondary: true,
            pointing: true,
            inverted: false,
            className: 'PlotTabsContainer',
          }}
        />
      </>
    );
  }
}

export default PlotsDynamic;
