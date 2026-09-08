import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Download, 
  Search, 
  Filter, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  LayoutGrid, 
  List, 
  ArrowUpRight,
  ShieldCheck,
  User,
  Tag,
  FileSpreadsheet,
  FileJson,
  Upload,
  RotateCcw,
  Globe
} from 'lucide-react';
import { FeedbackNote, WorkflowTab, NotePriority, NoteStatus } from '../../types';
import { exportNotesToExcel } from '../../utils/excelHelper';

interface ScreenCentroNotasProps {
  notes: FeedbackNote[];
  onOpenCreateNote: () => void;
  onSelectNote: (note: FeedbackNote) => void;
  onUpdateStatus: (noteId: string, newStatus: NoteStatus, resolutionDetail?: string) => void;
  onNavigateToScreen: (screenId: WorkflowTab) => void;
  tabNames: Record<WorkflowTab, string>;
  onImportNotes?: (notes: FeedbackNote[]) => void;
  onResetToSeedNotes?: () => void;
}

export const ScreenCentroNotas: React.FC<ScreenCentroNotasProps> = ({
  notes,
  onOpenCreateNote,
  onSelectNote,
  onUpdateStatus,
  onNavigateToScreen,
  tabNames,
  onImportNotes,
  onResetToSeedNotes,
}) => {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // KPI Calculations
  const totalNotes = notes.length;
  const pendingNotes = notes.filter((n) => n.estado === 'Pendiente' || n.estado === 'En Revisión').length;
  const inProgressNotes = notes.filter((n) => n.estado === 'En Progreso').length;
  const resolvedNotes = notes.filter((n) => n.estado === 'Resuelta').length;
  const pinnedNotes = notes.filter((n) => !!n.pinpoint).length;

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        note.asunto.toLowerCase().includes(search) ||
        note.descripcion.toLowerCase().includes(search) ||
        note.autor.toLowerCase().includes(search);

      // Screen
      const matchScreen = selectedScreen === 'all' || note.pantallaId === selectedScreen;

      // Status
      const matchStatus = selectedStatus === 'all' || note.estado === selectedStatus;

      // Priority
      const matchPriority = selectedPriority === 'all' || note.prioridad === selectedPriority;

      return matchSearch && matchScreen && matchStatus && matchPriority;
    });
  }, [notes, searchTerm, selectedScreen, selectedStatus, selectedPriority]);

  const handleExport = () => {
    exportNotesToExcel(filteredNotes);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `notas_feedback_gxp_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Error al exportar JSON:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && onImportNotes) {
          onImportNotes(parsed);
          setImportStatusMsg(`¡Se importaron ${parsed.length} notas exitosamente!`);
          setTimeout(() => setImportStatusMsg(null), 4000);
        } else {
          setImportStatusMsg('El archivo JSON no contiene una lista válida de notas.');
          setTimeout(() => setImportStatusMsg(null), 4000);
        }
      } catch {
        setImportStatusMsg('Error al leer el archivo JSON.');
        setTimeout(() => setImportStatusMsg(null), 4000);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div id="screen-centro-notas" className="p-4 lg:p-6 space-y-5 animate-fade-in text-slate-800">
      
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-[#182638] via-[#1e3a8a] to-[#1e4e8c] text-white p-5 rounded-xl shadow-lg border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                Revisión Funcional
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-300" />
                Notas Públicas (Visibles para todos los usuarios)
              </span>
              <span className="text-xs text-blue-200">Área Técnica & Suscripción</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Centro de Notas & Feedback
            </h1>
            <p className="text-xs text-blue-100 max-w-2xl">
              Consolidación de observaciones, mejoras de usabilidad, reglas de negocio y puntos interactivos marcados en pantalla. Disponibles públicamente para cualquier persona que acceda al enlace del proyecto.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Exportar notas a Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Descargar copia de seguridad en archivo JSON"
          >
            <FileJson className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Backup JSON</span>
          </button>
          {onImportNotes && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Importar notas desde archivo JSON"
            >
              <Upload className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Importar</span>
            </button>
          )}
          {onResetToSeedNotes && (
            <button
              onClick={onResetToSeedNotes}
              className="px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Restablecer a las 9 notas registradas en el repositorio"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Restablecer Base</span>
            </button>
          )}
          <button
            onClick={onOpenCreateNote}
            className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Nota</span>
          </button>
        </div>
      </div>

      {/* Notification if import message */}
      {importStatusMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg flex items-center justify-between">
          <span>{importStatusMsg}</span>
          <button onClick={() => setImportStatusMsg(null)} className="font-bold hover:underline">Cerrar</button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Notas</span>
            <Layers className="w-4 h-4 text-[#2b6cb0]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalNotes}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Registradas en el proyecto</span>
        </div>

        {/* Pendientes */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Por Atender</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">{pendingNotes}</div>
          <span className="text-[10px] text-amber-600/80 mt-0.5 block">Pendientes / En revisión</span>
        </div>

        {/* En Progreso */}
        <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">En Progreso</span>
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-800">{inProgressNotes}</div>
          <span className="text-[10px] text-blue-600/80 mt-0.5 block">En desarrollo / ajuste</span>
        </div>

        {/* Resueltas */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resueltas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">{resolvedNotes}</div>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block">Implementadas OK</span>
        </div>

        {/* Marcadores Visuales */}
        <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs bg-purple-50/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Puntos en UI</span>
            <MapPin className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-800">{pinnedNotes}</div>
          <span className="text-[10px] text-purple-600/80 mt-0.5 block">Con ubicación fija</span>
        </div>
      </div>

      {/* Filter & Toolbar Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por asunto, autor, póliza..."
              className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Screen filter */}
            <select
              value={selectedScreen}
              onChange={(e) => setSelectedScreen(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-slate-50 font-medium"
            >
              <option value="all">Todas las Pantallas</option>
              {Object.entries(tabNames).map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-slate-50 font-medium"
            >
              <option value="all">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Resuelta">Resuelta</option>
              <option value="Descartada">Descartada</option>
            </select>

            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-slate-50 font-medium"
            >
              <option value="all">Todas las Prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#2b6cb0] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 transition-colors ${
                  viewMode === 'table' ? 'bg-[#2b6cb0] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                title="Vista en Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Notes Grid or Table */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <h2 className="text-base font-bold text-slate-700">No se encontraron notas</h2>
          <p className="text-xs text-slate-500 mt-1">
            Intenta cambiar los filtros seleccionados o registra una nueva nota.
          </p>
          <button
            onClick={onOpenCreateNote}
            className="mt-4 px-4 py-2 bg-[#2b6cb0] text-white text-xs font-bold rounded-lg hover:bg-[#1e4e8c] transition-colors"
          >
            + Crear Nueva Nota
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isCritical = note.prioridad === 'Crítica';
            const isHigh = note.prioridad === 'Alta';
            const isResolved = note.estado === 'Resuelta';

            return (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-4 flex flex-col justify-between group relative"
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        {note.id}
                      </span>
                      <span 
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isHigh
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {note.prioridad}
                      </span>
                    </div>

                    {/* Status badge */}
                    <span 
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : note.estado === 'En Progreso'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {note.estado}
                    </span>
                  </div>

                  {/* Screen link */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <button
                      onClick={() => onNavigateToScreen(note.pantallaId as WorkflowTab)}
                      className="hover:text-blue-600 font-medium flex items-center gap-1 group-hover:underline text-left truncate"
                      title="Ir a esta pantalla"
                    >
                      <span>{note.pantallaNombre}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400" />
                    </button>

                    {note.pinpoint && (
                      <span 
                        onClick={() => onNavigateToScreen(note.pantallaId as WorkflowTab)}
                        className="flex items-center gap-0.5 text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 cursor-pointer"
                        title="Ver punto en pantalla"
                      >
                        <MapPin className="w-2.5 h-2.5" /> Marcado
                      </span>
                    )}
                  </div>

                  {/* Asunto */}
                  <h2 
                    onClick={() => onSelectNote(note)}
                    className="font-bold text-xs text-slate-900 group-hover:text-[#2b6cb0] cursor-pointer mb-2 line-clamp-2 leading-snug"
                  >
                    {note.asunto}
                  </h2>

                  {/* Descripcion */}
                  <p className="text-slate-600 text-xs line-clamp-3 mb-3 leading-relaxed">
                    {note.descripcion}
                  </p>
                </div>

                {/* Card Bottom Meta */}
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="truncate">
                      <strong>{note.autor}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{note.fechaCreacion.split(' ')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <strong>{note.respuestas.length}</strong> respuestas
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectNote(note)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#dbeafe] text-blue-950 font-bold border-b border-blue-200">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Pantalla / Módulo</th>
                  <th className="py-2.5 px-3">Asunto & Observación</th>
                  <th className="py-2.5 px-3">Autor</th>
                  <th className="py-2.5 px-3 text-center">Prioridad</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-center">Punto</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{note.id}</td>
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      <button
                        onClick={() => onNavigateToScreen(note.pantallaId as WorkflowTab)}
                        className="hover:text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {note.pantallaNombre}
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <div 
                        onClick={() => onSelectNote(note)}
                        className="font-semibold text-slate-900 hover:text-blue-700 cursor-pointer line-clamp-1"
                      >
                        {note.asunto}
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-1">{note.descripcion}</p>
                    </td>
                    <td className="py-2 px-3 text-slate-700 whitespace-nowrap font-medium">
                      {note.autor}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span 
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          note.prioridad === 'Crítica'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : note.prioridad === 'Alta'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {note.prioridad}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span 
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          note.estado === 'Resuelta'
                            ? 'bg-emerald-100 text-emerald-800'
                            : note.estado === 'En Progreso'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {note.estado}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {note.pinpoint ? (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-mono text-[10px]">
                          <MapPin className="w-3 h-3" /> ({note.pinpoint.x}%, {note.pinpoint.y}%)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectNote(note)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-blue-900 rounded font-semibold text-xs transition-colors"
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
