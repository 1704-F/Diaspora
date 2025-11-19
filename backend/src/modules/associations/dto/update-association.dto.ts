import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateAssociationDto {
  @ApiPropertyOptional({ example: 'Association des Ressortissants de Kayes' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'association-kayes' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(3)
  primaryCurrency?: string;

  @ApiPropertyOptional({ example: 'fr' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(2)
  primaryLanguage?: string;

  @ApiPropertyOptional({ enum: TenantStatus })
  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @ApiPropertyOptional({ example: 'PRO' })
  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  subscriptionStatus?: string;

  @ApiPropertyOptional({ description: 'Additional settings as JSON' })
  @IsOptional()
  settings?: Record<string, any>;
}
