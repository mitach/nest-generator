import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FeatureConfig } from '../../types/project';
import { FeatureCheckbox } from './FeatureCheckbox';

interface FeatureSectionProps {
  title: string;
  features: FeatureConfig[];
  context: 'monolith' | string;
  selectedFeatures: string[];
  isExpanded: boolean;
  onToggleSection: () => void;
  onToggleFeature: (featureId: string) => void;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  features,
  selectedFeatures,
  isExpanded,
  onToggleSection,
  onToggleFeature
}) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={onToggleSection}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isExpanded && (
        <div className="p-3 grid grid-cols-1 gap-1">
          {features.map(feature => (
            <FeatureCheckbox
              key={feature.id}
              feature={feature}
              checked={selectedFeatures.includes(feature.id)}
              onChange={() => onToggleFeature(feature.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};