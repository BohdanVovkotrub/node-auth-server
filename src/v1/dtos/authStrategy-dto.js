module.exports = class AuthStrategyDto {
    id;
    name;
    description;

    constructor(model) {
        model.id ? this.id = model.id : null;
        this.name = model.name;
        this.description = model.description;
    };
};