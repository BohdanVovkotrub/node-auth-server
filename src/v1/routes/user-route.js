const {Router} = require('express');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');

const router = Router();


router.post('/', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'create_users'})], 
    userController.createNew 
);

router.get(
    '/', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'read_users'})],
    userController.getAll 
);

router.get('/:user',
    [authMiddleware.checkAccessAction.bind({accessActionName: 'read_users'})],
    userController.getOne 
);

router.patch('/:user', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'update_users'})],
    userController.updateOne
);

router.delete('/:user', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'delete_users'})],
    userController.deleteOne
);



router.post('/:user/usergroups', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'set_memberships_between_users_and_usergroups'})],
    userController.setMembershipUsergroup
);

router.get('/:user/usergroups',
    [authMiddleware.checkAccessAction.bind({accessActionName: 'get_memberships_between_users_and_usergroups'})],
    userController.getMembershipUsergroups
);

router.delete('/:user/usergroups/:usergroup',
    [authMiddleware.checkAccessAction.bind({accessActionName: 'remove_memberships_between_users_and_usergroups'})],
    userController.removeMembershipUsergroup
);




router.post('/:user/auth-strategies', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'set_memberships_between_users_and_auth_strategies'})],
    userController.setMembershipAuthStrategy
);

router.get('/:user/auth-strategies',
    [authMiddleware.checkAccessAction.bind({accessActionName: 'get_memberships_between_users_and_auth_strategies'})],
    userController.getMembershipAuthStrategies
);

router.delete('/:user/auth-strategies/:strategy',
    [authMiddleware.checkAccessAction.bind({accessActionName: 'remove_memberships_between_users_and_auth_strategies'})],
    userController.removeMembershipAuthStrategy
);



module.exports =  router;