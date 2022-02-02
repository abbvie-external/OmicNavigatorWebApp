import React, { PureComponent } from 'react';
import {
  Loader,
  Dimmer,
  Tab,
  // Popup,
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

class EnrichmentSVGPlot extends PureComponent {
  state = {
    activeSVGTabIndexEnrichment: 0,
  };

  componentDidUpdate(prevProps) {
    if (
      // this.state.isSVGReadyEnrichment &&
      // prevProps.HighlightedProteins !== this.props.HighlightedProteins ||
      prevProps.plotDataEnrichmentLength !==
        this.props.plotDataEnrichmentLength ||
      prevProps.plotDataEnrichment.key !== this.props.plotDataEnrichment.key ||
      prevProps.divWidth !== this.props.divWidth ||
      prevProps.divHeight !== this.props.divHeight
    ) {
      this.getSVGPanes();
    }
  }

  handleTabChange = (e, { activeIndex }) => {
    this.setState({
      activeSVGTabIndexEnrichment: activeIndex,
    });
  };

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

  getSVGPanes = () => {
    const {
      plotDataEnrichment,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      plotDataEnrichmentLength,
    } = this.props;
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
      const svgArray = plotDataEnrichment.svg;
      const uniqueKey = plotDataEnrichment.key || '';
      const svgPanes = svgArray.map((s, index) => {
        const isPlotlyPlot = s.plotType.plotType.includes('plotly');
        let srcUrl = `${s.svg}${dimensions}`;
        return {
          menuItem: `${s.plotType.plotDisplay}`,
          render: () => (
            <Tab.Pane
              attached="true"
              as="div"
              key={`${uniqueKey}-${index}-${s.plotType.plotDisplay}-pane-enrichment`}
            >
              <div id="EnrichmentPlotSVGDiv" className="svgSpan">
                {isPlotlyPlot ? (
                  <PlotlyEnrichment
                    plotlyData={s.svg}
                    height={divHeightPadding}
                    width={divWidthPadding}
                  />
                ) : (
                  <SVG
                    cacheRequests={true}
                    src={srcUrl}
                    uniqueHash="e5j2h5"
                    uniquifyIDs={true}
                    id="EnrichmentPlotSVG"
                  />
                )}
              </div>
            </Tab.Pane>
          ),
        };
      });
      this.setState({
        isSVGReadyEnrichment: true,
        svgPanes,
      });
    }
  };

  render() {
    const {
      plotDataEnrichment,
      svgExportName,
      tab,
      SVGPlotLoaded,
      SVGPlotLoading,
    } = this.props;

    const {
      activeSVGTabIndexEnrichment,
      svgPanes,
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
        const plotOptions = svgArray.map(function(s, index) {
          return {
            key: `${index}=EnrichmentPlotDropdownOption`,
            text: s.plotType.plotDisplay,
            value: index,
          };
        });
        return (
          <div className="svgContainerEnrichment">
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
              options={plotOptions}
              value={plotOptions[activeSVGTabIndexEnrichmentVar]?.value}
              onChange={this.handlePlotDropdownChange}
              className={DropdownClass}
            />
            <Tab
              menu={{
                secondary: true,
                pointing: true,
                className: TabMenuClassEnrichment,
              }}
              panes={svgPanes}
              onTabChange={this.handleTabChange}
              activeIndex={activeSVGTabIndexEnrichmentVar}
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
