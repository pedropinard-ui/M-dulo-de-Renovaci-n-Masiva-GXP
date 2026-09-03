import React from 'react';
import { MapPin, X, Eye, ArrowRight } from 'lucide-react';
import { FeedbackNote, WorkflowTab } from '../../types';

interface PinpointOverlayProps {
  currentTab: WorkflowTab;
  notes: FeedbackNote[];
  isPinpointing: boolean;
  showPins: boolean;
  onPlacePinpoint: (coords: { x: number; y: number; targetLabel?: string }) => void;
  onCancelPinpointing: () => void;
  onSelectNote: (note: FeedbackNote) => void;
}

export const PinpointOverlay: React.FC<PinpointOverlayProps> = ({
  currentTab,
  notes,
  isPinpointing,
  showPins,
  onPlacePinpoint,
  onCancelPinpointing,
  onSelectNote,
}) => {
  // Screen pins - only show active/unresolved notes on the linked screen
  const screenNotesWithPins = notes.filter(
    (n) => n.pantallaId === currentTab && !!n.pinpoint && n.estado !== 'Resuelta' && n.estado !== 'Descartada'
  );

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinpointing) return;

    // Calculate percentage coordinates relative to viewport
    const x = Math.round((e.clientX / window.innerWidth) * 100);
    const y = Math.round((e.clientY / window.innerHeight) * 100);

    onPlacePinpoint({
      x,
      y,
      targetLabel: `Posición relativa (${x}%, ${y}%)`,
    });
  };

  return (
    <>
      {/* 1. Interactive Placement Mode Overlay */}
      {isPinpointing && (
        <div
          id="pinpoint-interactive-overlay"
          onClick={handleContainerClick}
          className="fixed inset-0 z-50 cursor-crosshair bg-blue-950/20 backdrop-blur-[1px] select-none"
        >
          {/* Top Floating Prompt Banner */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#19273a] text-white px-4 py-2 rounded-full shadow-2xl border border-amber-400/80 flex items-center gap-3 animate-bounce">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 fill-slate-950" />
            </div>
            <div className="text-xs font-medium">
              <strong className="text-amber-300">Modo Marcador Activo:</strong> Haz clic en cualquier lugar de la pantalla para ubicar tu punto de observación.
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancelPinpointing();
              }}
              className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 2. Render Placed Pins on the Active Screen (When showPins is ON) */}
      {showPins && !isPinpointing && screenNotesWithPins.length > 0 && (
        <div 
          id="screen-pins-layer"
          className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
        >
          {screenNotesWithPins.map((note, index) => {
            if (!note.pinpoint) return null;
            const { x, y } = note.pinpoint;

            const isCritical = note.prioridad === 'Crítica';
            const isHigh = note.prioridad === 'Alta';

            return (
              <div
                key={note.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
              >
                {/* Pin Head */}
                <div 
                  onClick={() => onSelectNote(note)}
                  className="relative cursor-pointer transition-transform duration-150 transform hover:scale-125"
                  title={`Nota: ${note.asunto} (${note.autor})`}
                >
                  {/* Outer Pulsing Aura */}
                  <span 
                    className={`absolute -inset-1.5 rounded-full opacity-75 animate-ping ${
                      isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                  />

                  {/* Main Pin Badge */}
                  <div 
                    className={`relative w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[11px] shadow-lg border-2 ${
                      isCritical
                        ? 'bg-red-600 border-red-200'
                        : isHigh
                        ? 'bg-amber-600 border-amber-200'
                        : 'bg-blue-600 border-blue-200'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold">#{index + 1}</span>
                  </div>
                </div>

                {/* Popover / Tooltip on Hover */}
                <div 
                  className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#19273a] text-white p-3 rounded-lg shadow-2xl border border-slate-700 z-50 text-xs animate-in fade-in"
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-white text-xs line-clamp-1">
                      {note.asunto}
                    </span>
                    <span 
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isCritical
                          ? 'bg-red-900/90 text-red-200'
                          : isHigh
                          ? 'bg-amber-900/90 text-amber-200'
                          : 'bg-blue-900/90 text-blue-200'
                      }`}
                    >
                      {note.prioridad}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] line-clamp-2 mb-2">
                    {note.descripcion}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                    <span>{note.autor}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectNote(note);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5"
                    >
                      Ver detalle <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
