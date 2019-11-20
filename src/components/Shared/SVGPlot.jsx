import React, { Component } from 'react';
import { Loader, Dimmer, Tab } from 'semantic-ui-react';
import './SVGPlot.scss';

class SVGPlot extends Component {
  constructor(props) {
    super(props);
    debugger;
    this.state = {
      isSVGReady: false
    };
  }

  componentDidMount() {
    this.setState({
      isSVGReady: true
    });
  }

  handleTabChange = (e, { activeIndex }) => {
    this.props.onSVGTabChange(activeIndex);
  };

  getSVGPanes(activeSVGTabIndex) {
    debugger;
    if (this.props.imageInfo) {
      const svgArray = this.props.imageInfo.svg;
      const panes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType}`,
          render: () => (
            <Tab.Pane attached="true" as="div">
              <div
                id="PlotSVG"
                className="svgSpan"
                dangerouslySetInnerHTML={{ __html: s.svg }}
              ></div>
            </Tab.Pane>
          )
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
    }
  }

  render() {
    const { activeSVGTabIndex } = this.props;
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
      return <div className="svgContainer">{svgPanes}</div>;
    }
  }
}

export default SVGPlot;
