import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProjectValidation } from '@/hooks/useProjectValidation';
import { ValidationField } from '@/components/ValidationDisplay';

interface TopBarProps {
  projectName: string;
  setProjectName: (name: string) => void;
  architecture: string;
  setArchitecture: (arch: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  projectName,
  setProjectName,
  architecture,
  setArchitecture,
}) => {
  const validation = useProjectValidation();

  const projectNameValidation = validation.validateField('projectName');
  const architectureValidation = validation.validateField('architecture');

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-blue-500" />
          <span className="font-bold text-xl text-gray-800">NestJS Project Editor</span>

          <div className="flex items-center gap-2 ml-4">
            {validation.isValid ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ValidationField fieldName="projectName" validation={projectNameValidation}>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={`border rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 min-w-48 ${
                  projectNameValidation.errors.length > 0
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-400'
                }`}
                placeholder="my-nestjs-app"
              />
            </div>
          </ValidationField>

          <ValidationField fieldName="architecture" validation={architectureValidation}>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Architecture</label>
              <select
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                className={`border rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 ${
                  architectureValidation.errors.length > 0
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-blue-400'
                }`}
              >
                <option value="microservice">Microservice</option>
                <option value="monolith">Monolith</option>
              </select>
            </div>
          </ValidationField>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
