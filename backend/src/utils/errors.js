class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message = "Invalid input") {
        super(message, 400, "VALIDATION_ERROR");
    }
}

class AuthenticationError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401, "AUTHENTICATION_ERROR");
    }
}

class AuthorizationError extends AppError {
    constructor(message = "You are not allowed to do this") {
        super(message, 403, "AUTHORIZATION_ERROR");
    }
}

class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(message, 404, "NOT_FOUND");
    }
}

class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409, "CONFLICT");
    }
}

class OAuthError extends AppError {
    constructor(message = "Google sign-in failed") {
        super(message, 400, "OAUTH_ERROR");
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    OAuthError,
};
