module.exports = (sequelize, DataTypes, myValidators) => {
    const model = sequelize.define(
        'JwtTokens',
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
            refreshToken: {
                type: DataTypes.TEXT,
                allowNull: true,
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