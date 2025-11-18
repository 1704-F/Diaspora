# Diaspora Platform - Backend API

Backend API for the Diaspora Management Platform built with NestJS, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### Development

```bash
# Start in development mode
npm run start:dev

# Start in debug mode
npm run start:debug

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   ├── modules/             # Feature modules
│   │   ├── auth/           # Authentication module
│   │   ├── associations/   # Associations module
│   │   ├── members/        # Members module
│   │   ├── finances/       # Finance module
│   │   ├── payments/       # Payments module
│   │   ├── projects/       # Projects module
│   │   └── events/         # Events module
│   ├── shared/             # Shared code
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Shared services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # Type definitions
│   ├── database/           # Database related
│   │   ├── migrations/     # Prisma migrations
│   │   └── seeds/          # Database seeds
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── test/                   # E2E tests
├── prisma/                 # Prisma schema
├── .env.example           # Environment variables example
└── package.json
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3000/api/docs

## 🔧 Useful Commands

```bash
# Format code
npm run format

# Lint code
npm run lint

# Prisma Studio (Database GUI)
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API key

## 📦 Dependencies

### Main
- NestJS 10+
- Prisma ORM
- Passport (Authentication)
- Stripe (Payments)
- Redis (Caching)
- Nodemailer (Emails)

### Dev
- TypeScript
- ESLint
- Prettier
- Jest

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter and tests
5. Submit a pull request

## 📄 License

MIT
