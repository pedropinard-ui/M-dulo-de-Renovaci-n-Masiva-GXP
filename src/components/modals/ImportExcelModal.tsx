import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  RefreshCw, 
  FileCheck, 
  Database, 
  Users, 
  ShieldCheck, 
  X, 
  Check, 
  Search,
  ArrowRight,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PolicyRenewal, Product, ValidationError } from '../../types';
import { downloadSampleExcelTemplate, exportImportErrorsToExcel } from '../../utils/excelHelper';
import { calculateSinglePolicyRate, formatCurrency } from '../../utils/calculations';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currentPolicies: PolicyRenewal[];
  onConfirmImport: (policiesToAddOrUpdate: PolicyRenewal[]) => void;
}

export interface ImportedRowValidation {
  rowNumber: number;
  policyNumber: string;
  contratante: string;
  tipoDoc: 'RNC' | 'Cédula' | 'Pasaporte';
  docNumber: string;
  cobertura: string;
  asegurados: number;
  corredor: string;
  supervisor: string;
  correoCliente: string;
  correoCorredor: string;
  fechaRenovacion: string;
  tarifaActualAnual: number;
  tarifaActualMensual: number;
  porcentajeIncremento: number;
  status: 'VALID' | 'WARNING' | 'ERROR';
  statusMessages: string[];
  isUpdateOfExisting: boolean;
  parsedPolicy?: PolicyRenewal;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  products,
  currentPolicies,
  onConfirmImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [structureValid, setStructureValid] = useState<boolean | null>(null);
  const [structureErrors, setStructureErrors] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<ImportedRowValidation[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'VALID' | 'WARNING' | 'ERROR'>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const validProductsCodes = products.map((p) => p.codigo.toUpperCase());
  const allAvailableCoverages: string[] = Array.from(
    new Set(products.flatMap((p) => p.coberturasDisponibles || []))
  );

  const resetState = () => {
    setFile(null);
    setIsProcessing(false);
    setStructureValid(null);
    setStructureErrors([]);
    setValidationResults([]);
    setSelectedRowIds(new Set());
  };

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    processExcelFile(selectedFile);
  };

  const processExcelFile = (uploadedFile: File) => {
    setIsProcessing(true);
    setStructureErrors([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          setStructureValid(false);
          setStructureErrors(['El archivo no contiene hojas de cálculo legibles.']);
          setIsProcessing(false);
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setStructureValid(false);
          setStructureErrors(['El archivo Excel está vacío o no contiene filas con datos.']);
          setIsProcessing(false);
          return;
        }

        // 1. Validar estructura de columnas ("Identificación de la póliza & asegurado")
        const firstRow = rawJson[0];
        const rawKeys = Object.keys(firstRow).map((k) => k.trim().toLowerCase());
        
        const hasPolicyCol = rawKeys.some((k) => 
          k.includes('póliza') || k.includes('poliza') || k.includes('numero') || k.includes('no.')
        );
        const hasContratanteCol = rawKeys.some((k) => 
          k.includes('contratante') || k.includes('cliente') || k.includes('empresa') || k.includes('nombre')
        );

        if (!hasPolicyCol || !hasContratanteCol) {
          setStructureValid(false);
          setStructureErrors([
            'Estructura de columnas inválida: El archivo debe contener al menos las columnas de "Póliza" y "Contratante" según la sección de Identificación de la Póliza & Asegurado.',
            'Columnas detectadas: ' + Object.keys(firstRow).join(', '),
          ]);
          setIsProcessing(false);
          return;
        }

        setStructureValid(true);

        // 2. Procesar cada fila y validar con el Core ACSEL
        const processedRows: ImportedRowValidation[] = [];
        const validIndices = new Set<number>();

        rawJson.forEach((row, index) => {
          const rowNum = index + 2; // Considerando encabezado en fila 1

          // Normalizar llaves
          const findVal = (...aliases: string[]): any => {
            for (const key of Object.keys(row)) {
              const cleanKey = key.trim().toLowerCase();
              if (aliases.some((alias) => cleanKey.includes(alias.toLowerCase()))) {
                return row[key];
              }
            }
            return '';
          };

          const policyNumber = String(findVal('póliza', 'poliza', 'no. póliza', 'no. poliza', 'num_poliza') || '').trim();
          const contratante = String(findVal('contratante', 'cliente', 'nombre') || '').trim();
          const docTypeRaw = String(findVal('tipo doc', 'tipo_doc', 'tipo documento') || 'RNC').trim().toUpperCase();
          const tipoDoc: 'RNC' | 'Cédula' | 'Pasaporte' = 
            docTypeRaw.includes('CED') || docTypeRaw.includes('CÉD') ? 'Cédula' : 
            docTypeRaw.includes('PAS') ? 'Pasaporte' : 'RNC';
          
          const docNumber = String(findVal('documento', 'rnc', 'cédula', 'cedula', 'doc') || '').trim();
          const cobertura = String(findVal('cobertura', 'plan', 'producto') || 'Plan Integral Familiar').trim();
          const aseguradosRaw = parseInt(findVal('asegurados', 'cantidad asegurados', 'cant_asegurados', 'afiliados') || '0', 10);
          const asegurados = isNaN(aseguradosRaw) ? 0 : aseguradosRaw;
          
          const corredor = String(findVal('corredor', 'intermediario', 'broker') || 'Directo Universal').trim();
          const supervisor = String(findVal('supervisor', 'ejecutivo', 'oficial') || 'Carlos Mendoza').trim();
          const correoCliente = String(findVal('correo cliente', 'correo', 'email cliente', 'email') || `contacto@${contratante.toLowerCase().replace(/[^a-z0-9]/g, '') || 'empresa'}.com.do`).trim();
          const correoCorredor = String(findVal('correo corredor', 'email corredor') || 'corredor@universal.com.do').trim();
          
          const fechaRenovacionRaw = String(findVal('fecha renovación', 'fecha renovacion', 'fecha', 'renovacion') || '2026-08-01').trim();
          let fechaRenovacion = '2026-08-01';
          if (fechaRenovacionRaw.match(/^\d{4}-\d{2}-\d{2}$/)) {
            fechaRenovacion = fechaRenovacionRaw;
          } else if (fechaRenovacionRaw.includes('/')) {
            const parts = fechaRenovacionRaw.split('/');
            if (parts.length === 3) {
              fechaRenovacion = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          const tarifaAnualRaw = parseFloat(String(findVal('tarifa actual anual', 'tarifa actual', 'tarifa anual', 'prima anual', 'prima actual') || '0').replace(/[^0-9.]/g, ''));
          const tarifaActualAnual = isNaN(tarifaAnualRaw) || tarifaAnualRaw <= 0 ? 350000 : tarifaAnualRaw;
          const tarifaActualMensual = Math.round((tarifaActualAnual / 12) * 100) / 100;
          
          const porcRaw = parseFloat(String(findVal('% incremento', 'incremento', 'porcentaje') || '15.0').replace(/[^0-9.]/g, ''));
          const porcentajeIncremento = isNaN(porcRaw) ? 15.0 : porcRaw;

          // VALIDACIÓN CON EL CORE ACSEL
          const messages: string[] = [];
          let status: 'VALID' | 'WARNING' | 'ERROR' = 'VALID';
          const validationErrors: ValidationError[] = [];

          // 1. Validación de Póliza en Core
          if (!policyNumber) {
            status = 'ERROR';
            messages.push('Falta el número de póliza obligatorio.');
          } else if (!policyNumber.toUpperCase().startsWith('GXP') && !policyNumber.includes('-')) {
            status = 'WARNING';
            messages.push('Formato de póliza no estándar en Core (debe incluir prefijo de ramo GXP-XXXX).');
          }

          // 2. Validación de Contratante y Documento
          if (!contratante) {
            status = 'ERROR';
            messages.push('Nombre de contratante vacío.');
          }

          if (!docNumber) {
            status = 'WARNING';
            messages.push('Documento de identidad no especificado (se asignará temporal).');
          }

          // 3. Validación de Asegurados en Core
          if (asegurados <= 0) {
            status = 'ERROR';
            messages.push('Cantidad de asegurados debe ser mayor a 0 para emisión de colectivos.');
            validationErrors.push({
              id: `err-imp-aseg-${index}`,
              campo: 'cantidadAsegurados',
              codigo: 'CORE_ASEG_0',
              regla: 'REGLA_CANTIDAD_ASEGURADOS',
              descripcion: 'Póliza sin nómina de asegurados activa en Core',
              accionRecomendada: 'Cargar nómina de asegurados vigente en el Core',
              severidad: 'Bloqueante',
            });
          } else if (asegurados < 10) {
            if (status !== 'ERROR') status = 'WARNING';
            messages.push('Colectivo con menos del mínimo estándar (10 asegurados).');
          }

          // 4. Cobertura validada contra catálogo
          const matchedCoverage = allAvailableCoverages.find(
            (c) => c.toLowerCase() === cobertura.toLowerCase()
          ) || 'Plan Integral Familiar';

          // 5. Verificar si existe previamente en cartera
          const existing = currentPolicies.find(
            (p) => p.numeroPoliza.toUpperCase() === policyNumber.toUpperCase()
          );
          const isUpdateOfExisting = !!existing;
          if (isUpdateOfExisting && status !== 'ERROR') {
            if (status === 'VALID') status = 'WARNING';
            messages.push(`Póliza existente en cartera: Se actualizarán los datos con el archivo.`);
          }

          // Rate calculation
          const rates = calculateSinglePolicyRate(tarifaActualAnual, porcentajeIncremento);

          const parsedPolicy: PolicyRenewal = {
            id: existing ? existing.id : `pol-imp-${Date.now()}-${index}`,
            idProducto: 'prod-gxp',
            productoCodigo: 'GXP',
            productoNombre: 'Gastos de Sepelio Colectivo',
            numeroPoliza: policyNumber,
            contratante,
            tipoDocumentoContratante: tipoDoc,
            tipoDocumento: tipoDoc,
            documentoContratante: docNumber || '101-00000-0',
            cobertura: matchedCoverage,
            cantidadAsegurados: asegurados,
            corredor: corredor || 'Directo Universal',
            supervisorNegocio: supervisor || 'Oficina Corporativa',
            correoCliente: correoCliente,
            correoCorredor: correoCorredor,
            fechaRenovacion,
            vigenciaDesde: '2025-08-01',
            vigenciaHasta: fechaRenovacion,
            tarifaActualAnual,
            tarifaActualMensual,
            tarifaActual: {
              tarifaAnual: tarifaActualAnual,
              tarifaMensual: tarifaActualMensual,
            },
            tarifaRenovacionAnual: rates.tarifaRenovacionAnual,
            tarifaRenovacionMensual: rates.tarifaRenovacionMensual,
            tarifaRenovacion: {
              tarifaAnual: rates.tarifaRenovacionAnual,
              tarifaMensual: rates.tarifaRenovacionMensual,
            },
            porcentajeIncremento,
            esExcepcionIndividual: false,
            esExcepcionManual: false,
            estado: status === 'ERROR' ? 'Error' : 'Pendiente',
            erroresValidacion: validationErrors,
          };

          if (status !== 'ERROR') {
            validIndices.add(index);
          }

          processedRows.push({
            rowNumber: rowNum,
            policyNumber,
            contratante,
            tipoDoc,
            docNumber,
            cobertura: matchedCoverage,
            asegurados,
            corredor,
            supervisor,
            correoCliente,
            correoCorredor,
            fechaRenovacion,
            tarifaActualAnual,
            tarifaActualMensual,
            porcentajeIncremento,
            status,
            statusMessages: messages.length > 0 ? messages : ['Validada exitosamente en catálogo Core ACSEL.'],
            isUpdateOfExisting,
            parsedPolicy,
          });
        });

        setValidationResults(processedRows);
        setSelectedRowIds(validIndices);
        setIsProcessing(false);
      } catch (err: any) {
        setStructureValid(false);
        setStructureErrors([
          'Error al procesar el archivo Excel: ' + (err.message || 'Formato no soportado.'),
        ]);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setStructureValid(false);
      setStructureErrors(['Error al leer el archivo en el navegador.']);
      setIsProcessing(false);
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const filteredRows = validationResults.filter((row) => {
    if (filterTab !== 'ALL' && row.status !== filterTab) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        row.policyNumber.toLowerCase().includes(q) ||
        row.contratante.toLowerCase().includes(q) ||
        row.docNumber.toLowerCase().includes(q) ||
        row.cobertura.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const validCount = validationResults.filter((r) => r.status === 'VALID').length;
  const warningCount = validationResults.filter((r) => r.status === 'WARNING').length;
  const errorCount = validationResults.filter((r) => r.status === 'ERROR').length;
  const inconsistentRows = validationResults.filter(
    (r) => r.status === 'ERROR' || r.status === 'WARNING'
  );
  const hasInconsistencies = inconsistentRows.length > 0;

  const handleDownloadErrors = () => {
    if (inconsistentRows.length === 0) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'Cartera_GXP';
    const fileName = `Reporte_Errores_Importacion_${baseName}.xlsx`;
    exportImportErrorsToExcel(inconsistentRows, fileName);
  };

  const selectedPoliciesToImport = validationResults
    .filter((_, idx) => selectedRowIds.has(idx) && _.parsedPolicy && _.status !== 'ERROR')
    .map((r) => r.parsedPolicy!);

  const handleToggleSelectRow = (idx: number) => {
    const next = new Set(selectedRowIds);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedRowIds(next);
  };

  const handleSelectAllValid = () => {
    const allValid = new Set<number>();
    validationResults.forEach((r, idx) => {
      if (r.status !== 'ERROR') allValid.add(idx);
    });
    setSelectedRowIds(allValid);
  };

  const handleDeselectAll = () => {
    setSelectedRowIds(new Set());
  };

  const handleExecuteImport = () => {
    if (selectedPoliciesToImport.length === 0) return;
    onConfirmImport(selectedPoliciesToImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-[#b9d0ea] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-[#1e4e8c] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
                Importación Masiva de Cartera de Renovación (Excel)
              </h2>
              <p className="text-[11px] text-blue-100">
                Carga y validación en tiempo real de pólizas contra el catálogo y reglas del Core ACSEL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs bg-slate-50/50">
          
          {/* STEP 1: UPLOAD AREA & TEMPLATE DOWNLOAD */}
          {!validationResults.length ? (
            <div className="space-y-4">
              
              {/* Instructions banner */}
              <div className="bg-[#eef4fb] border border-[#c3d5ea] rounded-md p-3 flex items-start gap-3 text-slate-700">
                <Info className="w-5 h-5 text-[#2b6cb0] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-slate-800">
                    Formato de Archivo de Importación
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    El archivo debe incluir las columnas correspondientes a la sección de <strong>Identificación de la Póliza & Asegurado</strong>:
                    Póliza, Contratante, Tipo Doc, Documento/RNC, Cobertura/Plan, Cantidad de Asegurados, Corredor, Supervisor, Fecha Renovación y Tarifa Actual.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <button
                      onClick={downloadSampleExcelTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-[#b9d0ea] text-[#1e4e8c] font-bold text-[11px] rounded shadow-2xs cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2b6cb0]" />
                      <span>Descargar Plantilla Excel Oficial</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#2b6cb0] bg-blue-50/50 scale-[0.99]'
                    : 'border-[#b9d0ea] bg-white hover:bg-[#f3f8fd] hover:border-[#2b6cb0]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-full bg-[#eef4fb] flex items-center justify-center text-[#2b6cb0] mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <p className="text-sm font-bold text-slate-800 mb-1">
                  Arrastre su archivo Excel aquí o haga clic para seleccionar
                </p>
                <p className="text-slate-500 text-[11px] max-w-md">
                  Formatos compatibles: Microsoft Excel (.xlsx, .xls) y archivos CSV delimitados por comas.
                </p>
              </div>

              {/* Structure Errors if any */}
              {structureValid === false && (
                <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 text-rose-800 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Error en la estructura del archivo Excel</span>
                    </div>
                    <button
                      onClick={() => {
                        exportImportErrorsToExcel(
                          structureErrors.map((err) => ({
                            rowNumber: 1,
                            policyNumber: 'ESTRUCTURA_COLUMNAS_INVALIDA',
                            contratante: 'NO_RECONOCIDO',
                            status: 'ERROR' as const,
                            statusMessages: [err],
                          })),
                          'Reporte_Error_Estructura_Excel.xlsx'
                        );
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-100/50 border border-rose-300 text-rose-800 text-[11px] font-bold rounded cursor-pointer transition-colors shadow-2xs"
                      title="Descargar detalle del error de estructura"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span>Descargar Errores</span>
                    </button>
                  </div>
                  {structureErrors.map((err, i) => (
                    <p key={i} className="text-[11px] text-rose-700 ml-6">
                      • {err}
                    </p>
                  ))}
                </div>
              )}

            </div>
          ) : (
            
            /* STEP 2: VALIDATION MATRIX & SUMMARY */
            <div className="space-y-3">
              
              {/* Summary KPIs Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white border border-[#c3d5ea] rounded-md p-2.5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Leídas</span>
                  <div className="text-lg font-bold text-slate-800 font-mono flex items-center justify-between">
                    <span>{validationResults.length}</span>
                    <FileCheck className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-md p-2.5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Core OK (Válidas)</span>
                  <div className="text-lg font-bold text-emerald-700 font-mono flex items-center justify-between">
                    <span>{validCount}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-md p-2.5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Advertencias / Updates</span>
                  <div className="text-lg font-bold text-amber-700 font-mono flex items-center justify-between">
                    <span>{warningCount}</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                </div>

                <div className="bg-rose-50/70 border border-rose-200 rounded-md p-2.5 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">Rechazadas (Errores)</span>
                  <div className="text-lg font-bold text-rose-700 font-mono flex items-center justify-between">
                    <span>{errorCount}</span>
                    <XCircle className="w-4 h-4 text-rose-600" />
                  </div>
                </div>
              </div>

              {/* Core ACSEL Validation Banner */}
              <div className="bg-[#eef4fb] border border-[#c3d5ea] rounded-md p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#2b6cb0]" />
                  <span className="font-semibold text-slate-800">
                    Archivo: <strong className="text-[#1e4e8c]">{file?.name}</strong> ({validationResults.length} registros analizados con el Core ACSEL)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasInconsistencies && (
                    <button
                      onClick={handleDownloadErrors}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                      title="Descargar reporte Excel con los detalles de las filas que fallaron la validación o tienen inconsistencias"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Errores ({inconsistentRows.length})</span>
                    </button>
                  )}
                  <button
                    onClick={resetState}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-[#b9d0ea] text-slate-700 font-medium text-[11px] cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Cargar Otro Archivo</span>
                  </button>
                </div>
              </div>

              {/* Toolbar: Filter Tabs, Search & Bulk Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                
                {/* Status Tabs */}
                <div className="flex items-center bg-white border border-[#b9d0ea] rounded p-0.5 text-xs">
                  <button
                    onClick={() => setFilterTab('ALL')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      filterTab === 'ALL' ? 'bg-[#2b6cb0] text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Todas ({validationResults.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('VALID')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      filterTab === 'VALID' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Válidas ({validCount})
                  </button>
                  <button
                    onClick={() => setFilterTab('WARNING')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      filterTab === 'WARNING' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    Advertencias ({warningCount})
                  </button>
                  <button
                    onClick={() => setFilterTab('ERROR')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      filterTab === 'ERROR' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    Rechazadas ({errorCount})
                  </button>
                </div>

                {/* Search in preview */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por póliza, contratante..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="bg-white border border-[#b9d0ea] rounded pl-7 pr-2 py-1 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                    />
                  </div>

                  {hasInconsistencies && (
                    <button
                      onClick={handleDownloadErrors}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded text-[11px] font-bold cursor-pointer transition-colors"
                      title="Descargar reporte Excel con los detalles de las filas que fallaron la validación"
                    >
                      <Download className="w-3.5 h-3.5 text-rose-600" />
                      <span>Descargar Errores</span>
                    </button>
                  )}

                  <button
                    onClick={handleSelectAllValid}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-[#b9d0ea] text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                  >
                    Seleccionar Válidas
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-[#b9d0ea] text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                  >
                    Desmarcar
                  </button>
                </div>

              </div>

              {/* PREVIEW TABLE */}
              <div className="bg-white border border-[#c3d5ea] rounded-md overflow-hidden shadow-2xs max-h-[320px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="sticky top-0 bg-[#eef4fb] border-b border-[#c3d5ea] text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 w-8 text-center border-r border-[#c3d5ea]">
                          <input
                            type="checkbox"
                            checked={
                              selectedPoliciesToImport.length > 0 &&
                              selectedPoliciesToImport.length === validationResults.filter((r) => r.status !== 'ERROR').length
                            }
                            onChange={(e) => {
                              if (e.target.checked) handleSelectAllValid();
                              else handleDeselectAll();
                            }}
                            className="rounded border-[#a9c2e0] text-[#2b6cb0] focus:ring-[#2b6cb0] cursor-pointer"
                          />
                        </th>
                        <th className="p-2 border-r border-[#c3d5ea] min-w-[110px]">No. Póliza</th>
                        <th className="p-2 border-r border-[#c3d5ea] min-w-[170px]">Contratante & Documento</th>
                        <th className="p-2 border-r border-[#c3d5ea] min-w-[140px]">Cobertura / Plan</th>
                        <th className="p-2 border-r border-[#c3d5ea] text-right">Asegurados</th>
                        <th className="p-2 border-r border-[#c3d5ea] text-right">Tarifa Actual Anual</th>
                        <th className="p-2 border-r border-[#c3d5ea] text-center">F. Renovación</th>
                        <th className="p-2 border-r border-[#c3d5ea] text-center">Validación Core</th>
                        <th className="p-2 min-w-[200px]">Detalle / Diagnóstico Core</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-slate-400">
                            No se encontraron filas con el filtro aplicado.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((row, idx) => {
                          const isSelected = selectedRowIds.has(row.rowNumber - 2);
                          const isBlocked = row.status === 'ERROR';

                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isBlocked
                                  ? 'bg-rose-50/40 text-slate-600'
                                  : isSelected
                                  ? 'bg-blue-50/50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="p-2 text-center border-r border-slate-200">
                                <input
                                  type="checkbox"
                                  disabled={isBlocked}
                                  checked={isSelected && !isBlocked}
                                  onChange={() => handleToggleSelectRow(row.rowNumber - 2)}
                                  className={`rounded border-[#a9c2e0] text-[#2b6cb0] focus:ring-[#2b6cb0] ${
                                    isBlocked ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                                  }`}
                                />
                              </td>
                              
                              {/* No. Póliza */}
                              <td className="p-2 font-mono font-bold text-slate-800 border-r border-slate-200">
                                {row.policyNumber || <span className="text-rose-500 italic">Sin Póliza</span>}
                              </td>

                              {/* Contratante */}
                              <td className="p-2 border-r border-slate-200">
                                <div className="font-semibold text-slate-800 truncate max-w-[170px]" title={row.contratante}>
                                  {row.contratante || <span className="text-rose-500 italic">No especificado</span>}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {row.tipoDoc}: {row.docNumber || '—'}
                                </div>
                              </td>

                              {/* Cobertura */}
                              <td className="p-2 border-r border-slate-200 text-slate-700">
                                {row.cobertura}
                              </td>

                              {/* Asegurados */}
                              <td className="p-2 text-right font-mono font-bold text-slate-800 border-r border-slate-200">
                                {row.asegurados.toLocaleString('es-DO')}
                              </td>

                              {/* Tarifa Actual Anual */}
                              <td className="p-2 text-right font-mono text-slate-700 border-r border-slate-200">
                                {formatCurrency(row.tarifaActualAnual)}
                              </td>

                              {/* F. Renovación */}
                              <td className="p-2 text-center font-mono text-slate-700 border-r border-slate-200">
                                {row.fechaRenovacion}
                              </td>

                              {/* Status Badge */}
                              <td className="p-2 text-center border-r border-slate-200">
                                {row.status === 'VALID' && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <Check className="w-3 h-3" /> Core OK
                                  </span>
                                )}
                                {row.status === 'WARNING' && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    <AlertTriangle className="w-3 h-3" /> Aviso
                                  </span>
                                )}
                                {row.status === 'ERROR' && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    <X className="w-3 h-3" /> Rechazado
                                  </span>
                                )}
                              </td>

                              {/* Diagnosis message */}
                              <td className="p-2 text-[10px] text-slate-600">
                                {row.statusMessages.map((m, mi) => (
                                  <div key={mi} className={row.status === 'ERROR' ? 'text-rose-700 font-medium' : ''}>
                                    {m}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#eef4fb] border-t border-[#c3d5ea] px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="text-slate-600 text-xs font-medium flex items-center gap-3">
            {validationResults.length > 0 && (
              <span>
                Pólizas seleccionadas para incorporar: <strong className="text-[#1e4e8c] font-bold">{selectedPoliciesToImport.length}</strong> de {validationResults.length}
              </span>
            )}
            {hasInconsistencies && (
              <span className="text-rose-700 font-medium text-[11px] flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                {inconsistentRows.length} fila(s) con inconsistencias detectadas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasInconsistencies && (
              <button
                onClick={handleDownloadErrors}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                title="Descargar reporte Excel con los detalles de las filas que fallaron la validación"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>Descargar Errores ({inconsistentRows.length})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-white hover:bg-slate-100 border border-[#b9d0ea] text-slate-700 font-medium text-xs cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>

            {validationResults.length > 0 && (
              <button
                onClick={handleExecuteImport}
                disabled={selectedPoliciesToImport.length === 0}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded font-bold text-xs transition-all shadow-2xs ${
                  selectedPoliciesToImport.length > 0
                    ? 'bg-[#2b6cb0] hover:bg-[#235891] text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sustituir e Importar a Cartera ({selectedPoliciesToImport.length})</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
