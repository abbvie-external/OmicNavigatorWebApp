import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Grid, Dimmer, Loader, Tab, Dropdown, Menu } from 'semantic-ui-react';
import { ReactSVG } from 'react-svg';
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
    // activeDifferentialPlotTabsIndex: 0,
    excelFlag: true,
    pngFlag: true,
    pdfFlag: false,
    svgFlag: true,
    txtFlag: false,
    // areDifferentialPlotTabsReady: false,
    // selectedPlot: null,
  };

  componentDidMount() {
    const { activeDifferentialPlotTabsIndex } = this.state;
    this.setButtonVisibility(activeDifferentialPlotTabsIndex);
    const svgPanesVar = this.getSVGPanes(activeDifferentialPlotTabsIndex);
    this.setState({
      isSVGReady: true,
      svgPanes: svgPanesVar,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { imageInfoDifferential, isItemSVGLoaded } = this.props;
    const { activeDifferentialPlotTabsIndex } = this.state;
    if (
      isItemSVGLoaded &&
      (prevState.activeDifferentialPlotTabsIndex !==
        activeDifferentialPlotTabsIndex ||
        prevProps.imageInfoDifferential !== imageInfoDifferential)
    ) {
      const svgPanesVar = this.getSVGPanes(activeDifferentialPlotTabsIndex);
      this.setState({
        svgPanes: svgPanesVar,
      });
    }
    if (
      prevState.activeDifferentialPlotTabsIndex !==
      activeDifferentialPlotTabsIndex
    ) {
      this.setButtonVisibility(activeDifferentialPlotTabsIndex);
    }
  }

  setButtonVisibility = index => {
    this.setState({
      excelFlag: false,
      pdfFlag: false,
      svgFlag: index !== this.props.imageInfoDifferential.svg.length,
      pngFlag: index !== this.props.imageInfoDifferential.svg.length,
    });
  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({
      activeDifferentialPlotTabsIndex: activeIndex,
    });
  };

  handlePlotDropdownChange = (e, { value }) => {
    debugger;
    this.setState({
      activeDifferentialPlotTabsIndex: value,
    });
  };

  getSVGPanes(activeDifferentialPlotTabsIndex) {
    console.log('psul');
    let panes = [];
    let plotOptions = [];
    if (this.props.imageInfoDifferential.length !== 0) {
      const svgArray = [...this.props.imageInfoDifferential.svg];
      plotOptions = svgArray.map(function(s, index) {
        return {
          key: `${index}=DifferentialPlotDropdownOption`,
          text: s.plotType.plotDisplay,
          value: index,
        };
      });
      // const svgArrayReversed = svgArray.reverse();
      const svgPanes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div id="DifferentialPlotTabsPlotSVG" className="svgSpan">
                <ReactSVG src={s.svg} />
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
      let metafeaturesDropdown = [
        {
          key: this.props.imageInfoDifferential.svg.length,
          text: 'Feature Data',
          value: this.props.imageInfoDifferential.svg.length,
        },
      ];
      plotOptions = plotOptions.concat(metafeaturesDropdown);
    }
    const TabMenuClass =
      this.props.differentialPlotTypes.length > 4 ? 'Hide' : 'Show';
    const indexVar = activeDifferentialPlotTabsIndex || 0;
    return (
      <Fragment>
        <Dropdown
          onChange={this.handlePlotDropdownChange}
          search
          options={plotOptions}
          selection
          value={plotOptions[indexVar].value}
          className={
            this.props.differentialPlotTypes.length > 4 ? 'Show' : 'Hide'
          }
        />
        <Tab
          menu={{ secondary: true, pointing: true, className: TabMenuClass }}
          panes={panes}
          onTabChange={this.handleTabChange}
          activeIndex={indexVar}
        />
      </Fragment>
    );

    // if (this.props.imageInfoDifferential.length !== 0) {
    //   const svgArray = [...this.props.imageInfoDifferential.svg];
    //   const plotOptions = svgArray.map(function(s, index) {
    //     return {
    //       key: index,
    //       text: s.plotType.plotDisplay,
    //       value: s.plotType.plotDisplay,
    //     };
    //   });
    //   return (
    //     <Grid>
    //       <Grid.Column
    //         className=""
    //         mobile={16}
    //         tablet={16}
    //         computer={16}
    //         largeScreen={16}
    //         widescreen={16}
    //       >
    //         <Dropdown
    //           // onChange={this.handlePlotChange}
    //           // search
    //           options={plotOptions}
    //           // selection
    //           defaultValue={plotOptions[0]}
    //           // value={this.state.selectedPlot}
    //         />
    //         <p>SVG Goes Here</p>
    //       </Grid.Column>
    //     </Grid>
    //   );
    // }
  }

  render() {
    // const { activeDifferentialPlotTabsIndex } = this.state;
    const { excelFlag, pngFlag, pdfFlag, svgFlag, svgPanes } = this.state;
    const {
      isItemSVGLoaded,
      imageInfoDifferential,
      activeDifferentialPlotTabsIndex,
    } = this.props;
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
