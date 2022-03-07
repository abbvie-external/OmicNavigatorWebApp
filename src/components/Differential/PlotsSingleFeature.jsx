import React, { Component } from 'react';
import { Loader, Dimmer, Tab, Icon, Button, Dropdown } from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import { roundToPrecision } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTableDynamic from './MetafeaturesTableDynamic';
import PlotlySingleFeature from './PlotlySingleFeature';
import './PlotsDynamic.scss';
import '../Shared/Plotly.scss';

class PlotsSingleFeature extends Component {
  state = {
    activeTabIndexPlotsSingleFeature: 0,
    excelFlagSFPlots: true,
    pngFlagSFPlots: true,
    pdfFlagSFPlots: false,
    svgFlagSFPlots: true,
    txtFlagSFPlots: false,
    plotlyExport: false,
    plotlyExportType: 'svg',
    isPlotlyPlot: true,
  };

  differentialDetailPlotsSingleFeatureRef = React.createRef();
  metaFeaturesTableDynamicRef = React.createRef();

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
        this.metaFeaturesTableDynamicRef.current !== null ? true : false;
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

  handleTabChangeSingleFeature = (e, { activeIndex }) => {
    this.setState({
      activeTabIndexPlotsSingleFeature: activeIndex,
    });
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

  getSVGPanesSingleFeature = activeTabIndexPlotsSingleFeature => {
    const {
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotSingleFeatureData,
      // singleFeaturePlotTypes,
      modelSpecificMetaFeaturesExist,
      differentialStudy,
      differentialModel,
      plotOverlayLoaded,
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

    const svgArray = plotSingleFeatureData.svg;
    // index determines whether to set svg, or feature data
    // if (activeTabIndexPlotsSingleFeature < singleFeaturePlotTypes.length) {
    //   const s = plotSingleFeatureData?.svg[activeTabIndexPlotsSingleFeature];
    // const srcUrl = `${s.svg}${dimensions}`;
    // const svgPanes = {
    //   menuItem: `${s.plotType.plotDisplay}`,
    //   render: () => (
    //     <Tab.Pane
    //       attached="true"
    //       as="div"
    //       key={`${activeTabIndexPlotsSingleFeature}-${s.plotType.plotDisplay}-pane-volcano`}
    //     >
    //       <div id="PlotsSingleFeatureContainer" className="svgSpan">
    //         <SVG
    //           cacheRequests={true}
    //           src={srcUrl}
    //           title={`${s.plotType.plotDisplay}`}
    //           uniqueHash={`a1f8d1-${activeTabIndexPlotsSingleFeature}`}
    //           uniquifyIDs={true}
    //         />
    //       </div>
    //     </Tab.Pane>
    //   ),
    // };
    // panes = panes.concat(svgPanes);
    // } else {
    //   const isMultifeaturePlot =
    //   plotSingleFeatureData?.key?.includes('features') || false;
    // if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
    //   let metafeaturesTab = [
    //     {
    //       menuItem: 'Feature Data',
    //       render: () => (
    //         <Tab.Pane attached="true" as="div">
    //           <MetafeaturesTableDynamic
    //             ref={this.metaFeaturesTableDynamicRef}
    //             differentialStudy={differentialStudy}
    //             differentialModel={differentialModel}
    //             plotOverlayLoaded={plotOverlayLoaded}
    //             plotSingleFeatureData={plotSingleFeatureData}
    //             modelSpecificMetaFeaturesExist={modelSpecificMetaFeaturesExist}
    //           />
    //         </Tab.Pane>
    //       ),
    //     },
    //   ];
    //   panes = panes.concat(metafeaturesTab);
    // }
    // }
    const svgPanes = svgArray.map((s, index) => {
      const isPlotlyPlot = s.plotType.plotType.includes('plotly');
      const srcUrl = `${s.svg}${dimensions}`;
      return {
        menuItem: `${s.plotType.plotDisplay}`,
        render: () => (
          <Tab.Pane
            attached="true"
            as="div"
            key={`${index}-${s.plotType.plotDisplay}-pane-volcano`}
          >
            <div id="PlotsSingleFeatureContainer" className="svgSpan">
              {isPlotlyPlot ? (
                <PlotlySingleFeature
                  plotlyData={s.svg}
                  height={divHeightPadding}
                  width={divWidthPadding}
                  plotName={s.plotType.plotDisplay}
                  plotlyExport={this.state.plotlyExport}
                  plotlyExportType={this.state.plotlyExportType}
                  featureId={plotSingleFeatureData?.key}
                  parentNode={this.differentialDetailPlotsSingleFeatureRef}
                />
              ) : (
                <SVG
                  cacheRequests={true}
                  src={srcUrl}
                  title={`${s.plotType.plotDisplay}`}
                  uniqueHash={`a1f8d1-${index}`}
                  uniquifyIDs={true}
                />
              )}
            </div>
          </Tab.Pane>
        ),
      };
    });
    panes = panes.concat(svgPanes);
    const isMultifeaturePlot =
      plotSingleFeatureData?.key?.includes('features') || false;
    if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
      let metafeaturesTab = [
        {
          menuItem: 'Feature Data',
          render: () => (
            <Tab.Pane attached="true" as="div">
              <MetafeaturesTableDynamic
                ref={this.metaFeaturesTableDynamicRef}
                differentialStudy={differentialStudy}
                differentialModel={differentialModel}
                plotOverlayLoaded={plotOverlayLoaded}
                plotSingleFeatureData={plotSingleFeatureData}
                modelSpecificMetaFeaturesExist={modelSpecificMetaFeaturesExist}
              />
            </Tab.Pane>
          ),
        },
      ];
      panes = panes.concat(metafeaturesTab);
    }
    return panes;
  };

  getInstructions = () => {
    const {
      modelSpecificMetaFeaturesExist,
      differentialPlotTypes,
    } = this.props;
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

  handlePlotlyExport = plotlyExportType => {
    this.setState(
      {
        plotlyExport: true,
        plotlyExportType,
      },
      function() {
        // callback to reset plotly export in progress to false
        this.setState({ plotlyExport: false });
      },
    );
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
        const svgPanesSingleFeature = this.getSVGPanesSingleFeature(
          activeTabIndexPlotsSingleFeature,
        );
        const DropdownClass =
          this.props.differentialPlotTypes?.length > this.props.svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClass =
          this.props.differentialPlotTypes?.length > this.props.svgTabMax
            ? 'Hide'
            : 'Show';
        const activeTabIndexPlotsSingleFeatureVar =
          activeTabIndexPlotsSingleFeature || 0;
        const svgArray = [...plotSingleFeatureData.svg];
        let options = [];
        options = svgArray.map(function(s, index) {
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
          const singleFeaturePlotTypes = this.props.differentialPlotTypes.filter(
            p => !p.plotType.includes('multiFeature'),
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
        const loader = plotSingleFeatureDataLoaded ? null : (
          <Dimmer active inverted>
            <Loader size="large">Loading Single Feature Plots</Loader>
          </Dimmer>
        );
        return (
          <div
            className="differentialDetailSvgContainer"
            ref={this.differentialDetailPlotsSingleFeatureRef}
          >
            <div className="export-svg ShowBlock">
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
                refFwd={
                  this.metaFeaturesTableDynamicRef.current
                    ?.metafeaturesGridRefDynamic || null
                }
                study={differentialStudy}
                model={differentialModel}
                test={differentialTest}
                feature={plotSingleFeatureData?.key}
                plot="PlotsSingleFeatureContainer"
                handlePlotlyExport={this.handlePlotlyExport}
                fwdRef={this.differentialDetailPlotsSingleFeatureRef}
              />
            </div>
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
            <Tab
              menu={{
                secondary: true,
                pointing: true,
                className: TabMenuClass,
              }}
              panes={svgPanesSingleFeature}
              onTabChange={this.handleTabChange}
              activeIndex={activeTabIndexPlotsSingleFeature}
            />
            <span
              className={divWidth < 450 ? 'Hide' : 'Show'}
              id={divWidth >= 625 ? 'FullScreenButton' : 'FullScreenIcon'}
            >
              {/* <Popup
                  trigger={ */}
              <Button
                size="mini"
                onClick={this.handlePlotOverlaySingleFeature}
                className={divWidth >= 625 ? '' : 'FullScreenPadding'}
              >
                <Icon
                  // name="expand"
                  name="expand arrows alternate"
                  className=""
                />
                {divWidth >= 625 ? 'FULL SCREEN' : ''}
              </Button>
            </span>
            <span id="PlotSingleFeatureDataLoader">{loader}</span>
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
