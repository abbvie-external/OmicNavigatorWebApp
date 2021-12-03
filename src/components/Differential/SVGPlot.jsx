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
    activeIndexPlotTabs: 0,
    activeSVGTabIndexVolcanoSingleFeature: 0,
    activeSVGTabIndexVolcanoMultiFeature: 0,
    excelFlagVolcano: true,
    pngFlagVolcano: true,
    pdfFlagVolcano: false,
    svgFlagVolcano: true,
    txtFlagVolcano: false,
    featuresListOpen: false,
    singleFeaturePlotContent: '',
    multiFeaturePlotContent: '',
  };
  metaFeaturesTableDynamicRef = React.createRef();
  componentDidMount() {
    const { activeSVGTabIndexVolcanoSingleFeature } = this.state;
    this.setButtonVisibility(activeSVGTabIndexVolcanoSingleFeature);
    this.getSVGPanesSingleFeature();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      imageInfoVolcanoLength,
      imageInfoVolcano,
      volcanoWidth,
      tabsMessage,
      upperPlotsHeight,
    } = this.props;
    const {
      activeSVGTabIndexVolcanoSingleFeature,
      activeSVGTabIndexVolcanoMultiFeature,
      activeIndexPlotTabs,
    } = this.state;
    if (
      // this.state.isSVGReadyVolcanoSingleFeature &&
      prevProps.imageInfoVolcanoLength !== imageInfoVolcanoLength ||
      prevProps.imageInfoVolcano.key !== imageInfoVolcano.key
    ) {
      if (imageInfoVolcano?.key?.includes('features')) {
        this.getSVGPanesMultiFeature();
      } else {
        this.getSVGPanesSingleFeature();
      }
    }

    if (
      this.state.isSVGReadyVolcano &&
      (prevProps.imageInfoVolcanoLength !== imageInfoVolcanoLength ||
        prevProps.imageInfoVolcano.key !== imageInfoVolcano.key ||
        prevProps.volcanoWidth !== volcanoWidth ||
        prevProps.tabsMessage !== tabsMessage ||
        prevProps.upperPlotsHeight !== upperPlotsHeight)
    ) {
      // this.getSVGPanes();
      // if (imageInfoVolcano?.key?.includes('features')) {
      if (this.state.activeIndexPlotTabs === 1) {
        this.getSVGPanesMultiFeature();
      } else {
        this.getSVGPanesSingleFeature();
      }
    }
    if (prevState.activeIndexPlotTabs !== activeIndexPlotTabs) {
      this.setButtonVisibility(activeIndexPlotTabs);
    }

    if (
      prevState.activeSVGTabIndexVolcanoSingleFeature !==
      activeSVGTabIndexVolcanoSingleFeature
    ) {
      this.getSVGPanesSingleFeature();
      this.setButtonVisibility(activeSVGTabIndexVolcanoSingleFeature);
    }
    if (
      prevState.activeSVGTabIndexVolcanoMultiFeature !==
      activeSVGTabIndexVolcanoMultiFeature
    ) {
      this.getSVGPanesMultiFeature();
      this.setButtonVisibility(activeSVGTabIndexVolcanoMultiFeature);
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

  handleTabChangeSingleFeature = (e, { activeIndex }) => {
    this.setState({
      activeSVGTabIndexVolcanoSingleFeature: activeIndex,
    });
  };

  handlePlotDropdownChangeSingleFeature = (e, { value }) => {
    this.setState({
      activeSVGTabIndexVolcanoSingleFeature: value,
    });
  };

  handleTabChangeMultiFeature = (e, { activeIndex }) => {
    this.setState({
      activeSVGTabIndexVolcanoMultiFeature: activeIndex,
    });
  };

  handlePlotDropdownChangeMultiFeature = (e, { value }) => {
    this.setState({
      activeSVGTabIndexVolcanoMultiFeature: value,
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
      this.setState({ featuresListOpen: !this.state.featuresListOpen });
    }
  };

  clearAll = () => {
    this.setState({
      featuresListOpen: false,
    });
    this.props.onHandleAllChecked(false);
    this.props.onHandleSelectedVolcano([], false);
  };

  getFeaturesList = () => {
    const {
      featuresLength,
      divWidth,
      HighlightedFeaturesArrVolcano,
      multifeaturePlotMax,
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
    const manyFeaturesText =
      featuresLength >= multifeaturePlotMax ? (
        <span id="MoreThanText">
          Plotting is limited to the first {multifeaturePlotMax} features
        </span>
      ) : (
        <span id="MoreThanText">
          {featuresLength} features selected. Individual de-select disabled when
          11+ features.
        </span>
      );

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
          {featuresLength > 10 ? manyFeaturesText : null}
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
      <span
        className={divWidth < 450 ? 'Hide' : 'Show'}
        id={divWidth >= 625 ? 'FeaturesListButton' : 'FeaturesListIcon'}
      >
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

  getSVGPanesSingleFeature = () => {
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
        const divHeightPadding = divHeight * 0.95 - 38;
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
      imageInfoVolcano?.key?.includes('features') || false;
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
    const singleFeaturePlotContent = this.getSingleFeaturePlotContent();
    this.setState({
      isSVGReadyVolcanoSingleFeature: true,
      svgPanes: panes,
      activeIndexPlotTabs: 0,
      singleFeaturePlotContent,
    });
  };

  // full-screen plots action
  // handlePlotOverlay = () => {
  //   const { imageInfoVolcano, onGetMultifeaturePlotTransitionRef } = this.props;
  //   if (imageInfoVolcano.key.includes('features')) {
  //     // multifeature plot
  //     onGetMultifeaturePlotTransitionRef();
  //   } else {
  //     // single feature plot
  //     const key = imageInfoVolcano.key;
  //     this.props.onGetPlotTransitionRef(key, null, imageInfoVolcano, true);

  getSVGPanesMultiFeature = () => {
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
        const divHeightPadding = divHeight * 0.95 - 38;
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
                  uniqueHash="b2g9e2"
                  uniquifyIDs={true}
                />
              </div>
            </Tab.Pane>
          ),
        };
      });
      panes = panes.concat(svgPanes);
    }
    const multiFeaturePlotContent = this.getMultiFeaturePlotContent();
    this.setState({
      isSVGReadyVolcanoMultiFeature: true,
      svgPanes: panes,
      activeIndexPlotTabs: 1,
      multiFeaturePlotContent,
    });
  };

  handlePlotOverlaySingleFeature = () => {
    const { imageInfoVolcano } = this.props;
    const key = imageInfoVolcano.key;
    this.props.onGetPlotTransitionRef(key, null, imageInfoVolcano, true);
  };

  getSingleFeaturePlotContent = () => {
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
      activeSVGTabIndexVolcanoSingleFeature,
      isSVGReadyVolcanoSingleFeature,
      svgPanes,
      pdfFlagVolcano,
      pngFlagVolcano,
      svgFlagVolcano,
      txtFlagVolcano,
      excelFlagVolcano,
    } = this.state;
    let options = [];
    if (upperPlotsVisible) {
      if (isSVGReadyVolcanoSingleFeature) {
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
          const activeSVGTabIndexVolcanoSingleFeatureVar =
            activeSVGTabIndexVolcanoSingleFeature || 0;
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
                  tabIndex={activeSVGTabIndexVolcanoSingleFeatureVar}
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
                  options[activeSVGTabIndexVolcanoSingleFeatureVar]?.value ||
                  options[0]?.value
                }
                onChange={this.handlePlotDropdownChangeSingleFeature}
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
                activeIndex={activeSVGTabIndexVolcanoSingleFeature}
              />
              {featuresList}
              <span
                className={divWidth < 450 ? 'Hide' : 'Show'}
                id={divWidth >= 625 ? 'FullScreenButton' : 'FullScreenIcon'}
              >
                {/* <Popup
                  trigger={ */}
                <Button
                  size="mini"
                  onClick={this.handlePlotOverlaySingleFeature}
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
      } else return null;
    }
  };

  getMultiFeaturePlotContent = () => {
    const {
      imageInfoVolcano,
      isVolcanoPlotSVGLoaded,
      tabsMessage,
      upperPlotsVisible,
      svgExportName,
      tab,
      divWidth,
      differentialPlotTypes,
      svgTabMax,
      modelSpecificMetaFeaturesExist,
    } = this.props;

    const {
      activeSVGTabIndexVolcanoMultiFeature,
      svgPanes,
      pdfFlagVolcano,
      pngFlagVolcano,
      svgFlagVolcano,
      txtFlagVolcano,
      excelFlagVolcano,
    } = this.state;
    let options = [];
    if (upperPlotsVisible) {
      if (imageInfoVolcano.key != null && isVolcanoPlotSVGLoaded) {
        const DropdownClass =
          differentialPlotTypes.length > svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClass =
          differentialPlotTypes.length > svgTabMax ? 'Hide' : 'Show';
        const activeSVGTabIndexVolcanoMultiFeatureVar =
          activeSVGTabIndexVolcanoMultiFeature || 0;
        const svgArray = [...imageInfoVolcano.svg];
        options = svgArray.map(function(s, index) {
          return {
            key: `${index}=VolcanoPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });
        const isMultifeaturePlot =
          imageInfoVolcano?.key?.includes('features') || false;
        if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
          const singleFeaturePlotTypes = differentialPlotTypes.filter(
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
        featuresList = this.getFeaturesList();
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
                tabIndex={activeSVGTabIndexVolcanoMultiFeatureVar}
                svgExportName={svgExportName}
                plot="VolcanoPlotSVG"
              />
            </div>
            <Dropdown
              search
              selection
              compact
              options={options}
              value={
                options[activeSVGTabIndexVolcanoMultiFeatureVar]?.value ||
                options[0]?.value
              }
              onChange={this.handlePlotDropdownChangeMultiFeature}
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
              onTabChange={this.handleTabChangeMultiFeature}
              activeIndex={activeSVGTabIndexVolcanoMultiFeature}
            />
            {featuresList}
            <span id={divWidth >= 625 ? 'FullScreenButton' : 'FullScreenIcon'}>
              {/* <Popup
                  trigger={ */}
              <Button
                size="mini"
                onClick={this.props.onGetMultifeaturePlotTransitionRef}
                className={divWidth >= 625 ? '' : 'FullScreenPadding'}
              >
                <Icon
                  // name="expand"
                  name="expand arrows alternate"
                  className=""
                />
                {divWidth >= 625 ? 'FULL SCREEN' : ''}
              </Button>
            </span>
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
    } else return null;
  };

  handleTabChange = (e, { activeIndexPlotTabs }) => {
    if (activeIndexPlotTabs !== this.state.activeIndexPlotTabs) {
      this.setState({
        activeIndexPlotTabs: activeIndexPlotTabs,
      });
    } else {
      return;
    }
  };

  handleTabChangeSingleFeature = (
    e,
    { activeSVGTabIndexVolcanoSingleFeature },
  ) => {
    if (
      activeSVGTabIndexVolcanoSingleFeature !==
      this.state.activeSVGTabIndexVolcanoSingleFeature
    ) {
      this.setState({
        activeSVGTabIndexVolcanoSingleFeature: activeSVGTabIndexVolcanoSingleFeature,
      });
    }
  };

  handleTabChangeMultiFeature = (
    e,
    { activeSVGTabIndexVolcanoMultiFeature },
  ) => {
    if (
      activeSVGTabIndexVolcanoMultiFeature !==
      this.state.activeSVGTabIndexVolcanoMultiFeature
    ) {
      this.setState({
        activeSVGTabIndexVolcanoMultiFeature: activeSVGTabIndexVolcanoMultiFeature,
      });
    }
  };

  render() {
    const { volcanoPlotVisible, hasMultifeaturePlots } = this.props;
    const { multiFeaturePlotContent } = this.state;

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

    // let MultiFeaturePlotContent;
    // if (imageInfoVolcano?.key?.includes('features')) {
    //   MultiFeaturePlotContent = this.getMultiFeaturePlotContent();
    // }
    // let SingleFeaturePlotContent;
    // if (!imageInfoVolcano?.key?.includes('features')) {
    //   SingleFeaturePlotContent = this.getSingleFeaturePlotContent();
    // }
    let panes = [
      {
        menuItem: 'Single Feature Plots',
        pane: (
          <Tab.Pane
            key="single-feature-plots-pane"
            className="SingleFeaturePlotPane"
          >
            {this.state.singleFeaturePlotContent}
          </Tab.Pane>
        ),
      },
      // {
      //   menuItem: 'Multi-Feature Plots',
      //   pane: (
      //     <Tab.Pane key="2" className="MultiFeaturePlotPane">
      //       {this.state.multiFeaturePlotContent}
      //     </Tab.Pane>
      //   ),
      // },
    ];
    if (hasMultifeaturePlots) {
      panes = [
        {
          menuItem: 'Single Feature Plots',
          pane: (
            <Tab.Pane
              key="single-feature-plots-pane"
              className="SingleFeaturePlotPane"
            >
              {this.state.singleFeaturePlotContent}
            </Tab.Pane>
          ),
        },
        {
          menuItem: 'Multi-Feature Plots',
          pane: (
            <Tab.Pane
              key="multi-feature-plots-pane"
              className="MultiFeaturePlotPane"
            >
              {multiFeaturePlotContent}
            </Tab.Pane>
          ),
        },
      ];
    }

    return (
      <>
        {Toggle}
        <Tab
          onTabChange={this.handleTabChange}
          panes={panes}
          activeIndex={this.state.activeIndexPlotTabs}
          renderActiveOnly={false}
          menu={{
            stackable: true,
            secondary: true,
            pointing: true,
            inverted: false,
            className: 'PlotTabsContainer',
          }}
        />
      </>
    );
  }
}

export default SVGPlot;
