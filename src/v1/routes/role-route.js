const {Router} = require('express');
const roleController = require('../controllers/role-controller');
const authMiddleware = require('../middlewares/auth-middleware');


const router = Router();


router.post('/', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'create_roles'})],
    roleController.createNew 
);
router.get('/',
    [authMiddleware.checkAccessAction.bind({accessActionName: 'read_roles'})],
    roleController.getAll 
);
router.get('/:role', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'read_roles'})],
    roleController.getOne 
);
router.patch('/:role', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'update_roles'})],
    roleController.updateOne
);
router.delete('/:role', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'delete_roles'})],
    roleController.deleteOne
);

router.post('/:role/usergroups', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'set_memberships_between_usergroups_and_roles'})],
    roleController.setMembershipUsergroup
);
router.get('/:role/usergroups', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'get_memberships_between_usergroups_and_roles'})],
    roleController.getMembershipUsergroups
);
router.delete('/:role/usergroups/:usergroup', 
    [authMiddleware.checkAccessAction.bind({accessActionName: 'remove_memberships_between_usergroups_and_roles'})],
    roleController.removeMembershipUsergroup
);


module.exports =  router;