import React, { useEffect, useState } from "react";
import { Spreadsheet } from "./Types";
import type { SelectedCellsContent } from "../../../pages/SpreadsheetPage";
import { useMutation } from "react-query";
import { useInfo } from "../../InfoContext";
import { updatePastedCellsContent } from "./CellFetch";

interface KeyboardListenerProps {
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>;
    selectedCellsId: number[];
    selectedCellsContent: SelectedCellsContent;
    setEditingCell: React.Dispatch<React.SetStateAction<{ id: number, row: number, col: number } | null>>;
}

const KeyboardListener: React.FC<KeyboardListenerProps> = ({ setSaving, setSpreadsheet, selectedCellsId, selectedCellsContent,
    setEditingCell
}) => {
    const { setInfo } = useInfo();
    const [copiedCellsContent, setCopiedCellsContent] = useState<SelectedCellsContent>({});

    const onCopy = () => {
        setCopiedCellsContent(() => {
            return selectedCellsContent;
        });

        // normalize text to copy on clipboard
        const concatenatedContent = Object.keys(selectedCellsContent)
            .map(rowIndex => {
                const numericRowIndex = parseInt(rowIndex, 10);
                return Object.values(selectedCellsContent[numericRowIndex])
                    .filter(content => content !== null)
                    .join('\t');
            })
            .join('\n');

        navigator.clipboard.writeText(concatenatedContent).catch(err => {
            console.error("Failed to copy to clipboard: ", err);
        });
    }

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
        if (selectedCellsId.length !== 0 && Object.keys(copiedCellsContent).length > 0) {
            setEditingCell(null);
            saveCellContentMutation({ firstCellId: selectedCellsId[0], contents: copiedCellsContent });
        }
    };

    const onUndo = async () => {

    }

    const onRedo = async () => {

    }
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key) {
                switch (e.key.toLowerCase()) {
                    case 'c':
                        e.preventDefault();
                        onCopy();
                        break;
                    case 'v':
                        e.preventDefault();
                        onPaste();
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
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onCopy, onPaste, onUndo, onRedo]);

    // Render nothing
    return null;
};

export default KeyboardListener;
