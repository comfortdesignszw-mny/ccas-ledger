import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction } from '@/hooks/useTransactions';
import type { ChurchSettings } from '@/contexts/ChurchSettingsContext';
import type { Currency } from '@/types/currency';

interface ExportContext {
  churchInfo: ChurchSettings['churchInfo'];
  currency: Currency;
  formatCurrency: (n: number) => string;
}

function sanitizeFilename(s: string) {
  return s.replace(/[^a-z0-9-_]+/gi, '_').replace(/^_+|_+$/g, '');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCsvHeader(ctx: ExportContext, title: string): string[] {
  const { churchInfo, currency } = ctx;
  return [
    `"${churchInfo.name}"`,
    `"${churchInfo.address}"`,
    `"Phone: ${churchInfo.phone} | Email: ${churchInfo.email}"`,
    `"${title}"`,
    `"Generated: ${format(new Date(), 'PPP p')}"`,
    `"Currency: ${currency.name} (${currency.code} ${currency.symbol})"`,
    '',
  ];
}

export function exportTransactionsCSV(
  transactions: Transaction[],
  ctx: ExportContext,
  opts: { title?: string; filename?: string } = {}
) {
  const title = opts.title ?? 'Transaction Log';
  const lines = buildCsvHeader(ctx, title);
  lines.push(
    ['Date', 'Type', 'Category', 'Event', 'Description', 'Payment Method', `Amount (${ctx.currency.code})`]
      .map(csvEscape)
      .join(',')
  );

  for (const t of transactions) {
    lines.push(
      [
        format(new Date(t.transaction_date), 'yyyy-MM-dd'),
        t.type,
        t.categories?.name ?? 'Uncategorized',
        t.events?.name ?? '',
        t.description,
        t.payment_method.replace('_', ' '),
        Number(t.amount).toFixed(2),
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  lines.push('');
  lines.push(csvEscape(`Total Income,,,,,,${totalIncome.toFixed(2)}`));
  lines.push(csvEscape(`Total Expenses,,,,,,${totalExpense.toFixed(2)}`));
  lines.push(csvEscape(`Net Balance,,,,,,${(totalIncome - totalExpense).toFixed(2)}`));

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const filename = opts.filename ?? `${sanitizeFilename(ctx.churchInfo.name)}_${sanitizeFilename(title)}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
  triggerDownload(blob, filename);
}

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function drawLetterhead(doc: jsPDF, ctx: ExportContext, title: string, subtitle?: string) {
  const { churchInfo, currency } = ctx;
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 40;

  // Logo
  if (churchInfo.logo) {
    const dataUrl = await loadImageAsDataUrl(churchInfo.logo);
    if (dataUrl) {
      try {
        doc.addImage(dataUrl, 'PNG', 40, cursorY - 10, 50, 50);
      } catch {
        /* ignore */
      }
    }
  }

  // Church name + motto
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 40, 80);
  doc.text(churchInfo.name, 100, cursorY + 5);

  if (churchInfo.motto) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(churchInfo.motto, 100, cursorY + 20);
  }

  // Right aligned contact info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80);
  const rightX = pageWidth - 40;
  doc.text(churchInfo.address, rightX, cursorY + 5, { align: 'right' });
  if (churchInfo.phone) doc.text(churchInfo.phone, rightX, cursorY + 18, { align: 'right' });
  if (churchInfo.email) doc.text(churchInfo.email, rightX, cursorY + 31, { align: 'right' });

  cursorY += 50;

  // Divider
  doc.setDrawColor(20, 40, 80);
  doc.setLineWidth(1.5);
  doc.line(40, cursorY, pageWidth - 40, cursorY);

  cursorY += 20;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(title, 40, cursorY);

  cursorY += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (subtitle) {
    doc.text(subtitle, 40, cursorY);
    cursorY += 12;
  }
  doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 40, cursorY);
  doc.text(`Currency: ${currency.name} (${currency.symbol})`, pageWidth - 40, cursorY, { align: 'right' });

  return cursorY + 10;
}

function drawFooter(doc: jsPDF, ctx: ExportContext) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 45, pageWidth - 40, pageHeight - 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(ctx.churchInfo.name, 40, pageHeight - 30);
    doc.text(
      'Official financial document — For inquiries contact ' + ctx.churchInfo.email,
      pageWidth / 2,
      pageHeight - 30,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 30, { align: 'right' });
  }
}

export async function exportTransactionsPDF(
  transactions: Transaction[],
  ctx: ExportContext,
  opts: { title?: string; subtitle?: string; filename?: string } = {}
) {
  const title = opts.title ?? 'Transaction Log';
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const startY = await drawLetterhead(doc, ctx, title, opts.subtitle);

  const head = [['Date', 'Type', 'Category', 'Event', 'Description', 'Method', 'Amount']];
  const body = transactions.map((t) => [
    format(new Date(t.transaction_date), 'MMM d, yyyy'),
    t.type === 'income' ? 'Income' : 'Expense',
    t.categories?.name ?? 'Uncategorized',
    t.events?.name ?? '—',
    t.description,
    t.payment_method.replace('_', ' '),
    `${t.type === 'income' ? '+' : '-'}${ctx.formatCurrency(Number(t.amount))}`,
  ]);

  autoTable(doc, {
    startY,
    head,
    body,
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [20, 40, 80], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 6: { halign: 'right' } },
    margin: { left: 40, right: 40, bottom: 60 },
  });

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  autoTable(doc, {
    // @ts-expect-error autotable adds lastAutoTable
    startY: (doc as any).lastAutoTable.finalY + 14,
    body: [
      ['Total Income', ctx.formatCurrency(totalIncome)],
      ['Total Expenses', ctx.formatCurrency(totalExpense)],
      ['Net Balance', ctx.formatCurrency(totalIncome - totalExpense)],
    ],
    theme: 'plain',
    styles: { fontSize: 10, fontStyle: 'bold' },
    columnStyles: { 0: { halign: 'right', cellWidth: 380 }, 1: { halign: 'right' } },
    margin: { left: 40, right: 40, bottom: 60 },
  });

  drawFooter(doc, ctx);

  const filename =
    opts.filename ?? `${sanitizeFilename(ctx.churchInfo.name)}_${sanitizeFilename(title)}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
  doc.save(filename);
}

export function exportSingleTransactionCSV(t: Transaction, ctx: ExportContext) {
  exportTransactionsCSV([t], ctx, {
    title: `Transaction Receipt - ${format(new Date(t.transaction_date), 'yyyy-MM-dd')}`,
    filename: `${sanitizeFilename(ctx.churchInfo.name)}_transaction_${t.id.slice(0, 8)}.csv`,
  });
}

export async function exportSingleTransactionPDF(t: Transaction, ctx: ExportContext) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const startY = await drawLetterhead(doc, ctx, 'Transaction Receipt', `Reference: ${t.id.slice(0, 8).toUpperCase()}`);

  autoTable(doc, {
    startY,
    body: [
      ['Date', format(new Date(t.transaction_date), 'PPP')],
      ['Type', t.type === 'income' ? 'Income' : 'Expense'],
      ['Category', t.categories?.name ?? 'Uncategorized'],
      ['Event', t.events?.name ?? '—'],
      ['Description', t.description],
      ['Payment Method', t.payment_method.replace('_', ' ')],
      ['Amount', `${t.type === 'income' ? '+' : '-'}${ctx.formatCurrency(Number(t.amount))}`],
      ['Recorded At', format(new Date(t.created_at), 'PPP p')],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 8 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [245, 247, 250], cellWidth: 140 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 40, right: 40, bottom: 60 },
  });

  drawFooter(doc, ctx);
  doc.save(`${sanitizeFilename(ctx.churchInfo.name)}_transaction_${t.id.slice(0, 8)}.pdf`);
}
