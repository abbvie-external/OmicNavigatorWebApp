import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab, Dropdown } from 'semantic-ui-react';
import DifferentialBreadcrumbs from './DifferentialBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTable from './MetafeaturesTable';
import PlotlyOverlay from './PlotlyOverlay';
import '../Enrichment/SplitPanesContainer.scss';
import './PlotsDynamic.scss';
import './PlotsOverlay.scss';

class PlotsOverlay extends PureComponent {
  constructor(props) {
    super(props);
    // this.resizeListener = this.resizeListener.bind(this);
    // this.debouncedResizeListener = _.debounce(this.resizeListener, 100);
    this.state = {
      activeTabIndexPlotsOverlay: 0,
      excelFlag: true,
      pngFlag: true,
      pdfFlag: false,
      svgFlag: true,
      txtFlag: false,
      plotlyExport: false,
      plotlyExportType: 'svg',
    };
  }

  metaFeaturesTableRef = React.createRef();
  differentialPlotsOverlayRef = React.createRef();

  componentDidMount() {
    this.setButtonVisibility();
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeTabIndexPlotsOverlay } = this.state;
    if (prevState.activeTabIndexPlotsOverlay !== activeTabIndexPlotsOverlay) {
      this.setButtonVisibility(activeTabIndexPlotsOverlay);
    }
  }

  setButtonVisibility = () => {
    if (this.props.differentialPlotTypes.length > 0) {
      const isMetaFeatureTab =
        this.metaFeaturesTableRef.current !== null ? true : false;
      this.setState({
        excelFlag: isMetaFeatureTab,
        txtFlag: isMetaFeatureTab,
        pdfFlag: false,
        svgFlag: !isMetaFeatureTab,
        pngFlag: !isMetaFeatureTab,
      });
    } else {
      this.setState({
        excelFlag: true,
        txtFlag: true,
        pdfFlag: false,
        svgFlag: false,
        pngFlag: false,
      });
    }
  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({
      activeTabIndexPlotsOverlay: activeIndex,
    });
  };

  handlePlotDropdownChange = (e, { value }) => {
    this.setState({
      activeTabIndexPlotsOverlay: value,
    });
  };

  getWidth = () => {
    if (this.differentialPlotsOverlayRef.current !== null) {
      return this.differentialPlotsOverlayRef.current.offsetParent.offsetWidth;
    }
    return 1200;
  };

  getHeight = () => {
    if (this.differentialPlotsOverlayRef.current !== null) {
      return this.differentialPlotsOverlayRef.current.offsetParent.offsetHeight;
    }
    return 700;
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

  getSVGPanesOverlay = (activeTabIndexPlotsOverlay, overlayPlotsTypes) => {
    const {
      plotOverlayData,
      modelSpecificMetaFeaturesExist,
      differentialStudy,
      differentialModel,
      differentialTest,
      // plotOverlayLoaded,
    } = this.props;
    let panes = [];
    // if (!plotOverlayLoaded) {
    //   return (
    //     // <LoaderActivePlots />
    //     <div className="PlotsMetafeaturesDimmer">
    //       <Dimmer active inverted>
    //         <Loader size="large">Loading...</Loader>
    //       </Dimmer>
    //     </div>
    //   );
    // } else {
    if (plotOverlayData && plotOverlayData.svg?.length) {
      // since this call is in render, index determines the one tab to display (svg, plotly or feature data)
      if (activeTabIndexPlotsOverlay < overlayPlotsTypes.length) {
        const plotId =
          overlayPlotsTypes[activeTabIndexPlotsOverlay].plotType.plotID;
        const plotKey = plotOverlayData.key;
        // const cacheKey = `overlayFeaturePanes_${differentialStudy}_${differentialModel}_${differentialTest}_${plotKey}_${plotId}_${activeTabIndexPlotsOverlay}`;
        // if (this[cacheKey] != null) {
        // console.log(
        //   `overlay features render cached ${cacheKey}`,
        //   this[cacheKey],
        // );
        //   return this[cacheKey];
        // } else {
        const s = plotOverlayData?.svg[activeTabIndexPlotsOverlay];
        const featuresLength = this.props.differentialHighlightedFeaturesData
          .length;
        if (s) {
          const svgContainerWidth = this.getWidth();
          const svgContainerHeight = this.getHeight();
          const isPlotlyPlot = s.plotType.plotType.includes('plotly');
          const svgPanes = {
            menuItem: `${s.plotType.plotDisplay}`,
            render: () => (
              <Tab.Pane attached="true" as="div">
                {isPlotlyPlot ? (
                  <div id="PlotsOverlayContainer" className="svgSpan">
                    <PlotlyOverlay
                      plotlyData={s.svg}
                      height={svgContainerHeight}
                      width={svgContainerWidth}
                      differentialStudy={differentialStudy}
                      differentialModel={differentialModel}
                      differentialTest={differentialTest}
                      plotId={plotId}
                      plotKey={plotKey}
                      plotName={s.plotType.plotDisplay}
                      plotType={s.plotType.plotType}
                      featureId={plotOverlayData?.key}
                      featuresLength={featuresLength}
                      plotlyExport={this.state.plotlyExport}
                      plotlyExportType={this.state.plotlyExportType}
                      parentNode={this.differentialPlotsOverlayRef}
                    />
                  </div>
                ) : (
                  <div
                    id="PlotsOverlayContainer"
                    className="svgSpan"
                    dangerouslySetInnerHTML={{ __html: s.svg }}
                  ></div>
                )}
              </Tab.Pane>
            ),
          };
          panes = panes.concat(svgPanes);
          // this[cacheKey] = panes;
        }
        // }
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
                    ref={this.metaFeaturesTableRef}
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
      return panes;
    }
    // }
  };

  render() {
    const {
      excelFlag,
      pngFlag,
      pdfFlag,
      txtFlag,
      svgFlag,
      activeTabIndexPlotsOverlay,
    } = this.state;
    const {
      plotOverlayLoaded,
      plotOverlayData,
      tab,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      // differentialPlotTypes,
      modelSpecificMetaFeaturesExist,
      singleFeaturePlotTypes,
    } = this.props;
    if (!plotOverlayLoaded) {
      return (
        // <LoaderActivePlots />
        <div className="PlotsMetafeaturesDimmer">
          <Dimmer active inverted>
            <Loader size="large">Loading...</Loader>
          </Dimmer>
        </div>
      );
    } else {
      // if (
      //   plotOverlayDataLength !== 0 &&
      //   plotOverlayData.key != null
      // ) {
      const svgArray = [...plotOverlayData.svg];
      // const overlayPlotsTypesLength = svgArray?.length || 0;
      const svgPanesOverlay = this.getSVGPanesOverlay(
        activeTabIndexPlotsOverlay,
        svgArray,
      );
      const activeTabIndexPlotsOverlayVar = activeTabIndexPlotsOverlay || 0;
      // const svgArrayLength = svgArray
      let options = [];
      options = svgArray.map(function(s, index) {
        return {
          key: `${index}=VolcanoPlotDropdownOption`,
          text: s.plotType.plotDisplay,
          value: index,
        };
      });
      const isMultifeaturePlot =
        plotOverlayData.key?.includes('features') || false;
      if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
        // const singleFeaturePlotTypes = differentialPlotTypes.filter(
        //   p => p.plotType !== 'multiFeature',
        // const overlayPlotTypes = differentialPlotTypes.filter(
        //   p => !p.plotType.includes('multiFeature'),
        // );
        let metafeaturesDropdown = [
          {
            key: 'Feature-Data-SVG-Plot',
            text: 'Feature Data',
            value: singleFeaturePlotTypes?.length,
          },
        ];
        options = [...options, ...metafeaturesDropdown];
      }
      // const loader = plotOverlayLoaded ? null : (
      //   //  <div className="PlotsMetafeaturesDimmer">
      //   <Dimmer active inverted>
      //     <Loader size="large">Loading...</Loader>
      //   </Dimmer>
      //   //  </div>
      // );

      if (this.props.differentialPlotTypes && this.props.plotOverlayData) {
        return (
          <div className="PlotWrapper">
            <Grid columns={2} className="">
              <Grid.Row className="ActionsRow">
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  <DifferentialBreadcrumbs {...this.props} />
                </Grid.Column>
                <Grid.Column
                  mobile={8}
                  tablet={8}
                  largeScreen={8}
                  widescreen={8}
                >
                  <ButtonActions
                    exportButtonSize={'small'}
                    excelVisible={excelFlag}
                    pngVisible={pngFlag}
                    pdfVisible={pdfFlag}
                    svgVisible={svgFlag}
                    txtVisible={txtFlag}
                    refFwd={
                      this.metaFeaturesTableRef.current?.metafeaturesGridRef ||
                      null
                    }
                    tab={tab}
                    study={differentialStudy}
                    model={differentialModel}
                    test={differentialTest}
                    feature={differentialFeature}
                    imageInfo={plotOverlayData}
                    tabIndex={activeTabIndexPlotsOverlayVar}
                    plot={'PlotsOverlayContainer'}
                    handlePlotlyExport={this.handlePlotlyExport}
                    fwdRef={this.differentialPlotsOverlayRef}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>

            <Grid className="PlotContainer">
              <Grid.Row className="PlotContainerRow">
                <Grid.Column
                  mobile={16}
                  tablet={16}
                  largeScreen={16}
                  widescreen={16}
                >
                  <div className="" ref={this.differentialPlotsOverlayRef}>
                    <Dropdown
                      search
                      selection
                      compact
                      options={options}
                      value={options[activeTabIndexPlotsOverlayVar]?.value || 0}
                      onChange={this.handlePlotDropdownChange}
                    />
                    <Tab
                      menu={{
                        secondary: true,
                        pointing: true,
                        className: 'Hide',
                      }}
                      panes={svgPanesOverlay}
                      onTabChange={this.handleTabChange}
                      activeIndex={0}
                    />
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            {/* <span id="PlotOverlayDataLoader">{loader}</span> */}
          </div>
        );
      } else return null;
    }
  }
}

export default withRouter(PlotsOverlay);
