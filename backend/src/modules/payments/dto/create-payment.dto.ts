import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID de la cotisation' })
  @IsString()
  @IsNotEmpty()
  contributionId: string;

  @ApiProperty({ description: 'ID du membre qui effectue le paiement' })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ description: 'Montant du paiement', example: 50 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Devise', example: 'EUR', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Méthode de paiement',
    enum: PaymentMethod,
    example: 'CARD',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    description: 'Statut du paiement',
    enum: PaymentStatus,
    default: 'PENDING',
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Notes ou commentaires' })
  @IsString()
  @IsOptional()
  notes?: string;
}
