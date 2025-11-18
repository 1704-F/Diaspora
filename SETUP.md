# Developer Setup Guide

Complete guide to set up the Diaspora Platform development environment.

## 📋 Prerequisites

### Required Software

1. **Node.js 20+**
   ```bash
   # Check version
   node --version

   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

2. **Docker & Docker Compose**
   ```bash
   # Check versions
   docker --version
   docker-compose --version

   # Install Docker Desktop (macOS/Windows)
   # https://www.docker.com/products/docker-desktop

   # Install Docker Engine (Linux)
   # https://docs.docker.com/engine/install/
   ```

3. **Git**
   ```bash
   # Check version
   git --version

   # Install if needed
   # https://git-scm.com/downloads
   ```

### Recommended Software

- **VS Code** - Code editor with excellent TypeScript support
  - Extensions:
    - ESLint
    - Prettier
    - TypeScript
    - Docker
    - GitLens

- **Postman** or **Insomnia** - For API testing

- **pgAdmin** or **DBeaver** - For database management (optional, Docker includes pgAdmin)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Diaspora
```

### 2. Setup Environment Variables

#### Backend
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://diaspora_user:diaspora_pass_2025@localhost:5432/diaspora_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secure_jwt_secret_here
# ... other variables
```

#### Frontend
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Diaspora Platform
# ... other variables
```

### 3. Start Development Environment

#### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services will be available at:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050 (optional, use profile `tools`)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

#### Option B: Manual Setup

**Terminal 1 - Database & Redis**
```bash
# Start PostgreSQL
docker run -d \
  --name diaspora-postgres \
  -e POSTGRES_DB=diaspora_dev \
  -e POSTGRES_USER=diaspora_user \
  -e POSTGRES_PASSWORD=diaspora_pass_2025 \
  -p 5432:5432 \
  postgres:15-alpine

# Start Redis
docker run -d \
  --name diaspora-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Terminal 2 - Backend**
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

**Terminal 3 - Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Database Setup

### Run Migrations

```bash
cd backend
npm run prisma:migrate
```

### Seed Database (Optional)

```bash
cd backend
npm run prisma:seed
```

### Access Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Visit http://localhost:5555 to browse and edit data.

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# With UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 🔧 Common Tasks

### Backend

```bash
cd backend

# Format code
npm run format

# Lint code
npm run lint

# Build
npm run build

# Generate Prisma Client
npm run prisma:generate

# Create new migration
npx prisma migrate dev --name your_migration_name
```

### Frontend

```bash
cd frontend

# Format code
npm run format

# Lint code
npm run lint

# Build
npm run build

# Preview build
npm run preview
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000 (backend)
lsof -i :3000
kill -9 <PID>

# Find process using port 5173 (frontend)
lsof -i :5173
kill -9 <PID>
```

### Docker Issues

```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild containers
docker-compose up --build
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs diaspora-postgres

# Connect to PostgreSQL
docker exec -it diaspora-postgres psql -U diaspora_user -d diaspora_dev
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues

```bash
cd backend

# Reset Prisma Client
rm -rf node_modules/.prisma
npm run prisma:generate

# Reset database
npx prisma migrate reset
```

## 📝 Git Workflow

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Make Changes and Commit

```bash
git add .
git commit -m "feat(scope): description"
```

### Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🔐 Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL connection | postgresql://... |
| REDIS_URL | Redis connection | redis://localhost:6379 |
| JWT_SECRET | JWT secret key | your_secret |
| STRIPE_SECRET_KEY | Stripe API key | sk_test_... |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3000/api/v1 |
| VITE_APP_NAME | App name | Diaspora Platform |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe public key | pk_test_... |

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Material-UI Documentation](https://mui.com/material-ui/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Getting Help

- Check existing [GitHub Issues](https://github.com/diaspora-platform/Diaspora/issues)
- Create a new issue for bugs or questions
- Join our [Discord community](https://discord.gg/diaspora-platform)

---

Happy coding! 🚀
