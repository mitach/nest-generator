import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ProjectConfig } from '../services/api/project-generator';
import { GenerationError, getErrorMessage, getErrorSolution } from '@/lib/errors';
import { useApiServiceStore } from '../store/apiServiceStore';

export const useProjectGenerator = (projectName: string) => {
  const api = useApiServiceStore((state) => state.projectGeneratorAPI);
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(
    async (downloadUrl: string) => {
      try {
        const blob = await api.downloadProject(downloadUrl);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${projectName || 'project'}.zip`;
        link.click();
      } catch (error) {
        if (error instanceof GenerationError) {
          throw error;
        }
        throw new GenerationError({
          message: 'Failed to download project file',
          code: 'DOWNLOAD_ERROR',
          timestamp: new Date().toISOString(),
        });
      }
    },
    [api, projectName],
  );

  const pollStatus = useCallback(
    async (generationId: string, pollingToast: string): Promise<void> => {
      try {
        const { status, downloadUrl, error } = await api.checkStatus(generationId);

        if (status === 'completed' && downloadUrl) {
          toast.success('Project ready! Downloading...', { id: pollingToast });
          await handleDownload(downloadUrl);
          setLoading(false);
        } else if (status === 'failed') {
          if (error) {
            const userMessage = getErrorMessage(error);
            const solution = getErrorSolution(error);

            toast.error(`${userMessage}${solution ? `\n💡 ${solution}` : ''}`, {
              id: pollingToast,
              duration: 8000,
            });
          } else {
            toast.error('Generation failed for unknown reason', { id: pollingToast });
          }
          setLoading(false);
        } else {
          setTimeout(() => pollStatus(generationId, pollingToast), 2000);
        }
      } catch (error) {
        let errorMessage = 'Failed to check generation status';

        if (error instanceof GenerationError) {
          errorMessage = getErrorMessage(error.response);
          const solution = getErrorSolution(error.response);
          if (solution) {
            errorMessage += `\n💡 ${solution}`;
          }
          console.error('Status check failed:', error.response);
        } else {
          console.error('Unexpected error:', error);
        }

        toast.error(errorMessage, {
          id: pollingToast,
          duration: 6000,
        });
        setLoading(false);
      }
    },
    [api, handleDownload],
  );

  const handleGenerateProject = useCallback(
    async (config: ProjectConfig) => {
      setLoading(true);
      const pollingToast = toast.loading('Starting project generation...');

      try {
        const { generationId } = await api.generateProject(config);
        toast.loading(`🛠️ Generating ${config.architecture} project...`, {
          id: pollingToast,
        });

        await pollStatus(generationId, pollingToast);
      } catch (error) {
        let errorMessage = 'Failed to start project generation';

        if (error instanceof GenerationError) {
          errorMessage = getErrorMessage(error.response);
          const solution = getErrorSolution(error.response);
          if (solution) {
            errorMessage += `\n💡 ${solution}`;
          }
        } else {
          console.error('Unexpected error during generation:', error);
        }

        toast.error(errorMessage, {
          id: pollingToast,
          duration: 8000,
        });
        setLoading(false);
      }
    },
    [api, pollStatus],
  );

  return { loading, handleGenerateProject };
};
