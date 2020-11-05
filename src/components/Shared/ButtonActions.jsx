import React, { Component } from 'react';
import { Button, Label } from 'semantic-ui-react';
import * as saveSvgAsPng from 'save-svg-as-png';
// import { excelService } from '../../services/excel.service';
import { pdfService } from '../../services/pdf.service';
import './ButtonActions.scss';
import { toast } from 'react-toastify';

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
    if (this.props.imageInfo == null) {
      let PlotName = `${this.props.plot}.png`;
      // for Barcode, Violin
      if (this.props.description != null) {
        PlotName = `${this.props.plot}_${this.props.description}.png`;
      }
      if (this.props.study != null) {
        // for Multiset Analysis
        PlotName = `${this.props.study}_${this.props.model}_MultisetPlot.png`;
      }
      const Plot = document.getElementById(this.props.plot) || null;
      saveSvgAsPng.saveSvgAsPng(Plot, PlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    } else if (this.props.plot === 'differentialVolcanoPlot') {
      const currentSVG = document.getElementById(this.props.plot) || null;
      const ProteinPlotName = 'Volcano.png';
      saveSvgAsPng.saveSvgAsPng(currentSVG, ProteinPlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    } else {
      // for reusable SVG Plot
      let PlotName =
        `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
          this.props.imageInfo?.key
        }.png` || `${this.props.plot}.png`;
      if (this.props.tab === 'enrichment') {
        PlotName =
          `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
            this.props.svgExportName
          }.png` || `${this.props.plot}.png`;
      }
      const currentContentContainer =
        document.getElementById('PlotSVG') ||
        document.getElementById('DifferentialPlotTabsPlotSVG');
      const Plot =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      saveSvgAsPng.saveSvgAsPng(Plot, PlotName, {
        encoderOptions: 1,
        scale: 2,
      });
    }
  };

  SVGExport = () => {
    if (this.props.imageInfo == null) {
      let PlotName = `${this.props.plot}.svg`;
      // for Barcode, Violin
      if (this.props.description != null) {
        PlotName = `${this.props.plot}_${this.props.description}.svg`;
      }
      if (this.props.study != null) {
        // for Multiset Analysis
        PlotName = `${this.props.study}_${this.props.model}_MultisetPlot.svg`;
      }
      const Plot = document.getElementById(this.props.plot) || null;
      this.exportSVG(Plot, PlotName);
    } else {
      // for reusable SVG Plot
      let PlotName =
        `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
          this.props.imageInfo?.key
        }.svg` || `${this.props.plot}.svg`;
      if (this.props.tab === 'enrichment') {
        PlotName =
          `${this.props.imageInfo?.svg[this.props.tabIndex]?.plotType.plotID}_${
            this.props.svgExportName
          }.svg` || `${this.props.plot}.svg`;
      }
      const currentContentContainer =
        document.getElementById('PlotSVG') ||
        document.getElementById('DifferentialPlotTabsPlotSVG');
      const Plot =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      this.exportSVG(Plot, PlotName);
    }
  };

  exportSVG = (svgEl, name) => {
    if (svgEl != null) {
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
    } else {
      toast.error("SVG couldn't be created; please try again");
    }
  };

  TextExport = () => {
    const sortedData =
      this.props.refFwd.current?.qhGridRef.current?.getSortedData() || [];
    const jsonToTxt = require('json-to-txt');
    const dataInString = jsonToTxt({ data: sortedData });
    var a = document.createElement('a');
    var file = new Blob([dataInString], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = `${this.props.tab}-${this.props.study}-${this.props.model}-${this.props.test}`;
    a.click();
  };

  ExcelExport = () => {
    const excelExport = this.props.refFwd?.current?.qhGridRef.current ?? null;
    if (excelExport != null) {
      excelExport.exportExcel(
        `${this.props.tab}-${this.props.study}-${this.props.model}-${this.props.test}`,
      );
    }
  };

  PDFExport = () => {
    debugger;
    console.log(this.props);
    const isMultisetPlot = this.props.visible;
    if (isMultisetPlot) {
      const Plot = document.getElementById('multisetAnalysisSVG') || null;
      pdfService.createPDF(Plot);
    } else if (this.props.plot === 'barcode') {
      const currentContentContainer =
        document.getElementById('barcodeChart') || null;
      const Plot =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      // pdfService.createPDF(Plot);
      pdfService.convertToPdf(Plot);
    } else {
      const currentContentContainer =
        document.getElementById('PlotSVG') ||
        document.getElementById('DifferentialPlotTabsPlotSVG');
      const Plot =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      pdfService.createPDF(Plot);
    }
  };

  getExcelButton = () => {
    if (this.props.excelVisible) {
      return (
        <Button className="ExportButton" onClick={this.ExcelExport}>
          XLS
        </Button>
      );
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
        <Button className="ExportButton" onClick={this.TextExport}>
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
          </Button>
          {txtButton}
          {svgButton}
          {pdfButton}
          {pngButton}
          {excelButton}
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
