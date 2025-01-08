declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      lines: Array<any>;
    };
  }

  export interface WorkerProgress {
    status: string;
    progress: number;
    workerId?: string;
  }

  export interface Worker {
    loadLanguage(lang: string): Promise<void>;
    initialize(lang: string): Promise<void>;
    setParameters(params: Record<string, any>): Promise<void>;
    recognize(image: string): Promise<RecognizeResult>;
    terminate(): Promise<void>;
    logger?: (arg: WorkerProgress | string) => void;
  }

  export interface WorkerOptions {
    logger?: (arg: WorkerProgress | string) => void;
    workerPath?: string;
    corePath?: string;
    langPath?: string;
  }

  export const createWorker: (options?: WorkerOptions) => Promise<Worker>;

  export const PSM: {
    AUTO_OSD: 0;
    AUTO: 1;
    SINGLE_BLOCK: 2;
    SINGLE_LINE: 3;
    SINGLE_WORD: 4;
    SINGLE_CHAR: 5;
    SPARSE_TEXT: 6;
    SPARSE_TEXT_OSD: 7;
    RAW_LINE: 8;
    COUNT: 9;
  };

  export const OEM: {
    LSTM_ONLY: 1;
    TESSERACT_ONLY: 0;
    TESSERACT_LSTM_COMBINED: 2;
    DEFAULT: 3;
  };
} 