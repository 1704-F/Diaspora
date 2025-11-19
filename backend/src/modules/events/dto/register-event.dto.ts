import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RegistrationStatus } from '@prisma/client';

export class RegisterEventDto {
  @ApiProperty({ description: 'ID du membre qui s\'inscrit' })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({
    description: 'Statut de l\'inscription',
    enum: RegistrationStatus,
    default: 'PENDING',
  })
  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @ApiPropertyOptional({ description: 'Nombre de participants', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  numberOfGuests?: number;

  @ApiPropertyOptional({ description: 'Notes ou commentaires' })
  @IsString()
  @IsOptional()
  notes?: string;
}
