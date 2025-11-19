import { Request } from 'express';

export interface RequestWithTenant extends Request {
  tenant?: any;
  user?: any;
}
