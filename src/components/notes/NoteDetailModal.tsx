import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Trash2,
  Edit3,
  Sparkles,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { FeedbackNote, NoteStatus, NotePriority } from '../../types';

interface NoteDetailModalProps {
  note: FeedbackNote | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (noteId: string, newStatus: NoteStatus, resolutionDetail?: string) => void;
  onAddComment: (noteId: string, comentario: string) => void;
  onDeleteNote?: (noteId: string) => void;
  currentUser: string;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddComment,
  onDeleteNote,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);

  if (!isOpen || !note) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(note.id, newComment.trim());
    setNewComment('');
  };

  const handleResolve = () => {
    if (!resolutionText.trim()) return;
    onUpdateStatus(note.id, 'Resuelta', resolutionText.trim());
    setShowResolutionForm(false);
  };

  const isCritical = note.prioridad === 'Crítica';
  const isHigh = note.prioridad === 'Alta';

  return (
    <div 
      id="note-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div 
        id="note-detail-modal"
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
      >
        {/* Header */}
        <div className="bg-[#182638] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-900/80 border border-blue-700 text-blue-200">
              {note.id}
            </span>
            <div className="flex items-center gap-1.5">
              <span 
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isCritical
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : isHigh
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Prioridad: {note.prioridad}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
          
          {/* Title & Screen */}
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
              <span>Módulo: {note.pantallaNombre}</span>
              {note.pinpoint && (
                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                  <MapPin className="w-3 h-3" /> Punto Marcado en Pantalla (X: {note.pinpoint.x}%, Y: {note.pinpoint.y}%)
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-slate-900 leading-snug">
              {note.asunto}
            </h1>
          </div>

          {/* Description Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700">
            {note.descripcion}
          </div>

          {/* Meta Info Bar */}
          <div className="grid grid-cols-2 gap-3 text-[11px] p-2.5 bg-slate-100/70 rounded-lg border border-slate-200 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Autor:</span>
              <strong className="text-slate-800">{note.autor}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Fecha Registro:</span>
              <span className="text-slate-700">{note.fechaCreacion}</span>
            </div>
          </div>

          {/* Status Changer Bar */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Estado Actual:</span>
              <select
                value={note.estado}
                onChange={(e) => onUpdateStatus(note.id, e.target.value as NoteStatus)}
                className="text-xs font-semibold rounded-md border border-slate-300 px-2.5 py-1 bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Revisión">En Revisión</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Resuelta">Resuelta</option>
                <option value="Descartada">Descartada</option>
              </select>
            </div>

            {note.estado !== 'Resuelta' && (
              <button
                type="button"
                onClick={() => setShowResolutionForm(!showResolutionForm)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar como Resuelta</span>
              </button>
            )}
          </div>

          {/* Resolved Status Notification */}
          {note.estado === 'Resuelta' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs flex items-start gap-2.5 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Nota en Estado Resuelta</span>
                <span className="text-[11px] text-emerald-800">
                  Esta nota ya no se visualiza en la pantalla vinculada ({note.pantallaNombre}). Permanece registrada y auditable en el <strong>Centro de Notas & Feedback</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Resolution Card if exists */}
          {note.resolucion && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resolución Técnica ({note.resolucion.fecha})</span>
              </div>
              <p className="text-emerald-950">{note.resolucion.detalle}</p>
              <span className="text-[10px] text-emerald-700 block mt-1">
                Atendido por: {note.resolucion.usuario}
              </span>
            </div>
          )}

          {/* Resolution Input Form */}
          {showResolutionForm && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-emerald-900">
                Detalle de la Solución / Implementación:
              </label>
              <textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Indica la acción realizada para dar respuesta a esta nota..."
                rows={2}
                className="w-full text-xs rounded border border-emerald-300 p-2 bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolutionForm(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleResolve}
                  className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                >
                  Guardar Resolución
                </button>
              </div>
            </div>
          )}

          {/* Discussion Thread / Comments */}
          <div className="pt-2 border-t border-slate-200">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Hilo de Respuestas & Seguimiento ({note.respuestas.length})</span>
            </h2>

            {note.respuestas.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay comentarios aún en este hilo. Sé el primero en responder.
              </p>
            ) : (
              <div className="space-y-2 mb-3">
                {note.respuestas.map((resp) => (
                  <div 
                    key={resp.id} 
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <strong className="text-slate-900">{resp.autor}</strong>
                      <span className="text-[10px] text-slate-400">{resp.fecha}</span>
                    </div>
                    <p className="text-slate-700 leading-normal">{resp.comentario}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe una respuesta o comentario técnico..."
                className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#2b6cb0] hover:bg-[#1e4e8c] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Responder</span>
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {onDeleteNote && (
            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas eliminar esta nota de feedback?')) {
                  onDeleteNote(note.id);
                  onClose();
                }
              }}
              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Nota</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg ml-auto transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
