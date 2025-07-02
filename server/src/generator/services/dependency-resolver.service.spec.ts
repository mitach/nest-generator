import { Test, TestingModule } from '@nestjs/testing';
import { DependencyResolverService } from './dependency-resolver.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('DependencyResolverService', () => {
  let service: DependencyResolverService;
  let mockReadFileSync: jest.SpyInstance;

  const mockRegistry = {
    metadata: {
      version: '1.0.0',
      lastUpdated: '2024-01-15',
    },
    dependencies: {
      nestjs: {
        '@nestjs/common': '^11.0.1',
        '@nestjs/core': '^11.0.1',
        '@nestjs/platform-express': '^11.0.1',
        '@nestjs/config': '^4.0.2',
      },
      auth: {
        '@nestjs/passport': '^11.0.5',
        '@nestjs/jwt': '^11.0.0',
        passport: '^0.7.0',
        'passport-jwt': '^4.0.1',
        bcrypt: '^5.1.1',
      },
      database: {
        '@nestjs/mongoose': '^11.0.3',
        mongoose: '^8.15.2',
      },
    },
    devDependencies: {
      auth: {
        '@types/bcrypt': '^5.0.2',
        '@types/passport-jwt': '^4.0.1',
      },
    },
    presets: {
      'basic-auth': {
        includes: [
          'auth.@nestjs/passport',
          'auth.@nestjs/jwt',
          'auth.passport',
          'auth.passport-jwt',
          'auth.bcrypt',
        ],
        devIncludes: ['auth.@types/bcrypt', 'auth.@types/passport-jwt'],
      },
      'google-auth': {
        extends: 'basic-auth',
        includes: ['auth.passport-google-oauth20'],
        devIncludes: ['auth.@types/passport-google-oauth20'],
      },
      'mongodb-setup': {
        includes: ['database.@nestjs/mongoose', 'database.mongoose'],
      },
    },
  };

  beforeEach(async () => {
    mockReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockRegistry));

    const module: TestingModule = await Test.createTestingModule({
      providers: [DependencyResolverService],
    }).compile();

    service = module.get<DependencyResolverService>(DependencyResolverService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should load registry on initialization', () => {
      expect(mockReadFileSync).toHaveBeenCalledWith(
        expect.stringContaining('dependency-registry.json'),
        'utf-8',
      );
    });

    it('should throw error if registry fails to load', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => {
        new DependencyResolverService();
      }).toThrow('Dependency registry is required for project generation');
    });
  });

  describe('resolveDependencies', () => {
    it('should resolve basic dependency groups', () => {
      const featureConfig = {
        dependencyGroups: ['auth'],
      };

      const result = service.resolveDependencies(featureConfig);

      expect(result.dependencies).toEqual({
        '@nestjs/passport': '^11.0.5',
        '@nestjs/jwt': '^11.0.0',
        passport: '^0.7.0',
        'passport-jwt': '^4.0.1',
        bcrypt: '^5.1.1',
      });

      expect(result.devDependencies).toEqual({
        '@types/bcrypt': '^5.0.2',
        '@types/passport-jwt': '^4.0.1',
      });
    });

    it('should resolve dependency presets', () => {
      const featureConfig = {
        dependencyPresets: ['basic-auth'],
      };

      const result = service.resolveDependencies(featureConfig);

      expect(result.dependencies).toEqual({
        '@nestjs/passport': '^11.0.5',
        '@nestjs/jwt': '^11.0.0',
        passport: '^0.7.0',
        'passport-jwt': '^4.0.1',
        bcrypt: '^5.1.1',
      });

      expect(result.devDependencies).toEqual({
        '@types/bcrypt': '^5.0.2',
        '@types/passport-jwt': '^4.0.1',
      });
    });

    it('should resolve extended presets', () => {
      const featureConfig = {
        dependencyPresets: ['google-auth'],
      };

      const result = service.resolveDependencies(featureConfig);

      expect(result.dependencies).toEqual(
        expect.objectContaining({
          '@nestjs/passport': '^11.0.5',
          '@nestjs/jwt': '^11.0.0',
          passport: '^0.7.0',
          'passport-jwt': '^4.0.1',
          bcrypt: '^5.1.1',
        }),
      );
    });

    it('should merge custom dependencies', () => {
      const featureConfig = {
        dependencyGroups: ['auth'],
        customDependencies: {
          'custom-package': '^1.0.0',
        },
        customDevDependencies: {
          '@types/custom': '^1.0.0',
        },
      };

      const result = service.resolveDependencies(featureConfig);

      expect(result.dependencies).toEqual(
        expect.objectContaining({
          '@nestjs/passport': '^11.0.5',
          'custom-package': '^1.0.0',
        }),
      );

      expect(result.devDependencies).toEqual(
        expect.objectContaining({
          '@types/bcrypt': '^5.0.2',
          '@types/custom': '^1.0.0',
        }),
      );
    });

    it('should handle empty feature config', () => {
      const result = service.resolveDependencies({});

      expect(result.dependencies).toEqual({});
      expect(result.devDependencies).toEqual({});
    });

    it('should warn about unknown dependency groups', () => {
      const mockWarn = jest.spyOn(Logger.prototype, 'warn');
      const featureConfig = {
        dependencyGroups: ['unknown-group'],
      };

      const result = service.resolveDependencies(featureConfig);

      expect(mockWarn).toHaveBeenCalledWith('Unknown dependency group: unknown-group');
      expect(result.dependencies).toEqual({});
    });

    it('should warn about unknown presets', () => {
      const mockWarn = jest.spyOn(Logger.prototype, 'warn');
      const featureConfig = {
        dependencyPresets: ['unknown-preset'],
      };

      const result = service.resolveDependencies(featureConfig);

      expect(mockWarn).toHaveBeenCalledWith('Unknown preset: unknown-preset');
      expect(result.dependencies).toEqual({});
    });

    it('should handle multiple dependency groups', () => {
      const featureConfig = {
        dependencyGroups: ['auth', 'database'],
      };

      const result = service.resolveDependencies(featureConfig);

      expect(result.dependencies).toEqual(
        expect.objectContaining({
          '@nestjs/passport': '^11.0.5',
          '@nestjs/mongoose': '^11.0.3',
          mongoose: '^8.15.2',
        }),
      );
    });

    it('should override dependencies when using custom', () => {
      const featureConfig = {
        dependencyGroups: ['auth'],
        customDependencies: {
          '@nestjs/passport': '^12.0.0',
        },
      };

      const result = service.resolveDependencies(featureConfig);

      expect(result.dependencies['@nestjs/passport']).toBe('^12.0.0');
    });
  });
});
