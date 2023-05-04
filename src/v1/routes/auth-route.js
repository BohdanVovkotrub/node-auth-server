const {Router} = require('express');
const authController = require('../controllers/auth-controller');


const router = Router();


router.post('/login', authController.login );
router.post('/verify-code', authController.verifyCode );
router.post('/logout', authController.logout );
router.post('/refresh', authController.refresh );


module.exports = router;