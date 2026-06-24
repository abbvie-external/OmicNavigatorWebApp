import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Dropdown, Popup } from 'semantic-ui-react';

import ButtonActions from '../Shared/ButtonActions';

import DifferentialBreadcrumbs from './DifferentialBreadcrumbs';
import TabOverlay from './TabOverlay';

import '../Enrichment/SplitPanesContainer.scss';
import './PlotsDynamic.scss';
import './PlotsOverlay.scss';
import { isObjectEmpty } from '../Shared/helpers';

let lastOverlaySelection = { key: null, index: 0 };

class PlotsOverlay extends PureComponent {
  constructor(props) {
    super(props);
    // this.resizeListener = this.resizeListener.bind(this);
    // this.debouncedResizeListener = _.debounce(this.resizeListener, 100);
    const currentOverlayKey = props.plotOverlayData?.key || null;
    const initialActiveIndex =
      lastOverlaySelection.key === currentOverlayKey
        ? lastOverlaySelection.index
        : 0;
    this.state = {
      activeTabIndexPlotsOverlay: initialActiveIndex,
      excelFlag: true,
      pngFlag: true,
      pdfFlag: false,
      svgFlag: true,
      txtFlag: false,
      plotlyExport: false,
      plotlyExportType: 'svg',
    };
    this.metafeaturesTableRef = React.createRef();
  }

  metaFeaturesTableRef = React.createRef();
  differentialPlotsOverlayRef = React.createRef();

  componentDidMount() {
    this.setButtonVisibility();
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeTabIndexPlotsOverlay } = this.state;
    const prevOverlayKey = prevProps.plotOverlayData?.key || null;
    const currentOverlayKey = this.props.plotOverlayData?.key || null;
    const isMultifeaturePlot = this.getIsMultiFeature();
    const plotCount = isMultifeaturePlot
      ? this.props.multiFeaturePlotTypes?.length || 0
      : this.props.singleFeaturePlotTypes?.length || 0;
    const hasMetaFeatureTab =
      this.props.modelSpecificMetaFeaturesExist !== false &&
      !isMultifeaturePlot;
    const maxValidIndex = hasMetaFeatureTab ? plotCount : plotCount - 1;

    if (prevOverlayKey !== currentOverlayKey) {
      // Reset selection for a new overlay payload and persist for future remounts.
      if (activeTabIndexPlotsOverlay !== 0) {
        this.setState({ activeTabIndexPlotsOverlay: 0 });
      }
      lastOverlaySelection = { key: currentOverlayKey, index: 0 };
      return;
    }

    if (maxValidIndex >= 0 && activeTabIndexPlotsOverlay > maxValidIndex) {
      const clampedIndex = Math.max(0, maxValidIndex);
      if (clampedIndex !== activeTabIndexPlotsOverlay) {
        this.setState({ activeTabIndexPlotsOverlay: clampedIndex });
      }
      lastOverlaySelection = { key: currentOverlayKey, index: clampedIndex };
      return;
    }

    if (prevState.activeTabIndexPlotsOverlay !== activeTabIndexPlotsOverlay) {
      lastOverlaySelection = {
        key: currentOverlayKey,
        index: activeTabIndexPlotsOverlay,
      };
      this.setButtonVisibility(activeTabIndexPlotsOverlay);
    }
  }

  /**
   * Determines if this is a multi-feature plot.
   * Prefers explicit isMultiFeature prop if provided; falls back to key detection.
   */
  getIsMultiFeature = () => {
    const { isMultiFeature, plotOverlayData } = this.props;
    if (typeof isMultiFeature === 'boolean') return isMultiFeature;
    return plotOverlayData?.key?.includes('features') || false;
  };

  setButtonVisibility = () => {
    if (this.props.differentialPlotTypes.length > 0) {
      const isMultifeaturePlot = this.getIsMultiFeature();
      const length = isMultifeaturePlot
        ? this.props.multiFeaturePlotTypes.length
        : this.props.singleFeaturePlotTypes.length;
      const isMetaFeatureTab =
        this.state.activeTabIndexPlotsOverlay < length ? false : true;
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

  handlePlotDropdownChange = (e, { value }) => {
    const currentOverlayKey = this.props.plotOverlayData?.key || null;
    lastOverlaySelection = { key: currentOverlayKey, index: value };
    this.setState({
      activeTabIndexPlotsOverlay: value,
    });
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
      plotOverlayLoaded,
      plotOverlayData,
      tab,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialFeature,
      differentialPlotTypes,
      modelSpecificMetaFeaturesExist,
      singleFeaturePlotTypes,
      differentialPlotDescriptions,
      BreadcrumbsComponent = DifferentialBreadcrumbs,
      breadcrumbsProps = {},
    } = this.props;

    const {
      excelFlag,
      pngFlag,
      pdfFlag,
      txtFlag,
      svgFlag,
      activeTabIndexPlotsOverlay,
    } = this.state;

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
      const activeTabIndexPlotsOverlayVar = activeTabIndexPlotsOverlay || 0;
      // const svgArrayLength = svgArray
      let options = [];
      options = svgArray.map(function (s, index) {
        return {
          key: `${index}=VolcanoPlotDropdownOption`,
          text: s.plotType.plotDisplay,
          value: index,
        };
      });
      const isMultifeaturePlot = this.getIsMultiFeature();
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

      if (differentialPlotTypes && plotOverlayData) {
        let differentialPlotDescription = null;
        let currentDifferentialPlotDescriptions =
          differentialPlotDescriptions || {};
        const activeOption = options.find(
          (opt) => opt.value === activeTabIndexPlotsOverlayVar,
        );
        const currentPlotText = activeOption?.text || null;
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
                  <BreadcrumbsComponent {...this.props} {...breadcrumbsProps} />
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
                    refFwd={this.metafeaturesTableRef}
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
                    {differentialPlotDescription ? (
                      <>
                        <Popup
                          trigger={
                            <Dropdown
                              search
                              selection
                              compact
                              options={options}
                              value={activeTabIndexPlotsOverlayVar}
                              onChange={this.handlePlotDropdownChange}
                            />
                          }
                          basic
                          inverted
                          position="right center"
                          closeOnDocumentClick
                          closeOnEscape
                          hideOnScroll
                        >
                          <Popup.Content>
                            {differentialPlotDescription}
                          </Popup.Content>
                        </Popup>
                        <TabOverlay
                          {...this.props}
                          {...this.state}
                          differentialPlotsOverlayRefFwd={
                            this.differentialPlotsOverlayRef
                          }
                          ref={this.metafeaturesTableRef}
                          // DEV - add only necessary props
                          // activeTabIndexPlotsMultiFeature={activeTabIndexPlotsMultiFeature}
                          // differentialDetailPlotsMultiFeatureRefFwd={
                          //   this.differentialDetailPlotsMultiFeatureRef
                          // }
                          // differentialHighlightedFeaturesData={
                          //   differentialHighlightedFeaturesData
                          // }
                          // divHeight={divHeight}
                          // divWidth={divWidth}
                          // differentialPlotTypes={differentialPlotTypes}
                          // differentialStudy={differentialStudy}
                          // differentialModel={differentialModel}
                          // differentialTest={differentialTest}
                          // plotlyExport={plotlyExport}
                          // plotlyExportType={plotlyExportType}
                          // plotMultiFeatureData={plotMultiFeatureData}
                          // pointSize={pointSize}
                          // plotMultiFeatureDataLength={plotMultiFeatureDataLength}
                          // pxToPtRatio={pxToPtRatio}
                          // multiFeaturePlotTypes={multiFeaturePlotTypes}
                          // svgTabMax={svgTabMax}
                        />
                      </>
                    ) : (
                      <>
                        <Dropdown
                          search
                          selection
                          compact
                          options={options}
                          value={activeTabIndexPlotsOverlayVar}
                          onChange={this.handlePlotDropdownChange}
                        />
                        <TabOverlay
                          {...this.props}
                          {...this.state}
                          differentialPlotsOverlayRefFwd={
                            this.differentialPlotsOverlayRef
                          }
                          ref={this.metafeaturesTableRef}
                          // DEV - add only necessary props
                        />
                      </>
                    )}
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
