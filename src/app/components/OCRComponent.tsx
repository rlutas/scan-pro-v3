import { useState } from 'react';
import { OCRService } from '@/lib/ocrService';

export function OCRComponent() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const service = new OCRService();
      const result = await service.recognize(file);
      // Handle result
    } catch (error) {
      console.error('OCR failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Your file upload UI */}
      {isProcessing && <div>Processing document...</div>}
    </div>
  );
} 