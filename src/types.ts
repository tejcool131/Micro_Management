export interface Financials {
  estimatedMonthlyRevenue: number;
  estimatedMonthlyExpenses: number;
  estimatedEbitda: number;
  debtToEquityRatio: number;
  existingDebtObligations: string;
  hasPaperLedger: boolean;
  currencySymbol?: string;
}

export interface AlternativeBehavioralMetrics {
  repayReliabilityIndicator: string;
  characterScore: number;
  growthPotentialScore: number;
  familySupportSystemScore: number;
  climateVulnerabilityScore: number;
}

export interface InsuranceFit {
  recommendedProduct: string;
  premiumEstimate: string;
  triggerConditions: string;
}

export interface EmpatheticCounseling {
  toneExplanation: string;
  actionableSteps: string[];
  localizedTalkTrack: string;
}

export interface AssessmentRecord {
  id: string;
  clientName: string;
  sector: string;
  region: string;
  notes: string;
  financials: Financials;
  alternativeBehavioralMetrics: AlternativeBehavioralMetrics;
  creditViabilityScore: number;
  decision: "Approved" | "Pre-Approved with Conditions" | "Referred to Insurance" | "Rejected" | string;
  insuranceFit: InsuranceFit;
  empatheticCounseling: EmpatheticCounseling;
  createdAt: string;
}

export interface DictationTemplate {
  name: string;
  sector: string;
  region: string;
  notes: string;
  badge: string;
}
