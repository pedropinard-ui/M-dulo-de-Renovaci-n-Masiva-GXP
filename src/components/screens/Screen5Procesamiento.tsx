import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  CheckCircle2, 
  Download, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Activity, 
  Mail,
  AlertTriangle,
  Terminal,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PolicyRenewal, ProcessingExecutionSummary } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/calculations';
import { exportProcessingBitacoraToExcel } from '../../utils/excelHelper';

interface Screen5ProcesamientoProps {
  policies: PolicyRenewal[];
  selectedPolicyIds: Set<string>;
  lastExecutionSummary: ProcessingExecutionSummary | null;
  onExecuteProcessing: () => Promise<ProcessingExecutionSummary>;
  onGoBackToValidation: () => void;
  onGoToCommunication: () => void;
  onGoBackToCommunication?: () => void;
  onResetWorkflow?: () => void;
}

export const Screen5Procesamiento: React.FC<Screen5ProcesamientoProps> = ({
  policies,
  selectedPolicyIds,
  lastExecutionSummary,
  onExecuteProcessing,
  onGoBackToValidation,
  onGoToCommunication,
  onGoBackToCommunication,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepLog, setCurrentStepLog] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'bitacora' | 'consola'>('resumen');

  const handleBackToPrev = onGoBackToValidation || onGoBackToCommunication || (() => {});

  const targetPolicies = policies.filter((p) => selectedPolicyIds.has(p.id));
  const validPolicies = targetPolicies.filter((p) => p.erroresValidacion.filter(e => e.severidad === 'Bloqueante').length === 0);
  const invalidPolicies = targetPolicies.filter((p) => p.erroresValidacion.some(e => e.severidad === 'Bloqueante'));

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setProgressPercent(10);
    setConsoleLogs([
      `[${new Date().toLocaleTimeString()}] INICIANDO LOTE DE RENOVACIÓN MASIVA GXP...`,
      `[${new Date().toLocaleTimeString()}] Conectando a servicio de transacciones Core ACSEL... OK`,
      `[${new Date().toLocaleTimeString()}] Total seleccionadas: ${targetPolicies.length} | Válidas: ${validPolicies.length} | Omitidas por error: ${invalidPolicies.length}`,
    ]);
    setCurrentStepLog('Verificando bloqueo de registros y reglas de exclusión...');

    setTimeout(() => {
      setProgressPercent(35);
      setCurrentStepLog('Aplicando nuevas tarifas y vigencias en tablas maestras...');
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Aplicando nuevas tarifas vigencia Q4-2026...`,
      ]);
    }, 600);

    setTimeout(() => {
      setProgressPercent(70);
      setCurrentStepLog('Generando asientos de auditoría y pólizas actualizadas...');
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Grabando registros en histórico de tarifas y auditoría...`,
      ]);
    }, 1200);

    setTimeout(async () => {
      setProgressPercent(100);
      setCurrentStepLog('Proceso finalizado con éxito.');
      const result = await onExecuteProcessing();
      setConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] PROCESAMIENTO COMPLETADO: ${result.totalExitosas} exitosas, ${result.totalFallidas} fallidas.`,
        `[${new Date().toLocaleTimeString()}] Bitácora generada: ${result.numeroCorrida}`,
      ]);
      setIsProcessing(false);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }, 1800);
  };

  const isExecuted = Boolean(lastExecutionSummary);

  return (
    <div className="space-y-3">
      
      {/* 1. TOP SUB-HEADER / CRITERIA & MACRO ACTIONS */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#d2e2f3]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2b6cb0]"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Procesamiento Core ACSEL & Actualización de Pólizas
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-[#2b6cb0] border border-[#bcd2eb] rounded">
              {targetPolicies.length} pólizas seleccionadas
            </span>
            {isExecuted && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Corrida Ejecutada ({lastExecutionSummary?.numeroCorrida})</span>
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            {lastExecutionSummary && (
              <button
                onClick={() => exportProcessingBitacoraToExcel(lastExecutionSummary.detalles)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
                title="Descargar bitácora de ejecución"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Descargar Bitácora</span>
              </button>
            )}

            {/* Sub-Tabs Selector */}
            <div className="flex items-center bg-white border border-[#b9d0ea] rounded p-0.5">
              <button
                onClick={() => setActiveTab('resumen')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'resumen'
                    ? 'bg-[#2b6cb0] text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Panel de Control
              </button>
              <button
                onClick={() => setActiveTab('bitacora')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'bitacora'
                    ? 'bg-[#2b6cb0] text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Bitácora Detallada
              </button>
              <button
                onClick={() => setActiveTab('consola')}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'consola'
                    ? 'bg-[#2b6cb0] text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Consola Transaccional
              </button>
            </div>
          </div>
        </div>

        {/* Execution Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 pb-2 text-xs">
          <div className="bg-white p-2 rounded border border-[#b9d0ea] flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Pólizas en Lote</span>
            <span className="text-sm font-bold text-slate-800 font-mono mt-0.5">{targetPolicies.length}</span>
          </div>

          <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200 flex flex-col">
            <span className="text-[10px] font-bold text-emerald-800">Listas para Actualizar</span>
            <span className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{validPolicies.length}</span>
          </div>

          <div className="bg-rose-50/70 p-2 rounded border border-rose-200 flex flex-col">
            <span className="text-[10px] font-bold text-rose-800">Bloqueadas (No se procesan)</span>
            <span className="text-sm font-bold text-rose-700 font-mono mt-0.5">{invalidPolicies.length}</span>
          </div>

          <div className="bg-[#eaf2fb] p-2 rounded border border-[#bcd2eb] flex flex-col">
            <span className="text-[10px] font-bold text-[#1e4e8c]">Estado de Transacción</span>
            <span className="text-sm font-bold text-[#1e4e8c] font-mono mt-0.5">
              {isProcessing ? 'En Proceso...' : isExecuted ? 'Completado Core' : 'Listo para Ejecutar'}
            </span>
          </div>
        </div>

      </div>

      {/* 2. MAIN CONTENT AREA (Matching Unified Blueprint) */}
      <div className="bg-white rounded-md border border-[#c3d5ea] shadow-2xs overflow-hidden min-h-[420px] flex flex-col min-w-0">
        
        {/* TAB 1: RESUMEN / PANEL DE CONTROL */}
        {activeTab === 'resumen' && (
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            
            {/* Action Trigger Card */}
            <div className="bg-[#f8fafc] border border-[#c3d5ea] rounded-md p-4 text-center max-w-2xl mx-auto w-full space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#eef4fb] border border-[#bcd2eb] flex items-center justify-center mx-auto text-[#2b6cb0]">
                <Cpu className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isExecuted ? 'Lote Procesado Exitosamente en Core ACSEL' : 'Listo para Procesar Lote en Core ACSEL'}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Se actualizarán las tarifas, anexos y nuevas vigencias de las <strong>{validPolicies.length}</strong> pólizas válidas.
                </p>
              </div>

              {/* Progress bar when running */}
              {isProcessing && (
                <div className="space-y-1 pt-2 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{currentStepLog}</span>
                    <span className="font-mono font-bold text-[#2b6cb0]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2b6cb0] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Trigger Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartProcessing}
                  disabled={isProcessing || validPolicies.length === 0}
                  className={`inline-flex items-center gap-2 px-6 py-2 rounded text-xs font-bold transition-all shadow-2xs ${
                    isProcessing || validPolicies.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-[#2b6cb0] hover:bg-[#235891] text-white cursor-pointer'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isExecuted ? 'Re-procesar Lote en Core ACSEL' : 'Iniciar Procesamiento Masivo en Core'}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Strip */}
            {lastExecutionSummary && (
              <div className="bg-[#eef4fb] border border-[#c3d5ea] rounded p-3 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Última corrida registrada:</span>
                  <span className="font-mono font-bold text-[#2b6cb0]">{lastExecutionSummary.numeroCorrida}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Exitosas: <strong className="text-emerald-700 font-mono font-bold">{lastExecutionSummary.totalExitosas}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Fallidas: <strong className="text-rose-700 font-mono font-bold">{lastExecutionSummary.totalFallidas}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Tiempo: <strong className="font-mono">{lastExecutionSummary.duracionSegundos}s</strong></span>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: BITÁCORA DETALLADA */}
        {activeTab === 'bitacora' && (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#d9e6f5] border-b border-[#b7cde6] text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    <th colSpan={3} className="py-1 px-3 border-r border-[#b7cde6]">Identificación de Póliza</th>
                    <th colSpan={2} className="py-1 px-3 border-r border-[#b7cde6]">Tarifas Aplicadas</th>
                    <th colSpan={2} className="py-1 px-3 text-center">Estado de Grabación Core</th>
                  </tr>
                  <tr className="bg-[#eef4fb] border-b border-[#c3d5ea] text-slate-700 font-bold text-[11px]">
                    <th className="p-2 border-r border-[#c3d5ea] min-w-[120px]">No. Póliza</th>
                    <th className="p-2 border-r border-[#c3d5ea] min-w-[190px]">Contratante</th>
                    <th className="p-2 border-r border-[#c3d5ea] min-w-[130px]">Cobertura</th>
                    <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[115px]">Tarifa Anterior</th>
                    <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[115px] bg-[#eaf2fb] text-[#1e4e8c]">Tarifa Nueva Core</th>
                    <th className="p-2 text-center border-r border-[#c3d5ea] min-w-[110px]">Resultado</th>
                    <th className="p-2 border-r border-[#c3d5ea] min-w-[160px]">Mensaje de Core</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {targetPolicies.map((policy) => {
                    const isInvalid = policy.erroresValidacion.some(e => e.severidad === 'Bloqueante');
                    const primaAct = policy.tarifaActual?.tarifaAnual ?? 0;
                    const primaRen = policy.tarifaRenovacion?.tarifaAnual ?? (primaAct * 1.15);

                    return (
                      <tr key={policy.id} className="hover:bg-[#eef5fc] transition-colors even:bg-[#fbfdff]">
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-[#2b6cb0]">{policy.numeroPoliza}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">{policy.contratante}</td>
                        <td className="p-2 border-r border-slate-200">{policy.cobertura}</td>
                        <td className="p-2 text-right border-r border-slate-200 font-mono text-slate-600">{formatCurrency(primaAct)}</td>
                        <td className="p-2 text-right border-r border-slate-200 font-mono font-bold text-[#1e4e8c] bg-[#f0f6fd]">{formatCurrency(primaRen)}</td>
                        <td className="p-2 text-center border-r border-slate-200">
                          {isInvalid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Omitida</span>
                          ) : isExecuted ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Grabada OK</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Pendiente</span>
                          )}
                        </td>
                        <td className="p-2 text-slate-600 text-[11px]">
                          {isInvalid ? 'Bloqueada por inconsistencia técnica' : isExecuted ? 'Transacción confirmada en ACSEL' : 'En cola de ejecución'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CONSOLA DE TRANSACCIONES */}
        {activeTab === 'consola' && (
          <div className="p-3 bg-[#0f172a] text-emerald-400 font-mono text-xs flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> ACSEL Server Engine Log Terminal</span>
              <span>Host: ACSEL-CORE-PROD-01</span>
            </div>
            <div className="flex-1 overflow-y-auto pt-2 space-y-1">
              {consoleLogs.length === 0 ? (
                <p className="text-slate-500">Esperando inicio de procesamiento...</p>
              ) : (
                consoleLogs.map((log, i) => <p key={i}>{log}</p>)
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-[#eef4fb] border-t border-[#c3d5ea] text-xs text-slate-700">
          <div className="flex items-center gap-3 font-medium">
            <span>Pólizas totales: <strong className="font-mono">{targetPolicies.length}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Válidas procesables: <strong className="font-mono text-emerald-700">{validPolicies.length}</strong></span>
          </div>
          <div>
            <span>Módulo Core: <strong className="text-[#2b6cb0]">ACSEL-Q4-RENEW</strong></span>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM GLOBAL ACTION & STATUS STRIP */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2b6cb0]"></span>
            <span className="font-semibold text-slate-800">
              Paso 4: Procesamiento & Grabación Core ACSEL
            </span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-600 hidden md:inline">
            Estado de actualización: <strong className="text-[#2b6cb0] font-mono font-bold">{isExecuted ? 'Lote Aplicado' : 'Listo para Enviar'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleBackToPrev}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Validación</span>
          </button>

          <button
            onClick={onGoToCommunication}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold bg-[#2b6cb0] hover:bg-[#235891] text-white cursor-pointer shadow-2xs"
          >
            <span>Continuar a Comunicación & Avisos (Paso 5)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
