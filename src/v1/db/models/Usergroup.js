const path = require('path');
const ApiError = require('../../exceptions/api-error');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const defaultsUsergroups = require('../default-values/default-usergroups.json');

module.exports = (sequelize, DataTypes, myValidators) => {
    const { isEmailOrEmpty } = myValidators;

    const model = sequelize.define(
        'Usergroups', 
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'Validation error: ID must be only a uuid4.'
                    },
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    args: true,
                    msg: 'Validation error: This name already in use.'
                },
                validate: {
                    is: /^[(a-z)][(a-z)(0-9)(\.)]*$/gi , // это для имен. В будущем стоит разрешить любые символы для названий групп как в ActiveDirectory
                }
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    isEmailOrEmpty,
                }
            },
            description: {
                type: DataTypes.TEXT
            },
        }
    );

    model.validationFailed((instance, options, error) => {
        throw ApiError.BadRequest(error.message);
    });


    model.beforeBulkUpdate(async options => {
        const usergroup = await model.findOne({where: options.where});
        if (!usergroup) throw ApiError.DataNotFound('Usergroup not found.')
    });

    // Create default usergroups 
    model.afterSync(async options => {
		try {
			for await (const usergroup of defaultsUsergroups) {
				const [obj, created] = await model.findOrCreate({ where: { name: usergroup.name }, defaults: usergroup });
                if (created) {
                    log([
                        {FgGray: ` Default usergroup `},
                        {FgCyan: `'${usergroup.name}'`},
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