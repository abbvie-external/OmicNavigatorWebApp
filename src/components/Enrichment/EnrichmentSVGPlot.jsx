import React, { Component } from 'react';
import {
  Loader,
  Dimmer,
  Tab,
  // Popup,
  // Icon,
  Message,
  // Menu,
  // Label,
} from 'semantic-ui-react';
// import { limitString } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import './EnrichmentSVGPlot.scss';

class EnrichmentSVGPlot extends Component {
  state = {
    isSVGReady: false,
  };

  componentDidMount() {
    this.setState({
      isSVGReady: true,
    });
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.imageInfo !== this.props.imageInfo) {
  //     this.forceUpdate();
  //   }
  // }

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
    //   backgroundColor: '2E2E2E',
    //   borderBottom: '2px solid var(--color-primary)',
    //   color: '#FFF',
    //   padding: '1em',
    //   maxWidth: '50vw',
    //   fontSize: '13px',
    //   wordBreak: 'break-all',
    // };
    if (this.props.imageInfo.length !== 0) {
      const svgArray = this.props.imageInfo.svg;
      // const svgArrayReversed = svgArray.reverse();
      // const numberOfPlots = svgArray.length;
      const panes = svgArray.map((s, index) => {
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          // menuItem: limitString(`${s.plotType.plotDisplay}`, numberOfPlots, 5),
          // menuItem: (
          //   <Popup
          //     trigger={
          //       <Menu.Item key={`${s.plotType.plotDisplay}`} content="test">
          //         <Label>{index}</Label>
          //       </Menu.Item>
          //     }
          //     style={BreadcrumbPopupStyle}
          //     inverted
          //     basic
          //     position="bottom left"
          //     content={`${s.plotType.plotDisplay}`}
          //   />
          // ),
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
      const { activeSVGTabIndex, imageInfo, svgExportName, tab } = this.props;
      const ButtonActionsClass = this.getButtonActionsClass();

      // const BreadcrumbPopupStyle = {
      //   backgroundColor: '2E2E2E',
      //   borderBottom: '2px solid var(--color-primary)',
      //   color: '#FFF',
      //   padding: '1em',
      //   maxWidth: '50vw',
      //   fontSize: '13px',
      //   wordBreak: 'break-all',
      // };
      const svgPanes = this.getSVGPanes(activeSVGTabIndex);
      return (
        <div className="svgContainer">
          <div className={ButtonActionsClass}>
            <ButtonActions
              exportButtonSize={'mini'}
              excelVisible={false}
              pdfVisible={false}
              pngVisible={true}
              svgVisible={true}
              txtVisible={false}
              tab={tab}
              imageInfo={imageInfo}
              tabIndex={activeSVGTabIndex}
              svgExportName={svgExportName}
            />
          </div>
          {/* <Popup
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
          /> */}
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

export default EnrichmentSVGPlot;
