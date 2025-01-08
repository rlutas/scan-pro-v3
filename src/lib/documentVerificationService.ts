import { OCRService } from './ocrService';
import { CNPValidator } from './cnpUtils';
import type { DocumentResult } from '@/lib/types';

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
      documentDetails: {
        type: '',
        documentNumber: '',
        expiryDate: ''
      },
      processingTime: {
        start: startTime,
        end: 0,
        total: 0
      },
      errors: []
    };

    try {
      const text = await this.ocrService.processImage(file);
      result.rawText = text;

      // Extract CNP using multiple approaches
      let cnp = await this.extractCNP(text);
      
      if (!cnp) {
        result.errors?.push('CNP not detected. Please rescan or enter manually.');
        result.verified = false;
        return result;
      }

      result.personalInfo.cnp = cnp;
      result.verified = true;

      // Extract other information...
      // ... existing extraction code ...

    } catch (error) {
      result.errors?.push(error instanceof Error ? error.message : 'Unknown error occurred');
      result.verified = false;
    } finally {
      const endTime = performance.now();
      result.processingTime.end = endTime;
      result.processingTime.total = endTime - startTime;
      await this.ocrService.terminate();
    }

    return result;
  }

  private async extractCNP(text: string): Promise<string | null> {
    // Multiple approaches to find CNP
    let cnp: string | null = null;

    // Approach 1: Look for exact 13-digit number
    const exactMatch = text.match(/\b\d{13}\b/g);
    if (exactMatch) {
      for (const potentialCNP of exactMatch) {
        if (CNPValidator.validate(potentialCNP)) {
          cnp = potentialCNP;
          break;
        }
      }
    }

    // Approach 2: Look for CNP label and nearby numbers
    if (!cnp) {
      const cnpLabelMatch = text.match(/(?:CNP|CRP|CNF|CUP|CNR)[:\s.-]*([0-9\s.-]+)/i);
      if (cnpLabelMatch) {
        const cleaned = cnpLabelMatch[1].replace(/[^\d]/g, '');
        if (cleaned.length >= 13) {
          const potential = cleaned.substring(0, 13);
          if (CNPValidator.validate(potential)) {
            cnp = potential;
          }
        }
      }
    }

    // Approach 3: Look for any sequence of numbers that could be a CNP
    if (!cnp) {
      const allNumbers = text.match(/\d+/g);
      if (allNumbers) {
        const joined = allNumbers.join('');
        for (let i = 0; i <= joined.length - 13; i++) {
          const potential = joined.substr(i, 13);
          if (CNPValidator.validate(potential)) {
            cnp = potential;
            break;
          }
        }
      }
    }

    return cnp;
  }
}

export type { DocumentResult };