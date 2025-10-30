// backend/src/routes/authRoutes.js

import express from 'express'; 
import { 
    register, 
    login, 
    getCurrentUser 
} from '../controllers/authController.js'; 


import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/user', protect, getCurrentUser);


export default router;