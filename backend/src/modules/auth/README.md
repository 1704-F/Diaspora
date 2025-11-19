# Authentication Module

This module handles all authentication-related functionality for the Diaspora Platform.

## Features

- ✅ User registration with email verification
- ✅ Login with JWT tokens
- ✅ Password reset flow
- ✅ Token refresh mechanism
- ✅ Profile management
- ✅ Protected routes with guards

## API Endpoints

### Public Endpoints

#### POST /api/v1/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678",
  "language": "fr"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "language": "fr",
    "emailVerified": false,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

#### POST /api/v1/auth/login
Login an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/v1/auth/verify-email?token={token}
Verify user email address.

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

#### POST /api/v1/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

#### POST /api/v1/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

#### POST /api/v1/auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints

#### GET /api/v1/auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678",
  "avatarUrl": null,
  "language": "fr",
  "timezone": "Europe/Paris",
  "emailVerified": true,
  "twoFactorEnabled": false,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "members": []
}
```

#### POST /api/v1/auth/logout
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## Guards & Decorators

### @Public()
Use this decorator to make an endpoint publicly accessible (bypass JWT authentication).

```typescript
@Public()
@Get('public-route')
getPublicData() {
  return { message: 'This is public' };
}
```

### @CurrentUser()
Get the currently authenticated user in your controller.

```typescript
@Get('protected-route')
@UseGuards(JwtAuthGuard)
getProtectedData(@CurrentUser() user: any) {
  return { userId: user.id };
}
```

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 10
- **JWT Tokens**:
  - Access Token: 15 minutes expiration
  - Refresh Token: 7 days expiration
- **Email Verification**: Required before login
- **Password Reset**: Time-limited tokens (1 hour)
- **Global JWT Guard**: All routes are protected by default unless marked with `@Public()`

## Environment Variables

Required in `.env`:

```env
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRATION=7d
```

## TODO

- [ ] Implement email service for verification and password reset
- [ ] Add two-factor authentication (2FA)
- [ ] Implement token blacklisting for logout (Redis)
- [ ] Add rate limiting for auth endpoints
- [ ] Add account lockout after failed login attempts
- [ ] Implement social login (Google, Facebook)
