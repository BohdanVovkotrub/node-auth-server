const ms = require('ms');
const authService = require('../services/auth-service');

const isAuthenticated = (res, result) => {
    const maxAge = process.env.JWT_REFRESH_EXPIRES_IN || 0;
    res.cookie(
        'refreshToken', 
        result.tokenData.refreshToken, 
        {
            maxAge: Number.isInteger(maxAge)? maxAge: ms(maxAge), 
            httpOnly: true
        }
    );
    res.append('Authorization', `Bearer ${result.tokenData.accessToken}`);
    return res.send(result);
};

const login = async (req, res, next) => {
    try {
        const authData = req.body;
        const result = await authService.authentication(authData);
        if (result.isAuthenticated) return isAuthenticated(res, result);
        return res.send(result.message);
    } catch (error) {
        next(error);
    };
};

const verifyCode = async (req, res, next) => {
    try {
        const verifyData = req.body;
        const result = await authService.verifyCode(verifyData);
        if (result.isAuthenticated) return isAuthenticated(res, result);
        return res.send(result.message);
    } catch (error) {
        next(error);
    };
};

const logout = async (req, res, next) => {
    try {
        console.dir(req.headers.authorization)
        const {refreshToken} = req.cookies;
        const token = await authService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};

const refresh = async (req, res, next) => {
    try {
        const {refreshToken} = req.cookies;
        const result = await authService.refresh(refreshToken);
        if (result.isAuthenticated) return isAuthenticated(res, result);
        return res.send(result.message);
    } catch (error) {
        next(error);
    };
};

module.exports = {login, verifyCode, logout, refresh};