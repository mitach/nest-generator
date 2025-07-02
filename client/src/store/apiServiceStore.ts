import { create } from 'zustand';
import { ProjectGeneratorAPI } from '../services/api/project-generator';

interface ServiceStore {
  projectGeneratorAPI: ProjectGeneratorAPI;
  // other API clients can go here (authAPI, socketAPI, etc)
}

console.log('!!>> API BASE URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

export const useApiServiceStore = create<ServiceStore>(() => ({
  projectGeneratorAPI: new ProjectGeneratorAPI(
    process.env.NEXT_PUBLIC_API_BASE_URL || 'https://nest-generator-backend-560247957398.europe-west1.run.app',
  ),
}));
