import * as XLSX from 'xlsx';
import { PolicyRenewal, ValidationError, ProcessingExecutionSummary, ComplianceMassRun } from '../types';

export function exportPoliciesToExcel(policies: PolicyRenewal[], fileName = 'Cartera_Renovacion_GXP.xlsx') {
  const data = policies.map((p, idx) => ({
    'No.': idx + 1,
    'Póliza': p.numeroPoliza,
    'Producto': p.productoCodigo,
    'Contratante': p.contratante,
    'Tipo Doc': p.tipoDocumentoContratante,
    'Documento': p.documentoContratante,
    'Correo Cliente': p.correoCliente,
    'Corredor': p.corredor,
    'Correo Corredor': p.correoCorredor,
    'Supervisor': p.supervisorNegocio,
    'Cobertura': p.cobertura,
    'Asegurados': p.cantidadAsegurados,
    'Fecha Renovación': p.fechaRenovacion,
    'Tarifa Actual Anual (RD$)': p.tarifaActual.tarifaAnual,
    'Tarifa Actual Mensual (RD$)': p.tarifaActual.tarifaMensual,
    'Tarifa Renovación Anual (RD$)': p.tarifaRenovacion.tarifaAnual,
    'Tarifa Renovación Mensual (RD$)': p.tarifaRenovacion.tarifaMensual,
    '% Incremento': p.porcentajeIncremento,
    'Excepción Individual': p.esExcepcionIndividual ? 'Sí' : 'No',
    'Motivo Excepción': p.motivoExcepcion || '',
    'Estado': p.estado,
    'Total Observaciones': p.erroresValidacion.length,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Renovaciones GXP');
  XLSX.writeFile(workbook, fileName);
}

export function exportValidationErrorsToExcel(
  items: { policy: PolicyRenewal; error: ValidationError }[],
  fileName = 'Informe_Validacion_Cartera_GXP.xlsx'
) {
  const data = items.map((item, idx) => ({
    'No.': idx + 1,
    'Póliza': item.policy.numeroPoliza,
    'Contratante': item.policy.contratante,
    'Severidad': item.error.severidad,
    'Campo Afectado': item.error.campo,
    'Descripción del Error': item.error.descripcion,
    'Acción Recomendada': item.error.accionRecomendada,
    'Estado Actual': item.policy.estado,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Errores de Validación');
  XLSX.writeFile(workbook, fileName);
}

export function exportProcessingBitacoraToExcel(
  summary: ProcessingExecutionSummary,
  fileName = `Bitacora_Procesamiento_${summary.numeroCorrida}.xlsx`
) {
  const metaData = [
    { Metrica: 'Número de Corrida', Valor: summary.numeroCorrida },
    { Metrica: 'Fecha de Ejecución', Valor: summary.fechaHoraInicio },
    { Metrica: 'Usuario Operador', Valor: summary.usuario },
    { Metrica: 'Total Seleccionadas', Valor: summary.totalSeleccionadas },
    { Metrica: 'Procesadas Exitosas', Valor: summary.totalExitosas },
    { Metrica: 'Fallidas', Valor: summary.totalFallidas },
    { Metrica: 'Omitidas por Validación', Valor: summary.totalOmitidasErrores },
    { Metrica: 'Tiempo de Ejecución (s)', Valor: summary.tiempoEjecucionSegundos },
    { Metrica: 'Estado Final', Valor: summary.estado },
  ];

  const detailData = summary.bitacora.map((b, idx) => ({
    'Item': idx + 1,
    'Póliza': b.numeroPoliza,
    'Contratante': b.contratante,
    'Tarifa Anterior (RD$)': b.tarifaAnterior,
    'Tarifa Renovada (RD$)': b.tarifaNueva,
    '% Incremento': b.incremento,
    'Resultado': b.estado,
    'Mensaje Core ACSEL': b.mensaje,
    'Timestamp': b.timestamp,
  }));

  const wsMeta = XLSX.utils.json_to_sheet(metaData);
  const wsDetail = XLSX.utils.json_to_sheet(detailData);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Resumen Ejecutivo');
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle de Pólizas');
  XLSX.writeFile(wb, fileName);
}

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Póliza': 'GXP-2026-9041',
      'Producto': 'GXP',
      'Contratante': 'EMPRESAS CORRIPIO C. POR A.',
      'Tipo Doc': 'RNC',
      'Documento': '101-00234-8',
      'Cobertura': 'Plan Integral Familiar',
      'Asegurados': 850,
      'Corredor': 'FRANCO & ACRA TECNOSEGUROS',
      'Supervisor': 'Carlos Mendoza',
      'Correo Cliente': 'rrhh@corripio.com.do',
      'Correo Corredor': 'cuentas@francoacra.com',
      'Fecha Renovación': '2026-09-01',
      'Tarifa Actual Anual': 1250000,
      '% Incremento': 15.0,
    },
    {
      'Póliza': 'GXP-2026-9042',
      'Producto': 'GXP',
      'Contratante': 'GRUPO RAMOS S.A.',
      'Tipo Doc': 'RNC',
      'Documento': '101-55829-3',
      'Cobertura': 'Plan Senior Plus',
      'Asegurados': 1420,
      'Corredor': 'ROS & ASOCIADOS SRL',
      'Supervisor': 'Carlos Mendoza',
      'Correo Cliente': 'beneficios@gruporamos.com.do',
      'Correo Corredor': 'corredor@ros.com.do',
      'Fecha Renovación': '2026-09-01',
      'Tarifa Actual Anual': 2100000,
      '% Incremento': 15.0,
    },
    {
      'Póliza': 'GXP-2026-9043',
      'Producto': 'GXP',
      'Contratante': 'INDUSTRIAS SAN MIGUEL DEL CARIBE S.A.',
      'Tipo Doc': 'RNC',
      'Documento': '101-89342-1',
      'Cobertura': 'Plan Básico Funerario',
      'Asegurados': 620,
      'Corredor': 'PEÑA IZQUIERDO CORREDORES DE SEGUROS',
      'Supervisor': 'Carlos Mendoza',
      'Correo Cliente': 'seguros@ism.com.do',
      'Correo Corredor': 'contacto@penaizquierdo.com',
      'Fecha Renovación': '2026-09-01',
      'Tarifa Actual Anual': 890000,
      '% Incremento': 12.5,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Carga GXP');
  XLSX.writeFile(workbook, 'Plantilla_Carga_Renovacion_GXP.xlsx');
}

export function exportImportErrorsToExcel(
  rows: Array<{
    rowNumber: number;
    policyNumber: string;
    contratante: string;
    tipoDoc?: string;
    docNumber?: string;
    cobertura?: string;
    asegurados?: number;
    tarifaActualAnual?: number;
    fechaRenovacion?: string;
    status: 'VALID' | 'WARNING' | 'ERROR';
    statusMessages: string[];
  }>,
  fileName = 'Reporte_Inconsistencias_Importacion_GXP.xlsx'
) {
  const errorData = rows.map((r, idx) => ({
    'No.': idx + 1,
    'Fila en Archivo': `Fila ${r.rowNumber}`,
    'No. Póliza': r.policyNumber || 'NO ESPECIFICADO',
    'Contratante': r.contratante || 'NO ESPECIFICADO',
    'Tipo Doc': r.tipoDoc || 'RNC',
    'No. Documento': r.docNumber || 'NO ESPECIFICADO',
    'Cobertura': r.cobertura || 'Plan Integral Familiar',
    'Cantidad Asegurados': r.asegurados !== undefined ? r.asegurados : 0,
    'Tarifa Actual Anual (RD$)': r.tarifaActualAnual || 0,
    'Fecha Renovación': r.fechaRenovacion || '2026-08-01',
    'Severidad Validación': r.status === 'ERROR' ? 'RECHAZADO (BLOQUEANTE)' : 'ADVERTENCIA',
    'Inconsistencias / Errores Detectados': r.statusMessages.join(' | '),
    'Acción Requerida para Subsanar': r.status === 'ERROR'
      ? 'Corregir datos mandatorios en el archivo Excel o actualizar nómina en Core ACSEL antes de reintentar.'
      : 'Revisar datos o proceder con la actualización de cartera existente.',
  }));

  const worksheet = XLSX.utils.json_to_sheet(errorData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inconsistencias de Carga');
  XLSX.writeFile(workbook, fileName);
}

export function parseImportedExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export function exportNotesToExcel(
  notes: any[],
  fileName = 'Registro_Notas_Feedback_Renovaciones.xlsx'
) {
  const data = notes.map((n, idx) => ({
    'No.': idx + 1,
    'Código Nota': n.id,
    'Pantalla / Módulo': n.pantallaNombre,
    'Asunto': n.asunto,
    'Descripción / Detalle': n.descripcion,
    'Autor': n.autor,
    'Prioridad': n.prioridad,
    'Estado': n.estado,
    'Fecha Creación': n.fechaCreacion,
    'Tiene Marcador Visual': n.pinpoint ? `Sí (X: ${n.pinpoint.x}%, Y: ${n.pinpoint.y}%)` : 'No',
    'Total Respuestas': n.respuestas?.length || 0,
    'Detalle Resolución': n.resolucion ? `${n.resolucion.usuario} (${n.resolucion.fecha}): ${n.resolucion.detalle}` : 'Pendiente',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Notas y Feedback');
  XLSX.writeFile(workbook, fileName);
}

