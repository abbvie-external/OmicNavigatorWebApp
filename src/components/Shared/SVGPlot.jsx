import React, { Component, Fragment } from 'react';
import { Loader, Dimmer, Tab, Popup, Icon } from 'semantic-ui-react';
import './SVGPlot.scss';

class SVGPlot extends Component {
  constructor(props) {
    super(props);
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

  handleDiffTable = (evt, {}) => {
    const key = this.props.imageInfo.key.split(':');
    const name = key[0] || '';
    const diffProtein = this.props.proteinForDiffView.lineID;
    this.props.onViewDiffTable(name, diffProtein);
  };

  getSVGPanes(activeSVGTabIndex) {
    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
    };
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
    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid #FF4400',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all'
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
