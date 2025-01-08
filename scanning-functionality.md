INFO

// src/lib/types.ts
export interface DocumentResult {
  verified: boolean;
  personalInfo: {
    cnp?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
  };
  documentDetails: {
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuingAuthority?: string;
  };
  processingTime: {
    start: number;
    end: number;
    total: number;
  };
  rawText?: string;
  errors?: string[];
}

// src/lib/cnpUtils.ts
export class CNPValidator {
  private static CONTROL_KEY = "279146358279";

  static validate(cnp: string): boolean {
    if (!/^\d{13}$/.test(cnp)) return false;

    // Extract components
    const year = parseInt(cnp.substring(1, 3));
    const month = parseInt(cnp.substring(3, 5));
    const day = parseInt(cnp.substring(5, 7));

    // Basic validations
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    // Calculate control digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnp[i]) * parseInt(this.CONTROL_KEY[i]);
    }
    const control = sum % 11;
    const controlDigit = control === 10 ? 1 : control;

    return controlDigit === parseInt(cnp[12]);
  }

  static extractInfo(cnp: string): {
    dateOfBirth: string;
    gender: string;
    county: string;
  } | null {
    if (!this.validate(cnp)) return null;

    const genderCode = parseInt(cnp[0]);
    const year = parseInt(cnp.substring(1, 3));
    const month = parseInt(cnp.substring(3, 5));
    const day = parseInt(cnp.substring(5, 7));
    const county = cnp.substring(7, 9);

    // Calculate full year
    let fullYear: number;
    if (genderCode === 1 || genderCode === 2) fullYear = 1900 + year;
    else if (genderCode === 3 || genderCode === 4) fullYear = 1800 + year;
    else if (genderCode === 5 || genderCode === 6) fullYear = 2000 + year;
    else return null;

    return {
      dateOfBirth: `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      gender: genderCode % 2 === 1 ? 'M' : 'F',
      county: county
    };
  }
}

// src/lib/ocrService.ts
import * as Tesseract from 'tesseract.js';

export class OCRService {
  private worker: Tesseract.Worker | null = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker();
      await this.worker.loadLanguage('ron+eng');
      await this.worker.initialize('ron+eng');
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzăâîșțĂÂÎȘȚ <>-.',
        preserve_interword_spaces: '1',
      });
    }
  }

  async processImage(imageData: string | File): Promise<string> {
    await this.initialize();
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    const { data: { text } } = await this.worker.recognize(imageData);
    return text;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// src/lib/documentVerificationService.ts
export class DocumentVerificationService {
  private ocrService: OCRService;
  
  constructor() {
    this.ocrService = new OCRService();
  }

  async verifyDocument(file: File): Promise<DocumentResult> {
    const startTime = performance.now();
    const result: DocumentResult = {
      verified: false,
      personalInfo: {},
      documentDetails: {},
      processingTime: {
        start: startTime,
        end: 0,
        total: 0
      },
      errors: []
    };

    try {
      // Process image with OCR
      const text = await this.ocrService.processImage(file);
      result.rawText = text;

      // Extract CNP
      const cnpMatch = text.match(/\b[1-9]\d{12}\b/);
      if (cnpMatch) {
        const cnp = cnpMatch[0];
        if (CNPValidator.validate(cnp)) {
          result.personalInfo.cnp = cnp;
          const cnpInfo = CNPValidator.extractInfo(cnp);
          if (cnpInfo) {
            result.personalInfo.dateOfBirth = cnpInfo.dateOfBirth;
            result.personalInfo.gender = cnpInfo.gender;
          }
        }
      }

      // Extract other information using regex patterns
      const nameMatch = text.match(/NUMELE\s*(.+?)\s*PRENUMELE/i);
      if (nameMatch) {
        result.personalInfo.fullName = nameMatch[1].trim();
      }

      const docNumberMatch = text.match(/SERIA\s*([A-Z]{2})\s*NR\.\s*(\d+)/i);
      if (docNumberMatch) {
        result.documentDetails.documentNumber = `${docNumberMatch[1]}${docNumberMatch[2]}`;
      }

      // Verify extracted data
      result.verified = Boolean(
        result.personalInfo.cnp &&
        result.personalInfo.fullName &&
        result.documentDetails.documentNumber
      );

    } catch (error) {
      result.errors?.push(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      const endTime = performance.now();
      result.processingTime.end = endTime;
      result.processingTime.total = endTime - startTime;
      await this.ocrService.terminate();
    }

    return result;
  }
}

Now you'll need to integrate this with your frontend component. Here's how to use it:

// In your DocumentScanner component:

import { DocumentVerificationService } from '@/lib/documentVerificationService';
import { DocumentResult } from '@/lib/types';

const DocumentScanner = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DocumentResult | null>(null);
  const verificationService = new DocumentVerificationService();

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await verificationService.verifyDocument(file);
      setResult(result);
    } catch (error) {
      console.error('Error processing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // ... rest of your component code
};


// src/lib/imageProcessor.ts
export interface ProcessingProgress {
  stage: string;
  progress: number;
  message: string;
}

export interface Point {
  x: number;
  y: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onProgress?: (progress: ProcessingProgress) => void;

  // Romanian ID card dimensions (in pixels at 300 DPI)
  private readonly ID_CARD_RATIO = 85.6 / 53.98; // Standard ID card ratio
  private readonly TARGET_WIDTH = 1700; // For 300 DPI quality

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = ctx;
    this.onProgress = onProgress;
  }

  private updateProgress(stage: string, progress: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message });
    }
  }

  async preprocessImage(file: File): Promise<string> {
    try {
      this.updateProgress('initialization', 0, 'Starting image preprocessing...');
      const img = await createImageBitmap(file);

      // Step 1: Detect document edges
      this.updateProgress('edge-detection', 10, 'Detecting document edges...');
      const corners = await this.detectDocumentCorners(img);

      // Step 2: Apply perspective correction
      this.updateProgress('perspective-correction', 30, 'Correcting perspective...');
      const correctedImage = await this.applyPerspectiveCorrection(img, corners);

      // Step 3: Normalize size
      this.updateProgress('size-normalization', 50, 'Normalizing image size...');
      const { width, height } = this.calculateDimensions(correctedImage);
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx.drawImage(correctedImage, 0, 0, width, height);

      // Step 4: Enhance image
      this.updateProgress('enhancement', 70, 'Enhancing image quality...');
      let imageData = this.ctx.getImageData(0, 0, width, height);
      imageData = this.applyGrayscale(imageData);
      imageData = this.applyAdaptiveThreshold(imageData, width);
      imageData = this.applyDenoise(imageData, width);
      imageData = this.applySharpening(imageData, width);

      // Step 5: Optimize for ID card layout
      this.updateProgress('layout-optimization', 90, 'Optimizing for ID card layout...');
      imageData = this.optimizeForIDCard(imageData, width);

      // Final step: Render result
      this.ctx.putImageData(imageData, 0, 0);
      this.updateProgress('completion', 100, 'Image preprocessing complete');

      return this.canvas.toDataURL('image/jpeg', 0.95);
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      throw error;
    }
  }

  private async detectDocumentCorners(img: ImageBitmap): Promise<Point[]> {
    const width = img.width;
    const height = img.height;

    // Draw image to canvas for processing
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Convert to grayscale and calculate edges using Sobel operator
    const edges = new Uint8ClampedArray(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Sobel kernels
        const gx = 
          -1 * data[idx - width * 4 - 4] +
          1 * data[idx - width * 4 + 4] +
          -2 * data[idx - 4] +
          2 * data[idx + 4] +
          -1 * data[idx + width * 4 - 4] +
          1 * data[idx + width * 4 + 4];

        const gy = 
          -1 * data[idx - width * 4 - 4] +
          -2 * data[idx - width * 4] +
          -1 * data[idx - width * 4 + 4] +
          1 * data[idx + width * 4 - 4] +
          2 * data[idx + width * 4] +
          1 * data[idx + width * 4 + 4];

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = magnitude > 128 ? 255 : 0;
      }
    }

    // Find corners using Harris corner detection
    const corners: Point[] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (edges[y * width + x] === 255) {
          let cornerScore = 0;
          // Calculate corner score using simplified Harris corner detection
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (edges[(y + dy) * width + (x + dx)] === 255) {
                cornerScore++;
              }
            }
          }
          if (cornerScore >= 7) { // Threshold for corner detection
            corners.push({ x, y });
          }
        }
      }
    }

    // Find the four corners of the document
    const topLeft = corners.reduce((min, p) => 
      (p.x + p.y < min.x + min.y) ? p : min, corners[0]);
    const topRight = corners.reduce((max, p) => 
      (p.x - p.y > max.x - max.y) ? p : max, corners[0]);
    const bottomLeft = corners.reduce((max, p) => 
      (-p.x + p.y > -max.x + max.y) ? p : max, corners[0]);
    const bottomRight = corners.reduce((max, p) => 
      (p.x + p.y > max.x + max.y) ? p : max, corners[0]);

    return [topLeft, topRight, bottomLeft, bottomRight];
  }

  private async applyPerspectiveCorrection(img: ImageBitmap, corners: Point[]): Promise<ImageBitmap> {
    // Calculate target dimensions based on ID card ratio
    const width = this.TARGET_WIDTH;
    const height = width / this.ID_CARD_RATIO;

    // Source and destination points for perspective transform
    const srcPoints = corners;
    const dstPoints = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width, y: height }
    ];

    // Calculate perspective transform matrix
    const matrix = this.getPerspectiveTransform(srcPoints, dstPoints);

    // Apply transform
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.setTransform(
      matrix[0], matrix[3], matrix[1],
      matrix[4], matrix[2], matrix[5]
    );
    this.ctx.drawImage(img, 0, 0);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    return createImageBitmap(this.canvas);
  }

  private getPerspectiveTransform(src: Point[], dst: Point[]): number[] {
    // Implementation of perspective transform matrix calculation
    // This is a simplified version - in practice you'd want to use a proper matrix library
    const matrix = new Array(9).fill(0);
    // ... Matrix calculation code here ...
    return matrix;
  }

  private optimizeForIDCard(imageData: ImageData, width: number): ImageData {
    const data = imageData.data;
    const height = imageData.height;

    // Define regions of interest (ROI) for ID card
    const rois = {
      photo: { x: 0.05, y: 0.15, w: 0.3, h: 0.6 }, // Photo area
      mrz: { x: 0.05, y: 0.8, w: 0.9, h: 0.15 },   // MRZ area
      text: { x: 0.35, y: 0.15, w: 0.6, h: 0.6 }   // Text area
    };

    // Create result data
    const resultData = new Uint8ClampedArray(data.length);

    // Process each ROI differently
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        let value = data[idx];

        // Determine which ROI the pixel belongs to
        const xRatio = x / width;
        const yRatio = y / height;

        if (this.isInROI(xRatio, yRatio, rois.photo)) {
          // Enhance photo area - preserve grayscale levels
          value = data[idx];
        } else if (this.isInROI(xRatio, yRatio, rois.mrz)) {
          // Enhance MRZ area - increase contrast
          value = value > 128 ? 255 : 0;
        } else if (this.isInROI(xRatio, yRatio, rois.text)) {
          // Enhance text area - adaptive threshold
          value = this.getAdaptiveThreshold(data, idx, width, height);
        }

        resultData[idx] = value;
        resultData[idx + 1] = value;
        resultData[idx + 2] = value;
        resultData[idx + 3] = data[idx + 3];
      }
    }

    return new ImageData(resultData, width, height);
  }

  private isInROI(x: number, y: number, roi: { x: number; y: number; w: number; h: number }): boolean {
    return x >= roi.x && x <= (roi.x + roi.w) && y >= roi.y && y <= (roi.y + roi.h);
  }

  private getAdaptiveThreshold(data: Uint8ClampedArray, idx: number, width: number, height: number): number {
    // Implementation of adaptive thresholding for specific pixel
    const blockSize = 11;
    let sum = 0;
    let count = 0;

    for (let dy = -blockSize >> 1; dy <= blockSize >> 1; dy++) {
      for (let dx = -blockSize >> 1; dx <= blockSize >> 1; dx++) {
        const y = Math.floor(idx / (width * 4)) + dy;
        const x = Math.floor((idx % (width * 4)) / 4) + dx;

        if (y >= 0 && y < height && x >= 0 && x < width) {
          sum += data[(y * width + x) * 4];
          count++;
        }
      }
    }

    const threshold = (sum / count) - 2;
    return data[idx] > threshold ? 255 : 0;
  }

  // ... (previous methods remain the same) ...
}