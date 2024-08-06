import { Router } from 'express';
import * as authController from '../controllers/authController';

const authRoutes = Router();

authRoutes.post('/signup', authController.signUp);
authRoutes.post('/login', authController.logIn);

export default authRoutes;
