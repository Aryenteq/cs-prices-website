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
                                const quantityCell = row.cells.find(c => c.col === QUANTITY_INDEX);
                                let quantity = quantityCell ? parseFloat(quantityCell.content || '1') : 1;
                                if (isNaN(quantity)) {
                                    quantity = 1; // Default to 1 if invalid
                                }

                                const priceLatestNumber = priceLatest.toNumber();
                                const colLatestPrice = parseFloat(priceLatestNumber.toFixed(2));
                                const colSumLatestPrice = parseFloat((priceLatestNumber * quantity).toFixed(2));

                                const priceRealNumber = priceReal.toNumber();
                                const colRealPrice = parseFloat(priceRealNumber.toFixed(2));
                                const colSumRealPrice = parseFloat((priceRealNumber * quantity).toFixed(2));

                                const buyOrderPriceNumber = buyOrderPrice.toNumber();
                                const colBuyOrderPrice = parseFloat(buyOrderPriceNumber.toFixed(2));

                                // Get cell IDs for the specific row and columns to update
                                const latestPriceCell = row.cells.find(c => c.col === LATEST_PRICE_INDEX && c.row === cell.row);
                                console.log(latestPriceCell);
                                const sumLatestPriceCell = row.cells.find(c => c.col === SUM_LATEST_PRICE_INDEX && c.row === cell.row);
                                const realPriceCell = row.cells.find(c => c.col === REAL_PRICE_INDEX && c.row === cell.row);
                                const sumRealPriceCell = row.cells.find(c => c.col === SUM_REAL_PRICE_INDEX && c.row === cell.row);
                                const buyOrderPriceCell = row.cells.find(c => c.col === BUY_ORDER_PRICE_INDEX && c.row === cell.row);

                                if (latestPriceCell) {
                                    await db.cell.update({
                                        where: { id: latestPriceCell.id },
                                        data: { content: colLatestPrice.toString() }
                                    });
                                }

                                if (sumLatestPriceCell) {
                                    await db.cell.update({
                                        where: { id: sumLatestPriceCell.id },
                                        data: { content: colSumLatestPrice.toString() }
                                    });
                                }

                                if (realPriceCell) {
                                    await db.cell.update({
                                        where: { id: realPriceCell.id },
                                        data: { content: colRealPrice.toString() }
                                    });
                                }

                                if (sumRealPriceCell) {
                                    await db.cell.update({
                                        where: { id: sumRealPriceCell.id },
                                        data: { content: colSumRealPrice.toString() }
                                    });
                                }

                                if (buyOrderPriceCell) {
                                    await db.cell.update({
                                        where: { id: buyOrderPriceCell.id },
                                        data: { content: colBuyOrderPrice.toString() }
                                    });
                                }
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