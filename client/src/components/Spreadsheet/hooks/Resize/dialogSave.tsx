import { useState } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';

export const useDialogSave = (
    setRowHeights: Function,
    setColWidths: Function,
    updateRowHeightMutation: Function,
    updateColWidthMutation: Function,
    setSaving: Function,
    spreadsheet: Spreadsheet
) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [resizeType, setResizeType] = useState<'row' | 'col' | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);

    const handleDialogSave = (newSize: number) => {
        console.log(newSize); // returns correct
        console.log(currentIndex);
        if (resizeType === 'row' && currentIndex !== null) {
            setRowHeights((prevHeights: number[]) => {
                const newHeights = [...prevHeights];
                newHeights[currentIndex] = newSize;

                setSaving(true);
                updateRowHeightMutation({
                    sheetId: spreadsheet!.sheet.id,
                    rowIndex: currentIndex,
                    height: newSize
                });
                return newHeights;
            });
        } else if (resizeType === 'col' && currentIndex !== null) {
            console.log(newSize);
            setColWidths((prevWidths: number[]) => {
                const newWidths = [...prevWidths];
                newWidths[currentIndex] = newSize;

                setSaving(true);
                updateColWidthMutation({
                    sheetId: spreadsheet!.sheet.id,
                    colIndex: currentIndex,
                    width: newSize
                });
                return newWidths;
            });
        }
        setDialogOpen(false);
    };

    const openDialog = (type: 'row' | 'col', index: number) => {
        setResizeType(type);
        setCurrentIndex(index);
        setDialogOpen(true);
    };

    return {
        dialogOpen,
        openDialog,
        handleDialogSave,
        setDialogOpen,
    };
};