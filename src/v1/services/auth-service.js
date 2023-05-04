const {Op} = require('sequelize');
const ApiError = require('../exceptions/api-error');
const AuthDto = require('../dtos/auth-dto');
const UserDto = require('../dtos/user-dto');
const {User, AuthVerifyCode, AuthStrategies_Users, AuthStrategy} = require('../db/sequelize').models;
const passwordUtil = require('../utils/password-util');
const MailService = require('./mail-service');
const jwtTokenService = require('./jwtToken-service');
const userService = require('./user-service');
const usergroupService = require('./usergroup-service');
const roleService = require('./role-service');
const ldapService = require('./ldap-service');



const getAccessActions = async (user) => { 
    try {
        const usergroups = await userService.getMembershipUsergroups(user);
        const roleIds = [];
        for await (const usergroup of usergroups) {
            const usergroupRoles = await usergroupService.getMembershipRoles(usergroup.usergroupId);
            usergroupRoles.forEach(role => {
                if (!roleIds.includes(role.roleId)) roleIds.push(role.roleId);
            });
        };

        const accessActions = [];
        
        for await (const roleId of roleIds) {
            const roleAccessActions = await roleService.getMembershipAccessActions(roleId);
            roleAccessActions.forEach(action => {
                const name = action.AccessAction.name;
                if (!accessActions.includes(name)) accessActions.push(name);
            });
        };
        
        return accessActions;
    } catch (error) {
        throw error;
    };
};


const success = async (user) => {
    const message = 'Authenticated';
    const secureUserDto = new UserDto(user).secure;
    const secureSimpleUserDto = new UserDto(user).secureSimple;
    const {id, login, email} = secureUserDto;
    const accessActions = await getAccessActions(id);
    const payloadAccess = {...secureUserDto, accessActions};
    const payloadRefresh = {...secureSimpleUserDto}; 
    const jwtTokens = jwtTokenService.generateTokens(payloadAccess, payloadRefresh);
    await jwtTokenService.saveToken(id, jwtTokens.refreshToken);
    return {
        isAuthenticated: true,
        message,
        userData: {
            id, 
            login, 
            email,
            accessActions,
        },
        tokenData: {...jwtTokens}
    };
};

const removeVerifyCode = async where => {
    return await AuthVerifyCode.destroy({where});
};


const strategy_password = async (authDto, user) => {
    if (authDto.password === null || authDto.password === undefined) throw ApiError.BadRequest('Password is required.');
    if (!user.password) throw ApiError.Forbidden('Try other strategy.');
    const isPassEquals = await passwordUtil.compare(authDto.password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest('Wrong password');
    return await success(user);
};
const strategy_emailVerificationCode = async (user) => {
    if (!user.email) throw ApiError.BadRequest('Email is not exists');
    const code = parseInt(Math.random() * (1000 - 9999) + 9999);
    await removeVerifyCode({userId: user.id});
    const saveCode = await AuthVerifyCode.create({code, userId: user.id});
    if (!saveCode) throw ApiError.InternalServerError('Cannot write verification code in DB');
    await MailService.sendAuthVerificationCode(user.email, code);
    return {isAuthenticated: false, message: `Verification Code was sent to your mail <${user.email}>.`};
};

const strategy_LDAP = async (authDto, user) => {
    if (!authDto.password) throw ApiError.BadRequest('Password required.');
    try {
        const auth = await ldapService.authenticateUser(user.login, authDto.password);
        if (!auth) throw ApiError.BadRequest('Authentication failed.');
        return await success(user);
    } catch (error) {
        throw ApiError.BadRequest(error.message);
    };
};

const strategy_noPassword = async (user) => {
    return await success(user);
};

const verifyCode = async verifyData => {
    const {code, login, email} = verifyData ;
    if (!code) throw ApiError.BadRequest('The secret code is required.');
    if (!login && !email) throw ApiError.BadRequest('Login or Email required.');
    const where = login ? {login} : {email};
    const user = await User.findOne({where});
    const dbCode = await AuthVerifyCode.findOne({where: {userId: user.id}});
    if (!dbCode) throw ApiError.BadRequest('Verification code is not found.');
    if (dbCode.code != code) throw ApiError.BadRequest('Wrong code.');
    const now = Math.floor(new Date().getTime()/1000);
    await removeVerifyCode({id: dbCode.id});
    if (now > dbCode.expiredAt) {
        throw ApiError.Gone('Code expired.');
    };
    return await success(user);
};

const refresh = async (refreshToken) => {
    if (!refreshToken) throw ApiError.UnathorizedError();
    const decodedRefreshToken = jwtTokenService.validateRefreshToken(refreshToken);
    if (!decodedRefreshToken) throw ApiError.UnathorizedError();
    const tokenFromDb = await jwtTokenService.findToken(refreshToken);
    if (!tokenFromDb) throw ApiError.UnathorizedError();
    const now = Math.floor(new Date().getTime()/1000);
    if (now > decodedRefreshToken.exp) {
        await jwtTokenService.removeToken(refreshToken);
        throw ApiError.UnathorizedError();
    };
    if (tokenFromDb.userId !== decodedRefreshToken.id) throw ApiError.UnathorizedError();
    const user = await User.findByPk(decodedRefreshToken.id);
    return await success(user.toJSON());
};

const logout = async (refreshToken) => {
    if (!refreshToken) throw ApiError.UnathorizedError();
    return await jwtTokenService.removeToken(refreshToken);
};

const checkStrategyAllowed = async (strategy, userId) => {
    const allowedStrategies = await AuthStrategies_Users.findAll({
        where: {userId}, 
        include: { model: AuthStrategy, attributes: ['name'] }
    });
    
    return allowedStrategies.map(item => item.toJSON().AuthStrategy.name).includes(strategy);
};


const authentication = async (authData) => {
    try {
        const authDto = new AuthDto(authData);
        if (!authDto.login && !authDto.email) throw ApiError.BadRequest('Login or Email is required.');

        const where = authDto.login ? {login: {[Op.iLike]: authDto.login}} : {email: {[Op.iLike]: authDto.email}};
        const user = (await User.findOne({where})).toJSON();
        if (!user) throw ApiError.BadRequest('User not found.');
        if (!user.enabled) throw ApiError.Forbidden();
        const allowed = await checkStrategyAllowed(authDto.strategy, user.id);
        if (!allowed) throw ApiError.Forbidden('Authentication strategy is not allowed for you.');

        switch (authDto.strategy) {
            case 'password':
                return strategy_password(authDto, user);
            case 'no-password':
                return strategy_noPassword(user);
            case 'email-verification-code':
                return strategy_emailVerificationCode(user);
            case 'ldap':
                return strategy_LDAP(authDto, user);
            default:
                throw ApiError.BadRequest('Wrong authentication strategy.');
        };
    } catch (error) {
        throw error;
    };
};


module.exports = {
    authentication, verifyCode, logout, refresh,
};