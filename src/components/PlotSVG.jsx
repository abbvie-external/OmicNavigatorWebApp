import React, { Component } from 'react';
import { Segment, Loader, Dimmer, Tab } from 'semantic-ui-react';
import _ from 'lodash';

class PlotSVG extends Component {
  constructor(props) {
    super(props);
    let index = 1;
    this.state = {
      isSVGReady: false,
      tab: { activeIndex: index }
    };
    this.getSVGPanes = this.getSVGPanes.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      isSVGReady: true
    });
  }

  handleTabChange = (e, { activeIndex }) => {
    debugger;
    this.setState({ activeIndex });
  };

  parseSVG(svg) {
    let domparser = new DOMParser();
    let parsedSVG = domparser.parseFromString(svg, 'image/svg+xml');
    return parsedSVG;
  }

  getSVGPanes() {
    if (this.props.imageInfo) {
      const imageInfoArray = this.props.imageInfo;
      const svgArray = this.props.imageInfo.svg;
      const panes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType}`,
          render: () => (
            <Tab.Pane attached={false}>
              <div
                className="svgSpan"
                dangerouslySetInnerHTML={{ __html: s.svg }}
              ></div>
            </Tab.Pane>
          )

          // render: () => <Tab.Pane attached={false}>{this.parseSVG(s.svg)}</Tab.Pane>,

          // pane: (
          // <Tab.Pane attached={false}>
          // {this.parseSVG(s.svg)}
          // </Tab.Pane>
        };
      });

      return (
        <Tab
          menu={{ secondary: true, pointing: true, className: 'SVGDiv' }}
          panes={panes}
        />
      );
    }
  }

  render() {
    // const { activeIndex } = this.state;
    const svgPanes = this.getSVGPanes();
    if (!this.state.isSVGReady) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader size="large">Data Loading</Loader>
          </Dimmer>
        </div>
      );
    } else {
      return <div className="svgContainer">{svgPanes}</div>;
    }
  }
}

export default PlotSVG;
