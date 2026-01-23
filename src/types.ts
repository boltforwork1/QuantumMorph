export interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  options?: string[];
  isResult?: boolean;
}

export interface WizardState {
  user_type?: 'researcher' | 'industrial' | 'student';
  knowsMoisture?: boolean;
  moisture?: number;
  category?: 'agricultural' | 'biomass' | 'plastic' | 'mixed';
  material_name?: string;
  mass?: number;
  processing_goal?: 'raw_biochar' | 'activated_carbon' | 'composite_filter';
  optimization_goal?: 'max_co2' | 'balanced' | 'max_stability';
  activation?: {
    method: 'chemical' | 'physical';
    agent?: 'HCl' | 'KOH' | 'H3PO4';
    concentration?: number | 'auto';
  } | null;
  composite?: {
    strategy: 'manual' | 'auto';
  } | null;
  num_trials?: number;
}

export interface APIRequest {
  user_type: string;
  category: string;
  material_name: string;
  mass: number;
  processing_goal: string;
  optimization_goal: string;
  activation: {
    method: string;
    agent?: string;
    concentration?: number | string;
  } | null;
  composite: {
    strategy: string;
  } | null;
  moisture: number;
  num_trials: number;
}

export interface APIResponse {
  material: {
    name: string;
    category: string;
    moisture: number;
    mass: number;
  };
  process_plan: {
    pyrolysis: {
      temperature: number;
      duration: number;
      heating_rate: number;
    };
    activation?: {
      method: string;
      agent?: string;
      concentration?: number | string;
      temperature?: number;
      duration?: number;
    };
    composite?: {
      strategy: string;
      matrix?: string;
      ratio?: string;
    };
  };
  predicted_performance: {
    co2_adsorption: number;
    stability_score: number;
    confidence: number;
  };
  risk_assessment: {
    technical_risk: string;
    recommendation: string;
  };
  scientific_explanation: string;
}
