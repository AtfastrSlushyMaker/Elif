import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class AdminExportService {
  exportExcel(
    fileBaseName: string,
    headers: string[],
    rows: Array<Array<string | number | boolean | null | undefined>>
  ): void {
    const lines = [
      headers.join('\t'),
      ...rows.map((row) => row.map((cell) => this.toTabCell(cell)).join('\t'))
    ];

    const content = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([content], {
      type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    this.downloadBlob(blob, `${this.slugify(fileBaseName)}.xls`);
  }

  exportPdf(
    title: string,
    headers: string[],
    rows: Array<Array<string | number | boolean | null | undefined>>,
    subtitle?: string
  ): void {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const usableWidth = pageWidth - margin * 2;
    const bottomLimit = pageHeight - margin;
    const lineHeight = 14;

    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
    y += 14;

    if (subtitle) {
      const subtitleLines = doc.splitTextToSize(subtitle, usableWidth) as string[];
      doc.text(subtitleLines, margin, y);
      y += subtitleLines.length * lineHeight;
    }

    y += 8;
    doc.setFont('helvetica', 'bold');
    const headerLine = headers.join(' | ');
    const headerLines = doc.splitTextToSize(headerLine, usableWidth) as string[];
    doc.text(headerLines, margin, y);
    y += headerLines.length * lineHeight;

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 12;

    doc.setFont('helvetica', 'normal');

    rows.forEach((row) => {
      const line = row.map((cell) => this.toPdfCell(cell)).join(' | ');
      const lines = doc.splitTextToSize(line, usableWidth) as string[];

      if (y + lines.length * lineHeight > bottomLimit) {
        doc.addPage();
        y = margin;
      }

      doc.text(lines, margin, y);
      y += lines.length * lineHeight;
    });

    doc.save(`${this.slugify(title)}.pdf`);
  }

  private toTabCell(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value)
      .replace(/\t/g, ' ')
      .replace(/\r?\n/g, ' ')
      .trim();
  }

  private toPdfCell(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return String(value)
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '-';
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'export';
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
