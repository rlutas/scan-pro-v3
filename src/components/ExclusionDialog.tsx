import { Check, X } from 'lucide-react';
import { ExclusionStatus } from '@/lib/exclusionService';

interface ExclusionDialogProps {
  status: ExclusionStatus;
  onClose: () => void;
  isOpen: boolean;
}

export function ExclusionDialog({ status, onClose, isOpen }: ExclusionDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          {status.isExcluded ? (
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
          ) : (
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          )}
          <h3 className="text-lg font-semibold ml-3">
            {status.isExcluded ? 'Not Allowed to Gamble' : 'Allowed to Gamble'}
          </h3>
        </div>

        <div className={`p-4 rounded-lg mb-4 ${
          status.isExcluded ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <p className={`text-sm ${
            status.isExcluded ? 'text-red-700' : 'text-green-700'
          }`}>
            {status.reason}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 