import React, { Component } from 'react';
import { Button, Label } from 'semantic-ui-react';
import * as saveSvgAsPng from 'save-svg-as-png';
import { excelService } from '../../services/excel.service';
import { pdfService } from '../../services/pdf.service';
import './ButtonActions.scss';

class ButtonActions extends Component {
  static defaultProps = {
    excelVisible: true,
    pngVisible: true,
    pdfVisible: true
  };

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     currentSVG: null
  //   };
  // }

  componentDidMount() {
    // const svgElements = document.getElementsByClassName("ContentContainer") || null;
    // const currentContentContainer = svgElements[0] || null;
    // const currentSVGVar = currentContentContainer.getElementsByTagName('svg')[0] || null;
    // this.setState({
    //   currentSVG: currentSVGVar
    // })
  }

  ExcelExport = () => {
    excelService.exportAsExcelFile(
      this.props.treeDataRaw,
      this.props.imageInfo.title + '_Peptide_Data'
    );
  };

  PNGExport = () => {
    const svgElements =
      document.getElementsByClassName('ContentContainer') || null;
    const isMultisetPlot = this.props.visible;
    if (isMultisetPlot) {
      const MultisetPlotName = this.getMultisetPlotName('png');
      const currentSVG = document.getElementById('multisetAnalysisSVG') || null;
      saveSvgAsPng.saveSvgAsPng(currentSVG, MultisetPlotName);
    } else {
      const currentContentContainer =
        document.getElementById('PlotSVG') || null;
      const ProteinPlotName = `${this.props.imageInfo.title} - ${this.props.imageInfo.svg[this.props.activeSVGTabIndex].plotType}.png`;
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      saveSvgAsPng.saveSvgAsPng(currentSVG, ProteinPlotName);
    }
  };

  PDFExport = () => {
    const svgElements =
      document.getElementsByClassName('ContentContainer') || null;
    const isMultisetPlot = this.props.visible;
    if (isMultisetPlot) {
      const currentSVG = document.getElementById('multisetAnalysisSVG') || null;
      pdfService.createPDF(currentSVG);
    } else {
      const currentContentContainer =
        document.getElementById('PlotSVG') || null;
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      pdfService.createPDF(currentSVG);
    }
  };

  SVGExport = () => {
    const svgElements =
      document.getElementsByClassName('ContentContainer') || null;
    const isMultisetPlot = this.props.visible;
    if (isMultisetPlot) {
      const MultisetPlotName = this.getMultisetPlotName('svg');
      const currentSVG = document.getElementById('multisetAnalysisSVG') || null;
      this.exportSVG(currentSVG, MultisetPlotName);
    } else {
      const ProteinPlotName = `${this.props.imageInfo.title}-${this.props.imageInfo.svg[this.props.activeSVGTabIndex].plotType}.svg`;
      const currentContentContainer =
        document.getElementById('PlotSVG') || null;
      const currentSVG =
        currentContentContainer.getElementsByTagName('svg')[0] || null;
      this.exportSVG(currentSVG, ProteinPlotName);
    }
  };

  exportSVG = (svgEl, name) => {
    svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = svgEl.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], {
      type: 'image/svg+xml;charset=utf-8'
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
    if (this.props.tab === 'pepplot') {
      return `${this.props.pepplotStudy}-${this.props.pepplotModel}-MultisetPlot.${exporttype}`;
    } else if (this.props.tab === 'enrichment') {
      return `${this.props.enrichmentStudy}-${this.props.enrichmentModel}-MultisetPlot.${exporttype}`;
    } else return '';
  };

  getExcelButton = () => {
    if (this.props.excelVisible) {
      return (
        <Button className="ExportButton" onClick={this.ExcelExport}>
          Data (.xls)
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

  render() {
    const excelButton = this.getExcelButton();
    const pdfButton = this.getPDFButton();
    const pngButton = this.getPNGButton();
    const svgButton = this.getSVGButton();
    return (
      <div className="ButtonActions">
        <Button.Group className="ExportButtonGroup" floated="right">
          <Button as="div" labelPosition="left">
            <Label basic pointing="right" className="ExportButtonGroupLabel">
              EXPORT
            </Label>
            {excelButton}
          </Button>
          {svgButton}
          {pdfButton}
          {pngButton}
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
