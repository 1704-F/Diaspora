import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nom du projet', example: 'Construction du centre communautaire' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description détaillée du projet' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Statut du projet',
    enum: ProjectStatus,
    example: 'PLANNING',
    default: 'PLANNING',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'Date de début', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin prévue', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Budget du projet', example: 50000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @ApiPropertyOptional({ description: 'Devise', example: 'EUR', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Catégorie du projet', example: 'Infrastructure' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées additionnelles',
    example: { priority: 'high', responsible: 'John Doe' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
