import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  ArrowRight, 
  Check, 
  RotateCcw, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { PlanTransitionRule } from '../../types';
import { 
  AVAILABLE_PRODUCT_PLANS, 
  DEFAULT_PLAN_TRANSITION_RULES 
} from '../../utils/planTransitionHelper';

interface PlanTransitionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PlanTransitionRule[];
  onSaveRules: (updatedRules: PlanTransitionRule[]) => void;
  totalPoliciesCount?: number;
  cambioPlanCount?: number;
  ajusteTasaCount?: number;
}

export const PlanTransitionConfigModal: React.FC<PlanTransitionConfigModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSaveRules,
  totalPoliciesCount = 0,
  cambioPlanCount = 0,
  ajusteTasaCount = 0,
}) => {
  const [localRules, setLocalRules] = useState<PlanTransitionRule[]>(() => {
    return rules.length > 0 ? [...rules] : [...DEFAULT_PLAN_TRANSITION_RULES];
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'CAMBIO_PLAN' | 'AJUSTE_TASA'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // When modal reopens or rules change
  React.useEffect(() => {
    if (isOpen) {
      setLocalRules(rules.length > 0 ? [...rules] : [...DEFAULT_PLAN_TRANSITION_RULES]);
      setShowSavedFeedback(false);
    }
  }, [isOpen, rules]);

  if (!isOpen) return null;

  // Distinct origin plans from catalog
  const catalogPlans = AVAILABLE_PRODUCT_PLANS.map((p) => p.nombre);

  const handleToggleAction = (ruleId: string, newAction: 'CAMBIO_PLAN' | 'AJUSTE_TASA') => {
    setLocalRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const defaultTarget = catalogPlans.find((cp) => cp !== r.planOrigen) || catalogPlans[0];
          return {
            ...r,
            accionRenovacion: newAction,
            planDestino: newAction === 'CAMBIO_PLAN' ? (r.planDestino || defaultTarget) : undefined,
          };
        }
        return r;
      })
    );
  };

  const handleTargetPlanChange = (ruleId: string, newTargetPlan: string) => {
    const planInfo = AVAILABLE_PRODUCT_PLANS.find((p) => p.nombre === newTargetPlan);
    setLocalRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          return {
            ...r,
            planDestino: newTargetPlan,
            codCobertDestino: planInfo?.codCobert || 'GE',
            descCobertDestino: planInfo?.descCobert || 'GASTOS EXEQUIAS Y FUNERARIOS',
            tarifaBaseMensualPorAsegurado: planInfo?.tarifaBaseMensual || 150,
          };
        }
        return r;
      })
    );
  };

  const handleReasonChange = (ruleId: string, reason: string) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, motivoCambio: reason } : r))
    );
  };

  const handleToggleActive = (ruleId: string) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, activo: !r.activo } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleAddNewRule = () => {
    // Find a plan not currently in rules
    const existingOrigins = new Set(localRules.map((r) => r.planOrigen));
    const availableOrigin = catalogPlans.find((p) => !existingOrigins.has(p)) || catalogPlans[0];
    const availableTarget = catalogPlans.find((p) => p !== availableOrigin) || catalogPlans[1] || catalogPlans[0];
    const planInfo = AVAILABLE_PRODUCT_PLANS.find((p) => p.nombre === availableTarget);

    const newRule: PlanTransitionRule = {
      id: `rule-${Date.now()}`,
      productoCodigo: 'GEXP',
      planOrigen: availableOrigin,
      accionRenovacion: 'CAMBIO_PLAN',
      planDestino: availableTarget,
      codCobertDestino: planInfo?.codCobert || 'GE',
      descCobertDestino: planInfo?.descCobert || 'GASTOS EXEQUIAS Y FUNERARIOS',
      tarifaBaseMensualPorAsegurado: planInfo?.tarifaBaseMensual || 145,
      motivoCambio: 'Migración configurada por el usuario a renovación',
      activo: true,
    };

    setLocalRules((prev) => [newRule, ...prev]);
  };

  const handleResetDefaults = () => {
    setLocalRules([...DEFAULT_PLAN_TRANSITION_RULES]);
  };

  const handleSaveAndApply = () => {
    onSaveRules(localRules);
    setShowSavedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Filtered rules for view
  const filteredRules = localRules.filter((r) => {
    if (activeTab === 'CAMBIO_PLAN' && r.accionRenovacion !== 'CAMBIO_PLAN') return false;
    if (activeTab === 'AJUSTE_TASA' && r.accionRenovacion !== 'AJUSTE_TASA') return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.planOrigen.toLowerCase().includes(q) ||
        (r.planDestino && r.planDestino.toLowerCase().includes(q)) ||
        (r.motivoCambio && r.motivoCambio.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeChangePlanRulesCount = localRules.filter(
    (r) => r.activo && r.accionRenovacion === 'CAMBIO_PLAN'
  ).length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg border border-[#c3d5ea] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
        
        {/* MODAL HEADER */}
        <div className="bg-[#1e4e8c] text-white px-4 py-3 flex items-center justify-between border-b border-[#173e72]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-white/15 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-white">
                  Configuración de Planes del Producto a Renovación
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold">
                  Regla de Negocio
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Cambio automático a nuevo plan o renovación estándar con ajuste de tasa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RULE BANNER / EXPLANATION BOX */}
        <div className="bg-[#eef4fb] px-4 py-3 border-b border-[#c3d5ea] space-y-2">
          <div className="flex items-start gap-2.5 text-slate-700">
            <HelpCircle className="w-4 h-4 text-[#2b6cb0] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-slate-900">Comportamiento del Sistema: </strong>
              Indique en qué planes del producto se realizará un cambio de plan a la renovación. 
              <strong> Todas las pólizas que tengan ese plan cambiarán automáticamente al nuevo plan especificado y a estas pólizas NO aplica el % de ajuste tarifario</strong> (su prima se calcula con la tarifa del nuevo plan). 
              Si la póliza tiene un plan que en la configuración <strong>no tiene especificado cambio de plan</strong> a renovación, 
              entonces la póliza será <strong>renovada con ajuste de tasa (% de ajuste)</strong>.
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="bg-white p-2 rounded border border-[#b9d0ea] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500">Reglas Activas de Cambio</span>
                <span className="text-xs font-bold text-purple-700 font-mono">
                  {activeChangePlanRulesCount} planes migrarán
                </span>
              </div>
              <div className="p-1.5 rounded-full bg-purple-50 text-purple-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-[#b9d0ea] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500">Pólizas con Cambio de Plan</span>
                <span className="text-xs font-bold text-[#1e4e8c] font-mono">
                  {cambioPlanCount} pólizas automáticas
                </span>
              </div>
              <div className="p-1.5 rounded-full bg-blue-50 text-[#1e4e8c]">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-2 rounded border border-[#b9d0ea] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500">Pólizas con Ajuste de Tasa</span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {ajusteTasaCount} pólizas (Tasa estándar)
                </span>
              </div>
              <div className="p-1.5 rounded-full bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: FILTER TABS, SEARCH & ADD BUTTON */}
        <div className="px-4 py-2 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-[#2b6cb0] text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({localRules.length})
            </button>
            <button
              onClick={() => setActiveTab('CAMBIO_PLAN')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'CAMBIO_PLAN'
                  ? 'bg-purple-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔄 Con Cambio de Plan ({localRules.filter((r) => r.accionRenovacion === 'CAMBIO_PLAN').length})
            </button>
            <button
              onClick={() => setActiveTab('AJUSTE_TASA')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'AJUSTE_TASA'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📈 Con Ajuste de Tasa ({localRules.filter((r) => r.accionRenovacion === 'AJUSTE_TASA').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar plan origen o destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-[#b9d0ea] rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0] w-48"
            />
            <button
              onClick={handleAddNewRule}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold text-xs cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Regla</span>
            </button>
          </div>
        </div>

        {/* MAIN RULES TABLE */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
          {filteredRules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded border border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold">No se encontraron reglas para el filtro seleccionado.</p>
              <p className="text-[11px] text-slate-400 mt-1">Haga clic en "Nueva Regla" para definir una regla de transición de plan.</p>
            </div>
          ) : (
            filteredRules.map((rule) => {
              const isCambio = rule.accionRenovacion === 'CAMBIO_PLAN';

              return (
                <div
                  key={rule.id}
                  className={`bg-white rounded-lg border p-3 transition-all ${
                    rule.activo
                      ? isCambio
                        ? 'border-purple-300 ring-1 ring-purple-100 shadow-2xs'
                        : 'border-[#c3d5ea] shadow-2xs'
                      : 'border-slate-200 opacity-60 bg-slate-100/50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* LEFT: Origin Plan & Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          Plan Origen (Actual)
                        </span>
                        
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.activo}
                            onChange={() => handleToggleActive(rule.id)}
                            className="rounded text-[#2b6cb0] focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-[10px] font-semibold ${rule.activo ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {rule.activo ? 'Regla Activa' : 'Inactiva'}
                          </span>
                        </label>
                      </div>

                      <div className="mt-1">
                        <select
                          value={rule.planOrigen}
                          onChange={(e) => {
                            const newOrigin = e.target.value;
                            setLocalRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, planOrigen: newOrigin } : r))
                            );
                          }}
                          className="font-bold text-slate-800 text-xs bg-slate-50 hover:bg-white border border-[#b9d0ea] rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                        >
                          {catalogPlans.map((cp) => (
                            <option key={cp} value={cp}>
                              {cp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* MIDDLE: ACTION TOGGLE (CAMBIO DE PLAN vs AJUSTE DE TASA) */}
                    <div className="flex flex-col items-start lg:items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Acción a Renovación
                      </span>
                      <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleAction(rule.id, 'CAMBIO_PLAN')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            isCambio
                              ? 'bg-purple-700 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-purple-700'
                          }`}
                        >
                          <span>🔄 Cambiar Plan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAction(rule.id, 'AJUSTE_TASA')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            !isCambio
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          <span>📈 Ajuste de Tasa</span>
                        </button>
                      </div>
                    </div>

                    {/* RIGHT: TARGET PLAN OR RATE BEHAVIOR */}
                    <div className="flex-1 min-w-0">
                      {isCambio ? (
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                            <ArrowRight className="w-3 h-3" />
                            <span>Nuevo Plan a Renovar (Automático)</span>
                          </div>
                          <select
                            value={rule.planDestino || ''}
                            onChange={(e) => handleTargetPlanChange(rule.id, e.target.value)}
                            className="mt-1 font-bold text-purple-950 text-xs bg-purple-50/70 hover:bg-white border border-purple-300 rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-1 focus:ring-purple-600"
                          >
                            {catalogPlans.map((cp) => (
                              <option key={cp} value={cp}>
                                {cp}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/60 rounded p-2 border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Mantiene Plan Original</span>
                          </span>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Se renueva con ajuste de tasa general (+15%) o excepción individual autorizada.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ACTIONS: DELETE */}
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* BOTTOM DETAIL / JUSTIFICATION FOR CHANGE */}
                  {isCambio && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="font-semibold text-slate-500 shrink-0">Motivo / Homologación:</span>
                        <input
                          type="text"
                          value={rule.motivoCambio || ''}
                          onChange={(e) => handleReasonChange(rule.id, e.target.value)}
                          placeholder="Ej: Plan descontinuado / Reemplazo por cobertura superior"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-[#2b6cb0]"
                        />
                      </div>
                      <span className="text-[10px] text-purple-700 font-semibold shrink-0 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Aplica a todas las pólizas con este plan
                      </span>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-[#eef4fb] px-4 py-3 border-t border-[#c3d5ea] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-600 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restablecer Valores Sugeridos</span>
            </button>

            {showSavedFeedback && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>¡Reglas aplicadas a la cartera con éxito!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>

            <button
              onClick={handleSaveAndApply}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold bg-[#1e4e8c] hover:bg-[#163a69] text-white cursor-pointer shadow-2xs"
            >
              <Check className="w-4 h-4" />
              <span>Guardar y Aplicar a la Cartera</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
