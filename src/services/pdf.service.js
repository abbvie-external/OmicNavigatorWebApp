import jsPDF from 'jspdf';
import canvg from 'canvg';
import html2canvas from 'html2canvas';

// import SVGtoPDF from "svg-to-pdfkit";
// import blobStream from "blob-stream";
// import PDFDocument from "pdfkit";

class PdfService {
  createPDF(svg) {
    window.html2canvas = html2canvas;
    let canvas = document.createElement('canvas');
    let data = svg.outerHTML;
    canvg(canvas, data);
    let imgData = canvas.toDataURL('image/png');
    let doc = new jsPDF('l');
    // var pdfWidth = doc.internal.pageSize.getWidth();
    // var pdfHeight = doc.internal.pageSize.getHeight();
    // let widthPixels = svg.viewBox.baseVal.width;
    // let heightPixels = svg.viewBox.baseVal.height;
    let widthPixels = 1428;
    let heightPixels = 677.25;
    let widthMM = Math.floor(widthPixels * 0.264583);
    let heightMM = Math.floor(heightPixels * 0.264583);
    doc.addImage(imgData, 'png', 15, 15, widthMM, heightMM);
    doc.save('PDF-01.pdf');
  }

  convertToPdf(svg) {
    alert('here');
  }
}

export const pdfService = new PdfService();
