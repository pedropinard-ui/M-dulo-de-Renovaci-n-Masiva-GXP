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

  // 1. Correo del cliente (vacío o formato erróneo)
  if (!policy.correoCliente || policy.correoCliente.trim() === '') {
    errors.push({
      id: `err-email-cliente-${policy.id}`,
      codigo: 'VAL-TEC-01',
      regla: 'Correo del Cliente',
      campo: 'Correo del Cliente',
      descripcion: 'El contratante no posee una dirección de correo electrónico registrada.',
      accionRecomendada: 'Registrar la dirección de correo corporativo del cliente/contratante para notificación formal.',
      severidad: 'Bloqueante',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policy.correoCliente.trim())) {
    errors.push({
      id: `err-email-cliente-fmt-${policy.id}`,
      codigo: 'VAL-TEC-01',
      regla: 'Correo del Cliente',
      campo: 'Correo del Cliente',
      descripcion: `Formato de correo de cliente inválido: "${policy.correoCliente}".`,
      accionRecomendada: 'Corregir la sintaxis del correo electrónico del cliente.',
      severidad: 'Bloqueante',
    });
  }

  // 2. Correo del intermediario / corredor (vacío o formato erróneo)
  if (!policy.correoCorredor || policy.correoCorredor.trim() === '') {
    errors.push({
      id: `err-email-interm-${policy.id}`,
      codigo: 'VAL-TEC-02',
      regla: 'Correo del Intermediario',
      campo: 'Correo del Intermediario',
      descripcion: 'El intermediario o corredor asignado no tiene correo electrónico configurado.',
      accionRecomendada: 'Ingresar el correo corporativo del intermediario para copia y gestión comercial.',
      severidad: 'Bloqueante',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policy.correoCorredor.trim())) {
    errors.push({
      id: `err-email-interm-fmt-${policy.id}`,
      codigo: 'VAL-TEC-02',
      regla: 'Correo del Intermediario',
      campo: 'Correo del Intermediario',
      descripcion: `Formato de correo de intermediario inválido: "${policy.correoCorredor}".`,
      accionRecomendada: 'Corregir la sintaxis del correo del corredor/intermediario.',
      severidad: 'Bloqueante',
    });
  }

  // 3. Correo del supervisor de negocio (vacío o formato erróneo)
  if (!policy.correoSupervisor || policy.correoSupervisor.trim() === '') {
    errors.push({
      id: `err-email-sup-${policy.id}`,
      codigo: 'VAL-TEC-03',
      regla: 'Correo del Supervisor',
      campo: 'Correo del Supervisor',
      descripcion: 'Falta el correo corporativo del supervisor interno de negocios asignado a la cuenta.',
      accionRecomendada: 'Asignar el correo del supervisor de suscripción para seguimiento interno en Universal.',
      severidad: 'Bloqueante',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(policy.correoSupervisor.trim())) {
    errors.push({
      id: `err-email-sup-fmt-${policy.id}`,
      codigo: 'VAL-TEC-03',
      regla: 'Correo del Supervisor',
      campo: 'Correo del Supervisor',
      descripcion: `Formato de correo de supervisor inválido: "${policy.correoSupervisor}".`,
      accionRecomendada: 'Corregir la sintaxis del correo corporativo del supervisor.',
      severidad: 'Bloqueante',
    });
  }

  // 4. Control de clientes (lista negra / OFAC / PEP / Listas de Control)
  const tieneCoincidenciaListaNegra = 
    policy.enListaNegra === true ||
    policy.debidaDiligencia?.consultaListas === 'Coincidencia con Listas de Control' ||
    policy.debidaDiligencia?.clasificacion === 'Requiere Debida Diligencia Ampliada';

  if (tieneCoincidenciaListaNegra) {
    errors.push({
      id: `err-lista-negra-${policy.id}`,
      codigo: 'VAL-TEC-04',
      regla: 'Control de Clientes (Lista Negra)',
      campo: 'Control de Clientes',
      descripcion: 'Coincidencia detectada en Control de Clientes / Lista Restrictiva / OFAC / PEP.',
      accionRecomendada: 'Remitir expediente a la Unidad de Cumplimiento para debida diligencia ampliada antes de renovar.',
      severidad: 'Bloqueante',
    });
  }

  // 5. Saldo pendiente en Core ACSEL
  const saldoPendiente = policy.saldoPendiente ?? 0;
  if (saldoPendiente > 0) {
    errors.push({
      id: `err-saldo-pendiente-${policy.id}`,
      codigo: 'VAL-TEC-05',
      regla: 'Saldo Pendiente',
      campo: 'Saldo Pendiente',
      descripcion: `La póliza registra saldo pendiente / mora en Core ACSEL por valor de ${formatCurrency(saldoPendiente)}.`,
      accionRecomendada: 'Aplicar y regularizar los recibos de primas pendientes antes de emitir la renovación.',
      severidad: 'Bloqueante',
    });
  }

  // 6. La nueva prima a renovar sea menor que la anterior
  const primaActualAnual = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
  const primaRenovacionAnual = policy.tarifaRenovacion?.tarifaAnual ?? policy.tarifaRenovacionAnual ?? (primaActualAnual * (1 + (policy.porcentajeIncremento || 0) / 100));
  
  if (primaActualAnual > 0 && primaRenovacionAnual < primaActualAnual) {
    errors.push({
      id: `warn-prima-menor-${policy.id}`,
      codigo: 'VAL-TEC-06',
      regla: 'Prima Renovación Menor a la Anterior',
      campo: 'Prima a Renovar',
      descripcion: `La nueva prima a renovar (${formatCurrency(primaRenovacionAnual)}) es menor que la prima anterior (${formatCurrency(primaActualAnual)}).`,
      accionRecomendada: 'Verificar justificación técnica o autorización actuarial para decremento de prima.',
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
