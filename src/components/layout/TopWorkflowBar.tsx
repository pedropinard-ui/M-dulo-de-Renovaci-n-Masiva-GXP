import React from 'react';
import { 
  Search, 
  Calculator, 
  CheckCircle, 
  Mail, 
  Cpu, 
  ShieldCheck, 
  History, 
  FileText,
  ChevronRight,
  Sparkles,
  Layers,
  MessageSquare
} from 'lucide-react';
import { WorkflowTab } from '../../types';

interface TopWorkflowBarProps {
  currentTab: WorkflowTab;
  onSelectTab: (tab: WorkflowTab) => void;
  totalSelectedCount?: number;
  totalPoliciesCount?: number;
  completedSteps?: string[];
  notesCount?: number;
}

export const TopWorkflowBar: React.FC<TopWorkflowBarProps> = ({
  currentTab,
  onSelectTab,
  totalSelectedCount = 0,
  totalPoliciesCount = 0,
  notesCount = 8,
}) => {
  const steps: {
    id: WorkflowTab;
    stepNumber: number;
    title: string;
    shortTitle: string;
    subtitle: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'consulta',
      stepNumber: 1,
      title: '1. Bandeja de Renovación',
      shortTitle: '1. Bandeja',
      subtitle: 'Filtros y selección',
      icon: Search,
    },
    {
      id: 'simulacion',
      stepNumber: 2,
      title: '2. Simulación de Tarifas',
      shortTitle: '2. Simulación',
      subtitle: 'Tarifas y excepciones',
      icon: Calculator,
    },
    {
      id: 'validacion',
      stepNumber: 3,
      title: '3. Validación Técnica',
      shortTitle: '3. Validación',
      subtitle: 'Integridad y alertas',
      icon: CheckCircle,
    },
    {
      id: 'procesamiento',
      stepNumber: 4,
      title: '4. Procesamiento Core',
      shortTitle: '4. Procesamiento',
      subtitle: 'Impacto ACSEL',
      icon: Cpu,
    },
    {
      id: 'comunicacion',
      stepNumber: 5,
      title: '5. Comunicación & Avisos',
      shortTitle: '5. Comunicación',
      subtitle: 'Plantillas y correos',
      icon: Mail,
    },
  ];

  const tools: {
    id: WorkflowTab;
    title: string;
    icon: React.ElementType;
    badge?: number;
    isHighlighted?: boolean;
  }[] = [
    {
      id: 'notas',
      title: 'Centro de Notas',
      icon: MessageSquare,
      badge: notesCount,
      isHighlighted: true,
    },
    {
      id: 'debida_diligencia',
      title: 'Debida Diligencia',
      icon: ShieldCheck,
    },
    {
      id: 'auditoria',
      title: 'Auditoría & Logs',
      icon: History,
    },
    {
      id: 'especificacion',
      title: 'Documentación',
      icon: FileText,
    },
  ];

  return (
    <div 
      id="fixed-top-workflow-bar"
      className="bg-[#c8d9ed] border-b border-[#a9c2e0] px-3 sm:px-4 lg:px-6 pt-1.5 shadow-2xs select-none"
    >
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        
        {/* Main 5 Workflow Steps Folder Tabs */}
        <nav aria-label="Flujo de Trabajo Principal" className="flex items-end gap-1 flex-shrink-0">
          {steps.map((step) => {
            const isActive = currentTab === step.id;
            const Icon = step.icon;
            
            return (
              <button
                key={step.id}
                id={`workflow-step-btn-${step.id}`}
                onClick={() => onSelectTab(step.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-left transition-all relative border-t border-l border-r font-medium text-xs ${
                  isActive
                    ? 'bg-[#eef4fb] text-blue-900 border-[#9ab8db] shadow-xs font-bold -mb-[1px] pb-2 z-10'
                    : 'bg-[#b6cce6] text-slate-700 hover:bg-[#c2d7ee] border-[#9dbbde]'
                }`}
              >
                {/* Step Number Badge */}
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-[#2b6cb0] text-white shadow-2xs'
                      : 'bg-slate-300/80 text-slate-700'
                  }`}
                >
                  {step.stepNumber}
                </span>

                {/* Step Title */}
                <span className="whitespace-nowrap hidden sm:inline text-xs">
                  {step.title.replace(/^\d+\.\s*/, '')}
                </span>
                <span className="whitespace-nowrap sm:hidden text-xs">
                  {step.shortTitle}
                </span>

                {/* Active Top Accent Line */}
                {isActive && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#2b6cb0] rounded-t-md" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools & Corporate Modules */}
        <div className="flex items-center gap-1 pb-1 flex-shrink-0">
          {tools.map((tool) => {
            const isActive = currentTab === tool.id;
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                id={`workflow-tool-btn-${tool.id}`}
                onClick={() => onSelectTab(tool.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                  isActive
                    ? 'bg-white text-blue-900 font-bold border border-[#9ab8db] shadow-2xs'
                    : tool.isHighlighted
                    ? 'bg-amber-100/70 hover:bg-amber-100 text-amber-950 border border-amber-300/60 font-medium'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-[#b6cce6]'
                }`}
                title={tool.title}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2b6cb0]' : tool.isHighlighted ? 'text-amber-700' : 'text-slate-600'}`} />
                <span className="hidden xl:inline">{tool.title}</span>
                {tool.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] leading-tight font-mono">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Scope Badge */}
          {totalSelectedCount > 0 && (
            <div 
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-white/80 border border-[#9ab8db] text-slate-800 text-[11px] font-semibold ml-1"
              title={`${totalSelectedCount} de ${totalPoliciesCount} pólizas seleccionadas`}
            >
              <Layers className="w-3 h-3 text-[#2b6cb0]" />
              <span className="font-mono font-bold text-[#2b6cb0]">{totalSelectedCount}</span>
              <span className="text-slate-500 font-normal">sel.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

