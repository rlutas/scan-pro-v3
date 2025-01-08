export interface CNPInfo {
  gender: string;
  birthDate: string;
  age: number;
  county: string;
  sequence: string;
  controlDigit: string;
  isValid: boolean;
}

export interface PersonalInfo {
  fullName?: string;
  gender?: string;
  age?: number;
  nationality?: string;
  issuingState?: string;
  expiryDate?: string;
  documentNumber?: string;
  personalNumber?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  cnp?: string;
}

export interface DocumentDetails {
  documentNumber?: string;
  documentType?: string;
  issuingAuthority?: string;
  issuingDate?: string;
  expiryDate?: string;
}

export interface ProcessingTime {
  start: number;
  end: number;
  total: number;
}

export interface DocumentResult {
  verified: boolean;
  documentImage?: string;
  portraitImage?: string;
  personalInfo: {
    cnp?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    issuingState?: string;
    expiryDate?: string;
    documentNumber?: string;
  };
  documentDetails: {
    documentNumber?: string;
    documentType?: string;
    issuingAuthority?: string;
    issuingDate?: string;
    expiryDate?: string;
  };
  processingTime: {
    start: number;
    end: number;
    total: number;
    processing?: number;
    uploadDownload?: number;
  };
  rawText?: string;
  errors?: string[];
} 