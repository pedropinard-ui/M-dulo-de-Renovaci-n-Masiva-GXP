import { PolicyRenewal, PlanTransitionRule } from '../types';

export interface ProductPlanInfo {
  nombre: string;
  codCobert: 'RP' | 'GE' | 'GF';
  descCobert: string;
  tarifaBaseMensual: number;
}

// Catalog of standard plans in product ULTIMOS GASTOS PLUS (GEXP)
export const AVAILABLE_PRODUCT_PLANS: ProductPlanInfo[] = [
  { nombre: 'ULTIMOS GASTOS PLUS FAMILIAR', codCobert: 'RP', descCobert: 'REPATRIACION', tarifaBaseMensual: 180 },
  { nombre: 'GASTOS EXEQUIALES PLUS - BANCO POPULAR', codCobert: 'RP', descCobert: 'REPATRIACION', tarifaBaseMensual: 180 },
  { nombre: 'GASTOS EXEQUIALES PLUS RD$80,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 110 },
  { nombre: 'GASTOS EXEQUIALES PLUS RD$100,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 145 },
  { nombre: 'GASTOS EXEQUIALES PLUS RD$150,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 195 },
  { nombre: 'GASTOS EXEQUIALES PLUS INDIVIDUAL', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 145 },
  { nombre: 'ULTIMOS GASTOS PLUS CELESTE PLUS', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 175 },
  { nombre: 'ULTIMOS GASTOS PLUS CELESTE MUDE', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 160 },
  { nombre: 'ULTIMOS GASTOS PLUS CELESTE NG', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 135 },
  { nombre: 'ULTIMOS GASTOS PLUS MASIVO RD$80,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 110 },
  { nombre: 'ULTIMOS GASTOS PLUS MASIVO RD$100,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 145 },
  { nombre: 'ULTIMOS GASTOS PLUS MASIVO RD$150,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 195 },
  { nombre: 'GASTOS FUNERARIOS Y EXEQUIALES FAMILIAR', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 155 },
  { nombre: 'GASTOS EXEQUIALES PLUS Z.O.', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 130 },
  { nombre: 'ULTIMOS GASTOS PLUS CELESTE PLUS NG', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS', tarifaBaseMensual: 185 },
];

// Initial pre-configured plan transition rules:
// If configured as 'CAMBIO_PLAN', policies with that plan automatically switch to the new plan.
// If NOT configured (or configured as 'AJUSTE_TASA'), policies are renewed with rate adjustment.
export const DEFAULT_PLAN_TRANSITION_RULES: PlanTransitionRule[] = [
  {
    id: 'rule-01',
    productoCodigo: 'GEXP',
    planOrigen: 'GASTOS EXEQUIALES PLUS RD$80,000.00',
    accionRenovacion: 'CAMBIO_PLAN',
    planDestino: 'GASTOS EXEQUIALES PLUS RD$100,000.00',
    codCobertDestino: 'GE',
    descCobertDestino: 'GASTOS EXEQUIAS Y FUNERARIOS',
    tarifaBaseMensualPorAsegurado: 145,
    motivoCambio: 'Actualización obligatoria: Plan de RD$80,000 descontinuado por homologación a RD$100,000',
    activo: true,
  },
  {
    id: 'rule-02',
    productoCodigo: 'GEXP',
    planOrigen: 'ULTIMOS GASTOS PLUS MASIVO RD$80,000',
    accionRenovacion: 'CAMBIO_PLAN',
    planDestino: 'ULTIMOS GASTOS PLUS MASIVO RD$100,000',
    codCobertDestino: 'GE',
    descCobertDestino: 'GASTOS EXEQUIAS Y FUNERARIOS',
    tarifaBaseMensualPorAsegurado: 145,
    motivoCambio: 'Migración a cobertura masiva estándar de RD$100,000',
    activo: true,
  },
  {
    id: 'rule-03',
    productoCodigo: 'GEXP',
    planOrigen: 'ULTIMOS GASTOS PLUS CELESTE NG',
    accionRenovacion: 'CAMBIO_PLAN',
    planDestino: 'ULTIMOS GASTOS PLUS CELESTE PLUS',
    codCobertDestino: 'GE',
    descCobertDestino: 'GASTOS EXEQUIAS Y FUNERARIOS',
    tarifaBaseMensualPorAsegurado: 175,
    motivoCambio: 'Mejora integral de cartera al nuevo plan Celeste Plus',
    activo: true,
  },
];

/**
 * Applies the product plan configuration to a list of policies.
 * Rule:
 * 1. If policy's plan has an active rule with 'CAMBIO_PLAN' -> automatically switches to the new plan.
 * 2. If policy's plan does NOT have a plan change configured -> renewed with rate adjustment (ajuste de tasa).
 */
export function applyPlanTransitionsToPolicies(
  policies: PolicyRenewal[],
  rules: PlanTransitionRule[],
  generalPercent: number = 15
): PolicyRenewal[] {
  // Build lookup map of active rules by plan name
  const rulesMap = new Map<string, PlanTransitionRule>();
  for (const rule of rules) {
    if (rule.activo) {
      rulesMap.set(rule.planOrigen.trim().toLowerCase(), rule);
    }
  }

  return policies.map((policy) => {
    const planName = (policy.descPlanProd || policy.cobertura || '').trim().toLowerCase();
    
    // Check if there is an exact or prefix match for the plan
    let matchedRule: PlanTransitionRule | undefined = rulesMap.get(planName);
    if (!matchedRule) {
      // Check partial match if planName contains the origin plan
      for (const [key, rule] of rulesMap.entries()) {
        if (planName.includes(key) || key.includes(planName)) {
          matchedRule = rule;
          break;
        }
      }
    }

    const actualAnual = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
    const actualMensual = policy.tarifaActual?.tarifaMensual ?? policy.tarifaActualMensual ?? (actualAnual / 12);
    const asegurados = policy.cantidadAsegurados || 1;

    // SCENARIO 1: Plan has an active 'CAMBIO_PLAN' transition rule
    if (matchedRule && matchedRule.accionRenovacion === 'CAMBIO_PLAN' && matchedRule.planDestino) {
      const nuevoPlan = matchedRule.planDestino;
      const nuevoCodCobert = matchedRule.codCobertDestino || policy.codCobert || 'GE';
      const nuevoDescCobert = matchedRule.descCobertDestino || policy.descCobert || 'GASTOS EXEQUIAS Y FUNERARIOS';

      // Calculate renewed rate based on new plan rate
      let renovadaMensual: number;
      if (matchedRule.tarifaBaseMensualPorAsegurado && matchedRule.tarifaBaseMensualPorAsegurado > 0) {
        renovadaMensual = Math.round(asegurados * matchedRule.tarifaBaseMensualPorAsegurado);
      } else {
        // Find plan in available catalog or use a 20% target adjustment
        const planInfo = AVAILABLE_PRODUCT_PLANS.find((p) => p.nombre === nuevoPlan);
        const ratePerHead = planInfo ? planInfo.tarifaBaseMensual : 150;
        renovadaMensual = Math.round(asegurados * ratePerHead);
      }

      const renovadaAnual = renovadaMensual * 12;
      const pctIncremento = actualAnual > 0 
        ? Math.round(((renovadaAnual - actualAnual) / actualAnual) * 1000) / 10 
        : 18.0;

      return {
        ...policy,
        tipoRenovacion: 'CAMBIO_PLAN',
        aplicaPorcentajeAjuste: false,
        planRenovacion: nuevoPlan,
        descPlanProdRenovacion: nuevoPlan,
        codPlanRenovacion: nuevoPlan,
        codCobertRenovacion: nuevoCodCobert,
        descCobertRenovacion: nuevoDescCobert,
        detalleCambioPlan: `Migración automática a ${nuevoPlan}${matchedRule.motivoCambio ? ` (${matchedRule.motivoCambio})` : ''}`,
        porcentajeIncremento: 0,
        variacionTarifaPorcentual: pctIncremento,
        tarifaRenovacionAnual: renovadaAnual,
        tarifaRenovacionMensual: renovadaMensual,
        tarifaRenovacion: {
          tarifaAnual: renovadaAnual,
          tarifaMensual: renovadaMensual,
        },
      };
    }

    // SCENARIO 2: No plan change configured for this plan -> renewed with rate adjustment!
    const isExcepcion = Boolean(policy.esExcepcionIndividual || policy.esExcepcionManual);
    const pctToApply = isExcepcion ? (policy.porcentajeIncremento ?? generalPercent) : generalPercent;
    
    // Renewal premium with rate adjustment
    const renovadaAnual = Math.round(actualAnual * (1 + pctToApply / 100));
    const renovadaMensual = Math.round(renovadaAnual / 12);

    return {
      ...policy,
      tipoRenovacion: 'AJUSTE_TASA',
      aplicaPorcentajeAjuste: true,
      planRenovacion: policy.descPlanProd,
      descPlanProdRenovacion: policy.descPlanProd,
      codPlanRenovacion: policy.descPlanProd,
      codCobertRenovacion: policy.codCobert,
      descCobertRenovacion: policy.descCobert,
      detalleCambioPlan: `Renovación con ajuste de tasa (+${pctToApply}%)`,
      porcentajeIncremento: pctToApply,
      variacionTarifaPorcentual: pctToApply,
      tarifaRenovacionAnual: renovadaAnual,
      tarifaRenovacionMensual: renovadaMensual,
      tarifaRenovacion: {
        tarifaAnual: renovadaAnual,
        tarifaMensual: renovadaMensual,
      },
    };
  });
}

export function getPlanTransitionStats(policies: PolicyRenewal[], rules: PlanTransitionRule[]) {
  const total = policies.length;
  const cambioPlanList = policies.filter((p) => p.tipoRenovacion === 'CAMBIO_PLAN');
  const ajusteTasaList = policies.filter((p) => p.tipoRenovacion !== 'CAMBIO_PLAN');
  const activeRules = rules.filter((r) => r.activo && r.accionRenovacion === 'CAMBIO_PLAN');

  return {
    total,
    cambioPlanCount: cambioPlanList.length,
    ajusteTasaCount: ajusteTasaList.length,
    activeRulesCount: activeRules.length,
    distinctOriginPlans: Array.from(new Set(policies.map((p) => p.descPlanProd || p.cobertura))),
  };
}
