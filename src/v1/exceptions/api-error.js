

class ApiError extends Error {
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    };

    static UnathorizedError() {
        return new ApiError(401, 'User is not authorized.');
    };

    static BadRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    };

    static Forbidden(message = '') {
        return new ApiError(403, 'Forbidden. ' + message);
    };
    static DataNotFound(message = '') {
        return new ApiError(404, 'Data not found. ' + message);
    };
    static Gone(message = '') {
        return new ApiError(410, 'Gone. The requested resource is no longer available at the server. ' + message);
    };

    static InternalServerError(message = '') {
        return new ApiError(500, 'Internal server error. ' + message);
    };
}

module.exports = ApiError;