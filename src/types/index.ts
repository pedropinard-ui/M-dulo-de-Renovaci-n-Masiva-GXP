export type WorkflowTab = 
  | 'consulta' 
  | 'simulacion' 
  | 'validacion' 
  | 'comunicacion' 
  | 'procesamiento' 
  | 'debida_diligencia' 
  | 'auditoria' 
  | 'especificacion';

export type InsuranceStatus = 'Pendiente' | 'Validado' | 'Notificado' | 'Procesado' | 'Error';

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
  esExcepcionIndividual?: boolean;
  esExcepcionManual?: boolean;
  motivoExcepcion?: string;
  
  saldoPendiente?: number;
  enListaNegra?: boolean;
  
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
