# Associations Module

This module handles all association (tenant) management for the Diaspora Platform, including multi-tenant isolation.

## Features

- ✅ Create new associations with automatic setup
- ✅ CRUD operations for associations
- ✅ Multi-tenant data isolation
- ✅ Automatic role creation (President, Treasurer, Secretary, Member)
- ✅ User membership and access control
- ✅ Association statistics and analytics
- ✅ Audit logging

## API Endpoints

All endpoints require authentication (JWT Bearer token).

### POST /api/v1/associations
Create a new association.

**Request Body:**
```json
{
  "name": "Association des Ressortissants de Kayes",
  "slug": "association-kayes",
  "type": "SIMPLE",
  "logoUrl": "https://example.com/logo.png",
  "primaryCurrency": "EUR",
  "primaryLanguage": "fr",
  "subscriptionPlan": "PRO",
  "settings": {}
}
```

**Response:**
```json
{
  "association": {
    "id": "uuid",
    "name": "Association des Ressortissants de Kayes",
    "slug": "association-kayes",
    "type": "SIMPLE",
    "status": "ACTIVE",
    "createdAt": "2025-01-15T10:00:00.000Z"
  },
  "member": {
    "id": "uuid",
    "memberNumber": "M001",
    "statusType": "FOUNDER"
  },
  "role": {
    "id": "uuid",
    "name": "Président",
    "slug": "president"
  }
}
```

**Auto-created on association creation:**
- 4 default roles (President, Treasurer, Secretary, Member)
- Founder member with President role
- Audit log entry

### GET /api/v1/associations
Get all associations the current user is a member of.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Association des Ressortissants de Kayes",
    "slug": "association-kayes",
    "type": "SIMPLE",
    "logoUrl": "https://example.com/logo.png",
    "primaryCurrency": "EUR",
    "primaryLanguage": "fr",
    "status": "ACTIVE",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "membershipInfo": {
      "memberId": "uuid",
      "memberNumber": "M001",
      "statusType": "FOUNDER",
      "membershipDate": "2025-01-15",
      "roles": [
        {
          "id": "uuid",
          "name": "Président",
          "slug": "president"
        }
      ]
    }
  }
]
```

### GET /api/v1/associations/:id
Get a single association by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Association des Ressortissants de Kayes",
  "slug": "association-kayes",
  "type": "SIMPLE",
  "logoUrl": "https://example.com/logo.png",
  "primaryCurrency": "EUR",
  "primaryLanguage": "fr",
  "status": "ACTIVE",
  "subscriptionPlan": "PRO",
  "subscriptionStatus": "ACTIVE",
  "settings": {},
  "sections": [],
  "_count": {
    "members": 25,
    "projects": 3,
    "events": 5
  },
  "userMembership": {
    "id": "uuid",
    "memberNumber": "M001",
    "roles": [...]
  }
}
```

### GET /api/v1/associations/slug/:slug
Get association by slug (URL-friendly identifier).

**Example:** `/api/v1/associations/slug/association-kayes`

### GET /api/v1/associations/:id/stats
Get comprehensive statistics for an association.

**Response:**
```json
{
  "members": {
    "total": 25,
    "active": 23
  },
  "projects": {
    "total": 5,
    "active": 2
  },
  "events": {
    "upcoming": 3
  },
  "contributions": {
    "total": 150,
    "pending": 12
  },
  "finances": {
    "totalPayments": 12500.00,
    "totalIncome": 15000.00,
    "totalExpense": 8000.00,
    "balance": 7000.00
  }
}
```

### PATCH /api/v1/associations/:id
Update association details.

**Permissions:** President or users with '*' permission

**Request Body:**
```json
{
  "name": "Updated Association Name",
  "logoUrl": "https://example.com/new-logo.png",
  "primaryCurrency": "USD",
  "status": "ACTIVE",
  "settings": {
    "theme": "dark"
  }
}
```

### DELETE /api/v1/associations/:id
Deactivate an association (soft delete).

**Permissions:** President only

**Response:**
```json
{
  "message": "Association successfully deactivated"
}
```

## Multi-Tenant Isolation

### Tenant Middleware

The `TenantMiddleware` ensures data isolation:
- Automatically attaches tenant context to requests
- Verifies user access to the requested tenant
- Supports tenant ID from:
  - Header: `X-Tenant-ID`
  - Query parameter: `tenantId`
  - User's first association (default)

### Using @CurrentTenant Decorator

```typescript
@Get('example')
async example(@CurrentTenant() tenant: any) {
  // tenant object is available
  return { tenantId: tenant.id, name: tenant.name };
}
```

## Security & Permissions

### Permission System

Roles have granular permissions stored as JSON array:

**President (all permissions):**
```json
["*"]
```

**Treasurer:**
```json
[
  "finances.*",
  "payments.*",
  "contributions.*",
  "transactions.*",
  "members.read",
  "projects.read"
]
```

**Member:**
```json
[
  "profile.read",
  "profile.update",
  "contributions.read.own",
  "payments.read.own",
  "payments.create.own",
  "events.read",
  "projects.read"
]
```

### Access Control

- All endpoints require authentication
- User must be a member of the association to access
- Update/Delete require President role or specific permissions
- Audit logs track all changes

## Association Types

### SIMPLE
- Single association without sections
- One unified structure
- Suitable for local associations

### MULTI_SECTION
- Association with regional/national sections
- Each section has its own:
  - Members
  - Budget
  - Projects
  - Events
- Centralized governance

## Audit Logging

All association actions are logged:

```typescript
{
  "tenantId": "uuid",
  "userId": "uuid",
  "action": "ASSOCIATION_CREATED",
  "entityType": "Tenant",
  "entityId": "uuid",
  "changes": { ... },
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

**Logged actions:**
- `ASSOCIATION_CREATED`
- `ASSOCIATION_UPDATED`
- `ASSOCIATION_DELETED`

## Error Handling

**409 Conflict:** Slug already exists
```json
{
  "statusCode": 409,
  "message": "An association with this slug already exists"
}
```

**403 Forbidden:** Insufficient permissions
```json
{
  "statusCode": 403,
  "message": "You do not have permission to update this association"
}
```

**404 Not Found:** Association doesn't exist
```json
{
  "statusCode": 404,
  "message": "Association not found"
}
```

## Example Usage

### Creating an Association

```bash
curl -X POST http://localhost:3000/api/v1/associations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Association",
    "slug": "my-association",
    "primaryCurrency": "EUR",
    "primaryLanguage": "fr"
  }'
```

### Getting User's Associations

```bash
curl -X GET http://localhost:3000/api/v1/associations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Getting Association Stats

```bash
curl -X GET http://localhost:3000/api/v1/associations/{id}/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

- [ ] Add section management for MULTI_SECTION associations
- [ ] Implement role permissions middleware
- [ ] Add invitation system for new members
- [ ] Implement association settings page
- [ ] Add association avatar/banner upload
