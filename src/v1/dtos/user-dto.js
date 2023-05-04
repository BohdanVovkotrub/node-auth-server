module.exports = class UserDto {
    id;
    login;
    password;
    first_name;
    last_name;
    email;
    phone1;
    phone2;
    phone3;
    avatar;
    createdAt;
    updatedAt;
    description;

    constructor(model) {
        model.id ? this.id = model.id: null;
        this.login = model.login;
        this.password = model.password;
        this.first_name = model.first_name;
        this.last_name = model.last_name;
        this.email = model.email;
        this.phone1 = model.phone1;
        this.phone2 = model.phone2;
        this.phone3 = model.phone3;
        this.avatar = model.avatar;
        model.createdAt ? this.createdAt = model.createdAt: null;
        model.updatedAt ? this.updatedAt = model.updatedAt: null;
        this.description = model.description;
    };

    get secure() {
        return {
            id: this.id,
            login: this.login,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone1: this.phone1,
            phone2: this.phone2,
            phone3: this.phone3,
            avatar: this.avatar,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            description: this.description,
        };
    };

    get secureSimple() {
        return {
            id: this.id,
            login: this.login,
            email: this.email,
        };
    };
};