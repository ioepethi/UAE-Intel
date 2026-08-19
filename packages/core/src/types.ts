// @uae-intel/core — shared domain types
// Mirrors §11 DATABASE STRUCTURE of the UAE Intelligence master prompt.

export type Confidence = number; // 0–100

export type SourceType =
  | "official" // A — government/registry/regulatory
  | "company" // B — company-controlled (website, press release)
  | "publication" // C — reputable publication/news
  | "database" // D — secondary database
  | "unverified"; // E — low-confidence

export type Reliability = "A" | "B" | "C" | "D" | "E";

export type ContactVerification =
  | "VERIFIED"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNKNOWN";

export type ContactClassification = "public" | "private";

export type ContactType =
  | "professional_email"
  | "company_email"
  | "executive_email"
  | "business_phone"
  | "switchboard"
  | "office_phone"
  | "contact_page"
  | "linkedin"
  | "company_linkedin"
  | "professional_social"
  | "executive_assistant"
  | "website";

export type Emirate =
  | "Dubai"
  | "Abu Dhabi"
  | "Sharjah"
  | "Ajman"
  | "Ras Al Khaimah"
  | "Fujairah"
  | "Umm Al Quwain";

export type Position =
  | "CEO"
  | "Founder"
  | "Owner"
  | "Director"
  | "Managing Director"
  | "Chairman"
  | "Partner"
  | "Investor"
  | "Executive"
  | "Other";

export type Industry =
  | "Real estate"
  | "Construction"
  | "Finance"
  | "Technology"
  | "Healthcare"
  | "Hospitality"
  | "Retail"
  | "Manufacturing"
  | "Logistics"
  | "Energy"
  | "Professional services"
  | "Other";

export type ResearchDepth = "QUICK" | "STANDARD" | "DEEP" | "DUE DILIGENCE";

export interface Source {
  id?: number;
  url: string;
  name: string;
  source_type: SourceType;
  reliability: Reliability;
  date_accessed: string; // ISO date
  confirms: string; // what this source confirms
}

export interface Person {
  id?: number;
  full_name: string;
  name_variations: string[];
  current_title: string | null;
  location: string | null;
  linkedin_url: string | null;
  confidence_score: Confidence;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id?: number;
  legal_name: string;
  trading_name: string | null;
  website: string | null;
  domain: string | null;
  industry: Industry | null;
  emirate: Emirate | null;
  location: string | null;
  confidence_score: Confidence;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id?: number;
  person_id: number;
  company_id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  source_id: number;
  confidence: Confidence;
}

export interface Contact {
  id?: number;
  person_id: number | null;
  company_id: number | null;
  type: ContactType;
  value: string;
  classification: ContactClassification;
  source_id: number;
  verification: ContactVerification;
  confidence: Confidence;
  last_verified: string; // ISO date
}

export interface Relationship {
  id?: number;
  person_id: number;
  related_person_id: number | null;
  related_company_id: number | null;
  relationship_type: string;
  source_id: number;
  confidence: Confidence;
}

// Research-engine intermediate types

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source_type: SourceType;
  reliability: Reliability;
}

export interface IdentityCandidate {
  person: Partial<Person>;
  sources: Source[];
  supporting_evidence: string[];
  potential_issues: string[];
  confidence: Confidence;
}

export interface ContactCandidate {
  type: ContactType;
  value: string;
  classification: ContactClassification;
  verification: ContactVerification;
  confidence: Confidence;
  source: Source;
}

export interface ConflictRecord {
  claim: string;
  sources: { source: Source; position: string }[];
  assessment: string;
  conclusion: string;
}

export interface ResearchReport {
  identity: {
    name: string;
    current_position: string | null;
    company: string | null;
    location: string | null;
    identity_confidence: Confidence;
  };
  executive_summary: string;
  professional_profile: {
    linkedin: string | null;
    website: string | null;
    current_role: string | null;
    previous_roles: string[];
    professional_background: string;
  };
  companies: {
    current: string[];
    previous: string[];
    directorships: string[];
    ownership: string[];
    related: string[];
    subsidiaries: string[];
  };
  business_contacts: Array<{
    type: ContactType;
    value: string;
    status: ContactVerification;
    source: string;
    confidence: Confidence;
    last_verified: string;
  }>;
  business_network: Array<{ entity: string; relationship: string }>;
  public_intelligence: {
    news: string[];
    deals: string[];
    projects: string[];
    investments: string[];
    events: string[];
    interviews: string[];
    publications: string[];
  };
  business_prominence: {
    score: number;
    confidence: Confidence;
    evidence: string[];
  };
  identity_verification: string;
  conflicts: ConflictRecord[];
  unknowns: string[];
  sources: Source[];
  recommended_contact_route: string[];
}
