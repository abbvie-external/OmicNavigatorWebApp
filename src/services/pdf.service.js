import * as jsPDF from 'jspdf-yworks';
import * as svg2pdf from 'svg2pdf.js';

class PdfService {
  createPDF(svg) {
    const pdf = new jsPDF('l', 'pt');

    //render the svg element
    svg2pdf(svg, pdf, {
      xOffset: 0,
      yOffset: 0,
      scale: 1
    });
    pdf.save('myPDF.pdf');
  }
}

export const pdfService = new PdfService();
