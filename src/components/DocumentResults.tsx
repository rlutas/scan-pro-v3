import React from 'react';
import { Check, AlertTriangle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface DocumentResultsData {
  verified: boolean;
  processingTime: {
    processing: number;
    uploadDownload: number;
    total: number;
  };
  personalInfo: {
    fullName: string;
    gender: string;
    age: number;
    nationality: string;
    issuingState: string;
    expiryDate: string;
    documentNumber: string;
  };
  documentDetails: {
    type: string;
    personalNumber: string;
    dateOfBirth: string;
    placeOfBirth: string;
    issuingAuthority: string;
    dateOfIssue: string;
  };
  address: {
    street: string;
    number: string;
    city: string;
    county: string;
  };
  mrzData: {
    lines: string;
    verified: boolean;
  };
}

interface DocumentResultsProps {
  documentData: DocumentResultsData;
}

export function DocumentResults({ documentData }: DocumentResultsProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${documentData.verified ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div className="flex items-center gap-3">
          {documentData.verified ? (
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <Check className="text-green-600 dark:text-green-400" size={24} />
            </div>
          ) : (
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-dark dark:text-white">
              {documentData.verified ? "Document Verified" : "Verification Failed"}
            </h2>
            <p className="text-sm text-body-color dark:text-dark-6">
              {documentData.verified 
                ? "All security checks passed successfully" 
                : "Some security checks failed. Please try again."}
            </p>
          </div>
        </div>
      </div>

      {/* Document Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Personal Information */}
        <div className="bg-white dark:bg-dark-2 rounded-xl p-5 shadow-one">
          <h3 className="text-base font-semibold mb-4 text-dark dark:text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Personal Information
          </h3>
          <dl className="space-y-2">
            {[
              { label: "Full Name", value: documentData.personalInfo.fullName },
              { label: "Gender", value: documentData.personalInfo.gender },
              { label: "Age", value: `${documentData.personalInfo.age} years` },
              { label: "Nationality", value: documentData.personalInfo.nationality },
              { label: "Date of Birth", value: documentData.documentDetails.dateOfBirth }
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <dt className="text-xs text-body-color dark:text-dark-6">{item.label}</dt>
                <dd className="text-sm font-medium text-dark dark:text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Document Details */}
        <div className="bg-white dark:bg-dark-2 rounded-xl p-5 shadow-one">
          <h3 className="text-base font-semibold mb-4 text-dark dark:text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Document Details
          </h3>
          <dl className="space-y-2">
            {[
              { label: "Document Type", value: documentData.documentDetails.type },
              { label: "Document Number", value: documentData.personalInfo.documentNumber },
              { label: "Issue Date", value: documentData.documentDetails.dateOfIssue },
              { label: "Expiry Date", value: documentData.personalInfo.expiryDate },
              { label: "Issuing Authority", value: documentData.documentDetails.issuingAuthority }
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <dt className="text-xs text-body-color dark:text-dark-6">{item.label}</dt>
                <dd className="text-sm font-medium text-dark dark:text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Address */}
        <div className="bg-white dark:bg-dark-2 rounded-xl p-5 shadow-one">
          <h3 className="text-base font-semibold mb-4 text-dark dark:text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            Address
          </h3>
          <dl className="space-y-2">
            <div className="flex flex-col">
              <dt className="text-xs text-body-color dark:text-dark-6">Street Address</dt>
              <dd className="text-sm font-medium text-dark dark:text-white">
                {documentData.address.street} {documentData.address.number}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-body-color dark:text-dark-6">City</dt>
              <dd className="text-sm font-medium text-dark dark:text-white">{documentData.address.city}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs text-body-color dark:text-dark-6">County</dt>
              <dd className="text-sm font-medium text-dark dark:text-white">{documentData.address.county}</dd>
            </div>
          </dl>
        </div>

        {/* MRZ Data */}
        <div className="bg-white dark:bg-dark-2 rounded-xl p-5 shadow-one">
          <h3 className="text-base font-semibold mb-4 text-dark dark:text-white flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            MRZ Information
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-dark-3 p-3 rounded-lg">
              <p className="text-xs font-mono break-all text-body-color dark:text-dark-6">
                {documentData.mrzData.lines}
              </p>
            </div>
            <div className={`text-sm rounded-lg p-2 flex items-center gap-2
              ${documentData.mrzData.verified 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}
            >
              {documentData.mrzData.verified ? <Check size={16} /> : <AlertTriangle size={16} />}
              {documentData.mrzData.verified 
                ? "MRZ verification successful" 
                : "MRZ verification failed"}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Time */}
      <div className="bg-white dark:bg-dark-2 rounded-xl p-4 shadow-one">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Processing", value: documentData.processingTime.processing },
            { label: "Upload/Download", value: documentData.processingTime.uploadDownload },
            { label: "Total Time", value: documentData.processingTime.total }
          ].map((item) => (
            <div key={item.label} className="flex flex-col">
              <dt className="text-xs text-body-color dark:text-dark-6">{item.label}</dt>
              <dd className="text-sm font-medium text-dark dark:text-white">{item.value.toFixed(3)}s</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 