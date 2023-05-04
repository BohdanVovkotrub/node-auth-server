const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const defaultsJunctions = require('../../default-values/junctions/default-roles_usergroups.json');


// Super Associations Many-to-Many between 'Usergroups' and 'Roles'

module.exports = (sequelize, DataTypes, myValidators, models) => {
    const {Role, Usergroup} = models;

    const junctionModel = sequelize.define(
        'Roles_Usergroups', 
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'ID must be only a uuid4.'
                    },
                }
            },
            usergroupId: {
                type: DataTypes.UUID,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'usergroupId must be only a uuid4.'
                    },
                }
            },
            roleId: {
                type: DataTypes.UUID,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'roleId must be only a uuid4.'
                    },
                    
                }
            }
        }
    );

    // Create Association
    Role.belongsToMany(Usergroup, { through: { model: junctionModel }, foreignKey: 'roleId' });
    Usergroup.belongsToMany(Role, { through: { model: junctionModel }, foreignKey: 'usergroupId' });
    junctionModel.belongsTo(Role, { foreignKey: 'roleId' });
    junctionModel.belongsTo(Usergroup, { foreignKey: 'usergroupId' });
    Role.hasMany(junctionModel, { foreignKey: 'roleId' });
    Usergroup.hasMany(junctionModel, { foreignKey: 'usergroupId' });


    junctionModel.beforeValidate(async item => {
        const alreadyExists = await junctionModel.findOne({where: {roleId: item.roleId, usergroupId: item.usergroupId}});
        if (alreadyExists) throw ApiError.BadRequest(`This Usergroup already performs this Role.`);
        const usergroup = await Usergroup.findByPk(item.usergroupId);
        const role = await Role.findByPk(item.roleId);
        if (!usergroup) throw ApiError.DataNotFound('Usergroup not found');
        if (!role) throw ApiError.DataNotFound('Role not found');
    });


    // Create default junctions 
    junctionModel.afterSync(async options => {
		try {
			for await (const junction of defaultsJunctions) {
                const role = await Role.findOne({ where: { name: junction.roleName }});
                const usergroup = await Usergroup.findOne({ where: { name: junction.usergroupName }});

                if (usergroup && role) {
                    const [obj, created] = await junctionModel.findOrCreate({ 
                        where: { 
                            usergroupId: usergroup.id, 
                            roleId: role.id 
                        }, 
                        defaults: {
                            usergroupId: usergroup.id, 
                            roleId: role.id
                        } 
                    });
                    if (created) {
                        log([
                            {FgGray: ` Default junction between role `},
                            {FgCyan: `'${role.name}'`},
                            {FgGray: ' and usergroup '},
                            {FgCyan: usergroup.name},
                            {FgGray: ' was created with <id: '},
                            {FgCyan: obj.id},
                            {FgGray: `>.`}
                        ]);
                    };
                };
			};
		} catch (error) {
			throw error;
		};
	});

    return junctionModel;
};