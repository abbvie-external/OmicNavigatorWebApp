import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab } from 'semantic-ui-react';
import DifferentialBreadcrumbs from './DifferentialBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTable from './MetafeaturesTable';
// import LoaderActivePlots from '../Transitions/LoaderActivePlots';
import '../Enrichment/SplitPanesContainer.scss';
import '../Shared/SVGPlot.scss';
import './DifferentialPlot.scss';

class DifferentialPlot extends Component {
  static defaultProps = {
    // isItemDatatLoaded: false,
    // isItemSVGLoaded: true,
  };

  state = {
    activeDifferentialPlotTabsIndex: 0,
    excelFlag: true,
    pngFlag: true,
    pdfFlag: false,
    svgFlag: true,
    txtFlag: false,
    areDifferentialPlotTabsReady: false,
  };

  componentDidMount() {
    this.setButtonVisibility(this.state.activeDifferentialPlotTabsIndex);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.activeDifferentialPlotTabsIndex !==
      prevState.activeDifferentialPlotTabsIndex
    ) {
      this.setButtonVisibility(this.state.activeDifferentialPlotTabsIndex);
    }
  }

  setButtonVisibility = index => {
    if (this.props.differentialPlotTypes.length > 0) {
      const singleFeaturePlotTypes = this.props.differentialPlotTypes.filter(
        p => p.plotType !== 'multiFeature',
      );
      this.setState({
        excelFlag: false,
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
      activeDifferentialPlotTabsIndex: activeIndex,
    });
  };

  getSVGPanes(activeDifferentialPlotTabsIndex) {
    let panes = [];
    if (this.props.imageInfoDifferential.length !== 0) {
      const svgArray = this.props.imageInfoDifferential.svg;
      // const svgArrayReversed = svgArray.reverse();
      const svgPanes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div
                id="DifferentialPlotTabsPlotSVG"
                className="svgSpan"
                dangerouslySetInnerHTML={{ __html: s.svg }}
              ></div>
            </Tab.Pane>
          ),
        };
      });
      panes = panes.concat(svgPanes);
    }
    const isMultifeaturePlot =
      this.props.imageInfoDifferential.key?.includes('multifeature') || false;
    if (
      this.props.modelSpecificMetaFeaturesExist !== false &&
      !isMultifeaturePlot
    ) {
      let metafeaturesTab = [
        {
          menuItem: 'Feature Data',
          render: () => (
            <Tab.Pane attached="true" as="div">
              <MetafeaturesTable
                metaFeaturesData={this.props.metaFeaturesDataDifferential}
              />
            </Tab.Pane>
          ),
        },
      ];
      panes = panes.concat(metafeaturesTab);
    }
    return (
      <Tab
        menu={{ secondary: true, pointing: true, className: 'SVGDiv' }}
        panes={panes}
        onTabChange={this.handleTabChange}
        activeIndex={activeDifferentialPlotTabsIndex}
      />
    );
  }

  render() {
    // const { activeDifferentialPlotTabsIndex } = this.state;
    const { excelFlag, pngFlag, pdfFlag, svgFlag } = this.state;
    const { isItemSVGLoaded, imageInfoDifferential } = this.props;
    const { activeDifferentialPlotTabsIndex } = this.state;
    const svgPanes = this.getSVGPanes(activeDifferentialPlotTabsIndex);
    if (!isItemSVGLoaded) {
      return (
        // <LoaderActivePlots />
        <div className="PlotsMetafeaturesDimmer">
          <Dimmer active inverted>
            <Loader size="large">Loading Plots and Feature Data...</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return (
        <div className="PlotWrapper">
          <Grid columns={2} className="">
            <Grid.Row className="ActionsRow">
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <DifferentialBreadcrumbs {...this.props} />
              </Grid.Column>
              <Grid.Column mobile={8} tablet={8} largeScreen={8} widescreen={8}>
                <ButtonActions
                  exportButtonSize={'small'}
                  excelVisible={excelFlag}
                  pngVisible={pngFlag}
                  pdfVisible={pdfFlag}
                  svgVisible={svgFlag}
                  txtVisible={false}
                  imageInfo={imageInfoDifferential}
                  tabIndex={activeDifferentialPlotTabsIndex}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <Grid columns={2} className="PlotContainer">
            <Grid.Row className="PlotContainerRow">
              <Grid.Column
                mobile={16}
                tablet={16}
                largeScreen={16}
                widescreen={16}
              >
                <div className="">{svgPanes}</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      );
    }
  }
}

export default withRouter(DifferentialPlot);
