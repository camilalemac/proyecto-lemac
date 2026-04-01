import { Router } from 'express';
import * as authController from './auth.controller';
import { validateLogin, validateRegister, validateRefresh } from './auth.validation';
import { runValidation } from '../../middlewares/validation.middleware';
import { checkJwt } from '../../middlewares/checkJwt.middleware';

const router = Router();

router.post('/login', validateLogin, runValidation, authController.login);
router.post('/register', validateRegister, runValidation, authController.register);
router.post('/refresh', validateRefresh, runValidation, authController.refresh);
router.post('/logout', checkJwt, authController.logout);
router.get('/me', checkJwt, authController.me);

export default router;
