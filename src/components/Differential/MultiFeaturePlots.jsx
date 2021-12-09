import React, { Component } from 'react';
import {
  Loader,
  Dimmer,
  Tab,
  Popup,
  Icon,
  Label,
  Button,
  Dropdown,
  List,
} from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import { roundToPrecision } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import './DynamicPlots.scss';

class MultiFeaturePlots extends Component {
  state = {
    activeSVGTabIndexVolcanoMultiFeature: 0,
    excelFlagMFPlots: false,
    txtFlagMFPlots: false,
    pdfFlagMFPlots: false,
    svgFlagMFPlots: true,
    pngFlagMFPlots: true,
    featuresListOpen: false,
    isSVGReadyVolcanoMultiFeature: false,
    multiFeaturePlotContent: '',
  };

  componentDidMount() {
    this.getSVGPanesMultiFeature();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      plotDataMultiFeatureLength,
      plotDataMultiFeature,
      volcanoWidth,
      upperPlotsHeight,
      tabsMessage,
      activeIndexPlotTabs,
    } = this.props;
    const {
      activeSVGTabIndexVolcanoMultiFeature,
      isSVGReadyVolcanoMultiFeature,
    } = this.state;
    // if (
    //   prevProps.plotDataMultiFeatureLength !== plotDataMultiFeatureLength ||
    //   prevProps.plotDataMultiFeature.key !== plotDataMultiFeature.key
    // ) {
    //   if (plotDataMultiFeature?.key?.includes('features')) {
    //     this.getSVGPanesMultiFeature();
    //   }
    // }
    if (
      isSVGReadyVolcanoMultiFeature &&
      activeIndexPlotTabs === 1 &&
      (prevProps.plotDataMultiFeatureLength !== plotDataMultiFeatureLength ||
        prevProps.plotDataMultiFeature.key !== plotDataMultiFeature.key ||
        prevProps.volcanoWidth !== volcanoWidth ||
        prevProps.tabsMessage !== tabsMessage ||
        prevProps.upperPlotsHeight !== upperPlotsHeight ||
        prevState.activeSVGTabIndexVolcanoMultiFeature !==
          activeSVGTabIndexVolcanoMultiFeature)
    ) {
      debugger;
      this.getSVGPanesMultiFeature();
    }
  }

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
      if (featuresLength > 0) {
        features = [...HighlightedFeaturesArrVolcano].map(m => m.key);
      }
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

  getSVGPanesMultiFeature = () => {
    const {
      plotDataMultiFeature,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotDataMultiFeatureLength,
    } = this.props;
    let panes = [];
    debugger;
    if (plotDataMultiFeatureLength !== 0) {
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
      const svgArray = plotDataMultiFeature.svg;
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
      multiFeaturePlotContent,
    });
  };

  getMultiFeaturePlotContent = () => {
    const {
      plotDataMultiFeature,
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
      pdfFlagMFPlots,
      pngFlagMFPlots,
      svgFlagMFPlots,
      txtFlagMFPlots,
      excelFlagMFPlots,
    } = this.state;
    let options = [];
    if (upperPlotsVisible) {
      if (plotDataMultiFeature.key != null && isVolcanoPlotSVGLoaded) {
        const DropdownClass =
          differentialPlotTypes.length > svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClass =
          differentialPlotTypes.length > svgTabMax ? 'Hide' : 'Show';
        const activeSVGTabIndexVolcanoMultiFeatureVar =
          activeSVGTabIndexVolcanoMultiFeature || 0;
        const svgArray = [...plotDataMultiFeature.svg];
        options = svgArray.map(function(s, index) {
          return {
            key: `${index}=VolcanoPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });
        const isMultifeaturePlot =
          plotDataMultiFeature?.key?.includes('features') || false;
        if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
          const multiFeaturePlotTypes = differentialPlotTypes.filter(
            p => !p.plotType.includes('multiFeature'),
          );
          let metafeaturesDropdown = [
            {
              key: 'Feature-Data-SVG-Plot',
              text: 'Feature Data',
              value: multiFeaturePlotTypes.length,
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
                excelVisible={excelFlagMFPlots}
                pdfVisible={pdfFlagMFPlots}
                pngVisible={pngFlagMFPlots}
                svgVisible={svgFlagMFPlots}
                txtVisible={txtFlagMFPlots}
                tab={tab}
                imageInfo={plotDataMultiFeature}
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
                onClick={this.props.onGetMultifeaturePlotTransitionAlt}
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
    return this.state.multiFeaturePlotContent;
  }
}

export default MultiFeaturePlots;
