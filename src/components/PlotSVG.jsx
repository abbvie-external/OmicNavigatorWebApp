import React, { Component } from 'react';
import { Loader, Dimmer, Tab } from 'semantic-ui-react';
// import _ from 'lodash';

class PlotSVG extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSVGReady: false
    };
    // this.getSVGPanes = this.getSVGPanes.bind(this);
    // this.handleTabChange = this.handleTabChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      isSVGReady: true
    });
  }

  handleTabChange = (e, { activeIndex }) => {
    debugger;
    this.props.onSVGTabChange(activeIndex);
  };

  getSVGPanes(activeSVGTabIndex) {
    if (this.props.imageInfo) {
      // const imageInfoArray = this.props.imageInfo;
      const svgArray = this.props.imageInfo.svg;
      const panes = svgArray.map(s => {
        return {
          menuItem: `${s.plotType}`,
          render: () => (
            <Tab.Pane attached={false} as={'string'}>
              <div
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
          defaultActiveIndex={0}
          activeIndex={activeSVGTabIndex}
        />
      );
    }
  }

  render() {
    debugger;
    const { activeSVGTabIndex } = this.props;
    const svgPanes = this.getSVGPanes(activeSVGTabIndex);
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
