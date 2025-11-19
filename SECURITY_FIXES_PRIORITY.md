# 🔧 Corrections de Sécurité Prioritaires

**Temps estimé:** 2-3 heures
**Priorité:** CRITIQUE avant production

---

## 🔴 CRITIQUE - À faire MAINTENANT

### 1. Installer Helmet.js (5 minutes)

```bash
cd backend
npm install helmet
```

**Modifier `backend/src/main.ts`:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet'; // ← AJOUTER
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers - AJOUTER CETTE LIGNE
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false, // Pour Swagger
  }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - AMÉLIORER
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ... reste du code
}
```

---

### 2. Rate Limiting Granulaire sur Auth (10 minutes)

**Modifier `backend/src/modules/auth/auth.controller.ts`:**
```typescript
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // ... constructor

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // ← AJOUTER: 3 tentatives/min
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // ← AJOUTER: 5 tentatives/min
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // ← AJOUTER: 3 tentatives/5min
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // ← AJOUTER
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
```

---

### 3. Validation Force Password (15 minutes)

**Modifier `backend/src/modules/auth/dto/register.dto.ts`:**
```typescript
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches, // ← AJOUTER
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Must contain uppercase, lowercase, number, and special character (min 12 chars)'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12) // ← MODIFIER de 8 à 12
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`])[A-Za-z\d@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`]{12,}$/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  ) // ← AJOUTER
  password: string;

  // ... reste
}
```

**Faire de même pour `reset-password.dto.ts`:**
```typescript
@MinLength(12)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`]).{12,}$/, {
  message: 'Password must contain uppercase, lowercase, number, and special character',
})
newPassword: string;
```

---

### 4. Hash Email Verification Tokens (20 minutes)

**Modifier `backend/src/modules/auth/auth.service.ts`:**
```typescript
import { randomBytes, createHash } from 'crypto'; // ← MODIFIER import

export class AuthService {
  // ... constructor

  async register(registerDto: RegisterDto) {
    // ... vérifications

    // Générer token
    const plainToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256')
      .update(plainToken)
      .digest('hex'); // ← AJOUTER hash

    const user = await this.prisma.user.create({
      data: {
        // ...
        emailVerificationToken: hashedToken, // ← Stocker hash
      },
    });

    // TODO: Envoyer l'email avec plainToken (pas hashedToken!)
    // await this.emailService.sendVerificationEmail(user.email, plainToken);

    return {
      message: 'User registered. Please verify your email.',
      user,
      // EN DEV SEULEMENT: retourner le token
      ...(process.env.NODE_ENV === 'development' && { verificationToken: plainToken }),
    };
  }

  async verifyEmail(token: string) {
    // Hasher le token reçu
    const hashedToken = createHash('sha256')
      .update(token)
      .digest('hex'); // ← AJOUTER

    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: hashedToken }, // ← Utiliser hash
    });

    // ... reste du code
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // ... vérifications

    const plainToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256')
      .update(plainToken)
      .digest('hex'); // ← AJOUTER

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken, // ← Stocker hash
        passwordResetExpires: resetExpires,
      },
    });

    // TODO: Envoyer plainToken par email
    // await this.emailService.sendPasswordResetEmail(user.email, plainToken);

    return {
      message: 'If the email exists, a password reset link has been sent',
      // EN DEV SEULEMENT
      ...(process.env.NODE_ENV === 'development' && { resetToken: plainToken }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Hasher le token reçu
    const hashedToken = createHash('sha256')
      .update(resetPasswordDto.token)
      .digest('hex'); // ← AJOUTER

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken, // ← Utiliser hash
        passwordResetExpires: { gt: new Date() },
      },
    });

    // ... reste
  }
}
```

---

### 5. Pagination Max Limit (15 minutes)

**Créer `backend/src/shared/utils/pagination.helper.ts`:**
```typescript
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function sanitizePagination(page?: number, limit?: number) {
  const sanitizedPage = Math.max(1, page || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, limit || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip: (sanitizedPage - 1) * sanitizedLimit,
  };
}
```

**Utiliser dans tous les services avec findMany:**
```typescript
import { sanitizePagination } from '@/shared/utils/pagination.helper';

async findAll(tenantId: string, userId: string, query: any) {
  const { skip, limit } = sanitizePagination(query.page, query.limit);

  const [data, total] = await Promise.all([
    this.prisma.entity.findMany({
      where: { tenantId },
      skip,
      take: limit, // ← TOUJOURS limiter
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.entity.count({ where: { tenantId } }),
  ]);

  return {
    data,
    total,
    page: Math.floor(skip / limit) + 1,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

---

## 🟠 IMPORTANT - Avant Production

### 6. Logger Centralisé (30 minutes)

```bash
npm install winston nest-winston
```

**Créer `backend/src/shared/logger/winston.config.ts`:**
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

---

### 7. Monitoring Sentry (20 minutes)

```bash
npm install @sentry/node
```

**Modifier `backend/src/main.ts`:**
```typescript
import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Initialize Sentry AVANT create app
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
  }

  const app = await NestFactory.create(AppModule);

  // ... reste
}
```

**Ajouter au .env:**
```env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

### 8. Générer Secrets Forts (5 minutes)

```bash
# Générer secrets JWT
openssl rand -base64 32

# Générer secret pour webhook
openssl rand -base64 32
```

**Remplacer dans .env (PRODUCTION):**
```env
JWT_SECRET=<output-du-premier-openssl>
JWT_REFRESH_SECRET=<output-du-deuxième-openssl>
```

---

## 📋 Checklist Finale

Avant de merger vers main:

- [ ] Helmet installé et configuré
- [ ] Rate limiting sur endpoints auth
- [ ] Validation force password (12 chars min)
- [ ] Tokens hashés en DB
- [ ] Pagination max limit
- [ ] .env.example créé
- [ ] Logger Winston configuré
- [ ] Sentry intégré
- [ ] Secrets forts générés
- [ ] CORS production configuré
- [ ] Tests de sécurité manuels effectués

---

## 🚀 Commandes Rapides

```bash
# Installer toutes les dépendances sécurité
npm install helmet winston nest-winston @sentry/node

# Vérifier vulnérabilités
npm audit

# Fixer vulnérabilités auto
npm audit fix

# Générer secrets
openssl rand -base64 32
```

---

## 📚 Références

- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Helmet.js](https://helmetjs.github.io/)
