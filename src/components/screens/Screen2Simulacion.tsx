import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Download, 
  FileText, 
  Edit3, 
  Undo2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react';
import { PolicyRenewal } from '../../types';
import { formatCurrency, formatPercent, calculateSinglePolicyRate } from '../../utils/calculations';
import { exportPoliciesToExcel } from '../../utils/excelHelper';
import { exportSimulationReportPDF } from '../../utils/pdfHelper';

interface Screen2SimulacionProps {
  policies: PolicyRenewal[];
  selectedPolicyIds: Set<string>;
  onApplyGeneralIncrease?: (percent: number) => void;
  onApplyGeneralPercentage?: (percent: number) => void;
  onUpdateIndividualPolicyRate?: (policyId: string, percent: number, manualAnnualRate?: number, reason?: string) => void;
  onUpdatePolicyException?: (policyId: string, percent: number, manualAnnualRate?: number, reason?: string) => void;
  onResetPolicySimulation?: (policyId: string) => void;
  onResetAllSimulation?: () => void;
  onResetSimulation?: () => void;
  onGoToValidation: () => void;
  onGoBackToConsulta: () => void;
}

export const Screen2Simulacion: React.FC<Screen2SimulacionProps> = ({
  policies,
  selectedPolicyIds,
  onApplyGeneralIncrease,
  onApplyGeneralPercentage,
  onUpdateIndividualPolicyRate,
  onUpdatePolicyException,
  onResetPolicySimulation,
  onResetAllSimulation,
  onResetSimulation,
  onGoToValidation,
  onGoBackToConsulta,
}) => {
  const [generalPercent, setGeneralPercent] = useState<number>(15.0);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editPercentVal, setEditPercentVal] = useState<number>(0);
  const [editReasonVal, setEditReasonVal] = useState<string>('');
  const [editManualRateVal, setEditManualRateVal] = useState<string>('');
  
  // Feedback notification state
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'TODAS' | 'EXCEPCIONES' | 'GENERALES'>('TODAS');

  // Modal for advanced exception editing
  const [advancedModalPolicy, setAdvancedModalPolicy] = useState<PolicyRenewal | null>(null);
  const [modalPercent, setModalPercent] = useState<number>(0);
  const [modalManualRate, setModalManualRate] = useState<string>('');
  const [modalReason, setModalReason] = useState<string>('Negociación especial con corredor / baja siniestralidad');

  // Selected policies only
  const targetPolicies = policies.filter((p) => selectedPolicyIds.has(p.id));

  // Executive Summary Calculations
  let totalPrimaActual = 0;
  let totalPrimaRenovada = 0;
  let totalExcepciones = 0;

  targetPolicies.forEach((p) => {
    const act = p.tarifaActual?.tarifaAnual ?? p.tarifaActualAnual ?? 0;
    const ren = p.tarifaRenovacion?.tarifaAnual ?? p.tarifaRenovacionAnual ?? (act * (1 + (p.porcentajeIncremento || 0) / 100));
    totalPrimaActual += act;
    totalPrimaRenovada += ren;
    if (p.esExcepcionIndividual || p.esExcepcionManual) totalExcepciones++;
  });

  const totalIncremento = totalPrimaRenovada - totalPrimaActual;
  const totalVariacionPorcentual = totalPrimaActual > 0 ? (totalIncremento / totalPrimaActual) * 100 : 0;

  // General Increase trigger
  const handleApplyGeneral = () => {
    const fn = onApplyGeneralPercentage || onApplyGeneralIncrease;
    if (fn) {
      fn(Number(generalPercent) || 0);
    }
  };

  const handleResetAll = () => {
    const fn = onResetAllSimulation || onResetSimulation;
    if (fn) {
      fn();
    }
  };

  // Start inline edit mode
  const handleStartEdit = (policy: PolicyRenewal) => {
    setEditingPolicyId(policy.id);
    setEditPercentVal(policy.porcentajeIncremento ?? 0);
    setEditReasonVal(policy.motivoExcepcion || 'Ajuste por negociación comercial con corredor');
    const act = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
    const ren = policy.tarifaRenovacion?.tarifaAnual ?? policy.tarifaRenovacionAnual ?? (act * (1 + (policy.porcentajeIncremento || 0) / 100));
    setEditManualRateVal(ren.toString());
  };

  // Save individual edit & apply immediately
  const handleSaveIndividualEdit = (policyId: string) => {
    const fn = onUpdatePolicyException || onUpdateIndividualPolicyRate;
    if (fn) {
      const numPercent = Number(editPercentVal) || 0;
      fn(policyId, numPercent, undefined, editReasonVal);
    }
    setEditingPolicyId(null);
    setRecentlyUpdatedId(policyId);
    setTimeout(() => {
      setRecentlyUpdatedId(null);
    }, 2500);
  };

  // Open advanced modal
  const handleOpenAdvancedModal = (policy: PolicyRenewal) => {
    const act = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
    const ren = policy.tarifaRenovacion?.tarifaAnual ?? policy.tarifaRenovacionAnual ?? (act * (1 + (policy.porcentajeIncremento || 0) / 100));
    setAdvancedModalPolicy(policy);
    setModalPercent(policy.porcentajeIncremento ?? 0);
    setModalManualRate(ren.toString());
    setModalReason(policy.motivoExcepcion || 'Negociación especial con corredor / baja siniestralidad');
  };

  // Save from advanced modal
  const handleSaveAdvancedModal = () => {
    if (!advancedModalPolicy) return;
    const fn = onUpdatePolicyException || onUpdateIndividualPolicyRate;
    if (fn) {
      const numPercent = Number(modalPercent) || 0;
      const numManualRate = modalManualRate.trim() ? Number(modalManualRate) : undefined;
      fn(advancedModalPolicy.id, numPercent, numManualRate, modalReason);
    }
    const id = advancedModalPolicy.id;
    setAdvancedModalPolicy(null);
    setRecentlyUpdatedId(id);
    setTimeout(() => {
      setRecentlyUpdatedId(null);
    }, 2500);
  };

  // Reset a single policy exception
  const handleResetSingle = (policyId: string) => {
    if (onResetPolicySimulation) {
      onResetPolicySimulation(policyId);
    } else {
      const fn = onUpdatePolicyException || onUpdateIndividualPolicyRate;
      if (fn) {
        fn(policyId, Number(generalPercent) || 0, undefined, undefined);
      }
    }
    setRecentlyUpdatedId(policyId);
    setTimeout(() => {
      setRecentlyUpdatedId(null);
    }, 2000);
  };

  const handleExportPDF = () => {
    exportSimulationReportPDF(targetPolicies, {
      cantidadSeleccionadas: targetPolicies.length,
      primaActualTotal: totalPrimaActual,
      primaRenovadaTotal: totalPrimaRenovada,
      incrementoTotal: totalIncremento,
      variacionPorcentualTotal: totalVariacionPorcentual,
    });
  };

  // Filter policies for table view
  const filteredPolicies = targetPolicies.filter((p) => {
    if (filterType === 'EXCEPCIONES' && !p.esExcepcionIndividual && !p.esExcepcionManual) return false;
    if (filterType === 'GENERALES' && (p.esExcepcionIndividual || p.esExcepcionManual)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        p.numeroPoliza.toLowerCase().includes(q) ||
        p.contratante.toLowerCase().includes(q) ||
        (p.corredor && p.corredor.toLowerCase().includes(q)) ||
        (p.nombreCorredor && p.nombreCorredor.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      
      {/* 1. TOP SUB-HEADER / CRITERIA & MACRO ACTIONS (Unified with Screen1 Design) */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#d2e2f3]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2b6cb0]"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Simulación de Renovación & Tarifas
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-[#2b6cb0] border border-[#bcd2eb] rounded">
              {targetPolicies.length} pólizas en lote
            </span>
            {totalExcepciones > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                {totalExcepciones} excepciones individuales
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => exportPoliciesToExcel(targetPolicies, 'Simulacion_Tarifaria_GXP.xlsx')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
              title="Exportar a Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
              title="Descargar Reporte PDF"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>Reporte PDF</span>
            </button>

            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-600 text-xs cursor-pointer"
              title="Restablecer tarifas a valores estándar"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Economic Summary Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2.5 pb-2 text-xs">
          <div className="bg-white p-2 rounded border border-[#b9d0ea] flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Pólizas Seleccionadas</span>
            <span className="text-sm font-bold text-slate-800 font-mono mt-0.5">{targetPolicies.length}</span>
          </div>

          <div className="bg-white p-2 rounded border border-[#b9d0ea] flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Prima Actual Total</span>
            <span className="text-sm font-bold text-slate-800 font-mono mt-0.5">{formatCurrency(totalPrimaActual)}</span>
          </div>

          <div className="bg-[#eaf2fb] p-2 rounded border border-[#bcd2eb] flex flex-col">
            <span className="text-[10px] font-bold text-[#1e4e8c]">Prima Renovada Proyectada</span>
            <span className="text-sm font-bold text-[#1e4e8c] font-mono mt-0.5">{formatCurrency(totalPrimaRenovada)}</span>
          </div>

          <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200 flex flex-col">
            <span className="text-[10px] font-semibold text-emerald-800">Incremento Neto ($)</span>
            <span className="text-sm font-bold text-emerald-700 font-mono mt-0.5">+{formatCurrency(totalIncremento)}</span>
          </div>
        </div>

        {/* Controls Row: General % mass input, quick presets & filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2 border-t border-[#d2e2f3] text-xs">
          
          {/* Left: Mass Percentage Input & Presets */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-bold text-slate-700">Ajuste Masivo:</span>
            <div className="flex items-center bg-white border border-[#b9d0ea] rounded px-2 py-0.5">
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={generalPercent}
                onChange={(e) => setGeneralPercent(parseFloat(e.target.value) || 0)}
                className="w-12 bg-transparent text-right font-mono font-bold text-[#2b6cb0] text-xs focus:outline-none"
              />
              <span className="text-[11px] font-bold text-slate-500 ml-0.5">%</span>
            </div>

            <button
              onClick={handleApplyGeneral}
              className="px-2.5 py-1 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Aplicar a Todo el Lote</span>
            </button>
          </div>

          {/* Right: Search & View Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar póliza o contratante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 bg-white border border-[#b9d0ea] rounded pl-7 pr-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-white border border-[#b9d0ea] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            >
              <option value="TODAS">Todas las Pólizas</option>
              <option value="EXCEPCIONES">Solo Excepciones</option>
              <option value="GENERALES">Solo Ajuste General</option>
            </select>
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
                <th colSpan={4} className="py-1 px-3 border-r border-[#b7cde6]">
                  Identificación de la Póliza & Contratante
                </th>
                <th colSpan={2} className="py-1 px-3 border-r border-[#b7cde6]">
                  Base Tarifaria Actual
                </th>
                <th colSpan={4} className="py-1 px-3 bg-[#c9ddf2] text-[#1e4e8c] border-r border-[#b7cde6]">
                  Ajuste & Renovación Proyectada
                </th>
                <th colSpan={2} className="py-1 px-3 text-center">
                  Gestión de Excepción & Acción
                </th>
              </tr>

              {/* Level 2: Column Headers */}
              <tr className="bg-[#eef4fb] border-b border-[#c3d5ea] text-slate-700 font-bold text-[11px]">
                <th className="p-2 border-r border-[#c3d5ea] min-w-[120px]">
                  No. Póliza
                </th>
                <th className="p-2 border-r border-[#c3d5ea] min-w-[190px]">
                  Contratante
                </th>
                <th className="p-2 border-r border-[#c3d5ea] min-w-[130px]">
                  Cobertura
                </th>
                <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[95px]">
                  Asegurados
                </th>
                <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[110px] bg-[#f4f8fd]">
                  Tarifa Anual
                </th>
                <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[100px] bg-[#f4f8fd]">
                  Mensual
                </th>
                <th className="p-2 text-center border-r border-[#c3d5ea] min-w-[140px] bg-[#eaf2fb] text-[#1e4e8c]">
                  % Ajuste
                </th>
                <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[115px] bg-[#eaf2fb] text-[#1e4e8c]">
                  Renovada Anual
                </th>
                <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[100px] bg-[#eaf2fb] text-[#1e4e8c]">
                  Renovada Men.
                </th>
                <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[95px] bg-[#f0fdf4] text-emerald-800">
                  Dif. ($)
                </th>
                <th className="p-2 text-center border-r border-[#c3d5ea] min-w-[110px]">
                  Tipo de Tarifa
                </th>
                <th className="p-2 text-center min-w-[100px]">
                  Acción
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-500 bg-slate-50/50">
                    No se encontraron pólizas para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => {
                  const actualAnual = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
                  const actualMensual = policy.tarifaActual?.tarifaMensual ?? policy.tarifaActualMensual ?? (actualAnual / 12);
                  
                  const renovadaAnual = policy.tarifaRenovacion?.tarifaAnual ?? policy.tarifaRenovacionAnual ?? (actualAnual * (1 + (policy.porcentajeIncremento || 0) / 100));
                  const renovadaMensual = policy.tarifaRenovacion?.tarifaMensual ?? policy.tarifaRenovacionMensual ?? (renovadaAnual / 12);

                  const diffAnnual = renovadaAnual - actualAnual;
                  const isEditing = editingPolicyId === policy.id;
                  const isJustUpdated = recentlyUpdatedId === policy.id;
                  const isExcepcion = Boolean(policy.esExcepcionIndividual || policy.esExcepcionManual);

                  return (
                    <tr
                      key={policy.id}
                      className={`hover:bg-[#eef5fc] transition-colors ${
                        isJustUpdated
                          ? 'bg-emerald-50/90'
                          : isExcepcion
                          ? 'bg-amber-50/40'
                          : 'even:bg-[#fbfdff]'
                      }`}
                    >
                      {/* No. Póliza */}
                      <td className="p-2 border-r border-slate-200 font-mono font-bold text-[#2b6cb0]">
                        <div className="flex items-center gap-1">
                          {isJustUpdated && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{policy.numeroPoliza}</span>
                        </div>
                      </td>

                      {/* Contratante */}
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-semibold text-slate-800 truncate max-w-[180px]" title={policy.contratante}>
                          {policy.contratante}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {policy.tipoDocumentoContratante}: {policy.documentoContratante || 'S/D'}
                        </div>
                      </td>

                      {/* Cobertura */}
                      <td className="p-2 border-r border-slate-200 truncate max-w-[130px]" title={policy.cobertura}>
                        <span className="text-slate-700">{policy.cobertura}</span>
                      </td>

                      {/* Cantidad Asegurados */}
                      <td className="p-2 text-right border-r border-slate-200 font-mono text-xs font-semibold text-slate-800">
                        {policy.cantidadAsegurados !== undefined ? policy.cantidadAsegurados.toLocaleString('es-DO') : '-'}
                      </td>

                      {/* Tarifa Actual Anual */}
                      <td className="p-2 text-right border-r border-slate-200 font-mono text-slate-700 bg-[#f9fcff]">
                        {formatCurrency(actualAnual)}
                      </td>

                      {/* Tarifa Actual Mensual */}
                      <td className="p-2 text-right border-r border-slate-200 font-mono text-slate-500 bg-[#f9fcff]">
                        {formatCurrency(actualMensual)}
                      </td>

                      {/* % Ajuste Editable */}
                      <td className="p-2 text-center border-r border-slate-200 bg-[#f0f6fd]">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              step="0.5"
                              value={editPercentVal}
                              onChange={(e) => setEditPercentVal(parseFloat(e.target.value) || 0)}
                              className="w-14 bg-white border border-[#2b6cb0] rounded px-1 py-0.5 text-center font-mono font-bold text-xs text-[#2b6cb0] focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveIndividualEdit(policy.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              title="Aplicar cambio"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingPolicyId(null)}
                              className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono font-bold text-[#1e4e8c]">
                              {policy.porcentajeIncremento !== undefined ? `+${policy.porcentajeIncremento}%` : `+${generalPercent}%`}
                            </span>
                            <button
                              onClick={() => handleStartEdit(policy)}
                              className="p-0.5 rounded text-slate-400 hover:text-[#2b6cb0] hover:bg-[#d8e7f7] transition-colors cursor-pointer"
                              title="Editar porcentaje de esta póliza"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Tarifa Renovada Anual */}
                      <td className="p-2 text-right border-r border-slate-200 font-mono font-bold text-[#1e4e8c] bg-[#f0f6fd]">
                        {formatCurrency(renovadaAnual)}
                      </td>

                      {/* Tarifa Renovada Mensual */}
                      <td className="p-2 text-right border-r border-slate-200 font-mono text-[#1e4e8c] bg-[#f0f6fd]">
                        {formatCurrency(renovadaMensual)}
                      </td>

                      {/* Diferencia ($) */}
                      <td className="p-2 text-right border-r border-slate-200 font-mono font-medium text-emerald-700 bg-[#f9fefb]">
                        +{formatCurrency(diffAnnual)}
                      </td>

                      {/* Tipo de Tarifa */}
                      <td className="p-2 text-center border-r border-slate-200">
                        {isExcepcion ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Excepción
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            General
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAdvancedModal(policy)}
                            className="px-2 py-0.5 rounded bg-[#eef4fb] hover:bg-[#d8e7f7] text-[#2b6cb0] text-[11px] font-medium transition-colors cursor-pointer"
                            title="Ajuste avanzado de excepción"
                          >
                            Excepción
                          </button>
                          {isExcepcion && (
                            <button
                              onClick={() => handleResetSingle(policy.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Restablecer a general"
                            >
                              <Undo2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
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
            <span>Total en lote: <strong className="font-mono">{targetPolicies.length}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Excepciones aplicadas: <strong className="font-mono text-amber-700">{totalExcepciones}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">Impacto Total Proyectado: <strong className="font-mono text-emerald-700 font-bold">+{formatCurrency(totalIncremento)}</strong></span>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM GLOBAL ACTION & STATUS STRIP (Matching Bottom Box in Wireframe) */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2b6cb0]"></span>
            <span className="font-semibold text-slate-800">
              Paso 2: Simulación & Tarifación de Cartera
            </span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-600 hidden md:inline">
            Ajuste tarifario listo para validación técnica de suscripción
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onGoBackToConsulta}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Bandeja de Renovación</span>
          </button>

          <button
            onClick={onGoToValidation}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold bg-[#2b6cb0] hover:bg-[#235891] text-white cursor-pointer shadow-2xs"
          >
            <span>Continuar a Validación Técnica (Paso 3)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ADVANCED EXCEPTION MODAL */}
      {advancedModalPolicy && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#c3d5ea] shadow-xl max-w-md w-full overflow-hidden text-xs">
            <div className="bg-[#eef4fb] p-3 border-b border-[#c3d5ea] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2b6cb0]" />
                <h3 className="font-bold text-slate-800">Excepción Individual de Tarifa</h3>
              </div>
              <button
                onClick={() => setAdvancedModalPolicy(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Póliza & Contratante:</span>
                <p className="font-bold text-slate-800 text-sm">{advancedModalPolicy.numeroPoliza} - {advancedModalPolicy.contratante}</p>
                <p className="text-slate-500 text-[11px]">Tarifa actual vigente: <strong className="font-mono">{formatCurrency(advancedModalPolicy.tarifaActual?.tarifaAnual ?? advancedModalPolicy.tarifaActualAnual ?? 0)}</strong></p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">% Incremento para esta póliza:</label>
                <input
                  type="number"
                  step="0.5"
                  value={modalPercent}
                  onChange={(e) => setModalPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Motivo / Justificación Técnica:</label>
                <textarea
                  rows={2}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>
            </div>

            <div className="bg-[#eef4fb] p-3 border-t border-[#c3d5ea] flex items-center justify-end gap-2">
              <button
                onClick={() => setAdvancedModalPolicy(null)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAdvancedModal}
                className="px-3 py-1 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold cursor-pointer"
              >
                Guardar Excepción
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
