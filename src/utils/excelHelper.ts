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
      'Cantidad Asegurados': 450,
      'Tarifa Anual': 648000,
      'Tarifa Mensual': 54000,
      '% Incremento': 15.0,
    },
    {
      'Póliza': 'GXP-2026-9042',
      'Cantidad Asegurados': 1280,
      'Tarifa Anual': 1536000,
      'Tarifa Mensual': 128000,
      '% Incremento': 12.5,
    },
    {
      'Póliza': 'GXP-2026-9043',
      'Cantidad Asegurados': 890,
      'Tarifa Anual': 1068000,
      'Tarifa Mensual': 89000,
      '% Incremento': 0.0,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Carga GXP');
  XLSX.writeFile(workbook, 'Plantilla_Carga_Renovacion_GXP.xlsx');
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
