import * as authController from '../controllers/authController';
import * as jwtAuth from '../middleware/jwtAuth'
import express from 'express';
import cors from 'cors';
import { body } from 'express-validator/check';

const router = express.Router();
router.use(cors());


router.post('/register',  
                        body('email').isEmail()
                        .withMessage('Please enter a valid email address!')
                        .normalizeEmail()
                        ,
                        body('password', 'Please Enter a valid Password!').isLength({ min: 5 })
                        .trim()
                        , authController.Signup);

router.post('/login',
                    body('email').isEmail()
                    .withMessage('Please enter a valid email address!')
                    .normalizeEmail()
                    ,
                    body('password', 'Please Enter a valid Password!').isLength({ min: 5 })
                    .trim(), authController.Login);
   
router.post('/logout', jwtAuth.jwtAuth, authController.Logout);

export default router;