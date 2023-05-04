module.exports = class AuthDto {
    login;
    password;
    email;
    strategy;

    constructor(model) {
        this.login = model.login;
        this.password = model.password;
        this.email = model.email;
        this.strategy = model.strategy;
    };
};