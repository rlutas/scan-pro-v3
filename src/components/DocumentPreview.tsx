import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import { ImageProcessor } from '@/lib/imageProcessor';

interface DocumentPreviewProps {
  originalImage: string;
  onConfirm: (processedImage: File) => Promise<void>;
  onRetry: () => void;
  isProcessing?: boolean;
}

export function DocumentPreview({ 
  originalImage, 
  onConfirm, 
  onRetry,
  isProcessing = false 
}: DocumentPreviewProps) {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isPreprocessing, setIsPreprocessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsPreprocessing(true);
        setError(null);

        const imageProcessor = new ImageProcessor((stage, progress, message) => {
          console.log(`Processing: ${stage} - ${progress}% - ${message}`);
        });

        // Convert base64 to File
        const response = await fetch(originalImage);
        const blob = await response.blob();
        const file = new File([blob], 'original.jpg', { type: 'image/jpeg' });

        // Process the image
        const processedImageData = await imageProcessor.preprocessImage(file);
        setProcessedImage(processedImageData);
      } catch (err) {
        console.error('Image processing failed:', err);
        setError('Failed to process image. Please try again.');
      } finally {
        setIsPreprocessing(false);
      }
    };

    if (originalImage) {
      processImage();
    }
  }, [originalImage]);

  const handleConfirm = async () => {
    if (!processedImage) return;

    try {
      // Convert processed image to File
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const file = new File([blob], 'processed.jpg', { type: 'image/jpeg' });
      
      await onConfirm(file);
    } catch (err) {
      console.error('Failed to confirm image:', err);
      setError('Failed to process document. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Original Image</h3>
          <div className="relative aspect-[1.586/1] bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={originalImage}
              alt="Original document"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Processed Image */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Processed Image</h3>
          <div className="relative aspect-[1.586/1] bg-gray-100 rounded-lg overflow-hidden">
            {isPreprocessing ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-sm text-gray-600">Processing image...</span>
              </div>
            ) : processedImage ? (
              <img
                src={processedImage}
                alt="Processed document"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                {error || 'Processing failed'}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 text-center">{error}</div>
      )}

      <div className="flex justify-center space-x-4">
        <button
          onClick={onRetry}
          disabled={isProcessing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
        
        <button
          onClick={handleConfirm}
          disabled={isPreprocessing || isProcessing || !processedImage}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Continue
        </button>
      </div>
    </div>
  );
} 