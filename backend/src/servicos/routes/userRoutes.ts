import { Router } from 'express';
import { getUsers, createUser } from "../controllers/useController";

const router: Router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);

export default router;
