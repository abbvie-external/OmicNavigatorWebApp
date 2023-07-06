import React, { PureComponent } from 'react';
import {
  Loader,
  Dimmer,
  Tab,
  Popup,
  // Icon,
  // Message,
  // Menu,
  // Label,
  Dropdown,
} from 'semantic-ui-react';
import SVG from 'react-inlinesvg';
import { roundToPrecision, loadingDimmer } from '../Shared/helpers';
import ButtonActions from '../Shared/ButtonActions';
import PlotlyEnrichment from './PlotlyEnrichment';
import './EnrichmentSVGPlot.scss';
import { isObjectEmpty } from '../Shared/helpers';

class EnrichmentSVGPlot extends PureComponent {
  state = {
    activeSVGTabIndexEnrichment: 0,
    plotlyExport: false,
    plotlyExportType: 'svg',
  };

  enrichmentSingleFeatureRef = React.createRef();

  // componentMount(prevProps) {
  //   this.getSvgPanesEnrichment();
  // }

  componentDidUpdate(prevProps) {
    const {
      divHeight,
      divWidth,
      enrichmentStudy,
      enrichmentModel,
      plotDataEnrichment,
      plotDataEnrichmentLength,
      enrichmentPlotTypes,
    } = this.props;
    const { activeSVGTabIndexEnrichment } = this.state;
    const plotKey = plotDataEnrichment.key;
    const plotId = enrichmentPlotTypes[activeSVGTabIndexEnrichment]?.plotID;
    const cacheStringArg = `singleFeaturePanesEnrichment_${activeSVGTabIndexEnrichment}_${divHeight}_${divWidth}_${plotId}_${plotKey}_${plotDataEnrichmentLength}_${enrichmentStudy}_${enrichmentModel}`;
    this.getSvgPanesEnrichment(cacheStringArg);
  }

  handlePlotDropdownChange = (e, { value }) => {
    this.setState({
      activeSVGTabIndexEnrichment: value,
    });
  };

  // navigateToDifferentialFeature = evt => {
  //   const testAndDescription = this.props.plotDataEnrichment.key.split(':');
  //   const test = testAndDescription[0] || '';
  //   const featureID = this.props.HighlightedProteins[0]?.featureID;
  //   this.props.onFindDifferentialFeature(test, featureID);
  // };

  getSvgPanesEnrichment = (cacheStringArg) => {
    if (this.cacheString === cacheStringArg) return;
    this.cacheString = cacheStringArg;
    const {
      plotDataEnrichment,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotDataEnrichmentLength,
    } = this.props;
    const { activeSVGTabIndexEnrichment } = this.state;
    let panes = [];
    let dimensions = '';
    let divWidthPt = 0;
    let divHeightPt = 0;
    let divWidthPadding = 0;
    let divHeightPadding = 0;
    if (plotDataEnrichmentLength > 0) {
      if (divWidth && divHeight && pxToPtRatio) {
        divWidthPt = roundToPrecision(divWidth / pxToPtRatio, 1);
        divHeightPt = roundToPrecision(divHeight / pxToPtRatio, 1);
        divWidthPadding = divWidth * 0.7;
        divHeightPadding = divHeight * 0.85;
        const divWidthPtString = `width=${divWidthPt}`;
        const divHeightPtString = `&height=${divHeightPt}`;
        const pointSizeString = `&pointsize=${pointSize}`;
        dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
      }
      const s = plotDataEnrichment?.svg[activeSVGTabIndexEnrichment];
      if (s) {
        let srcUrl = `${s.svg}${dimensions}`;
        const isPlotlyPlot = s.plotType.plotType.includes('plotly');
        const svgPanes = {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane attached="true" as="div" key={`${cacheStringArg}`}>
              <div id="EnrichmentPlotSVGDiv" className="svgSpan">
                {isPlotlyPlot ? (
                  <PlotlyEnrichment
                    cacheString={cacheStringArg}
                    plotlyData={s.svg}
                    height={divHeightPadding}
                    width={divWidthPadding}
                    plotName={s.plotType.plotDisplay}
                    plotlyExport={this.state.plotlyExport}
                    plotlyExportType={this.state.plotlyExportType}
                    plotId={plotDataEnrichment?.key}
                    parentNode={this.enrichmentSingleFeatureRef}
                  />
                ) : s.svg ? (
                  <SVG
                    cacheRequests={true}
                    src={srcUrl}
                    uniqueHash="e5j2h5"
                    uniquifyIDs={true}
                    id="EnrichmentPlotSVG"
                  />
                ) : (
                  <div className="PlotInstructions">
                    <h4 className="PlotInstructionsText NoSelect">
                      {s.plotType.plotDisplay} is not available for{' '}
                      {plotDataEnrichment?.key}
                    </h4>
                  </div>
                )}
              </div>
            </Tab.Pane>
          ),
        };
        panes = panes.concat(svgPanes);
        this.setState({
          isSVGReadyEnrichment: true,
          svgPanesEnrichment: panes,
        });
      }
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
      plotDataEnrichment,
      svgExportName,
      tab,
      SVGPlotLoaded,
      SVGPlotLoading,
      enrichmentModel,
      enrichmentPlotDescriptions,
    } = this.props;

    const {
      activeSVGTabIndexEnrichment,
      svgPanesEnrichment,
      isSVGReadyEnrichment,
    } = this.state;

    if (isSVGReadyEnrichment) {
      if (plotDataEnrichment.key != null && SVGPlotLoaded) {
        const DropdownClass =
          this.props.enrichmentPlotTypes.length > this.props.svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClassEnrichment =
          this.props.enrichmentPlotTypes.length > this.props.svgTabMax
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
        const activeSVGTabIndexEnrichmentVar = activeSVGTabIndexEnrichment || 0;
        const svgArray = plotDataEnrichment.svg;
        const plotOptions = svgArray.map(function (s, index) {
          return {
            key: `${index}=EnrichmentPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });

        let enrichmentPlotDescription = null;
        let currentEnrichmentPlotDescriptions =
          enrichmentPlotDescriptions?.[enrichmentModel] || {};
        const currentPlotText =
          plotOptions?.[activeSVGTabIndexEnrichment]?.text || null;
        if (!isObjectEmpty(currentEnrichmentPlotDescriptions)) {
          const DescriptionsAsArray = Object.entries(
            currentEnrichmentPlotDescriptions,
          );
          if (DescriptionsAsArray.length && currentPlotText) {
            let currentEnrichmentPlotDescription =
              DescriptionsAsArray.filter(
                (p) => p[1].displayName === currentPlotText,
              ) || null;
            enrichmentPlotDescription = currentEnrichmentPlotDescription.length
              ? currentEnrichmentPlotDescription?.[0]?.[1]?.description
              : null;
          }
        }

        return (
          <div
            className="svgContainerEnrichment"
            ref={this.enrichmentSingleFeatureRef}
          >
            <div className="export-svg ShowBlock">
              <ButtonActions
                exportButtonSize={'mini'}
                excelVisible={false}
                pdfVisible={false}
                pngVisible={true}
                svgVisible={true}
                txtVisible={false}
                tab={tab}
                imageInfo={plotDataEnrichment}
                tabIndex={activeSVGTabIndexEnrichmentVar}
                svgExportName={svgExportName}
                plot="EnrichmentPlotSVGDiv"
                feature={plotDataEnrichment?.key}
                handlePlotlyExport={this.handlePlotlyExport}
                fwdRef={this.enrichmentSingleFeatureRef}
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
            {enrichmentPlotDescription ? (
              <Popup
                trigger={
                  <Dropdown
                    search
                    selection
                    compact
                    options={plotOptions}
                    value={plotOptions[activeSVGTabIndexEnrichmentVar]?.value}
                    onChange={this.handlePlotDropdownChange}
                    className={DropdownClass}
                  />
                }
                basic
                inverted
                position="bottom center"
                closeOnDocumentClick
                closeOnEscape
                hideOnScroll
              >
                <Popup.Content>{enrichmentPlotDescription}</Popup.Content>
              </Popup>
            ) : (
              <Dropdown
                search
                selection
                compact
                options={plotOptions}
                value={plotOptions[activeSVGTabIndexEnrichmentVar]?.value}
                onChange={this.handlePlotDropdownChange}
                className={DropdownClass}
              />
            )}
            <Tab
              menu={{
                secondary: true,
                pointing: true,
                className: TabMenuClassEnrichment,
              }}
              panes={svgPanesEnrichment}
              activeIndex={0}
            />
          </div>
        );
      } else if (!SVGPlotLoaded & !SVGPlotLoading) {
        return (
          <div className="PlotInstructions">
            <h4 className="PlotInstructionsText">
              Select barcode line/s to display SVG Plot
            </h4>
          </div>
        );
      } else if (!SVGPlotLoaded & SVGPlotLoading) {
        return (
          <Dimmer active inverted>
            <Loader size="large">Loading Plots</Loader>
          </Dimmer>
        );
      } else {
        return <div>{loadingDimmer}</div>;
      }
    } else return null;
  }
}

export default EnrichmentSVGPlot;
