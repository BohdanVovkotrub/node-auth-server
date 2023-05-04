const uuid = require('uuid');
const {Op} = require('sequelize');
const ApiError = require('../../exceptions/api-error');
const UsergroupDto = require('../../dtos/usergroup-dto');
const {Usergroup} = require('../../db/sequelize').models;


class UsergroupCrud {
    async createNew(usergroup) {
        try {
            const usergroupDto = new UsergroupDto(usergroup);
            const created = await Usergroup.create(usergroupDto);
            return created.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getAll() {
        try { 
            const usergroups = await Usergroup.findAll({attributes: ['id', 'name']});
            if (!usergroups) throw ApiError.DataNotFound();
            return usergroups.map(usergroup => new UsergroupDto(usergroup.toJSON()).simple);
        } catch (error) {
            throw error;
        };
    };

    async getOne(u) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid ? {id: u}: {name: {[Op.iLike]: u}};
            const usergroup = await Usergroup.findOne({ where });
            if (!usergroup) throw ApiError.DataNotFound('Usergroup not found.');
            return usergroup.toJSON();
        } catch (error) {
            throw error;
        };
    };
    async updateOne(u, body) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid ? {id: u}: {name: {[Op.iLike]: u}};
            const usergroupDto = new UsergroupDto(body);
            const updated = await Usergroup.update(usergroupDto, { where, returning: true, individualHooks: true });
            if (!updated || !updated[1]) throw ApiError.BadRequest('Usergroup cannot update.');
            return updated[1].map(usergroup => new UsergroupDto(usergroup.toJSON()));
        } catch (error) {
            throw error;
        };
    };
    async deleteOne(u) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid ? {id: u}: {name: {[Op.iLike]: u}};
            const deletedRows = await Usergroup.destroy({ where });
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
};

module.exports = UsergroupCrud;