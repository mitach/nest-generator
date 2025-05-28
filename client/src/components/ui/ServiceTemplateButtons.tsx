import React from 'react';
import { Plus } from 'lucide-react';
import { ServiceConfig } from '../../types/project';

interface ServiceTemplateButtonsProps {
  templates: ServiceConfig[];
  existingServices: Record<string, { features: string[] }>;
  onAddService: (serviceName: string) => void;
}

export const ServiceTemplateButtons: React.FC<ServiceTemplateButtonsProps> = ({
  templates,
  existingServices,
  onAddService
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {templates.map(template => (
        <button
          key={template.id}
          onClick={() => onAddService(template.id)}
          disabled={!template.available || !!existingServices[template.id]}
          className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
            template.available && !existingServices[template.id]
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus size={12} />
          {template.name}
          {!template.available && (
            <span className="ml-1 text-xs bg-orange-200 text-orange-700 px-1 rounded">
              Soon
            </span>
          )}
          {existingServices[template.id] && (
            <span className="ml-1 text-xs bg-green-200 text-green-700 px-1 rounded">
              Added
            </span>
          )}
        </button>
      ))}
    </div>
  );
};