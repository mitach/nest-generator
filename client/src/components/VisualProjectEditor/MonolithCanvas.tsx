import { useState } from 'react';
import { Package, Trash2, Settings, Code } from 'lucide-react';
import { getModalForFeature, hasModalForFeature } from './modals/modalRegistry';

import { useMonolithStore } from '@/store/monolithStore';
import { useProjectStore } from '@/store/projectStore';

const MonolithCanvas: React.FC = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);

  const { monolithFeatures, removeFeature } = useMonolithStore();
  const { setFeatureConfig } = useProjectStore();

  const handleOpenModal = (feature: string) => {
    setOpenModal(feature);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <h3 className="font-bold text-2xl flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
              <Package className="w-8 h-8" />
            </div>
            Monolith Application
          </h3>
          <p className="text-blue-100 mt-2">All features in a single, unified application</p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {monolithFeatures.length > 0 ? (
              monolithFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-gray-500">
                      <Code className="w-4 h-4" />
                    </span>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {hasModalForFeature(feature) && (
                      <button
                        onClick={() => handleOpenModal(feature)}
                        className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-all"
                        title="Feature Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFeature(feature)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border-3 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No features added yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Use the sidebar to browse and add features
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Modal */}
      {openModal &&
        (() => {
          const ModalComponent = getModalForFeature(openModal);
          if (!ModalComponent) return null;

          return (
            <ModalComponent
              isOpen={true}
              onClose={handleCloseModal}
              onSave={(config) => {
                setFeatureConfig(openModal, config);
                handleCloseModal();
              }}
            />
          );
        })()}
    </div>
  );
};

export default MonolithCanvas;
