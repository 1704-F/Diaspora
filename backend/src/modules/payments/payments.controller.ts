import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  CreatePaymentIntentDto,
  UpdatePaymentDto,
} from './dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { Public } from '@/shared/decorators/public.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('associations/:tenantId/payments/create-payment-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer un Payment Intent Stripe pour paiement par carte' })
  @ApiResponse({
    status: 201,
    description: 'Payment Intent créé avec succès',
  })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  createPaymentIntent(
    @Param('tenantId') tenantId: string,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.createPaymentIntent(
      tenantId,
      createPaymentIntentDto,
      userId,
    );
  }

  @Post('associations/:tenantId/payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer un paiement manuel (cash, check, bank transfer)' })
  @ApiResponse({ status: 201, description: 'Paiement créé avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  createManualPayment(
    @Param('tenantId') tenantId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.createManualPayment(
      tenantId,
      createPaymentDto,
      userId,
    );
  }

  @Post('webhooks/stripe')
  @Public()
  @ApiOperation({ summary: 'Webhook Stripe pour gérer les événements de paiement' })
  @ApiResponse({ status: 200, description: 'Webhook traité avec succès' })
  @ApiResponse({ status: 400, description: 'Signature invalide' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new Error('Raw body is required for Stripe webhooks');
    }
    return this.paymentsService.handleStripeWebhook(
      signature,
      req.rawBody,
    );
  }

  @Get('associations/:tenantId/payments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer tous les paiements' })
  @ApiQuery({ name: 'contributionId', required: false, type: String })
  @ApiQuery({ name: 'memberId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'paymentMethod', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des paiements' })
  findAll(
    @Param('tenantId') tenantId: string,
    @CurrentUser('sub') userId: string,
    @Query('contributionId') contributionId?: string,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.paymentsService.findAll(tenantId, userId, {
      contributionId,
      memberId,
      status,
      paymentMethod,
    });
  }

  @Get('associations/:tenantId/payments/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer un paiement par ID' })
  @ApiResponse({ status: 200, description: 'Paiement trouvé' })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  findOne(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.findOne(tenantId, id, userId);
  }

  @Patch('associations/:tenantId/payments/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un paiement' })
  @ApiResponse({ status: 200, description: 'Paiement mis à jour' })
  @ApiResponse({ status: 404, description: 'Paiement introuvable' })
  update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.paymentsService.update(tenantId, id, updatePaymentDto, userId);
  }
}
