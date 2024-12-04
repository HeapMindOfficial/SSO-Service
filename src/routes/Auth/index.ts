import { Router } from 'express';
import { register, registerClient } from '../../controllers/Auth';
import { validate } from '../../middlewares/validator';
import { userRegistrationSchema } from '../../validators/Auth';

const app = Router();

app.post("/register", validate(userRegistrationSchema), register);
app.post("/client/register", registerClient);

export default app;