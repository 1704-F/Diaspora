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
  @ApiProperty({ description: 'Titre du projet', example: 'Construction du centre communautaire' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description détaillée du projet' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Objectifs du projet' })
  @IsString()
  @IsOptional()
  objectives?: string;

  @ApiProperty({ description: 'Montant du budget', example: 50000 })
  @IsNumber()
  @Min(0)
  budgetAmount: number;

  @ApiProperty({ description: 'Source du budget', example: 'Subvention municipale' })
  @IsString()
  @IsNotEmpty()
  budgetSource: string;

  @ApiPropertyOptional({ description: 'ID de la section responsable' })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'ID du membre responsable' })
  @IsString()
  @IsOptional()
  responsibleMemberId?: string;

  @ApiPropertyOptional({ description: 'Indicateurs de succès' })
  @IsString()
  @IsOptional()
  successIndicators?: string;

  @ApiProperty({
    description: 'Statut du projet',
    enum: ProjectStatus,
    example: 'PLANNED',
    default: 'PLANNED',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'Devise', example: 'EUR', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Pourcentage de progression', example: 0, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  progressPercentage?: number;

  @ApiPropertyOptional({ description: 'Date de début', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin prévue', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées additionnelles',
    example: { priority: 'high', category: 'Infrastructure' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
