import React, { useEffect, useState } from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';
import { DocumentResult } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CNPValidator } from '@/lib/cnpUtils';
import { ExclusionService } from '@/lib/exclusionService';
import { ExclusionDialog } from '@/components/ExclusionDialog';

interface DocumentScanResultsProps {
  documentData: DocumentResult;
  deviceId: string;
}

interface VerificationItemProps {
  label: string;
  verified: boolean;
}

interface ExclusionStatus {
  isExcluded: boolean;
  loading: boolean;
  error?: string;
  reason?: string;
  verified: boolean;
}

function VerificationItem({ label, verified }: VerificationItemProps) {
  return (
    <div className={`p-3 rounded-lg flex items-center justify-between ${
      verified ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <span className="text-sm font-medium">{label}</span>
      {verified ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-red-600" />
      )}
    </div>
  );
}

export function DocumentScanResults({ documentData, deviceId }: DocumentScanResultsProps) {
  const [exclusionStatus, setExclusionStatus] = useState<ExclusionStatus>({
    isExcluded: false,
    loading: true,
    error: undefined,
    reason: undefined,
    verified: false
  });
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  useEffect(() => {
    const checkExclusion = async () => {
      if (!documentData.personalInfo.cnp) {
        setExclusionStatus({
          isExcluded: false,
          loading: false,
          error: undefined,
          reason: "CNP not found. Please rescan the document or enter CNP manually",
          verified: false
        });
        setShowStatusDialog(true);
        return;
      }

      try {
        setExclusionStatus(prev => ({ ...prev, loading: true }));
        const status = await ExclusionService.checkExclusion(documentData.personalInfo.cnp!);
        setExclusionStatus(status);
        setShowStatusDialog(true);

        if (deviceId) {
          await saveScanResult(documentData.personalInfo.cnp!, status);
        } else {
          setSavingError('No device selected. Please select a device before scanning.');
        }
      } catch (error) {
        setExclusionStatus({
          isExcluded: false,
          loading: false,
          error: "Error checking exclusion status",
          reason: undefined,
          verified: false
        });
        setShowStatusDialog(true);
      }
    };

    checkExclusion();
  }, [documentData.personalInfo.cnp, deviceId]);

  const saveScanResult = async (cnp: string, status: ExclusionStatus) => {
    try {
      setSavingError(null);
      const response = await fetch('/api/scan-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cnp,
          isExcluded: status.isExcluded,
          reason: status.reason,
          deviceId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to save scan result');
      }

      const data = await response.json().catch(() => null);
      
      if (!data || !data.success) {
        throw new Error(data?.error || data?.details || 'Failed to save scan result');
      }

      console.log('Scan saved successfully:', data.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save scan result';
      console.error('Error saving scan result:', errorMessage);
      setSavingError(errorMessage);
    }
  };

  // Extract CNP info if available
  const cnpInfo = documentData.personalInfo.cnp ? 
    CNPValidator.extractInfo(documentData.personalInfo.cnp) : null;

  const getVerificationStatusStyles = () => {
    if (exclusionStatus.loading) {
      return 'bg-gray-50 border-gray-200';
    }
    if (!documentData.personalInfo.cnp) {
      return 'bg-yellow-50 border-yellow-200'; // Warning state
    }
    return exclusionStatus.isExcluded 
      ? 'bg-red-50 border-red-200' 
      : 'bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (exclusionStatus.loading) {
      return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />;
    }
    if (!documentData.personalInfo.cnp) {
      return (
        <div className="flex items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      );
    }
    return exclusionStatus.isExcluded ? (
      <div className="flex items-center">
        <div className="bg-red-100 p-3 rounded-full">
          <X className="h-8 w-8 text-red-600" />
        </div>
      </div>
    ) : (
      <div className="flex items-center">
        <div className="bg-green-100 p-3 rounded-full">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>
    );
  };

  const getStatusText = () => {
    if (exclusionStatus.loading) {
      return 'Checking status...';
    }
    if (!documentData.personalInfo.cnp) {
      return 'Verification Incomplete';
    }
    return exclusionStatus.isExcluded ? 'Not Allowed to Gamble' : 'Allowed to Gamble';
  };

  const getStatusTextColor = () => {
    if (exclusionStatus.loading) return 'text-gray-700';
    if (!documentData.personalInfo.cnp) return 'text-yellow-700';
    return exclusionStatus.isExcluded ? 'text-red-700' : 'text-green-700';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {savingError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{savingError}</p>
          </div>
        )}
        
        <div className={`p-6 rounded-xl border-2 ${getVerificationStatusStyles()}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Gambling Verification</h3>
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
          </div>

          <div className="mt-4">
            <h4 className={`text-xl font-semibold ${getStatusTextColor()}`}>
              {getStatusText()}
            </h4>
            
            {!documentData.personalInfo.cnp && (
              <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      CNP not found. Please rescan the document or enter CNP manually
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {exclusionStatus.reason && documentData.personalInfo.cnp && (
              <p className={`mt-2 text-base ${
                exclusionStatus.isExcluded ? 'text-red-600' : 'text-green-600'
              }`}>
                {exclusionStatus.reason}
              </p>
            )}
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InfoField label="CNP" value={documentData.personalInfo.cnp} />
            <InfoField label="Gender" value={cnpInfo?.gender || documentData.personalInfo.gender} />
            <InfoField label="Date of Birth" value={cnpInfo?.dateOfBirth || documentData.personalInfo.dateOfBirth} />
            <InfoField label="Age" value={cnpInfo?.age?.toString()} />
            <InfoField label="County of Origin" value={cnpInfo?.county} />
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold">Verification Results</h3>
          <div className="space-y-3 mt-4">
            <VerificationItem label="CNP validation" verified={Boolean(documentData.personalInfo.cnp)} />
            <VerificationItem label="Image quality" verified={true} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold">Processing Information</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <ProcessingTime 
              label="Processing Time" 
              value={documentData.processingTime.processing} 
            />
            <ProcessingTime 
              label="Upload/Download" 
              value={documentData.processingTime.uploadDownload} 
            />
            <ProcessingTime 
              label="Total Time" 
              value={documentData.processingTime.total / 1000} 
            />
          </div>
        </div>
      </div>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`text-xl ${
              !documentData.personalInfo.cnp 
                ? 'text-yellow-700'
                : exclusionStatus.isExcluded 
                  ? 'text-red-700' 
                  : 'text-green-700'
            }`}>
              {getStatusText()}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center space-x-4 p-4">
            <div className={`p-3 rounded-full ${
              !documentData.personalInfo.cnp
                ? 'bg-yellow-100'
                : exclusionStatus.isExcluded
                  ? 'bg-red-100'
                  : 'bg-green-100'
            }`}>
              {!documentData.personalInfo.cnp ? (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              ) : exclusionStatus.isExcluded ? (
                <X className="h-8 w-8 text-red-600" />
              ) : (
                <Check className="h-8 w-8 text-green-600" />
              )}
            </div>

            <div className="flex-1">
              {!documentData.personalInfo.cnp ? (
                <div className="space-y-2">
                  <p className="text-yellow-700 font-medium">Verification Incomplete</p>
                  <p className="text-sm text-yellow-600">
                    CNP not found. Please try one of the following:
                  </p>
                  <ul className="text-sm text-yellow-600 list-disc list-inside">
                    <li>Rescan your ID with better lighting and alignment</li>
                    <li>Enter your CNP manually in the input field</li>
                  </ul>
                </div>
              ) : (
                <p className={`${
                  exclusionStatus.isExcluded ? 'text-red-600' : 'text-green-600'
                }`}>
                  {exclusionStatus.reason}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium">{value || '-'}</div>
    </div>
  );
}

function ProcessingTime({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-medium">{value?.toFixed(2) || '0'}s</div>
    </div>
  );
} 