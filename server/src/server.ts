import express from 'express';
import dotenv from 'dotenv';
import http from 'node:http';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import spreadsheetRoutes from './routes/spreadsheetRoutes';
import sheetRoutes from './routes/sheetRoutes';
import cellRoutes from './routes/cellRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config({ path: '../.env' });

const app = express();


app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: "Content-Type,Authorization"
}))
    .use(express.json())
    .use(authRoutes)
    .use(spreadsheetRoutes)
    .use(sheetRoutes)
    .use(cellRoutes)
    .use(userRoutes);



const ip = process.env.SERVER_IP || '127.0.0.1';
const port = Number(process.env.SERVER_PORT) || 3000;
const server = http.createServer(app);

server.listen(port, ip, () => {
    console.log(`Server is listening at http://${ip}:${port}`);
});
