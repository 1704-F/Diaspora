import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../services/prisma.service';

export interface RequestWithTenant extends Request {
  tenant?: any;
  user?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction) {
    // Skip tenant middleware for auth routes and health checks
    if (
      req.path.startsWith('/api/v1/auth') ||
      req.path === '/api/v1' ||
      req.path === '/api/v1/health' ||
      req.path === '/'
    ) {
      return next();
    }

    // Get tenant ID from headers, query, or user's associations
    const tenantId =
      req.headers['x-tenant-id'] ||
      req.query.tenantId ||
      (req.user as any)?.members?.[0]?.tenantId;

    if (!tenantId) {
      // If user is authenticated but no tenant specified, use their first tenant
      if (req.user && (req.user as any).members?.length > 0) {
        const firstMember = (req.user as any).members[0];
        req.tenant = firstMember.tenant;
        return next();
      }

      throw new UnauthorizedException('No tenant specified');
    }

    // Validate tenant exists and user has access
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId as string },
      include: {
        members: req.user
          ? {
              where: { userId: (req.user as any).id },
              include: {
                roles: {
                  include: {
                    role: true,
                  },
                },
              },
            }
          : false,
      },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    // Check if user has access to this tenant
    if (req.user && tenant.members && tenant.members.length === 0) {
      throw new UnauthorizedException('You do not have access to this association');
    }

    // Attach tenant to request
    req.tenant = tenant;

    next();
  }
}
