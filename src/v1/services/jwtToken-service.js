const jwt = require('jsonwebtoken');
const {JwtToken} = require('../db/sequelize').models;
const ApiError = require('../exceptions/api-error');

class JwtTokenService {
    generateTokens(payloadAccess, payloadRefresh) {
        const accessToken = jwt.sign(
            payloadAccess, 
            process.env.JWT_ACCESS_SECRET, 
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
                algorithm: process.env.JWT_ALGORITHM
            }
        );
        const refreshToken = jwt.sign(
            payloadRefresh, 
            process.env.JWT_REFRESH_SECRET, 
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
                algorithm: process.env.JWT_ALGORITHM
            }
        );
        
        return {
            accessToken,
            refreshToken,
        };
    };

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {algorithms: [process.env.JWT_ALGORITHM]});
            return userData;
        } catch (error) {
            throw ApiError.UnathorizedError();
        };
    };

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {algorithms: [process.env.JWT_ALGORITHM]});
            return userData;
        } catch (error) {
            return null;
        };
    };

    async saveToken(userId, refreshToken) {
        const tokenData = await JwtToken.findOne({where: {userId}});
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        };
        const token = await JwtToken.create({userId, refreshToken});
        return token;
    };

    async removeToken(refreshToken) {
        const tokenData = await JwtToken.destroy({where: {refreshToken}});
        return tokenData;  
    };

    async findToken(refreshToken) {
        const tokenData = await JwtToken.findOne({where: {refreshToken}});
        return tokenData;  
    };
};

module.exports = new JwtTokenService();