import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/services/prisma.service';
import {
  CreatePaymentDto,
  CreatePaymentIntentDto,
  UpdatePaymentDto,
} from './dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }

  /**
   * Créer un Payment Intent Stripe pour un paiement par carte
   */
  async createPaymentIntent(
    tenantId: string,
    createPaymentIntentDto: CreatePaymentIntentDto,
    userId: string,
  ) {
    // Vérifier l'accès au tenant
    const member = await this.validateTenantAccess(tenantId, userId);

    // Vérifier que la cotisation existe
    const contribution = await this.prisma.contribution.findUnique({
      where: {
        id: createPaymentIntentDto.contributionId,
        tenantId,
      },
    });

    if (!contribution) {
      throw new NotFoundException('Cotisation introuvable');
    }

    // Créer le Payment Intent sur Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: createPaymentIntentDto.amount,
      currency: createPaymentIntentDto.currency || 'eur',
      metadata: {
        tenantId,
        contributionId: contribution.id,
        memberId: member.id,
        userId,
        ...createPaymentIntentDto.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Créer l'enregistrement de paiement en base
    const payment = await this.prisma.contributionPayment.create({
      data: {
        tenantId,
        contributionId: contribution.id,
        memberId: member.id,
        amount: createPaymentIntentDto.amount / 100, // Convertir de centimes en euros
        currency: createPaymentIntentDto.currency || 'EUR',
        paymentMethod: 'CARD',
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Créer un paiement manuel (cash, check, bank transfer)
   */
  async createManualPayment(
    tenantId: string,
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    // Vérifier que la cotisation existe
    const contribution = await this.prisma.contribution.findUnique({
      where: {
        id: createPaymentDto.contributionId,
        tenantId,
      },
    });

    if (!contribution) {
      throw new NotFoundException('Cotisation introuvable');
    }

    // Vérifier que le membre existe
    const member = await this.prisma.member.findUnique({
      where: {
        id: createPaymentDto.memberId,
        tenantId,
      },
    });

    if (!member) {
      throw new NotFoundException('Membre introuvable');
    }

    // Créer le paiement
    const payment = await this.prisma.contributionPayment.create({
      data: {
        tenantId,
        contributionId: createPaymentDto.contributionId,
        memberId: createPaymentDto.memberId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'EUR',
        paymentMethod: createPaymentDto.paymentMethod,
        status: createPaymentDto.status || 'PAID',
        notes: createPaymentDto.notes,
        paidAt:
          createPaymentDto.status === 'PAID' ? new Date() : undefined,
      },
      include: {
        member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        contribution: true,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'PAYMENT_CREATED',
        entityType: 'ContributionPayment',
        entityId: payment.id,
        metadata: {
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          contributionName: contribution.name,
        },
      },
    });

    return payment;
  }

  /**
   * Gérer les webhooks Stripe
   */
  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    // Traiter l'événement
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Gérer le succès d'un Payment Intent
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.contributionPayment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!payment) {
      console.error(
        `Payment not found for PaymentIntent: ${paymentIntent.id}`,
      );
      return;
    }

    await this.prisma.contributionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId: payment.tenantId,
        action: 'PAYMENT_SUCCEEDED',
        entityType: 'ContributionPayment',
        entityId: payment.id,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          amount: payment.amount,
        },
      },
    });
  }

  /**
   * Gérer l'échec d'un Payment Intent
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.prisma.contributionPayment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (!payment) {
      console.error(
        `Payment not found for PaymentIntent: ${paymentIntent.id}`,
      );
      return;
    }

    await this.prisma.contributionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId: payment.tenantId,
        action: 'PAYMENT_FAILED',
        entityType: 'ContributionPayment',
        entityId: payment.id,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          reason: paymentIntent.last_payment_error?.message,
        },
      },
    });
  }

  /**
   * Gérer un remboursement
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    const payment = await this.prisma.contributionPayment.findFirst({
      where: {
        stripePaymentIntentId: charge.payment_intent as string,
      },
    });

    if (!payment) {
      console.error(`Payment not found for Charge: ${charge.id}`);
      return;
    }

    await this.prisma.contributionPayment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId: payment.tenantId,
        action: 'PAYMENT_REFUNDED',
        entityType: 'ContributionPayment',
        entityId: payment.id,
        metadata: {
          chargeId: charge.id,
          amount: charge.amount_refunded / 100,
        },
      },
    });
  }

  /**
   * Récupérer tous les paiements avec filtres
   */
  async findAll(
    tenantId: string,
    userId: string,
    filters?: {
      contributionId?: string;
      memberId?: string;
      status?: string;
      paymentMethod?: string;
    },
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const where: any = {
      tenantId,
      ...(filters?.contributionId && {
        contributionId: filters.contributionId,
      }),
      ...(filters?.memberId && { memberId: filters.memberId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.paymentMethod && {
        paymentMethod: filters.paymentMethod,
      }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.contributionPayment.findMany({
        where,
        include: {
          contribution: true,
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contributionPayment.count({ where }),
    ]);

    return {
      data: payments,
      total,
      metadata: { filters },
    };
  }

  /**
   * Récupérer un paiement par ID
   */
  async findOne(tenantId: string, id: string, userId: string) {
    await this.validateTenantAccess(tenantId, userId);

    const payment = await this.prisma.contributionPayment.findUnique({
      where: { id, tenantId },
      include: {
        contribution: true,
        member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Paiement avec l'ID ${id} introuvable`);
    }

    return payment;
  }

  /**
   * Mettre à jour un paiement
   */
  async update(
    tenantId: string,
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    userId: string,
  ) {
    await this.validateTenantAccess(tenantId, userId);

    const payment = await this.prisma.contributionPayment.findUnique({
      where: { id, tenantId },
    });

    if (!payment) {
      throw new NotFoundException(`Paiement avec l'ID ${id} introuvable`);
    }

    const updated = await this.prisma.contributionPayment.update({
      where: { id },
      data: {
        ...updatePaymentDto,
        ...(updatePaymentDto.status === 'PAID' && !payment.paidAt
          ? { paidAt: new Date() }
          : {}),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'PAYMENT_UPDATED',
        entityType: 'ContributionPayment',
        entityId: updated.id,
        metadata: {
          status: updated.status,
        },
      },
    });

    return updated;
  }

  /**
   * Valider l'accès au tenant
   */
  private async validateTenantAccess(tenantId: string, userId: string) {
    const member = await this.prisma.member.findFirst({
      where: {
        tenantId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!member) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette association",
      );
    }

    return member;
  }
}
