const roleService = require('../services/role-service');

const createNew = async (req, res, next) => {
    
    try {
        const role = req.body;
        const newRole = await roleService.createNew(role);
        return res.status(201).send(newRole);
    } catch (error) {
        next(error);
    };
};
const getAll = async (req, res, next) => {
    try {
        const roles = await roleService.getAll();
        return res.status(200).json(roles);
    } catch (error) {
        next(error);
    };
};
const getOne = async (req, res, next) => {
    try {
        const {role} = req.params;
        const oneRole = await roleService.getOne(role);
        return res.status(200).json(oneRole);
    } catch (error) {
        next(error);
    };
};
const updateOne = async (req, res, next) => {
    try {
        const {role} = req.params;
        const body = req.body;
        const updatedRole = await roleService.updateOne(role, body);
        return res.status(200).json(updatedRole);
    } catch (error) {
        next(error);
    };
};
const deleteOne = async (req, res, next) => {
    try {
        const {role} = req.params;
        await roleService.deleteOne(role);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};



const setMembershipUsergroup = async (req, res, next) => {
    try {
        const {role} = req.params;
        const {usergroup} = req.body;
        const membershipUsergroup = await roleService.setMembershipUsergroup(role, usergroup);
        return res.status(201).json(membershipUsergroup)
    } catch (error) {
        next(error);
    };
};


const getMembershipUsergroups = async (req, res, next) => {
    try {
        const {role} = req.params;
        const membershipUsergroups = await roleService.getMembershipUsergroups(role);
        return res.status(200).json(membershipUsergroups);
    } catch (error) {
        next(error);
    };
};

const removeMembershipUsergroup = async (req, res, next) => {
    try {
        const {role, usergroup} = req.params;
        await roleService.removeMembershipUsergroup(role, usergroup);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};


module.exports = {
    createNew, getAll, getOne, updateOne, deleteOne,
    setMembershipUsergroup, getMembershipUsergroups, removeMembershipUsergroup,
};
