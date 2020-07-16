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

  //componentDidUpdate = (prevProps, prevState) => {
  // if (this.props.imageInfo.svg !== prevProps.imageInfo.svg) {
  //   this.setState({
  //     isSVGReady: false,
  //   });
  //   this.getSVGPanes();
  // }
  //};

  handleTabChange = (e, { activeIndex }) => {
    this.props.onSVGTabChange(activeIndex);
  };

  handleDiffTable = evt => {
    const key = this.props.imageInfo.key.split(':');
    const name = key[0] || '';
    const diffProtein = this.props.HighlightedProteins[0].sample;
    this.props.onViewDiffTable(name, diffProtein);
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
          menuItem: `${s.plotType.plotID}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div
                id="PlotSVG"
                className="svgSpan"
                dangerouslySetInnerHTML={{ __html: s.svg }}
              ></div>
            </Tab.Pane>
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
    if (!this.state.isSVGReady) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">SVG Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
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
                onClick={this.handleDiffTable}
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
    }
  }
}

export default SVGPlot;
