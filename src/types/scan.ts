export interface ScanRecord {
  id: string;
  cnp: string;
  scannedAt: string;
  result: string;
  device: {
    name: string;
    location: string;
    fingerprint: string;
  } | null;
  reason: string | null;
}

export interface CNPInfo {
  gender: string;
  birthDate: string;
  age: number;
  county: string;
  isValid: boolean;
} 