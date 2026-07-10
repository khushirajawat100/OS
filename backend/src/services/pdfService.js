import { createRequire } from 'module';
import PDFDocument from 'pdfkit';

// Polyfills for browser APIs required by pdf-parse on Vercel Node.js environment
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {};
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {};
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {};
}

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Extract text and metadata from a PDF buffer.
 * @param {Buffer} buffer - The PDF file buffer.
 * @returns {Promise<{text: string, numpages: number, info: any, metadata: any}>}
 */
export async function extractText(buffer) {
  try {
    const textResult = await pdf(buffer);
    return {
      text: textResult.text || '',
      numpages: textResult.numpages || 1,
      info: textResult.info || {},
      metadata: textResult.metadata || null
    };
  } catch (error) {
    console.error('[pdfService] Error extracting text from PDF:', error);
    throw error;
  }
}


/**
 * Generate a styled PDF report and pipe it to a write destination.
 * @param {string} title - The title of the document.
 * @param {object} metadata - Document metadata (e.g., author, date).
 * @param {Array<{title: string, content: string|Array, isSummaryBox?: boolean}>} sections - Sections to include in the PDF.
 * @param {WritableStream} writeStream - Destination stream to pipe PDF data into.
 * @returns {PDFKit.PDFDocument} The generated PDF document.
 */
export function generatePDF(title, metadata = {}, sections = [], writeStream) {
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  if (writeStream) {
    doc.pipe(writeStream);
  }

  // Curated premium color palette
  const primaryColor = '#0f172a'; // Sleek dark slate
  const secondaryColor = '#0284c7'; // Electric ocean blue
  const accentColor = '#10b981'; // Mint/Emerald highlight
  const textColor = '#1e293b'; // Charcoal for readable body
  const mutedTextColor = '#64748b'; // Slate gray for subtexts
  const borderLightColor = '#e2e8f0'; // Clean divider color
  const bgLightColor = '#f8fafc'; // Off-white for summary panels

  // Draw Header Banner
  doc.rect(0, 0, 595.28, 90).fill(primaryColor);

  // Logo / Title in Banner
  doc.fillColor('#ffffff')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('VISUARK OS', 50, 25);

  doc.fillColor('#94a3b8')
     .fontSize(10)
     .font('Helvetica')
     .text('Automated C-Suite Boardroom Suite', 50, 55);

  // Metadata block (Top Right of Banner)
  const dateStr = metadata.date || new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const authorStr = metadata.author || 'AI Agent Node';

  doc.fillColor('#94a3b8')
     .fontSize(8)
     .text(`Compiled: ${dateStr}`, 400, 25, { align: 'right', width: 145 });
  doc.text(`Author: ${authorStr}`, 400, 40, { align: 'right', width: 145 });
  if (metadata.version) {
    doc.text(`Version: ${metadata.version}`, 400, 55, { align: 'right', width: 145 });
  }

  // Heading Title
  let currentY = 120;
  doc.fillColor(secondaryColor)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text(title, 50, currentY);

  currentY += 25;

  // Add a horizontal rule
  doc.strokeColor(borderLightColor)
     .lineWidth(1.5)
     .moveTo(50, currentY)
     .lineTo(545, currentY)
     .stroke();

  currentY += 20;

  // Render sections
  sections.forEach((section) => {
    // Check page boundaries before writing next section
    if (currentY > 700) {
      doc.addPage();
      currentY = 50; // Start fresh on new page
    }

    if (section.title) {
      doc.fillColor(secondaryColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(section.title, 50, currentY);
      currentY += 18;
    }

    if (section.content) {
      doc.fillColor(textColor)
         .fontSize(9.5)
         .font('Helvetica');

      if (Array.isArray(section.content)) {
        // Table or Grid structure
        section.content.forEach((item) => {
          if (currentY > 720) {
            doc.addPage();
            currentY = 50;
          }

          if (item.label && item.value !== undefined) {
            // Draw list row
            doc.font('Helvetica-Bold').text(item.label, 50, currentY);
            if (item.highlight) {
              doc.fillColor(accentColor).font('Helvetica-Bold');
            } else {
              doc.fillColor(textColor).font('Helvetica');
            }
            doc.text(String(item.value), 350, currentY, { align: 'right', width: 195 });
            doc.fillColor(textColor); // Reset

            // Underline row
            currentY += 15;
            doc.strokeColor('#f1f5f9')
               .lineWidth(0.5)
               .moveTo(50, currentY)
               .lineTo(545, currentY)
               .stroke();
            currentY += 10;
          } else if (typeof item === 'string') {
            doc.text(`• ${item}`, 60, currentY, { width: 485 });
            currentY += doc.heightOfString(`• ${item}`, { width: 485 }) + 8;
          }
        });
      } else if (typeof section.content === 'string') {
        const height = doc.heightOfString(section.content, { width: 495 });
        if (section.isSummaryBox) {
          // Draw a filled background rectangle for a callout summary box
          doc.rect(50, currentY, 495, height + 20).fill(bgLightColor);
          doc.strokeColor(borderLightColor).lineWidth(1).rect(50, currentY, 495, height + 20).stroke();
          
          doc.fillColor(textColor)
             .font('Helvetica-Oblique')
             .text(section.content, 65, currentY + 10, { width: 465 });
          
          currentY += height + 35;
        } else {
          doc.text(section.content, 50, currentY, { width: 495, align: 'justify' });
          currentY += height + 15;
        }
      }
    }
    currentY += 10;
  });

  // Footer on each page
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    // Draw footer divider
    doc.strokeColor(borderLightColor)
       .lineWidth(1)
       .moveTo(50, 785)
       .lineTo(545, 785)
       .stroke();

    doc.fillColor(mutedTextColor)
       .fontSize(7.5)
       .font('Helvetica')
       .text('Visuark OS Dashboard Suite • Automated Executive Insights © 2026', 50, 795);

    doc.text(`Page ${i + 1} of ${range.count}`, 400, 795, { align: 'right', width: 145 });
  }

  doc.end();
  return doc;
}
