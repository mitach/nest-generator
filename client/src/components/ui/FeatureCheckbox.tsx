import React from 'react';
import { FeatureConfig } from '../../types/project';

interface FeatureCheckboxProps {
  feature: FeatureConfig;
  checked: boolean;
  onChange: () => void;
}

export const FeatureCheckbox: React.FC<FeatureCheckboxProps> = ({
  feature,
  checked,
  onChange
}) => {
  return (
    <label 
      className={`flex items-center justify-between space-x-2 p-2 rounded cursor-pointer transition-colors ${
        feature.available 
          ? 'hover:bg-gray-50' 
          : 'bg-gray-50 cursor-not-allowed opacity-60'
      }`}
    >
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={!feature.available}
          className={`w-4 h-4 rounded focus:ring-blue-500 ${
            feature.available 
              ? 'text-blue-600' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
        />
        <span className={`text-sm ${
          feature.available ? 'text-gray-700' : 'text-gray-400'
        }`}>
          {feature.name}
        </span>
      </div>
      {!feature.available && (
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
          Not Ready Yet
        </span>
      )}
    </label>
  );
};