import React, { useState} from "react";

// custom hooks
import { useInfo } from "../../context/InfoContext";
import { useAddRowsMutation } from "../mutation/Sheet/addRowsMutation";
import { useAddColsMutation } from "../mutation/Sheet/addColsMutation";
import { useDeleteRowsMutation } from "../mutation/Sheet/deleteRowsMutation";
import { useDeleteColsMutation } from "../mutation/Sheet/deleteColsMutation";
import { useUpdateRowHeightMutation } from "../mutation/Sheet/updateRowHeightMutation";
import { useUpdateColWidthMutation } from "../mutation/Sheet/updateColWidthMutation";
import { useUpdateHiddenColsMutation } from "../mutation/Sheet/updateHiddenColsMutation";
import { useUpdateHiddenRowsMutation } from "../mutation/Sheet/updateHiddenRowsMutation";
import { useSaveCellContentMutation } from "../mutation/Cell/saveCellContentMutation";
import { useRowResizeHandler } from "./hooks/Resize/rowResizeHandler";
import { useColResizeHandler } from "./hooks/Resize/colResizeHandler";
import { useDialogSave } from "./hooks/Resize/dialogSave";
import { useRevealCols } from "./hooks/Hidden/revealCols";
import { useRevealRows } from "./hooks/Hidden/revealRows";
import { usePseudoElementClick } from "./hooks/Hidden/pseudoElementClick";
import { useCellEditing } from "./hooks/cellEditing/cellEditing";
import { useBorderClasses } from "./hooks/selection/borderClasses";
import { useSelectedHeaders } from "./hooks/selection/selectedHeaders";
import { useCellSelection } from "./hooks/selection/cellSelection";
import { useContextMenuHandler } from "./hooks/contextMenu/contextMenuHandler";

// functions
import ContextMenu from "./ContextMenu";
import {
    getColumnLetter, getTextAlign, getVerticalAlign
} from "./Functions/Utils";
import { computeCellFunction } from "./Functions/computeCellFunction";
import ResizeDialog from "./Functions/ResizeDialog";

// types
import type { SelectedCellsContent } from "../../types/cellTypes";

// props
import { SpreadsheetProps } from "../../props/spreadsheetProps";


export const DEFAULT_ROW_HEIGHT = 21;
export const DEFAULT_COL_WIDTH = 100;
export const FIRST_COLUMN_WIDTH = 50;
export const EDGE_THRESHOLD = 10;
export const MINIMUM_SIZE = 20;
export const DEFAULT_FONT_SIZE = 12;
export const DEFAULT_FONT_FAMILY = 'Arial';
export const CS_PROTECTED_COLUMNS_LENGTH: number = 9;
export const CS_PROTECTED_COLUMNS_EDITABLE: number[] = [0, 3];

const SpreadsheetTable: React.FC<SpreadsheetProps & {
    setSelectedCellsId: React.Dispatch<React.SetStateAction<number[]>>;
    setSelectedCellsContent: React.Dispatch<React.SetStateAction<SelectedCellsContent>>;
    editingCellRef: React.MutableRefObject<{ id: number, row: number, col: number } | null>;
    editingCell: { id: number, row: number, col: number } | null;
    setEditingCell: React.Dispatch<React.SetStateAction<{ id: number, row: number, col: number } | null>>;
    updateCtrlZMemory: (updatedSheet: any) => void;
    rowHeights: number[];
    setRowHeights: React.Dispatch<React.SetStateAction<number[]>>;
    colWidths: number[];
    setColWidths: React.Dispatch<React.SetStateAction<number[]>>;
    hiddenRows: boolean[];
    setHiddenRows: React.Dispatch<React.SetStateAction<boolean[]>>;
    hiddenCols: boolean[];
    setHiddenCols: React.Dispatch<React.SetStateAction<boolean[]>>;
    getRowHeight: (rowIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
}> = ({ setSaving, spreadsheet, setSpreadsheet, selectedCellsId, setSelectedCellsId,
    setSelectedCellsContent, editingCellRef, editingCell, setEditingCell,
    setCurrentFontFamily, setCurrentFontSize, setCurrentTextColor, setCurrentBgColor,
    updateCtrlZMemory,
    rowHeights,
    setRowHeights,
    colWidths,
    setColWidths,
    hiddenRows,
    setHiddenRows,
    hiddenCols,
    setHiddenCols,
    getRowHeight,
    getColumnWidth,
}) => {
        const { setInfo } = useInfo();

        const numRows = spreadsheet!.sheet.numRows || 100;
        const numCols = spreadsheet!.sheet.numCols || 100;
        const userPermission = spreadsheet!.permission;
        const spreadsheetType = spreadsheet!.type;

        // INSERT ROWS/COLS

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
                addRowsMutation({ sheetId: Number(spreadsheet!.sheet.id), startIndex: numRows, rowsNumber: addRowsInputValue });
            }
        };

        const { mutate: addRowsMutation } = useAddRowsMutation(spreadsheet, setSpreadsheet, setRowHeights, updateCtrlZMemory, setSaving);
        const { mutate: addColsMutation } = useAddColsMutation(spreadsheet, setSpreadsheet, setColWidths, updateCtrlZMemory, setSaving);

        // DELETE ROWS/COLS

        const { mutate: deleteRowsMutation } = useDeleteRowsMutation(spreadsheet, setSpreadsheet, updateCtrlZMemory, setSaving);
        const { mutate: deleteColsMutation } = useDeleteColsMutation(spreadsheet, setSpreadsheet, updateCtrlZMemory, setSaving);


        // RESIZE

        const { mutate: updateRowHeightMutation } = useUpdateRowHeightMutation(spreadsheet, setSpreadsheet, setRowHeights, updateCtrlZMemory, setSaving);
        const { mutate: updateColWidthMutation } = useUpdateColWidthMutation(spreadsheet, setSpreadsheet, setColWidths, updateCtrlZMemory, setSaving);

        const { handleMouseDown: handleRowMouseDown, handleMouseMove: handleRowMouseMove, currentResizeRowIndex, setCurrentResizeRowIndex,
            isResizing: isRowResizing} = useRowResizeHandler(rowHeights, setRowHeights, updateRowHeightMutation, spreadsheet!, setSaving);

        const { handleMouseDown: handleColMouseDown, handleMouseMove: handleColMouseMove, currentResizeColIndex, setCurrentResizeColIndex,
            isResizing: isColResizing } = useColResizeHandler(colWidths, setColWidths, updateColWidthMutation, spreadsheet!, setSaving);

        const { dialogOpen, openDialog, handleDialogSave, setDialogOpen } = useDialogSave(
            setRowHeights, setColWidths, updateRowHeightMutation, updateColWidthMutation, setSaving, spreadsheet!
        );


        // HIDDEN/REVEALED

        const { mutate: updateHiddenColsMutation } = useUpdateHiddenColsMutation(spreadsheet, setSpreadsheet, setHiddenCols, updateCtrlZMemory, setSaving);
        const { mutate: updateHiddenRowsMutation } = useUpdateHiddenRowsMutation(spreadsheet, setSpreadsheet, setHiddenRows, updateCtrlZMemory, setSaving);

        const { handleRevealCols } = useRevealCols(hiddenCols, setHiddenCols, spreadsheet!, updateHiddenColsMutation);
        const { handleRevealRows } = useRevealRows(hiddenRows, setHiddenRows, spreadsheet!, updateHiddenRowsMutation);

        const { handlePseudoElementClick } = usePseudoElementClick(hiddenCols, hiddenRows, handleRevealCols, handleRevealRows);


        // CONTENT

        const { mutate: saveCellContentMutation } = useSaveCellContentMutation(spreadsheet, setSpreadsheet, updateCtrlZMemory, setSaving);

        const { cellContent, handleCellClick, handleCellContentChange, handleCellBlur, handleKeyDown, inputRef } = useCellEditing(
            selectedCellsId, spreadsheet!, editingCell, setEditingCell, editingCellRef, setSelectedCellsId, setSelectedCellsContent,
            saveCellContentMutation, hiddenRows, hiddenCols, setSaving
        );


        // CELLS SELECTION

        const [selectedRange, setSelectedRange] = useState<string | null>(null);

        const { handleCellMouseDown, handleCellMouseMove, } = useCellSelection(
            spreadsheet!, selectedCellsId, setSelectedCellsId, setSelectedCellsContent, handleCellBlur,
            setSelectedRange, setCurrentFontFamily, setCurrentFontSize, setCurrentTextColor, setCurrentBgColor,
        );

        const { getBorderClasses } = useBorderClasses(spreadsheet, selectedCellsId);
        const { selectedRows, selectedCols } = useSelectedHeaders(spreadsheet, selectedCellsId);

        // CONTEXT MENU (right click)

        const {handleContextMenu, handleMenuClick, contextMenu, resizeType, currentIndex, setContextMenu,} = useContextMenuHandler(
            hiddenCols, hiddenRows, spreadsheet!, setInfo, setSaving, updateHiddenColsMutation, updateHiddenRowsMutation, 
            addColsMutation, addRowsMutation, deleteColsMutation, deleteRowsMutation, openDialog,
        );


        return (
            <div className="flex-grow overflow-auto custom-scrollbar">
                <table className="table-fixed border-collapse border border-gray-400">
                    <thead className="sticky top-0 bg-gray-100">
                        <tr>
                            <th
                                className="left-0 z-200 border border-gray-400 p-2 bg-primary-lightest text-black text-xs break-words overflow-hidden"
                                style={{ width: FIRST_COLUMN_WIDTH, wordBreak: 'break-word' }}
                            >
                                {selectedRange === null ? '' : selectedRange}
                            </th>


                            {Array.from({ length: numCols }, (_, i) => {
                                if (!hiddenCols[i]) {
                                    const isSelected = selectedCols?.includes(i);

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
                                            onMouseMove={userPermission !== 'VIEW' ? (e) => handleColMouseMove(e, i) : undefined}
                                            onMouseLeave={userPermission !== 'VIEW' ? () => {
                                                if (!isColResizing) {
                                                    setCurrentResizeColIndex(null);
                                                }
                                            } : undefined}
                                            onMouseDown={userPermission !== 'VIEW' ? (e) => handleColMouseDown(e) : undefined}
                                            onClick={userPermission !== 'VIEW' ? (e) => handlePseudoElementClick(e, i, 'col') : undefined}
                                        >
                                            {getColumnLetter(false, spreadsheetType, i)}
                                        </th>
                                    );
                                }
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: numRows }, (_, rowIndex) => {
                            if (!hiddenRows[rowIndex]) {
                                const isRowSelected = selectedRows?.includes(rowIndex);

                                return (
                                    <tr key={rowIndex} style={{ height: getRowHeight(rowIndex) }}>
                                        <td
                                            className={`sticky left-0 z-10 border border-gray-400 text-center bg-primary-lightest text-black
                                        ${currentResizeRowIndex === rowIndex ? 'row-resize-handle' : ''}
                                        ${currentResizeRowIndex === rowIndex - 1 ? 'row-resize-cursor' : ''}
                                        ${hiddenRows[rowIndex - 1] ? 'hidden-row-before' : ''}
                                        ${hiddenRows[rowIndex + 1] ? 'hidden-row-after' : ''}
                                        ${isRowSelected ? 'bg-selectedHeader' : ''}`}
                                            style={{ maxWidth: FIRST_COLUMN_WIDTH, minWidth: FIRST_COLUMN_WIDTH }}
                                            onContextMenu={userPermission !== 'VIEW' ? (e) => handleContextMenu(e, { row: rowIndex }) : undefined}
                                            onMouseMove={userPermission !== 'VIEW' ? (e) => handleRowMouseMove(e, rowIndex) : undefined}
                                            onMouseLeave={userPermission !== 'VIEW' ? () => {
                                                if (!isRowResizing) {
                                                    setCurrentResizeRowIndex(null);
                                                }
                                            } : undefined}
                                            onMouseDown={userPermission !== 'VIEW' ? (e) => handleRowMouseDown(e) : undefined}
                                            onClick={userPermission !== 'VIEW' ? (e) => handlePseudoElementClick(e, rowIndex, 'row') : undefined}
                                        >
                                            {rowIndex + 1}
                                        </td>

                                        {Array.from({ length: numCols }, (_, colIndex) => {
                                            if (hiddenCols[colIndex]) return null;

                                            const cell = spreadsheet?.sheet?.cells?.find(
                                                (c: any) => c.row === rowIndex && c.col === colIndex
                                            );

                                            const borderClasses = cell ? getBorderClasses(cell.id, rowIndex, colIndex) : '';
                                            const isSelected = selectedCellsId.includes(cell?.id || -1);

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
                                                            onKeyDown={handleKeyDown}
                                                            className="w-full h-full p-2"
                                                            style={{
                                                                backgroundColor: !isSelected ? (cell?.bgColor || '#000000') : undefined,
                                                                color: cell?.color || '#ffffff',
                                                                textAlign: getTextAlign(cell?.hAlignment),
                                                                verticalAlign: getVerticalAlign(cell?.vAlignment),
                                                                maxWidth: getColumnWidth(colIndex),
                                                                minWidth: getColumnWidth(colIndex),
                                                                maxHeight: getRowHeight(rowIndex),
                                                                minHeight: getRowHeight(rowIndex),
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
                                                        // Both max and min needed because that's how tables work
                                                        // they try to fit the content inside them, so force them not to
                                                        maxWidth: getColumnWidth(colIndex),
                                                        minWidth: getColumnWidth(colIndex),
                                                        maxHeight: getRowHeight(rowIndex),
                                                        minHeight: getRowHeight(rowIndex),
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
                                                            setSelectedCellsId([cell.id]);
                                                            setSelectedCellsContent({
                                                                [rowIndex]: {
                                                                    [colIndex]: cell.content ? cell.content : null,
                                                                }
                                                            });

                                                            setSelectedRange(`${getColumnLetter(true, spreadsheetType, colIndex)}${rowIndex}`);

                                                            if (userPermission !== 'VIEW' &&
                                                                ((spreadsheetType === 'NORMAL') ||
                                                                    (spreadsheetType === 'CS' && (colIndex >= CS_PROTECTED_COLUMNS_LENGTH || CS_PROTECTED_COLUMNS_EDITABLE.includes(colIndex))))) {
                                                                handleCellClick(cell.id, rowIndex, colIndex, cell.content || '');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {cell?.content?.startsWith('=')
                                                        ? computeCellFunction(cell.content, spreadsheet!)
                                                        : (cell?.content || '')
                                                    }
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