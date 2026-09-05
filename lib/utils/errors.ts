// Custom error types for business logic

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnbalancedEntryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnbalancedEntryError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class PaymentGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}
