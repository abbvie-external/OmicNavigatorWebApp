import React, { Component } from 'react';
import { Loader, Dimmer, Tab, Popup, Icon, Message } from 'semantic-ui-react';
import ButtonActions from '../Shared/ButtonActions';
// import * as d3 from 'd3';
import './SVGPlot.scss';

class SVGPlot extends Component {
  state = {
    isSVGReady: false,
  };

  componentDidMount() {
    this.setState({
      isSVGReady: true,
    });
  }

  // componentDidUpdate = (prevProps, prevState) => {
  //   if (this.props.SVGPlotLoaded !== prevProps.SVGPlotLoaded) {
  //     this.setState({
  //       isSVGReady: false,
  //     });
  //     this.getSVGPanes();
  //   }
  // };

  handleTabChange = (e, { activeIndex }) => {
    this.props.onSVGTabChange(activeIndex);
  };

  navigateToDifferentialFeature = evt => {
    const testAndDescription = this.props.imageInfo.key.split(':');
    const test = testAndDescription[0] || '';
    const featureID = this.props.HighlightedProteins[0]?.featureID;
    this.props.onFindDifferentialFeature(test, featureID);
  };

  getSVGPanes(activeSVGTabIndex) {
    // const BreadcrumbPopupStyle = {
    //   backgroundColor: "2E2E2E",
    //   borderBottom: "2px solid var(--color-primary)",
    //   color: "#FFF",
    //   padding: "1em",
    //   maxWidth: "50vw",
    //   fontSize: "13px",
    //   wordBreak: "break-all"
    // };
    if (this.props.imageInfo.length !== 0) {
      const svgArray = this.props.imageInfo.svg;
      // const svgArrayReversed = svgArray.reverse();
      const panes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div
                id="PlotSVG"
                className="svgSpan"
                dangerouslySetInnerHTML={{ __html: s.svg }}
              ></div>
            </Tab.Pane>
            //   const viewbox = `0 0 ${this.props.enrichmentPlotSVGWidth} ${this.props.enrichmentPlotSVGHeight}`;
            //   <svg
            //   version="1.1"
            //   viewBox={viewbox}
            //   height={this.props.enrichmentPlotSVGHeight}
            //   width={this.props.enrichmentPlotSVGHeight}
            //   xmlns="http://www.w3.org/2000/svg"
            //   id="currentSVG-20750-0"
            //   preserveAspectRatio="xMinYMin meet"
            // >
            //   {s.svg}
            //</svg>
          ),
        };
      });

      return (
        <Tab
          menu={{ secondary: true, pointing: true, className: 'SVGDiv' }}
          panes={panes}
          onTabChange={this.handleTabChange}
          activeIndex={activeSVGTabIndex}
        />
      );
    } else {
      return (
        <Message
          className="NoPlotsMessage"
          icon="question mark"
          header="No Plots Available"
          // content="add description/instructions"
        />
      );
    }
  }

  getButtonActionsClass = () => {
    // if (
    // this.props.activeIndex === 1 &&
    // this.props.activeIndexDifferentialView === 0
    // this.props.tab === 'differential'
    // ) {
    // return 'export-svg Hide';
    // } else {
    return 'export-svg ShowBlock';
    // }
  };

  render() {
    if (this.state.isSVGReady) {
      const { activeSVGTabIndex } = this.props;
      const ButtonActionsClass = this.getButtonActionsClass();

      const BreadcrumbPopupStyle = {
        backgroundColor: '2E2E2E',
        borderBottom: '2px solid var(--color-primary)',
        color: '#FFF',
        padding: '1em',
        maxWidth: '50vw',
        fontSize: '13px',
        wordBreak: 'break-all',
      };
      const svgPanes = this.getSVGPanes(activeSVGTabIndex);
      return (
        <div className="svgContainer">
          <div className={ButtonActionsClass}>
            <ButtonActions
              excelVisible={false}
              pdfVisible={false}
              exportButtonSize="mini"
            />
          </div>
          <Popup
            trigger={
              <Icon
                name="bullseye"
                size="large"
                onClick={this.navigateToDifferentialFeature}
                className="DiffTableIcon"
              />
            }
            style={BreadcrumbPopupStyle}
            inverted
            basic
            position="bottom left"
            content="view in differential analysis section"
          />
          {svgPanes}
        </div>
      );
    } else {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">SVG Loading</Loader>
          </Dimmer>
        </div>
      );
    }
  }
}

export default SVGPlot;
