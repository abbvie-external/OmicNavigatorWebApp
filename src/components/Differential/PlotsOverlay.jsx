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
import '../Shared/Plotly.scss';

class PlotsOverlay extends PureComponent {
  constructor(props) {
    super(props);
    // this.resizeListener = this.resizeListener.bind(this);
    // this.debouncedResizeListener = _.debounce(this.resizeListener, 100);
    this.state = {
      // activeTabIndexPlotsOverlay: 0,
      excelFlag: true,
      pngFlag: true,
      pdfFlag: false,
      svgFlag: true,
      txtFlag: false,
    };
  }
  metaFeaturesTableRef = React.createRef();
  svgContainerRef = React.createRef();

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

  getWidth() {
    if (this.svgContainerRef.current !== null) {
      return this.svgContainerRef.current.parentElement.offsetWidth;
    }
    return 1200;
  }

  getHeight() {
    if (this.svgContainerRef.current !== null) {
      return this.svgContainerRef.current.parentElement.offsetWidth;
    }
    return 1200;
  }

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
      let panes = [];
      let options = [];
      if (this.props.plotOverlayData) {
        if (this.props.plotOverlayData.svg.length !== 0) {
          const svgArray = [...this.props.plotOverlayData.svg];
          const svgPanes = svgArray.map(s => {
            const isPlotlyPlot = s.plotType.plotType.includes('plotly');
            const svgContainerWidth = this.getWidth();
            const svgContainerHeight = this.getHeight();
            return {
              menuItem: `${s.plotType.plotDisplay}`,
              render: () => (
                <Tab.Pane attached="true" as="div">
                  {isPlotlyPlot ? (
                    <div
                      id="PlotsOverlayContainer"
                      className="svgSpan"
                      ref={this.svgContainerRef}
                    >
                      <PlotlyOverlay
                        plotlyData={s.svg}
                        height={svgContainerHeight}
                        width={svgContainerWidth}
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
          });
          const plotOptions = svgArray.map(function(s, index) {
            return {
              key: `${index}=DifferentialPlotDropdownOption`,
              text: s.plotType.plotDisplay,
              value: index,
            };
          });
          panes = panes.concat(svgPanes);
          options = options.concat(plotOptions);
        }
      }
      const isMultifeaturePlot =
        this.props.plotOverlayData.key?.includes('features') || false;
      if (
        this.props.modelSpecificMetaFeaturesExist !== false &&
        !isMultifeaturePlot
      ) {
        // METAFEATURES TAB ONLY AVAILABLE WHEN MODEL SPECIFIC METAFEATURES EXIST, FOR SINGLE FEATURE PLOTS
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
        const singleFeaturePlotTypes = this.props.differentialPlotTypes.filter(
          p => p.plotType !== 'multiFeature',
        );
        let metafeaturesDropdown = [
          {
            key: 'Feature-Data-Differential-Plot',
            text: 'Feature Data',
            value: singleFeaturePlotTypes.length,
          },
        ];
        panes = panes.concat(metafeaturesTab);
        options = options.concat(metafeaturesDropdown);
        // }
      }
      if (this.props.differentialPlotTypes && this.props.plotOverlayData) {
        const DropdownClass =
          this.props.differentialPlotTypes.length > this.props.svgTabMax
            ? 'Show svgPlotDropdownInOverlay'
            : 'Hide svgPlotDropdownInOverlay';
        const TabMenuClass =
          this.props.differentialPlotTypes.length > this.props.svgTabMax
            ? 'Hide'
            : 'Show';
        const activeTabIndexPlotsOverlayVar = activeTabIndexPlotsOverlay || 0;
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
                  <div className="">
                    <Dropdown
                      search
                      selection
                      compact
                      options={options}
                      value={options[activeTabIndexPlotsOverlayVar]?.value || 0}
                      onChange={this.handlePlotDropdownChange}
                      className={DropdownClass}
                    />
                    <Tab
                      menu={{
                        secondary: true,
                        pointing: true,
                        className: TabMenuClass,
                      }}
                      panes={panes}
                      onTabChange={this.handleTabChange}
                      activeIndex={activeTabIndexPlotsOverlayVar}
                    />
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        );
      } else return null;
    }
  }
}

export default withRouter(PlotsOverlay);
