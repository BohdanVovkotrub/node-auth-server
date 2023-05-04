const uuid = require('uuid');
const {Op} = require('sequelize');
const ApiError = require('../../exceptions/api-error');
const UserDto = require('../../dtos/user-dto');
const {User} = require('../../db/sequelize').models;

class UserCrud {
    async createNew(user) {
        try {
            const userDto = new UserDto(user);
            const alreadyExists = await User.findOne({where: {login: userDto.login}});
            if (alreadyExists) throw ApiError.BadRequest('User already exists.')
            const created = await User.create(userDto);
            return new UserDto(created.toJSON()).secure;
        } catch (error) {
            throw error;
        };
    };

    async getAll() {
        try { 
            const users = await User.findAll({attributes: ['id', 'login']});
            if (!users) throw ApiError.DataNotFound();
            return users.map(user => new UserDto(user.toJSON()).secureSimple);
        } catch (error) {
            throw error;
        };
    };

    async getOne(u) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid ? {id: u}: {login: {[Op.iLike]: u}};
            const user = await User.findOne({ where });
            if (!user) throw ApiError.DataNotFound('User not found.');
            return new UserDto(user.toJSON()).secure;
        } catch (error) {
            throw error;
        };
    };
    async updateOne(u, body) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid ? {id: u}: {login: {[Op.iLike]: u}};
            const userDto = new UserDto(body);
            const updated = await User.update(userDto, { where, returning: true, individualHooks: true });
            if (!updated || !updated[1] || !updated[1].length) throw ApiError.DataNotFound();
            return updated[1].map(user => new UserDto(user.toJSON()).secure);
        } catch (error) {
            throw error;
        };
    };
    async deleteOne(u) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid ? {id: u}: {login: {[Op.iLike]: u}};
            const deletedRows = await User.destroy({ where });
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
};

module.exports = UserCrud;