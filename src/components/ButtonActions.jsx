import React, { Component } from 'react';
import { Button, Label } from 'semantic-ui-react';
import * as saveSvgAsPng from 'save-svg-as-png';
import { excelService } from '../services/excel.service';
import { pdfService } from '../services/pdf.service';
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

  PNGExport = () => {
    debugger;
    const svgElements =
      document.getElementsByClassName('ContentContainer') || null;
    const currentContentContainer = svgElements[0] || null;
    const currentSVG =
      currentContentContainer.getElementsByTagName('svg')[0] || null;
    if (currentSVG.id === 'multisetAnalysisSVG') {
      saveSvgAsPng.saveSvgAsPng(currentSVG, 'Multiset_Analysis_Plot.png');
    } else {
      saveSvgAsPng.saveSvgAsPng(
        currentSVG,
        this.props.imageInfo.title +
          '-' +
          this.props.imageInfo.svg[this.props.activeSVGTabIndex].plotType +
          '.png'
      );
    }
  };

  ExcelExport = () => {
    excelService.exportAsExcelFile(
      this.props.treeDataRaw,
      this.props.imageInfo.title + '_Peptide_Data'
    );
  };

  PDFExport = () => {
    const svgElements =
      document.getElementsByClassName('ContentContainer') || null;
    const currentContentContainer = svgElements[0] || null;
    const currentSVG =
      currentContentContainer.getElementsByTagName('svg')[0] || null;
    pdfService.createPDF(currentSVG);
  };

  SVGExport = () => {
    //upsetPlotInfo.svg
    console.log('SVG export coming soon');
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
          {pngButton}
          {pdfButton}
          {svgButton}
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
