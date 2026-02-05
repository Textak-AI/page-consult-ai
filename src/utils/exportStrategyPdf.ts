 import html2canvas from 'html2canvas';
 import jsPDF from 'jspdf';
 
 interface ExportOptions {
   companyName?: string;
   intelligenceScore?: number;
   exportDate?: string;
 }
 
 export const exportStrategyBriefPdf = async (
   elementId: string,
   options: ExportOptions = {}
 ) => {
   const element = document.getElementById(elementId);
   if (!element) throw new Error('Strategy content element not found');
 
   const {
     companyName = 'Strategy Brief',
     intelligenceScore,
     exportDate = new Date().toLocaleDateString('en-US', { 
       year: 'numeric', month: 'long', day: 'numeric' 
     })
   } = options;
 
   // Temporarily adjust element for PDF capture
   const originalBg = element.style.backgroundColor;
   element.style.backgroundColor = '#0f172a'; // Ensure dark background captures
 
   // Capture the strategy content
   const canvas = await html2canvas(element, {
     scale: 2,
     useCORS: true,
     logging: false,
     backgroundColor: '#0f172a',
     // Remove any fixed/sticky elements that shouldn't be in PDF
     ignoreElements: (el) => {
       return el.classList?.contains('progress-rail') || 
              el.classList?.contains('sticky') ||
              el.getAttribute('data-pdf-ignore') === 'true';
     }
   });
 
   // Restore original background
   element.style.backgroundColor = originalBg;
 
   // PDF dimensions (US Letter)
   const pageWidth = 612; // 8.5 inches * 72 DPI
   const pageHeight = 792; // 11 inches * 72 DPI
   const margin = 36; // 0.5 inch margins
   const contentWidth = pageWidth - (margin * 2);
 
   // Scale canvas to fit page width
   const imgWidth = contentWidth;
   const imgHeight = (canvas.height * imgWidth) / canvas.width;
 
   const pdf = new jsPDF({
     orientation: 'portrait',
     unit: 'pt',
     format: 'letter'
   });
 
   // === COVER PAGE (PageConsult AI Branding) ===
   
   // Dark background
   pdf.setFillColor(15, 23, 42); // #0f172a
   pdf.rect(0, 0, pageWidth, pageHeight, 'F');
 
   // Gradient accent line at top
   pdf.setFillColor(99, 102, 241); // Indigo
   pdf.rect(0, 0, pageWidth, 4, 'F');
 
   // PageConsult AI Logo area (text-based since we can't embed the SVG easily)
   pdf.setFont('helvetica', 'bold');
   pdf.setFontSize(28);
   pdf.setTextColor(255, 255, 255);
   pdf.text('PageConsult', margin, 80);
   
   // "AI" in accent color
   const pcWidth = pdf.getTextWidth('PageConsult');
   pdf.setTextColor(168, 85, 247); // Purple accent
   pdf.text(' AI', margin + pcWidth, 80);
 
   // Divider line
   pdf.setDrawColor(99, 102, 241);
   pdf.setLineWidth(1);
   pdf.line(margin, 100, pageWidth - margin, 100);
 
   // Document title
   pdf.setFont('helvetica', 'bold');
   pdf.setFontSize(36);
   pdf.setTextColor(255, 255, 255);
   pdf.text('Strategic Blueprint', margin, 180);
 
   // Company name
   pdf.setFont('helvetica', 'normal');
   pdf.setFontSize(24);
   pdf.setTextColor(148, 163, 184); // Slate-400
   pdf.text(companyName, margin, 220);
 
   // Intelligence score badge
   if (intelligenceScore) {
     pdf.setFontSize(16);
     pdf.setTextColor(148, 163, 184);
     pdf.text(`Intelligence Score: ${intelligenceScore}/100`, margin, 270);
     
     // Score bar background
     pdf.setFillColor(30, 41, 59); // Slate-800
     pdf.roundedRect(margin, 280, 200, 12, 6, 6, 'F');
     
     // Score bar fill (color based on score)
     const scoreColor = intelligenceScore >= 80 
       ? [34, 197, 94]   // Green
       : intelligenceScore >= 60 
         ? [234, 179, 8]  // Yellow
         : [239, 68, 68]; // Red
     pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
     pdf.roundedRect(margin, 280, (intelligenceScore / 100) * 200, 12, 6, 6, 'F');
   }
 
   // Generated date
   pdf.setFont('helvetica', 'normal');
   pdf.setFontSize(12);
   pdf.setTextColor(100, 116, 139); // Slate-500
   pdf.text(`Generated ${exportDate}`, margin, 340);
   pdf.text('Powered by AI-driven strategic analysis', margin, 360);
 
   // Footer on cover
   pdf.setFontSize(10);
   pdf.setTextColor(71, 85, 105); // Slate-600
   pdf.text('pageconsult.ai', margin, pageHeight - 40);
   pdf.text('Strategy-first landing pages powered by AI', margin, pageHeight - 28);
 
   // Confidential notice
   pdf.setTextColor(100, 116, 139);
   pdf.setFontSize(9);
   pdf.text('CONFIDENTIAL — Prepared exclusively for ' + companyName, margin, pageHeight - 56);
 
   // === CONTENT PAGES ===
   
   // Calculate how many pages we need
   const headerHeight = 50; // Space for header on each page
   const footerHeight = 40; // Space for footer on each page
   const usableHeight = pageHeight - margin - headerHeight - footerHeight;
   const totalPages = Math.ceil(imgHeight / usableHeight);
 
   for (let page = 0; page < totalPages; page++) {
     pdf.addPage();
     
     // Dark background
     pdf.setFillColor(15, 23, 42);
     pdf.rect(0, 0, pageWidth, pageHeight, 'F');
 
     // Header: PageConsult AI branding + accent line
     pdf.setFont('helvetica', 'bold');
     pdf.setFontSize(10);
     pdf.setTextColor(148, 163, 184);
     pdf.text('PageConsult AI', margin, 24);
     pdf.setFont('helvetica', 'normal');
     pdf.setTextColor(100, 116, 139);
     pdf.text(`  |  ${companyName} — Strategic Blueprint`, margin + pdf.getTextWidth('PageConsult AI'), 24);
     
     // Thin accent line under header
     pdf.setDrawColor(99, 102, 241);
     pdf.setLineWidth(0.5);
     pdf.line(margin, 32, pageWidth - margin, 32);
 
     // Content slice
     const sourceY = page * usableHeight * (canvas.width / imgWidth);
     const sourceHeight = Math.min(
       usableHeight * (canvas.width / imgWidth),
       canvas.height - sourceY
     );
 
     if (sourceHeight > 0) {
       // Create a temporary canvas for this page slice
       const tempCanvas = document.createElement('canvas');
       tempCanvas.width = canvas.width;
       tempCanvas.height = sourceHeight;
       const ctx = tempCanvas.getContext('2d');
       if (ctx) {
         ctx.drawImage(
           canvas,
           0, sourceY,
           canvas.width, sourceHeight,
           0, 0,
           canvas.width, sourceHeight
         );
         const sliceData = tempCanvas.toDataURL('image/png');
         const sliceImgHeight = (sourceHeight * imgWidth) / canvas.width;
         pdf.addImage(sliceData, 'PNG', margin, headerHeight, imgWidth, sliceImgHeight);
       }
     }
 
     // Footer
     pdf.setFont('helvetica', 'normal');
     pdf.setFontSize(8);
     pdf.setTextColor(71, 85, 105);
     pdf.text('pageconsult.ai', margin, pageHeight - 20);
     pdf.text(
       `Page ${page + 2} of ${totalPages + 1}`, // +1 for cover page
       pageWidth - margin - pdf.getTextWidth(`Page ${page + 2} of ${totalPages + 1}`),
       pageHeight - 20
     );
     
     // Thin line above footer
     pdf.setDrawColor(30, 41, 59);
     pdf.setLineWidth(0.5);
     pdf.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
   }
 
   // Generate filename
   const sanitizedName = companyName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
   const filename = `${sanitizedName}-strategy-blueprint.pdf`;
   
   pdf.save(filename);
   return filename;
 };