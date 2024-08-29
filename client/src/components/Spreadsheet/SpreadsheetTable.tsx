import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import { SpreadsheetProps } from "../../pages/SpreadsheetPage";
import { useInfo } from "../InfoContext";
import ContextMenu from "./ContextMenu";
import { getColumnLetter, initializeSizes, initializeVisibility } from "./Functions/Utils";
import {
    fetchSpreadsheet, updateColWidth, updateRowHeight, updateHiddenCols, updateHiddenRows,
    deleteSheetCols, deleteSheetRows, addRows, addCols
} from "./Functions/Fetch";
import ResizeDialog from "./Functions/ResizeDialog";

const DEFAULT_ROW_HEIGHT = 21;
const DEFAULT_COL_WIDTH = 100;
const FIRST_COLUMN_WIDTH = 40;
const EDGE_THRESHOLD = 10;
const MINIMUM_SIZE = 20;
export const CS_PROTECTED_COLUMNS_LENGTH = 2;

const SpreadsheetTable: React.FC<SpreadsheetProps> = ({ uid, spreadsheetId, saving, setSaving }) => {
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

    const [sheet, setSheet] = useState<any>(null);

    useEffect(() => {
        if (spreadsheet) {
            setSheet(spreadsheet.firstSheet);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
    }, [spreadsheet]);


    const numRows = sheet?.numRows || 100;
    const numCols = sheet?.numCols || 26;
    const userPermission = spreadsheet?.permission;
    const spreadsheetType = spreadsheet?.type;

    const [rowHeights, setRowHeights] = useState<number[]>(() => new Array(numRows).fill(DEFAULT_ROW_HEIGHT));
    const [colWidths, setColWidths] = useState<number[]>(() => new Array(numCols).fill(DEFAULT_COL_WIDTH));
    const [hiddenRows, setHiddenRows] = useState<boolean[]>(() => new Array(numRows).fill(false));
    const [hiddenCols, setHiddenCols] = useState<boolean[]>(() => new Array(numCols).fill(false));

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
                        setIsLoading(true);
                        addColsMutation({ sheetId: Number(sheet.id), startIndex: col + 1, colsNumber: 1 });
                    }
                    break;
                case "Hide column":
                    if (col !== undefined) {
                        setHiddenCols(prevHidden => {
                            const newHidden = [...prevHidden];
                            const visibleColCount = newHidden.filter(hidden => !hidden).length;

                            if (visibleColCount > 1) {
                                newHidden[col] = true;

                                setSaving(true);
                                updateHiddenColsMutation({
                                    sheetId: sheet.id,
                                    colIndex: col,
                                    hidden: true,
                                });
                            } else {
                                setInfo({ message: 'Cannot hide all columns. At least one column must remain visible.', isError: true });
                            }

                            return newHidden;
                        });
                    }

                    break;
                case "Delete column":
                    if (col !== undefined) {
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
                        setIsLoading(true);
                        addRowsMutation({ sheetId: Number(sheet.id), startIndex: row + 1, rowsNumber: 1 });
                    }
                    break;
                case "Hide row":
                    if (row !== undefined) {
                        setHiddenRows(prevHidden => {
                            const newHidden = [...prevHidden];
                            const visibleRowCount = newHidden.filter(hidden => !hidden).length;

                            if (visibleRowCount > 1) {
                                newHidden[row] = true;

                                setSaving(true);
                                updateHiddenRowsMutation({
                                    sheetId: sheet.id,
                                    rowIndex: row,
                                    hidden: true,
                                });
                            } else {
                                setInfo({ message: 'Cannot hide all rows. At least one row must remain visible.', isError: true });
                            }

                            return newHidden;
                        });
                    }
                    break;
                case "Delete row":
                    if (row !== undefined) {
                        const rowsNumber = 1;

                        const visibleRowCount = hiddenRows.filter(hidden => !hidden).length;
                        if (visibleRowCount - rowsNumber <= 1) {
                            setInfo({ message: 'Cannot delete all rows. At least one row must remain visible.', isError: true });
                            break;
                        }

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
            addRowsMutation({ sheetId: Number(sheet.id), startIndex: numRows, rowsNumber: addRowsInputValue });
        }
    };

    const { mutate: addRowsMutation } = useMutation(addRows, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error) => {
            setSaving(false);
            setIsLoading(false);
            console.error('Error inserting rows:', error);
            setInfo({ message: 'Something went wrong inserting the rows. Try again', isError: true });
        }
    });

    const { mutate: addColsMutation } = useMutation(addCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error) => {
            setSaving(false);
            setIsLoading(false);
            console.error('Error inserting cols:', error);
            setInfo({ message: 'Something went wrong inserting the columns. Try again', isError: true });
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
        onError: (error) => {
            setSaving(false);
            setIsLoading(false);
            console.error('Error deleting rows:', error);
            setInfo({ message: 'Something went wrong deleting the rows. Try again', isError: true });
        }
    });


    const { mutate: deleteColsMutation } = useMutation(deleteSheetCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSheet(updatedSheet);
            setIsLoading(false);
        },
        onError: (error) => {
            setSaving(false);
            setIsLoading(false);
            console.error('Error deleting cols:', error);
            setInfo({ message: 'Something went wrong deleting the cols. Try again', isError: true });
        }
    });


    //
    //
    // RESIZE
    //
    //
    const { mutate: updateRowHeightMutation } = useMutation(updateRowHeight, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error) => {
            setSaving(false);
            console.error('Error updating row height:', error);
            setInfo({ message: 'Something went wrong saving the new height. Try again', isError: true });
        }
    });

    const { mutate: updateColWidthMutation } = useMutation(updateColWidth, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error) => {
            setSaving(false);
            console.error('Error updating column width:', error);
            setInfo({ message: 'Something went wrong saving the new width. Try again', isError: true });
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
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error) => {
            setSaving(false);
            console.error('Error updating row height:', error);
            setInfo({ message: 'Something went wrong saving the new revealed columns. Try again', isError: true });
        }
    });

    const { mutate: updateHiddenRowsMutation } = useMutation(updateHiddenRows, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error) => {
            setSaving(false);
            console.error('Error updating row height:', error);
            setInfo({ message: 'Something went wrong saving the new revealed rows. Try again', isError: true });
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

    // if (isLoading) {
    //     return (
    //         <div>Loading...</div>
    //     );
    // }

    return (
        <div className="flex-grow overflow-auto custom-scrollbar">
            <table className="table-fixed border-collapse border border-gray-400 w-full">
                <thead className="sticky top-0 bg-gray-100">
                    <tr>
                        <th
                            className="sticky left-0 z-20 border border-gray-400 p-2 bg-primary-lightest text-black"
                            style={{ width: FIRST_COLUMN_WIDTH }}
                        ></th>

                        {/* COLUMNS HEADER (top) */}
                        {Array.from({ length: numCols }, (_, i) => {
                            if (!hiddenCols[i]) {

                                return (
                                    <th
                                        key={i}
                                        className={`z-10 border border-gray-400 p-2 text-black relative
                                        ${currentResizeColIndex === i ? 'col-resize-handle' : ''}
                                        ${currentResizeColIndex === i - 1 ? 'col-resize-cursor' : ''}
                                        ${hiddenCols[i - 1] ? 'hidden-col-before' : ''}
                                        ${hiddenCols[i + 1] ? 'hidden-col-after' : ''}
                                        ${spreadsheetType === 'CS' && i < CS_PROTECTED_COLUMNS_LENGTH ? 'bg-secondary-lightest' : 'bg-primary-lightest'}`}
                                        style={{ width: getColumnWidth(i) }}
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
                            return (
                                <tr key={rowIndex} style={{ height: getRowHeight(rowIndex) }}>
                                    {/* ROWS HEADER (left) */}
                                    <td
                                        className={`sticky left-0 z-10 border border-gray-400 text-center bg-primary-lightest text-black
                                        ${currentResizeRowIndex === rowIndex ? 'row-resize-handle' : ''}
                                        ${currentResizeRowIndex === rowIndex - 1 ? 'row-resize-cursor' : ''}
                                        ${hiddenRows[rowIndex - 1] ? 'hidden-row-before' : ''}
                                        ${hiddenRows[rowIndex + 1] ? 'hidden-row-after' : ''}`}
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
                                        if (hiddenCols[colIndex]) return null; // Skip hidden columns

                                        const cell = sheet?.cells!.find(
                                            (c: any) => c.row === rowIndex && c.col === colIndex
                                        );
                                        return (
                                            <td
                                                key={colIndex}
                                                className="border border-gray-400 overflow-hidden truncate"
                                                style={{
                                                    backgroundColor: cell?.bgColor || '#ffffff',
                                                    color: cell?.color || '#000000',
                                                    textAlign: cell?.hAlignment.toLowerCase() || 'left',
                                                    verticalAlign: cell?.vAlignment.toLowerCase() || 'center',
                                                    width: getColumnWidth(colIndex),
                                                    height: getRowHeight(rowIndex),
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