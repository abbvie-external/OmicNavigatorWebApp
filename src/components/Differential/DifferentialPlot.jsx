import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab, Dropdown, Menu } from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
// import { loadingDimmer } from '../Shared/helpers';
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
    // activeSVGTabIndexDifferential: 0,
    excelFlag: true,
    pngFlag: true,
    pdfFlag: false,
    svgFlag: true,
    txtFlag: false,
    // areDifferentialPlotTabsReady: false,
    // selectedPlot: null,
  };

  componentDidMount() {
    const { activeSVGTabIndexDifferential } = this.state;
    this.setButtonVisibility(activeSVGTabIndexDifferential);
    const svgPanesVar = this.getSVGPanes(activeSVGTabIndexDifferential);
    this.setState({
      // isSVGReadyDifferential: true,
      svgPanes: svgPanesVar,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { imageInfoDifferentialLength, isItemSVGLoaded } = this.props;
    const { activeSVGTabIndexDifferential } = this.state;
    if (
      isItemSVGLoaded &&
      prevProps.imageInfoDifferentialLength !== imageInfoDifferentialLength
    ) {
      const svgPanesVar = this.getSVGPanes(activeSVGTabIndexDifferential);
      this.setState({
        svgPanes: svgPanesVar,
      });
    }
    if (
      prevState.activeSVGTabIndexDifferential !== activeSVGTabIndexDifferential
    ) {
      this.setButtonVisibility(activeSVGTabIndexDifferential);
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
      activeSVGTabIndexDifferential: activeIndex,
    });
  };

  handlePlotDropdownChange = (e, { value }) => {
    this.setState({
      activeSVGTabIndexDifferential: value,
    });
  };

  getSVGPanes(activeSVGTabIndexDifferential) {
    let panes = [];
    if (this.props.imageInfoDifferential.length !== 0) {
      const svgArray = [...this.props.imageInfoDifferential.svg];
      const svgPanes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div id="DifferentialPlotTabsPlotSVG" className="svgSpan">
                <SVG
                  cacheRequests={true}
                  // description=""
                  // loader={<span>{loadingDimmer}</span>}
                  // onError={error => console.log(error.message)}
                  // onLoad={(src, hasCache) => console.log(src, hasCache)}
                  // preProcessor={code => code.replace(/fill=".*?"/g, 'fill="currentColor"')}
                  src={s.svg}
                  // title={`${s.plotType.plotDisplay}`}
                  uniqueHash="c3h0f3"
                  uniquifyIDs={true}
                />
              </div>
            </Tab.Pane>
          ),
        };
      });
      panes = panes.concat(svgPanes);
    }
    if (this.props.modelSpecificMetaFeaturesExist !== false) {
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
    return panes;
  }

  render() {
    const {
      excelFlag,
      pngFlag,
      pdfFlag,
      svgFlag,
      svgPanes,
      activeSVGTabIndexDifferential,
    } = this.state;
    const { isItemSVGLoaded, imageInfoDifferential } = this.props;
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
              key: this.props.imageInfoDifferential.svg.length,
              text: 'Feature Data',
              value: this.props.imageInfoDifferential.svg.length,
            },
          ];
          plotOptions = plotOptions.concat(metafeaturesDropdown);
        }
      }
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
                  tabIndex={activeSVGTabIndexDifferentialVar}
                  plot={'DifferentialPlotTabsPlotSVG'}
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
                <div className="">
                  <Dropdown
                    search
                    selection
                    compact
                    options={plotOptions}
                    value={
                      plotOptions[activeSVGTabIndexDifferentialVar]?.value || 0
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
    }
  }
}

export default withRouter(DifferentialPlot);
