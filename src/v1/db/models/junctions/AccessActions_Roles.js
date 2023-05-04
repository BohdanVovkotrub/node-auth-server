const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const defaultsJunctions = require('../../default-values/junctions/default-accessActions_roles.json');


// Super Associations Many-to-Many between 'AccessActions' and 'Roles'

module.exports = (sequelize, DataTypes, myValidators, models) => {
    const {AccessAction, Role} = models;

    const junctionModel = sequelize.define(
        'AccessActions_Roles', 
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
            accessActionId: {
                type: DataTypes.UUID,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'accessActionId must be only a uuid4.'
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
    AccessAction.belongsToMany(Role, { through: { model: junctionModel }, foreignKey: 'accessActionId' });
    Role.belongsToMany(AccessAction, { through: { model: junctionModel }, foreignKey: 'roleId' });
    junctionModel.belongsTo(AccessAction, { foreignKey: 'accessActionId' });
    junctionModel.belongsTo(Role, { foreignKey: 'roleId' });
    AccessAction.hasMany(junctionModel, { foreignKey: 'accessActionId' });
    Role.hasMany(junctionModel, { foreignKey: 'roleId' });

    junctionModel.beforeValidate(async item => {
        const alreadyExists = await junctionModel.findOne({where: {accessActionId: item.accessActionId, roleId: item.roleId}});
        if (alreadyExists) throw ApiError.BadRequest(`This Role already performs this AccessAction.`);
        const accessAction = await AccessAction.findByPk(item.accessActionId);
        const role = await Role.findByPk(item.roleId);
        if (!accessAction) throw ApiError.DataNotFound('AccessAction not found');
        if (!role) throw ApiError.DataNotFound('Role not found');
    });


    // Create default junctions 
    junctionModel.afterSync(async options => {
		try {
			for await (const junction of defaultsJunctions) {
                const role = await Role.findOne({ where: { name: junction.roleName }});
                const accessAction = await AccessAction.findOne({ where: { name: junction.accessActionName }});

                if (accessAction && role) {
                    const [obj, created] = await junctionModel.findOrCreate({ 
                        where: { 
                            accessActionId: accessAction.id, 
                            roleId: role.id 
                        }, 
                        defaults: {
                            accessActionId: accessAction.id, 
                            roleId: role.id
                        } 
                    });
                    if (created) {
                        log([
                            {FgGray: ` Default junction between role `},
                            {FgCyan: `'${role.name}'`},
                            {FgGray: ' and accessAction '},
                            {FgCyan: accessAction.name},
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