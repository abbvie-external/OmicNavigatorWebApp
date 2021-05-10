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
import './EnrichmentSVGPlot.scss';

class EnrichmentSVGPlot extends PureComponent {
  state = {
    activeSVGTabIndexEnrichment: 0,
  };

  componentDidUpdate(prevProps) {
    if (
      // this.state.isSVGReadyEnrichment &&
      // prevProps.HighlightedProteins !== this.props.HighlightedProteins ||
      prevProps.imageInfoEnrichmentLength !==
        this.props.imageInfoEnrichmentLength ||
      prevProps.imageInfoEnrichment.key !==
        this.props.imageInfoEnrichment.key ||
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
  //   const testAndDescription = this.props.imageInfoEnrichment.key.split(':');
  //   const test = testAndDescription[0] || '';
  //   const featureID = this.props.HighlightedProteins[0]?.featureID;
  //   this.props.onFindDifferentialFeature(test, featureID);
  // };

  getSVGPanes = () => {
    const {
      imageInfoEnrichment,
      divWidth,
      divHeight,
      pxToPtRatio,
      pointSize,
      imageInfoEnrichmentLength,
    } = this.props;
    if (imageInfoEnrichmentLength > 0) {
      let dimensions = '';
      if (divWidth && divHeight && pxToPtRatio) {
        const divWidthPt = roundToPrecision(divWidth / pxToPtRatio, 1);
        const divHeightPt = roundToPrecision(divHeight / pxToPtRatio, 1);
        const divWidthPtString = `width=${divWidthPt}`;
        const divHeightPtString = `&height=${divHeightPt}`;
        const pointSizeString = `&pointsize=${pointSize}`;
        dimensions = `?${divWidthPtString}${divHeightPtString}${pointSizeString}`;
      }
      const svgArray = imageInfoEnrichment.svg;
      const uniqueKey = imageInfoEnrichment.key || '';
      const panes = svgArray.map((s, index) => {
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
                <SVG
                  cacheRequests={true}
                  // description=""
                  // loader={<span>{loadingDimmer}</span>}
                  // onError={error => console.log(error.message)}
                  // onLoad={(src, hasCache) => console.log(src, hasCache)}
                  // preProcessor={code => code.replace(/fill=".*?"/g, 'fill="currentColor"')}
                  src={srcUrl}
                  // title={`${s.plotType.plotDisplay}`}
                  uniqueHash="e5j2h5"
                  uniquifyIDs={true}
                  id="EnrichmentPlotSVG"
                />
              </div>
            </Tab.Pane>
          ),
        };
      });
      this.setState({
        isSVGReadyEnrichment: true,
        svgPanes: panes,
      });
    } else return null;
  };

  render() {
    const {
      imageInfoEnrichment,
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
      if (imageInfoEnrichment.key != null && SVGPlotLoaded) {
        let singleFeaturePlotTypes = [];
        if (this.props.enrichmentPlotTypes.length > 0) {
          singleFeaturePlotTypes = this.props.enrichmentPlotTypes.filter(
            p => p.plotType !== 'multiFeature',
          );
        }
        const DropdownClass =
          singleFeaturePlotTypes.length > this.props.svgTabMax
            ? 'Show svgPlotDropdown'
            : 'Hide svgPlotDropdown';
        const TabMenuClassEnrichment =
          singleFeaturePlotTypes.length > this.props.svgTabMax
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
        const svgArray = imageInfoEnrichment.svg;
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
                imageInfo={imageInfoEnrichment}
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
