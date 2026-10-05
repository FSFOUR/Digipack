import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

interface ExportPdfOptions {
  singlePageOnly?: boolean;
}

/**
 * Downloads a DOM element as a crisp, high-resolution A4 PDF document.
 * Fits the page completely from top to bottom with zero empty space in the header or footer.
 */
export async function exportElementToPdf(
  elementId: string,
  fileName: string,
  options: ExportPdfOptions = { singlePageOnly: true }
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return;
  }

  try {
    // Capture element with high pixel ratio for print-ready clarity
    const imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      filter: (node: HTMLElement) => {
        if (node.classList && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    // Standard A4 dimensions in mm: 210mm (W) x 297mm (H)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const elementWidth = element.offsetWidth || 800;
    const elementHeight = element.offsetHeight || 1130;

    // Single-page mode: Fill the entire A4 canvas (210mm x 297mm) seamlessly with zero footer/header voids
    if (options.singlePageOnly || elementHeight <= 1450) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } else {
      // True multi-page document
      const imgWidth = pdfWidth;
      const imgHeight = (elementHeight * imgWidth) / elementWidth;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 35) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    pdf.save(safeFileName);
  } catch (error) {
    console.error('Error generating PDF via html-to-image/jspdf:', error);
    window.print();
  }
}

/**
 * Direct Print via dedicated IFrame to avoid parent overflow clipping on Cloudflare / mobile / iframes
 */
export function printElementDirectly(elementId: string, title?: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc || !iframe.contentWindow) {
    window.print();
    document.body.removeChild(iframe);
    return;
  }

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title || 'DigiPack Document'}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          #${elementId} {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 8mm !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            min-height: 297mm !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Iframe print error, falling back to window.print', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  }, 400);
}
