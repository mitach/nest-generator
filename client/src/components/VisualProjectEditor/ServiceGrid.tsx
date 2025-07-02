import React from 'react';
import { Plus, Package, X, Code } from 'lucide-react';
import { Service } from '@/lib/types';

interface ServiceGridProps {
  services: Service[];
  dragOverService: string | null;
  draggingFeature: string | null;
  handleServiceDrop: (e: React.DragEvent, serviceId: string) => void;
  handleServiceDragOver: (e: React.DragEvent, serviceId: string) => void;
  handleServiceDragLeave: (e: React.DragEvent) => void;
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  setShowServiceMenu: (show: boolean) => void;
  removeFeatureFromService: (serviceId: string, feature: string) => void;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  dragOverService,
  draggingFeature,
  handleServiceDrop,
  handleServiceDragOver,
  handleServiceDragLeave,
  selectedService,
  setSelectedService,
  setShowServiceMenu,
  removeFeatureFromService,
}) => {
  return (
    <div className="relative min-h-full">
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>
      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service) => (
          <div key={service.id} className="animate-fadeIn">
            <div
              className={`bg-white rounded-xl shadow-xl border-2 ${
                dragOverService === service.id
                  ? 'border-blue-500 ring-4 ring-blue-100'
                  : selectedService?.id === service.id
                    ? 'border-blue-400 ring-2 ring-blue-100'
                    : 'border-gray-200'
              } hover:shadow-2xl transition-all cursor-pointer overflow-hidden relative`}
              onClick={() => setSelectedService(service)}
            >
              {/* Invisible drop zone that covers the entire card */}
              <div
                className="absolute inset-0 z-10"
                onDrop={(e) => handleServiceDrop(e, service.id)}
                onDragOver={(e) => handleServiceDragOver(e, service.id)}
                onDragLeave={handleServiceDragLeave}
                style={{ pointerEvents: draggingFeature ? 'auto' : 'none' }}
              ></div>
              <div
                className={`bg-gradient-to-r ${service.color} text-white p-4 relative z-10 pointer-events-none`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                      <Code />
                    </div>
                    {service.name}
                  </h4>
                </div>
              </div>
              <div className="p-4 relative z-10">
                <div className="space-y-2 min-h-[120px]">
                  {service.features.length > 0 ? (
                    service.features.map((feature: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-lg px-3 py-2 text-sm group hover:border-gray-300 transition-all"
                      >
                        <span className="flex items-center gap-2 pointer-events-none">
                          <span className="text-gray-500">
                            <Code className="w-4 h-4" />
                          </span>
                          <span className="text-gray-700">{feature}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFeatureFromService(service.id, feature);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1 hover:bg-red-50 rounded pointer-events-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`text-center py-8 border-2 border-dashed rounded-lg transition-all pointer-events-none ${
                        dragOverService === service.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <Package
                        className={`w-8 h-8 mx-auto mb-2 ${
                          dragOverService === service.id
                            ? 'text-blue-400 animate-pulse'
                            : 'text-gray-400'
                        }`}
                      />
                      <p
                        className={`text-sm ${
                          dragOverService === service.id ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        Drop features here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Add New Service Card */}
        <div
          onClick={() => setShowServiceMenu(true)}
          className="bg-white/50 backdrop-blur rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/80 transition-all cursor-pointer min-h-[200px] flex items-center justify-center group"
        >
          <div className="text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-3 group-hover:bg-blue-100 transition-colors">
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium group-hover:text-blue-600">Add New Service</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceGrid;
