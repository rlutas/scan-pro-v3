/// <reference path="../types/opencv.d.ts" />

class OpenCVLoader {
  private static instance: OpenCVLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;
  private readonly OPENCV_URL = '/opencv/opencv.js';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {}

  public static getInstance(): OpenCVLoader {
    if (!OpenCVLoader.instance) {
      OpenCVLoader.instance = new OpenCVLoader();
    }
    return OpenCVLoader.instance;
  }

  load(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (this.isReady()) {
      return Promise.resolve();
    }

    this.loadPromise = new Promise(async (resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('OpenCV can only be loaded in browser environment'));
        return;
      }

      // Clean up any existing OpenCV instances
      this.cleanup();

      let retries = 0;
      const tryLoad = async () => {
        try {
          // Check if OpenCV is already loaded
          if (this.isReady()) {
            console.log('OpenCV already loaded');
            this.isLoaded = true;
            resolve();
            return;
          }

          // Set up Module configuration before loading script
          if (!(window as any).Module) {
            (window as any).Module = {
              onRuntimeInitialized: () => {
                console.log('OpenCV runtime initialized');
                this.isLoaded = true;
                resolve();
              },
              preRun: [],
              postRun: [],
              print: (text: string) => console.log('OpenCV:', text),
              printErr: (text: string) => console.error('OpenCV Error:', text)
            };
          }

          const existingScript = document.getElementById('opencv-script');
          if (existingScript) {
            console.log('OpenCV script already exists, waiting for initialization...');
            return;
          }

          const script = document.createElement('script');
          script.id = 'opencv-script';
          script.src = this.OPENCV_URL;
          script.async = true;
          script.type = 'text/javascript';

          script.onerror = async () => {
            if (retries < this.MAX_RETRIES) {
              console.log(`Retrying OpenCV load... Attempt ${retries + 1}/${this.MAX_RETRIES}`);
              retries++;
              await new Promise(r => setTimeout(r, this.RETRY_DELAY));
              script.remove();
              tryLoad();
            } else {
              const error = new Error('Failed to load OpenCV script after multiple attempts');
              console.error(error);
              this.cleanup();
              reject(error);
            }
          };

          document.body.appendChild(script);
        } catch (error) {
          if (retries < this.MAX_RETRIES) {
            console.log(`Retrying OpenCV load... Attempt ${retries + 1}/${this.MAX_RETRIES}`);
            retries++;
            await new Promise(r => setTimeout(r, this.RETRY_DELAY));
            tryLoad();
          } else {
            console.error('Failed to load OpenCV:', error);
            this.cleanup();
            reject(error);
          }
        }
      };

      await tryLoad();
    });

    return this.loadPromise;
  }

  isReady(): boolean {
    return typeof (window as any).cv !== 'undefined' && 
           this.isLoaded && 
           (window as any).cv.Mat !== undefined;
  }

  getCV(): any {
    if (!this.isReady()) {
      throw new Error('OpenCV is not ready. Call load() first and wait for it to complete.');
    }
    return (window as any).cv;
  }

  cleanup(): void {
    // Remove existing script
    const script = document.getElementById('opencv-script');
    if (script) {
      script.remove();
    }

    // Clean up OpenCV instance
    if (typeof window !== 'undefined') {
      if ((window as any).Module) {
        delete (window as any).Module;
      }
      if ((window as any).cv) {
        delete (window as any).cv;
      }
    }

    this.loadPromise = null;
    this.isLoaded = false;
  }

  reset(): void {
    this.cleanup();
  }
}

export const opencvLoader = OpenCVLoader.getInstance();

export function loadOpenCV(): Promise<void> {
  return opencvLoader.load();
}

export function isOpenCVReady(): boolean {
  return opencvLoader.isReady();
} 