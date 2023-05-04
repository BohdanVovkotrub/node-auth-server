const ApiError = require('../exceptions/api-error');
const jwtTokenService = require('../services/jwtToken-service');


const checkAuthorization = (req, res, next) => {
    try {
        // You need to add to headers '{Authorization: "Bearer <accessToken>}"'
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) return next(ApiError.UnathorizedError());
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) return next(ApiError.UnathorizedError());
        const decodedToken = jwtTokenService.validateAccessToken(accessToken);
        if (!decodedToken) return next(ApiError.UnathorizedError());
        req.user = decodedToken;
        next();
    } catch (error) {
        return next(ApiError.UnathorizedError());
    };
};

function checkAccessAction(req, res, next) {
    if (!this.accessActionName) return next(ApiError.InternalServerError('Cannot get name of the access action.'));
    if (!req.user) return next(ApiError.UnathorizedError());
    const {accessActions} = req.user;
    if (!accessActions) return next(ApiError.UnathorizedError());
    if (!accessActions.includes(this.accessActionName)) return next(ApiError.Forbidden());
    next();
};


module.exports = {
    checkAuthorization,
    checkAccessAction
};