import React, { useState } from 'react';
import { 
  PlusCircle, 
  MapPin, 
  Eye, 
  EyeOff, 
  ListChecks, 
  ChevronDown, 
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { FeedbackNote, WorkflowTab } from '../../types';

interface FloatingNotesDockProps {
  currentTab: WorkflowTab;
  tabNames: Record<WorkflowTab, string>;
  notes: FeedbackNote[];
  isPinpointing: boolean;
  showPins: boolean;
  onStartPinpointing: () => void;
  onCancelPinpointing: () => void;
  onToggleShowPins: () => void;
  onOpenCreateNote: () => void;
  onOpenCentroNotas: () => void;
  onSelectNote: (note: FeedbackNote) => void;
}

export const FloatingNotesDock: React.FC<FloatingNotesDockProps> = ({
  currentTab,
  tabNames,
  notes,
  isPinpointing,
  showPins,
  onStartPinpointing,
  onCancelPinpointing,
  onToggleShowPins,
  onOpenCreateNote,
  onOpenCentroNotas,
  onSelectNote,
}) => {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  // Notes on the current active screen
  const screenNotes = notes.filter((n) => n.pantallaId === currentTab);
  const screenPinsCount = screenNotes.filter((n) => !!n.pinpoint).length;
  const totalNotesCount = notes.length;
  const activeScreenName = (tabNames && tabNames[currentTab]) || currentTab;

  return (
    <>
      {/* Floating Bottom Bar (Matching user design) */}
      <aside 
        aria-label="Panel Flotante de Feedback" 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none animate-fade-in"
      >
        <div 
          id="floating-feedback-dock"
          className="bg-[#19273a]/95 backdrop-blur-md text-white rounded-full shadow-2xl border border-slate-700/80 px-3 py-1.5 flex items-center gap-1.5 sm:gap-2 text-xs shadow-blue-950/40"
        >
          {/* Active Screen Indicator Pill */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 font-medium max-w-[140px] sm:max-w-[210px] truncate"
            title={`Pantalla Actual: ${activeScreenName}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-[11px] text-slate-400 shrink-0 hidden sm:inline">Pantalla:</span>
            <span className="text-[11px] font-semibold text-white truncate">
              {activeScreenName}
            </span>
          </div>

          {/* "+ Dejar Nota" Button */}
          <button
            id="dock-btn-dejar-nota"
            onClick={onOpenCreateNote}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-[11px] transition-all shadow-sm hover:shadow-blue-500/20 active:scale-95"
            title="Crear una nueva nota de feedback sobre esta pantalla"
          >
            <PlusCircle className="w-3.5 h-3.5 text-yellow-300" />
            <span>Dejar Nota</span>
          </button>

          {/* "Marcar Punto" Interactive Button */}
          <button
            id="dock-btn-marcar-punto"
            onClick={isPinpointing ? onCancelPinpointing : onStartPinpointing}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
              isPinpointing
                ? 'bg-amber-500 text-white border-amber-400 ring-2 ring-amber-400/50 animate-pulse'
                : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
            title="Haz clic para seleccionar un elemento específico en pantalla y vincular la nota"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isPinpointing ? 'Cancelando...' : 'Marcar Punto'}
            </span>
          </button>

          {/* View Pins on Screen Toggle Button */}
          <button
            id="dock-btn-toggle-pins"
            onClick={onToggleShowPins}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
              showPins
                ? 'bg-[#1e3a8a] text-blue-200 border-blue-500/50 shadow-inner'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={`Ver marcadores en pantalla (${screenPinsCount} puntos registrados)`}
          >
            {showPins ? <Eye className="w-3.5 h-3.5 text-blue-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="font-mono font-bold text-[10px]">{screenPinsCount}</span>
          </button>

          {/* "Notas 8 v" Menu & Counter Button */}
          <div className="relative">
            <button
              id="dock-btn-notas-menu"
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-medium transition-all"
            >
              <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Notas</span>
              <span className="bg-amber-500/90 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px] leading-tight">
                {totalNotesCount}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isQuickMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Menu Popover */}
            {isQuickMenuOpen && (
              <div 
                id="dock-quick-notes-popover"
                className="absolute bottom-full right-0 mb-2 w-80 sm:w-96 bg-[#182638] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 text-slate-200 animate-in fade-in slide-in-from-bottom-2"
              >
                {/* Popover Header */}
                <div className="p-3 bg-[#131f2e] border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-white">Notas de esta Pantalla</span>
                    <span className="text-[10px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50 px-1.5 rounded">
                      {screenNotes.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenCentroNotas();
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline decoration-blue-500/50"
                  >
                    Ver Todo el Centro →
                  </button>
                </div>

                {/* Popover Notes List */}
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/80 p-1">
                  {screenNotes.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <MessageSquare className="w-6 h-6 mx-auto mb-1.5 text-slate-600" />
                      <p>No hay notas registradas para esta pantalla.</p>
                      <button
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          onOpenCreateNote();
                        }}
                        className="mt-2 text-blue-400 hover:underline text-[11px] font-semibold"
                      >
                        + Crear la primera nota aquí
                      </button>
                    </div>
                  ) : (
                    screenNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setIsQuickMenuOpen(false);
                          onSelectNote(note);
                        }}
                        className="p-2.5 hover:bg-slate-800/70 rounded-lg cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-xs text-slate-100 group-hover:text-blue-300 line-clamp-1">
                            {note.asunto}
                          </span>
                          <span 
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              note.prioridad === 'Crítica'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : note.prioridad === 'Alta'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {note.prioridad}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-1.5">
                          {note.descripcion}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{note.autor}</span>
                          <div className="flex items-center gap-1.5">
                            {note.pinpoint && (
                              <span className="flex items-center gap-0.5 text-amber-400">
                                <MapPin className="w-2.5 h-2.5" /> Marcado
                              </span>
                            )}
                            <span className={`px-1 rounded text-[9px] ${
                              note.estado === 'Resuelta' ? 'text-emerald-400 bg-emerald-950/80' : 'text-slate-400'
                            }`}>
                              {note.estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2.5 bg-[#131f2e] border-t border-slate-700 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    Total general: <strong className="text-white">{totalNotesCount} notas</strong> en el proyecto
                  </span>
                  <button
                    onClick={() => {
                      setIsQuickMenuOpen(false);
                      onOpenCentroNotas();
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] transition-colors"
                  >
                    Centro de Notas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
