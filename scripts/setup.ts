import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Constants for files
const FILES = {
  OPENCV: 'https://docs.opencv.org/4.5.4/opencv.js',
  FACE_CASCADE: 'https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml',
  TESSERACT: {
    worker: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    core: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm',
    langData: {
      latin: 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/script/Latin.traineddata'
    }
  }
};

// Directory paths
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const OPENCV_DIR = path.join(PUBLIC_DIR, 'opencv');
const CASCADE_DIR = path.join(PUBLIC_DIR, 'cascades');
const TESSERACT_DIR = path.join(PUBLIC_DIR, 'tesseract');
const LANG_DATA_DIR = path.join(TESSERACT_DIR, 'lang-data');
const SCRIPT_DATA_DIR = path.join(LANG_DATA_DIR, 'script');

async function downloadFile(url: string, outputPath: string): Promise<void> {
  try {
    console.log(`Downloading ${url} to ${outputPath}`);
    const response = await axios.get(url, { 
      responseType: url.endsWith('.xml') ? 'text' : 'arraybuffer' 
    });
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, response.data);
    console.log(`Downloaded: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
    throw error;
  }
}

async function setup() {
  try {
    console.log('Starting setup process...');

    // Create directories
    await fs.promises.mkdir(OPENCV_DIR, { recursive: true });
    await fs.promises.mkdir(CASCADE_DIR, { recursive: true });
    await fs.promises.mkdir(TESSERACT_DIR, { recursive: true });
    await fs.promises.mkdir(LANG_DATA_DIR, { recursive: true });
    await fs.promises.mkdir(SCRIPT_DATA_DIR, { recursive: true });

    // Download all files
    const downloads = [
      // OpenCV
      downloadFile(FILES.OPENCV, path.join(OPENCV_DIR, 'opencv.js')),
      // Face cascade
      downloadFile(FILES.FACE_CASCADE, path.join(CASCADE_DIR, 'haarcascade_frontalface_default.xml')),
      // Tesseract
      downloadFile(FILES.TESSERACT.worker, path.join(TESSERACT_DIR, 'worker.min.js')),
      downloadFile(FILES.TESSERACT.core, path.join(TESSERACT_DIR, 'tesseract-core.wasm')),
      downloadFile(FILES.TESSERACT.langData.latin, path.join(SCRIPT_DATA_DIR, 'Latin.traineddata'))
    ];

    await Promise.all(downloads);
    console.log('All files downloaded successfully!');

  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setup(); 