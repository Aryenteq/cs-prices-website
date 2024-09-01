import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "react-query";
import { SpreadsheetProps } from "../../pages/SpreadsheetPage";
import { useInfo } from "../InfoContext";
import ContextMenu from "./ContextMenu";
import {
    getColumnLetter, initializeSizes, initializeVisibility,
    getTextAlign, getVerticalAlign
} from "./Functions/Utils";
import {
    fetchSpreadsheet, updateColWidth, updateRowHeight, updateHiddenCols, updateHiddenRows,
    deleteSheetCols, deleteSheetRows, addRows, addCols, updateCellContent
} from "./Functions/Fetch";
import type { Sheet } from "./Functions/Types";
import ResizeDialog from "./Functions/ResizeDialog";

const DEFAULT_ROW_HEIGHT = 21;
const DEFAULT_COL_WIDTH = 100;
const FIRST_COLUMN_WIDTH = 50;
const EDGE_THRESHOLD = 10;
const MINIMUM_SIZE = 20;
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_FONT_FAMILY = 'Arial';
export const CS_PROTECTED_COLUMNS_LENGTH = 2;

const SpreadsheetTable: React.FC<SpreadsheetProps> = ({ setSaving, spreadsheetId, sheet, setSheet, selectedCellIds, setSelectedCellIds,
    currentFontFamily, setCurrentFontFamily, currentFontSize, setCurrentFontSize, currentTextColor, setCurrentTextColor, currentBgColor, setCurrentBgColor
}) => {
    const { setInfo } = useInfo();
    const [isLoading, setIsLoading] = useState(true);

    const { data: spreadsheet } = useQuery<any, Error>(
        ['spreadsheet', spreadsheetId],
        () => fetchSpreadsheet(spreadsheetId),
        {
            keepPreviousData: true,
            onError: (error: any) => {
                console.error('Error getting spreadsheet:', error);
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while getting the spreadsheet.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    const [numRows, setNumRows] = useState<number>(100);
    const [numCols, setNumCols] = useState<number>(26);
    const [userPermission, setUserPermission] = useState<string | undefined>(undefined);
    const [spreadsheetType, setSpreadsheetType] = useState<'CS' | 'NORMAL'>('NORMAL');
    const [rowHeights, setRowHeights] = useState<number[]>(() => new Array(numRows).fill(DEFAULT_ROW_HEIGHT));
    const [colWidths, setColWidths] = useState<number[]>(() => new Array(numCols).fill(DEFAULT_COL_WIDTH));
    const [hiddenRows, setHiddenRows] = useState<boolean[]>(() => new Array(numRows).fill(false));
    const [hiddenCols, setHiddenCols] = useState<boolean[]>(() => new Array(numCols).fill(false));

    useEffect(() => {
        if (spreadsheet) {
            setSheet(spreadsheet.firstSheet);
            setNumRows(spreadsheet.firstSheet.numRows || 100);
            setNumCols(spreadsheet.firstSheet.numCols || 26);
            setUserPermission(spreadsheet.permission);
            setSpreadsheetType(spreadsheet.type);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [spreadsheet]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [resizeType, setResizeType] = useState<'row' | 'col' | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; options: string[]; target: { row?: number, col?: number } } | null>(null);

    useEffect(() => {
        if (sheet) {
            const rowHeightsFromSheet = sheet.rowHeights || {};
            const colWidthsFromSheet = sheet.columnWidths || {};
            const hiddenRowsFromSheet = sheet.hiddenRows || {};
            const hiddenColsFromSheet = sheet.hiddenCols || {};

            setRowHeights(initializeSizes(numRows, DEFAULT_ROW_HEIGHT, rowHeightsFromSheet));
            setColWidths(initializeSizes(numCols, DEFAULT_COL_WIDTH, colWidthsFromSheet));
            setHiddenRows(initializeVisibility(numRows, hiddenRowsFromSheet));
            setHiddenCols(initializeVisibility(numCols, hiddenColsFromSheet));
        }
    }, [sheet, numRows, numCols]);

    const getColumnWidth = (colIndex: number) => {
        return colWidths[colIndex] || DEFAULT_COL_WIDTH;
    };
    const getRowHeight = (rowIndex: number) => {
        return rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
    };

    const handleContextMenu = (e: React.MouseEvent, target: { row?: number, col?: number }) => {
        e.preventDefault();

        const options = [];

        if (target.col !== undefined) {
            if (spreadsheetType === 'CS' && target.col < CS_PROTECTED_COLUMNS_LENGTH - 1) {
                options.push("Hide column", "Resize column");
            } else {
                if (spreadsheetType === 'CS' && target.col === CS_PROTECTED_COLUMNS_LENGTH - 1) {
                    options.push("Insert 1 column right", "Hide column", "Resize column");
                } else {
                    options.push("Insert 1 column left", "Insert 1 column right", "Hide column", "Delete column", "Resize column");
                }
            }
        } else {
            options.push("Insert 1 row above", "Insert 1 row below", "Hide row", "Delete row", "Resize row");
        }

        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            options,
            target
        });
    };


    const handleMenuClick = (option: string) => {
        if (contextMenu?.target) {
            const { row, col } = contextMenu.target;

            switch (option) {
                case "Insert 1 column left":
                    if (col !== undefined) {
                        if (numCols > 256) {
                            setInfo({ message: 'Can\'t exceed 256 columns!', isError: true });
                            break;
                        }
                        setSaving(true);
                        setIsLoading(true);
                        addColsMutation({ sheetId: Number(sheet.id), startIndex: col, colsNumber: 1 });
                    }
                    break;
                case "Insert 1 column right":
                    if (col !== undefined) {
                        if (numCols > 256) {
                            setInfo({ message: 'Can\'t exceed 256 columns!', isError: true });
                            break;
                        }
                        setSaving(true);
                        setIsLoading(true);
                        addColsMutation({ sheetId: Number(sheet.id), startIndex: col + 1, colsNumber: 1 });
                    }
                    break;
                case "Hide column":
                    if (col !== undefined) {
                        // if (editingCell) {
                        //     handleInvalidCellEdit(col);
                        // }
                        setSaving(true);

                        //setHiddenCols(prevHidden => {
                        //const newHidden = [...prevHidden];
                        const newHidden = [...hiddenCols];
                        const visibleColCount = newHidden.filter(hidden => !hidden).length;

                        if (visibleColCount > 1) {
                            newHidden[col] = true;

                            updateHiddenColsMutation({
                                sheetId: sheet.id,
                                colIndex: col,
                                hidden: true,
                            });
                        } else {
                            setInfo({ message: 'Cannot hide all columns. At least one column must remain visible.', isError: true });
                        }
                        //    return newHidden;
                        //});
                    }

                    break;
                case "Delete column":
                    if (col !== undefined) {
                        // if (editingCell) {
                        //     handleInvalidCellEdit(col);
                        // }

                        const colsNumber = 1;

                        const visibleColCount = hiddenCols.filter(hidden => !hidden).length;
                        if (visibleColCount - colsNumber <= 1) {
                            setInfo({ message: 'Cannot delete all cols. At least one col must remain visible.', isError: true });
                            break;
                        }

                        // CS Protected Columns: Index start from 0, therefore the "-1"
                        if (spreadsheet.type === 'CS' && col <= CS_PROTECTED_COLUMNS_LENGTH - 1) {
                            setInfo({ message: 'Cannot delete this row.', isError: true });
                            break;
                        }

                        setSaving(true);
                        setIsLoading(true);
                        deleteColsMutation({ sheetId: Number(sheet.id), startIndex: col, colsNumber });
                    }
                    break;
                case "Resize column":
                    if (col !== undefined) {
                        setResizeType('col');
                        setCurrentIndex(col);
                        setDialogOpen(true);
                    }
                    break;
                case "Insert 1 row above":
                    if (row !== undefined) {
                        if (numRows > 65535) {
                            setInfo({ message: 'Can\'t exceed 65536 rows!', isError: true });
                            break;
                        }
                        setSaving(true);
                        setIsLoading(true);
                        addRowsMutation({ sheetId: Number(sheet.id), startIndex: row, rowsNumber: 1 });
                    }
                    break;
                case "Insert 1 row below":
                    if (row !== undefined) {
                        if (numRows > 65535) {
                            setInfo({ message: 'Can\'t exceed 65536 rows!', isError: true });
                            break;
                        }
                        setSaving(true);
                        setIsLoading(true);
                        addRowsMutation({ sheetId: Number(sheet.id), startIndex: row + 1, rowsNumber: 1 });
                    }
                    break;
                case "Hide row":
                    if (row !== undefined) {
                        // if (editingCell) {
                        //     handleInvalidCellEdit(row);
                        // }
                        setSaving(true);

                        //setHiddenRows(prevHidden => {
                        //    const newHidden = [...prevHidden];
                        const newHidden = [...hiddenRows];
                        const visibleRowCount = newHidden.filter(hidden => !hidden).length;

                        if (visibleRowCount > 1) {
                            newHidden[row] = true;

                            updateHiddenRowsMutation({
                                sheetId: sheet.id,
                                rowIndex: row,
                                hidden: true,
                            });
                        } else {
                            setInfo({ message: 'Cannot hide all rows. At least one row must remain visible.', isError: true });
                        }

                        //    return newHidden;
                        //});
                    }
                    break;
                case "Delete row":
                    if (row !== undefined) {
                        // if (editingCell) {
                        //     handleInvalidCellEdit(row);
                        // }

                        const rowsNumber = 1;

                        const visibleRowCount = hiddenRows.filter(hidden => !hidden).length;
                        if (visibleRowCount - rowsNumber <= 1) {
                            setInfo({ message: 'Cannot delete all rows. At least one row must remain visible.', isError: true });
                            break;
                        }

                        setSaving(true);
                        setIsLoading(true);
                        deleteRowsMutation({ sheetId: Number(sheet.id), startIndex: row, rowsNumber });
                    }
                    break;
                case "Resize row":
                    if (row !== undefined) {
                        setResizeType('row');
                        setCurrentIndex(row);
                        setDialogOpen(true);
                    }
                    break;
                default:
                    break;
            }
        }
        setContextMenu(null); // Close context afterwards
    };


    //
    //
    // INSERT ROWS/COLS
    //
    //

    const [addRowsInputValue, setAddRowsInputValue] = useState<number>(100);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setAddRowsInputValue(Number(value));
        }
    };

    const handleAddRowsClick = () => {
        if (addRowsInputValue + numRows > 65536) {
            setInfo({ message: 'Can\'t exceed 65536 rows!', isError: true });
        }
        else if (addRowsInputValue > 0) {
            setSaving(true);
            addRowsMutation({ sheetId: Number(sheet.id), startIndex: numRows, rowsNumber: addRowsInputValue });
        }
    };

    const { mutate: addRowsMutation } = useMutation(addRows, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            setIsLoading(false);
            let errorMessage = 'Something went wrong deleting the rows. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error deleting rows:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const { mutate: addColsMutation } = useMutation(addCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            setIsLoading(false);
            let errorMessage = 'Something went wrong inserting the columns. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error inserting cols:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    //
    //
    // DELETE ROWS/COLS
    //
    //

    const { mutate: deleteRowsMutation } = useMutation(deleteSheetRows, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            setIsLoading(false);

            let errorMessage = 'Something went wrong deleting the rows. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error deleting rows:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });


    const { mutate: deleteColsMutation } = useMutation(deleteSheetCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            setIsLoading(false);
            let errorMessage = 'Something went wrong deleting the cols. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error deleting cols:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });


    //
    //
    // RESIZE
    //
    //
    const { mutate: updateRowHeightMutation } = useMutation(updateRowHeight, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            //queryClient.invalidateQueries(['spreadsheet', spreadsheetId]);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new height. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error updating row height:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const { mutate: updateColWidthMutation } = useMutation(updateColWidth, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            //queryClient.invalidateQueries(['spreadsheet', spreadsheetId]);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new width. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error updating column width:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const [currentResizeRowIndex, setCurrentResizeRowIndex] = useState<number | null>(null);
    const [currentResizeColIndex, setCurrentResizeColIndex] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);

    const handleMouseDown = (e: React.MouseEvent, type: 'row' | 'col') => {
        e.preventDefault();
        setIsResizing(true);

        if (type === 'col') {
            setStartX(e.clientX);
        } else if (type === 'row') {
            setStartY(e.clientY);
        }
    };

    const handleMouseMove = (e: React.MouseEvent, type: 'row' | 'col', currentIndex: number) => {
        const { clientX, clientY } = e;

        if (isResizing) {
            if (type === 'col' && currentResizeColIndex !== null) {
                const deltaX = clientX - startX;
                setStartX(clientX);
                const newWidth = Math.max(MINIMUM_SIZE, colWidths[currentResizeColIndex] + deltaX);
                setColWidths(prevWidths => {
                    const updatedWidths = [...prevWidths];
                    updatedWidths[currentResizeColIndex] = newWidth;
                    return updatedWidths;
                });
            } else if (type === 'row' && currentResizeRowIndex !== null) {
                const deltaY = clientY - startY;
                setStartY(clientY);
                const newHeight = Math.max(MINIMUM_SIZE, rowHeights[currentResizeRowIndex] + deltaY);
                setRowHeights(prevHeights => {
                    const updatedHeights = [...prevHeights];
                    updatedHeights[currentResizeRowIndex] = newHeight;
                    return updatedHeights;
                });
            }
        } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

            if (type === 'row') {
                const isNearBottomEdge = clientY >= rect.bottom - EDGE_THRESHOLD && clientY <= rect.bottom + EDGE_THRESHOLD;
                const isNearTopEdgeNextRow = clientY >= rect.top - EDGE_THRESHOLD && clientY <= rect.top + EDGE_THRESHOLD;

                if (isNearBottomEdge) {
                    setCurrentResizeRowIndex(currentIndex);
                } else if (isNearTopEdgeNextRow && currentIndex > 0) {
                    setCurrentResizeRowIndex(currentIndex - 1);
                } else {
                    setCurrentResizeRowIndex(null);
                }
            } else if (type === 'col') {
                const isNearRightEdge = clientX >= rect.right - EDGE_THRESHOLD && clientX <= rect.right + EDGE_THRESHOLD;
                const isNearLeftEdgeNextCol = clientX >= rect.left - EDGE_THRESHOLD && clientX <= rect.left + EDGE_THRESHOLD;

                if (isNearRightEdge) {
                    setCurrentResizeColIndex(currentIndex);
                } else if (isNearLeftEdgeNextCol && currentIndex > 0) {
                    setCurrentResizeColIndex(currentIndex - 1);
                } else {
                    setCurrentResizeColIndex(null);
                }
            }
        }
    };

    const handleMouseUp = () => {
        if (isResizing) {

            if (currentResizeColIndex !== null) {
                setColWidths(prevWidths => {
                    const newWidth = prevWidths[currentResizeColIndex];

                    setSaving(true);
                    updateColWidthMutation({
                        sheetId: sheet.id,
                        colIndex: currentResizeColIndex,
                        width: newWidth
                    });
                    return prevWidths;
                });
            }

            if (currentResizeRowIndex !== null) {
                setRowHeights(prevHeights => {
                    const newHeight = prevHeights[currentResizeRowIndex];

                    setSaving(true);
                    updateRowHeightMutation({
                        sheetId: sheet.id,
                        rowIndex: currentResizeRowIndex,
                        height: newHeight
                    });
                    return prevHeights;
                });
            }

            setIsResizing(false);
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleDialogSave = (newSize: number) => {
        if (resizeType === 'row' && currentIndex !== null) {
            setRowHeights(prevHeights => {
                const newHeights = [...prevHeights];
                newHeights[currentIndex] = newSize;

                setSaving(true);
                updateRowHeightMutation({
                    sheetId: sheet.id,
                    rowIndex: currentIndex,
                    height: newSize
                });
                return newHeights;
            });
        } else if (resizeType === 'col' && currentIndex !== null) {
            setColWidths(prevWidths => {
                const newWidths = [...prevWidths];
                newWidths[currentIndex] = newSize;

                setSaving(true);
                updateColWidthMutation({
                    sheetId: sheet.id,
                    colIndex: currentIndex,
                    width: newSize
                });
                return newWidths;
            });
        }
        setDialogOpen(false);
    };

    //
    //
    // HIDDEN/REVEALED
    //
    //
    const { mutate: updateHiddenColsMutation } = useMutation(updateHiddenCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            //queryClient.invalidateQueries(['spreadsheet', spreadsheetId]);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new revealed columns. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error updating cols height:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const { mutate: updateHiddenRowsMutation } = useMutation(updateHiddenRows, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            //queryClient.invalidateQueries(['spreadsheet', spreadsheetId]);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new revealed rows. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error updating row height:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const handleRevealCols = (startIndex: number) => {
        setHiddenCols(prevHidden => {
            const newHidden = [...prevHidden];
            let revealStart = startIndex;
            let revealEnd = startIndex;

            // left neighbours
            for (let i = startIndex - 1; i >= 0; i--) {
                if (newHidden[i]) {
                    revealStart = i;
                } else {
                    break;
                }
            }

            // right neighbours
            for (let i = startIndex; i < newHidden.length; i++) {
                if (newHidden[i]) {
                    revealEnd = i;
                } else {
                    break;
                }
            }

            for (let i = revealStart; i <= revealEnd; i++) {
                if (newHidden[i]) {
                    newHidden[i] = false;
                }
            }

            setSaving(true);
            updateHiddenColsMutation({
                sheetId: sheet.id,
                colIndex: revealStart,
                hidden: false,
            });

            return newHidden;
        });
    };

    const handleRevealRows = (startIndex: number) => {
        setHiddenRows(prevHidden => {
            const newHidden = [...prevHidden];
            let revealStart = startIndex;
            let revealEnd = startIndex;

            // previous neighbors
            for (let i = startIndex - 1; i >= 0; i--) {
                if (newHidden[i]) {
                    revealStart = i;
                } else {
                    break;
                }
            }

            // next neighbours
            for (let i = startIndex; i < newHidden.length; i++) {
                if (newHidden[i]) {
                    revealEnd = i;
                } else {
                    break;
                }
            }

            for (let i = revealStart; i <= revealEnd; i++) {
                if (newHidden[i]) {
                    newHidden[i] = false;
                }
            }

            setSaving(true);
            updateHiddenRowsMutation({
                sheetId: sheet.id,
                rowIndex: revealStart,
                hidden: false,
            });

            return newHidden;
        });
    };

    const handlePseudoElementClick = (e: React.MouseEvent, index: number, type: 'col' | 'row') => {
        const th = e.currentTarget;
        const rect = th.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.bottom;

        const threshold = 15;

        if (type === 'col') {
            if (clickX < threshold && hiddenCols[index - 1]) {
                handleRevealCols(index - 1);
            } else if (clickX > rect.width - threshold && hiddenCols[index + 1]) {
                handleRevealCols(index + 1);
            }
        } else {
            if (clickY < threshold && hiddenRows[index - 1]) {
                handleRevealRows(index - 1);
            } else if (clickY > rect.width - threshold && hiddenRows[index + 1]) {
                handleRevealRows(index + 1);
            }
        }
    };


    //
    //
    // CONTENT
    //
    //
    //

    const [editingCell, setEditingCell] = useState<{ id: number, row: number, col: number } | null>(null);
    const [cellContent, setCellContent] = useState<string>("");
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: saveCellContentMutation } = useMutation(updateCellContent, {
        onSuccess: () => {
            setSaving(false);
            //queryClient.invalidateQueries(['spreadsheet', spreadsheetId]);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            console.error('Error updating cell content:', errorMessage);
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const handleCellClick = (id: number, row: number, col: number, content: string) => {
        if (hiddenRows[row] || hiddenCols[col]) return;

        setEditingCell({ id, row, col });
        setCellContent(content);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleCellContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaving(true);
        const updatedContent = e.target.value;
        setCellContent(updatedContent);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            saveCellContent(updatedContent);
        }, 2000);

        setTimeoutId(newTimeoutId);
    };

    const saveCellContent = (content?: string) => {
        const finalContent = content !== undefined ? content : cellContent;

        if (editingCell) {
            const cell = sheet.cells.find(c => c.id === editingCell.id);

            const currentContent = cell?.content ?? '';
            const newContent = finalContent ?? '';

            // No changes made - don't send an unnecessary request
            if (currentContent === newContent) {
                setSaving(false);
                return;
            }

            setSheet((prevSheet: Sheet) => {
                const updatedCells = prevSheet.cells.map(cell =>
                    cell.id === editingCell.id ? { ...cell, content: finalContent } : cell
                );
                return { ...prevSheet, cells: updatedCells };
            });

            const updatedCellData = [{
                cellId: editingCell.id,
                content: finalContent
            }];

            setSaving(true);
            saveCellContentMutation(updatedCellData);
        }
    };

    const handleCellBlur = () => {
        if (editingCell) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                setTimeoutId(null);
            }
            saveCellContent();
            setEditingCell(null);
        }
    };

    // const handleInvalidCellEdit = (row?: number, col?: number) => {
    //     if (editingCell?.row === row || editingCell?.col === col) {
    //         handleCellBlur();
    //     }
    // };


    //
    //
    // CELLS SELECTION
    //
    //

    const [selectedRange, setSelectedRange] = useState<string | null>(null);

    const isSelecting = useRef<boolean>(false);
    const startCell = useRef<{ row: number, col: number } | null>(null);

    useEffect(() => {
        const handleWindowMouseUp = () => {
            handleCellMouseUp();
        };

        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, []);

    const getSelectedCells = (start: { row: number, col: number }, end: { row: number, col: number }) => {
        let selectedIds: number[] = [];
        const startRow = Math.min(start.row, end.row);
        const endRow = Math.max(start.row, end.row);
        const startCol = Math.min(start.col, end.col);
        const endCol = Math.max(start.col, end.col);

        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
                const cell = sheet?.cells!.find((c: any) => c.row === rowIndex && c.col === colIndex);
                if (cell) {
                    selectedIds.push(cell.id);
                }
            }
        }

        return selectedIds;
    };

    const handleCellMouseDown = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
        e.preventDefault();
        handleCellBlur();
        isSelecting.current = true;
        startCell.current = { row: rowIndex, col: colIndex };
        setSelectedCellIds([]);
        setSelectedRange(null);
    };

    const handleCellMouseMove = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
        e.preventDefault();
        if (isSelecting.current && startCell.current) {
            const newSelectedCells = getSelectedCells(startCell.current, { row: rowIndex, col: colIndex });
            setSelectedCellIds(newSelectedCells);
        }
    };

    const handleCellMouseUp = () => {
        isSelecting.current = false;
        startCell.current = null;
    };

    useEffect(() => {
        if (selectedCellIds.length > 0 && sheet) {
            const calculatedRange = calculateSelectedRange(selectedCellIds);
            setSelectedRange(calculatedRange);

            const cell = sheet.cells.find(c => c.id === selectedCellIds[0]);
            if (cell) {
                setCurrentFontFamily(cell.style?.fontFamily || DEFAULT_FONT_FAMILY);
                setCurrentFontSize(cell.style?.fontSize || DEFAULT_FONT_SIZE);
                setCurrentTextColor(cell.color || '#FFFFFF');
                setCurrentBgColor(cell.bgColor || '#242424');
            }
        }
    }, [selectedCellIds, sheet]);

    const calculateSelectedRange = (selectedIds: number[]) => {
        if (!sheet || !sheet.cells) return null;
        const selectedCells = selectedIds.map(id => sheet?.cells!.find((c: any) => c.id === id)!);
        const rows = selectedCells.map(c => c.row);
        const cols = selectedCells.map(c => c.col);

        if (rows.length === 0 || cols.length === 0) return null;

        const minRow = Math.min(...rows) + 1;
        const maxRow = Math.max(...rows) + 1;
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);

        const minColLetter = getColumnLetter(spreadsheetType, minCol);
        const maxColLetter = getColumnLetter(spreadsheetType, maxCol);

        if (minRow === maxRow && minCol === maxCol) {
            return `${minColLetter}${minRow}`;
        } else {
            return `${minColLetter}${minRow}:${maxColLetter}${maxRow}`;
        }
    };



    const getBorderClasses = (id: number, rowIndex: number, colIndex: number) => {
        const isSelected = selectedCellIds.includes(id);

        if (!isSelected) {
            return;
        }

        const selectedCells = selectedCellIds.map(id => sheet?.cells!.find((c: any) => c.id === id)!);
        const rows = selectedCells.map(c => c.row);
        const cols = selectedCells.map(c => c.col);

        const minRow = Math.min(...rows);
        const maxRow = Math.max(...rows);
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);

        let borderClasses = '';

        if (rowIndex === minRow) {
            borderClasses += ' border-t-3';
        } if (rowIndex === maxRow) {
            borderClasses += ' border-b-3';
        } if (colIndex === minCol) {
            borderClasses += ' border-l-3';
        } if (colIndex === maxCol) {
            borderClasses += ' border-r-3';
        }

        return borderClasses;
    };

    const getSelectedHeaders = () => {
        const selectedCells = selectedCellIds.map(id => sheet?.cells!.find((c: any) => c.id === id)!);
        const selectedRows = Array.from(new Set(selectedCells.map(c => c.row)));
        const selectedCols = Array.from(new Set(selectedCells.map(c => c.col)));

        return { selectedRows, selectedCols };
    };

    const { selectedRows, selectedCols } = getSelectedHeaders();


    return (
        <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="table-fixed border-collapse border border-gray-400 w-full">
                <thead className="sticky top-0 bg-gray-100">
                    <tr>
                        <th
                            className="sticky left-0 z-20 border border-gray-400 p-2 bg-primary-lightest text-black text-xs break-words overflow-hidden"
                            style={{ width: FIRST_COLUMN_WIDTH, wordBreak: 'break-word' }}
                        >
                            {selectedRange}
                        </th>


                        {Array.from({ length: numCols }, (_, i) => {
                            if (!hiddenCols[i]) {
                                const isSelected = selectedCols.includes(i);

                                return (
                                    <th
                                        key={i}
                                        className={`z-10 border border-gray-400 p-2 text-black relative
                                        ${currentResizeColIndex === i ? 'col-resize-handle' : ''}
                                        ${currentResizeColIndex === i - 1 ? 'col-resize-cursor' : ''}
                                        ${hiddenCols[i - 1] ? 'hidden-col-before' : ''}
                                        ${hiddenCols[i + 1] ? 'hidden-col-after' : ''}
                                        ${spreadsheetType === 'CS' && i < CS_PROTECTED_COLUMNS_LENGTH ? 'bg-secondary-lightest' : 'bg-primary-lightest'}
                                        ${isSelected ? 'bg-selectedHeader' : ''}`}
                                        style={{ width: getColumnWidth(i), height: '50px' }}
                                        onContextMenu={userPermission !== 'VIEW' ? (e) => handleContextMenu(e, { col: i }) : undefined}
                                        onMouseMove={userPermission !== 'VIEW' ? (e) => handleMouseMove(e, 'col', i) : undefined}
                                        onMouseLeave={userPermission !== 'VIEW' ? () => {
                                            if (!isResizing) {
                                                setCurrentResizeColIndex(null);
                                            }
                                        } : undefined}
                                        onMouseDown={userPermission !== 'VIEW' ? (e) => handleMouseDown(e, 'col') : undefined}
                                        onClick={userPermission !== 'VIEW' ? (e) => handlePseudoElementClick(e, i, 'col') : undefined}
                                    >
                                        {getColumnLetter(spreadsheetType, i)}
                                    </th>
                                );
                            }
                        })}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: numRows }, (_, rowIndex) => {
                        if (!hiddenRows[rowIndex]) {
                            const isRowSelected = selectedRows.includes(rowIndex);

                            return (
                                <tr key={rowIndex} style={{ height: getRowHeight(rowIndex) }}>
                                    <td
                                        className={`sticky left-0 z-10 border border-gray-400 text-center bg-primary-lightest text-black
                                        ${currentResizeRowIndex === rowIndex ? 'row-resize-handle' : ''}
                                        ${currentResizeRowIndex === rowIndex - 1 ? 'row-resize-cursor' : ''}
                                        ${hiddenRows[rowIndex - 1] ? 'hidden-row-before' : ''}
                                        ${hiddenRows[rowIndex + 1] ? 'hidden-row-after' : ''}
                                        ${isRowSelected ? 'bg-selectedHeader' : ''}`}
                                        style={{ width: FIRST_COLUMN_WIDTH }}
                                        onContextMenu={userPermission !== 'VIEW' ? (e) => handleContextMenu(e, { row: rowIndex }) : undefined}
                                        onMouseMove={userPermission !== 'VIEW' ? (e) => handleMouseMove(e, 'row', rowIndex) : undefined}
                                        onMouseLeave={userPermission !== 'VIEW' ? () => {
                                            if (!isResizing) {
                                                setCurrentResizeRowIndex(null);
                                            }
                                        } : undefined}
                                        onMouseDown={userPermission !== 'VIEW' ? (e) => handleMouseDown(e, 'row') : undefined}
                                        onClick={userPermission !== 'VIEW' ? (e) => handlePseudoElementClick(e, rowIndex, 'row') : undefined}
                                    >
                                        {rowIndex + 1}
                                    </td>

                                    {Array.from({ length: numCols }, (_, colIndex) => {
                                        if (hiddenCols[colIndex]) return null;

                                        const cell = sheet?.cells!.find(
                                            (c: any) => c.row === rowIndex && c.col === colIndex
                                        );

                                        const borderClasses = cell ? getBorderClasses(cell.id, rowIndex, colIndex) : '';
                                        const isSelected = selectedCellIds.includes(cell?.id || -1);

                                        // Styles
                                        const isBold = cell?.style?.fontWeight === 'bold';
                                        const isItalic = cell?.style?.fontStyle === 'italic';
                                        const isStrikethrough = cell?.style?.textDecoration === 'line-through';

                                        const fontFamily = cell?.style?.fontFamily;
                                        const fontSize = cell?.style?.fontSize;

                                        if (editingCell?.row === rowIndex && editingCell?.col === colIndex) {
                                            return (
                                                <td key={colIndex} className="border border-gray-400 p-0">
                                                    <input
                                                        ref={inputRef}
                                                        type="text"
                                                        value={cellContent}
                                                        onChange={handleCellContentChange}
                                                        onBlur={handleCellBlur}
                                                        className="w-full h-full p-2"
                                                        style={{
                                                            backgroundColor: !isSelected ? (cell?.bgColor || '#000000') : undefined,
                                                            color: cell?.color || '#ffffff',
                                                            textAlign: getTextAlign(cell?.hAlignment),
                                                            verticalAlign: getVerticalAlign(cell?.vAlignment),
                                                            width: getColumnWidth(colIndex),
                                                            height: getRowHeight(rowIndex),
                                                            fontWeight: isBold ? 'bold' : 'normal',
                                                            fontStyle: isItalic ? 'italic' : 'normal',
                                                            textDecoration: isStrikethrough ? 'line-through' : 'none',

                                                            fontFamily: fontFamily ? fontFamily : DEFAULT_FONT_FAMILY,
                                                            fontSize: fontSize ? parseInt(fontSize, 10) : DEFAULT_FONT_SIZE,
                                                        }}
                                                    />
                                                </td>
                                            );
                                        }

                                        return (
                                            <td
                                                key={colIndex}
                                                className={`border border-gray-400 overflow-hidden truncate 
                                                    ${borderClasses} ${isSelected ? 'bg-selected' : ''}`}
                                                style={{
                                                    backgroundColor: !isSelected ? (cell?.bgColor || '#000000') : undefined,
                                                    color: cell?.color || '#ffffff',
                                                    textAlign: getTextAlign(cell?.hAlignment),
                                                    verticalAlign: getVerticalAlign(cell?.vAlignment),
                                                    width: getColumnWidth(colIndex),
                                                    height: getRowHeight(rowIndex),
                                                    fontWeight: isBold ? 'bold' : 'normal',
                                                    fontStyle: isItalic ? 'italic' : 'normal',
                                                    textDecoration: isStrikethrough ? 'line-through' : 'none',

                                                    fontFamily: fontFamily ? fontFamily : DEFAULT_FONT_FAMILY,
                                                    fontSize: fontSize ? parseInt(fontSize, 10) : DEFAULT_FONT_SIZE,
                                                }}
                                                onMouseDown={(e) => handleCellMouseDown(e, rowIndex, colIndex)}
                                                onMouseMove={(e) => handleCellMouseMove(e, rowIndex, colIndex)}
                                                onClick={() => {
                                                    if (cell && cell.id !== undefined) {
                                                        setSelectedCellIds([cell.id]);
                                                        setSelectedRange(`${getColumnLetter(spreadsheetType, colIndex)}${rowIndex}`);

                                                        if (userPermission !== 'VIEW' &&
                                                            ((spreadsheetType === 'NORMAL') ||
                                                                (spreadsheetType === 'CS' && (colIndex >= CS_PROTECTED_COLUMNS_LENGTH || colIndex == 0)))) {
                                                            handleCellClick(cell.id, rowIndex, colIndex, cell.content || '');
                                                        }
                                                    }
                                                }}
                                            >
                                                {cell?.content || ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        }
                    })}
                </tbody>
            </table>

            <div className="my-6 flex gap-2 items-center">
                <button onClick={handleAddRowsClick}
                    className="border border-2 border-transparent hover:border-white rounded-lg p-2">Add</button>
                <input
                    type="text"
                    value={addRowsInputValue}
                    onChange={handleInputChange}
                    className="p-2 w-12 rounded-lg"
                />
                <span>more rows</span>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenu.options}
                    onClick={handleMenuClick}
                    onClose={() => setContextMenu(null)}
                />
            )}

            <ResizeDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleDialogSave}
                minSize={MINIMUM_SIZE}
                title={`Resize ${resizeType === 'row' ? 'Row' : 'Column'}`}
                defaultValue={resizeType === 'row' && currentIndex !== null ? rowHeights[currentIndex] : colWidths[currentIndex ?? 0]}
                setInfo={setInfo}
            />
        </div>
    );
};

export default SpreadsheetTable;