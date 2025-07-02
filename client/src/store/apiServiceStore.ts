import { create } from 'zustand';
import { ProjectGeneratorAPI } from '../services/api/project-generator';

interface ServiceStore {
  projectGeneratorAPI: ProjectGeneratorAPI;
  // other API clients can go here (authAPI, socketAPI, etc)
}

export const useApiServiceStore = create<ServiceStore>(() => ({
  projectGeneratorAPI: new ProjectGeneratorAPI(
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  ),
}));
