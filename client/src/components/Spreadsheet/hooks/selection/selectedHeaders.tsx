export const useSelectedHeaders = (spreadsheet: any, selectedCellsId: number[]) => {
    const getSelectedHeaders = () => {
        const selectedCells = selectedCellsId.map(id => spreadsheet!.sheet?.cells?.find((c: any) => c.id === id)!);
        const selectedRows = Array.from(new Set(selectedCells.map(c => c?.row)));
        const selectedCols = Array.from(new Set(selectedCells.map(c => c?.col)));

        return { selectedRows, selectedCols };
    };

    return getSelectedHeaders();
};