import express from 'express';
import clinicRoutes from './clinicRoutes.js';
const router = express.Router();

router.use('/clinic', clinicRoutes);

export default router;
