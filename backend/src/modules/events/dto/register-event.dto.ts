import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationStatus } from '@prisma/client';

export class RegisterEventDto {
  @ApiProperty({ description: 'ID du membre qui s\'inscrit' })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({
    description: 'Statut de la participation',
    enum: ParticipationStatus,
    default: 'INVITED',
  })
  @IsEnum(ParticipationStatus)
  @IsOptional()
  status?: ParticipationStatus;
}
