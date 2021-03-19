import React, { Component } from 'react';
import { Button, Label } from 'semantic-ui-react';
import * as saveSvgAsPng from 'save-svg-as-png';
// import { excelService } from '../../services/excel.service';
import { pdfService } from '../../services/pdf.service';
import './ButtonActions.scss';
import { toast } from 'react-toastify';

class ButtonActions extends Component {
  static defaultProps = {
    exportButtonSize: 'small',
    excelVisible: false,
    pngVisible: false,
    pdfVisible: false,
    svgVisible: false,
    txtVisible: false,
  };

  PNGExport = () => {
    const {
      imageInfo,
      plot,
      description,
      study,
      model,
      plotName,
      tab,
      tabIndex,
      svgExportName,
    } = this.props;
    if (imageInfo == null) {
      let plotNoPeriods = plot.replace(/\./g, '_');
      let PlotName = `${plotNoPeriods}.png`;
      // for Barcode, Violin
      if (description != null) {
        let descriptionNoPeriods = description.replace(/\./g, '_');
        PlotName = `${plotNoPeriods}_${descriptionNoPeriods}.png`;
      }
      if (study != null) {
        let studyNoPeriods = study.replace(/\./g, '_');
        let modelNoPeriods = model.replace(/\./g, '_');
        // for Multiset Analysis
        PlotName = `${studyNoPeriods}_${modelNoPeriods}_MultisetPlot.png`;
      }
      if (plotName != null) {
        PlotName = plotName;
      }
      const Plot = document.getElementById(plot) || null;
      // decrease quality if volcano chart
      const encoderOptionsVar = plotNoPeriods !== 'VolcanoChart' ? 1 : 0.1;
      saveSvgAsPng.saveSvgAsPng(Plot, PlotName, {
        encoderOptions: encoderOptionsVar,
        scale: 2,
        backgroundColor: 'white',
      });
    } else {
      // for SVG Plot Tabs
      let PlotName =
        `${imageInfo?.svg[tabIndex]?.plotType.plotID}_${imageInfo?.key}.png` ||
        `${plot}.png`;
      if (tab === 'enrichment') {
        PlotName =
          `${imageInfo?.svg[tabIndex]?.plotType.plotID}_${svgExportName}.png` ||
          `${plot}.png`;
      }
      const currentContentContainer = document.getElementById(`${plot}`);
      const Plot =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      if (Plot) {
        saveSvgAsPng.saveSvgAsPng(Plot, PlotName, {
          encoderOptions: 1,
          scale: 2,
          backgroundColor: 'white',
        });
      }
    }
  };

  SVGExport = () => {
    const {
      imageInfo,
      plot,
      description,
      study,
      model,
      plotName,
      tab,
      tabIndex,
      svgExportName,
    } = this.props;
    if (imageInfo == null) {
      let plotNoPeriods = plot.replace(/\./g, '_');
      let PlotName = `${plotNoPeriods}.svg`;
      // for Barcode, Violin
      if (description != null) {
        let descriptionNoPeriods = description.replace(/\./g, '_');
        PlotName = `${plotNoPeriods}_${descriptionNoPeriods}.svg`;
      }
      if (study != null) {
        let studyNoPeriods = study.replace(/\./g, '_');
        let modelNoPeriods = model.replace(/\./g, '_');
        // for Multiset Analysis
        PlotName = `${studyNoPeriods}_${modelNoPeriods}_MultisetPlot.svg`;
      }
      if (plotName != null) {
        PlotName = plotName;
      }
      const Plot = document.getElementById(plot) || null;
      this.exportSVG(Plot, PlotName);
    } else {
      // for SVG Plot Tabs
      let PlotName =
        `${imageInfo?.svg[tabIndex]?.plotType.plotID}_${imageInfo?.key}.svg` ||
        `${plot}.svg`;
      if (tab === 'enrichment') {
        PlotName =
          `${imageInfo?.svg[tabIndex]?.plotType.plotID}_${svgExportName}.svg` ||
          `${plot}.svg`;
      }
      const currentContentContainer = document.getElementById(`${plot}`);
      const Plot =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      if (Plot) {
        this.exportSVG(Plot, PlotName);
      }
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
    const { study, model, test, tab, refFwd } = this.props;
    let studyNoPeriods = study.replace(/\./g, '_');
    let modelNoPeriods = model.replace(/\./g, '_');
    let testNoPeriods = test.replace(/\./g, '_');
    const sortedData = refFwd.current?.qhGridRef.current?.getSortedData() || [];
    const jsonToTxt = require('json-to-txt');
    const dataInString = jsonToTxt({ data: sortedData });
    let a = document.createElement('a');
    let file = new Blob([dataInString], { type: 'text/plain' });
    a.href = URL.createObjectURL(file);
    a.download = `${tab}-${studyNoPeriods}-${modelNoPeriods}-${testNoPeriods}`;
    a.click();
  };

  ExcelExport = () => {
    const { study, model, test, tab, refFwd } = this.props;
    let studyNoPeriods = study.replace(/\./g, '_');
    let modelNoPeriods = model.replace(/\./g, '_');
    let testNoPeriods = test.replace(/\./g, '_');
    const excelExport = refFwd?.current?.qhGridRef.current ?? null;
    if (excelExport != null) {
      excelExport.exportExcel(
        `${tab}-${studyNoPeriods}-${modelNoPeriods}-${testNoPeriods}`,
      );
    }
  };

  PDFExport = () => {
    const { visible, plot } = this.props;
    const isMultisetPlot = visible;
    if (isMultisetPlot) {
      const Plot = document.getElementById('multisetAnalysisSVG') || null;
      pdfService.createPDF(Plot);
    } else if (plot === 'barcode') {
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
