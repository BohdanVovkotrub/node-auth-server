const uuid = require('uuid');
const {Op} = require('sequelize');
const ApiError = require('../../exceptions/api-error');
const RoleDto = require('../../dtos/role-dto');
const {Role} = require('../../db/sequelize').models;


class RoleCrud {
    async createNew(role) {
        try {
            const roleDto = new RoleDto(role);
            const alreadyExists = await Role.findOne({where: {name: roleDto.name}});
            if (alreadyExists) throw ApiError.BadRequest('Role already exists.')
            const created = await Role.create(roleDto);
            return new RoleDto(created.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async getAll() {
        try { 
            const roles = await Role.findAll({attributes: ['id', 'name']});
            if (!roles) throw ApiError.DataNotFound();
            return roles.map(role => new RoleDto(role.toJSON()).simple);
        } catch (error) {
            throw error;
        };
    };

    async getOne(role) {
        try {
            const isUuid = uuid.validate(role);
            const where = isUuid ? {id: role}: {name: {[Op.iLike]: role}};
            const findedRole = await Role.findOne({ where });
            if (!findedRole) throw ApiError.DataNotFound('Role not found.');
            return new RoleDto(findedRole.toJSON());
        } catch (error) {
            throw error;
        };
    };
    async updateOne(role, body) {
        try {
            const isUuid = uuid.validate(role);
            const where = isUuid ? {id: role}: {name: {[Op.iLike]: role}};
            const roleDto = new RoleDto(body);
            const updated = await Role.update(roleDto, { where, returning: true, individualHooks: true });
            if (!updated || !updated[1] || !updated[1].length) throw ApiError.DataNotFound();
            return updated[1].map(role => new RoleDto(role.toJSON()));
        } catch (error) {
            throw error;
        };
    };
    async deleteOne(role) {
        try {
            const isUuid = uuid.validate(role);
            const where = isUuid ? {id: role}: {name: {[Op.iLike]: role}};
            const deletedRows = await Role.destroy({ where });
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
};

module.exports = RoleCrud;