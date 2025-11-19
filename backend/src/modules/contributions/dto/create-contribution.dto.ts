import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContributionFrequency, ContributionType } from '@prisma/client';

export class CreateContributionDto {
  @ApiProperty({ description: 'Nom de la cotisation', example: 'Cotisation annuelle 2024' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description détaillée' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Montant de la cotisation', example: 50 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Devise', example: 'EUR', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Fréquence de la cotisation',
    enum: ContributionFrequency,
    example: 'MONTHLY',
  })
  @IsEnum(ContributionFrequency)
  frequency: ContributionFrequency;

  @ApiProperty({
    description: 'Type de cotisation',
    enum: ContributionType,
    example: 'MEMBERSHIP_FEE',
  })
  @IsEnum(ContributionType)
  type: ContributionType;

  @ApiPropertyOptional({ description: 'Date d\'échéance', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Date de début', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Cotisation active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Cotisation obligatoire', default: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Métadonnées additionnelles',
    example: { category: 'membership', fiscalYear: 2024 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
