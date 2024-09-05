import { db } from '../db';

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
                        if (cell.col === 0 && cell.content) {
                            const decodedUrl = decodeURIComponent(cell.content);
                            const lastPart = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);

                            if (lastPart === name) {
                                // Retrieve quantity from col 1
                                const quantityCell = row.cells.find(c => c.col === 1);
                                let quantity = quantityCell ? parseFloat(quantityCell.content || '1') : 1;
                                if (isNaN(quantity)) {
                                    quantity = 1; // Default to 1 if invalid
                                }

                                const priceLatestNumber = priceLatest.toNumber();
                                const col2 = priceLatestNumber;
                                const col3 = priceLatestNumber * quantity;
                                const priceRealNumber = priceReal.toNumber();
                                const col4 = priceRealNumber;
                                const col5 = priceRealNumber * quantity;
                                const buyOrderPriceNumber = buyOrderPrice.toNumber();
                                const col6 = buyOrderPriceNumber;

                                // Update cells
                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: 2 },
                                    data: { content: col2.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: 3 },
                                    data: { content: col3.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: 4 },
                                    data: { content: col4.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: 5 },
                                    data: { content: col5.toString() }
                                });

                                await db.cell.updateMany({
                                    where: { sheetId: row.id, col: 6 },
                                    data: { content: col6.toString() }
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