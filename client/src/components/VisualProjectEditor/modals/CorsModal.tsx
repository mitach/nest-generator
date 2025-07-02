import React, { useState } from 'react';
import { X, Globe, Shield, Info, Check, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

interface CorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: { corsOptions: Partial<CorsConfig> }) => void;
}

interface CorsConfig {
  origin: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

const CorsModal: React.FC<CorsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<CorsConfig>({
    origin: ['*'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exposedHeaderInput, setExposedHeaderInput] = useState('');
  const [originInput, setOriginInput] = useState('*');
  const [headerInput, setHeaderInput] = useState('');

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

  const handleMethodChange = (method: string) => {
    setConfig((prev) => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter((m) => m !== method)
        : [...prev.methods, method],
    }));
  };

  const addOrigin = () => {
    if (originInput.trim() && !config.origin.includes(originInput.trim())) {
      setConfig((prev) => ({
        ...prev,
        origin: [...prev.origin.filter((o) => o !== '*'), originInput.trim()],
      }));
      setOriginInput('');
    }
  };

  const removeOrigin = (origin: string) => {
    setConfig((prev) => ({
      ...prev,
      origin: prev.origin.filter((o) => o !== origin),
    }));
  };

  const addHeader = () => {
    if (headerInput.trim() && !config.allowedHeaders.includes(headerInput.trim())) {
      setConfig((prev) => ({
        ...prev,
        allowedHeaders: [...prev.allowedHeaders, headerInput.trim()],
      }));
      setHeaderInput('');
    }
  };

  const removeHeader = (header: string) => {
    setConfig((prev) => ({
      ...prev,
      allowedHeaders: prev.allowedHeaders.filter((h) => h !== header),
    }));
  };

  const addExposedHeader = () => {
    if (exposedHeaderInput.trim() && !config.exposedHeaders.includes(exposedHeaderInput.trim())) {
      setConfig((prev) => ({
        ...prev,
        exposedHeaders: [...prev.exposedHeaders, exposedHeaderInput.trim()],
      }));
      setExposedHeaderInput('');
    }
  };

  const removeExposedHeader = (header: string) => {
    setConfig((prev) => ({
      ...prev,
      exposedHeaders: prev.exposedHeaders.filter((h) => h !== header),
    }));
  };

  const handleSave = () => {
    const filteredConfig = getFilteredConfig();
    console.log('CORS Configuration (filtered):', filteredConfig);

    if (onSave) {
      onSave({ corsOptions: filteredConfig });
    }

    onClose();
  };

  const getFilteredConfig = () => {
    const defaultConfig: CorsConfig = {
      origin: ['*'],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: [],
      exposedHeaders: [],
      credentials: false,
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    const filtered: Partial<CorsConfig> = {};

    // Compare each property with default and only include if different
    if (JSON.stringify(config.origin) !== JSON.stringify(defaultConfig.origin)) {
      filtered.origin = config.origin;
    }
    if (JSON.stringify(config.methods) !== JSON.stringify(defaultConfig.methods)) {
      filtered.methods = config.methods;
    }
    if (JSON.stringify(config.allowedHeaders) !== JSON.stringify(defaultConfig.allowedHeaders)) {
      filtered.allowedHeaders = config.allowedHeaders;
    }
    if (config.credentials !== defaultConfig.credentials) {
      filtered.credentials = config.credentials;
    }
    if (JSON.stringify(config.exposedHeaders) !== JSON.stringify(defaultConfig.exposedHeaders)) {
      filtered.exposedHeaders = config.exposedHeaders;
    }
    if (config.maxAge !== defaultConfig.maxAge) {
      filtered.maxAge = config.maxAge;
    }
    if (config.preflightContinue !== defaultConfig.preflightContinue) {
      filtered.preflightContinue = config.preflightContinue;
    }
    if (config.optionsSuccessStatus !== defaultConfig.optionsSuccessStatus) {
      filtered.optionsSuccessStatus = config.optionsSuccessStatus;
    }

    return filtered;
  };

  const availableMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

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
            <Globe className="w-6 h-6 text-blue-500" />
            CORS Configuration
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
          {/* Security Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">Security Notice</h4>
              <p className="text-amber-700 text-sm">
                Using &quot;*&quot; for origins allows any domain to access your API. Use specific
                domains in production.
              </p>
            </div>
          </div>

          {/* Allowed Origins */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Allowed Origins
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => setOriginInput(e.target.value)}
                  placeholder="https://example.com or *"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addOrigin()}
                />
                <button
                  onClick={addOrigin}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.origin.map((origin, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {origin}
                    <button
                      onClick={() => removeOrigin(origin)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* HTTP Methods */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Allowed Methods
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableMethods.map((method) => (
                <label key={method} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.methods.includes(method)}
                    onChange={() => handleMethodChange(method)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allowed Headers */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Allowed Headers
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={headerInput}
                  onChange={(e) => setHeaderInput(e.target.value)}
                  placeholder="Content-Type, Authorization, etc."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addHeader()}
                />
                <button
                  onClick={addHeader}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.allowedHeaders.map((header, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {header}
                    <button
                      onClick={() => removeHeader(header)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Credentials */}
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700">Allow Credentials</span>
              <p className="text-xs text-gray-500">Include cookies and authorization headers</p>
            </div>
            <input
              type="checkbox"
              checked={config.credentials}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  credentials: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {/* Advanced Options */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Advanced Options
              </h3>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Exposed Headers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exposed Headers
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Headers that clients are allowed to access
                  </p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={exposedHeaderInput}
                        onChange={(e) => setExposedHeaderInput(e.target.value)}
                        placeholder="X-Total-Count, X-Custom-Header"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addExposedHeader()}
                      />
                      <button
                        onClick={addExposedHeader}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                      >
                        Add
                      </button>
                    </div>
                    {config.exposedHeaders.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {config.exposedHeaders.map((header, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                          >
                            {header}
                            <button
                              onClick={() => removeExposedHeader(header)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Max Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preflight Max Age (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.maxAge}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        maxAge: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="86400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long browsers can cache preflight results (0-86400)
                  </p>
                </div>

                {/* Preflight Continue */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Preflight Continue</span>
                    <p className="text-xs text-gray-500">
                      Pass control to next handler after preflight
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.preflightContinue}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        preflightContinue: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                {/* Options Success Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OPTIONS Success Status
                  </label>
                  <select
                    value={config.optionsSuccessStatus}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        optionsSuccessStatus: parseInt(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={200}>200 OK</option>
                    <option value={204}>204 No Content</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Status code for successful OPTIONS requests
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Configuration Preview (non-default values only)
            </h4>
            {Object.keys(getFilteredConfig()).length > 0 ? (
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {`app.enableCors(${JSON.stringify(getFilteredConfig(), null, 2)}))`}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Using default CORS configuration (no custom options needed)
              </p>
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
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorsModal;
