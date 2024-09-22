import React, { useEffect, useState } from "react";

// types
import type { Sheet } from "../../../types/sheetTypes";
import type { Spreadsheet } from "../../../types/spreadsheetTypes";
import type { SelectedCellsContent } from "../../../types/cellTypes";

// hooks
import { useRevertSheetMutation } from "../../mutation/Sheet/RevertSheet/revertSheetMutation";
import { useUndo } from "../../mutation/Sheet/RevertSheet/undo";
import { useRedo } from "../../mutation/Sheet/RevertSheet/redo";
import { useSavePastedContentMutation } from "../../mutation/Cell/savePastedContentMutation";

interface KeyboardListenerProps {
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    spreadsheet: Spreadsheet | undefined;
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>;
    selectedCellsId: number[];
    selectedCellsContent: SelectedCellsContent;
    editingCellRef: React.MutableRefObject<{ id: number, row: number, col: number } | null>;
    setEditingCell: React.Dispatch<React.SetStateAction<{ id: number, row: number, col: number } | null>>;
    updateCtrlZMemory: (updatedSheet: any) => void;
    ctrlZSheets: Sheet[] | null;
    ctrlZIndex: number | null;
    setCtrlZIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setRowHeights: React.Dispatch<React.SetStateAction<number[]>>;
    setColWidths: React.Dispatch<React.SetStateAction<number[]>>;
    setHiddenRows: React.Dispatch<React.SetStateAction<boolean[]>>;
    setHiddenCols: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const KeyboardListener: React.FC<KeyboardListenerProps> = ({ setSaving, spreadsheet, setSpreadsheet, selectedCellsId, selectedCellsContent,
    editingCellRef, setEditingCell, updateCtrlZMemory, ctrlZSheets, ctrlZIndex, setCtrlZIndex, setRowHeights, setColWidths, setHiddenRows, setHiddenCols,
}) => {
    const [copiedCellsContent, setCopiedCellsContent] = useState<SelectedCellsContent>({});
    const canEdit = spreadsheet!.permission !== 'VIEW';

    const onCopy = () => {
        setCopiedCellsContent(() => {
            return selectedCellsContent;
        });

        // Normalize text
        const concatenatedContent = Object.keys(selectedCellsContent)
            .map(rowIndex => {
                const numericRowIndex = parseInt(rowIndex, 10);
                return Object.values(selectedCellsContent[numericRowIndex])
                    .filter(content => content !== null)
                    .join('\t');
            })
            .join('\n');

        const clipboardContent = `IHMLegend.ary\n${concatenatedContent}`;

        navigator.clipboard.writeText(clipboardContent).catch(err => {
            console.error("Failed to copy to clipboard: ", err);
        });
    };


    const { mutate: savePastedContentMutation } = useSavePastedContentMutation(setSpreadsheet, updateCtrlZMemory, setSaving);

    const onPaste = async () => {
        if (!canEdit) {
            return;
        }

        if (selectedCellsId.length !== 0 && Object.keys(copiedCellsContent).length > 0) {
            editingCellRef.current = null; // instantly. Avoid saving after 2s
            setEditingCell(null); // async, updates after saveCellContent finishes, on the next re-render or smth
            savePastedContentMutation({ firstCellId: selectedCellsId[0], contents: copiedCellsContent });
        }
    };

    const onDelete = async () => {
        if (!canEdit) {
            return;
        }

        if (selectedCellsId.length !== 0) {
            editingCellRef.current = null;
            setEditingCell(null);

            const deletedCellsContent = Object.keys(selectedCellsContent).reduce((acc, rowIndex) => {
                const numericRowIndex = parseInt(rowIndex, 10);

                acc[numericRowIndex] = Object.keys(selectedCellsContent[numericRowIndex]).reduce((rowAcc, colIndex) => {
                    rowAcc[Number(colIndex)] = '';
                    return rowAcc;
                }, {} as Record<number, string>);

                return acc;
            }, {} as Record<number, Record<number, string>>);

            savePastedContentMutation({ firstCellId: selectedCellsId[0], contents: deletedCellsContent });
        }
    }

    const revertSheetMutation = useRevertSheetMutation(spreadsheet, setSpreadsheet, setSaving);

    const undo = useUndo(ctrlZSheets, ctrlZIndex, setCtrlZIndex, setSpreadsheet, setSaving, setEditingCell, revertSheetMutation, setRowHeights, setColWidths, setHiddenRows, setHiddenCols);
    const onUndo = () => {
        undo();
    };
    
    const redo = useRedo(ctrlZSheets, ctrlZIndex, setCtrlZIndex, setSpreadsheet, setSaving, setEditingCell, revertSheetMutation, setRowHeights, setColWidths, setHiddenRows, setHiddenCols);
    const onRedo = () => {
        redo();
    };

    useEffect(() => {
        // horrible way to determine if the ctrl+v is from the website
        const handleClipboardPaste = async (e: KeyboardEvent) => {
            const clipboardText = await navigator.clipboard.readText();

            if (!clipboardText.startsWith("IHMLegend.ary") && !clipboardText.startsWith("ihmlegend.ary")) {
                return;
            }

            e.preventDefault();
            onPaste();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key) {
                switch (e.key.toLowerCase()) {
                    case 'c':
                        e.preventDefault();
                        onCopy();
                        break;
                    case 'v':
                        handleClipboardPaste(e);
                        break;
                    case 'z':
                        e.preventDefault();
                        onUndo();
                        break;
                    case 'y':
                        e.preventDefault();
                        onRedo();
                        break;
                    default:
                        break;
                }
            }

            else if (e.key === 'Delete') {
                e.preventDefault();
                onDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCopy, onPaste, onUndo, onRedo, onDelete]);

    // Render nothing
    return null;
};

export default KeyboardListener;
