import { createWorker, PSM, OEM, Worker } from 'tesseract.js';
import path from 'path';

// Create a worker pool to reuse workers
const workerPool: Worker[] = [];
const MAX_POOL_SIZE = 2;

async function getWorker(): Promise<Worker> {
  // Reuse existing worker if available
  if (workerPool.length > 0) {
    const worker = workerPool.pop();
    if (worker) return worker;
  }

  // Create new worker with minimal configuration
  const worker = await createWorker();
  
  // Initialize with English language and LSTM engine
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  
  // Set parameters for CNP recognition
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: PSM.AUTO,
    preserve_interword_spaces: '0'
  });

  return worker;
}

async function releaseWorker(worker: Worker) {
  // Return worker to pool if not full
  if (workerPool.length < MAX_POOL_SIZE) {
    workerPool.push(worker);
  } else {
    await worker.terminate();
  }
}

export async function performServerOCR(imageData: string) {
  const worker = await getWorker();

  try {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert buffer to base64 string for Tesseract
    const imageDataUrl = `data:image/jpeg;base64,${base64Data}`;

    const { data } = await worker.recognize(imageDataUrl);
    
    // Clean and validate the text
    const cleanedText = data.text.replace(/[^0-9]/g, '');
    const cnpMatch = cleanedText.match(/[1-9]\d{12}/);
    
    if (!cnpMatch) {
      throw new Error('No valid CNP found in image');
    }

    return {
      text: cnpMatch[0],
      confidence: data.confidence
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  } finally {
    await releaseWorker(worker);
  }
}

// Cleanup function to terminate all workers
export async function cleanupWorkers() {
  await Promise.all(workerPool.map(worker => worker.terminate()));
  workerPool.length = 0;
}

// Handle process termination
process.on('SIGTERM', cleanupWorkers);
process.on('SIGINT', cleanupWorkers);