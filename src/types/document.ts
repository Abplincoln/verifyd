export type DocumentCategory = 
  | 'degree_diploma'
  | 'certificate'
  | 'legal_contract'
  | 'financial_invoice'
  | 'identity_record'
  | 'other';

export interface DocumentTypeOption {
  id: DocumentCategory;
  label: string;
  description: string;
}

export const DOCUMENT_TYPES: DocumentTypeOption[] = [
  {
    id: 'degree_diploma',
    label: 'Degree or Diploma',
    description: 'Academic credentials, degrees, diplomas, and transcripts.',
  },
  {
    id: 'certificate',
    label: 'Professional Certificate',
    description: 'Certifications, licenses, training, and achievements.',
  },
  {
    id: 'legal_contract',
    label: 'Legal Contract',
    description: 'Agreements, terms, leases, NDAs, and signed commitments.',
  },
  {
    id: 'financial_invoice',
    label: 'Invoice or Receipt',
    description: 'Commercial bills, tax invoices, and payment proofs.',
  },
  {
    id: 'identity_record',
    label: 'Identity Document',
    description: 'Government or corporate ID records and permits.',
  },
  {
    id: 'other',
    label: 'Other Document',
    description: 'Any general file requiring cryptographic integrity verification.',
  },
];

export interface ProcessedDocument {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  sha256Hash: string;
  calculatedAt: Date;
}

export interface RegisteredDocument {
  documentHash: `0x${string}`;
  documentType: string;
  issuer: `0x${string}`;
  timestamp: bigint;
}

export type ActivePage = 'home' | 'issue' | 'verify';

export type VerificationResultState = 'idle' | 'computing' | 'ready' | 'verified' | 'unverified';
