import React, { useState } from 'react';
import { 
  Send, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  RefreshCw,
  Check,
  Building,
  AtSign,
  Mail,
  Download,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { PolicyRenewal, EmailTemplate } from '../../types';
import { populateTemplateText, formatCurrency, formatPercent } from '../../utils/calculations';
import { exportPoliciesToExcel } from '../../utils/excelHelper';

interface Screen4ComunicacionProps {
  policies: PolicyRenewal[];
  selectedPolicyIds: Set<string>;
  emailTemplate: EmailTemplate;
  onUpdateEmailTemplate: (template: EmailTemplate) => void;
  onSendIndividualEmail: (policyId: string, customSubject?: string, customBody?: string) => void;
  onSendMassEmails: () => void;
  onGoBackToProcessing: () => void;
  onFinishWorkflow?: () => void;
  onGoToProcessing?: () => void;
  onGoBackToValidation?: () => void;
}

export const Screen4Comunicacion: React.FC<Screen4ComunicacionProps> = ({
  policies,
  selectedPolicyIds,
  emailTemplate,
  onUpdateEmailTemplate,
  onSendIndividualEmail,
  onSendMassEmails,
  onGoBackToProcessing,
  onFinishWorkflow,
  onGoToProcessing,
  onGoBackToValidation,
}) => {
  const [selectedPreviewPolicyId, setSelectedPreviewPolicyId] = useState<string>(
    policies.find((p) => selectedPolicyIds.has(p.id))?.id || policies[0]?.id || ''
  );
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [tempSubject, setTempSubject] = useState<string>(emailTemplate.asunto);
  const [tempBody, setTempBody] = useState<string>(emailTemplate.cuerpo);
  const [isSendingMass, setIsSendingMass] = useState<boolean>(false);

  const handleBack = onGoBackToProcessing || onGoBackToValidation || (() => {});

  const targetPolicies = policies.filter((p) => selectedPolicyIds.has(p.id));
  const activePreviewPolicy = policies.find((p) => p.id === selectedPreviewPolicyId) || targetPolicies[0] || policies[0];

  // Count communication delivery states
  const totalSent = targetPolicies.filter((p) => p.comunicacion?.enviada).length;
  const missingClientEmailCount = targetPolicies.filter((p) => !p.correoCliente || p.correoCliente.trim() === '').length;

  const handleSaveTemplate = () => {
    onUpdateEmailTemplate({
      ...emailTemplate,
      asunto: tempSubject,
      cuerpo: tempBody,
    });
    setIsEditingTemplate(false);
  };

  const handleTriggerMassSend = () => {
    setIsSendingMass(true);
    setTimeout(() => {
      onSendMassEmails();
      setIsSendingMass(false);
    }, 1200);
  };

  const dynamicPreviewSubject = activePreviewPolicy ? populateTemplateText(emailTemplate.asunto, activePreviewPolicy) : '';
  const dynamicPreviewBody = activePreviewPolicy ? populateTemplateText(emailTemplate.cuerpo, activePreviewPolicy) : '';

  const insertVariable = (tag: string) => {
    setTempBody((prev) => prev + tag);
  };

  return (
    <div className="space-y-3">
      
      {/* 1. TOP SUB-HEADER / CRITERIA & ACTIONS BOX */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#d2e2f3]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2b6cb0]"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Emisión de Avisos & Comunicación de Renovación
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-[#2b6cb0] border border-[#bcd2eb] rounded">
              {totalSent} de {targetPolicies.length} Notificadas
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setIsEditingTemplate(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#2b6cb0]" />
              <span>Editar Plantilla</span>
            </button>

            <button
              onClick={handleTriggerMassSend}
              disabled={isSendingMass || targetPolicies.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold text-xs shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingMass ? 'Enviando Avisos...' : 'Enviar Avisos a Toda la Cartera'}</span>
            </button>

            <button
              onClick={() => exportPoliciesToExcel(targetPolicies, 'Notificaciones_Renovacion.xlsx')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Delivery Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 pb-1 text-xs">
          <div className="bg-white p-2 rounded border border-[#b9d0ea] flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Destinatarios Totales</span>
            <span className="text-sm font-bold text-slate-800 font-mono mt-0.5">{targetPolicies.length}</span>
          </div>

          <div className="bg-emerald-50/70 p-2 rounded border border-emerald-200 flex flex-col">
            <span className="text-[10px] font-bold text-emerald-800">Avisos Enviados</span>
            <span className="text-sm font-bold text-emerald-700 font-mono mt-0.5">{totalSent}</span>
          </div>

          <div className="bg-[#eaf2fb] p-2 rounded border border-[#bcd2eb] flex flex-col">
            <span className="text-[10px] font-bold text-[#1e4e8c]">Pendientes de Despacho</span>
            <span className="text-sm font-bold text-[#1e4e8c] font-mono mt-0.5">{targetPolicies.length - totalSent}</span>
          </div>

          <div className="bg-white p-2 rounded border border-[#b9d0ea] flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500">Correos con Observación</span>
            <span className="text-sm font-bold text-amber-700 font-mono mt-0.5">{missingClientEmailCount}</span>
          </div>
        </div>

      </div>

      {/* 2. MAIN SPLIT CONTENT AREA (Matching Unified Blueprint) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[440px]">
        
        {/* LEFT COLUMN: POLICIES RECIPIENTS TABLE (5 cols on lg) */}
        <div className="lg:col-span-6 bg-white rounded-md border border-[#c3d5ea] shadow-2xs overflow-hidden flex flex-col min-w-0">
          
          <div className="p-2 bg-[#d9e6f5] border-b border-[#b7cde6] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Listado de Destinatarios de Renovación
            </span>
            <span className="text-[10px] font-mono font-bold text-[#2b6cb0]">
              {targetPolicies.length} pólizas
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#eef4fb] border-b border-[#c3d5ea] text-slate-700 font-bold text-[11px]">
                  <th className="p-2 border-r border-[#c3d5ea] min-w-[100px]">No. Póliza</th>
                  <th className="p-2 border-r border-[#c3d5ea] min-w-[150px]">Contratante</th>
                  <th className="p-2 border-r border-[#c3d5ea] min-w-[150px]">Correo Cliente</th>
                  <th className="p-2 text-center border-r border-[#c3d5ea] min-w-[90px]">Estado</th>
                  <th className="p-2 text-center min-w-[60px]">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {targetPolicies.map((policy) => {
                  const isSelected = activePreviewPolicy?.id === policy.id;
                  const isSent = Boolean(policy.comunicacion?.enviada);

                  return (
                    <tr
                      key={policy.id}
                      onClick={() => setSelectedPreviewPolicyId(policy.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 font-medium'
                          : 'hover:bg-[#eef5fc] even:bg-[#fbfdff]'
                      }`}
                    >
                      <td className="p-2 border-r border-slate-200 font-mono font-bold text-[#2b6cb0]">
                        {policy.numeroPoliza}
                      </td>
                      <td className="p-2 border-r border-slate-200 truncate max-w-[150px]" title={policy.contratante}>
                        {policy.contratante}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-[11px] text-slate-600 truncate max-w-[150px]">
                        {policy.correoCliente || <span className="text-amber-600 font-semibold">Sin correo</span>}
                      </td>
                      <td className="p-2 text-center border-r border-slate-200">
                        {isSent ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Enviado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPreviewPolicyId(policy.id);
                          }}
                          className="p-1 rounded bg-[#eef4fb] hover:bg-[#d8e7f7] text-[#2b6cb0] cursor-pointer"
                          title="Previsualizar carta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-2 bg-[#eef4fb] border-t border-[#c3d5ea] text-xs text-slate-600 flex justify-between items-center">
            <span>Seleccione una fila para previsualizar el aviso formal de renovación.</span>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE LETTERHEAD & EMAIL PREVIEW (7 cols on lg) */}
        <div className="lg:col-span-6 bg-white rounded-md border border-[#c3d5ea] shadow-2xs overflow-hidden flex flex-col min-w-0">
          
          <div className="p-2 bg-[#d9e6f5] border-b border-[#b7cde6] flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Vista Previa de Notificación Oficial
            </span>
            {activePreviewPolicy && (
              <span className="text-[11px] font-mono font-bold text-[#2b6cb0]">
                {activePreviewPolicy.numeroPoliza} - {activePreviewPolicy.contratante}
              </span>
            )}
          </div>

          {activePreviewPolicy ? (
            <div className="flex-1 p-3 flex flex-col justify-between space-y-2.5 bg-[#fafcff]">
              
              {/* Header Box (From/To/Subject) & Official Letter Container */}
              <div className="bg-white border border-[#c3d5ea] rounded-md shadow-2xs flex flex-col overflow-hidden">
                {/* Email Metadata */}
                <div className="p-3 bg-white border-b border-[#e2ecf7] text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Notificación Electrónica Oficial</span>
                    <span><strong>Fecha Envío:</strong> {new Date().toLocaleDateString('es-DO')}</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <strong>Para:</strong> {activePreviewPolicy.correoCliente || 'contacto@empresa.com.do'}
                    {activePreviewPolicy.correoCorredor && (
                      <span className="text-slate-500 ml-2">| <strong>CC Corredor:</strong> {activePreviewPolicy.correoCorredor}</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    <strong>Asunto:</strong> {dynamicPreviewSubject}
                  </div>
                </div>

                {/* Official Letter Document - Directly after Asunto */}
                <div className="p-4 bg-white text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[380px]">
                  {/* SEGUROS UNIVERSAL Letterhead Logo */}
                  <div className="flex items-center gap-2.5 pb-2.5 mb-3 border-b border-slate-200">
                    <div className="w-6 h-6 rounded-xs bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      U
                    </div>
                    <span className="font-extrabold text-xs tracking-wider text-[#1e3a8a] uppercase font-sans">
                      SEGUROS UNIVERSAL
                    </span>
                  </div>

                  {/* Letter Body */}
                  <div className="text-slate-800 text-[11.5px] leading-relaxed">
                    {dynamicPreviewBody}
                  </div>
                </div>
              </div>

              {/* Action Strip for single email */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <div className="text-[11px] text-slate-500">
                  {activePreviewPolicy.comunicacion?.enviada ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Enviado el {activePreviewPolicy.comunicacion.fechaEnvio || 'hoy'}
                    </span>
                  ) : (
                    <span>Estado: Listo para despacho</span>
                  )}
                </div>

                <button
                  onClick={() => onSendIndividualEmail(activePreviewPolicy.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Enviar a este Contratante</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 flex-1 flex items-center justify-center">
              Seleccione una póliza del listado para previsualizar su carta de renovación.
            </div>
          )}

        </div>

      </div>

      {/* 3. BOTTOM GLOBAL ACTION & STATUS STRIP */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2b6cb0]"></span>
            <span className="font-semibold text-slate-800">
              Paso 5: Emisión de Avisos & Cierre de Ciclo de Renovación
            </span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-600 hidden md:inline">
            Avisos despachados: <strong className="text-emerald-700 font-mono font-bold">{totalSent} / {targetPolicies.length}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Procesamiento</span>
          </button>

          <button
            onClick={onFinishWorkflow || (() => alert('Flujo de Renovación Masiva Completado con Éxito.'))}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finalizar Ciclo de Renovación</span>
          </button>
        </div>
      </div>

      {/* TEMPLATE EDITOR MODAL */}
      {isEditingTemplate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#c3d5ea] shadow-xl max-w-xl w-full overflow-hidden text-xs">
            <div className="bg-[#eef4fb] p-3 border-b border-[#c3d5ea] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2b6cb0]" />
                <h3 className="font-bold text-slate-800">Editor de Plantilla de Notificación</h3>
              </div>
              <button
                onClick={() => setIsEditingTemplate(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Asunto del Correo:</label>
                <input
                  type="text"
                  value={tempSubject}
                  onChange={(e) => setTempSubject(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">Cuerpo del Mensaje:</label>
                  <div className="flex items-center gap-1 text-[10px] flex-wrap">
                    <span className="text-slate-500">Insertar:</span>
                    {['{CONTRATANTE}', '{NUM_POLIZA}', '{FECHA_RENOVACION}', '{TARIFA_RENOV_MENSUAL}', '{PRODUCTO_NOMBRE}', '{MODALIDAD_PAGO}'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertVariable(tag)}
                        className="px-1.5 py-0.5 rounded bg-[#eef4fb] text-[#2b6cb0] border border-[#b9d0ea] hover:bg-[#d8e7f7] cursor-pointer font-mono"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={tempBody}
                  onChange={(e) => setTempBody(e.target.value)}
                  className="w-full bg-white border border-[#b9d0ea] rounded px-2.5 py-1.5 text-xs text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
                />
              </div>
            </div>

            <div className="bg-[#eef4fb] p-3 border-t border-[#c3d5ea] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditingTemplate(false)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-3 py-1 rounded bg-[#2b6cb0] hover:bg-[#235891] text-white font-bold cursor-pointer"
              >
                Guardar Plantilla
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
