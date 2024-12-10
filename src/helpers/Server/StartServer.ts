// import { Application } from 'express';
// import { createServer } from 'http';
// import consola from 'consola';
// import config from '../../config';

// export const startServer = async (app: Application) => {
//     const server = createServer(app);
//     const PORT = config.PORT || 8000;
//     server.listen(PORT, () => {
//         consola.success(`Server is running on ${config.BACKEND_URL} and PORT ${PORT}`);
//     }).on('error', (error) => {
//         consola.error("Failed to start the server", error);
//     });
// };


import { Application } from 'express';
import { createServer, Server } from 'http';
import consola from 'consola';
import config from '../../config';

export const startServer = async (app: Application) => {
    let PORT = config.PORT || 8000;
    let server: Server | null = null;

    const startListening = (port: number) => {
        if (server) {
            server.close(); // Ensure the previous server is properly closed
        }

        server = createServer(app);

        server.listen(port, () => {
            consola.success(`Server is running on ${config.BACKEND_URL || 'http://localhost'} and PORT ${port}`);
        }).on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                consola.warn(`Port ${port} is already in use. Trying next port...`);
                startListening(port + 1); // Increment port and retry
            } else {
                consola.error("Failed to start the server", error);
            }
        });
    };

    startListening(PORT);
};
