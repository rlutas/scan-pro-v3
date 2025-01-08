export interface CNPInfo {
  gender: string;
  birthDate: string;
  age: number;
  county: string;
  sequence: string;
  controlDigit: string;
  isValid: boolean;
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
  };
  documentDetails: {
    type?: string;
    documentNumber?: string;
    expiryDate?: string;
  };
  mrzData?: {
    lines?: string;
    verified: boolean;
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

export interface Rectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ProcessedData {
  success: boolean;
  documentType: number;
  quality: {
    overall: boolean;
    text: boolean;
  };
  portrait?: string;
  cnp?: string;
}

export interface DocumentPosition {
  Angle: number;
  Center: { x: number; y: number };
  Dpi: number;
  Height: number;
  Width: number;
  LeftBottom: { x: number; y: number };
  LeftTop: { x: number; y: number };
  RightBottom: { x: number; y: number };
  RightTop: { x: number; y: number };
}

export interface FaceDetection {
  Count: number;
  CountFalseDetection: number;
  Res: Array<{
    FaceRect: {
      bottom: number;
      left: number;
      right: number;
      top: number;
    };
    Probability: number;
  }>;
} 