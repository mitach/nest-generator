import React, { useState } from 'react';
import { X, Zap, Info, Check, Gauge, FileArchive } from 'lucide-react';

interface CompressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: { compressionOptions: Partial<CompressionConfig> }) => void;
}

interface CompressionConfig {
  level: number;
  threshold: number;
  filter: string[];
  chunkSize: number;
}

const CompressionModal: React.FC<CompressionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<CompressionConfig>({
    level: 6,
    threshold: 1024,
    filter: ['text/*', 'application/json', 'application/javascript', 'application/xml'],
    chunkSize: 16384,
  });

  const [customFilter, setCustomFilter] = useState('');

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

  const addFilter = () => {
    if (customFilter.trim() && !config.filter.includes(customFilter.trim())) {
      setConfig((prev) => ({
        ...prev,
        filter: [...prev.filter, customFilter.trim()],
      }));
      setCustomFilter('');
    }
  };

  const removeFilter = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      filter: prev.filter.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    const filteredConfig = getFilteredConfig();
    console.log('Compression Configuration (filtered):', filteredConfig);

    if (onSave) {
      onSave({ compressionOptions: filteredConfig });
    }

    onClose();
  };

  const getFilteredConfig = () => {
    const defaultConfig: CompressionConfig = {
      level: 6,
      threshold: 1024,
      filter: ['text/*', 'application/json', 'application/javascript', 'application/xml'],
      chunkSize: 16384,
    };

    const filtered: Partial<CompressionConfig> = {};

    if (config.level !== defaultConfig.level) {
      filtered.level = config.level;
    }
    if (config.threshold !== defaultConfig.threshold) {
      filtered.threshold = config.threshold;
    }
    if (JSON.stringify(config.filter) !== JSON.stringify(defaultConfig.filter)) {
      filtered.filter = config.filter;
    }
    if (config.chunkSize !== defaultConfig.chunkSize) {
      filtered.chunkSize = config.chunkSize;
    }

    return filtered;
  };

  const getLevelDescription = (level: number) => {
    if (level <= 1) return 'Fastest, least compression';
    if (level <= 3) return 'Fast compression';
    if (level <= 6) return 'Balanced (recommended)';
    if (level <= 8) return 'Better compression';
    return 'Best compression, slowest';
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
            <FileArchive className="w-6 h-6 text-blue-500" />
            Compression Configuration
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
            <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Response Compression</h4>
              <p className="text-blue-700 text-sm">
                Reduce response sizes and improve performance by compressing HTTP responses.
              </p>
            </div>
          </div>

          {/* Compression Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Compression Level
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="9"
                value={config.level}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, level: parseInt(e.target.value) }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span className="font-semibold text-blue-600">Level {config.level}</span>
                <span>9</span>
              </div>
              <p className="text-sm text-gray-600">{getLevelDescription(config.level)}</p>
            </div>
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Compression Threshold (bytes)
            </label>
            <input
              type="number"
              value={config.threshold}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  threshold: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="1048576"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only compress responses larger than this size ({(config.threshold / 1024).toFixed(1)}{' '}
              KB)
            </p>
          </div>

          {/* Content Types Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content Types to Compress
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFilter}
                  onChange={(e) => setCustomFilter(e.target.value)}
                  placeholder="e.g., text/css, application/pdf"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addFilter}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              {config.filter.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {config.filter.map((filter, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{filter}</span>
                      <button
                        onClick={() => removeFilter(idx)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Chunk Size (bytes)
            </label>
            <select
              value={config.chunkSize}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  chunkSize: parseInt(e.target.value),
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={8192}>8 KB (8192 bytes)</option>
              <option value={16384}>16 KB (16384 bytes) - Default</option>
              <option value={32768}>32 KB (32768 bytes)</option>
              <option value={65536}>64 KB (65536 bytes)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Size of compression chunks for streaming</p>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-700">Configuration Summary</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • Compression level: <strong>{config.level}</strong> (
                {getLevelDescription(config.level).toLowerCase()})
              </p>
              <p>
                • Threshold: <strong>{(config.threshold / 1024).toFixed(1)} KB</strong>
              </p>
              <p>
                • Content types: <strong>{config.filter.length}</strong> patterns
              </p>
              <p>
                • Chunk size: <strong>{config.chunkSize / 1024} KB</strong>
              </p>
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
                {`app.use(compression(${JSON.stringify(getFilteredConfig(), null, 2)}));`}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Using default compression configuration
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
            Apply Compression
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompressionModal;
