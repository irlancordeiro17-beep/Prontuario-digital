// ============================================================
// Prontuário Social — TypeScript Types
// Isolated project — no CaptaRH / Pulso Cultural / SeOri
// ============================================================

export type Role = 'admin' | 'gestor' | 'agente_saude'

export type Sex = 'M' | 'F'

export type ClinicalStatus =
  | 'em_acompanhamento'
  | 'controlado'
  | 'psicossocial'
  | 'inativo'

export type PrescriptionStatus = 'ativo' | 'suspenso' | 'concluido'

export type InterventionStatus =
  | 'aberto'
  | 'em_andamento'
  | 'suspenso'
  | 'concluido'

export type AlertSeverity = 'baixo' | 'medio' | 'alto' | 'critico'

export type VulnerabilityCategory =
  | 'baixo'
  | 'medio'
  | 'moderado_alto'
  | 'critico'

// ============================================================
// USER
// ============================================================

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  ubs?: string
}

export interface SessionUser extends AuthUser {
  accessToken?: string
}

// ============================================================
// CITIZEN
// ============================================================

export interface Citizen {
  id: string
  cns: string
  cpf: string
  name: string
  sex: Sex
  dateOfBirth: string // ISO date
  age: number
  ubs: string
  territory?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CitizenSummary extends Citizen {
  vulnerabilityScore?: VulnerabilityScore
  lastVisit?: string
  consultationsPerYear?: number
}

// ============================================================
// CLINICAL
// ============================================================

export interface ClinicalEntry {
  id: string
  citizenId: string
  cid10: string
  diagnosis: string
  diagnosedAt: string // ISO date
  status: ClinicalStatus
  notes?: string
}

export interface Prescription {
  id: string
  citizenId: string
  medication: string
  dosage: string
  frequency: string
  route: string
  status: PrescriptionStatus
}

// ============================================================
// SOCIAL DETERMINANTS
// ============================================================

export interface SocialRecord {
  id: string
  citizenId: string
  housingQuality: number      // 0-100
  monthlyIncome: number       // R$
  sanitationLevel: number     // 1-5
  foodSecurity: number        // 1-5
  educationLevel?: string
  employmentStatus?: string
  notes?: string
  updatedAt: string
}

// ============================================================
// VULNERABILITY SCORE
// ============================================================

export interface VulnerabilityScore {
  id: string
  citizenId: string
  score: number               // 0-100
  category: VulnerabilityCategory
  factors: VulnerabilityFactors
  calculatedAt: string
}

export interface VulnerabilityFactors {
  housingQuality: number
  incomeNormalized: number
  sanitationNormalized: number
  foodSecurityNormalized: number
}

// ============================================================
// VISITS
// ============================================================

export type VisitType = 'domiciliar' | 'consultorio' | 'remoto'

export interface VisitRecord {
  id: string
  citizenId: string
  workerId: string
  workerName?: string
  type: VisitType
  date: string
  notes?: string
}

// ============================================================
// INTERVENTIONS
// ============================================================

export interface FollowUp {
  date: string
  note: string
  workerId: string
  workerName?: string
}

export interface Intervention {
  id: string
  citizenId: string
  citizenName?: string
  workerId: string
  workerName?: string
  title: string
  plan: string
  status: InterventionStatus
  followUps: FollowUp[]
  createdAt: string
  updatedAt: string
}

// ============================================================
// RISK
// ============================================================

export interface RiskAlert {
  id: string
  citizenId: string
  citizenName?: string
  severity: AlertSeverity
  category: 'clinico' | 'social' | 'territorial'
  description: string
  resolvedAt?: string
  createdAt: string
}

// ============================================================
// TERRITORY
// ============================================================

export interface Territory {
  id: string
  name: string
  city: string
  state: string
  geometry?: GeoJSON
  riskScore?: number
  citizenCount?: number
}

export interface GeoJSON {
  type: string
  coordinates: number[][][]
}

// ============================================================
// ANALYTICS (Manager)
// ============================================================

export interface PopulationMetrics {
  totalCitizens: number
  activeInterventions: number
  openAlerts: number
  criticalCitizens: number
  visitsThisMonth: number
  avgVulnerabilityScore: number
}

export interface RiskDistribution {
  baixo: number
  medio: number
  moderado_alto: number
  critico: number
}

export interface DSSMetric {
  category: string
  avgScore: number
  trend: 'up' | 'down' | 'stable'
}

// ============================================================
// API RESPONSES
// ============================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ============================================================
// FORMS
// ============================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface CitizenSearchFilters {
  query: string        // CNS ou CPF
  ubs?: string
  territory?: string
  vulnerabilityMin?: number
  vulnerabilityMax?: number
}

export interface VisitFormData {
  citizenId: string
  type: VisitType
  date: string
  notes?: string
}

export interface InterventionFormData {
  citizenId: string
  title: string
  plan: string
}

export interface FollowUpFormData {
  interventionId: string
  note: string
  date: string
}
