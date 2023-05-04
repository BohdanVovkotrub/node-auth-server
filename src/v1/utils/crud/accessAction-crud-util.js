const uuid = require('uuid');
const {Op} = require('sequelize');
const ApiError = require('../../exceptions/api-error');
const AccessActionDto = require('../../dtos/accessAction-dto');
const {AccessAction} = require('../../db/sequelize').models;


class AccessActionCrud {
    async createNew(accessAction) {
        try {
            const accessActionDto = new AccessActionDto(accessAction);
            const alreadyExists = await AccessAction.findOne({where: {name: accessActionDto.name}});
            if (alreadyExists) throw ApiError.BadRequest('AccessAction already exists.')
            const created = await AccessAction.create(accessActionDto);
            return new AccessActionDto(created.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async getAll() {
        try { 
            const accessActions = await AccessAction.findAll({attributes: ['id', 'name']});
            if (!accessActions) throw ApiError.DataNotFound();
            return accessActions.map(accessAction => new AccessActionDto(accessAction.toJSON()).simple);
        } catch (error) {
            throw error;
        };
    };

    async getOne(accessAction) {
        try {
            const isUuid = uuid.validate(accessAction);
            const where = isUuid ? {id: accessAction}: {name: {[Op.iLike]: accessAction}};
            const findedAccessAction = await AccessAction.findOne({ where });
            if (!findedAccessAction) throw ApiError.DataNotFound('AccessAction not found.');
            return new AccessActionDto(findedAccessAction.toJSON());
        } catch (error) {
            throw error;
        };
    };
    async updateOne(accessAction, body) {
        try {
            const isUuid = uuid.validate(accessAction);
            const where = isUuid ? {id: accessAction}: {name: {[Op.iLike]: accessAction}};
            const accessActionDto = new AccessActionDto(body);
            const updated = await AccessAction.update(accessActionDto, { where, returning: true, individualHooks: true });
            if (!updated || !updated[1] || !updated[1].length) throw ApiError.DataNotFound();
            return updated[1].map(action => new AccessActionDto(action.toJSON()));
        } catch (error) {
            throw error;
        };
    };
    async deleteOne(accessAction) {
        try {
            const isUuid = uuid.validate(accessAction);
            const where = isUuid ? {id: accessAction}: {name: {[Op.iLike]: accessAction}};
            const deletedRows = await AccessAction.destroy({ where });
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
};

module.exports = AccessActionCrud;