const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const {Usergroups_Users, User, Roles_Usergroups, Role} = require('../db/sequelize').models;
const UsergroupCrud = require('../utils/crud/usergroup-crud-util');
const UserCrud = require('../utils/crud/user-crud-util');
const RoleCrud = require('../utils/crud/role-crud-util');

class UsergroupService extends UsergroupCrud {
    async setMembershipUser(usergroup, user) {
        try {
            if (!usergroup || !user) throw ApiError.BadRequest();
            const usergroupId = uuid.validate(usergroup)? usergroup: (await this.getOne(usergroup)).id;
            const userId = uuid.validate(user)? user: (await new UserCrud().getOne(user)).id;        
            const membership = await Usergroups_Users.create({usergroupId, userId});
            return membership.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getMembershipUsers(usergroup) {
        try {
            const isUuid = uuid.validate(usergroup);
            const where = isUuid? {usergroupId: usergroup}: {usergroupId: (await this.getOne(usergroup)).id};
            const memberships = await Usergroups_Users.findAll({
                where,
                attributes: ['id', 'userId', 'createdAt', 'updatedAt'],
                include: { model: User, attributes: ['login'], }
            });
            return memberships.map(membership => membership.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async removeMembershipUser(usergroup, user) {
        try {
            if (!usergroup || !user) throw ApiError.BadRequest();
            const usergroupId = uuid.validate(usergroup)? usergroup: (await this.getOne(usergroup)).id;
            const userId = uuid.validate(user)? user: (await new UserCrud().getOne(user)).id;
            const where = {usergroupId, userId};        
            const deletedRows = await Usergroups_Users.destroy({where});
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };



    async setMembershipRole(usergroup, role) {
        try {
            if (!usergroup || !role) throw ApiError.BadRequest();
            const usergroupId = uuid.validate(usergroup)? usergroup: (await this.getOne(usergroup)).id;
            const roleId = uuid.validate(role)? role: (await new RoleCrud().getOne(role)).id;        
            const membership = await Roles_Usergroups.create({usergroupId, roleId});
            return membership.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getMembershipRoles(usergroup) {
        try {
            const isUuid = uuid.validate(usergroup);
            const where = isUuid? {usergroupId: usergroup}: {usergroupId: (await this.getOne(usergroup)).id};
            const memberships = await Roles_Usergroups.findAll({
                where,
                attributes: ['id', 'roleId', 'createdAt', 'updatedAt'],
                include: { model: Role, attributes: ['name'], }
            });
            return memberships.map(membership => membership.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async removeMembershipRole(usergroup, role) {
        try {
            if (!usergroup || !role) throw ApiError.BadRequest();
            const usergroupId = uuid.validate(usergroup)? usergroup: (await this.getOne(usergroup)).id;
            const roleId = uuid.validate(role)? role: (await new RoleCrud().getOne(role)).id;
            const where = {usergroupId, roleId};        
            const deletedRows = await Roles_Usergroups.destroy({where});
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
}

module.exports = new UsergroupService();