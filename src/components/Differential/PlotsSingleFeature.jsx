import React, { Component } from 'react';
import { Loader, Dimmer, Icon, Button, Dropdown } from 'semantic-ui-react';
import ButtonActions from '../Shared/ButtonActions';
import TabSingleFeature from './TabSingleFeature';
import './PlotsDynamic.scss';

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
  };

  differentialDetailPlotsSingleFeatureRef = React.createRef();
  metafeaturesTableDynamicRef = React.createRef();

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
        const loader = plotSingleFeatureDataLoaded ? null : (
          <Dimmer active inverted>
            <Loader size="large">Loading Single-Feature Plots</Loader>
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
            <TabSingleFeature
              // DEV - add only necessary props
              {...this.props}
              {...this.state}
              differentialDetailPlotsSingleFeatureRefFwd={
                this.differentialDetailPlotsSingleFeatureRef
              }
              ref={this.metafeaturesTableDynamicRef}
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
