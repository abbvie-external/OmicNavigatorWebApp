import React, { Component } from 'react';
import {
  Loader,
  Dimmer,
  Popup,
  Icon,
  Label,
  Button,
  Dropdown,
  List,
} from 'semantic-ui-react';
import ButtonActions from '../Shared/ButtonActions';
import TabMultiFeature from './TabMultiFeature';
import './PlotsDynamic.scss';
import '../Shared/PlotlyOverrides.scss';
import { isObjectEmpty } from '../Shared/helpers';

class PlotsMultiFeature extends Component {
  state = {
    activeTabIndexPlotsMultiFeature: 0,
    excelFlagMFPlots: false,
    txtFlagMFPlots: false,
    pdfFlagMFPlots: false,
    svgFlagMFPlots: true,
    pngFlagMFPlots: true,
    featuresListOpen: false,
    plotlyExport: false,
    plotlyExportType: 'svg',
  };

  differentialDetailPlotsMultiFeatureRef = React.createRef();

  handleTabChangeMultiFeature = (e, { activeTabIndexPlotsMultiFeature }) => {
    if (
      activeTabIndexPlotsMultiFeature !==
      this.state.activeTabIndexPlotsMultiFeature
    ) {
      this.setState({
        activeTabIndexPlotsMultiFeature: activeTabIndexPlotsMultiFeature,
      });
    }
  };

  handlePlotDropdownChangeMultiFeature = (e, { value }) => {
    this.setState({
      activeTabIndexPlotsMultiFeature: value,
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
    this.props.onHandleHighlightedFeaturesDifferential([], false);
  };

  getFeaturesList = () => {
    const {
      divWidth,
      differentialHighlightedFeaturesData,
      plotMultiFeatureMax,
    } = this.props;
    let features = [];
    // const uniqueFeaturesHighlighted = [
    //   ...new Map(
    //     differentialHighlightedFeaturesData.map(item => [item.id, item]),
    //   ).values(),
    // ];
    const featuresHighlighted =
      differentialHighlightedFeaturesData?.length || null;
    if (featuresHighlighted > 10) {
      let shortenedArr = [...differentialHighlightedFeaturesData].slice(0, 10);
      features = shortenedArr.map((m) => m.key);
    } else {
      if (featuresHighlighted > 0) {
        features = [...differentialHighlightedFeaturesData].map((m) => m.key);
      }
    }
    const featuresListHorizontalStyle = {
      minWidth: divWidth * 0.9,
      maxWidth: divWidth * 0.9,
    };
    const manyFeaturesText =
      featuresHighlighted >= plotMultiFeatureMax ? (
        <span id="MoreThanText">
          Plotting is limited to the first {plotMultiFeatureMax} features
        </span>
      ) : (
        <span id="MoreThanText">
          {featuresHighlighted} features selected. Individual de-select disabled
          when 11+ features.
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
          {featuresHighlighted > 10 ? manyFeaturesText : null}
        </List.Item>
        {featuresHighlighted > 10
          ? null
          : features.map((f) => {
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
              {featuresHighlighted} {divWidth >= 625 ? 'FEATURES' : ''}
            </Button>
          }
          // style={StudyPopupStyle}
          id="FeaturesListTooltip"
          basic
          on="click"
          inverted
          position="bottom center"
          open={this.state.featuresListOpen}
          onClose={(e) => this.toggleFeaturesListPopup(e, null, true)}
          closeOnDocumentClick
          closeOnEscape
          hideOnScroll
        >
          <Popup.Content id="FeaturesListPopupContent">{list}</Popup.Content>
        </Popup>
      </span>
    );
    return div;
  };

  getInstructions = () => {
    const { differentialPlotTypes } = this.props;
    const hasPlots = differentialPlotTypes?.length > 0 || false;
    if (hasPlots) {
      return 'Select 2 or more features to display plots';
    } else {
      return 'Multi-feature plots are unavailable';
    }
  };

  handlePlotlyExport = (plotlyExportType) => {
    this.setState(
      {
        plotlyExport: true,
        plotlyExportType,
      },
      function () {
        // callback to reset plotly export in progress to false
        this.setState({ plotlyExport: false });
      },
    );
  };

  render() {
    const {
      differentialPlotTypes,
      differentialStudy,
      differentialModel,
      differentialTest,
      differentialTestIdsCommon,
      differentialHighlightedFeaturesData,
      divWidth,
      divHeight,
      modelSpecificMetaFeaturesExist,
      multiFeaturePlotTypes,
      plotMultiFeatureDataLoaded,
      plotMultiFeatureData,
      pointSize,
      plotMultiFeatureDataLength,
      pxToPtRatio,
      svgTabMax,
      svgExportName,
      tab,
      upperPlotsVisible,
      differentialPlotDescriptions,
      onHandlePlotlyClick,
    } = this.props;
    const {
      activeTabIndexPlotsMultiFeature,
      plotlyExport,
      plotlyExportType,
      pdfFlagMFPlots,
      pngFlagMFPlots,
      svgFlagMFPlots,
      txtFlagMFPlots,
      excelFlagMFPlots,
    } = this.state;
    if (upperPlotsVisible) {
      if (
        plotMultiFeatureDataLength !== 0 &&
        plotMultiFeatureData.key != null &&
        differentialHighlightedFeaturesData?.length > 1
      ) {
        let options = [];
        const DropdownClass =
          differentialPlotTypes.length > svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const activeTabIndexPlotsMultiFeatureVar =
          activeTabIndexPlotsMultiFeature || 0;
        const svgArray = [...plotMultiFeatureData.svg];
        options = svgArray.map(function (s, index) {
          return {
            key: `${index}=VolcanoPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });
        const isMultifeaturePlot =
          plotMultiFeatureData?.key?.includes('features') || false;
        if (modelSpecificMetaFeaturesExist !== false && !isMultifeaturePlot) {
          const multiFeaturePlotTypes = differentialPlotTypes.filter(
            (p) => !p.plotType.includes('multiFeature'),
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
        const loader = plotMultiFeatureDataLoaded ? null : (
          <Dimmer active inverted>
            <Loader size="large">Loading Multi-Feature Plots</Loader>
          </Dimmer>
        );
        let differentialPlotDescription = null;
        let currentDifferentialPlotDescriptions =
          differentialPlotDescriptions?.[differentialModel] || {};
        const currentPlotText =
          options?.[activeTabIndexPlotsMultiFeatureVar]?.text || null;
        if (!isObjectEmpty(currentDifferentialPlotDescriptions)) {
          const DescriptionsAsArray = Object.entries(
            currentDifferentialPlotDescriptions,
          );
          if (DescriptionsAsArray.length && currentPlotText) {
            let currentDifferentialPlotDescription =
              DescriptionsAsArray.filter(
                (p) => p[1].displayName === currentPlotText,
              ) || null;
            differentialPlotDescription =
              currentDifferentialPlotDescription.length
                ? currentDifferentialPlotDescription?.[0]?.[1]?.description
                : null;
          }
        }
        return (
          <div
            className="differentialDetailSvgContainer"
            ref={this.differentialDetailPlotsMultiFeatureRef}
          >
            <div className="export-svg ShowBlock">
              <ButtonActions
                exportButtonSize={'mini'}
                excelVisible={excelFlagMFPlots}
                pdfVisible={pdfFlagMFPlots}
                pngVisible={pngFlagMFPlots}
                svgVisible={svgFlagMFPlots}
                txtVisible={txtFlagMFPlots}
                tab={tab}
                imageInfo={plotMultiFeatureData}
                tabIndex={activeTabIndexPlotsMultiFeatureVar}
                svgExportName={svgExportName}
                plot="PlotsMultiFeatureContainer"
                handlePlotlyExport={this.handlePlotlyExport}
                fwdRef={this.differentialDetailPlotsMultiFeatureRef}
              />
            </div>
            {differentialPlotDescription ? (
              <Popup
                trigger={
                  <Dropdown
                    search
                    selection
                    compact
                    options={options}
                    value={
                      options[activeTabIndexPlotsMultiFeatureVar]?.value ||
                      options[0]?.value
                    }
                    onChange={this.handlePlotDropdownChangeMultiFeature}
                    className={DropdownClass}
                    id="svgPlotDropdownDifferential"
                  />
                }
                basic
                inverted
                position="bottom center"
                closeOnDocumentClick
                closeOnEscape
                hideOnScroll
              >
                <Popup.Content>{differentialPlotDescription}</Popup.Content>
              </Popup>
            ) : (
              <Dropdown
                search
                selection
                compact
                options={options}
                value={
                  options[activeTabIndexPlotsMultiFeatureVar]?.value ||
                  options[0]?.value
                }
                onChange={this.handlePlotDropdownChangeMultiFeature}
                className={DropdownClass}
                id="svgPlotDropdownDifferential"
              />
            )}
            <TabMultiFeature
              activeTabIndexPlotsMultiFeature={activeTabIndexPlotsMultiFeature}
              differentialDetailPlotsMultiFeatureRefFwd={
                this.differentialDetailPlotsMultiFeatureRef
              }
              differentialHighlightedFeaturesData={
                differentialHighlightedFeaturesData
              }
              divHeight={divHeight}
              divWidth={divWidth}
              differentialPlotTypes={differentialPlotTypes}
              differentialStudy={differentialStudy}
              differentialModel={differentialModel}
              differentialTest={differentialTest}
              differentialTestIdsCommon={differentialTestIdsCommon}
              plotlyExport={plotlyExport}
              plotlyExportType={plotlyExportType}
              plotMultiFeatureData={plotMultiFeatureData}
              pointSize={pointSize}
              plotMultiFeatureDataLength={plotMultiFeatureDataLength}
              pxToPtRatio={pxToPtRatio}
              multiFeaturePlotTypes={multiFeaturePlotTypes}
              svgTabMax={svgTabMax}
              onHandlePlotlyClick={onHandlePlotlyClick}
            />
            {featuresList}
            <span id={divWidth >= 625 ? 'FullScreenButton' : 'FullScreenIcon'}>
              <Button
                size="mini"
                onClick={this.props.onGetMultifeaturePlotTransitionAlt}
                className={divWidth >= 625 ? '' : 'FullScreenPadding'}
              >
                <Icon name="expand arrows alternate" className="" />
                {divWidth >= 625 ? 'FULL SCREEN' : ''}
              </Button>
            </span>
            <span id="PlotMultiFeatureDataLoader">{loader}</span>
          </div>
        );
      } else {
        let instructions = this.getInstructions();
        return (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText NoSelect">{instructions}</h4>
          </div>
        );
      }
    } else return null;
  }
}

export default PlotsMultiFeature;
