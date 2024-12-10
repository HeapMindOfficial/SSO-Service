import { Router } from 'express';
import { generateAuthorizationCode, generateToken, login, register, registerClient, validateClient } from '../../controllers/Auth';
import { validate } from '../../middlewares/validator';
import { oauth2ClientRegistrationSchema, userLoginSchema, userRegistrationSchema, validateAccessTokenGeneratorSchema, validateoauth2ClientSchema } from '../../validators/Auth';
import { verifyOAuthClient } from '../../middlewares/oAuthMiddleware';

const app = Router();

app.post("/register", validate(userRegistrationSchema), verifyOAuthClient, register);
app.post("/login", validate(userLoginSchema), verifyOAuthClient, login);
app.post("/authorization/:sessionId", validate(validateoauth2ClientSchema), verifyOAuthClient, generateAuthorizationCode);
app.post("/token", validate(validateAccessTokenGeneratorSchema), verifyOAuthClient, generateToken);


app.post("/client/register", validate(oauth2ClientRegistrationSchema), registerClient);
app.post("/client/validate", validate(validateoauth2ClientSchema), verifyOAuthClient, validateClient);

export default app;