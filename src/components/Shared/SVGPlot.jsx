import React, { Component, Fragment } from 'react';
import {
  Loader,
  Dimmer,
  Tab,
  // Popup,
  // Icon,
  Message,
  // Menu,
  // Label,
  Dropdown,
} from 'semantic-ui-react';
import { ReactSVG } from 'react-svg';
import { roundToPrecision } from '../Shared/helpers';
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
      prevProps.imageInfoLength !== this.props.imageInfoLength ||
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

  handlePlotDropdownChange = (e, { value }) => {
    this.props.onSVGTabChange(value);
  };

  // navigateToDifferentialFeature = evt => {
  //   const testAndDescription = this.props.imageInfo.key.split(':');
  //   const test = testAndDescription[0] || '';
  //   const featureID = this.props.HighlightedProteins[0]?.featureID;
  //   this.props.onFindDifferentialFeature(test, featureID);
  // };

  getSVGPanes = activeSVGTabIndex => {
    const {
      imageInfo,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
    } = this.props;
    if (imageInfo.length !== 0) {
      let panes = [];
      let plotOptions = [];
      let dimensions = '';
      if (divWidth && divHeight && pxToPtRatio) {
        const divWidthPt = roundToPrecision(divWidth / pxToPtRatio, 1);
        const divHeightPt = roundToPrecision(divHeight / pxToPtRatio, 1);
        const divWidthPtString = `&width=${divWidthPt}`;
        const divHeightPtString = `&height=${divHeightPt}`;
        const pointSizeString = `&pointsize=${pointSize}`;
        dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
      }
      const svgArray = [...imageInfo.svg];
      plotOptions = svgArray.map(function(s, index) {
        return {
          key: `${index}=VolcanoPlotDropdownOption`,
          text: s.plotType.plotDisplay,
          value: index,
        };
      });
      panes = svgArray.map((s, index) => {
        const srcUrl = `${s.svg}${dimensions}`;
        return {
          menuItem: `${s.plotType.plotDisplay}`,
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
      const TabMenuClass =
        this.props.differentialPlotTypes.length > 1 ? 'Hide' : 'Show';
      const indexVar = activeSVGTabIndex || 0;

      return (
        <Fragment>
          <Dropdown
            search
            selection
            compact
            options={plotOptions}
            value={plotOptions[indexVar].value}
            onChange={this.handlePlotDropdownChange}
            className={
              this.props.differentialPlotTypes.length > 1
                ? 'Show svgPlotDropdown'
                : 'Hide svgPlotDropdown'
            }
          />
          <Tab
            menu={{ secondary: true, pointing: true, className: TabMenuClass }}
            panes={panes}
            onTabChange={this.handleTabChange}
            activeIndex={activeSVGTabIndex}
          />
        </Fragment>
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
