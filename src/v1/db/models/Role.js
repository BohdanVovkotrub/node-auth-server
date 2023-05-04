const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const ApiError = require('../../exceptions/api-error');
const defaultsRoles = require('../default-values/default-roles.json');

module.exports = (sequelize, DataTypes, myValidators) => {
    const { isBoolean } = myValidators;

    const model = sequelize.define(
        'Roles', 
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
            description: {
                type: DataTypes.TEXT
            },
        }
    );


    model.validationFailed((instance, options, error) => {
        throw ApiError.BadRequest(error.message);
    });

    model.beforeBulkUpdate(async options => {
        const role = await model.findOne({where: options.where});
        if (!role) throw ApiError.DataNotFound('Role not found.')
    });


    // Create default roles 
    model.afterSync(async options => {
		try {
			for await (const role of defaultsRoles) {
				const [obj, created] = await model.findOrCreate({ where: { name: role.name }, defaults: role });
                if (created) {
                    log([
                        {FgGray: ` Default role `},
                        {FgCyan: `'${role.name}'`},
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