import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  ShieldAlert,
  Search
} from 'lucide-react';
import { PolicyRenewal, ValidationError } from '../../types';
import { exportValidationErrorsToExcel } from '../../utils/excelHelper';

interface Screen3ValidacionProps {
  policies: PolicyRenewal[];
  selectedPolicyIds: Set<string>;
  onRunValidation?: () => void;
  onQuickFixPolicy?: (policyId: string, fixes: Partial<PolicyRenewal>) => void;
  onGoToProcessing: () => void;
  onGoToCommunication?: () => void;
  onGoBackToSimulation: () => void;
}

export const Screen3Validacion: React.FC<Screen3ValidacionProps> = ({
  policies,
  selectedPolicyIds,
  onGoToProcessing,
  onGoToCommunication,
  onGoBackToSimulation,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'TODOS' | 'Bloqueante' | 'Advertencia'>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const handleProceedNext = onGoToProcessing || onGoToCommunication || (() => {});
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

        {/* 6 Technical Rules Summary Checklist */}
        <div className="mt-2.5 pt-2 border-t border-[#d2e2f3] text-[11px] text-slate-700">
          <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2b6cb0]"></span>
            <span>Reglas Técnicas de Validación Evaluadas (6 Controles Mandatorios):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            <div className="p-1.5 rounded bg-white border border-[#c3d5ea] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-medium" title="1. Correo del cliente">1. Correo Cliente</span>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#c3d5ea] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-medium" title="2. Correo del intermediario">2. Correo Intermediario</span>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#c3d5ea] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-medium" title="3. Correo del supervisor">3. Correo Supervisor</span>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#c3d5ea] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-medium" title="4. Control de clientes (lista negra / OFAC / PEP)">4. Control Clientes (Lista Negra)</span>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#c3d5ea] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-medium" title="5. Saldo pendiente en Core ACSEL">5. Saldo Pendiente</span>
            </div>
            <div className="p-1.5 rounded bg-white border border-[#c3d5ea] flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-medium" title="6. Nueva prima a renovar sea menor que la anterior">6. Prima Nueva &lt; Anterior</span>
            </div>
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
                <th colSpan={1} className="py-1 px-3 bg-[#c9ddf2] text-[#1e4e8c] text-center">
                  Detalle de Inconsistencia & Hallazgo
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
                <th className="p-2 min-w-[320px]">
                  Descripción del Hallazgo / Mensaje
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 bg-slate-50/50">
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
                      <td className="p-2 text-slate-800 text-xs">
                        {errorDesc}
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

    </div>
  );
};
