'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';
import { DocumentVerificationService, type DocumentResult } from '@/lib/documentVerificationService';
import { DocumentScanResults } from '@/components/DocumentScanResults';
import { ImageProcessor } from '@/lib/imageProcessor';
import { opencvLoader } from '@/lib/opencvLoader';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const documentVerificationService = new DocumentVerificationService();

export default function ScanPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<DocumentResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAligned, setIsAligned] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const imageProcessor = useRef<ImageProcessor | null>(null);
  const [autoCapturePending, setAutoCapturePending] = useState(false);
  const alignmentTimer = useRef<NodeJS.Timeout>();
  const lastCaptureTime = useRef<number>(0);
  const MIN_CAPTURE_INTERVAL = 2000; // 2 seconds between auto-captures
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [manualCnp, setManualCnp] = useState('');
  const [manualScanResult, setManualScanResult] = useState<DocumentResult | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{ id: string; name: string; location: string } | null>(null);
  const [showDeviceError, setShowDeviceError] = useState(false);

  useEffect(() => {
    const checkDevice = async () => {
      try {
        const fp = await import('@fingerprintjs/fingerprintjs');
        const fpPromise = await fp.load();
        const result = await fpPromise.get();
        
        const response = await fetch(`/api/devices/check?fingerprint=${result.visitorId}`);
        const data = await response.json();
        
        if (data.isRegistered && data.deviceInfo) {
          setDeviceId(data.deviceInfo.id);
          setDeviceInfo(data.deviceInfo);
        } else {
          setShowDeviceError(true);
        }
      } catch (error) {
        console.error('Error checking device:', error);
        toast.error('Failed to verify device. Please try again.');
      }
    };

    checkDevice();
  }, []);

  // Modified OpenCV initialization
  useEffect(() => {
    let mounted = true;
    let initAttempts = 0;
    const MAX_ATTEMPTS = 3;

    const initOpenCV = async () => {
      try {
        if (!mounted) return;
        
        console.log('Starting OpenCV initialization...');
        
        // Check if OpenCV is already initialized
        if (opencvLoader.isReady()) {
          console.log('OpenCV already initialized');
          setIsOpenCVReady(true);
          return;
        }

        // Wait for any existing OpenCV operations to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Load OpenCV
        await opencvLoader.load();
        
        if (!mounted) return;

        // Verify OpenCV is ready
        if (opencvLoader.isReady()) {
          console.log('OpenCV initialized successfully');
          setIsOpenCVReady(true);
          
          // Initialize image processor only if OpenCV is ready
          if (!imageProcessor.current) {
            imageProcessor.current = new ImageProcessor((stage, progress, message) => {
              console.log(`Processing: ${stage} - ${progress}% - ${message}`);
            });
          }
        } else {
          throw new Error('OpenCV not ready after loading');
        }
      } catch (error) {
        console.error('OpenCV initialization failed:', error);
        
        // Retry initialization if under max attempts
        if (initAttempts < MAX_ATTEMPTS && mounted) {
          initAttempts++;
          console.log(`Retrying OpenCV initialization (attempt ${initAttempts}/${MAX_ATTEMPTS})...`);
          setTimeout(initOpenCV, 1000);
        } else {
          toast.error('Failed to initialize document scanner. Please refresh the page.');
        }
      }
    };

    initOpenCV();

    // Cleanup function
    return () => {
      mounted = false;
      if (imageProcessor.current) {
        imageProcessor.current.cleanup();
        imageProcessor.current = null;
      }
      // Don't reset OpenCV here as it might be needed by other components
    };
  }, []);

  // Camera handlers
  const handleTakePhoto = useCallback(async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
      setShowCamera(false);
    }
  }, []);

  const handleCloseCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  }, []);

  // Move captureImage before analyzeFrame
  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      // Create a canvas to capture the current frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw the current frame to canvas
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Set preview image
      setPreviewImage(canvas.toDataURL('image/jpeg', 0.95));
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.95)
      );

      // Create a File object from the blob
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

      // Stop the camera stream
      handleCloseCamera();
      
      // Process the captured image
      setIsProcessing(true);
      try {
        const result = await documentVerificationService.verifyDocument(file);
        setScanResult(result);
        toast.success('Document captured successfully');
      } catch (error) {
        console.error('Error processing document:', error);
        toast.error('Failed to process document');
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Failed to capture image');
    }
  }, [handleCloseCamera]);

  // Now analyzeFrame can use captureImage
  const analyzeFrame = useCallback(async () => {
    if (!imageProcessor.current || !videoRef.current || !isOpenCVReady) return;

    try {
      const result = await imageProcessor.current.analyzeFrame(videoRef.current);
      
      // Changed 'aligned' to 'isAligned' to match the property name
      setIsAligned(result?.isAligned ?? false);
      setBrightness(result?.brightness ?? 0);

      // Changed 'aligned' to 'isAligned' here as well
      if (result?.isAligned && (result?.brightness ?? 0) >= 80) {
        if (!autoCapturePending) {
          setAutoCapturePending(true);
          alignmentTimer.current = setTimeout(() => {
            captureImage();
          }, 1000);
        }
      } else {
        setAutoCapturePending(false);
        if (alignmentTimer.current) {
          clearTimeout(alignmentTimer.current);
        }
      }
    } catch (error) {
      console.error('Frame analysis failed:', error);
      setIsAligned(false);
      setAutoCapturePending(false);
    }

    if (showCamera) {
      requestAnimationFrame(() => analyzeFrame());
    }
  }, [isAligned, brightness, showCamera, captureImage, isOpenCVReady]);

  // Start analyzing frames when camera is shown
  useEffect(() => {
    if (showCamera) {
      analyzeFrame();
    }
  }, [showCamera, analyzeFrame]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (alignmentTimer.current) {
        clearTimeout(alignmentTimer.current);
      }
    };
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please drop an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    try {
      const result = await documentVerificationService.verifyDocument(file);
      setScanResult(result);
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    try {
      const result = await documentVerificationService.verifyDocument(file);
      setScanResult(result);
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add new handler for manual CNP check
  const handleManualCheck = async () => {
    if (!manualCnp || manualCnp.length !== 13) {
      toast.error('Please enter a valid 13-digit CNP');
      return;
    }

    setIsProcessing(true);
    try {
      // Create a minimal DocumentResult for the manual check
      const result: DocumentResult = {
        verified: true,
        personalInfo: {
          cnp: manualCnp,
        },
        documentDetails: {
          type: '',
          documentNumber: '',
          expiryDate: ''
        },
        processingTime: {
          start: performance.now(),
          end: performance.now(),
          total: 0
        }
      };
      
      setManualScanResult(result);
      setScanResult(result);
    } catch (error) {
      console.error('Error processing CNP:', error);
      toast.error('Failed to process CNP');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterDevice = () => {
    router.push('/devices');
  };

  return (
    <>
      <Dialog open={showDeviceError} onOpenChange={setShowDeviceError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device Not Registered</DialogTitle>
            <DialogDescription className="pt-4">
              This device needs to be registered before you can use the scanner. 
              Would you like to register it now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeviceError(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegisterDevice}>
              Register Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="relative z-10 overflow-hidden pt-28 lg:pt-[150px]">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="max-w-lg mx-auto mb-12 text-center wow fadeInUp" data-wow-delay=".2s">
            <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl">
              Scan Document
            </h2>
            <p className="text-base text-body-color dark:text-dark-6">
              Upload or take a photo of your document for verification
            </p>
          </div>

          <div className="wow fadeInUp" data-wow-delay=".2s">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left Column - Upload/Preview Section */}
              <div className="lg:col-span-6 space-y-6">
                {/* Add Manual CNP Input Section */}
                <div className="bg-white dark:bg-dark-2 rounded-xl shadow-one border border-stroke dark:border-dark-3 mb-6">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Manual CNP Check</h3>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Enter 13-digit CNP"
                        value={manualCnp}
                        onChange={(e) => setManualCnp(e.target.value.replace(/[^0-9]/g, '').slice(0, 13))}
                        className="flex-1"
                        maxLength={13}
                      />
                      <Button
                        onClick={handleManualCheck}
                        disabled={isProcessing || manualCnp.length !== 13}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        Check CNP
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview Card - Always show if image exists */}
                {previewImage && (
                  <div className="bg-white dark:bg-dark-2 rounded-xl shadow-one border border-stroke dark:border-dark-3 overflow-hidden">
                    <div className="p-4 border-b border-stroke dark:border-dark-3">
                      <h3 className="text-lg font-semibold text-dark dark:text-white">
                        Document Preview
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="relative aspect-[1.586/1] w-full rounded-lg overflow-hidden">
                        <img
                          src={previewImage}
                          alt="Document preview"
                          className="w-full h-full object-contain"
                        />
                        {isProcessing && (
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                              <p className="text-white text-sm font-medium">
                                Processing document...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Preview Actions */}
                    <div className="p-4 bg-gray-50 dark:bg-dark-3 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setPreviewImage(null);
                          setScanResult(null);
                          setIsProcessing(false);
                        }}
                        className="inline-flex items-center justify-center rounded-md bg-red-50 py-2 px-4 text-sm font-medium text-red-700 transition duration-300 ease-in-out hover:bg-red-100"
                      >
                        <X size={16} className="mr-2" />
                        Clear
                      </button>
                      {!scanResult && !isProcessing && (
                        <button
                          onClick={() => handleFileUpload({ target: { files: [dataURLtoFile(previewImage, 'document.jpg')] } } as any)}
                          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-sm font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-90"
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Retry Scan
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload/Capture Controls - Show if no processing */}
                <div className="bg-white dark:bg-dark-2 rounded-xl shadow-one border border-stroke dark:border-dark-3">
                  {/* Take Photo Button */}
                  <div className="p-6 border-b border-stroke dark:border-dark-3">
                    <button
                      onClick={handleTakePhoto}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-3 rounded-md bg-primary py-4 px-9 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Camera size={20} />
                      <span className="font-medium">Take a photo</span>
                    </button>
                  </div>

                  {/* Upload Section */}
                  <div className="p-8">
                    <div 
                      className={`flex flex-col items-center justify-center rounded-lg border-3 border-dashed transition-all duration-300 ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-stroke/70 dark:border-dark-3 hover:border-primary/50 hover:bg-gray-1 dark:hover:bg-dark-3'
                      }`}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="mb-4">
                        <div className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-lg">
                          <Upload size={28} className="text-primary" />
                        </div>
                      </div>
                      
                      <p className="text-dark dark:text-white text-lg font-semibold mb-2">
                        Drag your document image
                      </p>
                      
                      <div className="flex items-center gap-3 text-body-color dark:text-dark-6 text-base mb-6">
                        <span className="w-12 h-[2px] bg-stroke dark:bg-dark-3"></span>
                        <span>OR</span>
                        <span className="w-12 h-[2px] bg-stroke dark:bg-dark-3"></span>
                      </div>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center justify-center rounded-md bg-primary/10 py-3 px-7 text-base font-medium text-primary transition duration-300 ease-in-out hover:bg-opacity-90 hover:shadow-signUp"
                      >
                        Upload a file
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Results Section */}
              <div className="lg:col-span-6">
                {scanResult && deviceId && (
                  <DocumentScanResults 
                    documentData={scanResult} 
                    deviceId={deviceId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Camera Dialog */}
        <Dialog open={showCamera} onOpenChange={handleCloseCamera}>
          <DialogContent className="sm:max-w-[800px] p-0">
            <DialogTitle className="sr-only">Document Scanner</DialogTitle>
            <div className="relative bg-black aspect-[1.586/1]"> {/* Updated aspect ratio */}
              {/* Camera Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Document Frame - Mobile responsive */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className={`relative w-full max-w-[90%] aspect-[1.586/1] border-2 rounded-lg transition-colors ${
                  isAligned ? 'border-green-400' : 'border-yellow-400'
                }`}>
                  {/* Corner Guides */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2" />
                    <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2" />
                  </div>
                </div>
              </div>

              {/* Guidance Text */}
              <div className="absolute top-4 left-0 right-0 text-center z-10">
                <div className="inline-block bg-black/50 rounded-full px-4 py-2 text-sm">
                  {!isAligned && (
                    <p className="text-yellow-400">
                      Position your ID card within the frame
                    </p>
                  )}
                  {brightness < 80 && ( // Reduced from 100
                    <p className="text-yellow-400">
                      More light needed for better results
                    </p>
                  )}
                  {isAligned && brightness >= 80 && (
                    <p className="text-green-400">
                      {autoCapturePending 
                        ? "Hold steady... Capturing" 
                        : "Perfect! Hold steady"}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Manual Capture Button */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                <button
                  type="button"
                  onClick={captureImage}
                  disabled={isProcessing}
                  className={`w-16 h-16 rounded-full border-4 transition-colors ${
                    isAligned && brightness >= 80 && !isProcessing
                      ? 'border-green-400 bg-green-400/20 hover:bg-green-400/30 cursor-pointer'
                      : 'border-yellow-400 bg-yellow-400/20'
                  }`}
                >
                  {isProcessing ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin m-auto" />
                  ) : (
                    <div className="w-4 h-4 bg-white rounded-full m-auto" />
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </>
  );
}

// Helper function to convert data URL to File
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
} 