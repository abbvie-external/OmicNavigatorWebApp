import React, { Component } from 'react';
import { Button, Label } from 'semantic-ui-react';
import * as saveSvgAsPng from 'save-svg-as-png';
import { excelService } from '../services/excel.service';
// import * as jsPDF from 'jspdf';
// import { pdfService } from '../services/pdf.service';

class ButtonActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      excelVisible: true,
      excelExporting: false,
      excelDisabled: false,
      pngVisible: true,
      pngExporting: false,
      pngDisabled: false,
      pdfVisible: false,
      pdfExporting: false,
      pdfDisabled: false
    };
  }

  componentDidMount() {}

  PNGExport = () => {
    this.setState({
      pngDisabled: true,
      pngExporting: true
    });
    saveSvgAsPng.saveSvgAsPng(
      document.getElementsByTagName('svg')[0],
      this.props.imageInfo.title +
        '-' +
        this.props.imageInfo.svg[this.props.activeSVGTabIndex].plotType +
        '.png'
    );
    const exportingPNGCB = this.exportingPNGIndicator;
    setTimeout(function() {
      exportingPNGCB();
    }, 1500);
  };

  ExcelExport = () => {
    this.setState({
      excelDisabled: true,
      excelExporting: true
    });
    excelService.exportAsExcelFile(
      this.props.treeDataRaw,
      this.props.imageInfo.title + '_Peptide_Data'
    );
    const exportingExcelCB = this.exportingExcelIndicator;
    setTimeout(function() {
      exportingExcelCB();
    }, 1500);
  };

  exportingPNGIndicator = () => {
    this.setState({
      pngDisabled: false,
      pngExporting: false
    });
  };

  exportingExcelIndicator = () => {
    this.setState({
      excelDisabled: false,
      excelExporting: false
    });
  };

  // PDFExport = () => {
  //   this.setState({
  //     pdfDisabled: true,
  //     pdfExporting: true
  //   })
  //   pdfService.createPDF(document.getElementsByTagName("svg")[0]);
  //   this.setState({
  //     pdfDisabled: false,
  //     pdfExporting: false
  //   })
  // };

  getAdditionalButtons = () => {
    if (this.state.pngVisible) {
      return (
        <Button
          className="ExportButton"
          loading={this.state.pngExporting}
          disabled={this.state.pngDisabled}
          onClick={this.PNGExport}
        >
          PNG
        </Button>
      );
    }
    if (this.state.pdfVisible) {
      return (
        <Button
          className="ExportButton"
          loading={this.state.pdfExporting}
          disabled={this.state.pdfDisabled}
          onClick={this.PDFExport}
        >
          PDF
        </Button>
      );
    }
  };

  render() {
    const additionalButtons = this.getAdditionalButtons();
    return (
      <div className="ButtonActions">
        <Button.Group className="ExportButtonGroup" floated="right">
          <Button as="div" labelPosition="left">
            <Label
              as="string"
              basic
              pointing="right"
              className="ExportButtonGroupLabel"
            >
              EXPORT
            </Label>
            <Button
              className="ExportButton"
              loading={this.state.excelExporting}
              disabled={this.state.excelDisabled}
              onClick={this.ExcelExport}
            >
              Data (.xls)
            </Button>
          </Button>
          {additionalButtons}
        </Button.Group>
      </div>
    );
  }
}

export default ButtonActions;
