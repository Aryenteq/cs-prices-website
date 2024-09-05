import { db } from '../db';
import { updateUserItems } from './updateUserItems';

const getAllItems = async (): Promise<any[]> => {
    try {
        const response = await fetch(`https://www.steamwebapi.com/steam/api/items?key=${process.env.STEAMWEB_API}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching the items:', error);
        return [];
    }
};

const saveItems = async (items: any[]): Promise<void> => {
    for (const item of items) {
        try {
            await db.steamPrices.upsert({
                where: { name: item.marketname },
                update: {
                    priceLatest: item.pricelatest || 0,
                    priceReal: item.pricereal || 0,
                    buyOrderPrice: item.buyorderprice || 0
                },
                create: {
                    name: item.marketname,
                    priceLatest: item.pricelatest || 0,
                    priceReal: item.pricereal || 0,
                    buyOrderPrice: item.buyorderprice || 0
                }
            });
        } catch (error) {
            console.error(`Error saving/updating item ${item.marketname}:`, error);
        }
    }
};

export const refreshItems = async () => {
    const items = await getAllItems();
    await saveItems(items);
    await updateUserItems();
}