import { db } from '../db';

const LINK_INDEX: number = 0;
const QUANTITY_INDEX: number = 3;
const LATEST_PRICE_INDEX: number = 4;
const SUM_LATEST_PRICE_INDEX: number = 5;
const REAL_PRICE_INDEX: number = 6;
const SUM_REAL_PRICE_INDEX: number = 7;
const BUY_ORDER_PRICE_INDEX: number = 8;

export const updateUserItems = async (): Promise<void> => {
    try {
        const steamPrices = await db.steamPrices.findMany();

        // all CS spreadsheets
        const spreadsheets = await db.spreadsheet.findMany({
            where: { type: 'CS' },
            include: {
                sheets: {
                    include: {
                        cells: true,
                    },
                },
            },
        });

        for (const steamPrice of steamPrices) {
            const { name, priceLatest, priceReal, buyOrderPrice } = steamPrice;

            for (const sheet of spreadsheets) {
                for (const row of sheet.sheets) {
                    for (const cell of row.cells) {
                        // (col 0) === steamPrice name
                        if (cell.col === LINK_INDEX && cell.content) {
                            const decodedUrl = decodeURIComponent(cell.content);
                            const lastPart = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);

                            if (lastPart === name) {
                                // Retrieve quantity from col 1
                                const quantityCell = row.cells.find(c => c.col === QUANTITY_INDEX);
                                let quantity = quantityCell ? parseFloat(quantityCell.content || '1') : 1;
                                if (isNaN(quantity)) {
                                    quantity = 1; // Default to 1 if invalid
                                }

                                const priceLatestNumber = priceLatest.toNumber();
                                const colLatestPrice = priceLatestNumber;
                                const colSumLatestPrice = priceLatestNumber * quantity;
                                const priceRealNumber = priceReal.toNumber();
                                const colRealPrice = priceRealNumber;
                                const colSumRealPrice = priceRealNumber * quantity;
                                const buyOrderPriceNumber = buyOrderPrice.toNumber();
                                const colBuyOrderPrice = buyOrderPriceNumber;

                                // Update cells
                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: LATEST_PRICE_INDEX },
                                    data: { content: colLatestPrice.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: SUM_LATEST_PRICE_INDEX },
                                    data: { content: colSumLatestPrice.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: REAL_PRICE_INDEX },
                                    data: { content: colRealPrice.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: SUM_REAL_PRICE_INDEX },
                                    data: { content: colSumRealPrice.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: BUY_ORDER_PRICE_INDEX },
                                    data: { content: colBuyOrderPrice.toString() }
                                });
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error updating user items:', error);
    }
};