import React, { Component } from 'react';
import {
  Loader,
  Dimmer,
  Tab,
  Popup,
  Icon,
  // Message,
  // Menu,
  Label,
  Button,
  Dropdown,
} from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import {
  // dynamicSizeLarger,
  roundToPrecision,
} from '../Shared/helpers';
// import { limitString } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import MetafeaturesTableDynamic from './MetafeaturesTableDynamic';
import './SVGPlot.scss';

const maxWidthPopupStyle = {
  backgroundColor: '2E2E2E',
  borderBottom: '2px solid var(--color-primary)',
  color: '#FFF',
  padding: '1em',
  maxWidth: '15vw',
  fontSize: '13px',
};
class SVGPlot extends Component {
  constructor(props) {
    super(props);
    // this.resizeListener = this.resizeListener.bind(this);
    // this.debouncedResizeListener = _.debounce(this.resizeListener, 100);
    this.state = {
      // activeSVGTabIndexVolcano: 0,
      excelFlagVolcano: true,
      pngFlagVolcano: true,
      pdfFlagVolcano: false,
      svgFlagVolcano: true,
      txtFlagVolcano: false,
    };
  }

  metaFeaturesTableDynamicRef = React.createRef();

  componentDidMount() {
    const { activeSVGTabIndexVolcano } = this.state;
    this.setButtonVisibility(activeSVGTabIndexVolcano);
    this.getSVGPanes();
  }

  componentDidUpdate(prevProps, prevState) {
    // const { imageInfoVolcanoLength } = this.props;
    const { activeSVGTabIndexVolcano } = this.state;
    if (
      this.state.isSVGReadyVolcano &&
      (prevProps.imageInfoVolcanoLength !== this.props.imageInfoVolcanoLength ||
        prevProps.imageInfoVolcano.key !== this.props.imageInfoVolcano.key ||
        prevProps.volcanoWidth !== this.props.volcanoWidth ||
        prevProps.upperPlotsHeight !== this.props.upperPlotsHeight)
    ) {
      this.getSVGPanes();
    }
    if (prevState.activeSVGTabIndexVolcano !== activeSVGTabIndexVolcano) {
      this.setButtonVisibility(activeSVGTabIndexVolcano);
    }
  }

  // shouldComponentUpdate(nextProps) {
  //   return nextProps.upperPlotsVisible;
  // }

  setButtonVisibility = index => {
    if (this.props.differentialPlotTypes.length > 0) {
      const isMetaFeatureTab =
        this.metaFeaturesTableDynamicRef.current !== null ? true : false;
      this.setState({
        excelFlagVolcano: isMetaFeatureTab,
        txtFlagVolcano: isMetaFeatureTab,
        pdfFlagVolcano: false,
        svgFlagVolcano: !isMetaFeatureTab,
        pngFlagVolcano: !isMetaFeatureTab,
      });
    } else {
      this.setState({
        excelFlagVolcano: true,
        txtFlagVolcano: true,
        pdfFlagVolcano: false,
        svgFlagVolcano: false,
        pngFlagVolcano: false,
      });
    }
  };

  handleTabChange = (e, { activeIndex }) => {
    this.setState({
      activeSVGTabIndexVolcano: activeIndex,
    });
  };

  handlePlotDropdownChange = (e, { value }) => {
    this.setState({
      activeSVGTabIndexVolcano: value,
    });
  };

  // navigateToDifferentialFeature = evt => {
  //   const testAndDescription = this.props.imageInfoVolcano.key.split(':');
  //   const test = testAndDescription[0] || '';
  //   const featureID = this.props.HighlightedProteins[0]?.featureID;
  //   this.props.onFindDifferentialFeature(test, featureID);
  // };

  getSVGPanes = () => {
    const {
      imageInfoVolcano,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      imageInfoVolcanoLength,
    } = this.props;
    let panes = [];
    if (imageInfoVolcanoLength !== 0) {
      let dimensions = '';
      if (divWidth && divHeight && pxToPtRatio) {
        const divWidthPadding = divWidth * 0.95;
        const divHeightPadding = divHeight * 0.95;
        const divWidthPt = roundToPrecision(divWidthPadding / pxToPtRatio, 1);
        const divHeightPt = roundToPrecision(divHeightPadding / pxToPtRatio, 1);
        const divWidthPtString = `width=${divWidthPt}`;
        const divHeightPtString = `&height=${divHeightPt}`;
        const pointSizeString = `&pointsize=${pointSize}`;
        dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
      }
      const svgArray = imageInfoVolcano.svg;
      const svgPanes = svgArray.map((s, index) => {
        const srcUrl = `${s.svg}${dimensions}`;
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane
              attached="true"
              as="div"
              key={`${index}-${s.plotType.plotDisplay}-pane-volcano`}
            >
              <div id="VolcanoPlotSVG" className="svgSpan">
                <SVG
                  cacheRequests={true}
                  src={srcUrl}
                  title={`${s.plotType.plotDisplay}`}
                  uniqueHash="a1f8d1"
                  uniquifyIDs={true}
                />
              </div>
            </Tab.Pane>
          ),
        };
      });
      panes = panes.concat(svgPanes);
    }
    const isMultifeaturePlot =
      this.props.imageInfoVolcano.key?.includes('features') || false;
    if (
      this.props.modelSpecificMetaFeaturesExist !== false &&
      !isMultifeaturePlot
    ) {
      let metafeaturesTab = [
        {
          menuItem: 'Feature Data',
          render: () => (
            <Tab.Pane attached="true" as="div">
              <MetafeaturesTableDynamic
                ref={this.metaFeaturesTableDynamicRef}
                differentialStudy={this.props.differentialStudy}
                differentialModel={this.props.differentialModel}
                isItemSVGLoaded={this.props.isItemSVGLoaded}
                imageInfoVolcano={this.props.imageInfoVolcano}
                modelSpecificMetaFeaturesExist={
                  this.props.modelSpecificMetaFeaturesExist
                }
              />
            </Tab.Pane>
          ),
        },
      ];
      panes = panes.concat(metafeaturesTab);
      // }
    }
    this.setState({
      isSVGReadyVolcano: true,
      svgPanes: panes,
    });
  };

  handlePlotOverlay = () => {
    const {
      // HighlightedFeaturesArrVolcano,
      // differentialFeatureIdKey,
      imageInfoVolcano,
      onGetMultifeaturePlotTransitionRef,
    } = this.props;
    if (imageInfoVolcano.key.includes('features')) {
      // multifeature plot
      // const featureIds = HighlightedFeaturesArrVolcano.map(
      //   features => features.id,
      // );
      // let value = dataItem[alphanumericTrigger];
      //     let imageInfoDifferential = {
      //       key: `${value}`,
      //       title: `${alphanumericTrigger} ${value}`,
      //       svg: [],
      //     };
      //     this.props.onGetPlotTransition(
      //       dataItem[alphanumericTrigger],
      //       dataItem,
      //       imageInfoDifferential,
      //       true,
      //     );
      // this.props.onGetPlotTransitionRef(key, null, imageInfoVolcano, true);
      onGetMultifeaturePlotTransitionRef();
    } else {
      // single feature plot
      const key = imageInfoVolcano.key;
      this.props.onGetPlotTransitionRef(key, null, imageInfoVolcano, true);
    }
  };

  getPlotContent = () => {
    const {
      imageInfoVolcano,
      isVolcanoPlotSVGLoaded,
      tabsMessage,
      upperPlotsVisible,
      svgExportName,
      tab,
    } = this.props;

    const {
      activeSVGTabIndexVolcano,
      svgPanes,
      isSVGReadyVolcano,
    } = this.state;
    let options = [];
    if (upperPlotsVisible) {
      if (isSVGReadyVolcano) {
        if (imageInfoVolcano.key != null && isVolcanoPlotSVGLoaded) {
          const DropdownClass =
            this.props.differentialPlotTypes.length > this.props.svgTabMax
              ? 'Show svgPlotDropdown'
              : 'Hide svgPlotDropdown';
          const TabMenuClass =
            this.props.differentialPlotTypes.length > this.props.svgTabMax
              ? 'Hide'
              : 'Show';
          // const BreadcrumbPopupStyle = {
          //   backgroundColor: '2E2E2E',
          //   borderBottom: '2px solid var(--color-primary)',
          //   color: '#FFF',
          //   padding: '1em',
          //   maxWidth: '50vw',
          //   fontSize: '13px',
          //   wordBreak: 'break-all',
          // };
          const activeSVGTabIndexVolcanoVar = activeSVGTabIndexVolcano || 0;
          const svgArray = [...imageInfoVolcano.svg];
          let plotOptions = svgArray.map(function(s, index) {
            return {
              key: `${index}=VolcanoPlotDropdownOption`,
              text: s.plotType.plotDisplay,
              value: index,
            };
          });
          // options = options.concat(plotOptions);
          const singleFeaturePlotTypes = this.props.differentialPlotTypes.filter(
            p => !p.plotType.includes('multiFeature'),
          );
          let metafeaturesDropdown = [
            {
              key: 'Feature-Data-SVG-Plot',
              text: 'Feature Data',
              value: singleFeaturePlotTypes.length,
            },
          ];
          options = [...plotOptions, ...metafeaturesDropdown];
          return (
            <div className="svgContainerVolcano">
              <div className="export-svg ShowBlock">
                <ButtonActions
                  exportButtonSize={'mini'}
                  excelVisible={false}
                  pdfVisible={false}
                  pngVisible={true}
                  svgVisible={true}
                  txtVisible={false}
                  tab={tab}
                  imageInfo={imageInfoVolcano}
                  tabIndex={activeSVGTabIndexVolcanoVar}
                  svgExportName={svgExportName}
                  plot="VolcanoPlotSVG"
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
              <Dropdown
                search
                selection
                compact
                options={options}
                value={options[activeSVGTabIndexVolcanoVar]?.value}
                onChange={this.handlePlotDropdownChange}
                className={DropdownClass}
                id="svgPlotDropdownDifferential"
              />
              <Tab
                menu={{
                  secondary: true,
                  pointing: true,
                  className: TabMenuClass,
                }}
                panes={svgPanes}
                onTabChange={this.handleTabChange}
                activeIndex={activeSVGTabIndexVolcano}
              />
              {this.props.tab === 'differential' ? (
                <span id="VolcanoOptionsPopup">
                  {/* <Popup
                  trigger={ */}
                  <Button size="mini" onClick={this.handlePlotOverlay}>
                    <Icon
                      // name="expand"
                      name="expand arrows alternate"
                      className=""
                    />
                    FULL SCREEN
                  </Button>
                  {/* }
                  style={PopupStyle}
                  content="View Larger"
                  basic
                /> */}
                </span>
              ) : null}
              {/* <Icon
              name="bullseye"
              size="large"
              onClick={this.navigateToDifferentialFeature}
              className="DiffTableIcon"
            /> */}
            </div>
          );
        } else if (!isVolcanoPlotSVGLoaded) {
          return (
            <Dimmer active inverted>
              <Loader size="large">Loading Plots</Loader>
            </Dimmer>
          );
        } else {
          return (
            <div className="PlotInstructions">
              <h4 className="PlotInstructionsText NoSelect">{tabsMessage}</h4>
            </div>
          );
        }
      } else {
        return null;
      }
    } else return null;
  };

  render() {
    const { volcanoPlotVisible } = this.props;

    const Toggle = (
      <span
        className="VolcanoPlotToggle"
        id={volcanoPlotVisible ? '' : 'VolcanoPlotToggle'}
      >
        <Popup
          trigger={
            <Label
              circular
              id="VolcanoPlotToggleLabel"
              onClick={this.props.onHandleVolcanoVisability}
              // size={volcanoPlotVisible ? '' : 'large'}
            >
              <Icon
                // size={dynamicSizeLarger}
                // size={volcanoPlotVisible ? '' : 'large'}
                name={volcanoPlotVisible ? 'angle left' : 'angle right'}
              />
              {/* {volcanoPlotVisible ? '<' : '>'} */}
            </Label>
          }
          style={maxWidthPopupStyle}
          // className="TablePopupValue"
          content={
            volcanoPlotVisible ? 'Hide Scatter Plot' : 'Show Scatter Plot'
          }
          inverted
          basic
        />
      </span>
    );
    const PlotContent = this.getPlotContent();

    return (
      <>
        {Toggle}
        {PlotContent}
      </>
    );
  }
}

export default SVGPlot;
