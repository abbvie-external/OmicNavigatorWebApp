import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Dropdown } from 'semantic-ui-react';
import DifferentialBreadcrumbs from './DifferentialBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import TabOverlay from './TabOverlay';
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
    this.metafeaturesTableRef = React.createRef();
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
      const isMultifeaturePlot =
        this.props.plotOverlayData.key?.includes('features') || false;
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
    this.setState({
      activeTabIndexPlotsOverlay: value,
    });
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
                    <Dropdown
                      search
                      selection
                      compact
                      options={options}
                      value={options[activeTabIndexPlotsOverlayVar]?.value || 0}
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
