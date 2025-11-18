# Contributing to Diaspora Platform

Thank you for your interest in contributing to the Diaspora Management Platform! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/your-username/Diaspora.git
cd Diaspora
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Setup environment variables**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

4. **Start development environment**
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or manually
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📝 Development Workflow

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/member-management`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `refactor/` - Code refactoring (e.g., `refactor/api-structure`)
- `docs/` - Documentation updates (e.g., `docs/api-documentation`)
- `test/` - Test additions or updates (e.g., `test/auth-tests`)

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(members): add member import from CSV

Implement CSV parsing and validation for bulk member imports.
Includes error handling and progress tracking.

Closes #123
```

```
fix(auth): resolve token refresh issue

Fixed infinite loop in token refresh interceptor
when access token expires.
```

### Code Style

#### Backend (NestJS/TypeScript)
- Follow the ESLint and Prettier configuration
- Use dependency injection
- Write unit tests for services
- Document complex functions with JSDoc
- Use meaningful variable and function names

```typescript
// Good
async function getMemberById(id: string): Promise<Member> {
  // Implementation
}

// Bad
async function get(i: string) {
  // Implementation
}
```

#### Frontend (React/TypeScript)
- Use functional components with hooks
- Follow the component structure in `src/features`
- Use TypeScript types/interfaces
- Write meaningful component names
- Use Material-UI components when possible

```typescript
// Good
interface MemberCardProps {
  member: Member;
  onEdit: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit }) => {
  // Implementation
}

// Bad
export const Card = ({ data, fn }) => {
  // Implementation
}
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Aim for > 70% code coverage
- E2E tests for critical user flows

## 📚 Documentation

- Update README.md if adding new features or changing setup
- Update API documentation (Swagger) for backend changes
- Add JSDoc comments for complex functions
- Update this CONTRIBUTING.md if workflow changes

## 🔍 Code Review Process

1. Create a pull request with a clear title and description
2. Link related issues
3. Ensure all CI checks pass
4. Request review from maintainers
5. Address review comments
6. Once approved, your PR will be merged

### PR Checklist

- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log or debugging code
- [ ] ESLint and Prettier checks pass
- [ ] No merge conflicts
- [ ] Commits are clean and well-described

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - OS
   - Browser (for frontend issues)
   - Node.js version
   - Docker version (if applicable)
6. **Screenshots**: If applicable
7. **Logs**: Relevant error messages or logs

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature is already requested
2. Provide a clear use case
3. Explain the expected behavior
4. Consider the scope (does it fit the project?)

## 🔐 Security

If you discover a security vulnerability, please email [security@diaspora-platform.com](mailto:security@diaspora-platform.com) instead of creating a public issue.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Create a [GitHub Discussion](https://github.com/diaspora-platform/Diaspora/discussions)
- Join our [Discord community](https://discord.gg/diaspora-platform)
- Email: [dev@diaspora-platform.com](mailto:dev@diaspora-platform.com)

## 🙏 Thank You!

Thank you for contributing to the Diaspora Platform! Every contribution helps make the platform better for the African diaspora community.
