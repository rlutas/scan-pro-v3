declare namespace cv {
  class Mat {
    delete(): void;
    isDeleted(): boolean;
    roi(rect: Rect): Mat;
    cols: number;
    rows: number;
    data: Uint8Array;
    data32F: Float32Array;
    static ones(rows: number, cols: number, type: number): Mat;
  }

  class MatVector {
    delete(): void;
    size(): number;
    get(index: number): Mat;
  }

  class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
  }

  class Size {
    width: number;
    height: number;
    constructor(width: number, height: number);
  }

  class Rect {
    constructor(x: number, y: number, width: number, height: number);
    x: number;
    y: number;
    width: number;
    height: number;
  }

  class RectVector {
    size(): number;
    get(index: number): Rect;
    delete(): void;
  }

  class CLAHE {
    constructor(clipLimit: number, tileGridSize: Size);
    apply(src: Mat, dst: Mat): void;
    delete(): void;
  }

  class CascadeClassifier {
    constructor();
    load(buffer: Uint8Array): boolean;
    detectMultiScale(
      image: Mat,
      objects: RectVector,
      scaleFactor: number,
      minNeighbors: number,
      flags: number,
      minSize: Size,
      maxSize: Size
    ): void;
    delete(): void;
  }

  // Constants
  const CV_8U: number;
  const COLOR_RGBA2GRAY: number;
  const COLOR_BGR2GRAY: number;
  const ADAPTIVE_THRESH_GAUSSIAN_C: number;
  const THRESH_BINARY: number;
  const RETR_EXTERNAL: number;
  const CHAIN_APPROX_SIMPLE: number;
  const BORDER_DEFAULT: number;
  const CV_32F: number;

  // Functions
  function imread(imageSource: HTMLImageElement | HTMLCanvasElement | ImageData): Mat;
  function imshow(canvasSource: HTMLCanvasElement, mat: Mat): void;
  function cvtColor(src: Mat, dst: Mat, code: number, dstCn?: number): void;
  function adaptiveThreshold(src: Mat, dst: Mat, maxValue: number, adaptiveMethod: number, thresholdType: number, blockSize: number, C: number): void;
  function GaussianBlur(src: Mat, dst: Mat, ksize: Size, sigmaX: number, sigmaY: number, borderType?: number): void;
  function addWeighted(src1: Mat, alpha: number, src2: Mat, beta: number, gamma: number, dst: Mat): void;
  function getPerspectiveTransform(src: Mat, dst: Mat): Mat;
  function warpPerspective(src: Mat, dst: Mat, M: Mat, dsize: Size): void;
  function equalizeHist(src: Mat, dst: Mat): void;
}

declare global {
  interface Window {
    cv: typeof cv;
  }
}

export default cv; 