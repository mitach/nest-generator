import React from 'react';
import { X } from 'lucide-react';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  getFeatureIcon: (feature: string) => React.ReactNode;
  onRemoveFeature?: () => void;
  children?: React.ReactNode;
}

const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  onClose,
  feature,
  getFeatureIcon,
  onRemoveFeature,
  children,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {getFeatureIcon(feature)}
            {feature} Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {children || (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Feature Name</h3>
                <p className="text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{feature}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">
                  This feature is currently part of your monolith application. You can move it to a
                  microservice or remove it entirely.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  In Monolith
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          {onRemoveFeature && (
            <button
              onClick={() => {
                onRemoveFeature();
                onClose();
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove Feature
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;
