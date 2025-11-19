import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';

enum TenantType {
  SIMPLE = 'SIMPLE',
  MULTI_SECTION = 'MULTI_SECTION',
}

export class CreateAssociationDto {
  @ApiProperty({ example: 'Association des Ressortissants de Kayes' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'association-kayes', description: 'Unique slug for the association' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({
    enum: TenantType,
    default: 'SIMPLE',
    description: 'Type of association structure',
  })
  @IsEnum(TenantType)
  @IsOptional()
  type?: TenantType;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: 'EUR', description: 'Primary currency (ISO 4217)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(3)
  primaryCurrency: string;

  @ApiProperty({ example: 'fr', description: 'Primary language (ISO 639-1)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(2)
  primaryLanguage: string;

  @ApiPropertyOptional({ example: 'PRO', description: 'Subscription plan' })
  @IsString()
  @IsOptional()
  subscriptionPlan?: string;

  @ApiPropertyOptional({ description: 'Additional settings as JSON' })
  @IsOptional()
  settings?: Record<string, any>;
}
