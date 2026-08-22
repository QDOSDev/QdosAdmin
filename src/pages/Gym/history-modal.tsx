import React from 'react';
import { X } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymData: any;
}

export function HistoryModal({ isOpen, onClose, gymData }: HistoryModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Gym History</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {gymData?.previousNames && gymData.previousNames.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Names</h3>
              <div className="space-y-3">
                {gymData.previousNames.map((item: any) => (
                  <div key={item._id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800 font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">Changed on {formatDate(item.changedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gymData?.previousAddresses && gymData.previousAddresses.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Previous Addresses</h3>
              <div className="space-y-3">
                {gymData.previousAddresses.map((item: any) => (
                  <div key={item._id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800 font-medium">{item.address}</p>
                    <p className="text-sm text-gray-500">Changed on {formatDate(item.changedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!gymData?.previousNames || gymData.previousNames.length === 0) && 
           (!gymData?.previousAddresses || gymData.previousAddresses.length === 0) && (
            <p className="text-gray-500 italic">No history records available.</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
