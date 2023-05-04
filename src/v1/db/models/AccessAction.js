const path = require('path');
const {log} = require(path.join(process.env.INIT_CWD, 'src/utils/logger'));
const ApiError = require('../../exceptions/api-error');
const defaultAccessActions = require('../default-values/default-accessActions.json');


module.exports = (sequelize, DataTypes, myValidators) => {
    const model = sequelize.define(
        'AccessActions', 
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
                    is: /^[(a-z)][(a-z)(0-9)(\.)(_)]*$/gi , // это для имен. В будущем стоит разрешить любые символы для названий групп как в ActiveDirectory
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
        const accessAction = await model.findOne({where: options.where});
        if (!accessAction) throw ApiError.DataNotFound('AccessAction not found.')
    });


    // Create default roles 
    model.afterSync(async options => {
		try {
			for await (const accessAction of defaultAccessActions) {
				const [obj, created] = await model.findOrCreate({ where: { name: accessAction.name }, defaults: accessAction });
                if (created) {
                    log([
                        {FgGray: ` Default accessAction `},
                        {FgCyan: `'${accessAction.name}'`},
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