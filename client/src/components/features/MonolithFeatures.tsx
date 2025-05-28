import React from 'react';
import { FeatureSection } from '../ui/FeatureSection';
import {
  COMMON_FEATURES,
  DATABASE_FEATURES,
  AUTH_FEATURES,
  USER_FEATURES,
  FEATURE_CATEGORIES
} from '../../constants/features';

interface MonolithFeaturesProps {
  selectedFeatures: string[];
  onToggleFeature: (feature: string, context: 'monolith') => void;
  isExpanded: (section: string) => boolean;
  onToggleSection: (section: string) => void;
}

export const MonolithFeatures: React.FC<MonolithFeaturesProps> = ({
  selectedFeatures,
  onToggleFeature,
  isExpanded,
  onToggleSection
}) => {
  const handleToggleFeature = (featureId: string) => {
    onToggleFeature(featureId, 'monolith');
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Features</h2>
      
      <FeatureSection
        title={FEATURE_CATEGORIES.COMMON}
        features={COMMON_FEATURES}
        context="monolith"
        selectedFeatures={selectedFeatures}
        isExpanded={isExpanded('monolith-Common Features')}
        onToggleSection={() => onToggleSection('monolith-Common Features')}
        onToggleFeature={handleToggleFeature}
      />
      
      <FeatureSection
        title={FEATURE_CATEGORIES.DATABASE}
        features={DATABASE_FEATURES}
        context="monolith"
        selectedFeatures={selectedFeatures}
        isExpanded={isExpanded('monolith-Database')}
        onToggleSection={() => onToggleSection('monolith-Database')}
        onToggleFeature={handleToggleFeature}
      />
      
      <FeatureSection
        title={FEATURE_CATEGORIES.AUTH}
        features={AUTH_FEATURES}
        context="monolith"
        selectedFeatures={selectedFeatures}
        isExpanded={isExpanded('monolith-Authentication')}
        onToggleSection={() => onToggleSection('monolith-Authentication')}
        onToggleFeature={handleToggleFeature}
      />
      
      <FeatureSection
        title={FEATURE_CATEGORIES.USER_MANAGEMENT}
        features={USER_FEATURES}
        context="monolith"
        selectedFeatures={selectedFeatures}
        isExpanded={isExpanded('monolith-User Management')}
        onToggleSection={() => onToggleSection('monolith-User Management')}
        onToggleFeature={handleToggleFeature}
      />
    </div>
  );
};