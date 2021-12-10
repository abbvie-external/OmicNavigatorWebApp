import React, { Component } from 'react';
import { Loader, Dimmer, Tab, Icon, Button, Dropdown } from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import { roundToPrecision } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTableDynamic from './MetafeaturesTableDynamic';
import './PlotsDynamic.scss';

class PlotsSingleFeature extends Component {
  state = {
    activeIndexPlotTabs: 0,
    activeSVGTabIndexVolcanoSingleFeature: 0,
    excelFlagSFPlots: true,
    pngFlagSFPlots: true,
    pdfFlagSFPlots: false,
    svgFlagSFPlots: true,
    txtFlagSFPlots: false,
  };
  metaFeaturesTableDynamicRef = React.createRef();

  componentDidMount() {
    this.setButtonVisibility();
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeSVGTabIndexVolcanoSingleFeature } = this.state;
    if (
      prevState.activeSVGTabIndexVolcanoSingleFeature !==
      activeSVGTabIndexVolcanoSingleFeature
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
      activeSVGTabIndexVolcanoSingleFeature: activeIndex,
    });
  };

  handlePlotDropdownChangeSingleFeature = (e, { value }) => {
    this.setState({
      activeSVGTabIndexVolcanoSingleFeature: value,
    });
  };

  handlePlotOverlaySingleFeature = () => {
    const { plotDataSingleFeature } = this.props;
    const key = plotDataSingleFeature.key;
    this.props.onGetPlotTransitionRef(key, null, plotDataSingleFeature, true);
  };

  getSVGPanesSingleFeature = () => {
    const {
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotDataSingleFeature,
      modelSpecificMetaFeaturesExist,
      differentialStudy,
      differentialModel,
      plotOverlayLoaded,
    } = this.props;
    let panes = [];
    let dimensions = '';
    if (divWidth && divHeight && pxToPtRatio) {
      const divWidthPadding = divWidth * 0.95;
      const divHeightPadding = divHeight * 0.95 - 38;
      const divWidthPt = roundToPrecision(divWidthPadding / pxToPtRatio, 1);
      const divHeightPt = roundToPrecision(divHeightPadding / pxToPtRatio, 1);
      const divWidthPtString = `width=${divWidthPt}`;
      const divHeightPtString = `&height=${divHeightPt}`;
      const pointSizeString = `&pointsize=${pointSize}`;
      dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
    }
    const svgArray = plotDataSingleFeature.svg;
    const svgPanes = svgArray.map((s, index) => {
      const srcUrl = `${s.svg}${dimensions}`;
      return {
        menuItem: `${s.plotType.plotDisplay}`,
        render: () => (
          <Tab.Pane
            attached="true"
            as="div"
            key={`${index}-${s.plotType.plotDisplay}-pane-volcano`}
          >
            <div id="VolcanoPlotSVG" className="svgSpan">
              <SVG
                cacheRequests={true}
                src={srcUrl}
                title={`${s.plotType.plotDisplay}`}
                uniqueHash="a1f8d1"
                uniquifyIDs={true}
              />
            </div>
          </Tab.Pane>
        ),
      };
    });
    panes = panes.concat(svgPanes);
    const isMultifeaturePlot =
      plotDataSingleFeature?.key?.includes('features') || false;
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
                plotDataSingleFeature={plotDataSingleFeature}
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

  render() {
    const {
      plotDataSingleFeature,
      plotDataSingleFeatureLength,
      divWidth,
      tabsMessage,
      upperPlotsVisible,
      svgExportName,
      tab,
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;

    const {
      activeSVGTabIndexVolcanoSingleFeature,
      pdfFlagSFPlots,
      pngFlagSFPlots,
      svgFlagSFPlots,
      txtFlagSFPlots,
      excelFlagSFPlots,
    } = this.state;
    if (upperPlotsVisible) {
      if (
        plotDataSingleFeatureLength !== 0 &&
        plotDataSingleFeature.key != null
      ) {
        const svgPanesSingleFeature = this.getSVGPanesSingleFeature();
        const DropdownClass =
          this.props.differentialPlotTypes?.length > this.props.svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClass =
          this.props.differentialPlotTypes?.length > this.props.svgTabMax
            ? 'Hide'
            : 'Show';
        // const BreadcrumbPopupStyle = {
        //   backgroundColor: '2E2E2E',
        //   borderBottom: '2px solid var(--color-primary)',
        //   color: '#FFF',
        //   padding: '1em',
        //   maxWidth: '50vw',
        //   fontSize: '13px',
        //   wordBreak: 'break-all',
        // };
        const activeSVGTabIndexVolcanoSingleFeatureVar =
          activeSVGTabIndexVolcanoSingleFeature || 0;
        const svgArray = [...plotDataSingleFeature.svg];
        let options = [];
        options = svgArray.map(function(s, index) {
          return {
            key: `${index}=VolcanoPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });
        const isMultifeaturePlot =
          this.props.plotDataSingleFeature.key?.includes('features') || false;
        if (
          this.props.modelSpecificMetaFeaturesExist !== false &&
          !isMultifeaturePlot
        ) {
          // options = options.concat(plotOptions);
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
        return (
          <div className="svgContainerVolcano">
            <div className="export-svg ShowBlock">
              <ButtonActions
                exportButtonSize={'mini'}
                excelVisible={excelFlagSFPlots}
                pdfVisible={pdfFlagSFPlots}
                pngVisible={pngFlagSFPlots}
                svgVisible={svgFlagSFPlots}
                txtVisible={txtFlagSFPlots}
                tab={tab}
                imageInfo={plotDataSingleFeature}
                tabIndex={activeSVGTabIndexVolcanoSingleFeatureVar}
                svgExportName={svgExportName}
                plot="VolcanoPlotSVG"
                refFwd={
                  this.metaFeaturesTableDynamicRef.current
                    ?.metafeaturesGridRefDynamic || null
                }
                study={differentialStudy}
                model={differentialModel}
                test={differentialTest}
                feature={plotDataSingleFeature?.key}
              />
            </div>
            <Dropdown
              search
              selection
              compact
              options={options}
              value={
                options[activeSVGTabIndexVolcanoSingleFeatureVar]?.value ||
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
              activeIndex={activeSVGTabIndexVolcanoSingleFeature}
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
          </div>
        );
        // } else if (!dynamicPlotsLoaded) {
        //   return (
        //     <Dimmer active inverted>
        //       <Loader size="large">Loading Plots</Loader>
        //     </Dimmer>
        //   );
      } else {
        return (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText NoSelect">{tabsMessage}</h4>
          </div>
        );
      }
    } else return null;
  }
}

export default PlotsSingleFeature;
