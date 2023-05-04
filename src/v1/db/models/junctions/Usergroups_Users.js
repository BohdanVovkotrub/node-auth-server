const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const ApiError = require('../../../exceptions/api-error');
const defaultsJunctions = require('../../default-values/junctions/default-usergroup_users.json');

// Super Associations Many-to-Many between 'Usergroups' and 'Users'

module.exports = (sequelize, DataTypes, myValidators, models) => {
    const {Usergroup, User} = models;
    
    const junctionModel = sequelize.define(
        'Usergroups_Users', 
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
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'userId must be only a uuid4.'
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
            }
        }
    );

    // Create Association
    Usergroup.belongsToMany(User, { through: { model: junctionModel }, foreignKey: 'usergroupId' });
    User.belongsToMany(Usergroup, { through: { model: junctionModel }, foreignKey: 'userId' });
    junctionModel.belongsTo(Usergroup, { foreignKey: 'usergroupId' });
    junctionModel.belongsTo(User, { foreignKey: 'userId' });
    Usergroup.hasMany(junctionModel, { foreignKey: 'usergroupId' });
    User.hasMany(junctionModel, { foreignKey: 'userId' });

    junctionModel.beforeValidate(async item => {
        const alreadyExists = await junctionModel.findOne({where: {usergroupId: item.usergroupId, userId: item.userId}});
        if (alreadyExists) throw ApiError.BadRequest(`User already exists in Usergroup.`);
        const usergroup = await Usergroup.findByPk(item.usergroupId);
        const user = await User.findByPk(item.userId);
        if (!usergroup) throw ApiError.DataNotFound('Usergroup not found');
        if (!user) throw ApiError.DataNotFound('User not found');
    });

    // Create default junctions 
    junctionModel.afterSync(async options => {
		try {
			for await (const junction of defaultsJunctions) {
                const usergroup = await Usergroup.findOne({ where: { name: junction.usergroupName }});
                const user = await User.findOne({ where: { login: junction.userLogin }});

                if (usergroup && user) {
                    const [obj, created] = await junctionModel.findOrCreate({ 
                        where: { 
                            userId: user.id, 
                            usergroupId: usergroup.id 
                        }, 
                        defaults: {
                            userId: user.id, 
                            usergroupId: usergroup.id
                        } 
                    });
                    if (created) {
                        log([
                            {FgGray: ` Default junction between usergroup `},
                            {FgCyan: `'${usergroup.name}'`},
                            {FgGray: ' and user '},
                            {FgCyan: user.login},
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