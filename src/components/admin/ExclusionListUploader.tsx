import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export function ExclusionListUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/update-exclusions', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload exclusion list');
      }

      const data = await response.json();
      toast.success('Exclusion list updated successfully');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to update exclusion list');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-gray-400" />
          <div className="mt-4 text-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 text-base leading-normal">
                {isUploading ? 'Uploading...' : 'Select a CSV file'}
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            CSV file containing CNP numbers
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
} 