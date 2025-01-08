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
        tessedit_ocr_engine_mode: 2,
        tessedit_pageseg_mode: 3,
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
      });
    }
  }

  async processImage(imageData: File): Promise<string> {
    await this.initialize();
    
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      const base64Image = await this.fileToBase64(imageData);
      
      const { data: { text } } = await this.worker.recognize(base64Image);
      console.log('Raw OCR text:', text);
      return text;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}