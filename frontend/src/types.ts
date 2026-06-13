export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  image?: string;
  imageType?: string;
}

export interface LocationTelemetry {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
  mode: "gps" | "mock";
}

export interface SamaritanReport {
  incident_time: string;
  location: string;
  witness_summary: string;
  actions_taken: string[];
  vehicles_involved: string;
  injuries_observed: string;
  emergency_services_called: boolean;
  legal_note: string;
}

export interface EmergencyStep {
  step: number;
  title: string;
  alertLvl: "severe" | "warning" | "info" | "success";
  instruction: string;
  criticalDo: string;
  criticalDont: string;
  legalImmunityRef: string;
  titleHindi?: string;
  instructionHindi?: string;
  titleMarathi?: string;
  instructionMarathi?: string;
}
