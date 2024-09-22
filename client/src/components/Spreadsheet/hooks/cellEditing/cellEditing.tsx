import { useState, useRef } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';

export const useCellEditing = (
    selectedCellsId: number[],
    spreadsheet: Spreadsheet | undefined,
    editingCell: { id: number, row: number, col: number } | null,
    setEditingCell: React.Dispatch<React.SetStateAction<{ id: number, row: number, col: number } | null>>,
    editingCellRef: React.MutableRefObject<{ id: number, row: number, col: number } | null>,
    setSelectedCellsId: Function,
    setSelectedCellsContent: Function,
    saveCellContentMutation: Function,
    hiddenRows: boolean[],
    hiddenCols: boolean[],
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const spreadsheetType = spreadsheet!.type;
    const [cellContent, setCellContent] = useState<string>("");
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle cell click
    const handleCellClick = (id: number, row: number, col: number, content: string) => {
        if (hiddenRows[row] || hiddenCols[col]) return;

        setEditingCell({ id, row, col });
        editingCellRef.current = { id, row, col }; // or useEffect of [editingCell]

        setCellContent(content);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    // Handle content change
    const handleCellContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaving(true);
        const updatedContent = e.target.value;

        if (editingCell) {
            // Check for numeric columns in 'CS' spreadsheet type
            if (spreadsheetType === 'CS' && editingCell.col === 1) {
                const numericRegex = /^\d*$/;
                if (!numericRegex.test(updatedContent)) {
                    return;
                }
            }
        }

        setCellContent(updatedContent);

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            if (editingCellRef.current !== null) {
                saveCellContent(updatedContent); 
            }
        }, 2000);

        setTimeoutId(newTimeoutId);
    };

    const saveCellContent = (content?: string) => {
        const finalContent = content !== undefined ? content : cellContent;

        if (editingCellRef.current) {
            const cell = spreadsheet?.sheet.cells.find((c: any) => c.id === editingCellRef.current?.id);
            const currentContent = cell?.content ?? '';
            const newContent = finalContent ?? '';

            // No changes made - don't send an unnecessary request
            if (currentContent === newContent) {
                setSaving(false);
                return;
            }

            const updatedCellData = [
                {
                    cellId: editingCellRef.current.id,
                    content: finalContent,
                },
            ];

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
            editingCellRef.current = null;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && selectedCellsId.length === 1 && editingCell) {
            handleCellBlur();

            const { row, col } = editingCell;
            const nextCell = spreadsheet?.sheet.cells.find((c: any) => c.row === row + 1 && c.col === col);

            if (nextCell) {
                setSelectedCellsId([nextCell.id]);
                setSelectedCellsContent({
                    [row]: {
                        [col]: nextCell.content ? nextCell.content : null,
                    },
                });
                handleCellClick(nextCell.id, row + 1, col, nextCell.content ?? "");
            }
        }
    };

    return {
        cellContent,
        editingCell,
        handleCellClick,
        handleCellContentChange,
        handleCellBlur,
        handleKeyDown,
        inputRef,
    };
};