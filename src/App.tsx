import React, { useState, useMemo } from 'react';
import { 
  TopWorkflowBar 
} from './components/layout/TopWorkflowBar';
import { 
  ExecutiveKpiBar 
} from './components/layout/ExecutiveKpiBar';

// Screens
import { Screen1Consulta } from './components/screens/Screen1Consulta';
import { Screen2Simulacion } from './components/screens/Screen2Simulacion';
import { Screen3Validacion } from './components/screens/Screen3Validacion';
import { Screen4Comunicacion } from './components/screens/Screen4Comunicacion';
import { Screen5Procesamiento } from './components/screens/Screen5Procesamiento';
import { ScreenDebidaDiligencia } from './components/screens/ScreenDebidaDiligencia';
import { ScreenAuditoria } from './components/screens/ScreenAuditoria';
import { ScreenEspecificacionFuncional } from './components/screens/ScreenEspecificacionFuncional';
import { ScreenCentroNotas } from './components/screens/ScreenCentroNotas';

// Notes & Feedback Components
import { FloatingNotesDock } from './components/notes/FloatingNotesDock';
import { PinpointOverlay } from './components/notes/PinpointOverlay';
import { CreateNoteModal } from './components/notes/CreateNoteModal';
import { NoteDetailModal } from './components/notes/NoteDetailModal';

// Data & Types
import { 
  initialMockPolicies, 
  initialProducts, 
  initialEmailTemplate, 
  initialAuditLogs, 
  initialComplianceRuns 
} from './data/mockData';
import { initialFeedbackNotes } from './data/mockNotes';
import { 
  PolicyRenewal, 
  Product, 
  EmailTemplate, 
  AuditLogEntry, 
  ComplianceMassRun, 
  ProcessingExecutionSummary, 
  WorkflowTab,
  FeedbackNote,
  NoteStatus
} from './types';
import { 
  calculateExecutiveKPIs, 
  calculateSinglePolicyRate, 
  validateSinglePolicy 
} from './utils/calculations';

export default function App() {
  // Current user in session
  const currentUser = 'demo.suscripcion@universal-demo.com.do';

  // Global State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-gxp');
  const [currentTab, setCurrentTab] = useState<WorkflowTab>('consulta');
  
  // Policies State
  const [policies, setPolicies] = useState<PolicyRenewal[]>(initialMockPolicies);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<Set<string>>(
    new Set(initialMockPolicies.map((p) => p.id))
  );

  // Email Template State
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>(initialEmailTemplate);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

  // Compliance Runs State
  const [complianceRuns, setComplianceRuns] = useState<ComplianceMassRun[]>(initialComplianceRuns);

  // Processing Execution Summary
  const [lastExecutionSummary, setLastExecutionSummary] = useState<ProcessingExecutionSummary | null>(null);

  // Feedback Notes & Pinpointing State
  const [notes, setNotes] = useState<FeedbackNote[]>(initialFeedbackNotes);
  const [isPinpointing, setIsPinpointing] = useState<boolean>(false);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [isCreateNoteOpen, setIsCreateNoteOpen] = useState<boolean>(false);
  const [newNotePinpoint, setNewNotePinpoint] = useState<{ x: number; y: number; targetLabel?: string } | null>(null);
  const [selectedNoteForDetail, setSelectedNoteForDetail] = useState<FeedbackNote | null>(null);

  // Screen / Tab Names Map
  const tabNames: Record<WorkflowTab, string> = {
    consulta: '1. Consulta & Cartera',
    simulacion: '2. Simulación de Tarifas',
    validacion: '3. Validación Técnica',
    procesamiento: '4. Procesamiento Core',
    comunicacion: '5. Comunicación & Avisos',
    debida_diligencia: 'Debida Diligencia & AML',
    auditoria: 'Auditoría & Logs',
    especificacion: 'Documentación & Specs',
    notas: 'Centro de Notas & Feedback',
  };

  // Current active product
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Recalculate Executive KPIs in real-time
  const executiveKPIs = useMemo(() => {
    return calculateExecutiveKPIs(policies, selectedPolicyIds);
  }, [policies, selectedPolicyIds]);


  // Add an audit log entry helper
  const addAuditLog = (
    accion: AuditLogEntry['accion'],
    detalle: string,
    numeroPoliza?: string,
    valorAnterior?: string,
    valorNuevo?: string,
    porcentajeAplicado?: number
  ) => {
    const newLog: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleString('es-DO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      usuario: currentUser,
      accion,
      detalle,
      numeroPoliza,
      valorAnterior: valorAnterior || '—',
      valorNuevo: valorNuevo || '—',
      porcentajeAplicado,
      origen: 'Web App GXP',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // HANDLERS FOR SCREEN 1 (CONSULTA)
  const handleToggleSelectPolicy = (policyId: string) => {
    setSelectedPolicyIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(policyId)) {
        updated.delete(policyId);
      } else {
        updated.add(policyId);
      }
      return updated;
    });
  };

  const handleSelectAllPolicies = (policyIds: string[]) => {
    setSelectedPolicyIds(new Set(policyIds));
  };

  const handleDeselectAllPolicies = () => {
    setSelectedPolicyIds(new Set());
  };

  const handleImportExcelData = (importedRows: PolicyRenewal[]) => {
    if (!importedRows || importedRows.length === 0) return;
    
    // Sustituir el contenido de la cartera con las pólizas importadas
    setPolicies(importedRows);
    setSelectedPolicyIds(new Set(importedRows.map((p) => p.id)));
    addAuditLog(
      'IMPORTACION_EXCEL',
      `Importación masiva: ${importedRows.length} pólizas cargadas y validadas con el Core ACSEL (Sustituye consulta activa)`
    );
  };

  const handleRestoreInitialQuery = () => {
    // Reestablecer a la consulta inicial del Core ACSEL
    setPolicies(initialMockPolicies);
    setSelectedPolicyIds(new Set(initialMockPolicies.map((p) => p.id)));
    addAuditLog(
      'CONFIGURACION_REGLA',
      'Consulta inicial de cartera restablecida desde el catálogo Core ACSEL'
    );
  };

  // HANDLERS FOR SCREEN 2 (SIMULACION)
  const handleApplyGeneralPercentage = (percentage: number) => {
    const updated = policies.map((policy) => {
      if (selectedPolicyIds.has(policy.id)) {
        const actualAnual = policy.tarifaActual?.tarifaAnual ?? policy.tarifaActualAnual ?? 0;
        const actualMensual = policy.tarifaActual?.tarifaMensual ?? policy.tarifaActualMensual ?? (actualAnual / 12);
        const { tarifaRenovacionAnual, tarifaRenovacionMensual } = calculateSinglePolicyRate(
          actualAnual,
          percentage
        );
        return {
          ...policy,
          tarifaActualAnual: actualAnual,
          tarifaActualMensual: actualMensual,
          tarifaActual: {
            tarifaAnual: actualAnual,
            tarifaMensual: actualMensual,
          },
          porcentajeIncremento: percentage,
          tarifaRenovacionAnual,
          tarifaRenovacionMensual,
          tarifaRenovacion: {
            tarifaAnual: tarifaRenovacionAnual,
            tarifaMensual: tarifaRenovacionMensual,
          },
          esExcepcionManual: false,
          esExcepcionIndividual: false,
          motivoExcepcion: undefined,
        };
      }
      return policy;
    });

    setPolicies(updated);
    addAuditLog(
      'SIMULACION_INCREMENTO',
      `Aplicado incremento general de ${percentage}% sobre ${selectedPolicyIds.size} pólizas seleccionadas`,
      undefined,
      'Varias',
      `+${percentage}%`,
      percentage
    );
  };

  const handleUpdatePolicyException = (
    policyId: string,
    percentage: number,
    manualAnnualRate?: number,
    motivo?: string
  ) => {
    const targetPolicy = policies.find((p) => p.id === policyId);
    if (!targetPolicy) return;

    const actualAnual = targetPolicy.tarifaActual?.tarifaAnual ?? targetPolicy.tarifaActualAnual ?? 0;
    const actualMensual = targetPolicy.tarifaActual?.tarifaMensual ?? targetPolicy.tarifaActualMensual ?? (actualAnual / 12);
    let newAnnual = manualAnnualRate;
    let newMonthly = manualAnnualRate ? manualAnnualRate / 12 : undefined;
    let newPercent = percentage;

    if (manualAnnualRate !== undefined && actualAnual > 0) {
      newPercent = ((manualAnnualRate - actualAnual) / actualAnual) * 100;
      newMonthly = manualAnnualRate / 12;
    } else {
      const calculated = calculateSinglePolicyRate(actualAnual, percentage);
      newAnnual = calculated.tarifaRenovacionAnual;
      newMonthly = calculated.tarifaRenovacionMensual;
    }

    const finalAnnual = newAnnual ?? (actualAnual * (1 + newPercent / 100));
    const finalMonthly = newMonthly ?? (finalAnnual / 12);

    const updated = policies.map((p) => {
      if (p.id === policyId) {
        return {
          ...p,
          tarifaActualAnual: actualAnual,
          tarifaActualMensual: actualMensual,
          tarifaActual: {
            tarifaAnual: actualAnual,
            tarifaMensual: actualMensual,
          },
          porcentajeIncremento: newPercent,
          tarifaRenovacionAnual: finalAnnual,
          tarifaRenovacionMensual: finalMonthly,
          tarifaRenovacion: {
            tarifaAnual: finalAnnual,
            tarifaMensual: finalMonthly,
          },
          esExcepcionManual: true,
          esExcepcionIndividual: true,
          motivoExcepcion: motivo || 'Excepción individual autorizada',
        };
      }
      return p;
    });

    setPolicies(updated);
    addAuditLog(
      'EXCEPCION_INDIVIDUAL',
      `Ajuste individual: Póliza ${targetPolicy.numeroPoliza} modificada a ${newPercent.toFixed(2)}% (${motivo || 'Excepción comercial'})`,
      targetPolicy.numeroPoliza,
      `RD$ ${(targetPolicy.tarifaRenovacion?.tarifaAnual ?? targetPolicy.tarifaRenovacionAnual).toLocaleString()}`,
      `RD$ ${finalAnnual.toLocaleString()}`,
      newPercent
    );
  };

  const handleResetPolicySimulation = (policyId: string) => {
    const targetPolicy = policies.find((p) => p.id === policyId);
    if (!targetPolicy) return;
    const actualAnual = targetPolicy.tarifaActual?.tarifaAnual ?? targetPolicy.tarifaActualAnual ?? 0;
    const actualMensual = targetPolicy.tarifaActual?.tarifaMensual ?? targetPolicy.tarifaActualMensual ?? (actualAnual / 12);
    const { tarifaRenovacionAnual, tarifaRenovacionMensual } = calculateSinglePolicyRate(actualAnual, 0);

    const updated = policies.map((p) => {
      if (p.id === policyId) {
        return {
          ...p,
          porcentajeIncremento: 0,
          tarifaRenovacionAnual,
          tarifaRenovacionMensual,
          tarifaRenovacion: {
            tarifaAnual: tarifaRenovacionAnual,
            tarifaMensual: tarifaRenovacionMensual,
          },
          esExcepcionManual: false,
          esExcepcionIndividual: false,
          motivoExcepcion: undefined,
        };
      }
      return p;
    });

    setPolicies(updated);
    addAuditLog(
      'SIMULACION_INCREMENTO',
      `Excepción de la póliza ${targetPolicy.numeroPoliza} restablecida a tarifa base`,
      targetPolicy.numeroPoliza
    );
  };

  const handleResetSimulation = () => {
    const reset = policies.map((p) => {
      const actualAnual = p.tarifaActual?.tarifaAnual ?? p.tarifaActualAnual ?? 0;
      const actualMensual = p.tarifaActual?.tarifaMensual ?? p.tarifaActualMensual ?? (actualAnual / 12);
      const { tarifaRenovacionAnual, tarifaRenovacionMensual } = calculateSinglePolicyRate(
        actualAnual,
        15
      );
      return {
        ...p,
        tarifaActualAnual: actualAnual,
        tarifaActualMensual: actualMensual,
        tarifaActual: {
          tarifaAnual: actualAnual,
          tarifaMensual: actualMensual,
        },
        porcentajeIncremento: 15,
        tarifaRenovacionAnual,
        tarifaRenovacionMensual,
        tarifaRenovacion: {
          tarifaAnual: tarifaRenovacionAnual,
          tarifaMensual: tarifaRenovacionMensual,
        },
        esExcepcionManual: false,
        esExcepcionIndividual: false,
        motivoExcepcion: undefined,
      };
    });
    setPolicies(reset);
    addAuditLog('SIMULACION_INCREMENTO', 'Simulación restablecida a los valores estándar de tarifa (15% GXP)');
  };

  // HANDLERS FOR SCREEN 3 (VALIDACION)
  const handleRunValidation = () => {
    const validated = policies.map((p) => {
      if (selectedPolicyIds.has(p.id)) {
        const errors = validateSinglePolicy(p);
        return {
          ...p,
          erroresValidacion: errors,
          estado: errors.some((e) => e.severidad === 'Bloqueante') ? ('Error' as const) : ('Pendiente' as const),
        };
      }
      return p;
    });

    setPolicies(validated);
    addAuditLog('VALIDACION_CARTERA', `Validación ejecutada sobre ${selectedPolicyIds.size} pólizas`);
  };

  const handleQuickFixPolicy = (policyId: string, fixes: Partial<PolicyRenewal>) => {
    const updated = policies.map((p) => {
      if (p.id === policyId) {
        const patched = { ...p, ...fixes };
        const newErrors = validateSinglePolicy(patched);
        return {
          ...patched,
          erroresValidacion: newErrors,
          estado: newErrors.some((e) => e.severidad === 'Bloqueante') ? ('Error' as const) : ('Pendiente' as const),
        };
      }
      return p;
    });

    setPolicies(updated);
    addAuditLog('VALIDACION_CARTERA', `Póliza ${policyId} subsanada en línea y revalidada`);
  };

  // HANDLERS FOR SCREEN 4 (COMUNICACION)
  const handleSendIndividualEmail = (policyId: string, customSubject?: string, customBody?: string) => {
    const pol = policies.find((p) => p.id === policyId);
    if (!pol) return;

    // Must be processed OK or renewed
    const isProcessed = pol.estado === 'Procesado' || pol.estado === 'Notificado' || pol.procesamiento?.procesado === true;
    if (!isProcessed) {
      alert(`La póliza ${pol.numeroPoliza} no puede ser notificada porque aún no ha sido procesada exitosamente en Core ACSEL.`);
      return;
    }

    const now = new Date().toLocaleString('es-DO');
    const updated = policies.map((p) => {
      if (p.id === policyId) {
        return {
          ...p,
          estado: 'Notificado' as const,
          comunicacion: {
            enviada: true,
            fechaEnvio: now,
            usuarioEnvio: currentUser,
            asunto: customSubject || emailTemplate.asunto,
            cuerpo: customBody || emailTemplate.cuerpo,
            destinatarioPrincipal: p.correoCliente || '',
            destinatariosCopia: [p.correoCorredor || '', p.correoSupervisor || ''].filter(Boolean),
          },
        };
      }
      return p;
    });

    setPolicies(updated);
    addAuditLog(
      'ENVIO_INDIVIDUAL',
      `Notificación individual enviada a ${pol?.contratante} (${pol?.correoCliente})`,
      pol?.numeroPoliza
    );
  };

  const handleSendMassEmails = () => {
    const now = new Date().toLocaleString('es-DO');
    let sentCount = 0;

    const updated = policies.map((p) => {
      // ONLY policies that are selected AND processed OK / renewed in Core ACSEL
      const isProcessed = p.estado === 'Procesado' || p.estado === 'Notificado' || p.procesamiento?.procesado === true;
      if (selectedPolicyIds.has(p.id) && isProcessed && p.correoCliente && p.correoCliente.trim() !== '') {
        sentCount++;
        return {
          ...p,
          estado: 'Notificado' as const,
          comunicacion: {
            enviada: true,
            fechaEnvio: now,
            usuarioEnvio: currentUser,
            asunto: emailTemplate.asunto,
            cuerpo: emailTemplate.cuerpo,
            destinatarioPrincipal: p.correoCliente,
            destinatariosCopia: [p.correoCorredor || '', p.correoSupervisor || ''].filter(Boolean),
          },
        };
      }
      return p;
    });

    setPolicies(updated);
    addAuditLog('ENVIO_MASIVO', `Despacho masivo de notificaciones completado para ${sentCount} pólizas procesadas OK`);
  };

  // HANDLERS FOR SCREEN 5 (PROCESAMIENTO)
  const handleExecuteProcessing = async (): Promise<ProcessingExecutionSummary> => {
    const startTime = new Date();
    const runNumber = `CORR-${startTime.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const targetList = policies.filter((p) => selectedPolicyIds.has(p.id));
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    const bitacoraEntries: ProcessingExecutionSummary['bitacora'] = [];

    const updated = policies.map((p) => {
      if (!selectedPolicyIds.has(p.id)) return p;

      const hasBlockingError = p.erroresValidacion.some((e) => e.severidad === 'Bloqueante');

      if (hasBlockingError) {
        skippedCount++;
        bitacoraEntries.push({
          numeroPoliza: p.numeroPoliza,
          contratante: p.contratante,
          tarifaAnterior: p.tarifaActualAnual,
          tarifaNueva: p.tarifaRenovacionAnual,
          incremento: p.porcentajeIncremento,
          estado: 'Omitido',
          mensaje: p.erroresValidacion.map((e) => e.descripcion).join('; '),
          timestamp: new Date().toLocaleString('es-DO'),
        });
        return p;
      }

      // Successful update in Core
      successCount++;
      bitacoraEntries.push({
        numeroPoliza: p.numeroPoliza,
        contratante: p.contratante,
        tarifaAnterior: p.tarifaActualAnual,
        tarifaNueva: p.tarifaRenovacionAnual,
        incremento: p.porcentajeIncremento,
        estado: 'Exitoso',
        mensaje: 'Tarifa grabada en maestro ACSEL para la vigencia Q4-2026',
        timestamp: new Date().toLocaleString('es-DO'),
      });

      return {
        ...p,
        estado: 'Procesado' as const,
      };
    });

    setPolicies(updated);

    const summary: ProcessingExecutionSummary = {
      id: `proc-summary-${Date.now()}`,
      numeroCorrida: runNumber,
      fechaHoraInicio: startTime.toLocaleString('es-DO'),
      fechaHoraFin: new Date().toLocaleString('es-DO'),
      usuario: currentUser,
      totalSeleccionadas: targetList.length,
      totalExitosas: successCount,
      totalFallidas: failedCount,
      totalOmitidasErrores: skippedCount,
      tiempoEjecucionSegundos: 1.8,
      estado: failedCount === 0 && skippedCount === 0 ? 'Completado' : 'Completado con Advertencias',
      bitacora: bitacoraEntries,
    };

    setLastExecutionSummary(summary);
    addAuditLog(
      'PROCESAMIENTO_TARIFA',
      `Procesamiento masivo ejecutado: ${successCount} pólizas actualizadas exitosamente en ACSEL (Corrida: ${runNumber})`
    );

    return summary;
  };

  // HANDLER FOR COMPLIANCE MASS RUNS
  const handleAddComplianceRun = (newRun: ComplianceMassRun) => {
    setComplianceRuns((prev) => [newRun, ...prev]);
    addAuditLog(
      'CONSULTA',
      `Corrida masiva de debida diligencia ${newRun.numeroCorrida} ejecutada (${newRun.totalProcesados} registros analizados)`
    );
  };

  // HANDLERS FOR NOTES & FEEDBACK MODULE
  const handleSaveNewNote = (noteData: Omit<FeedbackNote, 'id' | 'fechaCreacion' | 'respuestas'>) => {
    const newNoteId = `NOTA-2026-${String(notes.length + 1).padStart(3, '0')}`;
    const nowStr = new Date().toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');

    const newNote: FeedbackNote = {
      ...noteData,
      id: newNoteId,
      fechaCreacion: nowStr,
      respuestas: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setIsCreateNoteOpen(false);
    setNewNotePinpoint(null);

    addAuditLog(
      'PROCESAMIENTO_TARIFA',
      `Nota de revisión técnica creada: [${newNote.id}] "${newNote.asunto}" (${newNote.pantallaNombre})`,
      newNote.numeroPolizaRelacionada,
      '—',
      newNote.id
    );
  };

  const handleUpdateNoteStatus = (noteId: string, newStatus: NoteStatus, resolutionDetail?: string) => {
    const nowStr = new Date().toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          estado: newStatus,
          fechaActualizacion: nowStr,
          resolucion: resolutionDetail
            ? {
                fecha: nowStr,
                usuario: 'Suscripción Técnica',
                detalle: resolutionDetail,
              }
            : n.resolucion,
        };
      })
    );

    setSelectedNoteForDetail((curr) => {
      if (!curr || curr.id !== noteId) return curr;
      return {
        ...curr,
        estado: newStatus,
        fechaActualizacion: nowStr,
        resolucion: resolutionDetail
          ? {
              fecha: nowStr,
              usuario: 'Suscripción Técnica',
              detalle: resolutionDetail,
            }
          : curr.resolucion,
      };
    });

    addAuditLog(
      'VALIDACION_REGLA',
      `Estado de nota técnica ${noteId} actualizado a "${newStatus}"`,
      undefined,
      'Pendiente',
      newStatus
    );
  };

  const handleAddComment = (noteId: string, comentario: string) => {
    const nowStr = new Date().toLocaleString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');

    const newReply = {
      id: `resp-${Date.now()}`,
      autor: currentUser,
      rol: 'Suscriptor Técnico',
      fecha: nowStr,
      comentario,
    };

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          respuestas: [...n.respuestas, newReply],
        };
      })
    );

    setSelectedNoteForDetail((curr) => {
      if (!curr || curr.id !== noteId) return curr;
      return {
        ...curr,
        respuestas: [...curr.respuestas, newReply],
      };
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    addAuditLog(
      'PROCESAMIENTO_TARIFA',
      `Nota de revisión técnica ${noteId} eliminada`
    );
  };

  const handleStartPinpointing = () => {
    setIsPinpointing(true);
  };

  const handleCancelPinpointing = () => {
    setIsPinpointing(false);
  };

  const handlePlacePinpoint = (coords: { x: number; y: number; targetLabel?: string }) => {
    setIsPinpointing(false);
    setNewNotePinpoint(coords);
    setIsCreateNoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans relative">
      
      {/* Fixed Top Workflow Navigation Bar */}
      <TopWorkflowBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalSelectedCount={selectedPolicyIds.size}
        totalPoliciesCount={policies.length}
        notesCount={notes.length}
      />

      {/* Main Layout Body - Full Width Spacious Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-16">
        <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Real-time Executive KPI Bar */}
          {currentTab !== 'notas' && (
            <ExecutiveKpiBar
              kpis={executiveKPIs}
              activeTab={currentTab}
            />
          )}

          {/* SCREEN ROUTER */}
          {currentTab === 'consulta' && (
            <Screen1Consulta
              policies={policies}
              products={products}
              selectedPolicyIds={selectedPolicyIds}
              isInitialPortfolio={
                policies.length === initialMockPolicies.length &&
                policies.every((p, idx) => p.id === initialMockPolicies[idx]?.id)
              }
              onToggleSelectPolicy={handleToggleSelectPolicy}
              onSelectAll={handleSelectAllPolicies}
              onDeselectAll={handleDeselectAllPolicies}
              onImportExcel={handleImportExcelData}
              onRestoreInitialQuery={handleRestoreInitialQuery}
              onGoToSimulation={() => setCurrentTab('simulacion')}
            />
          )}

          {currentTab === 'simulacion' && (
            <Screen2Simulacion
              policies={policies}
              selectedPolicyIds={selectedPolicyIds}
              onApplyGeneralPercentage={handleApplyGeneralPercentage}
              onApplyGeneralIncrease={handleApplyGeneralPercentage}
              onUpdatePolicyException={handleUpdatePolicyException}
              onUpdateIndividualPolicyRate={handleUpdatePolicyException}
              onResetPolicySimulation={handleResetPolicySimulation}
              onResetSimulation={handleResetSimulation}
              onResetAllSimulation={handleResetSimulation}
              onGoToValidation={() => setCurrentTab('validacion')}
              onGoBackToConsulta={() => setCurrentTab('consulta')}
            />
          )}

          {currentTab === 'validacion' && (
            <Screen3Validacion
              policies={policies}
              selectedPolicyIds={selectedPolicyIds}
              onRunValidation={handleRunValidation}
              onQuickFixPolicy={handleQuickFixPolicy}
              onGoToProcessing={() => setCurrentTab('procesamiento')}
              onGoBackToSimulation={() => setCurrentTab('simulacion')}
            />
          )}

          {currentTab === 'procesamiento' && (
            <Screen5Procesamiento
              policies={policies}
              selectedPolicyIds={selectedPolicyIds}
              lastExecutionSummary={lastExecutionSummary}
              onExecuteProcessing={handleExecuteProcessing}
              onGoBackToValidation={() => setCurrentTab('validacion')}
              onGoToCommunication={() => setCurrentTab('comunicacion')}
              onResetWorkflow={() => setCurrentTab('consulta')}
            />
          )}

          {currentTab === 'comunicacion' && (
            <Screen4Comunicacion
              policies={policies}
              selectedPolicyIds={selectedPolicyIds}
              emailTemplate={emailTemplate}
              onUpdateEmailTemplate={setEmailTemplate}
              onSendIndividualEmail={handleSendIndividualEmail}
              onSendMassEmails={handleSendMassEmails}
              onGoBackToProcessing={() => setCurrentTab('procesamiento')}
              onFinishWorkflow={() => setCurrentTab('consulta')}
            />
          )}

          {currentTab === 'debida_diligencia' && (
            <ScreenDebidaDiligencia
              complianceRuns={complianceRuns}
              onAddComplianceRun={handleAddComplianceRun}
              currentUser={currentUser}
            />
          )}

          {currentTab === 'auditoria' && (
            <ScreenAuditoria
              auditLogs={auditLogs}
            />
          )}

          {currentTab === 'especificacion' && (
            <ScreenEspecificacionFuncional />
          )}

          {currentTab === 'notas' && (
            <ScreenCentroNotas
              notes={notes}
              onOpenCreateNote={() => {
                setNewNotePinpoint(null);
                setIsCreateNoteOpen(true);
              }}
              onSelectNote={(n) => setSelectedNoteForDetail(n)}
              onUpdateStatus={handleUpdateNoteStatus}
              onNavigateToScreen={(scr) => setCurrentTab(scr)}
              tabNames={tabNames}
            />
          )}

        </main>
      </div>

      {/* Pinpoint Overlay (Interactive click to drop marker or view existing pins) */}
      <PinpointOverlay
        isPinpointing={isPinpointing}
        onPlacePinpoint={handlePlacePinpoint}
        onCancelPinpoint={handleCancelPinpointing}
        notes={notes}
        currentTab={currentTab}
        showPins={showPins}
        onSelectNote={(n) => setSelectedNoteForDetail(n)}
      />

      {/* Floating Bottom Notes Dock */}
      <FloatingNotesDock
        notes={notes}
        currentTab={currentTab}
        tabNames={tabNames}
        onOpenCreateNote={() => {
          setNewNotePinpoint(null);
          setIsCreateNoteOpen(true);
        }}
        onStartPinpointing={handleStartPinpointing}
        onCancelPinpointing={handleCancelPinpointing}
        onSelectNote={(n) => setSelectedNoteForDetail(n)}
        onOpenCentroNotas={() => setCurrentTab('notas')}
        isPinpointing={isPinpointing}
        showPins={showPins}
        onToggleShowPins={() => setShowPins(!showPins)}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateNoteOpen}
        onClose={() => {
          setIsCreateNoteOpen(false);
          setNewNotePinpoint(null);
        }}
        onSaveNote={handleSaveNewNote}
        currentTab={currentTab}
        tabNames={tabNames}
        pinpoint={newNotePinpoint}
        availablePolicies={policies}
        currentUser={currentUser}
      />

      {/* Note Detail & Discussion Modal */}
      <NoteDetailModal
        note={selectedNoteForDetail}
        isOpen={!!selectedNoteForDetail}
        onClose={() => setSelectedNoteForDetail(null)}
        onUpdateStatus={handleUpdateNoteStatus}
        onAddComment={handleAddComment}
        onDeleteNote={handleDeleteNote}
        currentUser={currentUser}
      />

      {/* Corporate Professional Status Footer */}
      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 text-xs text-slate-500 z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Core ACSEL v10.4 Conectado
          </span>
          <span className="text-slate-300">|</span>
          <span>Ambiente: <strong className="text-slate-700">Producción Corporativa</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Última sincronización: <strong className="text-slate-700 font-mono">Hoy, 10:45 AM</strong></span>
          <span className="text-slate-300">|</span>
          <span>Soporte: <strong className="text-blue-600">soporte.suscripcion@universal.com.do</strong></span>
        </div>
      </footer>

    </div>
  );
}
