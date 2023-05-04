const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const ApiError = require('../../exceptions/api-error');
const defaultsAuthStrategies = require('../default-values/default-authStrategies.json');

module.exports = (sequelize, DataTypes, myValidators) => {
    const model = sequelize.define(
        'AuthStrategies', 
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
                    is: /^[(a-z)][(a-z)(0-9)(\.)(_)(\-)]*$/gi , // это для имен. В будущем стоит разрешить любые символы для названий групп как в ActiveDirectory
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
        const strategy = await model.findOne({where: options.where});
        if (!strategy) throw ApiError.DataNotFound('AuthStrategy not found.')
    });


    // Create default roles 
    model.afterSync(async options => {
		try {
			for await (const strategy of defaultsAuthStrategies) {
				const [obj, created] = await model.findOrCreate({ where: { name: strategy.name }, defaults: strategy });
                if (created) {
                    log([
                        {FgGray: ` Default AuthStrategy `},
                        {FgCyan: `'${strategy.name}'`},
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