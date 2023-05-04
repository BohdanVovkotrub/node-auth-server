const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const {Roles_Usergroups, Usergroup, AccessActions_Roles, AccessAction } = require('../db/sequelize').models;
const RoleCrud = require('../utils/crud/role-crud-util');
const UsergroupCrud = require('../utils/crud/usergroup-crud-util');
const AccessActionCrud = require('../utils/crud/accessAction-crud-util');

class RoleService extends RoleCrud {
    async setMembershipUsergroup(role, usergroup) {
        try {
            if (!role || !usergroup) throw ApiError.BadRequest();
            const roleId = uuid.validate(role)? role: (await this.getOne(role)).id;
            const usergroupId = uuid.validate(usergroup)? usergroup: (await new UsergroupCrud().getOne(usergroup)).id;        
            const membership = await Roles_Usergroups.create({roleId, usergroupId});
            return membership.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getMembershipUsergroups(role) {
        try {
            const isUuid = uuid.validate(role);
            const where = isUuid? {roleId: role}: {roleId: (await this.getOne(role)).id};
            const memberships = await Roles_Usergroups.findAll({
                where,
                attributes: ['id', 'usergroupId', 'createdAt', 'updatedAt'],
                include: { model: Usergroup, attributes: ['name'], }
            });
            return memberships.map(membership => membership.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async removeMembershipUsergroup(role, usergroup) {
        try {
            if (!role || !usergroup) throw ApiError.BadRequest();
            const roleId = uuid.validate(role)? role: (await this.getOne(role)).id;
            const usergroupId = uuid.validate(usergroup)? usergroup: (await new UsergroupCrud().getOne(usergroup)).id;
            const where = {roleId, usergroupId};        
            const deletedRows = await Roles_Usergroups.destroy({where});
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };

    async setMembershipAccessAction(role, accessAction) {
        try {
            if (!role || !accessAction) throw ApiError.BadRequest();
            const roleId = uuid.validate(role)? role: (await this.getOne(role)).id;
            const accessActionId = uuid.validate(accessAction)? accessAction: (await new AccessActionCrud().getOne(accessAction)).id;        
            const membership = await Roles_Usergroups.create({roleId, accessActionId});
            return membership.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getMembershipAccessActions(role) {
        try {
            const isUuid = uuid.validate(role);
            const where = isUuid? {roleId: role}: {roleId: (await this.getOne(role)).id};
            
            const memberships = await AccessActions_Roles.findAll({
                where,
                attributes: ['id', 'accessActionId', 'createdAt', 'updatedAt'],
                include: { model: AccessAction, attributes: ['name'], }
            });

            return memberships.map(membership => membership.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async removeMembershipAccessAction(role, accessAction) {
        try {
            if (!role || !accessAction) throw ApiError.BadRequest();
            const roleId = uuid.validate(role)? role: (await this.getOne(role)).id;
            const accessActionId = uuid.validate(accessAction)? accessAction: (await new AccessActionCrud().getOne(accessAction)).id;  
            const where = {roleId, accessActionId};        
            const deletedRows = await AccessActions_Roles.destroy({where});
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
};


module.exports = new RoleService();