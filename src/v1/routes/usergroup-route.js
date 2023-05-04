const {Router} = require('express');
const usergroupConntroller = require('../controllers/usergroup-controller');
const authMiddleware = require('../middlewares/auth-middleware');


const router = Router();


router.post('/', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'create_usergroups'})], 
    usergroupConntroller.createNew
);
router.get('/', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'read_usergroups'})], 
    usergroupConntroller.getAll
);
router.get('/:usergroup', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'read_usergroups'})], 
    usergroupConntroller.getOne
);
router.patch('/:usergroup', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'update_usergroups'})], 
    usergroupConntroller.updateOne
);
router.delete('/:usergroup', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'delete_usergroups'})], 
    usergroupConntroller.deleteOne
);

router.post('/:usergroup/users', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'set_memberships_between_users_and_usergroups'})], 
    usergroupConntroller.setMembershipUser
);
router.get('/:usergroup/users', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'get_memberships_between_users_and_usergroups'})], 
    usergroupConntroller.getMembershipUsers
);
router.delete('/:usergroup/users/:user', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'remove_memberships_between_users_and_usergroups'})], 
    usergroupConntroller.removeMembershipUser
);

router.post('/:usergroup/roles', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'set_memberships_between_usergroups_and_roles'})], 
    usergroupConntroller.setMembershipRole
);
router.get('/:usergroup/roles', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'get_memberships_between_usergroups_and_roles'})], 
    usergroupConntroller.getMembershipRoles
);
router.delete('/:usergroup/roles/:role', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'remove_memberships_between_usergroups_and_roles'})], 
    usergroupConntroller.removeMembershipRole
);


module.exports =  router;