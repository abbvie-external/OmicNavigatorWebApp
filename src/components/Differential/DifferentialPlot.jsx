import React, { Fragment, PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Grid,
  Dimmer,
  Loader,
  Tab,
  Dropdown,
  Segment,
  Header,
} from 'semantic-ui-react';
import DifferentialBreadcrumbs from './DifferentialBreadcrumbs';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTable from './MetafeaturesTable';
import { HTMLHeatmap, HTMLScatterplot } from '../Shared/PlotlyExamples';
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
      plotOptions: [],
      plotlyGraphHTML: null,
    };
  }
  metaFeaturesTableRef = React.createRef();

  componentDidMount() {
    const { activeSVGTabIndexDifferential } = this.state;
    this.setButtonVisibility(activeSVGTabIndexDifferential);
    this.getSVGPanes();
    // const plotlyGraphHTML = HTMLHeatmap;
    const plotlyGraphHTML = HTMLScatterplot;
    this.setState({
      plotlyGraphHTML,
    });
  }

  handlePlotlyBoxSelect = selectedData => {
    console.log('box selected data', selectedData);
  };

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
    if (!this.state.listenerSetup) {
      let self = this;
      setTimeout(function() {
        let iframe = document.getElementById('PlotlyGraphIframe');
        if (iframe?.contentWindow?.document) {
          const div = iframe.contentWindow.document.querySelector(
            '.html-widget',
          );
          let widget = document
            .getElementById('PlotlyGraphIframe')
            .contentWindow.document.getElementById(
              div?.id,
              // 'htmlwidget-ad061a1115bef5791c2e',
            );
          if (widget) {
            let data = widget.data[0] || [];
            self.setState({
              allPlotlyData: data,
            });
            widget.on('plotly_selected', function(data) {
              self.handlePlotlyBoxSelect(data);
            });
          }
          self.setState({
            listenerSetup: true,
          });
        }
      }, 1000);
    }
  }

  componentWillUnmount() {}

  setButtonVisibility = index => {
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
    let options = [];
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
      this.props.imageInfoDifferential.key?.includes('features') || false;
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
                ref={this.metaFeaturesTableRef}
                differentialStudy={this.props.differentialStudy}
                differentialModel={this.props.differentialModel}
                differentialFeature={this.props.differentialFeature}
                isItemSVGLoaded={this.props.isItemSVGLoaded}
                imageInfoDifferential={this.props.imageInfoDifferential}
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
    this.setState({
      svgPanes: panes,
      plotOptions: options,
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
      plotOptions,
      activeSVGTabIndexDifferential,
      // plotlyJsGraph,
      plotlyGraphHTML,
      resizableIframeWithHTML,
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
            ? 'Show svgPlotDropdownInOverlay'
            : 'Hide svgPlotDropdown';
        const TabMenuClass =
          this.props.differentialPlotTypes.length > this.props.svgTabMax
            ? 'Hide'
            : 'Show';
        const activeSVGTabIndexDifferentialVar =
          activeSVGTabIndexDifferential || 0;
        return (
          <>
            {/* <div className="PlotWrapper">
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
                        this.metaFeaturesTableRef.current
                          ?.metafeaturesGridRef || null
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
                          plotOptions[activeSVGTabIndexDifferentialVar]
                            ?.value || 0
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
            </div> */}
            <div>
              <Segment>
                <Header>ALL DATA</Header>
                {JSON.stringify(this.state.allPlotlyData)}
              </Segment>
              <Segment>
                {' '}
                <Header>SELECTED DATA</Header>
                {JSON.stringify(this.state.selectedPlotlyData)}
              </Segment>
              <iframe
                width={
                  window.innerWidth - 300 ||
                  document.documentElement.clientWidth - 300
                }
                height={
                  window.innerHeight - 300 ||
                  document.documentElement.clientHeight - 300
                }
                id="PlotlyGraphIframe"
                title="plotlyGraphyHTML"
                srcDoc={plotlyGraphHTML}
                onChange={this.plotChanged}
                allowFullScreen={true}
                name="plotlyGraphName"
              />
            </div>
          </>
        );
      } else return null;
    }
  }
}

export default withRouter(DifferentialPlot);
