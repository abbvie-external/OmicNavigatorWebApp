import jsPDF from 'jspdf';
import canvg from 'canvg';

class PdfService {
  createPDF(svg) {
    // let canvas = document.createElement('canvas');
    // let data = svg.outerHTML;
    // canvg(canvas, data);
    // let imgData = canvas.toDataURL('image/png');
    // let doc = new jsPDF('l');
    // // var pdfWidth = doc.internal.pageSize.getWidth();
    // // var pdfHeight = doc.internal.pageSize.getHeight();
    // // let widthPixels = svg.viewBox.baseVal.width;
    // // let heightPixels = svg.viewBox.baseVal.height;
    // let widthPixels = 1428;
    // let heightPixels = 677.25;
    // let widthMM = Math.floor(widthPixels * 0.264583);
    // let heightMM = Math.floor(heightPixels * 0.264583);
    // doc.addImage(imgData, 'PNG', 15, 15, widthMM, heightMM);
    // doc.save('PDF-01.pdf');
  }
}

export const pdfService = new PdfService();
