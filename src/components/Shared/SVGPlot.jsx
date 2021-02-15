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
import { ReactSVG } from 'react-svg';
// import { limitString } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import './SVGPlot.scss';

class SVGPlot extends Component {
  state = {
    isSVGReady: false,
  };

  componentDidMount() {
    const svgPanesVar = this.getSVGPanes(this.props.activeSVGTabIndex);
    this.setState({
      isSVGReady: true,
      svgPanes: svgPanesVar,
    });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.volcanoWidth !== this.props.volcanoWidth ||
      prevProps.volcanoHeight !== this.props.volcanoHeight ||
      prevProps.activeSVGTabIndex !== this.props.activeSVGTabIndex
    ) {
      const svgPanesVar = this.getSVGPanes(this.props.activeSVGTabIndex);
      this.setState({
        svgPanes: svgPanesVar,
      });
    }
  }

  handleTabChange = (e, { activeIndex }) => {
    this.props.onSVGTabChange(activeIndex);
  };

  // navigateToDifferentialFeature = evt => {
  //   const testAndDescription = this.props.imageInfo.key.split(':');
  //   const test = testAndDescription[0] || '';
  //   const featureID = this.props.HighlightedProteins[0]?.featureID;
  //   this.props.onFindDifferentialFeature(test, featureID);
  // };

  getSVGPanes = activeSVGTabIndex => {
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
      const heightVar = this.props.divHeight || null;
      const widthVar = this.props.divWidth || null;
      const pointSizeVar = this.props.pointSize || null;
      let dimensions = '';
      if (heightVar && widthVar) {
        dimensions = `?${widthVar}${heightVar}${pointSizeVar}`;
      }
      console.log(dimensions);
      const svgArray = this.props.imageInfo.svg;
      // const svgArrayReversed = svgArray.reverse();
      // const numberOfPlots = svgArray.length;
      const panes = svgArray.map((s, index) => {
        const srcUrl = `${s.svg}${dimensions}`;
        console.log(srcUrl);
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
              <div id="PlotSVG" className="svgSpan">
                {/* <p>heightVar: {heightVar}</p>
                <p>widthVar: {widthVar}</p>
                <p>srcUrl: {srcUrl}</p> */}
                <ReactSVG src={srcUrl} />
                {/* <ReactSVG
                  src={srcUrl}
                  afterInjection={(error, svg) => {
                    if (error) {
                      console.error(error);
                      return;
                    }
                    console.log(svg);
                  }}
                  beforeInjection={svg => {
                    svg.classList.add('svg-class-name');
                    svg.setAttribute('style', `width: ${widthVar}px`);
                    svg.setAttribute('style', `height: ${heightVar}px`);
                  }}
                  className="wrapper-class-name"
                  evalScripts="always"
                  fallback={() => <span>Error!</span>}
                  loading={() => <span>Loading</span>}
                  renumerateIRIElements={false}
                  useRequestCache={true}
                  wrapper="span"
                /> */}
              </div>
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
          vertical
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
  };

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
          {this.state.svgPanes}
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
