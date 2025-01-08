/// <reference path="../types/opencv.d.ts" />
import { opencvLoader } from './opencvLoader';

// Define OpenCV types locally
interface OpenCVNamespace {
  Mat: any;
  Size: any;
  Rect: any;
  Point: any;
  RectVector: any;
  MatVector: any;
  CascadeClassifier: any;
  COLOR_RGBA2GRAY: number;
  COLOR_BGR2GRAY: number;
  COLOR_GRAY2RGBA: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
  CV_32FC2: number;
  BORDER_DEFAULT: number;
  imread(canvas: HTMLCanvasElement): any;
  imshow(canvas: HTMLCanvasElement, mat: any): void;
  cvtColor(src: any, dst: any, code: number): void;
  equalizeHist(src: any, dst: any): void;
  GaussianBlur(src: any, dst: any, ksize: any, sigmaX: number, sigmaY?: number, borderType?: number): void;
  Canny(src: any, dst: any, threshold1: number, threshold2: number, apertureSize?: number): void;
  findContours(src: any, contours: any, hierarchy: any, mode: number, method: number): void;
  contourArea(contour: any): number;
  arcLength(contour: any, closed: boolean): number;
  approxPolyDP(curve: any, approxCurve: any, epsilon: number, closed: boolean): void;
  boundingRect(contour: any): { x: number; y: number; width: number; height: number };
  matFromArray(rows: number, cols: number, type: number, array: number[]): any;
  getPerspectiveTransform(src: any, dst: any): any;
  warpPerspective(src: any, dst: any, M: any, dsize: any): void;
}

interface Point {
  x: number;
  y: number;
}

export interface ProcessingResult {
  processedImage: string;
  faceImage: string | null;
  cnp: string;
  confidence: number;
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly ID_CARD_RATIO = 85.6 / 53.98;
  private readonly TARGET_WIDTH = 1700;
  private updateProgress?: (stage: string, progress: number, message: string) => void;

  // Face detection configuration
  private readonly FACE_CASCADE_PATH = '/cascades/haarcascade_frontalface_default.xml';
  private readonly FACE_CONFIG = {
    scaleFactor: 1.1,
    minNeighbors: 3,
    minSize: { width: 100, height: 120 },
    maxSize: { width: 300, height: 360 },
    flags: 0
  };

  // ID card regions (normalized coordinates)
  private readonly ID_REGIONS = {
    FACE: { x: 0.08, y: 0.18, width: 0.27, height: 0.55 },
    TEXT: { x: 0.4, y: 0.1, width: 0.55, height: 0.8 }
  };

  private cascadeClassifier: any = null;
  private _initialized: boolean = false;

  constructor(onProgress?: (stage: string, progress: number, message: string) => void) {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');
      this.ctx = ctx;
      this.updateProgress = onProgress;
    } else {
      this.canvas = {} as HTMLCanvasElement;
      this.ctx = {} as CanvasRenderingContext2D;
    }
  }

  private async initCascadeClassifier() {
    if (this._initialized) return;

    try {
      const cv = this.getOpenCV();
      if (!cv) {
        throw new Error('OpenCV not available');
      }

      // Fetch the cascade file
      const response = await fetch(this.FACE_CASCADE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch cascade file: ${response.statusText}`);
      }

      // Get the file content as text
      const xmlContent = await response.text();

      // Create a Uint8Array from the XML content
      const encoder = new TextEncoder();
      const xmlData = encoder.encode(xmlContent);

      // Create the cascade classifier
      this.cascadeClassifier = new cv.CascadeClassifier();

      // Create a temporary file name
      const tempFileName = 'temp_cascade_' + Math.random().toString(36).substring(7) + '.xml';

      // Write the data to a virtual file system
      cv.FS_createDataFile('/', tempFileName, xmlData, true, false, false);

      // Load the classifier from the virtual file
      const loaded = this.cascadeClassifier.load('/' + tempFileName);

      // Clean up the temporary file
      try {
        cv.FS_unlink('/' + tempFileName);
      } catch (e) {
        console.warn('Failed to cleanup temporary file:', e);
      }

      if (!loaded) {
        throw new Error('Failed to load cascade classifier');
      }

      this._initialized = true;
      console.log('Cascade classifier initialized successfully');

    } catch (error) {
      console.error('Failed to initialize cascade classifier:', error);
      this._initialized = false;
      if (this.cascadeClassifier) {
        this.cascadeClassifier.delete();
        this.cascadeClassifier = null;
      }
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this._initialized && this.cascadeClassifier !== null;
  }

  public cleanup(): void {
    if (this.cascadeClassifier) {
      this.cascadeClassifier.delete();
      this.cascadeClassifier = null;
    }
    this._initialized = false;
  }

  async processDocument(file: File): Promise<ProcessingResult> {
    try {
      // Initialize cascade classifier if needed
      if (!this._initialized) {
        await this.initCascadeClassifier();
      }

      // Process the document
      const image = await this.loadImage(file);
      const cv = this.getOpenCV();

      // Convert image to Mat
      const mat = cv.imread(image);
      
      // ... rest of your processing code ...

      // Ensure we have a valid processed image
      const processedImage = this.canvas.toDataURL('image/jpeg');
      if (!processedImage) {
        throw new Error('Failed to generate processed image');
      }

      // Return with default values for required fields
      return {
        processedImage: processedImage,
        faceImage: null,  // Explicitly set to null if no face detected
        cnp: '',  // Empty string as default
        confidence: 0  // Zero as default confidence
      };

    } catch (error) {
      console.error('Document processing error:', error);
      // Return default values in case of error
      return {
        processedImage: this.canvas.toDataURL('image/jpeg') || '',
        faceImage: null,
        cnp: '',
        confidence: 0
      };
    }
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async preprocessImage(file: File): Promise<string> {
    return this.processDocument(file).then(result => result.processedImage);
  }

  async detectAndExtractFace(imageData: string): Promise<string | null> {
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    const result = await this.processDocument(file);
    return result.faceImage;
  }

  async analyzeFrame(video: HTMLVideoElement): Promise<{ isAligned: boolean; brightness: number }> {
    if (!video) {
      return { isAligned: false, brightness: 0 };
    }

    try {
      if (!opencvLoader.isReady()) {
        await opencvLoader.load();
      }

      const cv = (window as any).cv;
      
      // Draw current frame to canvas
      this.canvas.width = video.videoWidth;
      this.canvas.height = video.videoHeight;
      this.ctx.drawImage(video, 0, 0);

      // Convert to OpenCV format
      let src = cv.imread(this.canvas);
      let gray = new cv.Mat();

      try {
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        
        // Calculate brightness
        let mean = cv.mean(gray);
        const brightness = (mean[0] / 255) * 100;

        // Check alignment
        const isAligned = await this.checkAlignment(gray);

        return { isAligned, brightness };
      } finally {
        src.delete();
        gray.delete();
      }
    } catch (error) {
      console.error('Frame analysis failed:', error);
      return { isAligned: false, brightness: 0 };
    }
  }

  private getOpenCV(): any {
    const cv = (window as any).cv;
    if (!cv) {
      throw new Error('OpenCV not available');
    }
    return cv;
  }

  private async detectFace(image: any): Promise<any | null> {
    const cv = this.getOpenCV();
    
    try {
      // Wait for classifier to be ready
      if (!this.cascadeClassifier) {
        await this.initCascadeClassifier();
      }

      let gray = new cv.Mat();
      cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
      
      // Enhance contrast for better detection
      cv.equalizeHist(gray, gray);
      
      // Detect faces
      const faces = new cv.RectVector();
      this.cascadeClassifier.detectMultiScale(
        gray,
        faces,
        this.FACE_CONFIG.scaleFactor,
        this.FACE_CONFIG.minNeighbors,
        this.FACE_CONFIG.flags,
        new cv.Size(
          this.FACE_CONFIG.minSize.width,
          this.FACE_CONFIG.minSize.height
        ),
        new cv.Size(
          this.FACE_CONFIG.maxSize.width,
          this.FACE_CONFIG.maxSize.height
        )
      );

      // Find the best face
      let bestFace = null;
      let bestScore = 0;

      for (let i = 0; i < faces.size(); i++) {
        const face = faces.get(i);
        const score = this.evaluateFacePosition(face, image.cols, image.rows);
        
        if (score > bestScore) {
          bestScore = score;
          bestFace = face;
        }
      }

      // Cleanup
      gray.delete();
      faces.delete();

      return bestFace;

    } catch (error) {
      console.error('Face detection failed:', error);
      return null;
    }
  }

  private evaluateFacePosition(face: any, imageWidth: number, imageHeight: number): number {
    // Expected position for ID card photo
    const expectedRegion = this.ID_REGIONS.FACE;
    const expectedX = imageWidth * expectedRegion.x;
    const expectedY = imageHeight * expectedRegion.y;
    const expectedWidth = imageWidth * expectedRegion.width;
    const expectedHeight = imageHeight * expectedRegion.height;

    // Calculate center points
    const faceCenterX = face.x + face.width / 2;
    const faceCenterY = face.y + face.height / 2;
    const expectedCenterX = expectedX + expectedWidth / 2;
    const expectedCenterY = expectedY + expectedHeight / 2;

    // Calculate distances and size differences
    const distanceScore = 1 - (Math.sqrt(
      Math.pow(faceCenterX - expectedCenterX, 2) +
      Math.pow(faceCenterY - expectedCenterY, 2)
    ) / (imageWidth * 0.5));

    const sizeDiffScore = 1 - Math.abs(
      (face.width * face.height) - (expectedWidth * expectedHeight)
    ) / (expectedWidth * expectedHeight);

    // Combine scores (70% position, 30% size)
    return distanceScore * 0.7 + sizeDiffScore * 0.3;
  }

  private extractAndEnhanceFace(src: any, face: any): any {
    const cv = this.getOpenCV();
    
    try {
      // Add padding for ID-style photo (more space above head)
      const padding = {
        x: face.width * 0.2,
        y: face.height * 0.4,  // More padding on top
        bottom: face.height * 0.2
      };

      // Calculate padded rectangle with more space above
      const rect = new cv.Rect(
        Math.max(0, face.x - padding.x),
        Math.max(0, face.y - padding.y),
        Math.min(src.cols - face.x, face.width + 2 * padding.x),
        Math.min(src.rows - face.y, face.height + padding.y + padding.bottom)
      );

      // Extract face region
      const faceROI = src.roi(rect);
      
      // Create enhanced copy
      let enhanced = new cv.Mat();
      faceROI.copyTo(enhanced);
      
      // Enhance image quality
      let temp = new cv.Mat();
      cv.cvtColor(enhanced, temp, cv.COLOR_RGBA2GRAY);
      cv.equalizeHist(temp, temp);
      
      // Apply slight blur to reduce noise
      cv.GaussianBlur(temp, temp, new cv.Size(3, 3), 0);
      
      // Convert back to color
      cv.cvtColor(temp, enhanced, cv.COLOR_GRAY2RGBA);
      
      // Cleanup
      temp.delete();
      faceROI.delete();
      
      return enhanced;
    } catch (error) {
      console.error('Face enhancement failed:', error);
      throw error;
    }
  }

  private calculateRegion(src: any, region: { x: number; y: number; width: number; height: number }): any {
    const cv = this.getOpenCV();
    return new cv.Rect(
      Math.floor(src.cols * region.x),
      Math.floor(src.rows * region.y),
      Math.floor(src.cols * region.width),
      Math.floor(src.rows * region.height)
    );
  }

  private matToDataURL(mat: any): string {
    const cv = this.getOpenCV();
    cv.imshow(this.canvas, mat);
    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  private async checkAlignment(grayImage: any): Promise<boolean> {
    const cv = this.getOpenCV();
    try {
      // Find edges
      let edges = new cv.Mat();
      cv.Canny(grayImage, edges, 50, 150, 3);

      // Find contours
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      // Find largest contour
      let maxArea = 0;
      let maxContourIndex = -1;
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area > maxArea) {
          maxArea = area;
          maxContourIndex = i;
        }
      }

      if (maxContourIndex === -1) {
        return false;
      }

      // Get bounding rectangle
      const maxContour = contours.get(maxContourIndex);
      const rect = cv.boundingRect(maxContour);

      // Check if rectangle matches ID card ratio
      const rectRatio = rect.width / rect.height;
      const ratioTolerance = 0.2;
      const isRatioValid = Math.abs(rectRatio - this.ID_CARD_RATIO) < ratioTolerance;

      // Check if rectangle is aligned with image edges
      const angleTolerance = 5; // degrees
      const isAligned = Math.abs(Math.atan2(rect.height, rect.width) * 180 / Math.PI - 90) < angleTolerance;

      // Cleanup
      edges.delete();
      contours.delete();
      hierarchy.delete();

      return isRatioValid && isAligned;
    } catch (error) {
      console.error('Alignment check failed:', error);
      return false;
    }
  }

  private orderPoints(points: any): { x: number; y: number }[] {
    const pts = [];
    for (let i = 0; i < points.rows; i++) {
      pts.push({
        x: points.data32S[i * 2],
        y: points.data32S[i * 2 + 1]
      });
    }

    // Sort points based on their x-coordinates
    pts.sort((a, b) => a.x - b.x);

    // Grab the left-most and right-most points
    const [leftMost, rightMost] = [pts.slice(0, 2), pts.slice(2, 4)];

    // Sort left-most points by y-coordinate
    leftMost.sort((a, b) => a.y - b.y);
    // Sort right-most points by y-coordinate
    rightMost.sort((a, b) => a.y - b.y);

    return [
      leftMost[0],   // top-left
      rightMost[0],  // top-right
      rightMost[1],  // bottom-right
      leftMost[1]    // bottom-left
    ];
  }

  private fourPointTransform(src: any, corners: { x: number; y: number }[]): any {
    const cv = this.getOpenCV();
    
    // Compute the width of the new image
    const widthA = Math.sqrt(
      Math.pow(corners[2].x - corners[3].x, 2) +
      Math.pow(corners[2].y - corners[3].y, 2)
    );
    const widthB = Math.sqrt(
      Math.pow(corners[1].x - corners[0].x, 2) +
      Math.pow(corners[1].y - corners[0].y, 2)
    );
    const maxWidth = Math.max(Math.floor(widthA), Math.floor(widthB));

    // Compute the height of the new image
    const heightA = Math.sqrt(
      Math.pow(corners[1].x - corners[2].x, 2) +
      Math.pow(corners[1].y - corners[2].y, 2)
    );
    const heightB = Math.sqrt(
      Math.pow(corners[0].x - corners[3].x, 2) +
      Math.pow(corners[0].y - corners[3].y, 2)
    );
    const maxHeight = Math.max(Math.floor(heightA), Math.floor(heightB));

    // Create destination points
    const dst = [
      { x: 0, y: 0 },
      { x: maxWidth - 1, y: 0 },
      { x: maxWidth - 1, y: maxHeight - 1 },
      { x: 0, y: maxHeight - 1 }
    ];

    // Get perspective transform matrix and apply it
    const srcMat = cv.matFromArray(4, 1, cv.CV_32FC2, corners.flatMap(p => [p.x, p.y]));
    const dstMat = cv.matFromArray(4, 1, cv.CV_32FC2, dst.flatMap(p => [p.x, p.y]));
    const M = cv.getPerspectiveTransform(srcMat, dstMat);
    
    const warped = new cv.Mat();
    cv.warpPerspective(src, warped, M, new cv.Size(maxWidth, maxHeight));

    // Cleanup
    srcMat.delete();
    dstMat.delete();
    M.delete();

    return warped;
  }
} 