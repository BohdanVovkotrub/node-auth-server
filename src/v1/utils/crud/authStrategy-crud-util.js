const uuid = require('uuid');
const {Op} = require('sequelize');
const ApiError = require('../../exceptions/api-error');
const AuthStrategyDto = require('../../dtos/authStrategy-dto');
const {AuthStrategy} = require('../../db/sequelize').models;


class AuthStrategyCrud {
    async getAll() {
        try { 
            const authStrategies = await AuthStrategy.findAll({attributes: ['id', 'name']});
            if (!authStrategies) throw ApiError.DataNotFound();
            return authStrategies.map(authStrategy => new AuthStrategyDto(authStrategy.toJSON()));
        } catch (error) {
            throw error;
        };
    };

    async getOne(authStrategy) {
        try {
            const isUuid = uuid.validate(authStrategy);
            const where = isUuid ? {id: authStrategy}: {name: {[Op.iLike]: authStrategy}};
            const findedAuthStrategy = await AuthStrategy.findOne({ where });
            if (!findedAuthStrategy) throw ApiError.DataNotFound('AuthStrategy not found.');
            return new AuthStrategyDto(findedAuthStrategy.toJSON());
        } catch (error) {
            throw error;
        };
    };
};

module.exports = AuthStrategyCrud;