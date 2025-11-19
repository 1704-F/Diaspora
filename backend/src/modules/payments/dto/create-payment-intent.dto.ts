import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'ID de la cotisation' })
  @IsString()
  @IsNotEmpty()
  contributionId: string;

  @ApiProperty({ description: 'Montant du paiement en centimes', example: 5000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Devise', example: 'EUR', default: 'eur' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Métadonnées additionnelles' })
  @IsOptional()
  metadata?: Record<string, any>;
}
