import { Router } from 'express';
import { addOrigin, deleteOrigin, getOrigins } from '../../controllers/Origins';

const app = Router();

app.post("/", addOrigin);
app.get("/", getOrigins);
app.delete("/:id", deleteOrigin);

export default app;