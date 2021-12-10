import React, { Component } from 'react';
import { Tab, Popup, Icon, Label } from 'semantic-ui-react';
import PlotsSingleFeature from './PlotsSingleFeature';
import MultiFeaturePlots from './PlotsMultiFeature';
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
    activeIndexPlotTabs: 0,
    featuresListOpen: false,
  };

  handlePlotOverlaySingleFeature = () => {
    const { plotDataSingleFeature } = this.props;
    const key = plotDataSingleFeature.key;
    this.props.onGetPlotTransitionRef(key, null, plotDataSingleFeature, true);
  };

  handleTabChange = (e, { activeIndex }) => {
    if (activeIndex !== this.state.activeIndexPlotTabs) {
      this.setState({
        activeIndexPlotTabs: activeIndex,
      });
    }
  };

  render() {
    const { volcanoPlotVisible, hasMultifeaturePlots } = this.props;
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
    if (hasMultifeaturePlots) {
      panes = [
        {
          menuItem: 'Single Feature Plots',
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
                plotDataSingleFeatureLength={
                  this.props.plotDataSingleFeatureLength
                }
                plotDataSingleFeature={this.props.plotDataSingleFeature}
                plotDataSingleFeatureLoaded={
                  this.props.plotDataSingleFeatureLoaded
                }
                // to determine tabs or dropdowns
                svgTabMax={this.props.svgTabMax}
                // to be used by resuable export
                svgExportName={this.props.svgExportName}
                // to determine updates, dynamic rendered ui and loaders
                activeIndexPlotTabs={this.state.activeIndexPlotTabs}
                upperPlotsVisible={this.props.upperPlotsVisible}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
                // functional props to call
                onHandleAllChecked={this.props.onHandleAllChecked}
                onHandleSelectedVolcano={this.props.onHandleSelectedVolcano}
                onGetPlotTransitionRef={this.props.onGetPlotTransitionRef}
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
              <MultiFeaturePlots
                differentialPlotTypes={this.props.differentialPlotTypes}
                // for plot dimension calculations
                divWidth={this.props.differentialDynamicPlotWidth}
                volcanoWidth={this.props.volcanoWidth}
                divHeight={this.props.upperPlotsDivHeight}
                upperPlotsHeight={this.props.upperPlotsHeight}
                pxToPtRatio={this.props.pxToPtRatio}
                pointSize={this.props.pointSize}
                // plot info
                plotDataMultiFeatureLength={
                  this.props.plotDataMultiFeatureLength
                }
                plotDataMultiFeature={this.props.plotDataMultiFeature}
                plotDataMultiFeatureLoaded={
                  this.props.plotDataMultiFeatureLoaded
                }
                // to determine tabs or dropdowns
                svgTabMax={this.props.svgTabMax}
                // to be used by resuable export
                svgExportName={this.props.svgExportName}
                // to determine updates, dynamic rendered ui and loaders
                activeIndexPlotTabs={this.state.activeIndexPlotTabs}
                upperPlotsVisible={this.props.upperPlotsVisible}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
                // functional props to call
                onHandleAllChecked={this.props.onHandleAllChecked}
                onHandleSelectedVolcano={this.props.onHandleSelectedVolcano}
                // multi-feature specific
                onGetMultifeaturePlotTransitionAlt={
                  this.props.onGetMultifeaturePlotTransitionAlt
                }
                HighlightedFeaturesArrVolcano={
                  this.props.HighlightedFeaturesArrVolcano
                }
                multifeaturePlotMax={this.props.multifeaturePlotMax}
                onRemoveSelectedFeature={this.props.onRemoveSelectedFeature}
              />
            </Tab.Pane>
          ),
        },
      ];
    } else {
      panes = [
        {
          menuItem: 'Single Feature Plots',
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
                plotDataSingleFeatureLength={
                  this.props.plotDataSingleFeatureLength
                }
                plotDataSingleFeature={this.props.plotDataSingleFeature}
                plotDataSingleFeatureLoaded={
                  this.props.plotDataSingleFeatureLoaded
                }
                // to determine tabs or dropdowns
                svgTabMax={this.props.svgTabMax}
                // to be used by resuable export
                svgExportName={this.props.svgExportName}
                // to be used by dynamic rendered ui and loaders
                activeIndexPlotTabs={this.state.activeIndexPlotTabs}
                upperPlotsVisible={this.props.upperPlotsVisible}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
                // functional props to call
                onHandleAllChecked={this.props.onHandleAllChecked}
                onHandleSelectedVolcano={this.props.onHandleSelectedVolcano}
                onGetPlotTransitionRef={this.props.onGetPlotTransitionRef}
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
          activeIndex={this.state.activeIndexPlotTabs}
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
