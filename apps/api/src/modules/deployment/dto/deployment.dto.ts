import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateDeploymentDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'name must be at least 1 character long.' })
  @Expose()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  repository: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  dockerFilePath: string;

  @IsString()
  @IsNotEmpty()
  @Expose()
  contextDir: string;

  @IsOptional()
  @IsString()
  @Expose()
  port: string;

  @IsOptional()
  @IsString()
  @Expose()
  composeFilePath?: string; // Optional field for docker-compose.yml path

  @IsString()
  @IsNotEmpty()
  @Expose()
  branch: string;

  @IsBoolean()
  @Expose()
  autoRedeploy: boolean;
}

// this is the data that is stored in the database
