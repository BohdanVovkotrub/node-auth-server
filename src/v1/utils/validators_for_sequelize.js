const { Validator } = require('sequelize');

const isBoolean = (value) => {
    return typeof value == "boolean";
};

const isEmailOrEmpty = (value, next) => {
    if (!value) next();
    if (value !== "" && !Validator.isEmail(value)) {
        throw new Error("Validation error: Email is invalid.");
    }
    next();
};

const isUUIDOrEmpty = (value, next) => {
    if (!value) next();
    if (value !== "" && !Validator.isUUID(value)) {
        throw new Error("Validation error: UUID is invalid.");
    }
    next();
};


module.exports = {
    isBoolean,
    isEmailOrEmpty,
    isUUIDOrEmpty,
};
