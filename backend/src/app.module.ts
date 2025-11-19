import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/services/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AssociationsModule } from './modules/associations/associations.module';
import { MembersModule } from './modules/members/members.module';
import { ContributionsModule } from './modules/contributions/contributions.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Global modules
    PrismaModule,

    // Feature modules
    AuthModule,
    AssociationsModule,
    MembersModule,
    ContributionsModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply JWT guard globally (can be overridden with @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
