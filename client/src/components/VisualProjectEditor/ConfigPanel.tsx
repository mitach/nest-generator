import { Code, Download } from 'lucide-react';
import { useProjectGenerator } from '@/hooks/useProjectGenerator';
import { useProjectStore } from '@/store/projectStore';
import { useMonolithStore } from '@/store/monolithStore';
import { useProjectValidation } from '@/hooks/useProjectValidation';
import { ValidationSummary } from '@/components/ValidationDisplay';
import toast from 'react-hot-toast';

const ConfigPanel: React.FC = () => {
  const { projectName, architecture } = useProjectStore();
  const { generateMonolithConfig } = useMonolithStore();
  const validation = useProjectValidation();

  const { loading, handleGenerateProject } = useProjectGenerator(projectName);

  const getConfig = () => {
    if (architecture === 'monolith') {
      return generateMonolithConfig();
    } else {
      // For microservices, use the passed function until we create ServiceStore
      return {
        projectName: 'test',
        architecture: 'microservice',
        services: [],
        config: {},
      };
    }
  };

  const handleGenerateClick = () => {
    if (!validation.isValid) {
      toast.error('Please fix configuration errors before generating');
      return;
    }

    try {
      const config = getConfig();
      if (!projectName?.trim()) {
        toast.error('Please enter a project name');
        return;
      }

      if (architecture === 'monolith') {
        const monolithConfig = config as { features?: string[] };
        if (!monolithConfig.features || monolithConfig.features.length === 0) {
          toast.error('Please add at least one feature to your project');
          return;
        }
      }

      handleGenerateProject(config);
    } catch (error) {
      console.warn('Config generation error:', error);
      toast.error('Failed to prepare project configuration. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-2xl">
      <div className="p-4">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Generated Configuration
            </h3>

            <div className="flex justify-between items-center gap-2">
              <ValidationSummary validation={validation} isGenerating={loading} />

              <button
                onClick={handleGenerateClick}
                disabled={loading || !validation.isValid}
                className={`
                  bg-gradient-to-r from-blue-500 to-blue-600
                  px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all
                  ${loading || !validation.isValid ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-xl'}
                `}
              >
                <Download className="w-5 h-5" />
                {loading ? 'Generating...' : 'Generate & Download'}
              </button>
            </div>

            <div className="bg-black/40 backdrop-blur rounded-xl p-4 overflow-hidden mt-4">
              <pre className="text-sm overflow-x-auto max-h-32 text-gray-300">
                {JSON.stringify(getConfig(), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
