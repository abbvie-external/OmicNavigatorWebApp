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
  List,
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
  state = {
    activeSVGTabIndexVolcano: 0,
    excelFlagVolcano: true,
    pngFlagVolcano: true,
    pdfFlagVolcano: false,
    svgFlagVolcano: true,
    txtFlagVolcano: false,
    featuresListOpen: false,
  };
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

  toggleFeaturesListPopup = (e, obj, close) => {
    if (close) {
      this.setState({ featuresListOpen: false });
    } else {
      this.setState({ featuresListOpen: true });
    }
  };

  clearAll = () => {
    this.setState({
      featuresListOpen: false,
    });
    this.props.onHandleSelectedVolcano([], false);
    this.props.onClearPlotSelected();
  };

  getFeaturesList = () => {
    const {
      featuresLength,
      divWidth,
      HighlightedFeaturesArrVolcano,
    } = this.props;
    let features = [];
    if (featuresLength > 10) {
      let shortenedArr = [...HighlightedFeaturesArrVolcano].slice(0, 10);
      features = shortenedArr.map(m => m.key);
    } else {
      features = [...HighlightedFeaturesArrVolcano].map(m => m.key);
    }
    const featuresListHorizontalStyle = {
      minWidth: divWidth * 0.9,
      maxWidth: divWidth * 0.9,
    };

    let list = (
      <List
        animated
        inverted
        verticalAlign="middle"
        id="FeaturesListHorizontal"
        className="NoSelect"
        style={featuresListHorizontalStyle}
        divided
        horizontal
        size="mini"
      >
        <List.Item className="NoSelect">
          <Label
            className="PrimaryBackground CursorPointer"
            onClick={this.clearAll}
          >
            CLEAR ALL <Icon name="trash" />
          </Label>
          {featuresLength > 10 ? (
            <span id="MoreThanTenText">{featuresLength} features selected</span>
          ) : null}
        </List.Item>
        {featuresLength > 10
          ? null
          : features.map(f => {
              return (
                <List.Item key={`featureList-${f}`} className="NoSelect">
                  <Label
                    className="CursorPointer"
                    onClick={() => this.props.onRemoveSelectedFeature(f)}
                  >
                    {f}
                    <Icon name="delete" />
                  </Label>
                </List.Item>
              );
            })}
      </List>
    );

    let div = (
      <span id={divWidth >= 625 ? 'FeaturesListButton' : 'FeaturesListIcon'}>
        <Popup
          trigger={
            <Button size="mini" onClick={this.toggleFeaturesListPopup}>
              <Icon name="setting" />
              {featuresLength} {divWidth >= 625 ? 'FEATURES' : ''}
            </Button>
          }
          // style={StudyPopupStyle}
          id="FeaturesListTooltip"
          basic
          on="click"
          inverted
          open={this.state.featuresListOpen}
          onClose={e => this.toggleFeaturesListPopup(e, null, true)}
          closeOnDocumentClick
          closeOnEscape
          hideOnScroll
        >
          <Popup.Content id="FeaturesListPopupContent">
            {/* <Grid>
              <Grid.Row>
                <Grid.Column
                  className="VolcanoPlotFilters"
                  id="xAxisSelector"
                  mobile={14}
                  tablet={14}
                  computer={14}
                  largeScreen={14}
                  widescreen={14}
                > */}
            {list}
            {/* </Grid.Column>
              </Grid.Row>
            </Grid> */}
          </Popup.Content>
        </Popup>
      </span>
    );
    return div;
  };

  getSVGPanes = () => {
    const {
      imageInfoVolcano,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      imageInfoVolcanoLength,
      modelSpecificMetaFeaturesExist,
      differentialStudy,
      differentialModel,
      isItemSVGLoaded,
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
      imageInfoVolcano.key?.includes('features') || false;
    if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
      let metafeaturesTab = [
        {
          menuItem: 'Feature Data',
          render: () => (
            <Tab.Pane attached="true" as="div">
              <MetafeaturesTableDynamic
                ref={this.metaFeaturesTableDynamicRef}
                differentialStudy={differentialStudy}
                differentialModel={differentialModel}
                isItemSVGLoaded={isItemSVGLoaded}
                imageInfoVolcano={imageInfoVolcano}
                modelSpecificMetaFeaturesExist={modelSpecificMetaFeaturesExist}
              />
            </Tab.Pane>
          ),
        },
      ];
      panes = panes.concat(metafeaturesTab);
      // }
    }
    const singleFeaturePlotTypes = this.props.differentialPlotTypes.filter(
      p => !p.plotType.includes('multiFeature'),
    );
    // check for when user is on feature data option, then moves to multi-feature, the index doesn't stay on feature data, but rather moves to 0
    const index =
      isMultifeaturePlot &&
      this.state.activeSVGTabIndexVolcano >= singleFeaturePlotTypes.length
        ? 0
        : this.state.activeSVGTabIndexVolcano;
    this.setState({
      isSVGReadyVolcano: true,
      svgPanes: panes,
      activeSVGTabIndexVolcano: index,
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
      divWidth,
      differentialStudy,
      differentialModel,
      differentialTest,
    } = this.props;

    const {
      activeSVGTabIndexVolcano,
      svgPanes,
      isSVGReadyVolcano,
      pdfFlagVolcano,
      pngFlagVolcano,
      svgFlagVolcano,
      txtFlagVolcano,
      excelFlagVolcano,
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
          options = svgArray.map(function(s, index) {
            return {
              key: `${index}=VolcanoPlotDropdownOption`,
              text: s.plotType.plotDisplay,
              value: index,
            };
          });
          const isMultifeaturePlot =
            this.props.imageInfoVolcano.key?.includes('features') || false;
          if (
            this.props.modelSpecificMetaFeaturesExist !== false &&
            !isMultifeaturePlot
          ) {
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
            options = [...options, ...metafeaturesDropdown];
          }
          let featuresList = null;
          if (imageInfoVolcano?.key?.includes('features')) {
            featuresList = this.getFeaturesList();
          }
          return (
            <div className="svgContainerVolcano">
              <div className="export-svg ShowBlock">
                <ButtonActions
                  exportButtonSize={'mini'}
                  excelVisible={excelFlagVolcano}
                  pdfVisible={pdfFlagVolcano}
                  pngVisible={pngFlagVolcano}
                  svgVisible={svgFlagVolcano}
                  txtVisible={txtFlagVolcano}
                  tab={tab}
                  imageInfo={imageInfoVolcano}
                  tabIndex={activeSVGTabIndexVolcanoVar}
                  svgExportName={svgExportName}
                  plot="VolcanoPlotSVG"
                  refFwd={
                    this.metaFeaturesTableDynamicRef.current
                      ?.metafeaturesGridRefDynamic || null
                  }
                  study={differentialStudy}
                  model={differentialModel}
                  test={differentialTest}
                  feature={imageInfoVolcano?.key}
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
                value={
                  options[activeSVGTabIndexVolcanoVar]?.value ||
                  options[0]?.value
                }
                onChange={this.handlePlotDropdownChange}
                className={DropdownClass}
                id={
                  isMultifeaturePlot
                    ? 'svgPlotDropdownMulti'
                    : 'svgPlotDropdownSingle'
                }
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
              {featuresList}
              <span
                id={divWidth >= 625 ? 'FullScreenButton' : 'FullScreenIcon'}
              >
                {/* <Popup
                  trigger={ */}
                <Button
                  size="mini"
                  onClick={this.handlePlotOverlay}
                  className={divWidth >= 625 ? '' : 'FullScreenPadding'}
                >
                  <Icon
                    // name="expand"
                    name="expand arrows alternate"
                    className=""
                  />
                  {divWidth >= 625 ? 'FULL SCREEN' : ''}
                </Button>
                {/* }
                  style={PopupStyle}
                  content="View Larger"
                  basic
                /> */}
              </span>
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
