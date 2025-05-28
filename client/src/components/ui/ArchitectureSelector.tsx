import React from 'react';
import { Architecture } from '../../types/project';

interface ArchitectureSelectorProps {
  selected: Architecture | null;
  onSelect: (architecture: Architecture) => void;
}

export const ArchitectureSelector: React.FC<ArchitectureSelectorProps> = ({
  selected,
  onSelect
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">Architecture</label>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('monolith')}
          className={`p-4 border-2 rounded-lg text-center transition-all ${
            selected === 'monolith'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-medium">Monolith</div>
          <div className="text-sm text-gray-500 mt-1">Single application</div>
        </button>
        <button
          onClick={() => onSelect('microservice')}
          className={`p-4 border-2 rounded-lg text-center transition-all ${
            selected === 'microservice'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="font-medium">Microservices</div>
          <div className="text-sm text-gray-500 mt-1">Multiple services</div>
        </button>
      </div>
    </div>
  );
};
