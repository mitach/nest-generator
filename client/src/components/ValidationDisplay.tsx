import React from 'react';
import { AlertTriangle, XCircle, CheckCircle, Info } from 'lucide-react';
import { ValidationResult } from '@/lib/validation/validation.types';

interface ValidationDisplayProps {
  validation: ValidationResult;
  className?: string;
  showSuccessState?: boolean;
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validation,
  className = '',
  showSuccessState = true,
}) => {
  if (!validation.hasIssues && !showSuccessState) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {!validation.hasIssues && showSuccessState && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-green-800">Configuration is valid</span>
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-red-800">Configuration Errors</span>
          </div>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-400 mt-1 flex-shrink-0">•</span>
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm font-medium text-amber-800">Configuration Warnings</span>
          </div>
          <ul className="space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-400 mt-1 flex-shrink-0">•</span>
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface ValidationFieldProps {
  fieldName: string;
  validation: ValidationResult;
  children: React.ReactNode;
}

export const ValidationField: React.FC<ValidationFieldProps> = ({
  fieldName,
  validation,
  children,
}) => {
  const fieldErrors = validation.errors.filter((e) => e.field === fieldName);
  const hasFieldErrors = fieldErrors.length > 0;

  return (
    <div className="space-y-2">
      <div className={hasFieldErrors ? 'has-error' : ''}>{children}</div>
      {fieldErrors.length > 0 && (
        <div className="flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            {fieldErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ValidationSummaryProps {
  validation: ValidationResult;
  onGenerateClick?: () => void;
  generateButtonText?: string;
  isGenerating?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  validation,
  onGenerateClick,
  generateButtonText = 'Generate Project',
  isGenerating = false,
}) => {
  return (
    <div className="space-y-4">
      <ValidationDisplay validation={validation} showSuccessState={false} />

      {onGenerateClick && (
        <div className="flex items-center gap-3">
          <button
            onClick={onGenerateClick}
            disabled={!validation.isValid || isGenerating}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              validation.isValid && !isGenerating
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isGenerating
              ? 'Generating...'
              : validation.isValid
                ? generateButtonText
                : 'Fix errors to generate'}
          </button>

          {validation.warnings.length > 0 && validation.errors.length === 0 && (
            <div className="flex items-center gap-1 text-amber-600">
              <Info className="w-4 h-4" />
              <span className="text-sm">With warnings</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
