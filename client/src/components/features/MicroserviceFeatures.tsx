import React from 'react';
import { Trash2 } from 'lucide-react';
import { FeatureSection } from '../ui/FeatureSection';
import { ServiceTemplateButtons } from '../ui/ServiceTemplateButtons';
import {
  MICROSERVICE_TEMPLATES,
  getAllowedCategoriesForService,
  getFeaturesByCategory
} from '../../constants/features';

interface MicroserviceFeaturesProps {
  services: Record<string, { features: string[] }>;
  onToggleFeature: (feature: string, context: string) => void;
  onAddService: (serviceName: string) => void;
  onRemoveService: (serviceName: string) => void;
  isExpanded: (section: string) => boolean;
  onToggleSection: (section: string) => void;
}

export const MicroserviceFeatures: React.FC<MicroserviceFeaturesProps> = ({
  services,
  onToggleFeature,
  onAddService,
  onRemoveService,
  isExpanded,
  onToggleSection
}) => {
  const handleAddService = (serviceName: string) => {
    const serviceTemplate = MICROSERVICE_TEMPLATES.find(t => t.id === serviceName);
    if (serviceTemplate?.available && !services[serviceName]) {
      onAddService(serviceName);
    }
  };


  const renderServiceFeatures = (serviceName: string, serviceConfig: { features: string[] }) => {
    const allowedCategories = getAllowedCategoriesForService(serviceName);

    return (
      <div className="p-4">
        {allowedCategories.map(category => {
          const features = getFeaturesByCategory(category);
          const sectionKey = `${serviceName}-${category}`;
          
          return (
            <FeatureSection
              key={category}
              title={category}
              features={features}
              context={serviceName}
              selectedFeatures={serviceConfig.features}
              isExpanded={isExpanded(sectionKey)}
              onToggleSection={() => onToggleSection(sectionKey)}
              onToggleFeature={(featureId) => onToggleFeature(featureId, serviceName)}
            />
          );
        })}
        
        {allowedCategories.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p>No feature categories configured for this service type.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Services</h2>
        <ServiceTemplateButtons
          templates={MICROSERVICE_TEMPLATES}
          existingServices={services}
          onAddService={handleAddService}
        />
      </div>

      {Object.keys(services).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No services added yet. Click the buttons above to add services.</p>
        </div>
      )}

      {Object.entries(services).map(([serviceName, serviceConfig]) => {
        const allowedCategories = getAllowedCategoriesForService(serviceName);
        
        return (
          <div key={serviceName} className="mb-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-800">{serviceName}</h3>
                <div className="flex gap-1">
                  {allowedCategories.map(category => (
                    <span 
                      key={category}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onRemoveService(serviceName)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
            {renderServiceFeatures(serviceName, serviceConfig)}
          </div>
        );
      })}
    </div>
  );
};