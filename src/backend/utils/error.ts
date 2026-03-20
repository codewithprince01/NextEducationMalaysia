/**
 * Custom Error classes for standardized error handling.
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public extra: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', extra = {}) {
    super(message, 404, extra);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', extra = {}) {
    super(message, 401, extra);
  }
}

export class ValidationError extends AppError {
  constructor(public errors: Record<string, string[]>, message = 'Validation failed') {
    super(message, 422, { errors });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', extra = {}) {
    super(message, 409, extra);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error', extra = {}) {
    super(message, 500, extra);
  }
}
