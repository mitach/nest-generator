import React from 'react';
import { X, Users, Lock, User, Settings, Globe } from 'lucide-react';
import { Service } from '@/lib/types';

interface UserFieldOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  required?: boolean;
}

interface UserFieldOptions {
  authentication: UserFieldOption[];
  profile: UserFieldOption[];
}

interface UserConfigModalProps {
  showUserConfig: boolean;
  setShowUserConfig: (show: boolean) => void;
  selectedService: Service | null;
  updateUserConfig: (serviceId: string, config: Record<string, unknown>) => void;
  userFieldOptions: UserFieldOptions;
  userFeatureOptions: Record<string, string>;
  socialLoginProviders: string[];
}

const UserConfigModal: React.FC<UserConfigModalProps> = ({
  showUserConfig,
  setShowUserConfig,
  selectedService,
  updateUserConfig,
  userFieldOptions,
  userFeatureOptions,
  socialLoginProviders,
}) => {
  if (!showUserConfig || selectedService?.type !== 'users') return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => setShowUserConfig(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            Configure User Module
          </h2>
          <button
            onClick={() => setShowUserConfig(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-2">
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Lock className="w-5 h-5 text-blue-600" />
              Authentication Fields
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {userFieldOptions.authentication.map((field) => (
                <label
                  key={field.id}
                  className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:shadow-md transition-all border border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedService.config?.authFields?.includes(field.id) || false}
                    onChange={(e) => {
                      const currentFields = selectedService.config?.authFields || [];
                      const newFields = e.target.checked
                        ? [...currentFields, field.id]
                        : currentFields.filter((f: string) => f !== field.id);
                      updateUserConfig(selectedService.id, {
                        ...selectedService.config,
                        authFields: newFields,
                      });
                    }}
                    disabled={field.required}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="text-blue-500">{field.icon}</span>
                    {field.label}
                    {field.required && (
                      <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <User className="w-5 h-5 text-green-600" />
              Profile Fields
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {userFieldOptions.profile.map((field) => (
                <label
                  key={field.id}
                  className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:shadow-md transition-all border border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedService.config?.profileFields?.includes(field.id) || false}
                    onChange={(e) => {
                      const currentFields = selectedService.config?.profileFields || [];
                      const newFields = e.target.checked
                        ? [...currentFields, field.id]
                        : currentFields.filter((f: string) => f !== field.id);
                      updateUserConfig(selectedService.id, {
                        ...selectedService.config,
                        profileFields: newFields,
                      });
                    }}
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">{field.icon}</span>
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-6 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Settings className="w-5 h-5 text-purple-600" />
              Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(userFeatureOptions).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:shadow-md transition-all border border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      (selectedService.config?.features as Record<string, boolean>)?.[key],
                    )}
                    onChange={(e) => {
                      updateUserConfig(selectedService.id, {
                        ...selectedService.config,
                        features: {
                          ...selectedService.config?.features,
                          [key]: e.target.checked,
                        },
                      });
                    }}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="text-gray-700">{label as string}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-6 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Globe className="w-5 h-5 text-orange-600" />
              Social Login Providers
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {socialLoginProviders.map((provider) => (
                <label
                  key={provider}
                  className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg hover:shadow-md transition-all border border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedService.config?.features?.socialLogin?.includes(provider) || false
                    }
                    onChange={(e) => {
                      const currentProviders = selectedService.config?.features?.socialLogin || [];
                      const newProviders = e.target.checked
                        ? [...currentProviders, provider]
                        : currentProviders.filter((p: string) => p !== provider);
                      updateUserConfig(selectedService.id, {
                        ...selectedService.config,
                        features: {
                          ...selectedService.config?.features,
                          socialLogin: newProviders,
                        },
                      });
                    }}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                  <span className="capitalize text-gray-700">{provider}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowUserConfig(false)}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowUserConfig(false)}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserConfigModal;
