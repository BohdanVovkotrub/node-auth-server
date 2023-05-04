
const usergroupService = require('../services/usergroup-service');

const createNew = async (req, res, next) => {
    try {
        const usergroup = req.body;
        const newUsergroup = await usergroupService.createNew(usergroup);
        return res.status(201).send(newUsergroup);
    } catch (error) {
        next(error);
    };
};
const getAll = async (req, res, next) => {
    try {
        const usergroups = await usergroupService.getAll();
        return res.status(200).json(usergroups);
    } catch (error) {
        next(error);
    };
};
const getOne = async (req, res, next) => {
    try {
        const {usergroup} = req.params;
        const oneUsergroup = await usergroupService.getOne(usergroup);
        return res.status(200).json(oneUsergroup);
    } catch (error) {
        next(error);
    };
};
const updateOne = async (req, res, next) => {
    try {
        const {usergroup} = req.params;
        const body = req.body;
        const updatedUsergroup = await usergroupService.updateOne(usergroup, body);
        return res.status(200).json(updatedUsergroup);
    } catch (error) {
        next(error);
    };
};
const deleteOne = async (req, res, next) => {
    try {
        const {usergroup} = req.params;
        await usergroupService.deleteOne(usergroup);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};



const setMembershipUser = async (req, res, next) => {
    try {
        const {usergroup} = req.params;
        const {user} = req.body;
        const membershipUser = await usergroupService.setMembershipUser(usergroup, user);
        return res.status(201).json(membershipUser)
    } catch (error) {
        next(error);
    };
};


const getMembershipUsers = async (req, res, next) => {
    try {
        const {usergroup} = req.params;
        const membershipUsers = await usergroupService.getMembershipUsers(usergroup);
        return res.status(200).json(membershipUsers);
    } catch (error) {
        next(error);
    };
};

const removeMembershipUser = async (req, res, next) => {
    try {
        const {usergroup, user} = req.params;
        await usergroupService.removeMembershipUser(usergroup, user);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};


const setMembershipRole = async (req, res, next) => {
    try {
        const {usergroup} = req.params;
        const {role} = req.body;
        const membershipRole = await usergroupService.setMembershipRole(usergroup, role);
        return res.status(201).json(membershipRole)
    } catch (error) {
        next(error);
    };
};


const getMembershipRoles = async (req, res, next) => {
    
    try {
        const {usergroup} = req.params;
        const membershipRoles = await usergroupService.getMembershipRoles(usergroup);
        return res.status(200).json(membershipRoles);
    } catch (error) {
        next(error);
    };
};

const removeMembershipRole = async (req, res, next) => {
    try {
        const {usergroup, role} = req.params;
        await usergroupService.removeMembershipRole(usergroup, role);
        return res.status(204).end();
    } catch (error) {
        next(error);
    };
};



module.exports = {
    createNew, getAll, getOne, updateOne, deleteOne,
    setMembershipUser, getMembershipUsers, removeMembershipUser,
    setMembershipRole, getMembershipRoles, removeMembershipRole,
};
