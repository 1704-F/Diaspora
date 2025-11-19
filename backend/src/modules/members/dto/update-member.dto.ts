import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

enum MemberStatusType {
  FOUNDER = 'FOUNDER',
  HONORARY = 'HONORARY',
  ACTIVE = 'ACTIVE',
  BENEFACTOR = 'BENEFACTOR',
  ASSOCIATE = 'ASSOCIATE',
}

enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: MemberStatusType })
  @IsEnum(MemberStatusType)
  @IsOptional()
  statusType?: MemberStatusType;

  @ApiPropertyOptional({ enum: MemberStatus })
  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: '123 Main St, Paris' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Paris' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'FR' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: 'Kayes' })
  @IsString()
  @IsOptional()
  cityOfOrigin?: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Section ID for multi-section associations' })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
