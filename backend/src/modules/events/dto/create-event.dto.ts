import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ description: 'Titre de l\'événement', example: 'Assemblée Générale 2024' })
  @IsString()
  @IsNotEmpty()
  title: string;

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
  type: EventType;

  @ApiProperty({ description: 'Date et heure de début', example: '2024-12-01T14:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'Date et heure de fin', example: '2024-12-01T18:00:00Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Lieu de l\'événement', example: 'Salle communautaire, Paris' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Événement virtuel', default: false })
  @IsBoolean()
  @IsOptional()
  isVirtual?: boolean;

  @ApiPropertyOptional({ description: 'Lien de l\'événement virtuel (Zoom, Teams, etc.)' })
  @IsString()
  @IsOptional()
  virtualLink?: string;

  @ApiPropertyOptional({ description: 'Ordre du jour de l\'événement' })
  @IsString()
  @IsOptional()
  agenda?: string;

  @ApiPropertyOptional({
    description: 'Documents préparatoires',
    type: 'array',
    items: { type: 'string' },
  })
  @IsArray()
  @IsOptional()
  preparatoryDocuments?: string[];

  @ApiPropertyOptional({ description: 'ID de la section organisatrice' })
  @IsString()
  @IsOptional()
  sectionId?: string;
}
