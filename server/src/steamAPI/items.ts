import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import * as fs from 'fs';

const logToFile = (message: string) => {
    fs.appendFileSync('api_response.log', message + '\n');
};

const getAllItems = async (): Promise<void> => {
    try {
        const startTime: number = new Date().getTime();

        const route = `https://www.steamwebapi.com/steam/api/items?key=${process.env.STEAMWEB_API}`;

        const response = await fetch(route);

        const endTime: number = new Date().getTime();
        const totalTime: number = endTime - startTime;

        const data = await response.json();
        
        const responseString = JSON.stringify(data, null, 2);

        console.log('Response data:', responseString);
        logToFile(responseString);
        console.log(`API call took ${totalTime} ms to process.`);
    } catch (error) {
        console.error('Error fetching the items:', error);
    }
};

getAllItems();