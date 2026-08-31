import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  CheckCircle2, 
  UserCheck, 
  History, 
  RefreshCw
} from 'lucide-react';
import { ComplianceMassRun } from '../../types';
import { exportComplianceReportPDF } from '../../utils/pdfHelper';
import * as XLSX from 'xlsx';

interface ScreenDebidaDiligenciaProps {
  complianceRuns: ComplianceMassRun[];
  onAddComplianceRun: (run: ComplianceMassRun) => void;
  currentUser: string;
}

export const ScreenDebidaDiligencia: React.FC<ScreenDebidaDiligenciaProps> = ({
  complianceRuns,
  onAddComplianceRun,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'masiva' | 'historial'>('masiva');
  
  // Single Consultation Form State (with Passport & National ID)
  const [docType, setDocType] = useState<'Cédula' | 'Pasaporte'>('Cédula');
  const [docNumber, setDocNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [singleResult, setSingleResult] = useState<any | null>(null);

  // Mass Consultation Form State
  const [massMotivo, setMassMotivo] = useState<string>('Verificación semestral de cartera de renovaciones GXP');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingMass, setIsProcessingMass] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'Cumplimiento' | 'Negocios' | 'Técnico'>('Cumplimiento');

  // Filter Date Range for PDF Export
  const [exportDesde] = useState<string>('');
  const [exportHasta] = useState<string>('');

  // Active Run for viewing detail
  const [activeRunDetail, setActiveRunDetail] = useState<ComplianceMassRun>(complianceRuns[0]);

  // Single Search Handler
  const handleExecuteSingleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber) return;
    if (docType === 'Pasaporte' && !fullName) return;

    const isMatch = docNumber.includes('999') || fullName.toLowerCase().includes('sancionado');

    const result = {
      nombre: fullName || 'JUAN PEREZ SANTANA',
      tipoDocumento: docType,
      numeroDocumento: docNumber,
      consultaListas: isMatch ? 'Coincidencia con Listas de Control' : 'No está en las listas ONU/OFAC/UNIVERSAL',
      clasificacion: isMatch ? 'Requiere Debida Diligencia Ampliada' : 'Clasifica para Debida Diligencia simplificada',
      fecha: new Date().toLocaleDateString('es-DO'),
      usuarioConsulta: currentUser,
      canalOrigen: 'Portal Web GXP',
    };

    setSingleResult(result);
  };

  // Mass Upload Handler
  const handleMassFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleExecuteMassRun = () => {
    if (!massMotivo) return;
    setIsProcessingMass(true);

    setTimeout(() => {
      const runId = `CORR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const sampleRecords = [
        {
          nombre: 'BIANCA JOVINE GUZMAN',
          tipoDocumento: 'Cédula' as const,
          numeroDocumento: '00116822461',
          consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
          clasificacion: 'Clasifica para Debida Diligencia simplificada',
          fecha: new Date().toLocaleDateString('es-DO'),
          usuarioConsulta: currentUser,
          tipoConsulta: 'Masiva' as const,
        },
        {
          nombre: 'PIERRE DUPONT',
          tipoDocumento: 'Pasaporte' as const,
          numeroDocumento: 'PA9938472',
          consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
          clasificacion: 'Clasifica para Debida Diligencia simplificada',
          fecha: new Date().toLocaleDateString('es-DO'),
          usuarioConsulta: currentUser,
          tipoConsulta: 'Masiva' as const,
        },
        {
          nombre: 'BERGIS LUCIA GARCIA ACOSTA',
          tipoDocumento: 'Cédula' as const,
          numeroDocumento: '03700779279',
          consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
          clasificacion: 'Clasifica para Debida Diligencia simplificada',
          fecha: new Date().toLocaleDateString('es-DO'),
          usuarioConsulta: currentUser,
          tipoConsulta: 'Masiva' as const,
        },
        {
          nombre: 'KATHIA ESMERALDINA OLIVERO RODRIGUEZ',
          tipoDocumento: 'Cédula' as const,
          numeroDocumento: '40219198708',
          consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
          clasificacion: 'Clasifica para Debida Diligencia simplificada',
          fecha: new Date().toLocaleDateString('es-DO'),
          usuarioConsulta: currentUser,
          tipoConsulta: 'Masiva' as const,
        },
        {
          nombre: 'DIEGO ARISMENDY REYES GONZALEZ',
          tipoDocumento: 'Cédula' as const,
          numeroDocumento: '40232988036',
          consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
          clasificacion: 'Clasifica para Debida Diligencia simplificada',
          fecha: new Date().toLocaleDateString('es-DO'),
          usuarioConsulta: currentUser,
          tipoConsulta: 'Masiva' as const,
        },
      ];

      const newRun: ComplianceMassRun = {
        id: `run-${Date.now()}`,
        numeroCorrida: runId,
        fechaHora: new Date().toLocaleString('es-DO'),
        usuario: currentUser,
        area: userRole,
        motivo: massMotivo,
        nombreArchivo: selectedFile ? selectedFile.name : 'Plantilla_Debida_Diligencia_GXP.xlsx',
        totalCargados: sampleRecords.length,
        totalProcesados: sampleRecords.length,
        totalCoincidencias: 0,
        totalSinCoincidencias: sampleRecords.length,
        totalErrores: 0,
        registros: sampleRecords,
      };

      onAddComplianceRun(newRun);
      setActiveRunDetail(newRun);
      setIsProcessingMass(false);
      setActiveTab('historial');
    }, 1200);
  };

  const handleExportPDF = () => {
    if (!activeRunDetail) return;
    const dateRange = exportDesde || exportHasta ? `${exportDesde || 'Inicio'} a ${exportHasta || 'Fin'}` : undefined;
    exportComplianceReportPDF(activeRunDetail.registros, dateRange);
  };

  const handleExportExcel = () => {
    if (!activeRunDetail) return;
    const data = activeRunDetail.registros.map((r, i) => ({
      'No.': i + 1,
      'Nombre Completo': r.nombre,
      'Tipo de Documento': r.tipoDocumento,
      'Número de Documento': r.numeroDocumento,
      'Consulta Listas': r.consultaListas,
      'Clasificación': r.clasificacion,
      'Fecha': r.fecha,
      'Usuario Consulta': r.usuarioConsulta,
      'Tipo Consulta': r.tipoConsulta,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Debida Diligencia');
    XLSX.writeFile(wb, `Debida_Diligencia_${activeRunDetail.numeroCorrida}.xlsx`);
  };

  // Filter visible runs based on user profile access rules (Page 14 of specification)
  const visibleRuns = complianceRuns.filter((r) => {
    if (userRole === 'Cumplimiento') return true;
    return r.usuario === currentUser;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Debida Diligencia Masiva & Listas de Control (AML / OFAC)
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
              Normativa Universal Seguros
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validación de prevención de lavado de activos y cumplimiento sobre asegurados y contratantes mediante Cédula y Pasaporte con soporte para corridas masivas en Excel y exportación en PDF.
          </p>
        </div>

        {/* Role Switcher for Compliance Access Testing */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
          <label htmlFor="user-role-select" className="text-slate-500 font-semibold">Perfil de Acceso:</label>
          <select
            id="user-role-select"
            aria-label="Seleccionar Perfil de Acceso"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            className="bg-transparent text-teal-700 font-bold focus:outline-none"
          >
            <option value="Cumplimiento">Cumplimiento (Acceso Total)</option>
            <option value="Negocios">Negocios (Solo Propias)</option>
            <option value="Técnico">Técnico (Solo Propias)</option>
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('masiva')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'masiva' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>4.0 Debida Diligencia Masiva (Excel)</span>
        </button>

        <button
          onClick={() => setActiveTab('individual')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'individual' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>2.0 Consulta con Cédula / Pasaporte</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'historial' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>4.4 Historial de Corridas Masivas ({visibleRuns.length})</span>
        </button>
      </div>

      {/* TAB 1: MASS UPLOAD & RUN REGISTRATION */}
      {activeTab === 'masiva' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4.1 Registrar y Ejecutar Corrida Masiva de Debida Diligencia
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Formato requerido: Nombre completo | Tipo de documento (Cédula o Pasaporte) | Número
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form inputs */}
              <div className="space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Motivo de la Consulta <span className="text-rose-600">* (Obligatorio)</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={massMotivo}
                    onChange={(e) => setMassMotivo(e.target.value)}
                    placeholder="Ej: Verificación semestral de cartera de renovaciones GXP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Usuario Ejecutor:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Área / Departamento:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userRole}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-800">Reglas de Negocio Validadas:</div>
                  <ul className="text-slate-600 text-[11px] space-y-0.5 list-disc list-inside">
                    <li>Validación automática de estructura de columnas en el archivo.</li>
                    <li>Soporta clientes nacionales con Cédula y extranjeros con Pasaporte.</li>
                    <li>Cada registro se evalúa contra listas ONU, OFAC y listas internas Universal.</li>
                    <li>Registro formal de corrida para fines de auditoría.</li>
                  </ul>
                </div>

              </div>

              {/* Drag and Drop Zone matching page 9 design */}
              <div className="flex flex-col justify-between p-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors text-center">
                <div className="space-y-3 my-auto">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-xs">
                      ARRASTRE AQUÍ EL ARCHIVO EXCEL
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      o seleccione un archivo desde su equipo (.xlsx, .xls, .csv)
                    </div>
                  </div>

                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleMassFileUpload}
                    className="hidden"
                    id="compliance-file-input"
                  />
                  <label
                    htmlFor="compliance-file-input"
                    className="inline-block px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-teal-700 font-bold text-xs cursor-pointer border border-slate-200 shadow-sm transition-colors"
                  >
                    {selectedFile ? `Archivo: ${selectedFile.name}` : 'Seleccionar Archivo'}
                  </label>
                </div>

                {selectedFile && (
                  <div className="pt-3 border-t border-slate-200 text-xs text-emerald-700 flex items-center justify-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Archivo listo para procesar ({selectedFile.name})</span>
                  </div>
                )}
              </div>

            </div>

            {/* Execute Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleExecuteMassRun}
                disabled={isProcessingMass || !massMotivo}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                {isProcessingMass ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Ejecutando Debida Diligencia Masiva...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Procesar Consultas Masivas</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: INDIVIDUAL CONSULTATION WITH PASSPORT OR CEDULA */}
      {activeTab === 'individual' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2.0 Consulta de Debida Diligencia (Extranjeros con Pasaporte & Cédula)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Para consultas con pasaporte, el nombre completo y número de pasaporte son obligatorios según norma.
            </p>
          </div>

          <form onSubmit={handleExecuteSingleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Document Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Documento:
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="Cédula">Cédula de Identidad y Electoral</option>
                <option value="Pasaporte">Pasaporte (Extranjeros)</option>
              </select>
            </div>

            {/* Document Number */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Número de Documento <span className="text-rose-600">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder={docType === 'Cédula' ? '001-1682246-1' : 'PA-9938472'}
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            {/* Full Name (Mandatory for Passport) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre Completo {docType === 'Pasaporte' && <span className="text-rose-600">* (Obligatorio en Pasaporte)</span>}:
              </label>
              <input
                type="text"
                required={docType === 'Pasaporte'}
                placeholder="Ej: PIERRE DUPONT"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Consultar Listas</span>
              </button>
            </div>
          </form>

          {/* Single Result Display */}
          {singleResult && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Resultado de la Búsqueda
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Nombre:</span>
                  <span className="font-bold text-slate-900">{singleResult.nombre}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Documento:</span>
                  <span className="font-mono text-blue-600 font-medium">{singleResult.tipoDocumento}: {singleResult.numeroDocumento}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Consulta Listas:</span>
                  <span className="font-semibold text-emerald-700">{singleResult.consultaListas}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Clasificación:</span>
                  <span className="font-semibold text-teal-700">{singleResult.clasificacion}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: RUN DETAILS & HISTORICAL EXPORT IN PDF/EXCEL (Matching pages 4, 6, 7, 12, 13) */}
      {activeTab === 'historial' && activeRunDetail && (
        <div className="space-y-6">
          
          {/* Executive Summary of the Run (Page 12 info) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4.2 Resultado de la Corrida: {activeRunDetail.numeroCorrida}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                    {activeRunDetail.area}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Motivo: {activeRunDetail.motivo} • Archivo: {activeRunDetail.nombreArchivo}
                </p>
              </div>

              {/* Export in PDF & Excel Buttons (Pages 6, 7, 13) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exportar Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>4.3 Exportar PDF</span>
                </button>
              </div>
            </div>

            {/* KPI Cards (Page 12) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Registros Cargados:</span>
                <span className="text-xl font-bold text-slate-900 font-mono">{activeRunDetail.totalCargados}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Registros Procesados:</span>
                <span className="text-xl font-bold text-teal-700 font-mono">{activeRunDetail.totalProcesados}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 text-[11px] block">Sin Coincidencias:</span>
                <span className="text-xl font-bold text-emerald-700 font-mono">{activeRunDetail.totalSinCoincidencias}</span>
              </div>
              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
                <span className="text-rose-700 text-[11px] block">Con Coincidencias:</span>
                <span className="text-xl font-bold text-rose-700 font-mono">{activeRunDetail.totalCoincidencias}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[11px] block">Registros con Error:</span>
                <span className="text-xl font-bold text-slate-600 font-mono">{activeRunDetail.totalErrores}</span>
              </div>
            </div>
          </div>

          {/* Results Grid matching page 4 and 12 layout */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Resultados de la Búsqueda & Detalle de Clientes
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Ejecutado por: {activeRunDetail.usuario} ({activeRunDetail.fechaHora})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Tipo Doc</th>
                    <th className="p-3">Documento</th>
                    <th className="p-3">Consulta Listas</th>
                    <th className="p-3">Clasificación</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Usuario Consulta</th>
                    <th className="p-3 text-center">Tipo Consulta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeRunDetail.registros.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">
                        {rec.nombre}
                      </td>
                      <td className="p-3 text-slate-600">
                        {rec.tipoDocumento}
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600">
                        {rec.numeroDocumento}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rec.consultaListas}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {rec.clasificacion}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {rec.fecha}
                      </td>
                      <td className="p-3 text-slate-500">
                        {rec.usuarioConsulta}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {rec.tipoConsulta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
