import { PolicyRenewal, ValidationError } from '../types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'RD$ 0.00';
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('DOP', 'RD$');
}

export function formatPercent(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '0.0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getNowFormatted(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function calculateRenewalRates(actualAnnual: number, percentIncrease: number) {
  const safeAnnual = Number(actualAnnual) || 0;
  const factor = 1 + (Number(percentIncrease) || 0) / 100;
  const newAnnual = Math.round(safeAnnual * factor * 100) / 100;
  const newMonthly = Math.round((newAnnual / 12) * 100) / 100;
  const actualMonthly = Math.round((safeAnnual / 12) * 100) / 100;
  const diffAnnual = newAnnual - safeAnnual;
  const percentDiff = safeAnnual > 0 ? ((diffAnnual / safeAnnual) * 100) : 0;

  return {
    actualAnnual: safeAnnual,
    actualMonthly,
    renovadaAnual: newAnnual,
    renovadaMensual: newMonthly,
    tarifaRenovacionAnual: newAnnual,
    tarifaRenovacionMensual: newMonthly,
    variacionPrima: diffAnnual,
    porcentajeVariacion: percentDiff,
  };
}

export function calculateSinglePolicyRate(actualAnnual: number, percentIncrease: number) {
  const result = calculateRenewalRates(actualAnnual, percentIncrease);
  return {
    tarifaRenovacionAnual: result.renovadaAnual,
    tarifaRenovacionMensual: result.renovadaMensual,
    variacionPrima: result.variacionPrima,
    porcentajeVariacion: result.porcentajeVariacion,
  };
}

export function calculateExecutiveKPIs(policies: PolicyRenewal[], selectedIds: Set<string>) {
  const targetPolicies = policies.filter((p) => selectedIds.has(p.id));
  const count = targetPolicies.length;

  if (count === 0) {
    return {
      cantidadSeleccionadas: 0,
      totalPolizas: policies.length,
      primaActualTotal: 0,
      primaRenovadaTotal: 0,
      incrementoTotal: 0,
      variacionPorcentualTotal: 0,
      totalConError: policies.filter((p) => p.erroresValidacion?.length > 0 || p.estado === 'Error').length,
      totalValidadas: policies.filter((p) => p.estado === 'Validado').length,
      totalNotificadas: policies.filter((p) => p.estado === 'Notificado').length,
      totalProcesadas: policies.filter((p) => p.estado === 'Procesado').length,
      totalExcepciones: policies.filter((p) => p.esExcepcionIndividual || p.esExcepcionManual).length,
    };
  }

  let primaActualTotal = 0;
  let primaRenovadaTotal = 0;

  targetPolicies.forEach((p) => {
    const act = p.tarifaActual?.tarifaAnual ?? p.tarifaActualAnual ?? 0;
    const ren = p.tarifaRenovacion?.tarifaAnual ?? p.tarifaRenovacionAnual ?? act;
    primaActualTotal += act;
    primaRenovadaTotal += ren;
  });

  const incrementoTotal = primaRenovadaTotal - primaActualTotal;
  const variacionPorcentualTotal =
    primaActualTotal > 0 ? (incrementoTotal / primaActualTotal) * 100 : 0;

  return {
    cantidadSeleccionadas: count,
    totalPolizas: policies.length,
    primaActualTotal,
    primaRenovadaTotal,
    incrementoTotal,
    variacionPorcentualTotal,
    totalConError: policies.filter((p) => p.erroresValidacion?.length > 0 || p.estado === 'Error').length,
    totalValidadas: policies.filter((p) => p.estado === 'Validado').length,
    totalNotificadas: policies.filter((p) => p.estado === 'Notificado').length,
    totalProcesadas: policies.filter((p) => p.estado === 'Procesado').length,
    totalExcepciones: policies.filter((p) => p.esExcepcionIndividual || p.esExcepcionManual).length,
  };
}

export function validateSinglePolicy(policy: PolicyRenewal): ValidationError[] {
  const errors: ValidationError[] = [];

  // 1. Correo electrónico vacío o formato erróneo
  if (!policy.correoCliente || policy.correoCliente.trim() === '') {
    errors.push({
      id: `err-email-${policy.id}`,
      campo: 'Correo Electrónico Contratante',
      descripcion: 'El contratante no posee una dirección de correo electrónico registrada.',
      accionRecomendada: 'Ingresar correo corporativo o del gestor de RRHH del contratante antes del envío de comunicación.',
      severidad: 'Bloqueante',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policy.correoCliente.trim())) {
    errors.push({
      id: `err-email-fmt-${policy.id}`,
      campo: 'Correo Electrónico Contratante',
      descripcion: `Formato de correo inválido: "${policy.correoCliente}".`,
      accionRecomendada: 'Corregir la sintaxis del correo electrónico.',
      severidad: 'Bloqueante',
    });
  }

  // 2. Datos particulares vacíos (Documento/RNC/Cédula)
  if (!policy.documentoContratante || policy.documentoContratante.trim() === '') {
    errors.push({
      id: `err-doc-${policy.id}`,
      campo: 'Identificación Contratante (RNC/Cédula/Pasaporte)',
      descripcion: 'Falta el número de documento de identidad tributario o personal del contratante.',
      accionRecomendada: 'Completar el RNC o Cédula fiscal en el maestro de pólizas.',
      severidad: 'Bloqueante',
    });
  }

  // 3. Tarifa inexistente o <= 0
  const tarifaActualAnual = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
  if (tarifaActualAnual <= 0) {
    errors.push({
      id: `err-tarifa-${policy.id}`,
      campo: 'Tarifa Actual',
      descripcion: 'La prima anual actual es 0 o no se encuentra parametrizada en el Core asegurador.',
      accionRecomendada: 'Cargar la prima técnica base o tarifa vigente en ACSEL.',
      severidad: 'Bloqueante',
    });
  }

  // 4. Cobertura inválida
  if (!policy.cobertura || policy.cobertura.trim() === '') {
    errors.push({
      id: `err-cobertura-${policy.id}`,
      campo: 'Plan de Cobertura GXP',
      descripcion: 'No tiene asignado un plan de cobertura válido para Últimos Gastos.',
      accionRecomendada: 'Asignar un plan de cobertura activo (Familiar, Ejecutivo, Básico o Senior).',
      severidad: 'Bloqueante',
    });
  }

  // 5. Advertencias: Correo de Corredor o Supervisor vacío
  if (!policy.correoCorredor || policy.correoCorredor.trim() === '') {
    errors.push({
      id: `warn-broker-email-${policy.id}`,
      campo: 'Correo de Corredor (CC)',
      descripcion: 'El intermediario o corredor asignado no tiene correo electrónico configurado.',
      accionRecomendada: 'Actualizar contacto del corredor para copia de cortesía.',
      severidad: 'Advertencia',
    });
  }

  if (!policy.correoSupervisor || policy.correoSupervisor.trim() === '') {
    errors.push({
      id: `warn-supervisor-email-${policy.id}`,
      campo: 'Correo de Supervisor de Negocio (CC)',
      descripcion: 'Falta el correo corporativo del ejecutivo/supervisor interno de Universal.',
      accionRecomendada: 'Asignar el correo del supervisor de suscripción para seguimiento interno.',
      severidad: 'Advertencia',
    });
  }

  return errors;
}

export function populateTemplateText(template: string, policy: PolicyRenewal): string {
  let text = template;

  // Format Date in Spanish for document header, e.g. "01 de marzo de 2025" or "01 de septiembre de 2026"
  let fechaDocumento = '01 de marzo de 2025';
  let fechaRenovacionFormatted = policy.fechaRenovacion || '1/4/2025';

  try {
    if (policy.fechaRenovacion) {
      const parts = policy.fechaRenovacion.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const monthNames = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        fechaDocumento = `${day.toString().padStart(2, '0')} de ${monthNames[month - 1] || 'marzo'} de ${year}`;
        fechaRenovacionFormatted = `${day}/${month}/${year}`;
      }
    }
  } catch (e) {
    // fallback
  }

  const tarifaMensual = policy.tarifaRenovacion?.tarifaMensual ?? (policy.tarifaActual?.tarifaMensual || 69.58);
  const tarifaMensualStr = tarifaMensual.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const placeholders: Record<string, string> = {
    '{FECHA_DOCUMENTO}': fechaDocumento,
    '{FECHA_CARTA}': fechaDocumento,
    '{FECHA_HOY}': fechaDocumento,
    '{NUM_POLIZA}': policy.numeroPoliza,
    '{NUMERO_POLIZA}': policy.numeroPoliza,
    '{POLIZA}': policy.numeroPoliza,
    '{CONTRATANTE}': policy.contratante,
    '{NOMBRE_CONTRATANTE}': policy.contratante,
    '{PRODUCTO_NOMBRE}': policy.productoNombre || policy.descProd || 'Últimos Gastos Plus',
    '{PRODUCTO}': policy.productoNombre || policy.descProd || 'Últimos Gastos Plus',
    '{COBERTURA}': policy.cobertura,
    '{MODALIDAD_PAGO}': 'MENSUAL',
    '{CANTIDAD_ASEGURADOS}': (policy.cantidadAsegurados || 0).toLocaleString('es-DO'),
    '{TARIFA_ACTUAL_ANUAL}': (policy.tarifaActual?.tarifaAnual || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 }),
    '{TARIFA_ACTUAL_MENSUAL}': (policy.tarifaActual?.tarifaMensual || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 }),
    '{TARIFA_RENOV_ANUAL}': (policy.tarifaRenovacion?.tarifaAnual || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 }),
    '{TARIFA_RENOV_MENSUAL}': tarifaMensualStr,
    '{TARIFA_RENOVACION_MENSUAL}': tarifaMensualStr,
    '{TARIFA_RENOVACION}': tarifaMensualStr,
    '{PORC_INCREMENTO}': formatPercent(policy.porcentajeIncremento),
    '{FECHA_RENOVACION}': fechaRenovacionFormatted,
    '{CORREDOR}': policy.corredor || 'Directo Universal',
    '{SUPERVISOR}': policy.supervisorNegocio || 'Oficina Corporativa',
  };

  Object.entries(placeholders).forEach(([token, value]) => {
    text = text.replaceAll(token, value);
  });

  return text;
}
