import { useState } from 'react';
import { CS_PROTECTED_COLUMNS_LENGTH } from '../../SpreadsheetTable';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';

export const useContextMenuHandler = (
    hiddenCols: boolean[],
    hiddenRows: boolean[],
    spreadsheet: Spreadsheet | undefined,
    setInfo: Function,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>,
    updateHiddenColsMutation: Function,
    updateHiddenRowsMutation: Function,
    addColsMutation: Function,
    addRowsMutation: Function,
    deleteColsMutation: Function,
    deleteRowsMutation: Function,
    openDialog: (type: 'row' | 'col', index: number) => void,
) => {
    const spreadsheetType = spreadsheet!.type;
    const numRows = spreadsheet!.sheet.numRows;
    const numCols = spreadsheet!.sheet.numCols;

    const [resizeType, setResizeType] = useState<'row' | 'col' | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        options: string[];
        target: { row?: number; col?: number };
    } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, target: { row?: number; col?: number }) => {
        e.preventDefault();
        const options = [];

        if (target.col !== undefined) {
            if (spreadsheetType === 'CS' && target.col < CS_PROTECTED_COLUMNS_LENGTH - 1) {
                options.push('Hide column', 'Resize column');
            } else {
                if (spreadsheetType === 'CS' && target.col === CS_PROTECTED_COLUMNS_LENGTH - 1) {
                    options.push('Insert 1 column right', 'Hide column', 'Resize column');
                } else {
                    options.push(
                        'Insert 1 column left',
                        'Insert 1 column right',
                        'Hide column',
                        'Delete column',
                        'Resize column'
                    );
                }
            }
        } else {
            options.push('Insert 1 row above', 'Insert 1 row below', 'Hide row', 'Delete row', 'Resize row');
        }

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            options,
            target,
        });
    };

    const handleMenuClick = (option: string) => {
        if (contextMenu?.target) {
            const { row, col } = contextMenu.target;

            switch (option) {
                case 'Insert 1 column left':
                    if (col !== undefined) {
                        if (numCols > 256) {
                            setInfo({ message: "Can't exceed 256 columns!", isError: true });
                            break;
                        }
                        setSaving(true);
                        addColsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: col, colsNumber: 1 });
                    }
                    break;
                case 'Insert 1 column right':
                    if (col !== undefined) {
                        if (numCols > 256) {
                            setInfo({ message: "Can't exceed 256 columns!", isError: true });
                            break;
                        }
                        setSaving(true);
                        addColsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: col + 1, colsNumber: 1 });
                    }
                    break;
                case 'Hide column':
                    if (col !== undefined) {
                        const newHidden = [...hiddenCols];
                        const visibleColCount = newHidden.filter(hidden => !hidden).length;

                        if (visibleColCount > 1) {
                            updateHiddenColsMutation({
                                sheetId: spreadsheet!.sheet.id,
                                cols: [{ index: col, hidden: true }],
                            });
                        } else {
                            setInfo({
                                message: 'Cannot hide all columns. At least one column must remain visible.',
                                isError: true,
                            });
                        }
                    }
                    break;
                case 'Delete column':
                    if (col !== undefined) {
                        const visibleColCount = hiddenCols.filter(hidden => !hidden).length;
                        if (visibleColCount - 1 <= 1) {
                            setInfo({ message: 'Cannot delete all cols. At least one col must remain visible.', isError: true });
                            break;
                        }

                        if (spreadsheet?.type === 'CS' && col <= CS_PROTECTED_COLUMNS_LENGTH - 1) {
                            setInfo({ message: 'Cannot delete this column.', isError: true });
                            break;
                        }

                        setSaving(true);
                        deleteColsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: col, colsNumber: 1 });
                    }
                    break;
                case 'Resize column':
                    if (col !== undefined) {
                        setResizeType('col');
                        setCurrentIndex(col);
                        openDialog('col', col);
                    }
                    break;
                case 'Insert 1 row above':
                    if (row !== undefined) {
                        if (numRows > 65535) {
                            setInfo({ message: "Can't exceed 65536 rows!", isError: true });
                            break;
                        }
                        setSaving(true);
                        addRowsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: row, rowsNumber: 1 });
                    }
                    break;
                case 'Insert 1 row below':
                    if (row !== undefined) {
                        if (numRows > 65535) {
                            setInfo({ message: "Can't exceed 65536 rows!", isError: true });
                            break;
                        }
                        setSaving(true);
                        addRowsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: row + 1, rowsNumber: 1 });
                    }
                    break;
                case 'Hide row':
                    if (row !== undefined) {
                        const newHidden = [...hiddenRows];
                        const visibleRowCount = newHidden.filter(hidden => !hidden).length;

                        if (visibleRowCount > 1) {
                            updateHiddenRowsMutation({
                                sheetId: spreadsheet!.sheet.id,
                                rows: [{ index: row, hidden: true }],
                            });
                        } else {
                            setInfo({ message: 'Cannot hide all rows. At least one row must remain visible.', isError: true });
                        }
                    }
                    break;
                case 'Delete row':
                    if (row !== undefined) {
                        const visibleRowCount = hiddenRows.filter(hidden => !hidden).length;
                        if (visibleRowCount - 1 <= 1) {
                            setInfo({ message: 'Cannot delete all rows. At least one row must remain visible.', isError: true });
                            break;
                        }

                        setSaving(true);
                        deleteRowsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: row, rowsNumber: 1 });
                    }
                    break;
                case 'Resize row':
                    if (row !== undefined) {
                        setResizeType('row');
                        setCurrentIndex(row);
                        openDialog('row', row);
                    }
                    break;
                default:
                    break;
            }
        }
        setContextMenu(null);
    };

    return {
        handleContextMenu,
        handleMenuClick,
        contextMenu,
        resizeType,
        currentIndex,
        setContextMenu,
    };
};