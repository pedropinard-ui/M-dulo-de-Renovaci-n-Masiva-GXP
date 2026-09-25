import React from 'react';
import { 
  Building2, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  Download, 
  Layers,
  FileText,
  BookOpen
} from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/calculations';
import { downloadFunctionalDoc } from '../../utils/functionalDocWordGenerator';
import { downloadUserManualDoc } from '../../utils/userManualWordGenerator';

interface HeaderProps {
  products: Product[];
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
  onOpenAiAssistant?: () => void;
  onOpenImportModal?: () => void;
  onExportAll?: () => void;
  onResetData?: () => void;
  onOpenDocModal?: () => void;
  currentUser?: string;
  kpis?: {
    cantidadSeleccionadas: number;
    totalPolizas: number;
    primaActualTotal: number;
    primaRenovadaTotal: number;
    incrementoTotal: number;
    variacionPorcentualTotal: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  products,
  selectedProductId,
  onSelectProduct,
  onOpenAiAssistant,
  onOpenImportModal,
  onExportAll,
  onResetData,
  onOpenDocModal,
  currentUser = 'demo.suscripcion@universal-demo.com.do',
  kpis,
}) => {
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <header className="h-14 bg-[#2b6cb0] text-white flex items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0 border-b border-blue-900/30 z-20 shadow-xs">
      {/* Brand & Product Selector */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-7 h-7 bg-white text-[#2b6cb0] rounded flex items-center justify-center font-black text-sm shadow-xs shrink-0">
          G
        </div>
        <div className="truncate">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
              Módulo de Renovación Masiva — GXP
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-blue-900/40 text-blue-100 border border-blue-400/40 rounded uppercase tracking-wider">
              Core ACSEL
            </span>
          </div>
        </div>

        {/* Product Switcher */}
        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-blue-400/40">
          <label htmlFor="header-product-select" className="text-[11px] text-blue-100 font-medium">
            Ramo:
          </label>
          <select
            id="header-product-select"
            aria-label="Seleccionar Ramo Activo"
            value={selectedProductId}
            onChange={(e) => onSelectProduct(e.target.value)}
            className="bg-blue-900/50 border border-blue-400/50 rounded px-2 py-0.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-white"
          >
            {products.map((prod) => (
              <option key={prod.id} value={prod.id} className="bg-slate-800 text-white">
                {prod.codigo} - {prod.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center/Right Metrics from Theme */}
      {kpis && (
        <div className="hidden lg:flex items-center gap-5 xl:gap-7">
          <div className="text-right">
            <p className="text-[9px] uppercase font-bold text-blue-100/80 tracking-wider">
              Pólizas Sel.
            </p>
            <p className="text-xs font-bold text-white font-mono">
              {kpis.cantidadSeleccionadas} <span className="text-[10px] font-normal text-blue-200">/ {kpis.totalPolizas}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-bold text-blue-100/80 tracking-wider">
              Prima Actual
            </p>
            <p className="text-xs font-bold text-white font-mono">
              {formatCurrency(kpis.primaActualTotal)}
            </p>
          </div>
          <div className="text-right text-emerald-200">
            <p className="text-[9px] uppercase font-bold text-blue-100/80 tracking-wider">
              Prima Renovada
            </p>
            <p className="text-xs font-bold font-mono">
              {formatCurrency(kpis.primaRenovadaTotal)}
            </p>
          </div>
          <div className="text-right text-amber-200">
            <p className="text-[9px] uppercase font-bold text-blue-100/80 tracking-wider">
              Variación %
            </p>
            <p className="text-xs font-bold font-mono">
              {kpis.variacionPorcentualTotal >= 0 ? '+' : ''}{formatPercent(kpis.variacionPorcentualTotal)}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="flex items-center gap-1.5">
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-700/60 hover:bg-blue-700 border border-blue-300/40 text-white text-xs font-semibold transition-colors"
            title="Asistente Actuarial IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">IA Actuarial</span>
          </button>
        )}

        {onOpenImportModal && (
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-white text-xs font-medium transition-colors"
            title="Importar Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden xl:inline">Importar</span>
          </button>
        )}

        {onExportAll && (
          <button
            onClick={onExportAll}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-white text-xs font-medium transition-colors"
            title="Exportar Cartera"
          >
            <Download className="w-3.5 h-3.5 text-sky-200" />
            <span className="hidden xl:inline">Exportar</span>
          </button>
        )}

        <button
          onClick={() => downloadFunctionalDoc()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          title="Descargar Documento Funcional (.doc) para Aprobación de Negocio y Entrega a Desarrollo TI"
        >
          <FileText className="w-3.5 h-3.5 text-slate-900" />
          <span className="hidden sm:inline">Doc Funcional (.doc)</span>
        </button>

        <button
          onClick={() => downloadUserManualDoc()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          title="Descargar Manual de Usuario & Guía Operativa Paso a Paso (.doc)"
        >
          <BookOpen className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">Manual Usuario (.doc)</span>
        </button>

        {onOpenDocModal && (
          <button
            onClick={onOpenDocModal}
            className="p-1 rounded bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-white text-xs transition-colors"
            title="Documentación y Especificaciones"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
          </button>
        )}

        {onResetData && (
          <button
            onClick={onResetData}
            className="p-1 rounded bg-blue-800/60 hover:bg-blue-800 border border-blue-400/40 text-blue-200 hover:text-white text-xs transition-colors"
            title="Restablecer Datos Demo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-blue-400/40">
          <div className="w-6 h-6 rounded bg-white text-[#2b6cb0] flex items-center justify-center font-bold text-[11px]">
            US
          </div>
          <span className="hidden 2xl:inline text-xs text-blue-100 font-medium">
            {currentUser}
          </span>
        </div>
      </div>
    </header>
  );
};
