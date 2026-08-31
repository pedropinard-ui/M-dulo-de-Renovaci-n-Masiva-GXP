import React, { useState } from 'react';
import { 
  Search, 
  Download
} from 'lucide-react';
import { AuditLogEntry } from '../../types';
import * as XLSX from 'xlsx';

interface ScreenAuditoriaProps {
  auditLogs: AuditLogEntry[];
  onClearLogs?: () => void;
}

export const ScreenAuditoria: React.FC<ScreenAuditoriaProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('TODAS');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'TODAS' && log.accion !== filterAction) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        log.usuario.toLowerCase().includes(q) ||
        (log.numeroPoliza && log.numeroPoliza.toLowerCase().includes(q)) ||
        log.detalle.toLowerCase().includes(q) ||
        log.origen.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleExportExcel = () => {
    const data = filteredLogs.map((l, idx) => ({
      'No.': idx + 1,
      'Timestamp': l.timestamp,
      'Usuario': l.usuario,
      'Acción': l.accion,
      'Póliza': l.numeroPoliza || 'N/A',
      'Valor Anterior': l.valorAnterior,
      'Valor Nuevo': l.valorNuevo,
      '% Aplicado': l.porcentajeAplicado !== undefined ? `${l.porcentajeAplicado}%` : 'N/A',
      'Detalle Operacional': l.detalle,
      'Canal Origen': l.origen,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría GXP');
    XLSX.writeFile(wb, 'Bitacora_Auditoria_Renovaciones_GXP.xlsx');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Módulo de Auditoría & Trazabilidad Completa
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              {auditLogs.length} Eventos Registrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico inmutable de simulaciones, excepciones por póliza, validaciones, despachos de correo y actualizaciones en el Core ACSEL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar Bitácora a Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por usuario, póliza o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-action-select" className="text-slate-500 font-semibold whitespace-nowrap">Acción:</label>
            <select
              id="filter-action-select"
              aria-label="Filtrar por Acción"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              <option value="TODAS">Todas las Acciones</option>
              <option value="SIMULACION_INCREMENTO">Simulación de Incremento</option>
              <option value="EXCEPCION_INDIVIDUAL">Excepción Individual</option>
              <option value="VALIDACION_CARTERA">Validación de Cartera</option>
              <option value="ENVIO_MASIVO">Envío Masivo Comunicación</option>
              <option value="ENVIO_INDIVIDUAL">Envío Individual</option>
              <option value="PROCESAMIENTO_TARIFA">Procesamiento en Core</option>
              <option value="IMPORTACION_EXCEL">Importación Excel</option>
              <option value="CONSULTA">Consulta</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500">
          Mostrando {filteredLogs.length} de {auditLogs.length} registros
        </span>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3 min-w-[140px]">Fecha & Hora</th>
                <th className="p-3 min-w-[160px]">Usuario</th>
                <th className="p-3 min-w-[140px]">Acción Realizada</th>
                <th className="p-3 min-w-[130px]">Póliza</th>
                <th className="p-3 min-w-[140px]">Valor Anterior</th>
                <th className="p-3 min-w-[140px]">Valor Nuevo</th>
                <th className="p-3 min-w-[240px]">Detalle de Operación</th>
                <th className="p-3 text-center min-w-[110px]">Canal Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No se encontraron registros de auditoría con los criterios aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-500">
                      {log.timestamp}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {log.usuario}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.accion}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-600">
                      {log.numeroPoliza || '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-500 truncate max-w-[140px]" title={log.valorAnterior}>
                      {log.valorAnterior}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700 truncate max-w-[140px]" title={log.valorNuevo}>
                      {log.valorNuevo}
                    </td>
                    <td className="p-3 text-slate-600">
                      {log.detalle}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-600">
                        {log.origen}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
