export const useBorderClasses = (spreadsheet: any, selectedCellsId: number[]) => {
    const getBorderClasses = (id: number, rowIndex: number, colIndex: number) => {
        const isSelected = selectedCellsId.includes(id);

        if (!isSelected) {
            return '';
        }

        const selectedCells = selectedCellsId.map(id => spreadsheet.sheet?.cells?.find((c: any) => c.id === id)!);
        const rows = selectedCells.map(c => c.row);
        const cols = selectedCells.map(c => c.col);

        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);

        let borderClasses = '';

        if (rowIndex === minRow) {
            borderClasses += ' border-t-3';
        }
        if (rowIndex === maxRow) {
            borderClasses += ' border-b-3';
        }
        if (colIndex === minCol) {
            borderClasses += ' border-l-3';
        }
        if (colIndex === maxCol) {
            borderClasses += ' border-r-3';
        }

        return borderClasses;
    };

    return { getBorderClasses };
};