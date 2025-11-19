import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log error
    this.logger.error(
      `${request.method} ${request.url} ${status}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Send to Sentry (only for 500 errors or if explicitly configured)
    if (
      process.env.SENTRY_DSN &&
      (status >= 500 || process.env.SENTRY_LOG_ALL_ERRORS === 'true')
    ) {
      Sentry.withScope((scope) => {
        scope.setTag('path', request.url);
        scope.setTag('method', request.method);
        scope.setTag('status_code', status);
        scope.setUser({
          id: request.user?.id,
          email: request.user?.email,
        });
        scope.setContext('request', {
          headers: request.headers,
          query: request.query,
          body: request.body,
          ip: request.ip,
        });

        if (exception instanceof Error) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureMessage(String(exception));
        }
      });
    }

    // Send response to client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || message,
    });
  }
}
