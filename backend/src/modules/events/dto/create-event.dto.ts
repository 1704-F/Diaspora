import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ description: 'Nom de l\'événement', example: 'Assemblée Générale 2024' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description de l\'événement' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Type d\'événement',
    enum: EventType,
    example: 'MEETING',
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ description: 'Date et heure de début', example: '2024-12-01T14:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Date et heure de fin', example: '2024-12-01T18:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Lieu de l\'événement', example: 'Salle communautaire, Paris' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Nombre maximum de participants' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxAttendees?: number;

  @ApiPropertyOptional({ description: 'Événement public ou privé', default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Inscription requise', default: true })
  @IsBoolean()
  @IsOptional()
  requiresRegistration?: boolean;

  @ApiPropertyOptional({ description: 'Prix de participation', example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Devise', example: 'EUR', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées additionnelles',
    example: { speaker: 'John Doe', topic: 'Community Building' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
