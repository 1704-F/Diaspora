import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
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

export class CreateMemberDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: MemberStatusType, default: 'ACTIVE' })
  @IsEnum(MemberStatusType)
  @IsOptional()
  statusType?: MemberStatusType;

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

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsDateString()
  @IsOptional()
  membershipDate?: string;

  @ApiPropertyOptional({ description: 'Section ID for multi-section associations' })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
