'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useProjectConfig } from '../hooks/useProjectConfig';
import { useExpandableSection } from '../hooks/useExpandableSection';
import { ProjectGeneratorAPI } from '../services/api';
import { ArchitectureSelector } from './ui/ArchitectureSelector';
import { MonolithFeatures } from './features/MonolithFeatures';
import { MicroserviceFeatures } from './features/MicroserviceFeatures';

const api = new ProjectGeneratorAPI();

export const ProjectGenerator: React.FC = () => {
  const {
    projectName,
    setProjectName,
    architecture,
    setArchitecture,
    monolithFeatures,
    services,
    getProjectConfig,
    toggleFeature,
    addService,
    removeService
  } = useProjectConfig();

  const { toggleSection, isExpanded } = useExpandableSection();
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setResponseMessage(null);
    
    try {
      const config = getProjectConfig();
      console.log('Submitting config:', config);
      
      const { generationId } = await api.generateProject(config);
      setResponseMessage(`🛠️ Generating ${architecture} project...`);

      const pollStatus = async () => {
        const { status, downloadUrl, error } = await api.checkStatus(generationId);

        if (status === 'completed' && downloadUrl) {
          setResponseMessage('✅ Project ready! Downloading...');
          
          const blob = await api.downloadProject(downloadUrl);
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${projectName || 'project'}.zip`;
          link.click();

          setLoading(false);
        } else if (status === 'failed') {
          setLoading(false);
          setResponseMessage(`❌ Generation failed: ${error}`);
        } else {
          setTimeout(pollStatus, 2000);
        }
      };

      pollStatus();
    } catch (err: any) {
      setLoading(false);
      setResponseMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <h1 className="text-3xl font-bold text-white">NestJS Project Generator</h1>
            <p className="text-blue-100 mt-2">Generate custom NestJS applications with your preferred architecture</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Configuration Panel */}
            <div className="lg:w-2/3 p-6">
              {/* Project Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="my-nestjs-app"
                />
              </div>

              <ArchitectureSelector
                selected={architecture}
                onSelect={setArchitecture}
              />

              {/* Features Configuration */}
              {architecture === 'monolith' && (
                <MonolithFeatures
                  selectedFeatures={monolithFeatures}
                  onToggleFeature={toggleFeature}
                  isExpanded={isExpanded}
                  onToggleSection={toggleSection}
                />
              )}

              {architecture === 'microservice' && (
                <MicroserviceFeatures
                  services={services}
                  onToggleFeature={toggleFeature}
                  onAddService={addService}
                  onRemoveService={removeService}
                  isExpanded={isExpanded}
                  onToggleSection={toggleSection}
                />
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:w-1/3 bg-gray-50 p-6 border-l border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration Preview</h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <pre className="text-xs text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(getProjectConfig(), null, 2)}
                </pre>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!architecture || loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Download size={16} />
                {loading ? 'Generating...' : 'Generate & Download'}
              </button>

              {responseMessage && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{responseMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};