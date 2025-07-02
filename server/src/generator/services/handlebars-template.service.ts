import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class HandlebarsTemplateService {
  private readonly logger = new Logger(HandlebarsTemplateService.name);
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerBuiltInHelpers();
  }

  /**
   * Process template content with Handlebars
   */
  processTemplate(
    content: string,
    allFeatures: string[],
    config: any,
    featureName: string,
    tempDir: string,
  ): string {
    try {
      // Compile and execute template
      const template = this.handlebars.compile(content);
      const result = template({
        allFeatures,
        ...config, // Spread config so you can use {{propertyName}} directly
        config, // Also available as {{config.propertyName}}
        featureName,
        tempDir,
      });

      return result;
    } catch (error) {
      this.logger.error(`Error processing Handlebars template for ${featureName}:`, error);
      throw error;
    }
  }

  /**
   * Process template file and output to destination
   */
  async processTemplateFile(
    templatePath: string,
    outputPath: string,
    allFeatures: string[],
    config: any,
    featureName: string,
    tempDir: string,
  ): Promise<void> {
    const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
    const processedContent = this.processTemplate(
      templateContent,
      allFeatures,
      config,
      featureName,
      tempDir,
    );

    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, processedContent);
  }

  /**
   * Register built-in Handlebars helpers (replaces custom processors)
   */
  private registerBuiltInHelpers(): void {
    // Raw helper - outputs value without quotes (like {{ITEM.RAW.prop}})
    this.handlebars.registerHelper('raw', (value) => {
      return new this.handlebars.SafeString(String(value || ''));
    });

    // JSON helper - convert object to JSON (universal utility)
    this.handlebars.registerHelper('json', (value) => {
      return new this.handlebars.SafeString(JSON.stringify(value, null, 2));
    });

    // Includes helper - checks if value is included in a given array
    this.handlebars.registerHelper('includes', function (array, value) {
      return array && array.includes(value);
    });

    // includesAny helper - checks if values are included in a given array
    this.handlebars.registerHelper('includesAny', function (array, ...values) {
      // Remove the last argument (Handlebars options)
      const valuesToCheck = values.slice(0, -1);
      return array && valuesToCheck.some((value) => array.includes(value));
    });

    // Join helper for arrays
    this.handlebars.registerHelper('join', (array, separator = ', ') => {
      const actualSeparator = typeof separator === 'string' ? separator : ', ';
      if (!Array.isArray(array)) return '';
      return array.join(actualSeparator);
    });

    this.handlebars.registerHelper('quotedValue', function (value) {
      if (typeof value === 'string') {
        // Remove existing quotes if they exist, then add single quotes
        let cleanValue = value;
        if (
          (cleanValue.startsWith("'") && cleanValue.endsWith("'")) ||
          (cleanValue.startsWith('"') && cleanValue.endsWith('"'))
        ) {
          cleanValue = cleanValue.slice(1, -1);
        }
        return new Handlebars.SafeString(`'${cleanValue}'`);
      }
      return value;
    });

    this.handlebars.registerHelper('isDefined', function (value) {
      return value !== undefined && value !== null;
    });

    // Equality helper - checks if two values are equal
    this.handlebars.registerHelper('eq', function (a, b) {
      return a === b;
    });

    // Array check helper
    this.handlebars.registerHelper('isArray', function (value) {
      return Array.isArray(value);
    });

    // String check helper
    this.handlebars.registerHelper('isString', function (value) {
      return typeof value === 'string';
    });

    // Object check helper
    this.handlebars.registerHelper('isObject', function (value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    });

    // Number check helper
    this.handlebars.registerHelper('isNumber', function (value) {
      return typeof value === 'number';
    });

    // Boolean check helper
    this.handlebars.registerHelper('isBoolean', function (value) {
      return typeof value === 'boolean';
    });
  }
}
