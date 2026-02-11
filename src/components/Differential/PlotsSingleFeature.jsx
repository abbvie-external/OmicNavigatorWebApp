import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import {
  Loader,
  Dimmer,
  Icon,
  Button,
  Dropdown,
  Popup,
} from 'semantic-ui-react';
import ButtonActions from '../Shared/ButtonActions';
import TabSingleFeature from './TabSingleFeature';
import './PlotsDynamic.scss';
import { isObjectEmpty } from '../Shared/helpers';

class PlotsSingleFeature extends Component {
  state = {
    activePlotRenderKey: null,
    activePlotRenderReady: false,
    activeTabIndexPlotsSingleFeature: 0,
    excelFlagSFPlots: true,
    pngFlagSFPlots: true,
    pdfFlagSFPlots: false,
    svgFlagSFPlots: true,
    txtFlagSFPlots: false,
    plotlyExport: false,
    plotlyExportType: 'svg',
  };

  differentialDetailPlotsSingleFeatureRef = React.createRef();
  metafeaturesTableDynamicRef = React.createRef();

  // Synchronous source of truth for the current render cycle key.
  // Using state alone can drop a "ready" signal due to async setState timing.
  activePlotRenderKeySync = null;

  componentDidMount() {
    this.setButtonVisibility();
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeTabIndexPlotsSingleFeature } = this.state;
    if (
      prevState.activeTabIndexPlotsSingleFeature !==
      activeTabIndexPlotsSingleFeature
    ) {
      this.setButtonVisibility();
    }
  }

  setButtonVisibility = () => {
    if (this.props.differentialPlotTypes?.length > 0) {
      const isMetaFeatureTab =
        this.state.activeTabIndexPlotsSingleFeature <
        this.props.singleFeaturePlotTypes.length
          ? false
          : true;
      this.setState({
        // display excel and text on meta-feature tab
        excelFlagSFPlots: isMetaFeatureTab,
        txtFlagSFPlots: isMetaFeatureTab,
        pdfFlagSFPlots: false,
        svgFlagSFPlots: !isMetaFeatureTab,
        pngFlagSFPlots: !isMetaFeatureTab,
      });
    }
  };

  handlePlotDropdownChangeSingleFeature = (e, { value }) => {
    this.setState({
      activeTabIndexPlotsSingleFeature: value,
    });
  };

  handlePlotOverlaySingleFeature = () => {
    const { plotSingleFeatureData } = this.props;
    const key = plotSingleFeatureData.key;
    this.props.onGetPlotTransitionRef(key, null, plotSingleFeatureData, true);
  };

  getInstructions = () => {
    const { modelSpecificMetaFeaturesExist, differentialPlotTypes } =
      this.props;
    const hasPlots = differentialPlotTypes?.length > 0 || false;
    if (hasPlots && modelSpecificMetaFeaturesExist) {
      return 'Select a feature to display plots and data';
    } else if (hasPlots) {
      return 'Select a feature to display plots';
    } else if (modelSpecificMetaFeaturesExist) {
      return 'Select a feature to display data';
    } else {
      return 'No plots nor feature data available';
    }
  };

  handlePlotlyExport = (plotlyExportType) => {
    this.setState(
      {
        plotlyExport: true,
        plotlyExportType,
      },
      function () {
        // callback to reset plotly export in progress to false
        this.setState({ plotlyExport: false });
      },
    );
  };


  handleActivePlotRenderStart = (renderKey) => {
    // Called when the active plot pane is about to render (e.g., new feature/tab/size).
    // Keep loader visible until the render completion callback fires for the same key.
    this.activePlotRenderKeySync = renderKey || null;
    this.setState({
      activePlotRenderKey: renderKey || null,
      activePlotRenderReady: false,
    });
  };

  handleActivePlotRenderReady = (renderKey) => {
    // Only accept readiness signal for the current renderKey to avoid races.
    if (renderKey && this.activePlotRenderKeySync !== renderKey) return;
    if (!this.state.activePlotRenderReady) {
      this.setState({ activePlotRenderReady: true });
    }
  };

  render() {
    const {
      plotSingleFeatureData,
      plotSingleFeatureDataLength,
      plotSingleFeatureDataLoaded,
      divWidth,
      upperPlotsVisible,
      svgExportName,
      tab,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialPlotDescriptions,
      isLoading = false,
      showFullScreenButton = true,
    } = this.props;

    const {
      activeTabIndexPlotsSingleFeature,
      pdfFlagSFPlots,
      pngFlagSFPlots,
      svgFlagSFPlots,
      txtFlagSFPlots,
      excelFlagSFPlots,
    } = this.state;

    if (upperPlotsVisible) {
      if (
        plotSingleFeatureDataLength !== 0 &&
        plotSingleFeatureData.key != null
      ) {
        const DropdownClass =
          this.props.differentialPlotTypes?.length > this.props.svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const activeTabIndexPlotsSingleFeatureVar =
          activeTabIndexPlotsSingleFeature || 0;
        const svgArray = [...plotSingleFeatureData.svg];
        let options = [];
        options = svgArray.map(function (s, index) {
          return {
            key: `${index}=VolcanoPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });
        const isMultifeaturePlot =
          this.props.plotSingleFeatureData.key?.includes('features') || false;
        if (
          this.props.modelSpecificMetaFeaturesExist !== false &&
          !isMultifeaturePlot
        ) {
          const singleFeaturePlotTypes =
            this.props.differentialPlotTypes.filter(
              (p) => !p.plotType.includes('multiFeature'),
            );
          let metafeaturesDropdown = [
            {
              key: 'Feature-Data-SVG-Plot',
              text: 'Feature Data',
              value: singleFeaturePlotTypes?.length,
            },
          ];
          options = [...options, ...metafeaturesDropdown];
        }
        let differentialPlotDescription = null;
        let currentDifferentialPlotDescriptions =
          differentialPlotDescriptions || {};
        const currentPlotText =
          options?.[activeTabIndexPlotsSingleFeature]?.text || null;
        if (!isObjectEmpty(currentDifferentialPlotDescriptions)) {
          const DescriptionsAsArray = Object.entries(
            currentDifferentialPlotDescriptions,
          );
          if (DescriptionsAsArray.length && currentPlotText) {
            let currentDifferentialPlotDescription =
              DescriptionsAsArray.filter(
                (p) => p[1].displayName === currentPlotText,
              ) || null;
            differentialPlotDescription =
              currentDifferentialPlotDescription.length
                ? currentDifferentialPlotDescription?.[0]?.[1]?.description
                : null;
          }
        }
        const loader = plotSingleFeatureDataLoaded && this.state.activePlotRenderReady ? null : (
          <Dimmer active inverted>
            <Loader size="large">Loading Single-Feature Plots</Loader>
          </Dimmer>
        );

        const exportInTabHeader = !!this.props.exportInTabHeader;
        const exportPortalNode = this.props.exportPortalNode || null;
        const exportPortalActive = !!this.props.exportPortalActive;
        const exportWrapperClass = exportInTabHeader
          ? 'PlotTabsExportInner'
          : 'export-svg ShowBlock';

        const exportContent = (
          <div className={exportWrapperClass}>
            <ButtonActions
              exportButtonSize={'mini'}
              excelVisible={excelFlagSFPlots}
              pdfVisible={pdfFlagSFPlots}
              pngVisible={pngFlagSFPlots}
              svgVisible={svgFlagSFPlots}
              txtVisible={txtFlagSFPlots}
              tab={tab}
              imageInfo={plotSingleFeatureData}
              tabIndex={activeTabIndexPlotsSingleFeatureVar}
              svgExportName={svgExportName}
              refFwd={this.metafeaturesTableDynamicRef}
              study={differentialStudy}
              model={differentialModel}
              test={differentialTest}
              feature={plotSingleFeatureData?.key}
              plot="PlotsSingleFeatureContainer"
              handlePlotlyExport={this.handlePlotlyExport}
              fwdRef={this.differentialDetailPlotsSingleFeatureRef}
            />
          </div>
        );

        const exportRender = exportInTabHeader
          ? exportPortalNode && exportPortalActive
            ? createPortal(exportContent, exportPortalNode)
            : null
          : exportContent;

        return (
          <div
            className="differentialDetailSvgContainer"
            ref={this.differentialDetailPlotsSingleFeatureRef}
          >
            {exportRender}
            <div className="PlotToolbarRow">
              <div className="PlotToolbarLeft">
                {differentialPlotDescription ? (
                  <Popup
                    trigger={
                      <Dropdown
                        search
                        selection
                        compact
                        options={options}
                        value={
                          options[activeTabIndexPlotsSingleFeatureVar]?.value ||
                          options[0]?.value
                        }
                        onChange={
                          this.handlePlotDropdownChangeSingleFeature
                        }
                        className={DropdownClass}
                        id={
                          isMultifeaturePlot
                            ? 'svgPlotDropdownMulti'
                            : 'svgPlotDropdownSingle'
                        }
                      />
                    }
                    basic
                    inverted
                    position="bottom center"
                    closeOnDocumentClick
                    closeOnEscape
                    hideOnScroll
                  >
                    <Popup.Content>
                      {differentialPlotDescription}
                    </Popup.Content>
                  </Popup>
                ) : (
                  <Dropdown
                    search
                    selection
                    compact
                    options={options}
                    value={
                      options[activeTabIndexPlotsSingleFeatureVar]?.value ||
                      options[0]?.value
                    }
                    onChange={this.handlePlotDropdownChangeSingleFeature}
                    className={DropdownClass}
                    id={
                      isMultifeaturePlot
                        ? 'svgPlotDropdownMulti'
                        : 'svgPlotDropdownSingle'
                    }
                  />
                )}
              </div>
              <div className="PlotToolbarRight">
                {showFullScreenButton && (
                  <span
                    className={divWidth < 450 ? 'Hide' : 'Show'}
                    id={
                      divWidth >= 625 ? 'FullScreenButton' : 'FullScreenIcon'
                    }
                  >
                    <Button
                      size="mini"
                      onClick={this.handlePlotOverlaySingleFeature}
                      className={divWidth >= 625 ? '' : 'FullScreenPadding'}
                    >
                      <Icon name="expand arrows alternate" className="" />
                      {divWidth >= 625 ? 'FULL SCREEN' : ''}
                    </Button>
                  </span>
                )}
              </div>
            </div>
            <TabSingleFeature
              // DEV - add only necessary props
              {...this.props}
              {...this.state}
              onActivePlotRenderStart={this.handleActivePlotRenderStart}
              onActivePlotRenderReady={this.handleActivePlotRenderReady}
              differentialDetailPlotsSingleFeatureRefFwd={
                this.differentialDetailPlotsSingleFeatureRef
              }
              ref={this.metafeaturesTableDynamicRef}
            />
            <span id="PlotSingleFeatureDataLoader">{loader}</span>
          </div>
        );
      } else if (isLoading) {
        // Initial selection / selection change: show loader instead of instructions
        return (
          <div className="PlotInstructions">
            <Dimmer active inverted>
              <Loader size="large">Loading Single-Feature Plots</Loader>
            </Dimmer>
          </div>
        );
      } else {
        // no plot data; display instructions or no plots message
        let instructions = this.getInstructions();
        return (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText NoSelect">{instructions}</h4>
          </div>
        );
      }
    } else return null;
  }
}

export default PlotsSingleFeature;
