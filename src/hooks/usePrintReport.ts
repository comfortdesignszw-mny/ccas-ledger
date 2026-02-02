import { useCallback, useRef } from 'react';

export function usePrintReport() {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportPDF = useCallback(async () => {
    // For now, use the browser's print-to-PDF functionality
    // This can be enhanced with a library like jsPDF or html2pdf later
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;

    const content = printRef.current.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report</title>
          <style>
            ${styles}
            @media print {
              body { 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                padding: 20px;
              }
              .no-print { display: none !important; }
              .print-break { page-break-before: always; }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 40px;
              max-width: 210mm;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, []);

  return {
    printRef,
    handlePrint,
    handleExportPDF,
  };
}
