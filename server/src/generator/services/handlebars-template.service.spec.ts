import { Test, TestingModule } from '@nestjs/testing';
import { HandlebarsTemplateService } from './handlebars-template.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('HandlebarsTemplateService', () => {
  let service: HandlebarsTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandlebarsTemplateService],
    }).compile();

    service = module.get<HandlebarsTemplateService>(HandlebarsTemplateService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processTemplate', () => {
    it('should process basic template with config', () => {
      const template = 'Project: {{projectName}}';
      const config = { projectName: 'my-app' };

      const result = service.processTemplate(template, [], config, 'test-feature', '/tmp');

      expect(result).toBe('Project: my-app');
    });

    it('should process template with allFeatures', () => {
      const template = 'Features: {{allFeatures.length}}';
      const allFeatures = ['auth', 'database', 'cors'];

      const result = service.processTemplate(template, allFeatures, {}, 'test-feature', '/tmp');

      expect(result).toBe('Features: 3');
    });

    it('should handle nested config properties', () => {
      const template = 'DB Type: {{config.database.type}}';
      const config = {
        database: {
          type: 'mongodb',
          host: 'localhost',
        },
      };

      const result = service.processTemplate(template, [], config, 'test-feature', '/tmp');

      expect(result).toBe('DB Type: mongodb');
    });

    it('should handle missing properties gracefully', () => {
      const template = 'Missing: {{missing.property}}';

      const result = service.processTemplate(template, [], {}, 'test-feature', '/tmp');

      expect(result).toBe('Missing: ');
    });

    it('should throw error for invalid template syntax', () => {
      const template = 'Invalid: {{#each unclosed';

      expect(() => {
        service.processTemplate(template, [], {}, 'test-feature', '/tmp');
      }).toThrow();
    });
  });

  describe('built-in helpers', () => {
    it('should use includes helper correctly', () => {
      const template = '{{#if (includes allFeatures "auth")}}Has Auth{{else}}No Auth{{/if}}';
      const allFeatures = ['auth', 'database'];

      const result = service.processTemplate(template, allFeatures, {}, 'test-feature', '/tmp');

      expect(result).toBe('Has Auth');
    });

    it('should use includes helper with false result', () => {
      const template =
        '{{#if (includes allFeatures "missing")}}Has Missing{{else}}No Missing{{/if}}';
      const allFeatures = ['auth', 'database'];

      const result = service.processTemplate(template, allFeatures, {}, 'test-feature', '/tmp');

      expect(result).toBe('No Missing');
    });

    it('should use includesAny helper correctly', () => {
      const template =
        '{{#if (includesAny allFeatures "auth" "users")}}Has Auth or Users{{else}}Neither{{/if}}';
      const allFeatures = ['cors', 'database'];

      let result = service.processTemplate(template, allFeatures, {}, 'test-feature', '/tmp');
      expect(result).toBe('Neither');

      const allFeaturesWithAuth = ['auth', 'cors'];
      result = service.processTemplate(template, allFeaturesWithAuth, {}, 'test-feature', '/tmp');
      expect(result).toBe('Has Auth or Users');
    });

    it('should use join helper correctly', () => {
      const template = 'Features: {{join allFeatures ", "}}';
      const allFeatures = ['auth', 'database', 'cors'];

      const result = service.processTemplate(template, allFeatures, {}, 'test-feature', '/tmp');

      expect(result).toBe('Features: auth, database, cors');
    });

    it('should use join helper with default separator', () => {
      const template = 'Features: {{join allFeatures}}';
      const allFeatures = ['auth', 'database'];

      const result = service.processTemplate(template, allFeatures, {}, 'test-feature', '/tmp');

      expect(result).toBe('Features: auth, database');
    });

    it('should use json helper correctly', () => {
      const template = 'Config: {{json config}}';
      const config = { name: 'test', value: 123 };

      const result = service.processTemplate(template, [], config, 'test-feature', '/tmp');

      expect(result).toBe('Config: {\n  "name": "test",\n  "value": 123\n}');
    });

    it('should use raw helper correctly', () => {
      const template = 'Raw value: {{raw config.rawValue}}';
      const config = { rawValue: '<script>alert("test")</script>' };

      const result = service.processTemplate(template, [], config, 'test-feature', '/tmp');

      expect(result).toBe('Raw value: <script>alert("test")</script>');
    });

    it('should use isArray helper correctly', () => {
      const template = '{{#if (isArray config.items)}}Is Array{{else}}Not Array{{/if}}';

      let config: { items: string[] | string } = { items: ['a', 'b'] };
      let result = service.processTemplate(template, [], config, 'test-feature', '/tmp');
      expect(result).toBe('Is Array');

      config = { items: 'string' };
      result = service.processTemplate(template, [], config, 'test-feature', '/tmp');
      expect(result).toBe('Not Array');
    });
  });

  describe('processTemplateFile', () => {
    beforeEach(() => {
      mockFs.promises = {
        readFile: jest.fn(),
        mkdir: jest.fn(),
        writeFile: jest.fn(),
      } as any;
    });

    it('should process template file successfully', async () => {
      const templateContent = 'Project: {{projectName}}';
      const expectedOutput = 'Project: my-app';

      (mockFs.promises.readFile as jest.Mock).mockResolvedValue(templateContent);
      (mockFs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);
      (mockFs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

      await service.processTemplateFile(
        '/templates/test.hbs',
        '/output/test.ts',
        [],
        { projectName: 'my-app' },
        'test-feature',
        '/tmp',
      );

      expect(mockFs.promises.readFile).toHaveBeenCalledWith('/templates/test.hbs', 'utf-8');
      expect(mockFs.promises.mkdir).toHaveBeenCalledWith('/output', { recursive: true });
      expect(mockFs.promises.writeFile).toHaveBeenCalledWith('/output/test.ts', expectedOutput);
    });

    it('should throw error if template file processing fails', async () => {
      (mockFs.promises.readFile as jest.Mock).mockResolvedValue('{{invalid syntax');

      await expect(
        service.processTemplateFile(
          '/templates/test.hbs',
          '/output/test.ts',
          [],
          {},
          'test-feature',
          '/tmp',
        ),
      ).rejects.toThrow();
    });

    it('should handle file system errors', async () => {
      (mockFs.promises.readFile as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(
        service.processTemplateFile(
          '/templates/test.hbs',
          '/output/test.ts',
          [],
          {},
          'test-feature',
          '/tmp',
        ),
      ).rejects.toThrow('File not found');
    });
  });
});
