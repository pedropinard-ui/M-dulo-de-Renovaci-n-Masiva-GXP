import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  Edit, 
  Check, 
  ShieldAlert,
  X,
  Search,
  Filter
} from 'lucide-react';
import { PolicyRenewal, ValidationError } from '../../types';
import { exportValidationErrorsToExcel } from '../../utils/excelHelper';

interface Screen3ValidacionProps {
  policies: PolicyRenewal[];
  selectedPolicyIds: Set<string>;
  onRunValidation: () => void;
  onQuickFixPolicy: (policyId: string, fixes: Partial<PolicyRenewal>) => void;
  onGoToProcessing: () => void;
  onGoToCommunication?: () => void;
  onGoBackToSimulation: () => void;
}

export const Screen3Validacion: React.FC<Screen3ValidacionProps> = ({
  policies,
  selectedPolicyIds,
  onRunValidation,
  onQuickFixPolicy,
  onGoToProcessing,
  onGoToCommunication,
  onGoBackToSimulation,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'TODOS' | 'Bloqueante' | 'Advertencia'>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fixingPolicyId, setFixingPolicyId] = useState<string | null>(null);
  
  const handleProceedNext = onGoToProcessing || onGoToCommunication || (() => {});
  
  // Quick Fix temporary inputs
  const [fixedEmail, setFixedEmail] = useState<string>('');
  const [fixedDoc, setFixedDoc] = useState<string>('');
  const [fixedBrokerEmail, setFixedBrokerEmail] = useState<string>('');
  const [fixedSupervisorEmail, setFixedSupervisorEmail] = useState<string>('');

  const targetPolicies = policies.filter((p) => selectedPolicyIds.has(p.id));
  
  // Aggregate errors
  const allErrorsList: { policy: PolicyRenewal; error: ValidationError }[] = [];
  let correctCount = 0;
  let withObservationCount = 0;

  targetPolicies.forEach((p) => {
    if (p.erroresValidacion.length === 0) {
      correctCount++;
    } else {
      withObservationCount++;
      p.erroresValidacion.forEach((err) => {
        allErrorsList.push({ policy: p, error: err });
      });
    }
  });

  const filteredErrors = allErrorsList.filter((item) => {
    if (filterSeverity !== 'TODOS' && item.error.severidad !== filterSeverity) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const regla = item.error.regla || item.error.campo || item.error.id;
      const mensaje = item.error.mensaje || item.error.descripcion || '';
      const match =
        item.policy.numeroPoliza.toLowerCase().includes(q) ||
        item.policy.contratante.toLowerCase().includes(q) ||
        regla.toLowerCase().includes(q) ||
        mensaje.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const blockingErrorsCount = allErrorsList.filter((e) => e.error.severidad === 'Bloqueante').length;
  const warningErrorsCount = allErrorsList.filter((e) => e.error.severidad === 'Advertencia').length;

  const handleOpenFix = (policy: PolicyRenewal) => {
    setFixingPolicyId(policy.id);
    setFixedEmail(policy.correoCliente || `${policy.contratante.toLowerCase().replace(/[^a-z0-9]/g, '')}@empresa.com.do`);
    setFixedDoc(policy.documentoContratante || '101-88992-3');
    setFixedBrokerEmail(policy.correoCorredor || 'renovaciones@brokerseguros.com');
    setFixedSupervisorEmail(policy.correoSupervisor || 'mvaldez@universal.com.do');
  };

  const handleApplyFix = (policyId: string) => {
    onQuickFixPolicy(policyId, {
      correoCliente: fixedEmail,
      documentoContratante: fixedDoc,
      correoCorredor: fixedBrokerEmail,
      correoSupervisor: fixedSupervisorEmail,
    });
    setFixingPolicyId(null);
  };

  const canProceed = blockingErrorsCount === 0;

  return (
    <div className="space-y-3">
      
      {/* 1. TOP SUB-HEADER / CRITERIA & ACTIONS BOX */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#d2e2f3]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2b6cb0]"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Validación Técnica de Cartera & Reglas de Suscripción
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-[#2b6cb0] border border-[#bcd2eb] rounded">
              {targetPolicies.length} pólizas auditadas
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <button
              onClick={onRunValidation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
              title="Volver a ejecutar motor de reglas"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2b6cb0]" />
              <span>Re-evaluar Reglas</span>
            </button>

            <button
              onClick={() => exportValidationErrorsToExcel(allErrorsList)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
              title="Descargar registro de errores a Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Errores</span>
            </button>
          </div>
        </div>

        {/* Validation Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 pb-2 text-xs">
          <div className="bg-white p-2 rounded border border-[#b9d0ea] flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Pólizas Auditadas</span>
            <span className="text-sm font-bold text-slate-800 font-mono mt-0.5">{targetPolicies.length}</span>
          </div>

          <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200 flex flex-col">
            <span className="text-[10px] font-bold text-emerald-800">100% Válidas (Listas)</span>
            <span className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{correctCount}</span>
          </div>

          <div className="bg-amber-50/70 p-2 rounded border border-amber-200 flex flex-col">
            <span className="text-[10px] font-semibold text-amber-800">Con Advertencias</span>
            <span className="text-sm font-bold text-amber-700 font-mono mt-0.5">{warningErrorsCount}</span>
          </div>

          <div className="bg-rose-50/70 p-2 rounded border border-rose-200 flex flex-col">
            <span className="text-[10px] font-bold text-rose-800">Errores Bloqueantes</span>
            <span className="text-sm font-bold text-rose-700 font-mono mt-0.5">{blockingErrorsCount}</span>
          </div>
        </div>

        {/* Filters Matrix Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#d2e2f3] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-700">Severidad:</span>
            <button
              onClick={() => setFilterSeverity('TODOS')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                filterSeverity === 'TODOS'
                  ? 'bg-[#2b6cb0] text-white font-bold'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-[#b9d0ea]'
              }`}
            >
              Todos ({allErrorsList.length})
            </button>

            <button
              onClick={() => setFilterSeverity('Bloqueante')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                filterSeverity === 'Bloqueante'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-white hover:bg-rose-50 text-rose-700 border border-[#b9d0ea]'
              }`}
            >
              Bloqueantes ({blockingErrorsCount})
            </button>

            <button
              onClick={() => setFilterSeverity('Advertencia')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                filterSeverity === 'Advertencia'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white hover:bg-amber-50 text-amber-800 border border-[#b9d0ea]'
              }`}
            >
              Advertencias ({warningErrorsCount})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar error, póliza o regla..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 bg-white border border-[#b9d0ea] rounded pl-7 pr-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            />
          </div>
        </div>

      </div>

      {/* 2. MAIN DATA GRID AREA (Matching Unified Grid Blueprint) */}
      <div className="bg-white rounded-md border border-[#c3d5ea] shadow-2xs overflow-hidden min-h-[420px] flex flex-col min-w-0">
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* GROUPED TABLE HEADERS */}
            <thead>
              {/* Level 1: Super Header */}
              <tr className="bg-[#d9e6f5] border-b border-[#b7cde6] text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                <th colSpan={3} className="py-1 px-3 border-r border-[#b7cde6]">
                  Póliza Afectada & Contratante
                </th>
                <th colSpan={2} className="py-1 px-3 border-r border-[#b7cde6]">
                  Diagnóstico de Suscripción & Regla
                </th>
                <th colSpan={2} className="py-1 px-3 bg-[#c9ddf2] text-[#1e4e8c] text-center">
                  Detalle de Inconsistencia & Corrección
                </th>
              </tr>

              {/* Level 2: Column Headers */}
              <tr className="bg-[#eef4fb] border-b border-[#c3d5ea] text-slate-700 font-bold text-[11px]">
                <th className="p-2 border-r border-[#c3d5ea] min-w-[120px]">
                  No. Póliza
                </th>
                <th className="p-2 border-r border-[#c3d5ea] min-w-[180px]">
                  Contratante
                </th>
                <th className="p-2 border-r border-[#c3d5ea] min-w-[130px]">
                  Cobertura
                </th>
                <th className="p-2 text-center border-r border-[#c3d5ea] min-w-[100px]">
                  Severidad
                </th>
                <th className="p-2 border-r border-[#c3d5ea] min-w-[150px]">
                  Código Regla
                </th>
                <th className="p-2 border-r border-[#c3d5ea] min-w-[280px]">
                  Descripción del Hallazgo / Mensaje
                </th>
                <th className="p-2 text-center min-w-[110px]">
                  Acción Rápida
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 bg-slate-50/50">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      <span className="font-bold text-slate-800 text-sm">Sin errores para la selección actual</span>
                      <span className="text-xs text-slate-500">Todas las pólizas en este filtro cumplen con las reglas de suscripción.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredErrors.map((item, index) => {
                  const isBlocking = item.error.severidad === 'Bloqueante';
                  const errorKey = item.error.codigo || item.error.campo || item.error.id || `err-${index}`;
                  const errorRegla = item.error.regla || item.error.campo || item.error.id;
                  const errorDesc = item.error.mensaje || item.error.descripcion || 'Inconsistencia en los datos de la póliza';

                  return (
                    <tr
                      key={`${item.policy.id}-${errorKey}-${index}`}
                      className={`hover:bg-[#eef5fc] transition-colors ${
                        isBlocking ? 'bg-rose-50/20' : 'even:bg-[#fbfdff]'
                      }`}
                    >
                      {/* No. Póliza */}
                      <td className="p-2 border-r border-slate-200 font-mono font-bold text-[#2b6cb0]">
                        {item.policy.numeroPoliza}
                      </td>

                      {/* Contratante */}
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-semibold text-slate-800 truncate max-w-[170px]" title={item.policy.contratante}>
                          {item.policy.contratante}
                        </div>
                      </td>

                      {/* Cobertura */}
                      <td className="p-2 border-r border-slate-200 text-slate-700 truncate max-w-[130px]" title={item.policy.cobertura}>
                        {item.policy.cobertura}
                      </td>

                      {/* Severidad */}
                      <td className="p-2 text-center border-r border-slate-200">
                        {isBlocking ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Bloqueante</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Advertencia</span>
                          </span>
                        )}
                      </td>

                      {/* Código Regla */}
                      <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-700">
                        {errorRegla}
                      </td>

                      {/* Descripción */}
                      <td className="p-2 border-r border-slate-200 text-slate-800 text-xs">
                        {errorDesc}
                      </td>

                      {/* Acción Rápida */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleOpenFix(item.policy)}
                          className="px-2 py-0.5 rounded bg-[#eef4fb] hover:bg-[#d8e7f7] text-[#2b6cb0] text-xs font-semibold border border-[#b9d0ea] transition-colors cursor-pointer"
                        >
                          Corregir
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Grid Footer Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-[#eef4fb] border-t border-[#c3d5ea] text-xs text-slate-700">
          <div className="flex items-center gap-3 font-medium">
            <span>Observaciones encontradas: <strong className="font-mono text-slate-800">{filteredErrors.length}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Bloqueantes que impiden emisión: <strong className="font-mono text-rose-700">{blockingErrorsCount}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {canProceed ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Listo para procesar</span>
              </span>
            ) : (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Requiere resolver errores bloqueantes</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 3. BOTTOM GLOBAL ACTION & STATUS STRIP */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2b6cb0]"></span>
            <span className="font-semibold text-slate-800">
              Paso 3: Validación Técnica & Reglas de Suscripción
            </span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-600 hidden md:inline">
            Pólizas listas para actualización Core ACSEL: <strong className="text-emerald-700 font-mono font-bold">{correctCount}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onGoBackToSimulation}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Simulación</span>
          </button>

          <button
            onClick={handleProceedNext}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold bg-[#2b6cb0] hover:bg-[#235891] text-white cursor-pointer shadow-2xs"
          >
            <span>Continuar a Procesamiento Core (Paso 4)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK FIX MODAL */}
      {fixingPolicyId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#c3d5ea] shadow-xl max-w-md w-full overflow-hidden text-xs">
            <div className="bg-[#eef4fb] p-3 border-b border-[#c3d5ea] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2b6cb0]" />
                <h3 className="font-bold text-slate-800">Corrección Rápida de Datos</h3>
              </div>
              <button
                onClick={() => setFixingPolicyId(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">RNC / Cédula Contratante:</label>
                <input
                  type="text"
                  value={fixedDoc}
                  onChange={(e) => setFixedDoc(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Correo Electrónico Contratante:</label>
                <input
                  type="email"
                  value={fixedEmail}
                  onChange={(e) => setFixedEmail(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Correo Electrónico Corredor:</label>
                <input
                  type="email"
                  value={fixedBrokerEmail}
                  onChange={(e) => setFixedBrokerEmail(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Correo Supervisor / Suscriptor:</label>
                <input
                  type="email"
                  value={fixedSupervisorEmail}
                  onChange={(e) => setFixedSupervisorEmail(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>
            </div>

            <div className="bg-[#eef4fb] p-3 border-t border-[#c3d5ea] flex items-center justify-end gap-2">
              <button
                onClick={() => setFixingPolicyId(null)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApplyFix(fixingPolicyId)}
                className="px-3 py-1 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold cursor-pointer"
              >
                Guardar y Revalidar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
