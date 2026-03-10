const PDFDocument = require('pdfkit');

function generateFlashcardPDF(flashcards, title = 'Flashcards') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(1);

      flashcards.forEach((card, index) => {
        if (doc.y > 650) doc.addPage();

        // Card number
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#4F46E5')
          .text(`Card ${index + 1}`, { continued: false });
        doc.moveDown(0.3);

        // Front (question)
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827')
          .text('Q: ', { continued: true })
          .font('Helvetica').text(card.front);
        doc.moveDown(0.3);

        // Back (answer)
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827')
          .text('A: ', { continued: true })
          .font('Helvetica').fillColor('#374151').text(card.back);

        doc.moveDown(0.5);
        doc.strokeColor('#E5E7EB').lineWidth(0.5)
          .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateFlashcardPDF };
