import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab, Dropdown } from 'semantic-ui-react';
import DifferentialBreadcrumbs from './DifferentialBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTable from './MetafeaturesTable';
import { omicNavigatorService } from '../../services/omicNavigator.service';
// import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import '../Enrichment/SplitPanesContainer.scss';
import '../Shared/SVGPlot.scss';
import './DifferentialPlot.scss';

class DifferentialPlot extends PureComponent {
  constructor(props) {
    super(props);
    // this.resizeListener = this.resizeListener.bind(this);
    // this.debouncedResizeListener = _.debounce(this.resizeListener, 100);
    this.state = {
      // activeSVGTabIndexDifferential: 0,
      excelFlag: true,
      pngFlag: true,
      pdfFlag: false,
      svgFlag: true,
      txtFlag: false,
      // areDifferentialPlotTabsReady: false,
      // selectedPlot: null,
    };
  }
  metaFeaturesTableRef = React.createRef();

  componentDidMount() {
    const { activeSVGTabIndexDifferential } = this.state;
    this.setButtonVisibility(activeSVGTabIndexDifferential);
    this.getSVGPanes();
    // window.addEventListener('resize', this.debouncedResizeListener);
  }

  componentDidUpdate(prevProps, prevState) {
    const { imageInfoDifferentialLength, isItemSVGLoaded } = this.props;
    const { activeSVGTabIndexDifferential } = this.state;
    if (
      isItemSVGLoaded &&
      prevProps.imageInfoDifferentialLength !== imageInfoDifferentialLength
    ) {
      this.getSVGPanes();
    }
    if (
      prevState.activeSVGTabIndexDifferential !== activeSVGTabIndexDifferential
    ) {
      this.setButtonVisibility(activeSVGTabIndexDifferential);
    }
  }

  componentWillUnmount() {
    // window.removeEventListener('resize', this.debouncedResizeListener);
  }

  // resizeListener() {
  //   this.getSVGPanes();
  // }

  setButtonVisibility = index => {
    if (this.props.differentialPlotTypes.length > 0) {
      const singleFeaturePlotTypes = this.props.differentialPlotTypes.filter(
        p => p.plotType !== 'multiFeature',
      );
      this.setState({
        excelFlag: index === singleFeaturePlotTypes.length,
        txtFlag: index === singleFeaturePlotTypes.length,
        pdfFlag: false,
        svgFlag: index !== singleFeaturePlotTypes.length,
        pngFlag: index !== singleFeaturePlotTypes.length,
      });
    } else {
      this.setState({
        excelFlag: false,
        pdfFlag: false,
        svgFlag: false,
        pngFlag: false,
      });
    }
  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({
      activeSVGTabIndexDifferential: activeIndex,
    });
  };

  handlePlotDropdownChange = (e, { value }) => {
    this.setState({
      activeSVGTabIndexDifferential: value,
    });
  };

  async getSVGPanes() {
    let panes = [];
    if (this.props.imageInfoDifferential) {
      if (this.props.imageInfoDifferential.svg.length !== 0) {
        const svgArray = [...this.props.imageInfoDifferential.svg];
        const svgPanes = svgArray.map(s => {
          return {
            menuItem: `${s.plotType.plotDisplay}`,
            render: () => (
              <Tab.Pane attached="true" as="div">
                <div
                  id="DifferentialPlotTabsPlotSVGDiv"
                  className="svgSpan"
                  dangerouslySetInnerHTML={{ __html: s.svg }}
                ></div>
              </Tab.Pane>
            ),
          };
        });
        panes = panes.concat(svgPanes);
      }
    }
    const isMultifeaturePlot =
      this.props.imageInfoDifferential.key?.includes('features') || false;
    if (
      this.props.modelSpecificMetaFeaturesExist !== false &&
      !isMultifeaturePlot
    ) {
      let metaFeaturesData = await omicNavigatorService.getMetaFeaturesTable(
        this.props.differentialStudy,
        this.props.differentialModel,
        this.props.differentialFeature,
        this.handleGetMetaFeaturesTableError,
      );
      let metaFeaturesDataDifferential =
        metaFeaturesData != null ? metaFeaturesData : [];
      let metafeaturesTab = [
        {
          menuItem: 'Feature Data',
          render: () => (
            <Tab.Pane attached="true" as="div">
              <MetafeaturesTable
                ref={this.metaFeaturesTableRef}
                metaFeaturesData={metaFeaturesDataDifferential}
                // differentialFeature={this.props.differentialFeature}
                // isItemSVGLoaded={this.props.isItemSVGLoaded}
              />
            </Tab.Pane>
          ),
        },
      ];
      panes = panes.concat(metafeaturesTab);
    }
    // return panes;
    this.setState({
      svgPanes: panes,
    });
  }

  render() {
    const {
      excelFlag,
      pngFlag,
      pdfFlag,
      txtFlag,
      svgFlag,
      svgPanes,
      activeSVGTabIndexDifferential,
    } = this.state;
    const {
      isItemSVGLoaded,
      imageInfoDifferential,
      tab,
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;
    if (!isItemSVGLoaded) {
      return (
        // <LoaderActivePlots />
        <div className="PlotsMetafeaturesDimmer">
          <Dimmer active inverted>
            <Loader size="large">Loading...</Loader>
          </Dimmer>
        </div>
      );
    } else {
      if (
        this.props.differentialPlotTypes &&
        this.props.imageInfoDifferential
      ) {
        const DropdownClass =
          this.props.differentialPlotTypes.length > this.props.svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClass =
          this.props.differentialPlotTypes.length > this.props.svgTabMax
            ? 'Hide'
            : 'Show';
        const activeSVGTabIndexDifferentialVar =
          activeSVGTabIndexDifferential || 0;
        let plotOptions = [];
        if (this.props.imageInfoDifferential.length !== 0) {
          const svgArray = [...imageInfoDifferential.svg];
          plotOptions = svgArray.map(function(s, index) {
            return {
              key: `${index}=DifferentialPlotDropdownOption`,
              text: s.plotType.plotDisplay,
              value: index,
            };
          });
          if (this.props.modelSpecificMetaFeaturesExist !== false) {
            let metafeaturesDropdown = [
              {
                key: 'Feature-Data-Differential-Plot',
                text: 'Feature Data',
                value: 'Feature Data',
              },
            ];
            plotOptions = plotOptions.concat(metafeaturesDropdown);
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
                    imageInfo={imageInfoDifferential}
                    tabIndex={activeSVGTabIndexDifferentialVar}
                    plot={'DifferentialPlotTabsPlotSVGDiv'}
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
                      options={plotOptions}
                      value={
                        plotOptions[activeSVGTabIndexDifferentialVar]?.value ||
                        0
                      }
                      onChange={this.handlePlotDropdownChange}
                      className={DropdownClass}
                    />
                    <Tab
                      menu={{
                        secondary: true,
                        pointing: true,
                        className: TabMenuClass,
                      }}
                      panes={svgPanes}
                      onTabChange={this.handleTabChange}
                      activeIndex={activeSVGTabIndexDifferentialVar}
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

export default withRouter(DifferentialPlot);
