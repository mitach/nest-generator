import React, { useState } from 'react';
import { X, FileText, Info, Check, BookOpen } from 'lucide-react';

interface SwaggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: { swaggerOptions: Partial<SwaggerConfig> }) => void;
}

interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  path: string;
  addBearerAuth: boolean;
  servers: Array<{ url: string; description: string }>;
}

const SwaggerModal: React.FC<SwaggerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<SwaggerConfig>({
    title: 'My API',
    description: 'API documentation',
    version: '1.0',
    path: 'api-docs',
    addBearerAuth: false,
    servers: [],
  });

  const [serverInput, setServerInput] = useState({ url: '', description: '' });

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

  const addServer = () => {
    if (serverInput.url.trim()) {
      setConfig((prev) => ({
        ...prev,
        servers: [
          ...prev.servers,
          {
            url: serverInput.url.trim(),
            description: serverInput.description.trim() || 'Server',
          },
        ],
      }));
      setServerInput({ url: '', description: '' });
    }
  };

  const removeServer = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    const filteredConfig = getFilteredConfig();
    console.log('Swagger Configuration (filtered):', filteredConfig);

    if (onSave) {
      onSave({ swaggerOptions: filteredConfig });
    }

    onClose();
  };

  const getFilteredConfig = () => {
    const defaultConfig: SwaggerConfig = {
      title: 'My API',
      description: 'API documentation',
      version: '1.0',
      path: 'api-docs',
      addBearerAuth: false,
      servers: [],
    };

    const filtered: Partial<SwaggerConfig> = {};

    if (config.title !== defaultConfig.title) {
      filtered.title = config.title;
    }
    if (config.description !== defaultConfig.description) {
      filtered.description = config.description;
    }
    if (config.version !== defaultConfig.version) {
      filtered.version = config.version;
    }
    if (config.path !== defaultConfig.path) {
      filtered.path = config.path;
    }
    if (config.addBearerAuth !== defaultConfig.addBearerAuth) {
      filtered.addBearerAuth = config.addBearerAuth;
    }
    if (config.servers.length > 0) {
      filtered.servers = config.servers;
    }

    return filtered;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Swagger Documentation Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">API Documentation</h4>
              <p className="text-blue-700 text-sm">
                Configure your API documentation settings. Swagger UI will be available at your
                specified path.
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">API Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My API"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Version</label>
              <input
                type="text"
                value={config.version}
                onChange={(e) => setConfig((prev) => ({ ...prev, version: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="API documentation"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Documentation Path
            </label>
            <input
              type="text"
              value={config.path}
              onChange={(e) => setConfig((prev) => ({ ...prev, path: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="api-docs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Swagger UI will be available at /{config.path}
            </p>
          </div>

          {/* Authentication */}
          <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
            <div>
              <span className="text-sm font-medium text-gray-700">JWT Bearer Authentication</span>
              <p className="text-xs text-gray-500">Add JWT Bearer auth to documentation</p>
            </div>
            <input
              type="checkbox"
              checked={config.addBearerAuth}
              onChange={(e) => setConfig((prev) => ({ ...prev, addBearerAuth: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {/* Servers */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Servers
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serverInput.url}
                  onChange={(e) => setServerInput((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={serverInput.description}
                  onChange={(e) =>
                    setServerInput((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Production server"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addServer}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              {config.servers.length > 0 && (
                <div className="space-y-2">
                  {config.servers.map((server, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-700">{server.url}</span>
                        {server.description && (
                          <span className="text-sm text-gray-500 ml-2">- {server.description}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeServer(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Configuration Preview (non-default values only)
            </h4>
            {Object.keys(getFilteredConfig()).length > 0 ? (
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {`const config = new DocumentBuilder()
${config.title !== 'My API' ? `  .setTitle('${config.title}')` : ''}
${config.description !== 'API documentation' ? `  .setDescription('${config.description}')` : ''}
${config.version !== '1.0' ? `  .setVersion('${config.version}')` : ''}
${config.addBearerAuth ? `  .addBearerAuth()` : ''}
${config.servers.map((s) => `  .addServer('${s.url}', '${s.description}')`).join('\n')}
  .build();`}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 italic">Using default Swagger configuration</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply Documentation Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwaggerModal;
