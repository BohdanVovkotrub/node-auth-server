const userService = require('../services/user-service');

const createNew = async (req, res, next) => {
    
    try {
        const user = req.body;
        const newUser = await userService.createNew(user);
        return res.status(201).send(newUser);
    } catch (error) {
        next(error);
    };
};
const getAll = async (req, res, next) => {
    try {
        const users = await userService.getAll();
        return res.status(200).json(users);
    } catch (error) {
        next(error);
    };
};
const getOne = async (req, res, next) => {
    try {
        const {user} = req.params;
        const oneUser = await userService.getOne(user);
        return res.status(200).json(oneUser);
    } catch (error) {
        next(error);
    };
};
const updateOne = async (req, res, next) => {
    try {
        const {user} = req.params;
        const body = req.body;
        const updatedUser = await userService.updateOne(user, body);
        return res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    };
};
const deleteOne = async (req, res, next) => {
    try {
        const {user} = req.params;
        await userService.deleteOne(user);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};



const setMembershipUsergroup = async (req, res, next) => {
    try {
        const {user} = req.params;
        const {usergroup} = req.body;
        const membershipUsergroup = await userService.setMembershipUsergroup(user, usergroup);
        return res.status(201).json(membershipUsergroup)
    } catch (error) {
        next(error);
    };
};


const getMembershipUsergroups = async (req, res, next) => {
    try {
        const {user} = req.params;
        const membershipUsergroups = await userService.getMembershipUsergroups(user);
        return res.status(200).json(membershipUsergroups);
    } catch (error) {
        next(error);
    };
};

const removeMembershipUsergroup = async (req, res, next) => {
    try {
        const {user, usergroup} = req.params;
        await userService.removeMembershipUsergroup(user, usergroup);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};



const setMembershipAuthStrategy = async (req, res, next) => {
    try {
        const {user} = req.params;
        const {strategy} = req.body;
        const membershipUsergroup = await userService.setMembershipAuthStrategy(user, strategy);
        return res.status(201).json(membershipUsergroup)
    } catch (error) {
        next(error);
    };
};


const getMembershipAuthStrategies = async (req, res, next) => {
    try {
        const {user} = req.params;
        const membershipUsergroups = await userService.getMembershipAuthStrategies(user);
        return res.status(200).json(membershipUsergroups);
    } catch (error) {
        next(error);
    };
};

const removeMembershipAuthStrategy = async (req, res, next) => {
    try {
        const {user, strategy} = req.params;
        await userService.removeMembershipAuthStrategy(user, strategy);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};



module.exports = {
    createNew, getAll, getOne, updateOne, deleteOne,
    setMembershipUsergroup, getMembershipUsergroups, removeMembershipUsergroup,
    setMembershipAuthStrategy, getMembershipAuthStrategies, removeMembershipAuthStrategy,
};
