import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  RotateCcw,
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  CheckSquare, 
  Square, 
  Calendar, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Database,
  Info
} from 'lucide-react';
import { PolicyRenewal, Product, InsuranceStatus } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { exportPoliciesToExcel } from '../../utils/excelHelper';
import { ImportExcelModal } from '../modals/ImportExcelModal';

interface Screen1ConsultaProps {
  policies: PolicyRenewal[];
  products?: Product[];
  selectedPolicyIds: Set<string>;
  isInitialPortfolio?: boolean;
  onTogglePolicySelection?: (policyId: string) => void;
  onToggleSelectPolicy?: (policyId: string) => void;
  onSelectAllPolicies?: (policyIds: string[]) => void;
  onSelectAll?: (policyIds: string[]) => void;
  onDeselectAllPolicies?: () => void;
  onDeselectAll?: () => void;
  onViewPolicyDetails?: (policy: PolicyRenewal) => void;
  onGoToSimulation: () => void;
  onOpenImportModal?: () => void;
  onImportExcel?: (importedPolicies: PolicyRenewal[]) => void;
  onRestoreInitialQuery?: () => void;
}

export const Screen1Consulta: React.FC<Screen1ConsultaProps> = ({
  policies,
  products = [
    { id: 'prod-gxp', codigo: 'GXP', nombre: 'Gastos de Sepelio Colectivo', activo: true, coberturasDisponibles: ['Plan Básico Funerario', 'Plan Integral Familiar', 'Plan Senior Plus', 'Plan Platinum Repatriación'] },
    { id: 'prod-vida', codigo: 'VIDA', nombre: 'Vida Individual / Colectivo', activo: true, coberturasDisponibles: ['Vida Tradicional', 'Vida Término', 'Vida Grupo'] },
    { id: 'prod-salud', codigo: 'SALUD', nombre: 'Salud Internacional / Local', activo: true, coberturasDisponibles: ['Salud Local', 'Salud Global'] },
    { id: 'prod-acc', codigo: 'ACC', nombre: 'Accidentes Personales', activo: true, coberturasDisponibles: ['Accidentes Escolar', 'Accidentes Laboral'] },
  ],
  selectedPolicyIds,
  isInitialPortfolio = true,
  onTogglePolicySelection,
  onToggleSelectPolicy,
  onSelectAllPolicies,
  onSelectAll,
  onDeselectAllPolicies,
  onDeselectAll,
  onViewPolicyDetails,
  onGoToSimulation,
  onOpenImportModal,
  onImportExcel,
  onRestoreInitialQuery,
}) => {
  const handleToggle = onTogglePolicySelection || onToggleSelectPolicy || (() => {});
  const handleSelectAll = onSelectAllPolicies || onSelectAll || (() => {});
  const handleDeselectAll = onDeselectAllPolicies || onDeselectAll || (() => {});

  // Modal State for Import
  const [isInternalImportModalOpen, setIsInternalImportModalOpen] = useState<boolean>(false);

  // Filter States
  const [selectedProduct, setSelectedProduct] = useState<string>('prod-gxp');
  const [vigenciaDesde, setVigenciaDesde] = useState<string>('');
  const [vigenciaHasta, setVigenciaHasta] = useState<string>('');
  const [filtroPoliza, setFiltroPoliza] = useState<string>('');
  const [filtroContratante, setFiltroContratante] = useState<string>('');
  const [filtroCobertura, setFiltroCobertura] = useState<string>('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<keyof PolicyRenewal>('numeroPoliza');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Filter application
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      // Product
      if (selectedProduct && p.idProducto !== selectedProduct) return false;

      // Vigencia Desde & Hasta
      if (vigenciaDesde && p.fechaRenovacion < vigenciaDesde) return false;
      if (vigenciaHasta && p.fechaRenovacion > vigenciaHasta) return false;

      // Policy Number
      if (filtroPoliza && !p.numeroPoliza.toLowerCase().includes(filtroPoliza.toLowerCase())) return false;

      // Contratante
      if (filtroContratante && !p.contratante.toLowerCase().includes(filtroContratante.toLowerCase())) return false;

      // Cobertura
      if (filtroCobertura !== 'TODAS' && p.cobertura !== filtroCobertura) return false;

      // Estado
      if (filtroEstado !== 'TODOS' && p.estado !== filtroEstado) return false;

      // Fast global search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          p.numeroPoliza.toLowerCase().includes(query) ||
          p.contratante.toLowerCase().includes(query) ||
          p.correoCliente.toLowerCase().includes(query) ||
          p.corredor.toLowerCase().includes(query) ||
          p.cobertura.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [
    policies,
    selectedProduct,
    vigenciaDesde,
    vigenciaHasta,
    filtroPoliza,
    filtroContratante,
    filtroCobertura,
    filtroEstado,
    searchTerm,
  ]);

  // Sort filtered policies
  const sortedPolicies = useMemo(() => {
    return [...filteredPolicies].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'tarifaActual') {
        aVal = a.tarifaActual.tarifaAnual;
        bVal = b.tarifaActual.tarifaAnual;
      }

      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });
  }, [filteredPolicies, sortField, sortAsc]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedPolicies.length / itemsPerPage) || 1;
  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedPolicies.slice(start, start + itemsPerPage);
  }, [sortedPolicies, currentPage, itemsPerPage]);

  const handleSort = (field: keyof PolicyRenewal) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredPolicies.map((p) => p.id);
    handleSelectAll(allFilteredIds);
  };

  const handleClearFilters = () => {
    setSelectedProduct('prod-gxp');
    setVigenciaDesde('');
    setVigenciaHasta('');
    setFiltroPoliza('');
    setFiltroContratante('');
    setFiltroCobertura('TODAS');
    setFiltroEstado('TODOS');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const isAllFilteredSelected =
    filteredPolicies.length > 0 &&
    filteredPolicies.every((p) => selectedPolicyIds.has(p.id));

  const selectedCountInFilter = filteredPolicies.filter((p) =>
    selectedPolicyIds.has(p.id)
  ).length;

  const currentProductObj = products.find((p) => p.id === selectedProduct || p.codigo === selectedProduct) || products[0];

  const availableCoverages = useMemo(() => {
    const list = new Set<string>(currentProductObj?.coberturasDisponibles || []);
    policies.forEach((p) => {
      if ((p.idProducto === selectedProduct || p.productoCodigo === selectedProduct) && p.cobertura) {
        list.add(p.cobertura);
      }
    });
    return Array.from(list);
  }, [currentProductObj, policies, selectedProduct]);

  const getStatusBadge = (status: InsuranceStatus, errorCount: number) => {
    switch (status) {
      case 'Validado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Validado
          </span>
        );
      case 'Notificado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Notificado
          </span>
        );
      case 'Procesado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Procesado
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Error ({errorCount})
          </span>
        );
      case 'Pendiente':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      
      {/* 1. TOP SUB-HEADER / FILTER CRITERIA BOX (Matching Upper Card in Wireframe) */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-[#d2e2f3]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2b6cb0]"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Criterios de Selección & Consulta de Cartera
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-white text-[#2b6cb0] border border-[#bcd2eb] rounded">
              {filteredPolicies.length} pólizas
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            {/* 1. Botón Exportar */}
            <button
              onClick={() => exportPoliciesToExcel(filteredPolicies)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
              title="Exportar registros filtrados a Excel"
            >
              <Download className="w-3.5 h-3.5 text-[#2b6cb0]" />
              <span>Exportar</span>
            </button>

            {/* 2. Botón Importar (Al lado derecho del botón Exportar - Sustituye consulta) */}
            <button
              onClick={() => {
                if (onOpenImportModal) {
                  onOpenImportModal();
                } else {
                  setIsInternalImportModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-700 font-medium text-xs shadow-2xs cursor-pointer"
              title="Importar pólizas a renovar desde archivo Excel (sustituye la consulta actual)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Importar</span>
            </button>

            {/* 3. Botón Reestablecer Consulta Inicial */}
            {onRestoreInitialQuery && (
              <button
                onClick={() => {
                  onRestoreInitialQuery();
                  handleClearFilters();
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs shadow-2xs cursor-pointer transition-colors ${
                  !isInitialPortfolio
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 font-bold'
                    : 'bg-white hover:bg-slate-50 border-[#b9d0ea] text-slate-700 font-medium'
                }`}
                title="Restablecer la consulta original de pólizas desde el catálogo Core ACSEL"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${!isInitialPortfolio ? 'text-amber-700' : 'text-[#2b6cb0]'}`} />
                <span>Reestablecer Consulta Inicial</span>
              </button>
            )}

            {/* 4. Botón Limpiar */}
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-slate-50 border border-[#b9d0ea] text-slate-600 text-xs cursor-pointer"
              title="Limpiar filtros de búsqueda"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Filters Matrix Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 text-xs">
          
          {/* Producto */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Ramo / Producto
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#b9d0ea] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.codigo} - {prod.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Vigencia Desde */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Vigencia Desde
            </label>
            <input
              type="date"
              value={vigenciaDesde}
              onChange={(e) => {
                setVigenciaDesde(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#b9d0ea] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            />
          </div>

          {/* Vigencia Hasta */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Vigencia Hasta
            </label>
            <input
              type="date"
              value={vigenciaHasta}
              onChange={(e) => {
                setVigenciaHasta(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#b9d0ea] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            />
          </div>

          {/* Cobertura */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Plan / Cobertura
            </label>
            <select
              value={filtroCobertura}
              onChange={(e) => {
                setFiltroCobertura(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#b9d0ea] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            >
              <option value="TODAS">Todas las Coberturas ({availableCoverages.length})</option>
              {availableCoverages.map((cob) => (
                <option key={cob} value={cob}>
                  {cob}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Estado de Renovación
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#b9d0ea] rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Validado">Validado</option>
              <option value="Notificado">Notificado</option>
              <option value="Procesado">Procesado</option>
              <option value="Error">Con Errores</option>
            </select>
          </div>

          {/* Búsqueda Rápida */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Buscar Póliza / Cliente
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Póliza, RNC, nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-[#b9d0ea] rounded pl-7 pr-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2b6cb0]"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Banner Informativo cuando la cartera ha sido sustituida por importación */}
      {!isInitialPortfolio && (
        <div className="bg-[#fff9eb] border border-[#f0d28d] rounded-md px-3.5 py-2 flex items-center justify-between flex-wrap gap-2 text-xs text-[#8a5d00] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span>
              <strong>Cartera Sustituida por Archivo Externo:</strong> Mostrando <strong className="text-slate-900">{policies.length} pólizas</strong> importadas desde Excel.
            </span>
          </div>
          {onRestoreInitialQuery && (
            <button
              onClick={() => {
                onRestoreInitialQuery();
                handleClearFilters();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-50 border border-[#e0bf6c] rounded text-[#8a5d00] font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
              title="Volver al catálogo original de pólizas del Core ACSEL"
            >
              <RotateCcw className="w-3 h-3 text-[#b47c05]" />
              <span>Restablecer Consulta Inicial Core ACSEL</span>
            </button>
          )}
        </div>
      )}

      {/* 2. MAIN DATA GRID AREA (Matching Wireframe Core Section) */}
      <div className="bg-white rounded-md border border-[#c3d5ea] shadow-2xs overflow-hidden min-h-[420px] flex flex-col min-w-0">
        
        {/* DATA GRID WITH GROUPED MULTI-COLUMN HEADERS */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* GROUPED TABLE HEADERS (Matching Multi-tier Header in Wireframe) */}
              <thead>
                {/* Level 1: Super Header Categories */}
                <tr className="bg-[#d9e6f5] border-b border-[#b7cde6] text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  <th colSpan={4} className="py-1 px-3 border-r border-[#b7cde6]">
                    Identificación de la Póliza & Asegurado
                  </th>
                  <th colSpan={3} className="py-1 px-3 border-r border-[#b7cde6]">
                    Fechas & Vigencias
                  </th>
                  <th colSpan={4} className="py-1 px-3 bg-[#c9ddf2] text-[#1e4e8c] text-center">
                    Tarifas & Estado de Renovación
                  </th>
                </tr>

                {/* Level 2: Individual Column Headers */}
                <tr className="bg-[#eef4fb] border-b border-[#c3d5ea] text-slate-700 font-bold text-[11px]">
                  
                  {/* Select Checkbox Column */}
                  <th className="p-2 w-10 text-center border-r border-[#c3d5ea] bg-[#eef4fb]">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectAllFiltered();
                        } else {
                          handleDeselectAll();
                        }
                      }}
                      className="rounded border-[#a9c2e0] text-[#2b6cb0] focus:ring-[#2b6cb0] cursor-pointer"
                    />
                  </th>

                  {/* Número Póliza */}
                  <th 
                    onClick={() => handleSort('numeroPoliza')}
                    className="p-2 border-r border-[#c3d5ea] cursor-pointer hover:bg-[#e0ecf8] transition-colors min-w-[130px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>No. Póliza</span>
                      {sortField === 'numeroPoliza' ? (
                        sortAsc ? <ArrowUp className="w-3 h-3 text-[#2b6cb0]" /> : <ArrowDown className="w-3 h-3 text-[#2b6cb0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  {/* Contratante */}
                  <th 
                    onClick={() => handleSort('contratante')}
                    className="p-2 border-r border-[#c3d5ea] cursor-pointer hover:bg-[#e0ecf8] transition-colors min-w-[190px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Contratante / RNC</span>
                      {sortField === 'contratante' ? (
                        sortAsc ? <ArrowUp className="w-3 h-3 text-[#2b6cb0]" /> : <ArrowDown className="w-3 h-3 text-[#2b6cb0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  {/* Cobertura */}
                  <th className="p-2 border-r border-[#c3d5ea] min-w-[160px]">
                    Cobertura / Plan
                  </th>

                  {/* Vigencia Desde */}
                  <th className="p-2 border-r border-[#c3d5ea] min-w-[100px]">
                    Vig. Desde
                  </th>

                  {/* Vigencia Hasta */}
                  <th className="p-2 border-r border-[#c3d5ea] min-w-[100px]">
                    Vig. Hasta
                  </th>

                  {/* Fecha Renovación */}
                  <th 
                    onClick={() => handleSort('fechaRenovacion')}
                    className="p-2 border-r border-[#c3d5ea] cursor-pointer hover:bg-[#e0ecf8] transition-colors min-w-[110px]"
                  >
                    <div className="flex items-center gap-1">
                      <span>Fec. Renovación</span>
                      {sortField === 'fechaRenovacion' ? (
                        sortAsc ? <ArrowUp className="w-3 h-3 text-[#2b6cb0]" /> : <ArrowDown className="w-3 h-3 text-[#2b6cb0]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </th>

                  {/* Tarifa Actual Anual */}
                  <th 
                    onClick={() => handleSort('tarifaActual')}
                    className="p-2 text-right border-r border-[#c3d5ea] cursor-pointer hover:bg-[#e0ecf8] min-w-[115px] bg-[#f4f8fd]"
                  >
                    Tarifa Actual
                  </th>

                  {/* % Propuesto */}
                  <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[85px] bg-[#f4f8fd]">
                    % Incr.
                  </th>

                  {/* Tarifa Renovada Proyectada */}
                  <th className="p-2 text-right border-r border-[#c3d5ea] min-w-[120px] bg-[#eaf2fb] text-[#1e4e8c]">
                    Tarifa Renovada
                  </th>

                  {/* Estado */}
                  <th 
                    onClick={() => handleSort('estado')}
                    className="p-2 text-center min-w-[100px] cursor-pointer hover:bg-[#e0ecf8]"
                  >
                    Estado
                  </th>

                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200 text-slate-700 font-normal">
                {paginatedPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500 bg-slate-50/50">
                      No se encontraron pólizas con los criterios de búsqueda seleccionados.
                    </td>
                  </tr>
                ) : (
                  paginatedPolicies.map((policy) => {
                    const isSelected = selectedPolicyIds.has(policy.id);
                    const primaAct = policy.tarifaActual?.tarifaAnual ?? 0;
                    const primaRen = (policy.tarifaRenovacion?.tarifaAnual ?? (primaAct * (1 + (policy.porcentajeIncremento || 0) / 100)));

                    return (
                      <tr
                        key={policy.id}
                        className={`hover:bg-[#eef5fc] transition-colors ${
                          isSelected ? 'bg-blue-50/60' : 'even:bg-[#fbfdff]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-2 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggle(policy.id)}
                            className="rounded border-[#a9c2e0] text-[#2b6cb0] focus:ring-[#2b6cb0] cursor-pointer"
                          />
                        </td>

                        {/* Número Póliza */}
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-[#2b6cb0]">
                          {policy.numeroPoliza}
                        </td>

                        {/* Contratante */}
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-semibold text-slate-800 truncate max-w-[180px]" title={policy.contratante}>
                            {policy.contratante}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {policy.tipoDocumentoContratante}: {policy.documentoContratante || 'S/D'}
                          </div>
                        </td>

                        {/* Cobertura */}
                        <td className="p-2 border-r border-slate-200 truncate max-w-[160px]" title={policy.cobertura}>
                          <span className="text-slate-700 text-xs">
                            {policy.cobertura}
                          </span>
                        </td>

                        {/* Vigencia Desde */}
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-600">
                          {policy.vigenciaDesde}
                        </td>

                        {/* Vigencia Hasta */}
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-600">
                          {policy.vigenciaHasta}
                        </td>

                        {/* Fecha Renovación */}
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] font-semibold text-slate-800">
                          {policy.fechaRenovacion}
                        </td>

                        {/* Tarifa Actual */}
                        <td className="p-2 text-right border-r border-slate-200 font-mono text-slate-700 bg-[#f9fcff]">
                          {formatCurrency(primaAct)}
                        </td>

                        {/* % Incremento */}
                        <td className="p-2 text-right border-r border-slate-200 font-mono font-semibold text-slate-800 bg-[#f9fcff]">
                          {policy.porcentajeIncremento !== undefined ? `+${policy.porcentajeIncremento}%` : '+15%'}
                        </td>

                        {/* Tarifa Renovada */}
                        <td className="p-2 text-right border-r border-slate-200 font-mono font-bold text-[#1e4e8c] bg-[#f0f6fd]">
                          {formatCurrency(primaRen)}
                        </td>

                        {/* Estado */}
                        <td className="p-2 text-center">
                          {getStatusBadge(policy.estado, policy.erroresValidacion.length)}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Grid Footer Bar (Totals, Records, & Pagination) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-[#eef4fb] border-t border-[#c3d5ea] text-xs text-slate-700">
            <div className="flex items-center gap-3 font-medium">
              <span>Total en filtro: <strong className="font-mono">{filteredPolicies.length}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Seleccionadas: <strong className="font-mono text-[#2b6cb0]">{selectedCountInFilter}</strong></span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-600">Filas:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#b9d0ea] rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-2 py-0.5 rounded border border-[#b9d0ea] bg-white flex items-center gap-1 ${
                  currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Ant</span>
              </button>

              <span className="px-1.5 py-0.5 font-mono font-medium text-slate-800 text-[11px]">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 py-0.5 rounded border border-[#b9d0ea] bg-white flex items-center gap-1 ${
                  currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                }`}
              >
                <span>Sig</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM GLOBAL ACTION & STATUS STRIP (Matching Bottom Box in Wireframe) */}
      <div className="bg-[#eef4fb] rounded-md border border-[#c3d5ea] p-2.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2b6cb0]"></span>
            <span className="font-semibold text-slate-800">
              Paso 1: Consulta & Definición de Cartera
            </span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-600 hidden md:inline">
            Pólizas seleccionadas para procesar: <strong className="text-[#2b6cb0] font-mono font-bold">{selectedPolicyIds.size}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onGoToSimulation}
            disabled={selectedPolicyIds.size === 0}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all shadow-2xs ${
              selectedPolicyIds.size > 0
                ? 'bg-[#2b6cb0] hover:bg-[#235891] text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
          >
            <span>Continuar a Simulación de Tarifas (Paso 2)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal de Importación de Cartera desde Excel con Validación Core ACSEL */}
      <ImportExcelModal
        isOpen={isInternalImportModalOpen}
        onClose={() => setIsInternalImportModalOpen(false)}
        products={products}
        currentPolicies={policies}
        onConfirmImport={(imported) => {
          if (onImportExcel) {
            onImportExcel(imported);
          }
        }}
      />

    </div>
  );
};
