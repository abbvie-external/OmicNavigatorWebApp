import React, { Component } from 'react';
import { Button, Label } from 'semantic-ui-react';
import * as saveSvgAsPng from 'save-svg-as-png';
// import { excelService } from '../../services/excel.service';
import { pdfService } from '../../services/pdf.service';
import './ButtonActions.scss';

class ButtonActions extends Component {
  static defaultProps = {
    excelVisible: false,
    pngVisible: false,
    pdfVisible: false,
    svgVisible: false,
    txtVisible: false,
    exportButtonSize: 'medium',
  };

  PNGExport = () => {
    if (this.props.plot === 'multisetDifferential') {
      const MultisetPlotName = this.getMultisetPlotName('png');
      const currentSVG =
        document.getElementById('multisetAnalysisSVGDifferential') || null;
      saveSvgAsPng.saveSvgAsPng(currentSVG, MultisetPlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    } else if (this.props.plot === 'multisetEnrichment') {
      const MultisetPlotName = this.getMultisetPlotName('png');
      const currentSVG =
        document.getElementById('multisetAnalysisSVGEnrichment') || null;
      saveSvgAsPng.saveSvgAsPng(currentSVG, MultisetPlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    } else if (this.props.plot === 'barcode') {
      const currentSVG = document.getElementById('svg-chart-barcode') || null;
      const PlotName = 'barcode.png';
      saveSvgAsPng.saveSvgAsPng(currentSVG, PlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    } else if (this.props.plot === 'violin') {
      const ViolinPlotName = 'violin.png';
      const currentSVG = document.getElementById('svg-violin-graph-1') || null;
      saveSvgAsPng.saveSvgAsPng(currentSVG, ViolinPlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    } else {
      let PlotName = this.props.imageInfo
        ? `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
            this.props.imageInfo?.key
          }.png`
        : 'svgPlot.png';
      if (this.props.tab === 'enrichment') {
        PlotName =
          `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
            this.props.svgExportName
          }.png` || 'svgPlot.png';
      }
      const currentContentContainer =
        document.getElementById('PlotSVG') ||
        document.getElementById('DifferentialPlotTabsPlotSVG');
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      saveSvgAsPng.saveSvgAsPng(currentSVG, PlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    }
  };

  PDFExport = () => {
    console.log(this.props);
    const isMultisetPlot = this.props.visible;
    if (isMultisetPlot) {
      const currentSVG = document.getElementById('multisetAnalysisSVG') || null;
      pdfService.createPDF(currentSVG);
    } else if (this.props.plot === 'barcode') {
      const currentContentContainer =
        document.getElementById('chart-barcode') || null;
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      // pdfService.createPDF(currentSVG);
      pdfService.convertToPdf(currentSVG);
    } else {
      const currentContentContainer =
        document.getElementById('PlotSVG') ||
        document.getElementById('DifferentialPlotTabsPlotSVG');
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      pdfService.createPDF(currentSVG);
    }
  };

  SVGExport = () => {
    // const svgElements =
    //   document.getElementsByClassName('ContentContainer') || null;
    if (this.props.plot === 'multisetDifferential') {
      const MultisetPlotName = this.getMultisetPlotName('svg');
      const currentSVG =
        document.getElementById('multisetAnalysisSVGDifferential') || null;
      this.exportSVG(currentSVG, MultisetPlotName);
    } else if (this.props.plot === 'multisetEnrichment') {
      const MultisetPlotName = this.getMultisetPlotName('svg');
      const currentSVG =
        document.getElementById('multisetAnalysisSVGEnrichment') || null;
      this.exportSVG(currentSVG, MultisetPlotName);
    } else if (this.props.plot === 'barcode') {
      const BarcodePlotName = 'barcode.svg';
      const currentSVG = document.getElementById('svg-chart-barcode') || null;
      this.exportSVG(currentSVG, BarcodePlotName);
    } else if (this.props.plot === 'violin') {
      const ViolinPlotName = 'violin.svg';
      const currentSVG = document.getElementById('svg-violin-graph-1') || null;
      this.exportSVG(currentSVG, ViolinPlotName);
    } else {
      let PlotName = this.props.imageInfo
        ? `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
            this.props.imageInfo?.key
          }.svg`
        : 'svgPlot.svg';
      if (this.props.tab === 'enrichment') {
        PlotName =
          `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
            this.props.svgExportName
          }.svg` || 'svgPlot.svg';
      }
      const currentContentContainer =
        document.getElementById('PlotSVG') ||
        document.getElementById('DifferentialPlotTabsPlotSVG');
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      this.exportSVG(currentSVG, PlotName);
    }
  };

  exportSVG = (svgEl, name) => {
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = svgEl.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  getMultisetPlotName = exporttype => {
    return `${this.props.study}_${this.props.model}_MultisetPlot.${exporttype}`;
  };

  getExcelButton = () => {
    if (this.props.excelVisible) {
      return <Button className="ExportButton">Data (.xls)</Button>;
    }
  };

  getPNGButton = () => {
    if (this.props.pngVisible) {
      return (
        <Button className="ExportButton" onClick={this.PNGExport}>
          PNG
        </Button>
      );
    }
  };

  getPDFButton = () => {
    if (this.props.pdfVisible) {
      return (
        <Button className="ExportButton" onClick={this.PDFExport}>
          PDF
        </Button>
      );
    }
  };

  getSVGButton = () => {
    if (this.props.svgVisible) {
      return (
        <Button className="ExportButton" onClick={this.SVGExport}>
          SVG
        </Button>
      );
    }
  };

  getTxtButton = () => {
    if (this.props.txtVisible) {
      return (
        <Button className="ExportButton" onClick={this.SVGExport}>
          TXT
        </Button>
      );
    }
  };

  render() {
    const {
      excelVisible,
      pdfVisible,
      pngVisible,
      svgVisible,
      txtVisible,
    } = this.props;
    const excelButton = this.getExcelButton();
    const pdfButton = this.getPDFButton();
    const pngButton = this.getPNGButton();
    const svgButton = this.getSVGButton();
    const txtButton = this.getTxtButton();
    const buttonSize = this.props.exportButtonSize;
    const noneVisible =
      !excelVisible && !pdfVisible && !pngVisible && !svgVisible && !txtVisible;
    return (
      <div className="ButtonActions">
        <Button.Group
          className={
            noneVisible ? 'Hide ExportButtonGroup' : 'ExportButtonGroup'
          }
          floated="right"
          size={buttonSize}
        >
          <Button as="div" labelPosition="left">
            <Label basic pointing="right" className="ExportButtonGroupLabel">
              EXPORT
            </Label>
            {excelButton}
          </Button>
          {svgButton}
          {pdfButton}
          {pngButton}
          {txtButton}
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
