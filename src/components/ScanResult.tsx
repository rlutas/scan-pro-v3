import React, { useEffect, useState } from 'react';
import { DocumentResult } from '@/types/document';
import Image from 'next/image';
import { Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { ImageProcessor } from '@/lib/imageProcessor';
import { MRZData } from '@/lib/mrzReader';

interface ScanResultProps {
  result: DocumentResult;
  processedImage?: string;
  mrzData?: MRZData;
}

export function ScanResult({ result, processedImage, mrzData }: ScanResultProps) {
  const [portraitImage, setPortraitImage] = useState<string | null>(null);
  const [isPortraitLoading, setIsPortraitLoading] = useState(false);

  useEffect(() => {
    async function extractPortrait() {
      if (processedImage) {
        setIsPortraitLoading(true);
        try {
          const imageProcessor = new ImageProcessor();
          const portrait = await imageProcessor.detectAndExtractFace(processedImage);
          if (portrait) {
            setPortraitImage(portrait);
          }
        } catch (error) {
          console.error('Failed to extract portrait:', error);
        } finally {
          setIsPortraitLoading(false);
        }
      }
    }
    extractPortrait();
  }, [processedImage]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column - Document Preview */}
      <div className="space-y-4">
        <div className="relative aspect-[1.586/1] bg-gray-100 rounded-lg overflow-hidden">
          {processedImage ? (
            <Image
              src={processedImage}
              alt="Processed document"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        
        {/* Portrait Preview */}
        <div className="relative aspect-square w-1/3 bg-gray-100 rounded-lg overflow-hidden">
          {isPortraitLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : portraitImage ? (
            <Image
              src={portraitImage}
              alt="ID Portrait"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No portrait detected
            </div>
          )}
        </div>

        {/* MRZ Data Section */}
        {mrzData && (
          <div className="bg-white dark:bg-dark-2 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">MRZ Information</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Document Type:</span>
                <span>{mrzData.documentType}</span>
                
                <span className="text-gray-600">Document Number:</span>
                <span>{mrzData.documentNumber}</span>
                
                <span className="text-gray-600">Full Name:</span>
                <span>{`${mrzData.surname} ${mrzData.givenNames}`}</span>
                
                <span className="text-gray-600">Nationality:</span>
                <span>{mrzData.nationality}</span>
                
                <span className="text-gray-600">Date of Birth:</span>
                <span>{mrzData.dateOfBirth}</span>
                
                <span className="text-gray-600">Sex:</span>
                <span>{mrzData.sex === 'M' ? 'Male' : 'Female'}</span>
                
                <span className="text-gray-600">Expiry Date:</span>
                <span>{mrzData.expiryDate}</span>
                
                <span className="text-gray-600">Personal Number:</span>
                <span>{mrzData.personalNumber}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Verification Details */}
      <div className="space-y-4">
        {/* Document Information */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4" id="doc-info">Document Information</h2>
          
          <div className="space-y-3" aria-describedby="doc-info">
            <InfoField 
              label="CNP"
              value={result.personalInfo.cnp}
              className="font-mono text-lg"
            />
            
            <InfoField 
              label="NATIONALITY" 
              value={result.personalInfo.nationality} 
            />
            
            <InfoField 
              label="ISSUING STATE" 
              value={result.personalInfo.issuingState} 
            />
            
            <InfoField 
              label="DATE OF EXPIRY" 
              value={result.personalInfo.expiryDate} 
            />
            
            <InfoField 
              label="NUMBER" 
              value={result.personalInfo.documentNumber} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value?: string | number;
  className?: string;
}

function InfoField({ label, value, className = '' }: InfoFieldProps) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`font-medium ${className}`}>{value || '-'}</div>
    </div>
  );
} 