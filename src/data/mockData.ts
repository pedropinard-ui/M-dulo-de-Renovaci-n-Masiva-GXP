import { Product, PolicyRenewal, AuditLogEntry, EmailTemplate, ComplianceMassRun } from '../types';
import { validateSinglePolicy } from '../utils/calculations';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-gxp',
    codigo: 'GEXP',
    nombre: 'ULTIMOS GASTOS PLUS (GEXP)',
    ramo: 'Vida & Sepelio Colectivo',
    activo: true,
    coberturasDisponibles: [
      'ULTIMOS GASTOS PLUS FAMILIAR (RP)',
      'GASTOS EXEQUIALES PLUS - BANCO POPULAR (RP)',
      'GASTOS EXEQUIALES PLUS RD$100,000.00 (GE)',
      'GASTOS EXEQUIALES PLUS RD$150,000.00 (GE)',
      'GASTOS EXEQUIALES PLUS INDIVIDUAL (GE)',
      'ULTIMOS GASTOS PLUS CELESTE PLUS (GE)',
      'ULTIMOS GASTOS PLUS CELESTE MUDE (GE)',
      'ULTIMOS GASTOS PLUS CELESTE NG (GE)',
      'ULTIMOS GASTOS PLUS MASIVO RD$80,000 (GE)',
      'ULTIMOS GASTOS PLUS MASIVO RD$100,000 (GE)',
      'GASTOS FUNERARIOS Y EXEQUIALES FAMILIAR (GE)',
      'GASTOS EXEQUIALES PLUS RD$80,000.00 (GE)',
      'ULTIMOS GASTOS PLUS MASIVO RD$150,000 (GE)',
      'GASTOS EXEQUIALES PLUS Z.O. (GE)',
      'ULTIMOS GASTOS PLUS CELESTE PLUS NG (GE)',
      'GASTOS EXEQUIALES PLUS RD$100,000.00 (GF)',
      'GASTOS EXEQUIALES PLUS RD$150,000.00 (GF)',
      'GASTOS EXEQUIALES PLUS INDIVIDUAL (GF)',
      'ULTIMOS GASTOS PLUS CELESTE PLUS (GF)',
      'ULTIMOS GASTOS PLUS CELESTE MUDE (GF)',
      'ULTIMOS GASTOS PLUS CELESTE NG (GF)',
      'ULTIMOS GASTOS PLUS MASIVO RD$80,000 (GF)',
      'ULTIMOS GASTOS PLUS MASIVO RD$100,000 (GF)',
      'GASTOS FUNERARIOS Y EXEQUIALES FAMILIAR (GF)',
      'GASTOS EXEQUIALES PLUS RD$80,000.00 (GF)',
      'ULTIMOS GASTOS PLUS MASIVO RD$150,000 (GF)',
      'GASTOS EXEQUIALES PLUS Z.O. (GF)',
      'ULTIMOS GASTOS PLUS CELESTE PLUS NG (GF)',
    ],
  },
  {
    id: 'prod-vid-col',
    codigo: 'VID-COL',
    nombre: 'Vida Colectivo Corporativo',
    ramo: 'Vida Colectivo',
    activo: true,
    coberturasDisponibles: [
      'Vida Muerte Accidental y Desmembración (AD&D)',
      'Vida Incapacidad Total y Permanente',
      'Vida Gastos Médicos Mayores Complementarios',
    ],
  },
  {
    id: 'prod-salud',
    codigo: 'SAL-MAX',
    nombre: 'Salud Integral Empresarial',
    ramo: 'Salud',
    activo: true,
    coberturasDisponibles: [
      'Salud Platinum Internacional',
      'Salud Óptimo Local',
      'Salud Preventivo Básico',
    ],
  },
  {
    id: 'prod-ap',
    codigo: 'AP-CORP',
    nombre: 'Accidentes Personales Colectivo',
    ramo: 'Accidentes',
    activo: true,
    coberturasDisponibles: [
      'AP Escolar / Universitario',
      'AP Empleados Operativos y Riesgo',
      'AP Conductores y Flotillas',
    ],
  },
];

// Definition of Plans and Coverages strictly from the user's image:
interface PlanCoverageItem {
  plan: string;
  codCobert: 'RP' | 'GE' | 'GF';
  descCobert: 'REPATRIACION' | 'GASTOS EXEQUIAS Y FUNERARIOS' | 'GASTOS FUNERARIOS';
}

const PLANS_AND_COVERAGES_FROM_IMAGE: PlanCoverageItem[] = [
  { plan: 'ULTIMOS GASTOS PLUS FAMILIAR', codCobert: 'RP', descCobert: 'REPATRIACION' },
  { plan: 'GASTOS EXEQUIALES PLUS - BANCO POPULAR', codCobert: 'RP', descCobert: 'REPATRIACION' },
  { plan: 'ULTIMOS GASTOS PLUS FAMILIAR', codCobert: 'RP', descCobert: 'REPATRIACION' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$100,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$150,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS INDIVIDUAL', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE PLUS', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE MUDE', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE NG', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$80,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$100,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS FUNERARIOS Y EXEQUIALES FAMILIAR', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$80,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$80,000.00', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$150,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS Z.O.', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$80,000', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE PLUS NG', codCobert: 'GE', descCobert: 'GASTOS EXEQUIAS Y FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$100,000.00', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$150,000.00', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS INDIVIDUAL', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE PLUS', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE MUDE', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE NG', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$80,000', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$100,000', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'GASTOS FUNERARIOS Y EXEQUIALES FAMILIAR', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$80,000.00', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS RD$80,000.00', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$150,000', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'GASTOS EXEQUIALES PLUS Z.O.', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS MASIVO RD$80,000', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
  { plan: 'ULTIMOS GASTOS PLUS CELESTE PLUS NG', codCobert: 'GF', descCobert: 'GASTOS FUNERARIOS' },
];

const CLIENT_NAMES_DATA = [
  { name: 'Banco Popular Dominicano S.A.', rnc: '101-01063-2', email: 'rrhh@bpd-demo.com.do', phone: '809-544-5000' },
  { name: 'Grupo Ramos S.A. (La Sirena / Pola)', rnc: '101-00214-8', email: 'seguros@gruporamos-demo.com.do', phone: '809-472-4444' },
  { name: 'Cervecería Nacional Dominicana', rnc: '101-00045-5', email: 'beneficios@cnd-demo.com.do', phone: '809-487-3000' },
  { name: 'Pasteurizadora Rica C. por A.', rnc: '101-00122-3', email: 'colectivos@rica-demo.com.do', phone: '809-567-3333' },
  { name: 'Banco Múltiple BHD S.A.', rnc: '101-00078-1', email: 'gestionhumana@bhd-demo.com.do', phone: '809-243-3232' },
  { name: 'Central Romana Corporation Ltd.', rnc: '101-00012-9', email: 'personal@centralromana-demo.com.do', phone: '809-523-3333' },
  { name: 'Claro Dominicana (Compañía Dominicana de Teléfonos)', rnc: '101-00001-5', email: 'rrhh@claro-demo.com.do', phone: '809-220-1111' },
  { name: 'Altice Dominicana S.A.', rnc: '101-85244-9', email: 'beneficios_col@altice-demo.com.do', phone: '809-859-6000' },
  { name: 'Grupo Puntacana S.A.', rnc: '101-08832-4', email: 'gestionhumana@puntacana-demo.com.do', phone: '809-959-2714' },
  { name: 'MercaSID S.A.', rnc: '101-00032-3', email: 'seguros@mercasid-demo.com.do', phone: '809-567-9511' },
  { name: 'Induveca S.A.', rnc: '101-00088-9', email: 'rrhh@induveca-demo.com.do', phone: '809-573-2555' },
  { name: 'Helados Bon S.A.', rnc: '101-03487-1', email: 'talento@heladosbon-demo.com.do', phone: '809-537-4141' },
  { name: 'Cementos Cibao C. por A.', rnc: '102-00021-4', email: 'rrhh@cementoscibao-demo.com.do', phone: '809-575-1111' },
  { name: 'Banco Santa Cruz S.A.', rnc: '101-85512-1', email: 'rrhh@bsc-demo.com.do', phone: '809-726-1000' },
  { name: 'AES Dominicana Renewable Energy', rnc: '101-88491-3', email: 'hr.dominicana@aes-demo.com.do', phone: '809-955-4000' },
  { name: 'Nestlé Dominicana S.A.', rnc: '101-00054-4', email: 'rrhh@do.nestle-demo.com.do', phone: '809-508-5000' },
  { name: 'Gildan Activewear Dominican Republic', rnc: '130-10492-8', email: 'hr.gildan@gildan-demo.com.do', phone: '809-549-3000' },
  { name: 'Brugal & Co. S.A.', rnc: '101-00024-2', email: 'nomina@brugal-demo.com.do', phone: '809-586-2244' },
  { name: 'Asociación Popular de Ahorros y Préstamos (APAP)', rnc: '101-01041-1', email: 'seguros@apap-demo.com.do', phone: '809-689-0171' },
  { name: 'Asociación La Nacional de Ahorros y Préstamos', rnc: '101-01552-9', email: 'rrhh@alnap-demo.com.do', phone: '809-688-6631' },
  { name: 'Plaza Lama S.A.', rnc: '101-00445-6', email: 'rrhh@plazalama-demo.com.do', phone: '809-274-5262' },
  { name: 'CCN - Centro Cuesta Nacional', rnc: '101-00155-1', email: 'bienestar@ccn-demo.com.do', phone: '809-537-5011' },
  { name: 'Laboratorios Mallén Guerra S.A.', rnc: '101-00911-1', email: 'recursoshumanos@mallen-demo.com.do', phone: '809-563-3111' },
  { name: 'Laboratorios Feltrex S.A.', rnc: '101-02941-8', email: 'rrhh@feltrex-demo.com.do', phone: '809-560-2000' },
  { name: 'Laboratorios Magnachem International', rnc: '101-65481-2', email: 'talento@magnachem-demo.com.do', phone: '809-540-3333' },
  { name: 'Corporación Zona Franca Santiago (PIISA)', rnc: '102-00561-2', email: 'administracion@czfs-demo.com.do', phone: '809-575-1000' },
  { name: 'Parque Industrial ITABO (PIISA Zona Franca)', rnc: '101-52314-7', email: 'rrhh@piisa-demo.com.do', phone: '809-957-2000' },
  { name: 'Eaton Dominicana (Haina & Santiago)', rnc: '101-08451-2', email: 'hr_dr@eaton-demo.com.do', phone: '809-957-4000' },
  { name: 'Medtronic Puerto Rico / Dominicana Operations', rnc: '130-98411-5', email: 'hr.caribbean@medtronic-demo.com.do', phone: '809-793-1000' },
  { name: 'Baxter Healthcare Dominicana', rnc: '101-09412-3', email: 'beneficios_dr@baxter-demo.com.do', phone: '809-957-3000' },
  { name: 'Johnson & Johnson Medical Caribbean Inc.', rnc: '130-88124-7', email: 'hrdr@its.jnj-demo.com.do', phone: '809-563-8000' },
  { name: 'B. Braun Medical Dominicana', rnc: '130-77412-9', email: 'rrhh@bbraun-demo.com.do', phone: '809-549-2200' },
  { name: 'Fenwal International Inc.', rnc: '101-55418-2', email: 'hr_fenwal@fresenius-demo.com.do', phone: '809-957-5500' },
  { name: 'Edwards Lifesciences AG (DR Branch)', rnc: '130-55123-8', email: 'hr_dr@edwards-demo.com.do', phone: '809-957-8800' },
  { name: 'Hanesbrands Dominicana Inc.', rnc: '101-08119-9', email: 'rrhh_hbi@hanes-demo.com.do', phone: '809-594-8111' },
  { name: 'B/E Aerospace / Collins Aerospace DR', rnc: '131-00214-5', email: 'hr_caribbean@collins-demo.com.do', phone: '809-549-9000' },
  { name: 'Consorcio Azucarero Central (CAC Barahona)', rnc: '101-88441-2', email: 'rrhh@cac-demo.com.do', phone: '809-524-2111' },
  { name: 'Consorcio Cítricos Dominicanos', rnc: '101-04128-4', email: 'citricos@ricagroup-demo.com.do', phone: '809-555-9011' },
  { name: 'Grupo Corripio (Distribuidora Corripio S.A.S.)', rnc: '101-00188-7', email: 'seguros@corripio-demo.com.do', phone: '809-227-3000' },
  { name: 'Editora Listín Diario S.A.', rnc: '101-00062-5', email: 'gestionhumana@listindiario-demo.com.do', phone: '809-686-6688' },
  { name: 'Multimedios El Caribe (CDN Canal 37)', rnc: '101-00891-2', email: 'rrhh@elcaribe-demo.com.do', phone: '809-683-8100' },
  { name: 'Grupo SIN (Noticias SIN)', rnc: '130-44129-8', email: 'administracion@noticiassin-demo.com.do', phone: '809-537-8888' },
  { name: 'Teleantillas Canal 2 S.A.S.', rnc: '101-02488-9', email: 'rrhh@teleantillas-demo.com.do', phone: '809-567-7777' },
  { name: 'Color Visión Corporación Dominicana de Radio y TV', rnc: '101-01122-1', email: 'rrhh@colorvision-demo.com.do', phone: '809-566-5876' },
  { name: 'Cervecería Vegana S.A. (Quisqueya / Malta Morena)', rnc: '101-00512-3', email: 'rrhh@cerveceriavegana-demo.com.do', phone: '809-573-2000' },
  { name: 'Font Gamundi S.A.', rnc: '102-00045-8', email: 'rrhh@fontgamundi-demo.com.do', phone: '809-573-2222' },
  { name: 'Empacadora San Antonio (Salchichas Don Pedro)', rnc: '101-04481-2', email: 'info@donpedro-demo.com.do', phone: '809-560-4444' },
  { name: 'Sigma Petroleum / Gasolineras Isla', rnc: '101-88419-5', email: 'rrhh@sigma-demo.com.do', phone: '809-540-1000' },
  { name: 'TotalEnergies Dominicana S.A.S.', rnc: '101-01419-8', email: 'hr.dr@totalenergies-demo.com.do', phone: '809-243-7000' },
  { name: 'Sol Petroleum Dominicana (Shell Licensee)', rnc: '101-00091-6', email: 'recursoshumanos@thesolgroup-demo.com.do', phone: '809-227-7700' },
  { name: 'Grupo Universal Seguros (Póliza Matriz)', rnc: '101-00388-8', email: 'rrhh@universal-demo.com.do', phone: '809-544-7100' },
  { name: 'ARS Primera de Humano S.A.', rnc: '101-88129-4', email: 'talento@primera-demo.com.do', phone: '809-476-3535' },
  { name: 'ARS Monumental S.A.', rnc: '102-01992-1', email: 'rrhh@monumental-demo.com.do', phone: '809-582-1000' },
  { name: 'Seguros Reservas S.A.', rnc: '101-81992-4', email: 'seguros_rrhh@segurosreservas-demo.com.do', phone: '809-960-7300' },
  { name: 'Asociación Cibao de Ahorros y Préstamos (ACAP)', rnc: '102-00012-5', email: 'gestionhumana@acap-demo.com.do', phone: '809-581-4433' },
  { name: 'Banco Promerica República Dominicana', rnc: '101-84192-3', email: 'rrhh@promerica-demo.com.do', phone: '809-955-2525' },
  { name: 'Banco López de Haro S.A.', rnc: '101-03912-1', email: 'rrhh@blh-demo.com.do', phone: '809-535-3000' },
  { name: 'Banco Caribe S.A.', rnc: '101-85112-9', email: 'gestionhumana@bancocaribe-demo.com.do', phone: '809-472-8888' },
  { name: 'Banco BDI S.A.', rnc: '101-01992-8', email: 'rrhh@bdi-demo.com.do', phone: '809-535-8586' },
  { name: 'Banco Ademi S.A.', rnc: '101-81492-2', email: 'talento@bancoademi-demo.com.do', phone: '809-683-0203' },
  { name: 'Banco Adopem S.A.', rnc: '101-86491-1', email: 'rrhh@adopem-demo.com.do', phone: '809-563-3939' },
  { name: 'Cooperativa Médica de Santiago (COOPMEDICA)', rnc: '402-00124-1', email: 'rrhh@coopmedica-demo.com.do', phone: '809-582-4111' },
  { name: 'Cooperativa Nacional de Maestros (COOPNAMA)', rnc: '401-00214-2', email: 'seguros@coopnama-demo.com.do', phone: '809-688-6677' },
  { name: 'Cooperativa Vega Real Inc.', rnc: '402-00441-9', email: 'colectivos@cvr-demo.com.do', phone: '809-573-6111' },
  { name: 'Cooperativa San José Inc.', rnc: '402-00812-3', email: 'rrhh@coopsanjose-demo.com.do', phone: '809-570-5111' },
  { name: 'Cooperativa La Altagracia Inc. (Santiago)', rnc: '402-00188-7', email: 'rrhh@cla-demo.com.do', phone: '809-581-2244' },
  { name: 'Cooperativa Maimón (COOPMAIMON)', rnc: '402-00991-5', email: 'gestionhumana@coopmaimon-demo.com.do', phone: '809-551-2233' },
  { name: 'Asociación Médica Dominicana SRL', rnc: '131-88492-1', email: 'rrhh@asociacionmedica-demo.com.do', phone: '809-555-0192' },
  { name: 'Colegio Dominicano de Ingenieros, Arquitectos y Agrimensores (CODIA)', rnc: '401-00511-9', email: 'seguros@codia-demo.com.do', phone: '809-688-6611' },
  { name: 'Colegio de Abogados de la República Dominicana (CARD)', rnc: '401-00781-4', email: 'rrhh@card-demo.com.do', phone: '809-689-0111' },
  { name: 'Colegio Dominicano de Periodistas (CDP)', rnc: '401-00911-2', email: 'secretaria@cdp-demo.com.do', phone: '809-535-4444' },
  { name: 'Colegio Médico Dominicano (CMD Sede Central)', rnc: '401-00041-8', email: 'seguros@cmd-demo.com.do', phone: '809-533-4181' },
  { name: 'Asociación Dominicana de Profesores (ADP)', rnc: '401-00099-2', email: 'rrhh@adp-demo.com.do', phone: '809-688-6644' },
  { name: 'Pontificia Universidad Católica Madre y Maestra (PUCMM)', rnc: '401-00122-8', email: 'gestionhumana@pucmm-demo.edu.do', phone: '809-580-1962' },
  { name: 'Instituto Tecnológico de Santo Domingo (INTEC)', rnc: '401-00445-9', email: 'rrhh@intec-demo.edu.do', phone: '809-567-9271' },
  { name: 'Universidad Iberoamericana (UNIBE)', rnc: '401-01491-1', email: 'talento@unibe-demo.edu.do', phone: '809-689-4111' },
  { name: 'Universidad Nacional Pedro Henríquez Ureña (UNPHU)', rnc: '401-00155-7', email: 'rrhh@unphu-demo.edu.do', phone: '809-562-6601' },
  { name: 'Universidad APEC (UNAPEC)', rnc: '401-00812-6', email: 'gestionhumana@unapec-demo.edu.do', phone: '809-686-0021' },
  { name: 'Hospital General de la Plaza de la Salud', rnc: '401-04912-3', email: 'rrhh@hgps-demo.org.do', phone: '809-565-7477' },
  { name: 'Centro de Diagnóstico, Medicina Avanzada y Telemedicina (CEDIMAT)', rnc: '401-04811-9', email: 'talento@cedimat-demo.net', phone: '809-565-9989' },
  { name: 'Clínica Abreu S.A.S.', rnc: '101-00812-4', email: 'rrhh@clinicaabreu-demo.com.do', phone: '809-688-4411' },
  { name: 'Centro Médico Real S.A.', rnc: '101-03991-5', email: 'rrhh@centromedicoreal-demo.com.do', phone: '809-537-8800' },
  { name: 'Centro Médico Abel González', rnc: '101-02491-9', email: 'recursoshumanos@abelgonzalez-demo.com.do', phone: '809-227-2235' },
  { name: 'Hospital Metropolitano de Santiago (HOMS)', rnc: '102-04912-8', email: 'talento@homs-demo.com.do', phone: '809-241-2222' },
  { name: 'Clínica Corominas S.A. (Santiago)', rnc: '102-00441-2', email: 'rrhh@corominas-demo.com.do', phone: '809-580-1111' },
  { name: 'Unión Médica del Norte S.A. (Santiago)', rnc: '102-03912-7', email: 'rrhh@unionmedica-demo.com.do', phone: '809-226-8686' },
  { name: 'Grupo Mejia Arcalá S.A. (Leche Milex)', rnc: '101-00192-5', email: 'rrhh@mejiarcala-demo.com.do', phone: '809-541-1111' },
  { name: 'Grupo Viamar S.A. (Ford / Kia / Mazda)', rnc: '101-00841-3', email: 'talento@viamar-demo.com.do', phone: '809-565-3121' },
  { name: 'Grupo Santo Domingo Motors C. por A. (Chevrolet / Nissan / Suzuki)', rnc: '101-00092-4', email: 'rrhh@sdm-demo.com.do', phone: '809-540-3800' },
  { name: 'Agencia Bella C. por A. (Honda)', rnc: '101-00244-1', email: 'recursoshumanos@honda-demo.com.do', phone: '809-541-7721' },
  { name: 'Euromotors S.A. / Autozama (Mercedes-Benz)', rnc: '101-01912-9', email: 'rrhh@autozama-demo.com.do', phone: '809-565-6677' },
  { name: 'Delta Comercial S.A. (Toyota / Lexus)', rnc: '101-00081-1', email: 'beneficios@deltacomercial-demo.com.do', phone: '809-620-3000' },
  { name: 'Ferretería Americana C. por A.', rnc: '101-00111-8', email: 'rrhh@americana-demo.com.do', phone: '809-565-5555' },
  { name: 'Ferretería Ochoa S.A. (Santiago / Sto. Dgo.)', rnc: '102-00055-7', email: 'talento@ochoa-demo.com.do', phone: '809-971-8000' },
  { name: 'Ferretería Bellón S.A. (Santiago)', rnc: '102-00088-2', email: 'rrhh@bellon-demo.com.do', phone: '809-582-3151' },
  { name: 'Ferretería Cuesta S.A.S.', rnc: '101-00155-9', email: 'rrhh@cuestahogar-demo.com.do', phone: '809-472-2000' },
  { name: 'IKEA Dominicana (Sarton Dominicana S.A.S.)', rnc: '130-19941-2', email: 'rrhh@ikea-demo.com.do', phone: '809-567-4532' },
  { name: 'PriceSmart Dominicana S.A. (Santo Domingo / Santiago)', rnc: '101-81412-8', email: 'hr_dr@pricesmart-demo.com.do', phone: '809-227-2400' },
  { name: 'Hipermercados Olé S.A.S.', rnc: '101-88412-6', email: 'gestionhumana@ole-demo.com.do', phone: '809-598-1111' },
  { name: 'Hipermercados Carrefour Santo Domingo (Grandes Superficies)', rnc: '101-81912-2', email: 'rrhh@carrefour-demo.com.do', phone: '809-412-2333' },
  { name: 'Supermercados Bravo S.A.', rnc: '101-85412-1', email: 'talento@superbravo-demo.com.do', phone: '809-567-2728' },
  { name: 'Supermercados Nacional (CCN)', rnc: '101-00155-3', email: 'seguros@nacional-demo.com.do', phone: '809-537-5011' },
  { name: 'Supermercados Jumbo (CCN)', rnc: '101-00155-4', email: 'beneficios@jumbo-demo.com.do', phone: '809-537-5011' },
  { name: 'Cervecería Vegana S.A.', rnc: '101-00512-3', email: 'rrhh@cerveceriavegana-demo.com.do', phone: '809-573-2000' },
  { name: 'La Famosa (Agroindustrial Peravia C. por A.)', rnc: '101-00141-9', email: 'rrhh@lafamosa-demo.com.do', phone: '809-565-1515' },
  { name: 'Goya Santo Domingo S.A.', rnc: '101-00288-4', email: 'rrhh@goyado-demo.com.do', phone: '809-568-2111' },
  { name: 'Molinos del Ozama S.A.S. (Molinera Central)', rnc: '101-00019-6', email: 'seguros@molinosdelozama-demo.com.do', phone: '809-594-1111' },
  { name: 'Molinos Modernos S.A. (Harina Blanquita / Galletas Hatuey)', rnc: '101-81499-1', email: 'hr_dr@molinosmodernos-demo.com.do', phone: '809-598-2000' },
  { name: 'Frito Lay Dominicana S.A. / PepsiCo Foods', rnc: '101-02412-7', email: 'rrhh@pepsico-demo.com.do', phone: '809-560-1200' },
  { name: 'Bavaro Runners S.A. / Nexus Tours DR', rnc: '130-99412-4', email: 'rrhh@runnersadventures-demo.com.do', phone: '809-455-1100' },
  { name: 'Aerodom (Aeropuertos Dominicanos Siglo XXI S.A.)', rnc: '101-81992-9', email: 'talento@aerodom-demo.com.do', phone: '809-947-2222' },
  { name: 'Hard Rock Hotel & Casino Punta Cana (Palace Resorts)', rnc: '130-77841-2', email: 'rrhh@hardrockhotelpuntacana-demo.com.do', phone: '809-687-0000' },
  { name: 'Barceló Bávaro Grand Resort', rnc: '101-08491-7', email: 'bavaro.rrhh@barcelo-demo.com.do', phone: '809-686-5797' },
  { name: 'Meliá Hotels International Punta Cana', rnc: '101-84199-6', email: 'melia.rrhh@melia-demo.com.do', phone: '809-221-1290' },
  { name: 'Bahia Principe Hotels & Resorts DR', rnc: '130-44912-1', email: 'rrhh.dr@bahia-principe-demo.com.do', phone: '809-552-1444' },
];

const BROKERS_DATA = [
  { name: 'Franco & Acra Seguros Marsh', email: 'cuentas.corporativas@marsh-demo.com.do' },
  { name: 'Peña Izquierdo Corredores de Seguros', email: 'colectivos@penaizquierdo-demo.com.do' },
  { name: 'Ros Seguros & Consultoría', email: 'renovaciones@ros-demo.com.do' },
  { name: 'Proyecciones Seguros S.A.', email: 'gestion@proyecciones-demo.com.do' },
  { name: 'Del Toro & Asociados Corredores', email: 'corporativo@deltoro-demo.com.do' },
  { name: 'Garrigó Reasesores & Corredores', email: 'contacto@garrigo-demo.com.do' },
  { name: 'Kramer & Kramer Seguros', email: 'servicio@kramer-demo.com.do' },
  { name: 'C&C Seguros y Fianzas', email: 'cuentas@cycseguros-demo.com.do' },
  { name: 'Carvajal & Polanco Corredores', email: 'info@carvajalpolanco-demo.com.do' },
  { name: 'Seguros Directos Universal (Canal Interno)', email: 'directo@universal-demo.com.do' },
];

const SUPERVISORS_DATA = [
  { name: 'Lic. Mariana Valdez', email: 'mvaldez@universal-demo.com.do' },
  { name: 'Ing. Carlos Mendoza', email: 'cmendoza@universal-demo.com.do' },
  { name: 'Lic. Roberto Almonte', email: 'ralmonte@universal-demo.com.do' },
  { name: 'Lic. Laura Patricia Henríquez', email: 'lhenriquez@universal-demo.com.do' },
  { name: 'Ing. Fernando Castillo', email: 'fcastillo@universal-demo.com.do' },
  { name: 'Lic. Carmen Josefina Díaz', email: 'cdiaz@universal-demo.com.do' },
];

// Generate 112 clean, realistic Policy Renewal records strictly for August, September, October 2026:
function generateInitialPolicies(): PolicyRenewal[] {
  const policiesList: PolicyRenewal[] = [];

  // Dates pool for Agosto, Septiembre, Octubre 2026
  const augustDates = [
    '2026-08-01', '2026-08-05', '2026-08-10', '2026-08-12', '2026-08-15', 
    '2026-08-18', '2026-08-20', '2026-08-25', '2026-08-28', '2026-08-30', '2026-08-31'
  ];
  const septemberDates = [
    '2026-09-01', '2026-09-03', '2026-09-05', '2026-09-10', '2026-09-12', 
    '2026-09-15', '2026-09-18', '2026-09-20', '2026-09-22', '2026-09-25', '2026-09-28', '2026-09-30'
  ];
  const octoberDates = [
    '2026-10-01', '2026-10-04', '2026-10-05', '2026-10-08', '2026-10-10', 
    '2026-10-12', '2026-10-15', '2026-10-18', '2026-10-20', '2026-10-22', '2026-10-25', '2026-10-28', '2026-10-31'
  ];

  const allMonthsDates = [...augustDates, ...septemberDates, ...octoberDates];

  const totalRecords = 115;

  for (let i = 0; i < totalRecords; i++) {
    const client = CLIENT_NAMES_DATA[i % CLIENT_NAMES_DATA.length];
    const planCoverage = PLANS_AND_COVERAGES_FROM_IMAGE[i % PLANS_AND_COVERAGES_FROM_IMAGE.length];
    const broker = BROKERS_DATA[i % BROKERS_DATA.length];
    const supervisor = SUPERVISORS_DATA[i % SUPERVISORS_DATA.length];
    const renewalDate = allMonthsDates[i % allMonthsDates.length];

    // Compute vigencias (1 year prior to renewal date)
    const [yearStr, monthStr, dayStr] = renewalDate.split('-');
    const prevYear = (parseInt(yearStr, 10) - 1).toString();
    const vigenciaDesde = `${prevYear}-${monthStr}-${dayStr}`;
    const vigenciaHasta = renewalDate;

    // Policy Number formatting
    const policyNumberSeq = (1001 + i).toString().padStart(4, '0');
    const numeroPoliza = `GXP-2026-${policyNumberSeq}`;

    // Insured Headcount & Premiums calculation
    const baseInsuredCounts = [25, 48, 85, 120, 240, 350, 480, 620, 850, 1100, 1450, 2200];
    const cantidadAsegurados = baseInsuredCounts[i % baseInsuredCounts.length] + ((i * 7) % 35);
    
    // Base monthly rate per insured RD$ 95 to RD$ 220 depending on coverage type
    const ratePerHead = planCoverage.codCobert === 'RP' ? 180 : (planCoverage.codCobert === 'GE' ? 145 : 110);
    const tarifaMensualCalculada = Math.round(cantidadAsegurados * ratePerHead);
    const tarifaAnualCalculada = tarifaMensualCalculada * 12;

    // Specific scenarios for the 6 technical validation rules:
    // 1. Correo del cliente faltante o inválido
    const isMissingClientEmail = i === 19 || i === 63;
    // 2. Correo del intermediario faltante
    const isMissingBrokerEmail = i === 11 || i === 54;
    // 3. Correo del supervisor faltante
    const isMissingSupervisorEmail = i === 27 || i === 89;
    // 4. Control de clientes (lista negra / OFAC / PEP)
    const isBlacklistMatch = i === 15 || i === 70;
    // 5. Saldo pendiente en Core ACSEL
    const hasPendingBalance = i === 7 || i === 47;
    // 6. Nueva prima a renovar sea menor que la anterior
    const isDiscountRate = i === 5 || i === 42;
    const isManualException = i === 14 || i === 77;

    const initialPercent = isDiscountRate ? -5 : (isManualException ? 8.5 : 0);
    const calculatedRenovadaAnual = isDiscountRate ? Math.round(tarifaAnualCalculada * 0.95) : tarifaAnualCalculada;
    const calculatedRenovadaMensual = Math.round(calculatedRenovadaAnual / 12);

    const coverageFullName = `${planCoverage.plan} (${planCoverage.codCobert})`;

    const tempPolicy: PolicyRenewal = {
      id: `pol-${(i + 1).toString().padStart(3, '0')}`,
      idProducto: 'prod-gxp',
      productoCodigo: 'GEXP',
      productoNombre: 'ULTIMOS GASTOS PLUS',
      codProd: 'GEXP',
      descProd: 'ULTIMOS GASTOS PLUS',
      descPlanProd: planCoverage.plan,
      codCobert: planCoverage.codCobert,
      descCobert: planCoverage.descCobert,
      numeroPoliza,
      contratante: client.name,
      tipoDocumentoContratante: 'RNC',
      tipoDocumento: 'RNC',
      documentoContratante: client.rnc,
      correoCliente: isMissingClientEmail ? '' : client.email,
      telefonoCliente: client.phone,
      corredor: broker.name,
      nombreCorredor: broker.name,
      correoCorredor: isMissingBrokerEmail ? '' : broker.email,
      supervisorNegocio: supervisor.name,
      correoSupervisor: isMissingSupervisorEmail ? '' : supervisor.email,
      cobertura: coverageFullName,
      fechaRenovacion: renewalDate,
      vigenciaDesde,
      vigenciaHasta,
      cantidadAsegurados,
      
      tarifaActualAnual: tarifaAnualCalculada,
      tarifaActualMensual: tarifaMensualCalculada,
      tarifaRenovacionAnual: calculatedRenovadaAnual,
      tarifaRenovacionMensual: calculatedRenovadaMensual,
      
      tarifaActual: {
        tarifaAnual: tarifaAnualCalculada,
        tarifaMensual: tarifaMensualCalculada,
      },
      tarifaRenovacion: {
        tarifaAnual: calculatedRenovadaAnual,
        tarifaMensual: calculatedRenovadaMensual,
      },
      
      porcentajeIncremento: initialPercent,
      esExcepcionIndividual: isManualException || isDiscountRate,
      esExcepcionManual: isManualException || isDiscountRate,
      motivoExcepcion: isDiscountRate ? 'Ajuste comercial con reducción de prima' : (isManualException ? 'Ajuste por siniestralidad colectiva negociada con el corredor' : undefined),
      
      saldoPendiente: hasPendingBalance ? 84500 : 0,
      enListaNegra: isBlacklistMatch,
      
      estado: 'Pendiente',
      erroresValidacion: [],
      
      debidaDiligencia: {
        tipoDocumento: 'Cédula',
        consultaListas: isBlacklistMatch ? 'Coincidencia con Listas de Control' : 'No está en las listas ONU/OFAC/UNIVERSAL',
        clasificacion: isBlacklistMatch ? 'Requiere Debida Diligencia Ampliada' : 'Clasifica para Debida Diligencia simplificada',
        fechaConsulta: '2026-08-11',
        usuarioConsulta: 'demo.suscripcion@universal-demo.com.do',
        canalOrigen: 'ACSEL Core',
      },

      comunicacion: (i % 11 === 0 && !isMissingClientEmail) ? {
        enviada: true,
        fechaEnvio: '2026-08-31 09:00',
        usuarioEnvio: 'demo.suscripcion@universal-demo.com.do',
        destinatarioPrincipal: client.email,
        destinatariosCopia: [broker.email, supervisor.email],
        asunto: `Aviso Importante: Actualización y Renovación de Póliza GXP #${numeroPoliza} - ${client.name}`,
        estadoEnvio: 'Enviado',
      } : {
        enviada: false,
        estadoEnvio: 'Pendiente',
      },

      procesamiento: {
        procesado: false,
      }
    };

    // Calculate validation errors using the 6 technical rules
    const computedErrors = validateSinglePolicy(tempPolicy);
    tempPolicy.erroresValidacion = computedErrors;
    if (computedErrors.some(e => e.severidad === 'Bloqueante')) {
      tempPolicy.estado = 'Error';
    } else if (tempPolicy.comunicacion?.enviada) {
      tempPolicy.estado = 'Notificado';
    } else if (i % 6 === 0) {
      tempPolicy.estado = 'Validado';
    }

    policiesList.push(tempPolicy);
  }

  return policiesList;
}

export const INITIAL_POLICIES: PolicyRenewal[] = generateInitialPolicies();

export const INITIAL_EMAIL_TEMPLATE: EmailTemplate = {
  id: 'tpl-renovacion-gxp-std',
  nombre: 'Notificación Estándar de Renovación Masiva GXP',
  asunto: 'Aviso de Renovación - Póliza: {NUM_POLIZA} - {CONTRATANTE}',
  cuerpo: `{FECHA_DOCUMENTO}
Santo Domingo, D.N.

Señores:
{CONTRATANTE}
Póliza: {NUM_POLIZA}

Reciba un cordial saludo de parte de Seguros Universal y nuestro agradecimiento por la confianza depositada en nosotros para brindarle tranquilidad y seguridad a través de nuestras soluciones de seguros.

Con el objetivo de mantener y mejorar el nivel de satisfacción de nuestros clientes con los servicios de {PRODUCTO_NOMBRE}, tenemos a bien comunicarle que, en su próxima renovación efectivo al {FECHA_RENOVACION}, la tarifa de su plan será de RD$ {TARIFA_RENOV_MENSUAL} + impuestos, correspondiente a su modalidad de pago {MODALIDAD_PAGO}. Este ajuste responde al incremento de precios que han experimentado los servicios vinculados a este producto.

Deseamos recordarle que usted cuenta con el más completo servicio funerario y de exequias (cementerio), diseñado para brindarle tranquilidad y respaldo en momentos difíciles. Nos encargamos de cubrir todos los trámites y pagos que implica llevar a un ser querido a su última morada, además de proporcionarle cobertura en asistencia emocional y psicológica en temas de duelo para los miembros del núcleo familiar.

Si desea recibir más información o tiene alguna inquietud, no dude en ponerse en contacto con su Ejecutivo de Negocios o Intermediario, o bien a través de nuestro Centro de Atención Telefónica al 809-544-7111. También puede comunicarse desde el exterior sin cargos al 877-239-5430.

Agradecemos nuevamente su confianza y reafirmamos nuestro compromiso de seguir ofreciéndole los productos más completos e innovadores, siempre con el respaldo que usted merece.

Cordialmente,
Seguros Universal`,
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-08-31 08:30:12',
    usuario: 'demo.suscripcion@universal-demo.com.do',
    accion: 'CONSULTA',
    valorAnterior: 'Filtro Inicial',
    valorNuevo: 'Producto: GEXP | Vigencia: Agosto - Octubre 2026',
    detalle: 'Consulta inicial de cartera de renovaciones masivas GXP cargada con éxito (115 pólizas activas en Agosto, Septiembre y Octubre 2026).',
    origen: 'Portal Web GXP',
  },
  {
    id: 'aud-002',
    timestamp: '2026-08-31 08:32:45',
    usuario: 'demo.suscripcion@universal-demo.com.do',
    accion: 'DEBIDA_DILIGENCIA_CONSULTA',
    polizaId: 'pol-001',
    numeroPoliza: 'GXP-2026-1001',
    valorAnterior: 'Pendiente',
    valorNuevo: 'No está en las listas ONU/OFAC/UNIVERSAL',
    detalle: 'Verificación automática de Debida Diligencia Simplificada sobre RNC 101-01063-2.',
    origen: 'ACSEL Core',
  },
];

export const INITIAL_COMPLIANCE_RUNS: ComplianceMassRun[] = [
  {
    id: 'run-001',
    numeroCorrida: 'CORR-2026-0881',
    fechaHora: '2026-08-31 08:15:00',
    usuario: 'demo.suscripcion@universal-demo.com.do',
    area: 'Cumplimiento',
    motivo: 'Verificación Trimestral de Cartera GXP contra Listas OFAC y ONU (Agosto, Septiembre, Octubre 2026)',
    nombreArchivo: 'Cartera_GXP_Q3_Q4_Universal.xlsx',
    totalCargados: 115,
    totalProcesados: 115,
    totalCoincidencias: 8,
    totalSinCoincidencias: 107,
    totalErrores: 0,
    registros: [
      {
        nombre: 'BIANCA JOVINE GUZMAN',
        tipoDocumento: 'Cédula',
        numeroDocumento: '00116822461',
        consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
        clasificacion: 'Clasifica para Debida Diligencia simplificada',
        fecha: '11/08/2026',
        usuarioConsulta: 'demo.suscripcion@universal-demo.com.do',
        tipoConsulta: 'Masiva',
      },
      {
        nombre: 'BERGIS LUCIA GARCIA ACOSTA',
        tipoDocumento: 'Cédula',
        numeroDocumento: '03700779279',
        consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
        clasificacion: 'Clasifica para Debida Diligencia simplificada',
        fecha: '11/08/2026',
        usuarioConsulta: 'demo.suscripcion@universal-demo.com.do',
        tipoConsulta: 'Masiva',
      },
      {
        nombre: 'KATHIA ESMERALDINA OLIVERO RODRIGUEZ',
        tipoDocumento: 'Cédula',
        numeroDocumento: '40219198708',
        consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
        clasificacion: 'Clasifica para Debida Diligencia simplificada',
        fecha: '11/08/2026',
        usuarioConsulta: 'demo.suscripcion@universal-demo.com.do',
        tipoConsulta: 'Masiva',
      },
      {
        nombre: 'DIEGO ARISMENDY REYES GONZALEZ',
        tipoDocumento: 'Cédula',
        numeroDocumento: '40232988036',
        consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
        clasificacion: 'Clasifica para Debida Diligencia simplificada',
        fecha: '11/08/2026',
        usuarioConsulta: 'demo.suscripcion@universal-demo.com.do',
        tipoConsulta: 'Masiva',
      },
      {
        nombre: 'PIERRE DUPONT',
        tipoDocumento: 'Pasaporte',
        numeroDocumento: 'PA9938472',
        consultaListas: 'No está en las listas ONU/OFAC/UNIVERSAL',
        clasificacion: 'Clasifica para Debida Diligencia simplificada',
        fecha: '11/08/2026',
        usuarioConsulta: 'demo.suscripcion@universal-demo.com.do',
        tipoConsulta: 'Masiva',
      },
    ],
  },
];

// Standard Aliases
export const initialProducts = INITIAL_PRODUCTS;
export const initialMockPolicies = INITIAL_POLICIES;
export const initialEmailTemplate = INITIAL_EMAIL_TEMPLATE;
export const initialAuditLogs = INITIAL_AUDIT_LOGS;
export const initialComplianceRuns = INITIAL_COMPLIANCE_RUNS;
