import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../utils/logger';
import { AppError, ValidationError } from '../utils/error';
import { apiError, apiValidationError } from '../utils/response';

// ============================================================
// MIDDLEWARE COMPOSER v2 (Enterprise Edition)
// ============================================================

type MiddlewareFn = (request: NextRequest) => Promise<NextResponse | null>;
type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

/**
 * Wraps a route handler with:
 * 1. Middleware chaining
 * 2. Centralized Error Handling (AppError -> Response)
 * 3. Request Logging
 */
export function withMiddleware(...middlewares: MiddlewareFn[]) {
  return function (handler: RouteHandler) {
    return async function (request: NextRequest, ...args: any[]): Promise<NextResponse> {
      const startTime = Date.now();
      const url = request.nextUrl.pathname;
      const method = request.method;

      try {
        // 1. Run Middlewares
        for (const middleware of middlewares) {
          const result = await middleware(request);
          if (result !== null) {
            return result;
          }
        }

        // 2. Execute Handler
        const response = await handler(request, ...args);

        // 3. Log Performance
        const duration = Date.now() - startTime;
        logger.info(`${method} ${url} - ${response.status} (${duration}ms)`);

        return response;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        // 4. Centralized Error Handling
        if (error instanceof AppError) {
          logger.warn(`${method} ${url} - ${error.statusCode} (${duration}ms): ${error.message}`);
          
          if (error instanceof ValidationError) {
            return apiValidationError(error.errors, error.message);
          }
          
          return apiError(error.message, error.statusCode, error.extra);
        }

        // 5. Unexpected Internal Errors
        logger.error(`${method} ${url} - 500 (${duration}ms)`, error);
        return apiError(
          process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred.' 
            : error.message,
          500
        );
      }
    };
  };
}
