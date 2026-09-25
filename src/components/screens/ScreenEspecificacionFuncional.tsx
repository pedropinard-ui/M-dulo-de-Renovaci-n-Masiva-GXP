import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Database, 
  GitFork, 
  CheckSquare, 
  ShieldCheck, 
  Code, 
  Cpu, 
  Server, 
  BookOpen,
  ArrowRight,
  ExternalLink,
  Table,
  Workflow,
  Download,
  HelpCircle,
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';
import { downloadFunctionalDoc } from '../../utils/functionalDocWordGenerator';
import { downloadUserManualDoc } from '../../utils/userManualWordGenerator';

export const ScreenEspecificacionFuncional: React.FC = () => {
  const [activeDocSection, setActiveDocSection] = useState<
    'arquitectura' | 'casos_uso' | 'historias' | 'reglas_negocio' | 'modelo_datos' | 'flujo_bpmn' | 'apis' | 'manual_usuario'
  >('arquitectura');

  const sections = [
    { id: 'arquitectura', label: '1. Arquitectura Funcional & Técnica', icon: Layers },
    { id: 'casos_uso', label: '2. Casos de Uso (CU-01 al CU-08)', icon: BookOpen },
    { id: 'historias', label: '3. Historias de Usuario & Gherkin', icon: CheckSquare },
    { id: 'reglas_negocio', label: '4. Matriz de Reglas de Negocio', icon: ShieldCheck },
    { id: 'modelo_datos', label: '5. Modelo de Datos & ERD', icon: Database },
    { id: 'flujo_bpmn', label: '6. Flujo Funcional BPMN E2E', icon: Workflow },
    { id: 'apis', label: '7. Especificación de APIs REST', icon: Code },
    { id: 'manual_usuario', label: '8. Manual de Usuario (Paso a Paso)', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Entregables del Arquitecto de Soluciones & Product Owner
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              Documentación & Guías Operativas
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Especificación funcional integral, manual de usuario paso a paso, arquitectura de seguros, reglas de negocio y modelo de datos para desarrollo TI.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            onClick={() => downloadFunctionalDoc()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            title="Descargar Documento de Especificación Funcional en formato Microsoft Word (.doc)"
          >
            <FileText className="w-3.5 h-3.5 text-slate-950" />
            <span>Doc Funcional (.doc)</span>
            <Download className="w-3 h-3 text-slate-950" />
          </button>

          <button
            onClick={() => downloadUserManualDoc()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            title="Descargar Manual de Usuario & Guía Operativa Paso a Paso en formato Microsoft Word (.doc)"
          >
            <BookOpen className="w-3.5 h-3.5 text-white" />
            <span>Manual Usuario (.doc)</span>
            <Download className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeDocSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => setActiveDocSection(sec.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: ARQUITECTURA */}
      {activeDocSection === 'arquitectura' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>1. Arquitectura Funcional & Técnica Empresarial</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Diseño por capas con desacoplamiento entre el Módulo de Renovación Masiva, el motor de reglas de cálculo y el Core Asegurador ACSEL.
              </p>
            </div>

            {/* Architecture Diagram Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 font-mono text-xs">
              <div className="text-center font-bold text-cyan-400 border-b border-slate-800 pb-2">
                DIAGRAMA DE CAPAS DE LA SOLUCIÓN
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                {/* Capa 1 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2">
                  <div className="font-bold text-cyan-300 text-xs">CAPA DE PRESENTACIÓN</div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    • SPA React 18 + Vite<br />
                    • Dashboard Ejecutivo KPIs<br />
                    • Grid con Frozen Columns<br />
                    • Plantillero WYSIWYG
                  </div>
                </div>

                {/* Capa 2 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
                  <div className="font-bold text-emerald-300 text-xs">CAPA DE NEGOCIO / BFF</div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    • Simulador Actuarial (% / Indiv)<br />
                    • Motor de Reglas de Validación<br />
                    • Orquestador de Comunicaciones<br />
                    • Control de Excepciones
                  </div>
                </div>

                {/* Capa 3 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 space-y-2">
                  <div className="font-bold text-purple-300 text-xs">CAPA DE INTEGRACIÓN</div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    • API Gateway Universal<br />
                    • Servicio Batch ACSEL<br />
                    • Motor AML / OFAC (Listas)<br />
                    • Servicio SMTP / SendGrid
                  </div>
                </div>

                {/* Capa 4 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
                  <div className="font-bold text-amber-300 text-xs">CAPA DE DATOS CORE</div>
                  <div className="text-[11px] text-slate-300 font-sans">
                    • ACSEL Database (Oracle/SQL)<br />
                    • Tablas Maestras Tarifarias<br />
                    • Histórico de Pólizas<br />
                    • Bitácora de Auditoría
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Principles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white">Preparación Multi-Producto (Extensibilidad)</div>
                <p className="text-slate-400 leading-relaxed">
                  El modelo abstrae el identificador de producto (`idProducto`, `codigo`), permitiendo que además de GXP (Últimos Gastos), el mismo motor gestione renovaciones de Vida Colectivo, Salud Integral y Accidentes Personales mediante catálogos parametrizables sin cambios en el código base.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-white">Resiliencia & Tolerancia a Fallos</div>
                <p className="text-slate-400 leading-relaxed">
                  Aislamiento transaccional por póliza. Un error en un registro individual (ej. correo ausente o falla de red) no interrumpe el procesamiento del lote de 1,000+ pólizas. Los errores se registran en una cola de excepciones para tratamiento posterior.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 2: CASOS DE USO */}
      {activeDocSection === 'casos_uso' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>2. Especificación de Casos de Uso (CU-01 a CU-08)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Catálogo formal de casos de uso para los analistas, desarrolladores y equipo de QA.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'CU-01',
                nombre: 'Consulta y Filtrado Masivo de Pólizas por Vigencia',
                actor: 'Analista de Suscripción / Suscriptor Senior',
                precondicion: 'El usuario se encuentra autenticado con perfil de Operaciones o Suscripción.',
                flujo: '1. El usuario selecciona el producto (por defecto GXP) y rango de vigencias.\n2. El sistema consulta la base de datos de pólizas vigentes.\n3. El sistema muestra la grilla con paginación y columnas fijas (Póliza, Contratante, Renovación).\n4. El usuario selecciona pólizas de forma masiva o individual.',
                postcondicion: 'Pólizas marcadas como candidatas para renovación en el lote actual.',
              },
              {
                id: 'CU-02',
                nombre: 'Simulación de Incremento Tarifario General & Excepciones',
                actor: 'Actuario / Gerente de Negocios',
                precondicion: 'Existen pólizas seleccionadas en el Paso 1.',
                flujo: '1. El usuario ingresa un % de incremento general (ej. 15%).\n2. El sistema calcula automáticamente la nueva tarifa anual y mensual para todas las pólizas.\n3. El usuario puede modificar manualmente el % de pólizas individuales (Póliza A = 15%, B = 0%, C = 5%).\n4. La excepción individual sobreescribe la regla general.\n5. El sistema recalcula el Resumen Ejecutivo superior.',
                postcondicion: 'Matriz tarifaria simulada y almacenada temporalmente en sesión.',
              },
              {
                id: 'CU-03',
                nombre: 'Validación Automática de Cartera & Reglas de Negocio',
                actor: 'Sistema / Motor de Validación',
                precondicion: 'Lote de pólizas con tarifas simuladas.',
                flujo: '1. El usuario presiona "Validar Cartera".\n2. El motor evalúa: correos vacíos, tarifas <= 0, coberturas inválidas, datos fiscales faltantes.\n3. El sistema clasifica cada póliza en Correcta, Advertencia o Error Bloqueante.\n4. Se genera la bandeja de errores con acciones recomendadas.\n5. Las pólizas con errores bloqueantes quedan marcadas para exclusión automática.',
                postcondicion: 'Cartera validada y clasificada para comunicación y emisión.',
              },
              {
                id: 'CU-04',
                nombre: 'Procesamiento y Actualización Masiva en Core ACSEL',
                actor: 'Operador de Emisión / Sistema Batch',
                precondicion: 'Cartera validada con tarifas aprobadas.',
                flujo: '1. El usuario presiona "Procesar Cambio de Tarifa".\n2. El sistema itera sobre las pólizas válidas seleccionadas.\n3. Se aplican las nuevas tarifas y fechas de vigencia en ACSEL.\n4. Si un registro individual presenta inconsistencia, se registra y el proceso continúa con los demás registros.\n5. Se genera bitácora auditable descargable en Excel.',
                postcondicion: 'Pólizas renovadas con tarifas impactadas en base de datos maestra.',
              },
              {
                id: 'CU-05',
                nombre: 'Generación y Envío de Comunicaciones Multicanal',
                actor: 'Oficial de Servicio al Cliente / Suscriptor',
                precondicion: 'Pólizas procesadas en Core ACSEL.',
                flujo: '1. El usuario revisa o edita la plantilla corporativa con variables dinámicas ({NUM_POLIZA}, {TARIFA_RENOV_ANUAL}, {PORC_INCREMENTO}).\n2. El sistema genera vista previa individualizada por cliente.\n3. El sistema valida la existencia de correo del cliente, corredor y supervisor.\n4. El usuario ejecuta envío individual o envío masivo.\n5. Se registra la fecha y usuario de despacho en auditoría.',
                postcondicion: 'Notificaciones emitidas y registradas en historial de comunicación.',
              },
              {
                id: 'CU-06',
                nombre: 'Importación y Exportación de Archivos Excel',
                actor: 'Analista de Operaciones',
                precondicion: 'Archivo Excel con formato estándar de renovación.',
                flujo: '1. El usuario sube el archivo Excel.\n2. El sistema valida la estructura y tipos de datos de las columnas.\n3. Los registros importados se fusionan con la cartera activa.\n4. El usuario puede exportar simulación, validación y bitácoras a Excel/PDF.',
                postcondicion: 'Datos sincronizados e informes descargados.',
              },
              {
                id: 'CU-07',
                nombre: 'Debida Diligencia Masiva & Consulta de Pasaportes (AML)',
                actor: 'Oficial de Cumplimiento / Analista de Negocios',
                precondicion: 'Usuario autorizado con rol asignado.',
                flujo: '1. El usuario ingresa el motivo obligatorio y carga Excel con Cédulas y Pasaportes extranjeros.\n2. El sistema registra la corrida formal.\n3. El sistema consulta listas ONU/OFAC/Universal.\n4. Se genera resumen ejecutivo y reporte descargable en PDF.',
                postcondicion: 'Corrida almacenada en historial según permisos del perfil.',
              },
              {
                id: 'CU-08',
                nombre: 'Auditoría y Trazabilidad Integral de Eventos',
                actor: 'Auditor Interno / Administrador',
                precondicion: 'Eventos ejecutados en la aplicación.',
                flujo: '1. El sistema registra de manera inmutable usuario, fecha, hora, póliza, valor anterior, valor nuevo y canal origen.\n2. El auditor consulta y filtra los registros por acción o fecha.',
                postcondicion: 'Evidencia documental para auditoría interna y entes reguladores.',
              },
            ].map((cu) => (
              <div key={cu.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                      {cu.id}
                    </span>
                    <span className="font-bold text-white text-sm">{cu.nombre}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">Actor: {cu.actor}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 pt-2 border-t border-slate-800/80">
                  <div>
                    <strong className="text-slate-400 block text-[11px]">Precondición:</strong>
                    {cu.precondicion}
                  </div>
                  <div>
                    <strong className="text-slate-400 block text-[11px]">Postcondición:</strong>
                    {cu.postcondicion}
                  </div>
                </div>
                <div className="pt-2">
                  <strong className="text-slate-400 block text-[11px] mb-1">Flujo Principal:</strong>
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-300 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                    {cu.flujo}
                  </pre>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SECTION 3: HISTORIAS DE USUARIO (GHERKIN) */}
      {activeDocSection === 'historias' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span>3. Historias de Usuario & Criterios de Aceptación (Gherkin)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Historias estructuradas con formato ágil estándar y criterios Given / When / Then.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {[
              {
                id: 'HU-01',
                titulo: 'Simulación de Incremento Masivo con Excepciones Individuales',
                rol: 'Como Suscriptor Senior o Actuario de Negocios',
                quiero: 'aplicar un porcentaje de incremento general a toda la cartera y sobrescribir pólizas puntuales con tarifas diferenciadas',
                para: 'evaluar el impacto económico y atender negociaciones especiales con intermediarios sin detener el proceso masivo.',
                gherkin: `Scenario: Aplicar incremento general del 15% con excepción individual del 5%
  Given que tengo 10 pólizas seleccionadas con prima actual de RD$ 100,000 cada una
  When ingreso un "% Incremento General" de 15% y presiono "Aplicar Incremento"
  And modifico manualmente la Póliza "GXP-2026-9041" con 5% de incremento
  Then la Póliza "GXP-2026-9041" debe reflejar una prima renovada de RD$ 105,000
  And las restantes 9 pólizas deben reflejar una prima renovada de RD$ 115,000
  And el Resumen Ejecutivo superior debe mostrar una Prima Renovada Total de RD$ 1,140,000`,
              },
              {
                id: 'HU-02',
                titulo: 'Validación de Cartera & Tolerancia a Errores Individuales',
                rol: 'Como Analista de Operaciones',
                quiero: 'ejecutar la validación de integridad sobre todas las pólizas antes de la emisión',
                para: 'detectar errores de correos o tarifas y continuar procesando el resto de la cartera sin bloqueos globales.',
                gherkin: `Scenario: Exclusión automática de pólizas con errores bloqueantes
  Given que el lote contiene 12 pólizas, de las cuales 2 no tienen correo electrónico registrado
  When ejecuto el botón "Validar Cartera"
  Then el sistema debe clasificar 10 pólizas como "Correctas" y 2 con "Observación Bloqueante"
  And al presionar "Procesar Cambio de Tarifa", el sistema debe actualizar únicamente las 10 pólizas válidas
  And las 2 pólizas con error deben ser registradas en la bitácora con su motivo y acción recomendada`,
              },
              {
                id: 'HU-03',
                titulo: 'Comunicación de Renovación con Copia a Intermediarios y Supervisión',
                rol: 'Como Oficial de Atención y Suscripción',
                quiero: 'enviar notificaciones automáticas por correo electrónico al cliente con copia a su corredor y supervisor',
                para: 'garantizar la transparencia contractual y mantener informado al canal de ventas.',
                gherkin: `Scenario: Generación y despacho con variables dinámicas
  Given una póliza válida con correo de cliente "rrhh@empresa.com.do" y corredor "marsh@broker.com"
  When presiono "Generar Comunicación" y ejecuto "Envío Masivo"
  Then el sistema debe sustituir {NUM_POLIZA}, {TARIFA_RENOV_ANUAL} y {FECHA_RENOVACION} en el texto
  And registrar fecha, hora y usuario remitente en la auditoría
  And marcar el estado de la póliza como "Notificado"`,
              },
            ].map((hu) => (
              <div key={hu.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {hu.id}
                  </span>
                  <span className="font-bold text-white text-sm">{hu.titulo}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>{hu.rol}</strong>, {hu.quiero}, <strong>{hu.para}</strong>.
                </p>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400">Criterio de Aceptación (Gherkin):</span>
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                    {hu.gherkin}
                  </pre>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SECTION 4: MATRIZ DE REGLAS DE NEGOCIO */}
      {activeDocSection === 'reglas_negocio' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>4. Matriz de Reglas de Negocio (RN-01 a RN-10)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Catálogo de reglas de negocio para el motor de suscripción y cálculo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="p-3 w-16">Código</th>
                  <th className="p-3 min-w-[180px]">Nombre Regla</th>
                  <th className="p-3 min-w-[280px]">Descripción & Lógica</th>
                  <th className="p-3 min-w-[120px]">Tipo</th>
                  <th className="p-3 min-w-[120px]">Severidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {[
                  {
                    id: 'RN-01',
                    nombre: 'Prevalencia de Excepción',
                    desc: 'Si una póliza posee una tarifa o % de incremento individual asignado manualmente, este valor prevalece sobre el % de incremento general masivo.',
                    tipo: 'Cálculo Tarifario',
                    sev: 'Obligatoria',
                  },
                  {
                    id: 'RN-02',
                    nombre: 'Fórmula de Tarifa Renovación',
                    desc: 'Tarifa Renovada Anual = Tarifa Actual Anual * (1 + % Incremento / 100). Tarifa Mensual = Tarifa Renovada Anual / 12.',
                    tipo: 'Cálculo Tarifario',
                    sev: 'Obligatoria',
                  },
                  {
                    id: 'RN-03',
                    nombre: 'Validación Correo Cliente',
                    desc: 'El correo del contratante es obligatorio y debe cumplir la sintaxis RFC 5322 para poder generar comunicación.',
                    tipo: 'Validación Datos',
                    sev: 'Bloqueante',
                  },
                  {
                    id: 'RN-04',
                    nombre: 'Prima Base Positiva',
                    desc: 'La prima anual actual no puede ser menor o igual a 0. De ser así, se requiere ajuste previo en el Core ACSEL.',
                    tipo: 'Validación Datos',
                    sev: 'Bloqueante',
                  },
                  {
                    id: 'RN-05',
                    nombre: 'Identificación Fiscal / RNC',
                    desc: 'El contratante debe tener un número de RNC, Cédula o Pasaporte válido registrado en el maestro.',
                    tipo: 'Validación Datos',
                    sev: 'Bloqueante',
                  },
                  {
                    id: 'RN-06',
                    nombre: 'Aislamiento de Fallos en Emisión',
                    desc: 'Durante la corrida masiva, si una póliza falla por bloqueo de base de datos o timeout, se continúa con las siguientes sin cancelar la transacción global.',
                    tipo: 'Procesamiento',
                    sev: 'Obligatoria',
                  },
                  {
                    id: 'RN-07',
                    nombre: 'Exclusión Automática de Errores',
                    desc: 'Pólizas con estado "Error" o errores bloqueantes quedan deseleccionadas del proceso de emisión masiva.',
                    tipo: 'Procesamiento',
                    sev: 'Obligatoria',
                  },
                  {
                    id: 'RN-08',
                    nombre: 'Copia Obligatoria a Intermediarios',
                    desc: 'Toda comunicación generada para el cliente debe incorporar en copia (CC) al correo del corredor registrado y supervisor.',
                    tipo: 'Comunicación',
                    sev: 'Advertencia',
                  },
                  {
                    id: 'RN-09',
                    nombre: 'Inmutabilidad de Auditoría',
                    desc: 'Todo cambio tarifario, envío de comunicación o simulación debe registrar usuario, timestamp, valor anterior y nuevo sin opción de borrado.',
                    tipo: 'Auditoría',
                    sev: 'Obligatoria',
                  },
                  {
                    id: 'RN-10',
                    nombre: 'Debida Diligencia con Pasaporte',
                    desc: 'Para consultas de extranjeros con pasaporte, es mandatorio completar Nombre Completo y Número de Pasaporte.',
                    tipo: 'Cumplimiento AML',
                    sev: 'Obligatoria',
                  },
                ].map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-300">{r.id}</td>
                    <td className="p-3 font-semibold text-white">{r.nombre}</td>
                    <td className="p-3 text-slate-300">{r.desc}</td>
                    <td className="p-3 text-slate-400">{r.tipo}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.sev === 'Bloqueante'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : r.sev === 'Advertencia'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {r.sev}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SECTION 5: MODELO DE DATOS */}
      {activeDocSection === 'modelo_datos' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>5. Modelo de Datos Relacional (ERD) & Diccionario de Entidades</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Estructura normalizada preparada para soportar múltiples ramos de seguros (GXP, Vida, Salud, Accidentes).
            </p>
          </div>

          {/* ERD Diagram Visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* Entity: PRODUCTO */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300">ENTIDAD PRODUCTO</span>
                <span className="text-[10px] text-slate-400 font-mono">1</span>
              </div>
              <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                <div className="text-amber-400">PK IdProducto (UUID)</div>
                <div>• Código (VARCHAR) [GXP, VID-COL]</div>
                <div>• Nombre (VARCHAR)</div>
                <div>• Ramo (VARCHAR)</div>
                <div>• Activo (BOOLEAN)</div>
              </div>
            </div>

            {/* Entity: RENOVACION */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-300">ENTIDAD RENOVACIÓN</span>
                <span className="text-[10px] text-slate-400 font-mono">N</span>
              </div>
              <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                <div className="text-amber-400">PK IdRenovacion (UUID)</div>
                <div className="text-cyan-400">FK IdProducto (UUID)</div>
                <div>• Poliza (VARCHAR)</div>
                <div>• Contratante (VARCHAR)</div>
                <div>• Documento (VARCHAR)</div>
                <div>• Cobertura (VARCHAR)</div>
                <div>• FechaRenovacion (DATE)</div>
                <div>• Estado (ENUM)</div>
              </div>
            </div>

            {/* Entity: TARIFA ACTUAL */}
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-300">TARIFA ACTUAL</span>
                <span className="text-[10px] text-slate-400 font-mono">1:1</span>
              </div>
              <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                <div className="text-amber-400">PK IdTarifaActual (UUID)</div>
                <div className="text-indigo-400">FK IdRenovacion (UUID)</div>
                <div>• TarifaAnual (DECIMAL 18,2)</div>
                <div>• TarifaMensual (DECIMAL 18,2)</div>
                <div>• VigenciaDesde (DATE)</div>
                <div>• VigenciaHasta (DATE)</div>
              </div>
            </div>

            {/* Entity: TARIFA RENOVACION */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-purple-300">TARIFA RENOVACIÓN</span>
                <span className="text-[10px] text-slate-400 font-mono">1:1</span>
              </div>
              <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                <div className="text-amber-400">PK IdTarifaRenovacion (UUID)</div>
                <div className="text-indigo-400">FK IdRenovacion (UUID)</div>
                <div>• TarifaAnual (DECIMAL 18,2)</div>
                <div>• TarifaMensual (DECIMAL 18,2)</div>
                <div>• PorcentajeIncremento (DECIMAL 5,2)</div>
                <div>• EsExcepcion (BOOLEAN)</div>
                <div>• MotivoExcepcion (TEXT)</div>
              </div>
            </div>

            {/* Entity: COMUNICACION */}
            <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-blue-300">ENTIDAD COMUNICACIÓN</span>
                <span className="text-[10px] text-slate-400 font-mono">1:N</span>
              </div>
              <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                <div className="text-amber-400">PK IdComunicacion (UUID)</div>
                <div className="text-indigo-400">FK IdRenovacion (UUID)</div>
                <div>• Destinatario (VARCHAR)</div>
                <div>• Copia (TEXT[])</div>
                <div>• Asunto (VARCHAR)</div>
                <div>• Cuerpo (TEXT)</div>
                <div>• FechaEnvio (TIMESTAMP)</div>
                <div>• UsuarioEnvio (VARCHAR)</div>
              </div>
            </div>

            {/* Entity: AUDITORIA */}
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-rose-300">ENTIDAD AUDITORÍA</span>
                <span className="text-[10px] text-slate-400 font-mono">1:N</span>
              </div>
              <div className="space-y-1 font-mono text-slate-300 text-[11px]">
                <div className="text-amber-400">PK IdAuditoria (UUID)</div>
                <div>• Usuario (VARCHAR)</div>
                <div>• Accion (VARCHAR)</div>
                <div>• FechaHora (TIMESTAMP)</div>
                <div>• Poliza (VARCHAR)</div>
                <div>• ValorAnterior (TEXT)</div>
                <div>• ValorNuevo (TEXT)</div>
                <div>• Origen (VARCHAR)</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SECTION 6: FLUJO BPMN */}
      {activeDocSection === 'flujo_bpmn' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-400" />
              <span>6. Flujo Funcional Completo BPMN End-to-End</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Secuencia de interacción entre el Usuario de Negocios, Motor de Renovación y Core ACSEL.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                fase: 'Fase 1: Consulta & Filtrado',
                color: 'border-cyan-500',
                pasos: [
                  '1.1 Seleccionar Ramo / Producto (GXP por defecto)',
                  '1.2 Filtrar por período de vigencia (ej. Q4-2026)',
                  '1.3 Seleccionar pólizas a incluir en la corrida masiva',
                  '1.4 Opcional: Importar pólizas/tarifas desde archivo Excel',
                ],
              },
              {
                fase: 'Fase 2: Simulación Tarifaria & Excepciones',
                color: 'border-emerald-500',
                pasos: [
                  '2.1 Definir % Incremento General Masivo (ej. 15%)',
                  '2.2 Motor calcula automáticamente nuevas tarifas anuales y mensuales',
                  '2.3 Visualizar impacto económico en el Resumen Ejecutivo superior',
                  '2.4 Gestionar excepciones individuales por póliza (prevalecen sobre la general)',
                ],
              },
              {
                fase: 'Fase 3: Validación de Cartera & Tratamiento de Errores',
                color: 'border-amber-500',
                pasos: [
                  '3.1 Ejecutar motor de validación de reglas de negocio',
                  '3.2 Verificar correos, tarifas base, coberturas y datos fiscales',
                  '3.3 Consultar bandeja de errores con severidad y acción recomendada',
                  '3.4 Subsanar datos en línea o continuar (errores quedan excluidos automáticamente)',
                ],
              },
              {
                fase: 'Fase 4: Procesamiento en Core ACSEL & Trazabilidad',
                color: 'border-purple-500',
                pasos: [
                  '4.1 Ejecutar actualización masiva en Core asegurador',
                  '4.2 Grabar nuevas tarifas y vigencias para pólizas seleccionadas válidas',
                  '4.3 Registrar eventos inmutables en bitácora de auditoría',
                  '4.4 Descargar informe de corrida en formatos Excel y PDF',
                ],
              },
              {
                fase: 'Fase 5: Generación & Despacho de Comunicación',
                color: 'border-blue-500',
                pasos: [
                  '5.1 Personalizar plantilla con placeholders dinámicos de tarifas',
                  '5.2 Validar existencia de correos PARA (cliente) y CC (corredor, supervisor)',
                  '5.3 Visualizar vista previa renderizada en tiempo real por cliente',
                  '5.4 Ejecutar envío individual o despacho masivo automatizado tras emisión',
                ],
              },
            ].map((flujo, idx) => (
              <div key={idx} className={`p-4 rounded-xl bg-slate-950 border-l-4 ${flujo.color} border-y border-r border-slate-800 space-y-2`}>
                <h4 className="font-bold text-white text-sm">{flujo.fase}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-slate-300">
                  {flujo.pasos.map((paso, pIdx) => (
                    <div key={pIdx} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                      {paso}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SECTION 7: ESPECIFICACIÓN DE APIS REST */}
      {activeDocSection === 'apis' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              <span>7. Especificación de Endpoints REST (Contrato OpenAPI / Swagger)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Contratos de servicios para el equipo de desarrollo Backend e integración con el Core Asegurador.
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {[
              {
                metodo: 'GET',
                endpoint: '/api/v1/renovaciones',
                desc: 'Consulta cartera filtrada por producto, vigencia y estado.',
                payload: 'Query params: ?producto=GXP&desde=2026-10-01&hasta=2026-12-31&estado=Pendiente',
              },
              {
                metodo: 'POST',
                endpoint: '/api/v1/simulacion/calcular',
                desc: 'Aplica % de incremento general o individual y devuelve tarifas proyectadas.',
                payload: `Request Body:
{
  "porcentajeGeneral": 15.0,
  "excepciones": [
    { "polizaId": "pol-001", "porcentaje": 5.0, "motivo": "Negociación Broker" }
  ]
}`,
              },
              {
                metodo: 'POST',
                endpoint: '/api/v1/validacion/cartera',
                desc: 'Ejecuta motor de validación sobre lote de pólizas.',
                payload: `Response Body:
{
  "totalEvaluadas": 12,
  "correctas": 10,
  "conObservaciones": 2,
  "errores": [
    { "polizaId": "pol-003", "campo": "correoCliente", "severidad": "Bloqueante" }
  ]
}`,
              },
              {
                metodo: 'POST',
                endpoint: '/api/v1/comunicaciones/despacho-masivo',
                desc: 'Despacha correos masivos con plantilla y copia a corredores.',
                payload: `Request Body:
{
  "templateId": "tpl-renovacion-gxp-std",
  "polizasIds": ["pol-001", "pol-002", "pol-004"],
  "usuarioEmisor": "demo.suscripcion@universal-demo.com.do"
}`,
              },
              {
                metodo: 'POST',
                endpoint: '/api/v1/procesamiento/emision-core',
                desc: 'Actualiza tarifas en tablas maestras ACSEL con aislamiento de errores.',
                payload: `Response Body:
{
  "numeroCorrida": "CORR-2026-0881",
  "totalExitosas": 10,
  "totalFallidas": 0,
  "tiempoEjecucionSegundos": 1.8
}`,
              },
            ].map((api, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                    api.metodo === 'GET' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {api.metodo}
                  </span>
                  <span className="text-white font-bold">{api.endpoint}</span>
                  <span className="text-slate-400 font-sans text-xs ml-auto">{api.desc}</span>
                </div>
                <pre className="p-2.5 rounded bg-slate-900 text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {api.payload}
                </pre>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SECTION 8: MANUAL DE USUARIO PASO A PASO */}
      {activeDocSection === 'manual_usuario' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>8. Manual de Usuario & Guía Operativa Paso a Paso</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Guía completa de operación para suscriptores, analistas y operadores de Seguros Universal (Ramo Últimos Gastos Plus - GEXP).
                </p>
              </div>

              <button
                onClick={() => downloadUserManualDoc()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Manual Completo (.doc)</span>
              </button>
            </div>

            {/* Step 1 Guide */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs border border-sky-500/30">1</span>
                  <span>Paso 1: Bandeja de Renovación (Consulta, Filtros & Selección)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  Pantalla 1 / 5
                </span>
              </div>

              {/* VISUAL SCREEN MOCKUP 1 */}
              <div className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl text-[11px]">
                <div className="bg-slate-800/90 px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="font-mono text-[10px] text-slate-400 ml-2">Pantalla 1: Bandeja de Renovación — Seguros Universal</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Producto: GEXP</span>
                </div>

                <div className="p-3 space-y-2.5 bg-slate-900/60">
                  {/* Mock Filters */}
                  <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Producto</span>
                      <div className="bg-slate-900 text-sky-300 px-2 py-1 rounded border border-slate-700 font-mono">GEXP - ULTIMOS GASTOS PLUS ▼</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Renovación Desde</span>
                      <div className="bg-slate-900 text-slate-200 px-2 py-1 rounded border border-slate-700 font-mono">2026-09-01 📅</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Renovación Hasta</span>
                      <div className="bg-slate-900 text-slate-200 px-2 py-1 rounded border border-slate-700 font-mono">2026-10-31 📅</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Tipo Plan / Cobertura</span>
                      <div className="bg-slate-900 text-slate-200 px-2 py-1 rounded border border-slate-700 font-mono">Todos ▼ | Todas ▼</div>
                    </div>
                  </div>

                  {/* Mock KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <div className="text-slate-400 text-[9px]">Pólizas Seleccionadas</div>
                      <div className="text-sky-400 font-bold text-xs">46 / 50</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <div className="text-slate-400 text-[9px]">Prima Actual Total</div>
                      <div className="text-slate-200 font-bold text-xs">RD$ 1,842,500.00</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <div className="text-slate-400 text-[9px]">Prima Proyectada</div>
                      <div className="text-emerald-400 font-bold text-xs">RD$ 2,098,400.00</div>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <div className="text-slate-400 text-[9px]">Variación Neta</div>
                      <div className="text-blue-400 font-bold text-xs">+RD$ 255,900 (+13.9%)</div>
                    </div>
                  </div>

                  {/* Mock Table */}
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-800/80 text-slate-300 text-[9px]">
                        <tr>
                          <th className="p-1.5 w-6">[✓]</th>
                          <th className="p-1.5">No. Póliza</th>
                          <th className="p-1.5">Contratante</th>
                          <th className="p-1.5">Plan Actual</th>
                          <th className="p-1.5">Asegurados</th>
                          <th className="p-1.5">Tarifa Actual</th>
                          <th className="p-1.5">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr className="bg-slate-950/40">
                          <td className="p-1.5 text-sky-400">[✓]</td>
                          <td className="p-1.5 font-mono text-sky-300 font-bold">GEXP-2026-00101</td>
                          <td className="p-1.5">INDUSTRIAS TEXTILES DEL CARIBE</td>
                          <td className="p-1.5">GASTOS EXEQUIALES 80K</td>
                          <td className="p-1.5">15 vidas</td>
                          <td className="p-1.5 font-mono">RD$ 21,600.00</td>
                          <td className="p-1.5"><span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[9px]">Pendiente</span></td>
                        </tr>
                        <tr className="bg-slate-950/60">
                          <td className="p-1.5 text-sky-400">[✓]</td>
                          <td className="p-1.5 font-mono text-sky-300 font-bold">GEXP-2026-00102</td>
                          <td className="p-1.5">ASOCIACION DE GANADEROS CENTRAL</td>
                          <td className="p-1.5">ULTIMOS GASTOS FAMILIAR</td>
                          <td className="p-1.5">8 vidas</td>
                          <td className="p-1.5 font-mono">RD$ 16,000.00</td>
                          <td className="p-1.5"><span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[9px]">Pendiente</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mock Action */}
                  <div className="flex justify-between items-center pt-1 text-[10px]">
                    <span className="text-slate-400">Mostrando 46 pólizas para renovación</span>
                    <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow text-[10px]">
                      Continuar a Simulación de Tarifas (Paso 2) ▶
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-200">Filtros Renombrados Disponibles:</span>
                  <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                    <li><strong>Producto:</strong> GEXP - ULTIMOS GASTOS PLUS (por defecto).</li>
                    <li><strong>Renovación Desde / Hasta:</strong> Rango de fechas de vencimiento de las pólizas.</li>
                    <li><strong>Tipo Plan:</strong> Filtra por Básica, Óptima, Plan Dental.</li>
                    <li><strong>Cobertura:</strong> Filtra por REPATRIACION (RP) o GASTOS EXEQUIAS (GE).</li>
                    <li><strong>Estado:</strong> Pendiente, Validado, Con Error, Renovado y Notificado.</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="font-bold text-slate-200">Acciones de Selección & Carga:</span>
                  <ul className="text-slate-400 space-y-1 list-disc pl-4 text-[11px]">
                    <li><strong>Selección en Lote:</strong> Checkbox maestro para seleccionar todas las pólizas filtradas.</li>
                    <li><strong>Importar Excel:</strong> Carga de archivos externos (.xlsx/.csv) con validación automática.</li>
                    <li><strong>Exportar Excel:</strong> Descarga inmediata de la cartera filtrada a hoja de cálculo.</li>
                    <li><strong>Continuar:</strong> Botón azul hacia el Paso 2 cuando hay al menos 1 póliza marcada.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 2 Guide */}
            <div className="p-5 rounded-xl bg-slate-950 border border-purple-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs border border-purple-500/30">2</span>
                  <span>Paso 2: Simulación de Tarifas (Regla Clave: Cambio de Plan vs Ajuste de Tasa)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Pantalla 2 / 5
                </span>
              </div>

              {/* VISUAL SCREEN MOCKUP 2 */}
              <div className="rounded-lg border border-purple-900/60 bg-slate-900 overflow-hidden shadow-2xl text-[11px]">
                <div className="bg-purple-950/80 px-3 py-1.5 border-b border-purple-800 flex items-center justify-between text-purple-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
                    <span className="font-mono text-[10px] text-purple-200">Pantalla 2: Simulación de Tarifas — Motor Actuarial</span>
                  </div>
                  <span className="text-[10px] bg-purple-800/60 px-2 py-0.5 rounded text-purple-200">Exclusión Automática de % Ajuste</span>
                </div>

                <div className="p-3 space-y-2.5 bg-slate-900/60">
                  {/* Mock Rate Bar */}
                  <div className="bg-slate-950 p-2.5 rounded border border-purple-800/40 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 font-bold">Ajuste Masivo de Tasa:</span>
                      <span className="bg-slate-900 text-purple-200 font-mono font-bold px-2 py-0.5 rounded border border-purple-700">+15.0 %</span>
                      <span className="bg-purple-700 text-white font-bold px-2.5 py-0.5 rounded text-[10px]">Aplicar Ajuste de Tasa</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400 italic">
                      * Pólizas con cambio de plan mantienen la tarifa fijada del nuevo plan.
                    </span>
                  </div>

                  {/* Mock Table showing % Ajuste */}
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-800/90 text-slate-300 text-[9px]">
                        <tr>
                          <th className="p-1.5">No. Póliza</th>
                          <th className="p-1.5">Plan Actual ➔ Plan Renovado</th>
                          <th className="p-1.5 bg-purple-950/80 text-purple-300">% Ajuste (Regla)</th>
                          <th className="p-1.5">Prima Actual</th>
                          <th className="p-1.5">Prima Renovada</th>
                          <th className="p-1.5">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr className="bg-purple-950/20">
                          <td className="p-1.5 font-mono text-purple-300 font-bold">GEXP-2026-00101</td>
                          <td className="p-1.5">80K ➔ <strong className="text-purple-300">EXEQUIALES 100K</strong></td>
                          <td className="p-1.5"><span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 font-bold text-[9px] border border-purple-700">No aplica (Nuevo plan)</span></td>
                          <td className="p-1.5 font-mono">RD$ 21,600.00</td>
                          <td className="p-1.5 font-mono font-bold text-emerald-400">RD$ 26,100.00</td>
                          <td className="p-1.5"><span className="bg-purple-800 text-white px-2 py-0.5 rounded text-[9px]">Excepción</span></td>
                        </tr>
                        <tr className="bg-slate-950/40">
                          <td className="p-1.5 font-mono text-sky-300 font-bold">GEXP-2026-00102</td>
                          <td className="p-1.5">ULTIMOS GASTOS FAMILIAR (Conserva)</td>
                          <td className="p-1.5"><span className="text-emerald-400 font-bold font-mono">+15.0%</span> <span className="text-slate-400 text-[9px]">[✏️ Editar]</span></td>
                          <td className="p-1.5 font-mono">RD$ 16,000.00</td>
                          <td className="p-1.5 font-mono font-bold text-emerald-400">RD$ 18,400.00</td>
                          <td className="p-1.5"><span className="bg-blue-800 text-white px-2 py-0.5 rounded text-[9px]">Excepción</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[10px]">
                    <div className="flex gap-2">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Excel Proyección</span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Reporte PDF</span>
                    </div>
                    <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow text-[10px]">
                      Continuar a Validación Técnica (Paso 3) ▶
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-700/50 text-xs text-purple-200 space-y-1">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>REGLA OBLIGATORIA DE NEGOCIO EN SIMULACIÓN:</span>
                </div>
                <p className="text-[11.5px] text-purple-100 leading-relaxed">
                  • <strong>Pólizas con Cambio Automático de Plan (CAMBIO_PLAN):</strong> Aquellas cuyo plan de origen tiene configurada una transición a un nuevo plan (ej. homologación de RD$80,000 a RD$100,000) migran con la tarifa fijada del nuevo plan y <strong>NO APLICAN % DE AJUSTE</strong>. En la grilla muestran <em>"No aplica"</em> y no tienen lápiz de edición de porcentaje.<br />
                  • <strong>Pólizas con Ajuste de Tasa Estándar (AJUSTE_TASA):</strong> Aquellas que renuevan en su mismo plan aplican el incremento porcentual masivo (ej. +15.0%) o excepciones individuales.
                </p>
              </div>
            </div>

            {/* Step 3 Guide */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs border border-emerald-500/30">3</span>
                  <span>Paso 3: Validación Técnica (Auditoría previa y 6 Controles Obligatorios)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Pantalla 3 / 5
                </span>
              </div>

              {/* VISUAL SCREEN MOCKUP 3 */}
              <div className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl text-[11px]">
                <div className="bg-slate-800/90 px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-emerald-300 font-bold">Pantalla 3: Motor de Reglas & Auditoría Previa</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">44 Válidas | 1 Bloqueante | 1 Advertencia</span>
                </div>

                <div className="p-3 space-y-2.5 bg-slate-900/60">
                  {/* Mock Validation Status Cards */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <div className="text-slate-400 text-[9px]">Auditadas</div>
                      <div className="text-slate-200 font-bold text-xs">46</div>
                    </div>
                    <div className="bg-emerald-950/40 p-1.5 rounded border border-emerald-700/60">
                      <div className="text-emerald-400 text-[9px]">100% Válidas</div>
                      <div className="text-emerald-300 font-bold text-xs">44</div>
                    </div>
                    <div className="bg-amber-950/40 p-1.5 rounded border border-amber-700/60">
                      <div className="text-amber-400 text-[9px]">Con Advertencias</div>
                      <div className="text-amber-300 font-bold text-xs">1</div>
                    </div>
                    <div className="bg-rose-950/40 p-1.5 rounded border border-rose-700/60">
                      <div className="text-rose-400 text-[9px]">Bloqueantes</div>
                      <div className="text-rose-300 font-bold text-xs">1</div>
                    </div>
                  </div>

                  {/* Mock Table showing Rules */}
                  <div className="border border-slate-800 rounded overflow-hidden">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-800 text-slate-300 text-[9px]">
                        <tr>
                          <th className="p-1.5">No. Póliza</th>
                          <th className="p-1.5">REG-01 Correo Cliente</th>
                          <th className="p-1.5">REG-04 Listas OFAC</th>
                          <th className="p-1.5">REG-05 Saldo ACSEL</th>
                          <th className="p-1.5">Estado</th>
                          <th className="p-1.5">Acción Inline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr>
                          <td className="p-1.5 font-mono text-sky-300">GEXP-2026-00101</td>
                          <td className="p-1.5 text-emerald-400">✓ contacto@textiles.com.do</td>
                          <td className="p-1.5 text-emerald-400">✓ Limpio</td>
                          <td className="p-1.5 text-emerald-400">✓ Al Día (RD$ 0)</td>
                          <td className="p-1.5"><span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[9px]">Validado</span></td>
                          <td className="p-1.5 text-slate-400 text-[9px]">OK</td>
                        </tr>
                        <tr className="bg-rose-950/20">
                          <td className="p-1.5 font-mono text-rose-300 font-bold">GEXP-2026-00104</td>
                          <td className="p-1.5 text-rose-400 font-bold">✗ Sin correo electrónico</td>
                          <td className="p-1.5 text-emerald-400">✓ Limpio</td>
                          <td className="p-1.5 text-emerald-400">✓ Al Día</td>
                          <td className="p-1.5"><span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300 text-[9px]">Bloqueado</span></td>
                          <td className="p-1.5"><span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-[9px] cursor-pointer">Editar Correo [✏️]</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end items-center pt-1 text-[10px]">
                    <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow text-[10px]">
                      Continuar a Procesamiento Core (Paso 4) ▶
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">1. Correo Cliente (Bloqueante)</div>
                  <div className="text-slate-400 mt-0.5">Exige correo válido con @ y dominio. Se puede subsanar inline en la tabla.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-amber-400">2. Correo Intermediario</div>
                  <div className="text-slate-400 mt-0.5">Valida email del corredor de seguros para envío de copia CC de la notificación.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-amber-400">3. Correo Supervisor</div>
                  <div className="text-slate-400 mt-0.5">Valida email del supervisor corporativo de Seguros Universal para control.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">4. Listas Restrictivas / OFAC (Bloqueante)</div>
                  <div className="text-slate-400 mt-0.5">Cotejo contra listas ONU/OFAC. Si coincide, bloquea hasta visto bueno de AML.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">5. Saldo Pendiente ACSEL (Bloqueante)</div>
                  <div className="text-slate-400 mt-0.5">Exige saldo deudor cero en Core ACSEL antes de autorizar la renovación.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-bold text-amber-400">6. Prima Nueva &lt; Anterior</div>
                  <div className="text-slate-400 mt-0.5">Alerta reducciones de tarifa no autorizadas para evitar fugas de prima.</div>
                </div>
              </div>
            </div>

            {/* Step 4 Guide */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs border border-cyan-500/30">4</span>
                  <span>Paso 4: Procesamiento Core ACSEL (Emisión Transaccional & Bitácora Oficial)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Pantalla 4 / 5
                </span>
              </div>

              {/* VISUAL SCREEN MOCKUP 4 */}
              <div className="rounded-lg border border-cyan-900/60 bg-slate-900 overflow-hidden shadow-2xl text-[11px]">
                <div className="bg-slate-800/90 px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cyan-300 font-bold">Pantalla 4: Procesamiento Transaccional Core ACSEL</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">Conexión Segura ACSEL Gateway</span>
                </div>

                <div className="p-3 space-y-2.5 bg-slate-900/60">
                  {/* Action Banner */}
                  <div className="bg-slate-950 p-3 rounded border border-cyan-800/40 text-center space-y-2">
                    <div className="text-slate-300 font-bold text-xs">
                      Lote Listo para Emisión en Core ACSEL: 45 Pólizas Válidas
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Total Prima Anual: RD$ 2,074,800.00 | Bloqueos Activos: 0
                    </div>
                    <div className="inline-block bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-1.5 rounded shadow text-xs cursor-pointer">
                      ⚡ Procesar Lote en Core ACSEL
                    </div>
                  </div>

                  {/* Mock Success Result */}
                  <div className="bg-emerald-950/40 border border-emerald-700/60 p-2.5 rounded text-[10px] flex items-center justify-between">
                    <div>
                      <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <span>✓ Lote Procesado Exitosamente en Core ACSEL</span>
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5 font-mono">
                        Corrida: BATCH-ACSEL-20260925-8841 | Fecha: 25/09/2026 14:30:15 | Usuario: demo.suscripcion@universal-demo.com.do
                      </div>
                    </div>
                    <div className="bg-emerald-700 text-white font-bold px-2.5 py-1 rounded text-[9.5px] cursor-pointer">
                      📥 Descargar Bitácora Excel
                    </div>
                  </div>

                  <div className="flex justify-end items-center pt-1 text-[10px]">
                    <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow text-[10px]">
                      Continuar a Comunicación & Avisos (Paso 5) ▶
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-200">Requerimiento Mandatorio de Auditoría Interna:</div>
                <p className="text-slate-400 text-[11px]">
                  Cada ejecución genera un identificador de corrida (ej. <code className="text-cyan-300 font-mono">BATCH-ACSEL-20260925-8841</code>) y registra obligatoriamente en la bitácora: <strong>Fecha y Hora exacta al segundo</strong>, y el <strong>Usuario responsable</strong> que realizó el proceso.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Botón "Descargar Bitácora Excel": Genera la evidencia formal para cumplimiento y contabilidad técnica.</span>
                </div>
              </div>
            </div>

            {/* Step 5 Guide */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs border border-indigo-500/30">5</span>
                  <span>Paso 5: Comunicación & Avisos Masivos (Plantillas y Despacho)</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Pantalla 5 / 5
                </span>
              </div>

              {/* VISUAL SCREEN MOCKUP 5 */}
              <div className="rounded-lg border border-indigo-900/60 bg-slate-900 overflow-hidden shadow-2xl text-[11px]">
                <div className="bg-slate-800/90 px-3 py-1.5 border-b border-slate-700 flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-indigo-300 font-bold">Pantalla 5: Plantillero & Despacho Multicanal</span>
                  </div>
                  <span className="text-[10px] text-indigo-400">45 Cartas Listas para Envío</span>
                </div>

                <div className="p-3 space-y-2.5 bg-slate-900/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                    {/* Mock Template */}
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                      <div className="text-slate-300 font-bold text-[9px]">Editor de Plantilla Dinámica:</div>
                      <div className="text-indigo-400 text-[8.5px] font-mono">&#123;NUM_POLIZA&#125; &#123;CONTRATANTE&#125; &#123;TARIFA_RENOV_MENSUAL&#125;</div>
                      <div className="bg-slate-900 text-slate-300 p-2 rounded border border-slate-800 text-[9px] font-mono">
                        Estimado(a) &#123;CONTRATANTE&#125;:<br />
                        Le notificamos la renovación de su póliza &#123;NUM_POLIZA&#125; con tarifa mensual de &#123;TARIFA_RENOV_MENSUAL&#125;...
                      </div>
                    </div>

                    {/* Mock Preview Letter */}
                    <div className="bg-white text-slate-900 p-2 rounded border border-slate-300 shadow text-[9px] space-y-1">
                      <div className="text-center border-b border-slate-200 pb-1">
                        <strong className="text-blue-900">SEGUROS UNIVERSAL</strong><br />
                        <span className="text-[8px] text-slate-500">Aviso Oficial de Renovación de Póliza GEXP</span>
                      </div>
                      <div className="text-[8.5px] text-slate-700 pt-0.5">
                        Estimado(a) <strong>INDUSTRIAS TEXTILES DEL CARIBE</strong>:<br />
                        Póliza: <strong>GEXP-2026-00101</strong> | Nueva Tarifa: <strong>RD$ 2,175.00/mes</strong>
                      </div>
                      <div className="bg-slate-100 p-1 rounded text-[7.5px] text-slate-600 mt-1">
                        CC Corredor: franco_acra@tecnoseguros.com.do | CC Supervisor: mvaldez@universal.com.do
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[10px]">
                    <span className="text-slate-400">45 destinatarios listos</span>
                    <div className="bg-indigo-600 text-white font-bold px-3 py-1 rounded shadow text-[10px]">
                      ✉️ Enviar Notificaciones a Todo el Lote
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <span className="font-bold text-slate-200 text-xs block mb-1">Fusión de Variables Dinámicas:</span>
                  El texto de la carta reemplaza en tiempo real: <code className="text-indigo-300">&#123;NUM_POLIZA&#125;</code>, <code className="text-indigo-300">&#123;CONTRATANTE&#125;</code>, <code className="text-indigo-300">&#123;FECHA_RENOVACION&#125;</code>, <code className="text-indigo-300">&#123;TARIFA_RENOV_MENSUAL&#125;</code>, <code className="text-indigo-300">&#123;PLAN_NOMBRE&#125;</code> y <code className="text-indigo-300">&#123;CORREDOR_NOMBRE&#125;</code>.
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                  <span className="font-bold text-slate-200 text-xs block mb-1">Reglas de Envío y Copias:</span>
                  El destinatario principal (Para) es el asegurado titular. El sistema coloca automáticamente en copia (CC) al correo del corredor de seguros y al correo del supervisor corporativo, registrando la bitácora de envío.
                </div>
              </div>
            </div>

            {/* FAQ Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Preguntas Frecuentes Operativas</span>
              </span>
              <div className="space-y-2 text-slate-300 text-[11px] pt-1">
                <div>
                  <strong className="text-slate-100">¿Por qué una póliza con cambio de plan no permite editar el % de incremento?</strong>
                  <p className="text-slate-400">Porque su renovación se calcula a partir de la tarifa estipulada para el nuevo plan migrado (RD$ 145/cabeza o RD$ 175/cabeza) y por política de suscripción no aplica ajuste tarifario por inflación.</p>
                </div>
                <div>
                  <strong className="text-slate-100">¿Cómo corregir una póliza que tiene correo inválido?</strong>
                  <p className="text-slate-400">En la grilla del Paso 3 (Validación Técnica), haga clic directamente sobre el campo de correo, escriba el email válido y confirme. El sistema la marcará verde de inmediato.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
