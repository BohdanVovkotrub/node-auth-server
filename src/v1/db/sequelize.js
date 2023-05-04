require("dotenv").config();
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const myValidators = require('../utils/validators_for_sequelize');
const {log, logWait} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));

const pgconfig = {
    user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT,
    dialect: process.env.PGDIALECT
};

const sequelize = new Sequelize(
    pgconfig.database,
    pgconfig.user, 
    pgconfig.password, 
    {
        dialect: pgconfig.dialect,
        host: pgconfig.host,
        port: pgconfig.port,

        logging: false,
    },
    
);

const AuthStrategy = require('./models/AuthStrategy')(sequelize, DataTypes, myValidators);
const AccessAction = require('./models/AccessAction')(sequelize, DataTypes, myValidators);
const Role = require('./models/Role')(sequelize, DataTypes, myValidators);
const AccessActions_Roles = require('./models/junctions/AccessActions_Roles')(sequelize, DataTypes, myValidators, {AccessAction, Role});
const Usergroup = require('./models/Usergroup')(sequelize, DataTypes, myValidators);
const Roles_Usergroups = require('./models/junctions/Roles_Usergroups')(sequelize, DataTypes, myValidators, {Role, Usergroup});
const User = require('./models/User')(sequelize, DataTypes, myValidators);
const Usergroups_Users = require('./models/junctions/Usergroups_Users')(sequelize, DataTypes, myValidators, {Usergroup, User});
const AuthStrategies_Users = require('./models/junctions/AuthStrategies_Users')(sequelize, DataTypes, myValidators, {AuthStrategy, User});
const AuthVerifyCode = require('./models/AuthVerifyCode')(sequelize, DataTypes, myValidators);
const JwtToken = require('./models/JwtToken')(sequelize, DataTypes, myValidators);

// Associations One-to-One between 'AuthVerifyCode' and 'User'
User.hasOne(AuthVerifyCode, { onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'userId' });
AuthVerifyCode.belongsTo(User, { foreignKey: 'userId' });

// Associations One-to-One between 'JwtToken' and 'User'
User.hasOne(JwtToken, { onDelete: 'CASCADE', onUpdate: 'CASCADE', foreignKey: 'userId' });
JwtToken.belongsTo(User, { foreignKey: 'userId' });

const syncModels = async () => {
    try {
        await logWait('Synchronizing Database');

        // await Role.sync({force: false});
        // await Usergroup.sync({force: false});
        // await Roles_Usergroups.sync({force: false});
        // await User.sync({force: false});
        // await Usergroups_Users.sync({force: false});

        await sequelize.sync({force: false});

        log([{FgMagenta: ' The database synced successfully!'}], 'critical');
        return true;
    } catch (error) {
        throw error;
    };
};


module.exports = {
    sequelize,
    models: {
        AuthStrategy,
        AccessAction,
        Role,
        AccessActions_Roles,
        Usergroup,
        Roles_Usergroups,
        User,
        Usergroups_Users,
        AuthStrategies_Users,
        AuthVerifyCode,
        JwtToken,
    },
    syncModels,
};