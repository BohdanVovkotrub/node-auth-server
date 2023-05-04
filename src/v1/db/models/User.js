const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const passwordUtil = require('../../utils/password-util');
const UserDto = require('../../dtos/user-dto');
const ApiError = require('../../exceptions/api-error');
const defaultsUsers = require('../default-values/default-users.json');


module.exports = (sequelize, DataTypes, myValidators) => {
    const { isBoolean, isEmailOrEmpty } = myValidators;

    const model = sequelize.define(
        'Users', 
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
            enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, validate: {isBoolean} },
            login: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    args: true,
                    msg: 'This login already in use.'
                },
                validate: {
                    is: /^[(a-z)][(a-z)(0-9)(\.)]*$/gi , // это для имен. В будущем стоит разрешить любые символы для названий групп как в ActiveDirectory
                }
            },
            password: {
                type: DataTypes.STRING,
                unique: false,
            },
            first_name: {
                type: DataTypes.STRING,
                unique: false,
            },
            last_name: {
                type: DataTypes.STRING,
                unique: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isEmailOrEmpty,
                }
            },
            phone1: {
                type: DataTypes.STRING,
                unique: false,
            },
            phone2: {
                type: DataTypes.STRING,
                unique: false,
            },
            phone3: {
                type: DataTypes.STRING,
                unique: false,
            },
            avatar: {
                type: DataTypes.STRING,
                unique: false,
            },
            description: {
                type: DataTypes.TEXT
            }
        }
    );

    

    const hashPasswordHook = async (instance) => {  
        if (!instance.changed('password')) return;
        if (!instance.get('password')) return; 
        const hash = await passwordUtil.hash(instance.get('password'));
        return instance.set('password', hash);
    };

    model.beforeCreate(hashPasswordHook);
    model.beforeUpdate(hashPasswordHook);
    
    model.validationFailed((instance, options, error) => {
        throw ApiError.BadRequest(error.message);
    });

    model.beforeBulkUpdate(async options => {
        const user = await model.findOne({where: options.where});
        if (!user) throw ApiError.DataNotFound('User not found.')
    });

    // Create default users 
    model.afterSync(async options => {
		try {
			for await (const user of defaultsUsers) {
                const userDto = new UserDto(user);
				const [obj, created] = await model.findOrCreate({ where: { login: userDto.login }, defaults: userDto });
                if (created) {
                    log([
                        {FgGray: ` Default user `},
                        {FgCyan: `'${user.login}'`},
                        {FgGray: ` was created with <id: `},
                        {FgCyan: obj.id},
                        {FgGray: `>.`}
                    ]);
                };
			}
		} catch (error) {
			throw error;
		};
	});

    return model;
};