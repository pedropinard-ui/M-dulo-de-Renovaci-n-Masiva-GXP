import React from 'react';
import { TrendingUp, Layers, ArrowUpRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/calculations';

interface ExecutiveKpiBarProps {
  kpis: {
    cantidadSeleccionadas: number;
    totalPolizas: number;
    primaActualTotal: number;
    primaRenovadaTotal: number;
    incrementoTotal: number;
    variacionPorcentualTotal: number;
    totalConError: number;
    totalValidadas: number;
    totalNotificadas: number;
    totalProcesadas: number;
    totalExcepciones: number;
  };
  activeTab?: string;
  currentStep?: number;
}

export const ExecutiveKpiBar: React.FC<ExecutiveKpiBarProps> = ({ kpis }) => {
  const isPositive = kpis.incrementoTotal >= 0;

  return (
    <div aria-label="Resumen Ejecutivo" className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Metric 1: Scope & Selection */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pólizas Seleccionadas
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl lg:text-2xl font-extrabold text-slate-900 font-mono">
                {kpis.cantidadSeleccionadas}
              </span>
              <span className="text-xs text-slate-500">
                de {kpis.totalPolizas} total
              </span>
              {kpis.totalExcepciones > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                  {kpis.totalExcepciones} excepción
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Prima Actual Total */}
        <div className="hidden sm:block pl-4 border-l border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Prima Actual Total
          </div>
          <div className="text-lg lg:text-xl font-bold text-slate-700 font-mono">
            {formatCurrency(kpis.primaActualTotal)}
          </div>
        </div>

        {/* Metric 3: Prima Renovada Total */}
        <div className="pl-4 border-l border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <span>Prima Renovada</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg lg:text-xl font-bold text-blue-600 font-mono">
            {formatCurrency(kpis.primaRenovadaTotal)}
          </div>
        </div>

        {/* Metric 4: Incremento Total & % Variación */}
        <div className="pl-4 border-l border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Variación Estimada
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg lg:text-xl font-bold font-mono ${isPositive ? 'text-emerald-600' : 'text-slate-700'}`}>
              {formatCurrency(kpis.incrementoTotal)}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                kpis.variacionPorcentualTotal > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <TrendingUp className="w-3 h-3 mr-1 inline" />
              {formatPercent(kpis.variacionPorcentualTotal)}
            </span>
          </div>
        </div>

        {/* Metric 5: Status Pills */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                {kpis.totalValidadas} Válidas
              </span>
              {kpis.totalConError > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                  <AlertTriangle className="w-3 h-3" />
                  {kpis.totalConError} Obs.
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                {kpis.totalNotificadas} Notificadas
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[10px]">
                {kpis.totalProcesadas} Procesadas
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
