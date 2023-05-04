module.exports = class UsergroupDto {
    id;
    name;
    email;
    createdAt;
    updatedAt;
    description;

    constructor(model) {
        model.id ? this.id = model.id: null;
        this.name = model.name;
        this.email = model.email;
        model.createdAt ? this.createdAt = model.createdAt: null;
        model.updatedAt ? this.updatedAt = model.updatedAt: null;
        this.description = model.description;
    };

    get simple() {
        return {
            id: this.id,
            name: this.name,
        };
    };
};