const uuid = require('uuid');
const ApiError = require('../exceptions/api-error');
const {Usergroups_Users, Usergroup, AuthStrategies_Users, AuthStrategy} = require('../db/sequelize').models;
const UserCrud = require('../utils/crud/user-crud-util');
const UsergroupCrud = require('../utils/crud/usergroup-crud-util');
const AuthStrategyCrud = require('../utils/crud/authStrategy-crud-util');



class UserService extends UserCrud {
    async setMembershipUsergroup(user, usergroup) {
        try {
            if (!user || !usergroup) throw ApiError.BadRequest();
            const userId = uuid.validate(user)? user: (await this.getOne(user)).id;
            const usergroupId = uuid.validate(usergroup)? usergroup: (await new UsergroupCrud().getOne(usergroup)).id;        
            const membership = await Usergroups_Users.create({userId, usergroupId});
            return membership.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getMembershipUsergroups(u) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid? {userId: u}: {userId: (await this.getOne(u)).id};
            
            const memberships = await Usergroups_Users.findAll({
                where,
                attributes: ['id', 'usergroupId', 'createdAt', 'updatedAt'],
                include: { model: Usergroup, attributes: ['name'], }
            });

            return memberships.map(membership => membership.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async removeMembershipUsergroup(user, usergroup) {
        try {
            if (!user || !usergroup) throw ApiError.BadRequest();
            const userId = uuid.validate(user)? user: (await this.getOne(user)).id;
            const usergroupId = uuid.validate(usergroup)? usergroup: (await new UsergroupCrud().getOne(usergroup)).id;
            const where = {userId, usergroupId};        
            const deletedRows = await Usergroups_Users.destroy({where});
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };



    async setMembershipAuthStrategy(user, strategy) {
        try {
            if (!user || !strategy) throw ApiError.BadRequest();
            const userId = uuid.validate(user)? user: (await this.getOne(user)).id;
            const authStrategyId = uuid.validate(strategy)? strategy: (await new AuthStrategyCrud().getOne(strategy)).id;        
            const membership = await AuthStrategies_Users.create({userId, authStrategyId});
            return membership.toJSON();
        } catch (error) {
            throw error;
        };
    };

    async getMembershipAuthStrategies(u) {
        try {
            const isUuid = uuid.validate(u);
            const where = isUuid? {userId: u}: {userId: (await this.getOne(u)).id};
            
            const memberships = await AuthStrategies_Users.findAll({
                where,
                attributes: ['id', 'authStrategyId', 'createdAt', 'updatedAt'],
                include: { model: AuthStrategy, attributes: ['name'], }
            });

            return memberships.map(membership => membership.toJSON());
        } catch (error) {
            throw error;
        };
    };

    async removeMembershipAuthStrategy(user, strategy) {
        try {
            if (!user || !strategy) throw ApiError.BadRequest();
            const userId = uuid.validate(user)? user: (await this.getOne(user)).id;
            const authStrategyId = uuid.validate(strategy)? strategy: (await new AuthStrategyCrud().getOne(strategy)).id;
            const where = {userId, authStrategyId};        
            const deletedRows = await AuthStrategies_Users.destroy({where});
            if (deletedRows === 0) throw ApiError.DataNotFound("The Data cannot delete or it was deleted early.");
            return deletedRows;
        } catch (error) {
            throw error;
        };
    };
}


module.exports = new UserService();