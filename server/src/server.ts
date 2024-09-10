import express from 'express';
import dotenv from 'dotenv';
import http from 'node:http';
import cors from 'cors';
import bodyParser from 'body-parser';

import authRoutes from './routes/authRoutes';
import spreadsheetRoutes from './routes/spreadsheetRoutes';
import sheetRoutes from './routes/sheetRoutes';
import cellRoutes from './routes/cellRoutes';
import userRoutes from './routes/userRoutes';

import { refreshItems } from './steamAPI/fetch';

dotenv.config({ path: '../.env' });

const app = express();


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
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


// CS2 items actualization
//refreshItems();
setInterval(refreshItems, 12 * 60 * 60 * 1000);


const ip = process.env.SERVER_IP || '127.0.0.1';
const port = Number(process.env.SERVER_PORT) || 3000;
const server = http.createServer(app);

server.listen(port, ip, () => {
    console.log("AA");
    console.log(`Server is listening at http://${ip}:${port}`);
});
