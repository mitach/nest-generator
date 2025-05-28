import { IsString, IsArray, IsObject, IsOptional, IsIn, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class DatabaseConfig {
  @IsString()
  type: string;

  @IsString()
  host: string;

  @IsString()
  port: string;

  @IsString()
  database: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}

class AuthConfig {
  @IsString()
  jwtSecret: string;

  @IsString()
  jwtExpiration: string;
}

export class GenerateProjectDto {
  @IsString()
  @MinLength(3)
  projectName: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsString()
  @IsOptional()
  @IsIn(['monolith', 'microservice'])
  architecture: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  config: {
    database?: DatabaseConfig;
    auth?: AuthConfig;
  };
} 