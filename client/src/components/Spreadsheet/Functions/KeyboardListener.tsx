import React, { useEffect, useState } from "react";
import { Sheet, Spreadsheet } from "./Types";
import type { SelectedCellsContent } from "../../../pages/SpreadsheetPage";
import { useMutation } from "react-query";
import { useInfo } from "../../InfoContext";
import { updatePastedCellsContent } from "./CellFetch";
import { revertSheet } from "./SheetFetch";

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
}

const KeyboardListener: React.FC<KeyboardListenerProps> = ({ setSaving, spreadsheet, setSpreadsheet, selectedCellsId, selectedCellsContent,
    editingCellRef, setEditingCell, updateCtrlZMemory, ctrlZSheets, ctrlZIndex, setCtrlZIndex,
}) => {
    const { setInfo } = useInfo();
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


    const { mutate: saveCellContentMutation } = useMutation(updatePastedCellsContent, {
        onSuccess: (updatedSheet) => {
            setSaving(false);

            setSpreadsheet((prevSpreadsheet) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating cell content:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const onPaste = async () => {
        if(!canEdit) {
            return;
        }

        if (selectedCellsId.length !== 0 && Object.keys(copiedCellsContent).length > 0) {
            editingCellRef.current = null; // instantly. Avoid saving after 2s
            setEditingCell(null); // async, updates after saveCellContent finishes, on the next re-render or smth
            saveCellContentMutation({ firstCellId: selectedCellsId[0], contents: copiedCellsContent });
        }
    };

    const onDelete = async () => {
        if(!canEdit) {
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

            saveCellContentMutation({ firstCellId: selectedCellsId[0], contents: deletedCellsContent });
        }
    }


    // Duplicated code unfortunately in SpreadsheetUtilities
    // Too many hooks rendered if function passed by props
    const { mutate: revertSheetMutation } = useMutation(revertSheet, {
        onSuccess: (updatedSheet) => {
            setSaving(false);

            setSpreadsheet((prevSpreadsheet) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet
                };
            });
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating cell content:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        }
    });

    const onUndo = async () => {
        if (ctrlZSheets === null || ctrlZIndex === null || !canEdit) {
            return;
        }

        setCtrlZIndex((prevIndex) => {
            const newIndex = prevIndex !== null && prevIndex > 0 ? prevIndex - 1 : 0;

            const sheetToRevert = ctrlZSheets[newIndex];
            if (sheetToRevert) {
                setSaving(true);
                setEditingCell(null);
                revertSheetMutation({ sheetId: sheetToRevert.id, sheet: sheetToRevert });
            }

            return newIndex;
        });
    };


    const onRedo = async () => {
        if (ctrlZSheets === null || ctrlZIndex === null || ctrlZIndex >= ctrlZSheets.length - 1 || !canEdit) {
            return;
        }

        setCtrlZIndex((prevIndex) => {
            const newIndex = prevIndex !== null ? prevIndex + 1 : 0;

            const nextSheet = ctrlZSheets[newIndex];
            if (nextSheet) {
                setSaving(true);
                setEditingCell(null);
                revertSheetMutation({ sheetId: nextSheet.id, sheet: nextSheet });
            }

            return newIndex;
        });
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
