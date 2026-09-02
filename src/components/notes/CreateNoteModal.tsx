import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  HelpCircle,
  FileText,
  User,
  ShieldAlert
} from 'lucide-react';
import { 
  FeedbackNote, 
  NotePriority, 
  WorkflowTab,
  PolicyRenewal 
} from '../../types';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (noteData: Omit<FeedbackNote, 'id' | 'fechaCreacion' | 'respuestas'>) => void;
  currentTab: WorkflowTab;
  tabNames: Record<WorkflowTab, string>;
  initialPinpoint?: { x: number; y: number; targetLabel?: string } | null;
  pinpoint?: { x: number; y: number; targetLabel?: string } | null;
  currentUser: string;
  policies?: PolicyRenewal[];
  availablePolicies?: PolicyRenewal[];
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onSaveNote,
  currentTab,
  tabNames,
  initialPinpoint,
  pinpoint: incomingPinpoint,
  currentUser,
}) => {
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pantallaId, setPantallaId] = useState<WorkflowTab>(currentTab);
  const [prioridad, setPrioridad] = useState<NotePriority>('Media');
  const [autor, setAutor] = useState('Lic. Mariana Valdez');
  const [pinpoint, setPinpoint] = useState<{ x: number; y: number; targetLabel?: string } | null>(
    incomingPinpoint || initialPinpoint || null
  );

  useEffect(() => {
    if (isOpen) {
      setPantallaId(currentTab);
      setPinpoint(incomingPinpoint || initialPinpoint || null);
    }
  }, [isOpen, currentTab, initialPinpoint, incomingPinpoint]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;

    onSaveNote({
      pantallaId,
      pantallaNombre: tabNames[pantallaId] || pantallaId,
      asunto: asunto.trim(),
      descripcion: descripcion.trim(),
      autor: autor.trim() || currentUser,
      prioridad,
      estado: 'Pendiente',
      pinpoint: pinpoint || undefined,
    });

    // Reset form
    setAsunto('');
    setDescripcion('');
    setPinpoint(null);
    onClose();
  };

  const priorities: { value: NotePriority; label: string; color: string }[] = [
    { value: 'Baja', label: 'Baja (Sugerencia menor)', color: 'border-slate-300 text-slate-700 bg-slate-50' },
    { value: 'Media', label: 'Media (Ajuste recomendado)', color: 'border-blue-300 text-blue-700 bg-blue-50' },
    { value: 'Alta', label: 'Alta (Prioridad técnica)', color: 'border-amber-300 text-amber-800 bg-amber-50' },
    { value: 'Crítica', label: 'Crítica (Bloqueante / Riesgo)', color: 'border-red-300 text-red-800 bg-red-50' },
  ];

  return (
    <div 
      id="create-note-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div 
        id="create-note-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Header */}
        <div className="bg-[#1e4e8c] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Nueva Nota de Feedback
              </h2>
              <p className="text-xs text-blue-100">
                Registra tus observaciones o sugerencias sobre el flujo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Pinpoint Alert Badge if coordinates exist */}
          {pinpoint && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Punto en Pantalla Marcado:</strong> Coordenadas X: {pinpoint.x}%, Y: {pinpoint.y}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPinpoint(null)}
                className="text-amber-700 hover:text-amber-900 underline text-[11px] font-medium cursor-pointer"
              >
                Desvincular Punto
              </button>
            </div>
          )}

          {/* Screen Selection & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pantalla / Módulo *
              </label>
              <select
                value={pantallaId}
                onChange={(e) => setPantallaId(e.target.value as WorkflowTab)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                {Object.entries(tabNames).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Autor
              </label>
              <input
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Nombre del autor..."
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Asunto / Titulo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asunto / Título de la Nota *
            </label>
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej: Ajustar redondeo de cálculo en prima mensual..."
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Descripcion Detallada */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción / Observación *
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Describe detalladamente el hallazgo o sugerencia..."
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Priority Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nivel de Prioridad *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => setPrioridad(p.value)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                    prioridad === p.value
                      ? `${p.color} ring-2 ring-blue-500 font-bold shadow-xs`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#2b6cb0] hover:bg-[#1e4e8c] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Nota de Feedback</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
