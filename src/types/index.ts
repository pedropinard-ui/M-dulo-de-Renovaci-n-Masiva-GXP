export type WorkflowTab = 
  | 'consulta' 
  | 'simulacion' 
  | 'validacion' 
  | 'comunicacion' 
  | 'procesamiento' 
  | 'debida_diligencia' 
  | 'auditoria' 
  | 'especificacion'
  | 'notas';

export type InsuranceStatus = 
  | 'Pendiente' 
  | 'Validado' 
  | 'Renovado y Notificado' 
  | 'Renovado' 
  | 'Notificado' 
  | 'Procesado' 
  | 'Error';

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  ramo: string;
  activo: boolean;
  coberturasDisponibles: string[];
}

export interface ValidationError {
  id: string;
  campo: string;
  descripcion: string;
  accionRecomendada: string;
  severidad: 'Bloqueante' | 'Advertencia';
  codigo?: string;
  regla?: string;
  mensaje?: string;
}

export interface PolicyRenewal {
  id: string;
  idProducto: string;
  productoCodigo?: string;
  productoNombre?: string;
  codProd?: string;
  descProd?: string;
  descPlanProd?: string;
  codCobert?: string;
  descCobert?: string;
  numeroPoliza: string;
  contratante: string;
  tipoDocumentoContratante?: 'RNC' | 'Cédula' | 'Pasaporte';
  tipoDocumento?: 'RNC' | 'Cédula' | 'Pasaporte' | string;
  documentoContratante?: string;
  correoCliente?: string;
  telefonoCliente?: string;
  corredor?: string;
  nombreCorredor?: string;
  correoCorredor?: string;
  supervisorNegocio?: string;
  correoSupervisor?: string;
  tipoPoliza?: 'Básica' | 'Óptima' | 'Plan Dental' | string;
  cobertura: string;
  fechaRenovacion: string; // YYYY-MM-DD
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  cantidadAsegurados?: number;
  
  // Flat Rates
  tarifaActualAnual: number;
  tarifaActualMensual: number;
  tarifaRenovacionAnual: number;
  tarifaRenovacionMensual: number;
  
  // Nested Rates for compatibility
  tarifaActual?: {
    tarifaAnual: number;
    tarifaMensual: number;
  };
  tarifaRenovacion?: {
    tarifaAnual: number;
    tarifaMensual: number;
  };
  
  porcentajeIncremento: number;
  aplicaPorcentajeAjuste?: boolean;
  variacionTarifaPorcentual?: number;
  esExcepcionIndividual?: boolean;
  esExcepcionManual?: boolean;
  motivoExcepcion?: string;
  
  saldoPendiente?: number;
  enListaNegra?: boolean;

  // Plan Transition / Renewal Type
  tipoRenovacion?: 'CAMBIO_PLAN' | 'AJUSTE_TASA';
  planRenovacion?: string;
  descPlanProdRenovacion?: string;
  codPlanRenovacion?: string;
  codCobertRenovacion?: string;
  descCobertRenovacion?: string;
  detalleCambioPlan?: string;
  
  // Estado y validaciones
  estado: InsuranceStatus;
  erroresValidacion: ValidationError[];
  
  // Comunicación
  comunicacion?: {
    enviada: boolean;
    fechaEnvio?: string;
    usuarioEnvio?: string;
    destinatarioPrincipal?: string;
    destinatariosCopia?: string[];
    destinatario?: string;
    copia?: string[];
    asunto?: string;
    cuerpo?: string;
    estadoEnvio?: 'Pendiente' | 'Enviado' | 'ErrorEnvio';
  };
  
  // Procesamiento en Core (ACSEL)
  procesamiento?: {
    procesado: boolean;
    fechaProceso?: string;
    usuarioProceso?: string;
    resultado?: 'Exitoso' | 'Fallido';
    detalleResultado?: string;
    transaccionId?: string;
    tiempoMs?: number;
  };

  // Debida Diligencia AML/OFAC/Universal
  debidaDiligencia?: {
    tipoDocumento: 'Cédula' | 'Pasaporte';
    consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL' | 'Coincidencia con Listas de Control' | 'Pendiente';
    clasificacion: 'Clasifica para Debida Diligencia simplificada' | 'Requiere Debida Diligencia Ampliada';
    fechaConsulta: string;
    usuarioConsulta: string;
    canalOrigen: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  usuario: string;
  accion: 
    | 'CONSULTA'
    | 'SIMULACION_INCREMENTO'
    | 'EXCEPCION_INDIVIDUAL'
    | 'VALIDACION_CARTERA'
    | 'GENERACION_COMUNICACION'
    | 'ENVIO_INDIVIDUAL'
    | 'ENVIO_MASIVO'
    | 'PROCESAMIENTO_TARIFA'
    | 'IMPORTACION_EXCEL'
    | 'EXPORTACION_INFORME'
    | 'DEBIDA_DILIGENCIA_CONSULTA'
    | string;
  polizaId?: string;
  numeroPoliza?: string;
  valorAnterior: string;
  valorNuevo: string;
  porcentajeAplicado?: number;
  detalle: string;
  origen: 'Portal Web GXP' | 'ACSEL Core' | 'Portal Intermediarios' | 'APP Universal' | 'Servicio Masivo Batch' | 'Web App GXP' | string;
}

export interface EmailTemplate {
  id: string;
  nombre: string;
  asunto: string;
  cuerpo: string;
}

export interface ProcessingExecutionSummary {
  id: string;
  numeroCorrida: string;
  fechaHoraInicio: string;
  fechaHoraFin?: string;
  usuario: string;
  totalSeleccionadas: number;
  totalExitosas: number;
  totalFallidas: number;
  totalOmitidasErrores: number;
  tiempoEjecucionSegundos: number;
  estado: 'En Proceso' | 'Completado' | 'Completado con Advertencias' | 'Interrumpido';
  bitacora: {
    numeroPoliza: string;
    contratante: string;
    tarifaAnterior: number;
    tarifaNueva: number;
    incremento: number;
    estado: 'Exitoso' | 'Fallido' | 'Omitido';
    mensaje: string;
    timestamp: string;
  }[];
}

export interface ComplianceMassRun {
  id: string;
  numeroCorrida: string;
  fechaHora: string;
  usuario: string;
  area: 'Cumplimiento' | 'Negocios' | 'Técnico' | 'Operaciones';
  motivo: string;
  nombreArchivo: string;
  totalCargados: number;
  totalProcesados: number;
  totalCoincidencias: number;
  totalSinCoincidencias: number;
  totalErrores: number;
  registros: {
    nombre: string;
    tipoDocumento: 'Cédula' | 'Pasaporte';
    numeroDocumento: string;
    consultaListas: string;
    clasificacion: string;
    fecha: string;
    usuarioConsulta: string;
    tipoConsulta: 'Masiva';
  }[];
}

export interface FilterCriteria {
  productoId: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  numeroPoliza: string;
  contratante: string;
  cobertura: string;
  estado: string;
  searchTerm: string;
}

export type NotePriority = 'Crítica' | 'Alta' | 'Media' | 'Baja';
export type NoteStatus = 'Pendiente' | 'En Revisión' | 'En Progreso' | 'Resuelta' | 'Descartada';
export type NoteCategory = 
  | 'Regla de Negocio' 
  | 'UI / UX' 
  | 'Integración ACSEL' 
  | 'Suscripción & Tarifas' 
  | 'Validación & AML' 
  | 'Plantillas & Despacho' 
  | 'Observación General';

export interface NoteComment {
  id: string;
  autor: string;
  rol?: string;
  fecha: string;
  comentario: string;
}

export interface FeedbackNote {
  id: string;
  pantallaId: WorkflowTab | string;
  pantallaNombre: string;
  asunto: string;
  descripcion: string;
  autor: string;
  rolAutor?: string;
  prioridad: NotePriority;
  categoria?: NoteCategory;
  estado: NoteStatus;
  fechaCreacion: string;
  fechaActualizacion?: string;
  pinpoint?: {
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
    targetLabel?: string;
  };
  numeroPolizaRelacionada?: string;
  respuestas: NoteComment[];
  resolucion?: {
    fecha: string;
    usuario: string;
    detalle: string;
  };
}

export interface PlanTransitionRule {
  id: string;
  productoCodigo: string; // e.g. 'GEXP'
  planOrigen: string; // e.g. 'GASTOS EXEQUIALES PLUS RD$80,000.00'
  accionRenovacion: 'CAMBIO_PLAN' | 'AJUSTE_TASA';
  planDestino?: string; // e.g. 'GASTOS EXEQUIALES PLUS RD$100,000.00'
  codCobertDestino?: string; // 'RP' | 'GE' | 'GF'
  descCobertDestino?: string;
  tarifaBaseMensualPorAsegurado?: number;
  factorAjuste?: number;
  motivoCambio?: string;
  activo: boolean;
}

