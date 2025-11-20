import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { winstonConfig } from './shared/config/winston.config';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { SentryExceptionFilter } from './shared/filters/sentry-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Initialize Sentry (before app creation for better error tracking)
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
    Logger.log('Sentry initialized', 'Bootstrap');
  }

  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false, // Required for Swagger UI
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - Enhanced for production
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
    exposedHeaders: ['X-Total-Count'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global HTTP logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Sentry error handler (must be after all other middleware)
  // Note: Sentry.Handlers are not available in newer versions
  // Error tracking is handled by the SentryExceptionFilter

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Diaspora Platform API')
    .setDescription('API documentation for Diaspora Management Platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('associations', 'Association management')
    .addTag('members', 'Member management')
    .addTag('finances', 'Financial management')
    .addTag('payments', 'Payment processing')
    .addTag('projects', 'Project management')
    .addTag('events', 'Event management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global exception filter for Sentry error tracking
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryExceptionFilter(httpAdapter.httpAdapter));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌍 Diaspora Platform API                            ║
║                                                       ║
║   🚀 Server running on: http://localhost:${port}      ║
║   📚 API Docs: http://localhost:${port}/api/docs     ║
║   🔧 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
