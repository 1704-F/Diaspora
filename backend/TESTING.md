# Testing Guide - Diaspora Platform Backend

This document describes the testing setup and how to run tests for the Diaspora Platform backend.

## Test Stack

- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertions for E2E tests
- **@nestjs/testing**: NestJS testing utilities

## Test Types

### 1. Unit Tests

Unit tests test individual services, controllers, and utilities in isolation with mocked dependencies.

**Location**: `src/**/*.spec.ts` (next to the source files)

**Examples**:
- `src/modules/auth/auth.service.spec.ts` - Authentication service tests
- `src/modules/members/members.service.spec.ts` - Members service tests

### 2. E2E (End-to-End) Tests

E2E tests test complete API flows with real HTTP requests against the application.

**Location**: `test/**/*.e2e-spec.ts`

**Examples**:
- `test/auth.e2e-spec.ts` - Authentication flow tests (register, login, verify, reset password)

## Running Tests

### Run All Unit Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

This generates a coverage report in `coverage/` directory.

### Run E2E Tests

```bash
npm run test:e2e
```

**Note**: E2E tests require a test database. Make sure to set up a separate test database:

```bash
# Create test database
DATABASE_URL="postgresql://user:password@localhost:5432/diaspora_test" npx prisma migrate deploy

# Run E2E tests
DATABASE_URL="postgresql://user:password@localhost:5432/diaspora_test" npm run test:e2e
```

### Run Specific Test File

```bash
# Unit test
npm test -- auth.service.spec.ts

# E2E test
npm run test:e2e -- auth.e2e-spec.ts
```

### Debug Tests

```bash
npm run test:debug
```

Then attach your debugger to the Node process.

## Test Coverage

Current test coverage:

### Auth Module ✅
- ✅ User registration
- ✅ User login
- ✅ Email verification
- ✅ Password reset
- ✅ Token refresh
- ✅ Get user profile
- ✅ Validation (weak passwords, invalid emails)

### Members Module ✅
- ✅ Create member
- ✅ Find all members (with pagination and filters)
- ✅ Find one member
- ✅ Update member
- ✅ Remove member (soft delete)
- ✅ Assign role
- ✅ Remove role
- ✅ Get member statistics

### E2E Tests ✅
- ✅ Complete authentication flow
- ✅ Rate limiting enforcement
- ✅ Validation errors
- ✅ Authorization checks

## Writing New Tests

### Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';
import { PrismaService } from '@/shared/services/prisma.service';

describe('YourService', () => {
  let service: YourService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    // Mock Prisma methods
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('yourMethod', () => {
    it('should do something', async () => {
      // Arrange
      mockPrismaService.model.findUnique.mockResolvedValue({ /* data */ });

      // Act
      const result = await service.yourMethod();

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.model.findUnique).toHaveBeenCalled();
    });
  });
});
```

### E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('YourModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/your-endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/your-endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset mocks
- Clean up test data in `afterAll`

### 2. Mock External Dependencies
- Mock PrismaService for unit tests
- Mock EmailService to avoid sending real emails
- Mock external APIs (Stripe, etc.)

### 3. Test Naming
- Use descriptive test names: `should create user with valid data`
- Follow AAA pattern: Arrange, Act, Assert

### 4. Coverage Goals
- Aim for >80% code coverage
- Focus on critical business logic
- Test error cases and edge cases

### 5. E2E Test Database
- Always use a separate test database
- Clean up test data after tests
- Use unique identifiers (timestamps) to avoid conflicts

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run unit tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e
  env:
    DATABASE_URL: postgresql://user:password@localhost:5432/test_db
```

## Troubleshooting

### Tests Timeout
Increase Jest timeout in `package.json`:
```json
{
  "jest": {
    "testTimeout": 30000
  }
}
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL environment variable
- Run migrations on test database

### Mock Not Working
- Make sure to call `jest.clearAllMocks()` in `beforeEach`
- Verify mock implementation matches the real method signature

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)

---

**Last Updated**: 2025-11-20
**Test Coverage**: ~60% (Unit) + E2E Critical Flows
