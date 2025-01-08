"use client";

import React, { useRef, useCallback, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DocumentVerificationService } from '@/lib/documentVerificationService';

interface CameraScannerProps {
  onCapture: (file: File) => Promise<void>;
  isProcessing?: boolean;
}

export function CameraScanner({ onCapture, isProcessing = false }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleCapture = useCallback(async () => {
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
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.95)
      );

      // Create a File object from the blob
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

      // Stop the camera
      stopCamera();

      // Call the onCapture callback with the file
      await onCapture(file);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast.error('Failed to capture image');
    }
  }, [onCapture, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full rounded-lg"
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className="flex items-center justify-center p-4 bg-primary rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera size={24} />
        </button>
      </div>
    </div>
  );
} 