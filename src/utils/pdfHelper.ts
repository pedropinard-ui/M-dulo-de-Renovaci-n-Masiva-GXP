import { jsPDF } from 'jspdf';
import { PolicyRenewal, ProcessingExecutionSummary } from '../types';
import { formatCurrency, formatPercent } from './calculations';

export function exportComplianceReportPDF(
  records: {
    nombre: string;
    tipoDocumento: string;
    numeroDocumento: string;
    consultaListas: string;
    clasificacion: string;
    fecha: string;
    usuarioConsulta: string;
    tipoConsulta: string;
  }[],
  dateRangeText?: string,
  fileName = 'Informe_Debida_Diligencia_Universal.pdf'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Colors
  const primaryColor = '#0284c7';
  const headerBg = '#0f172a';
  const textDark = '#1e293b';

  // Title Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 842, 60, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SEGUROS UNIVERSAL | CONSULTA DE DEBIDA DILIGENCIA', 40, 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Módulo de Cumplimiento & Prevención AML / OFAC', 600, 36);

  // Subheader
  let y = 85;
  doc.setTextColor(textDark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Resultados de Debida Diligencia Masiva (${records.length} registros)`, 40, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748b');
  const now = new Date().toLocaleString('es-DO');
  doc.text(`Generado: ${now} | Rango Fechas: ${dateRangeText || 'Todas las fechas'} | Sistema: Portal Web GXP`, 40, y + 15);

  y += 35;

  // Table Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(40, y, 762, 22, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#334155');

  doc.text('NOMBRE COMPLETO', 45, y + 15);
  doc.text('TIPO DOC', 220, y + 15);
  doc.text('DOCUMENTO', 290, y + 15);
  doc.text('CONSULTA LISTAS', 380, y + 15);
  doc.text('CLASIFICACIÓN', 540, y + 15);
  doc.text('FECHA', 690, y + 15);
  doc.text('USUARIO', 745, y + 15);

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  records.forEach((rec, index) => {
    if (y > 540) {
      doc.addPage();
      // Repaint header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 842, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('SEGUROS UNIVERSAL | CONSULTA HISTÓRICA (Cont.)', 40, 25);
      y = 60;

      doc.setFillColor(241, 245, 249);
      doc.rect(40, y, 762, 20, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#334155');
      doc.text('NOMBRE COMPLETO', 45, y + 14);
      doc.text('TIPO DOC', 220, y + 14);
      doc.text('DOCUMENTO', 290, y + 14);
      doc.text('CONSULTA LISTAS', 380, y + 14);
      doc.text('CLASIFICACIÓN', 540, y + 14);
      doc.text('FECHA', 690, y + 14);
      doc.text('USUARIO', 745, y + 14);
      y += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, y - 2, 762, 18, 'F');
    }

    doc.setTextColor('#0f172a');
    doc.text(rec.nombre.substring(0, 32), 45, y + 10);
    doc.text(rec.tipoDocumento, 220, y + 10);
    doc.text(rec.numeroDocumento, 290, y + 10);

    // Green text for negative/clear list
    if (rec.consultaListas.toLowerCase().includes('no está')) {
      doc.setTextColor(16, 122, 60);
    } else {
      doc.setTextColor(185, 28, 28);
    }
    doc.text(rec.consultaListas.substring(0, 34), 380, y + 10);

    doc.setTextColor('#475569');
    doc.text(rec.clasificacion.substring(0, 32), 540, y + 10);
    doc.text(rec.fecha, 690, y + 10);
    doc.text(rec.usuarioConsulta.substring(0, 15), 745, y + 10);

    y += 18;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor('#94a3b8');
    doc.text(`Página ${i} de ${totalPages} - Documento Oficial de Auditoría Seguros Universal S.A.`, 40, 575);
  }

  doc.save(fileName);
}

export function exportSimulationReportPDF(
  policies: PolicyRenewal[],
  executiveSummary: {
    cantidadSeleccionadas: number;
    primaActualTotal: number;
    primaRenovadaTotal: number;
    incrementoTotal: number;
    variacionPorcentualTotal: number;
  },
  fileName = 'Resumen_Simulacion_Renovacion_GXP.pdf'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 842, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SEGUROS UNIVERSAL | REPORTE DE SIMULACIÓN TARIFARIA GXP', 40, 36);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comité de Suscripción & Renovaciones Masivas', 580, 36);

  // Executive KPI summary box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(40, 75, 762, 65, 4, 4, 'F');

  doc.setTextColor('#0f172a');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO DE IMPACTO ECONÓMICO', 55, 95);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#475569');
  doc.text(`Pólizas Seleccionadas: ${executiveSummary.cantidadSeleccionadas}`, 55, 115);
  doc.text(`Prima Actual Total: ${formatCurrency(executiveSummary.primaActualTotal)}`, 220, 115);
  doc.text(`Prima Renovada Total: ${formatCurrency(executiveSummary.primaRenovadaTotal)}`, 410, 115);
  doc.text(`Incremento Neto: ${formatCurrency(executiveSummary.incrementoTotal)} (${formatPercent(executiveSummary.variacionPorcentualTotal)})`, 600, 115);

  let y = 160;
  // Table
  doc.setFillColor(15, 23, 42);
  doc.rect(40, y, 762, 22, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  doc.text('PÓLIZA', 45, y + 14);
  doc.text('CONTRATANTE', 130, y + 14);
  doc.text('ASEG.', 320, y + 14);
  doc.text('PRIMA ACT. ANUAL', 360, y + 14);
  doc.text('PRIMA RENOV. ANUAL', 470, y + 14);
  doc.text('VARIACIÓN ($)', 590, y + 14);
  doc.text('% AJUSTE', 690, y + 14);
  doc.text('ESTADO', 745, y + 14);

  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  policies.forEach((p, idx) => {
    if (y > 540) {
      doc.addPage();
      y = 40;
      doc.setFillColor(15, 23, 42);
      doc.rect(40, y, 762, 22, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('PÓLIZA', 45, y + 14);
      doc.text('CONTRATANTE', 130, y + 14);
      doc.text('ASEG.', 320, y + 14);
      doc.text('PRIMA ACT. ANUAL', 360, y + 14);
      doc.text('PRIMA RENOV. ANUAL', 470, y + 14);
      doc.text('VARIACIÓN ($)', 590, y + 14);
      doc.text('% AJUSTE', 690, y + 14);
      doc.text('ESTADO', 745, y + 14);
      y += 24;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(40, y - 2, 762, 18, 'F');
    }

    const diff = p.tarifaRenovacion.tarifaAnual - p.tarifaActual.tarifaAnual;
    doc.setTextColor('#0f172a');
    doc.text(p.numeroPoliza, 45, y + 10);
    doc.text(p.contratante.substring(0, 30), 130, y + 10);
    doc.text(p.cantidadAsegurados.toString(), 320, y + 10);
    doc.text(formatCurrency(p.tarifaActual.tarifaAnual), 360, y + 10);
    doc.text(formatCurrency(p.tarifaRenovacion.tarifaAnual), 470, y + 10);
    doc.text(formatCurrency(diff), 590, y + 10);
    doc.text(p.tipoRenovacion === 'CAMBIO_PLAN' ? 'No aplica' : formatPercent(p.porcentajeIncremento), 690, y + 10);
    doc.text(p.estado, 745, y + 10);

    y += 18;
  });

  doc.save(fileName);
}
