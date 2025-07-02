import React, { useState } from 'react';
import { X, Clock, Info, Check, Shield, Zap } from 'lucide-react';

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: { rateLimitOptions: Partial<RateLimitConfig> }) => void;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests: boolean;
}

const RateLimitModal: React.FC<RateLimitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<RateLimitConfig>({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  });

  // Helper to convert ms to minutes for display
  const msToMinutes = (ms: number) => Math.round(ms / (60 * 1000));
  const minutesToMs = (minutes: number) => minutes * 60 * 1000;

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

  const handleSave = () => {
    const filteredConfig = getFilteredConfig();
    console.log('Rate Limit Configuration (filtered):', filteredConfig);

    if (onSave) {
      onSave({ rateLimitOptions: filteredConfig });
    }

    onClose();
  };

  const getFilteredConfig = () => {
    const defaultConfig: RateLimitConfig = {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    };

    const filtered: Partial<RateLimitConfig> = {};

    if (config.windowMs !== defaultConfig.windowMs) {
      filtered.windowMs = config.windowMs;
    }
    if (config.max !== defaultConfig.max) {
      filtered.max = config.max;
    }
    if (config.message !== defaultConfig.message) {
      filtered.message = config.message;
    }
    if (config.standardHeaders !== defaultConfig.standardHeaders) {
      filtered.standardHeaders = config.standardHeaders;
    }
    if (config.legacyHeaders !== defaultConfig.legacyHeaders) {
      filtered.legacyHeaders = config.legacyHeaders;
    }
    if (config.skipSuccessfulRequests !== defaultConfig.skipSuccessfulRequests) {
      filtered.skipSuccessfulRequests = config.skipSuccessfulRequests;
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
            <Zap className="w-6 h-6 text-orange-500" />
            Rate Limiting Configuration
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
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
            <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800">Request Rate Limiting</h4>
              <p className="text-orange-700 text-sm">
                Protect your API from abuse by limiting the number of requests per IP address.
              </p>
            </div>
          </div>

          {/* Main Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Window (minutes)
              </label>
              <input
                type="number"
                value={msToMinutes(config.windowMs)}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    windowMs: minutesToMs(parseInt(e.target.value) || 1),
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="1440"
              />
              <p className="text-xs text-gray-500 mt-1">
                How long to remember requests (1-1440 minutes)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Requests</label>
              <input
                type="number"
                value={config.max}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    max: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="1"
                max="10000"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum requests per IP per window</p>
            </div>
          </div>

          {/* Rate Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-700">Rate Limit Summary</span>
            </div>
            <p className="text-sm text-gray-600">
              Each IP can make <strong>{config.max}</strong> requests every{' '}
              <strong>{msToMinutes(config.windowMs)}</strong> minute
              {msToMinutes(config.windowMs) !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rate Limit Message
            </label>
            <textarea
              value={config.message}
              onChange={(e) => setConfig((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              placeholder="Too many requests from this IP, please try again later."
            />
            <p className="text-xs text-gray-500 mt-1">Message shown when rate limit is exceeded</p>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium text-gray-700">Standard Headers</span>
                <p className="text-xs text-gray-500">Include rate limit info in headers</p>
              </div>
              <input
                type="checkbox"
                checked={config.standardHeaders}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, standardHeaders: e.target.checked }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium text-gray-700">Legacy Headers</span>
                <p className="text-xs text-gray-500">Include X-RateLimit-* headers</p>
              </div>
              <input
                type="checkbox"
                checked={config.legacyHeaders}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, legacyHeaders: e.target.checked }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50 md:col-span-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Skip Successful Requests</span>
                <p className="text-xs text-gray-500">
                  Only count failed requests (4xx/5xx responses)
                </p>
              </div>
              <input
                type="checkbox"
                checked={config.skipSuccessfulRequests}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, skipSuccessfulRequests: e.target.checked }))
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
            </label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Configuration Preview (non-default values only)
            </h4>
            {Object.keys(getFilteredConfig()).length > 0 ? (
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {`const limiter = rateLimit(${JSON.stringify(getFilteredConfig(), null, 2)});`}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Using default rate limiting configuration
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
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply Rate Limiting
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateLimitModal;
