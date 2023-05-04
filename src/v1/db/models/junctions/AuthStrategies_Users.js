const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const defaultsJunctions = require('../../default-values/junctions/default-authStrategies_users.json');


// Super Associations Many-to-Many between 'AccessActions' and 'Roles'

module.exports = (sequelize, DataTypes, myValidators, models) => {
    const {AuthStrategy, User} = models;

    const junctionModel = sequelize.define(
        'AuthStrategies_Users', 
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
            authStrategyId: {
                type: DataTypes.UUID,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'authStrategyId must be only a uuid4.'
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
            }
        }
    );

    // Create Association
    AuthStrategy.belongsToMany(User, { through: { model: junctionModel }, foreignKey: 'authStrategyId' });
    User.belongsToMany(AuthStrategy, { through: { model: junctionModel }, foreignKey: 'userId' });
    junctionModel.belongsTo(AuthStrategy, { foreignKey: 'authStrategyId' });
    junctionModel.belongsTo(User, { foreignKey: 'userId' });
    AuthStrategy.hasMany(junctionModel, { foreignKey: 'authStrategyId' });
    User.hasMany(junctionModel, { foreignKey: 'userId' });

    junctionModel.beforeValidate(async item => {
        const alreadyExists = await junctionModel.findOne({where: {authStrategyId: item.authStrategyId, userId: item.userId}});
        if (alreadyExists) throw ApiError.BadRequest(`This User already performs this AuthStrategy.`);
        const authStrategy = await AuthStrategy.findByPk(item.authStrategyId);
        const user = await User.findByPk(item.userId);
        if (!authStrategy) throw ApiError.DataNotFound('AuthStrategy not found');
        if (!user) throw ApiError.DataNotFound('User not found');
    });


    // Create default junctions 
    junctionModel.afterSync(async options => {
		try {
			for await (const junction of defaultsJunctions) {
                const user = await User.findOne({ where: { login: junction.userLogin }});
                const authStrategy = await AuthStrategy.findOne({ where: { name: junction.strategyName }});

                if (authStrategy && user) {
                    const [obj, created] = await junctionModel.findOrCreate({ 
                        where: { 
                            authStrategyId: authStrategy.id, 
                            userId: user.id 
                        }, 
                        defaults: {
                            authStrategyId: authStrategy.id, 
                            userId: user.id
                        } 
                    });
                    if (created) {
                        log([
                            {FgGray: ` Default junction between User `},
                            {FgCyan: `'${user.login}'`},
                            {FgGray: ` and AuthStrategy '`},
                            {FgCyan: authStrategy.name},
                            {FgGray: `' was created with <id: `},
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