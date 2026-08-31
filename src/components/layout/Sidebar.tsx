import React from 'react';
import { 
  Search, 
  Calculator, 
  CheckCircle, 
  Mail, 
  Cpu, 
  ShieldCheck, 
  History, 
  FileText
} from 'lucide-react';
import { WorkflowTab } from '../../types';

export type ScreenTab = WorkflowTab;

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  badgeCounts?: {
    totalPolizas: number;
    seleccionadas: number;
    conObservaciones: number;
    notificadas: number;
    procesadas: number;
  };
  totalSelectedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  badgeCounts,
  totalSelectedCount = 0,
}) => {
  const steps = [
    {
      id: 'consulta',
      stepNumber: '1',
      title: 'Consulta',
      subtitle: 'Filtros y selección',
      icon: Search,
    },
    {
      id: 'simulacion',
      stepNumber: '2',
      title: 'Simulación',
      subtitle: 'Tarifas y excepciones',
      icon: Calculator,
    },
    {
      id: 'validacion',
      stepNumber: '3',
      title: 'Validación',
      subtitle: 'Integridad y alertas',
      icon: CheckCircle,
    },
    {
      id: 'procesamiento',
      stepNumber: '4',
      title: 'Procesamiento',
      subtitle: 'Actualización Core',
      icon: Cpu,
    },
    {
      id: 'comunicacion',
      stepNumber: '5',
      title: 'Comunicación',
      subtitle: 'Plantillas y avisos',
      icon: Mail,
    },
  ];

  const tools = [
    {
      id: 'debida_diligencia',
      title: 'Debida Diligencia',
      subtitle: 'AML / OFAC',
      icon: ShieldCheck,
    },
    {
      id: 'auditoria',
      title: 'Auditoría & Logs',
      subtitle: 'Trazabilidad total',
      icon: History,
    },
    {
      id: 'especificacion',
      title: 'Doc & Arquitectura',
      subtitle: 'Casos de uso / Specs',
      icon: FileText,
    },
  ];

  return (
    <nav aria-label="Navegación del Flujo" className="w-56 lg:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Flujo de Trabajo
        </p>
        {steps.map((step) => {
          const isActive = currentTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onSelectTab(step.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                isActive
                  ? 'text-blue-600 bg-blue-50 rounded font-semibold border-l-4 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <span
                className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded shrink-0 ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step.stepNumber}
              </span>
              <span className="text-sm truncate">{step.title}</span>
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Módulos Corporativos
          </p>
          {tools.map((tool) => {
            const isActive = currentTab === tool.id || (tool.id === 'especificacion' && currentTab === 'especificacion_funcional');
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTab(tool.id === 'especificacion' ? 'especificacion' : tool.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 rounded font-semibold border-l-4 border-blue-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-sm truncate">{tool.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Batch State Progress Widget */}
      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
            Estado del Lote
          </p>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-700">Validación OK</span>
            <span className="text-xs font-bold text-green-600">85%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-1.5 w-[85%] rounded-full"></div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>SLA Vigencia</span>
            <span className="font-semibold text-slate-700">Q4-2026</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
