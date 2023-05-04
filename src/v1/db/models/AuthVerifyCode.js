module.exports = (sequelize, DataTypes, myValidators) => {
    const model = sequelize.define(
        'AuthVerifyCode',
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
            code: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    isNumeric: true,
                    isInt: true,
                },
            },
            expiredAt: {
                type: DataTypes.INTEGER,
                defaultValue: Math.floor(new Date().getTime()/1000) + (parseInt(process.env.AUTH_VERIFY_CODE_LIFETIME) || 60),
                allowNull: false,
                validate: {
                    isNumeric: true,
                    isInt: true,
                },
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                validate: {
                    isUUID: {
                        args: 4,
                        msg: 'userId must be only a uuid4.'
                    },
                },
            },
        }
    );

    return model;
};