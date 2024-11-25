import { Application } from 'express';
import { createServer } from 'http';
import consola from 'consola';
import config from '../../config';

export const startServer = async (app: Application) => {
    const server = createServer(app);
    const PORT = config.PORT || 8000;
    server.listen(PORT, () => {
        consola.success(`Server is running on ${config.BACKEND_URL} and PORT ${PORT}`);
    });
};
