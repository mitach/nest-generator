import React, { useState } from 'react';
import { X, Shield, Info, Check, ChevronUp, ChevronDown, Lock, Eye, Globe } from 'lucide-react';

interface HelmetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: { helmetOptions: Partial<HelmetConfig> }) => void;
}

interface HelmetConfig {
  contentSecurityPolicy:
    | {
        directives: {
          defaultSrc: string[];
          scriptSrc: string[];
          styleSrc: string[];
          imgSrc: string[];
          connectSrc: string[];
          fontSrc: string[];
          objectSrc: string[];
          mediaSrc: string[];
          frameSrc: string[];
        };
      }
    | false;
  hsts:
    | {
        maxAge: number;
        includeSubDomains: boolean;
        preload: boolean;
      }
    | false;
  xFrameOptions: string | false;
  xContentTypeOptions: boolean;
  referrerPolicy: string | false;
  permissionsPolicy: Record<string, string[]> | false;
  xDnsPrefetchControl: boolean;
  xDownloadOptions: boolean;
  xPermittedCrossDomainPolicies: string | false;
  crossOriginEmbedderPolicy: string | false;
  crossOriginOpenerPolicy: string | false;
  crossOriginResourcePolicy: string | false;
  originAgentCluster: boolean;
}

const HelmetModal: React.FC<HelmetModalProps> = ({ isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState<HelmetConfig>({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: false,
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
    referrerPolicy: 'no-referrer',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
    },
    xDnsPrefetchControl: true,
    xDownloadOptions: true,
    xPermittedCrossDomainPolicies: 'none',
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCSP, setShowCSP] = useState(false);
  const [cspDirectiveInput, setCspDirectiveInput] = useState('');
  const [selectedCspDirective, setSelectedCspDirective] = useState('defaultSrc');

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

  const addCspDirective = () => {
    if (cspDirectiveInput.trim() && config.contentSecurityPolicy) {
      const directive =
        selectedCspDirective as keyof typeof config.contentSecurityPolicy.directives;
      const currentValues = config.contentSecurityPolicy.directives[directive] || [];

      if (!currentValues.includes(cspDirectiveInput.trim())) {
        setConfig((prev) => ({
          ...prev,
          contentSecurityPolicy: prev.contentSecurityPolicy
            ? {
                ...prev.contentSecurityPolicy,
                directives: {
                  ...prev.contentSecurityPolicy.directives,
                  [directive]: [...currentValues, cspDirectiveInput.trim()],
                },
              }
            : prev.contentSecurityPolicy,
        }));
        setCspDirectiveInput('');
      }
    }
  };

  const removeCspDirective = (directive: string, value: string) => {
    if (config.contentSecurityPolicy) {
      const dir = directive as keyof typeof config.contentSecurityPolicy.directives;
      setConfig((prev) => ({
        ...prev,
        contentSecurityPolicy: prev.contentSecurityPolicy
          ? {
              ...prev.contentSecurityPolicy,
              directives: {
                ...prev.contentSecurityPolicy.directives,
                [dir]: prev.contentSecurityPolicy.directives[dir].filter((v) => v !== value),
              },
            }
          : prev.contentSecurityPolicy,
      }));
    }
  };

  const handleSave = () => {
    const filteredConfig = getFilteredConfig();
    console.log('Helmet Configuration (filtered):', filteredConfig);

    if (onSave) {
      onSave({ helmetOptions: filteredConfig });
    }

    onClose();
  };

  const getFilteredConfig = () => {
    const defaultConfig: HelmetConfig = {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false,
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: true,
      referrerPolicy: 'no-referrer',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
      },
      xDnsPrefetchControl: true,
      xDownloadOptions: true,
      xPermittedCrossDomainPolicies: 'none',
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      originAgentCluster: true,
    };

    const filtered: Partial<HelmetConfig> = {};

    // Compare each property with default and only include if different
    if (
      JSON.stringify(config.contentSecurityPolicy) !==
      JSON.stringify(defaultConfig.contentSecurityPolicy)
    ) {
      filtered.contentSecurityPolicy = config.contentSecurityPolicy;
    }
    if (JSON.stringify(config.hsts) !== JSON.stringify(defaultConfig.hsts)) {
      filtered.hsts = config.hsts;
    }
    if (config.xFrameOptions !== defaultConfig.xFrameOptions) {
      filtered.xFrameOptions = config.xFrameOptions;
    }
    if (config.xContentTypeOptions !== defaultConfig.xContentTypeOptions) {
      filtered.xContentTypeOptions = config.xContentTypeOptions;
    }
    if (config.referrerPolicy !== defaultConfig.referrerPolicy) {
      filtered.referrerPolicy = config.referrerPolicy;
    }
    if (
      JSON.stringify(config.permissionsPolicy) !== JSON.stringify(defaultConfig.permissionsPolicy)
    ) {
      filtered.permissionsPolicy = config.permissionsPolicy;
    }
    if (config.xDnsPrefetchControl !== defaultConfig.xDnsPrefetchControl) {
      filtered.xDnsPrefetchControl = config.xDnsPrefetchControl;
    }
    if (config.xDownloadOptions !== defaultConfig.xDownloadOptions) {
      filtered.xDownloadOptions = config.xDownloadOptions;
    }
    if (config.xPermittedCrossDomainPolicies !== defaultConfig.xPermittedCrossDomainPolicies) {
      filtered.xPermittedCrossDomainPolicies = config.xPermittedCrossDomainPolicies;
    }
    if (config.crossOriginEmbedderPolicy !== defaultConfig.crossOriginEmbedderPolicy) {
      filtered.crossOriginEmbedderPolicy = config.crossOriginEmbedderPolicy;
    }
    if (config.crossOriginOpenerPolicy !== defaultConfig.crossOriginOpenerPolicy) {
      filtered.crossOriginOpenerPolicy = config.crossOriginOpenerPolicy;
    }
    if (config.crossOriginResourcePolicy !== defaultConfig.crossOriginResourcePolicy) {
      filtered.crossOriginResourcePolicy = config.crossOriginResourcePolicy;
    }
    if (config.originAgentCluster !== defaultConfig.originAgentCluster) {
      filtered.originAgentCluster = config.originAgentCluster;
    }

    return filtered;
  };

  const cspDirectives = [
    'defaultSrc',
    'scriptSrc',
    'styleSrc',
    'imgSrc',
    'connectSrc',
    'fontSrc',
    'objectSrc',
    'mediaSrc',
    'frameSrc',
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" />
            Helmet.js Security Configuration
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
          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800">Security Enhancement</h4>
              <p className="text-green-700 text-sm">
                Helmet.js helps secure your app by setting various HTTP headers. These are
                production-ready defaults.
              </p>
            </div>
          </div>

          {/* Basic Security Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* X-Frame-Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                X-Frame-Options
              </label>
              <select
                value={config.xFrameOptions || 'false'}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    xFrameOptions: e.target.value === 'false' ? false : e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="DENY">DENY</option>
                <option value="SAMEORIGIN">SAMEORIGIN</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            {/* Referrer Policy */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Referrer Policy
              </label>
              <select
                value={config.referrerPolicy || 'false'}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    referrerPolicy: e.target.value === 'false' ? false : e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="no-referrer">no-referrer</option>
                <option value="no-referrer-when-downgrade">no-referrer-when-downgrade</option>
                <option value="origin">origin</option>
                <option value="origin-when-cross-origin">origin-when-cross-origin</option>
                <option value="same-origin">same-origin</option>
                <option value="strict-origin">strict-origin</option>
                <option value="strict-origin-when-cross-origin">
                  strict-origin-when-cross-origin
                </option>
                <option value="unsafe-url">unsafe-url</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          {/* Basic Security Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium text-gray-700">X-Content-Type-Options</span>
                <p className="text-xs text-gray-500">Prevents MIME type sniffing</p>
              </div>
              <input
                type="checkbox"
                checked={config.xContentTypeOptions}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    xContentTypeOptions: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium text-gray-700">DNS Prefetch Control</span>
                <p className="text-xs text-gray-500">Controls DNS prefetching</p>
              </div>
              <input
                type="checkbox"
                checked={config.xDnsPrefetchControl}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    xDnsPrefetchControl: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium text-gray-700">X-Download-Options</span>
                <p className="text-xs text-gray-500">IE8+ download security</p>
              </div>
              <input
                type="checkbox"
                checked={config.xDownloadOptions}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    xDownloadOptions: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <div>
                <span className="text-sm font-medium text-gray-700">Origin Agent Cluster</span>
                <p className="text-xs text-gray-500">Process isolation</p>
              </div>
              <input
                type="checkbox"
                checked={config.originAgentCluster}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    originAgentCluster: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </label>
          </div>

          {/* HSTS Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                HTTP Strict Transport Security (HSTS)
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.hsts !== false}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hsts: e.target.checked
                        ? {
                            maxAge: 31536000,
                            includeSubDomains: true,
                            preload: false,
                          }
                        : false,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Enable</span>
              </label>
            </div>

            {config.hsts && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Age (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.hsts.maxAge}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hsts: prev.hsts
                          ? {
                              ...prev.hsts,
                              maxAge: parseInt(e.target.value) || 0,
                            }
                          : prev.hsts,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hsts.includeSubDomains}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hsts: prev.hsts
                          ? {
                              ...prev.hsts,
                              includeSubDomains: e.target.checked,
                            }
                          : prev.hsts,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include Subdomains</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.hsts.preload}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        hsts: prev.hsts
                          ? {
                              ...prev.hsts,
                              preload: e.target.checked,
                            }
                          : prev.hsts,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Preload</span>
                </label>
              </div>
            )}
          </div>

          {/* Content Security Policy */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                Content Security Policy (CSP)
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.contentSecurityPolicy !== false}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        contentSecurityPolicy: e.target.checked
                          ? {
                              directives: {
                                defaultSrc: ["'self'"],
                                scriptSrc: ["'self'"],
                                styleSrc: ["'self'", "'unsafe-inline'"],
                                imgSrc: ["'self'", 'data:', 'https:'],
                                connectSrc: ["'self'"],
                                fontSrc: ["'self'"],
                                objectSrc: ["'none'"],
                                mediaSrc: ["'self'"],
                                frameSrc: ["'none'"],
                              },
                            }
                          : false,
                      }))
                    }
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Enable</span>
                </label>
                {config.contentSecurityPolicy && (
                  <button
                    onClick={() => setShowCSP(!showCSP)}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  >
                    Configure
                    {showCSP ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {config.contentSecurityPolicy && showCSP && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div className="flex gap-2">
                  <select
                    value={selectedCspDirective}
                    onChange={(e) => setSelectedCspDirective(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {cspDirectives.map((directive) => (
                      <option key={directive} value={directive}>
                        {directive}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cspDirectiveInput}
                    onChange={(e) => setCspDirectiveInput(e.target.value)}
                    placeholder="'self', 'unsafe-inline', https://example.com"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCspDirective()}
                  />
                  <button
                    onClick={addCspDirective}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-3">
                  {cspDirectives.map((directive) => {
                    const values = config.contentSecurityPolicy
                      ? config.contentSecurityPolicy.directives[
                          directive as keyof typeof config.contentSecurityPolicy.directives
                        ] || []
                      : [];

                    if (values.length === 0) return null;

                    return (
                      <div key={directive}>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{directive}</h4>
                        <div className="flex flex-wrap gap-2">
                          {values.map((value, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                            >
                              {value}
                              <button
                                onClick={() => removeCspDirective(directive, value)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Advanced Cross-Origin Options
              </h3>
              {showAdvanced ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cross-Origin-Embedder-Policy
                  </label>
                  <select
                    value={config.crossOriginEmbedderPolicy || 'false'}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        crossOriginEmbedderPolicy:
                          e.target.value === 'false' ? false : e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="false">Disabled</option>
                    <option value="unsafe-none">unsafe-none</option>
                    <option value="require-corp">require-corp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cross-Origin-Opener-Policy
                  </label>
                  <select
                    value={config.crossOriginOpenerPolicy || 'false'}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        crossOriginOpenerPolicy:
                          e.target.value === 'false' ? false : e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="false">Disabled</option>
                    <option value="unsafe-none">unsafe-none</option>
                    <option value="same-origin-allow-popups">same-origin-allow-popups</option>
                    <option value="same-origin">same-origin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cross-Origin-Resource-Policy
                  </label>
                  <select
                    value={config.crossOriginResourcePolicy || 'false'}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        crossOriginResourcePolicy:
                          e.target.value === 'false' ? false : e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="false">Disabled</option>
                    <option value="same-site">same-site</option>
                    <option value="same-origin">same-origin</option>
                    <option value="cross-origin">cross-origin</option>
                  </select>
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
                {`app.use(helmet(${JSON.stringify(getFilteredConfig(), null, 2)}))`}
              </pre>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Using default Helmet configuration (no custom options needed)
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
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply Security Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelmetModal;
