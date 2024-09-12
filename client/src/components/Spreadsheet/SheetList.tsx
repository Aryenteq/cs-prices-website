import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { SketchPicker } from 'react-color';
import { sketchColors } from "./Functions/Utils";

import { getSheet, addSheet, deleteSheet, setName, setIndex, setColor } from "./Functions/SheetFetch";
import { useInfo } from "../InfoContext";
import type { SheetInfo, Spreadsheet, Sheet } from "./Functions/Types";
import { encryptData } from "../../utils/encrypt";
import ContextMenu from "./ContextMenu";
import { Typography } from "@mui/material";



const SheetList: React.FC<{
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    spreadsheet: Spreadsheet | undefined;
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>;
    updateCtrlZMemory: (updatedSheet: any) => void;
}> = ({
    setSaving,
    spreadsheet,
    setSpreadsheet,
    updateCtrlZMemory
}) => {
        const { setInfo } = useInfo();
        const navigate = useNavigate();
        const [contextMenu, setContextMenu] = useState<{ x: number; y: number; sheetId: number } | null>(null);
        const canEdit = spreadsheet!.permission !== 'VIEW';

        const [renameDialogOpen, setRenameDialogOpen] = useState<boolean>(false);
        const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
        const [indexDialogOpen, setIndexDialogOpen] = useState<boolean>(false);
        const [colorDialogOpen, setColorDialogOpen] = useState<boolean>(false);

        const [currentSheetId, setCurrentSheetId] = useState<number>(0);
        const [currentRightClickedSheetId, setCurrentRightClickedSheetId] = useState<number>(0);
        const [newName, setNewName] = useState<string>('');
        const [newColor, setNewColor] = useState<string>('');
        const [newIndex, setNewIndex] = useState<number>(1); // normalized for users

        useEffect(() => {
            if (spreadsheet!.sheet) {
                setCurrentSheetId(spreadsheet!.sheet.id);
            }
        }, [spreadsheet]);

        const { mutate: changeSheetMutation } = useMutation(
            async ({ sheetId }: { sheetId: number }) => {
                return await getSheet(sheetId);
            },
            {
                onSuccess: (updatedSheet) => {
                    setSaving(false);
                    setSpreadsheet((prevSpreadsheet) => {
                        if (!prevSpreadsheet) {
                            return prevSpreadsheet;
                        }

                        return {
                            ...prevSpreadsheet,
                            sheet: updatedSheet,
                        };
                    });

                    setCurrentSheetId(updatedSheet.id);
                    const encodedInfo = encodeURIComponent(encryptData(`${updatedSheet.spreadsheetId}?index=${updatedSheet.index}`));
                    navigate(`/spreadsheet/${encodedInfo}`);
                    updateCtrlZMemory(updatedSheet);
                },
                onError: (error: any) => {
                    let errorMessage = 'Something went wrong getting the sheet. Try again';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    if (error.status !== 401) {
                        console.error('Error getting sheet:', errorMessage);
                    }
                    setInfo({ message: errorMessage, isError: true });
                }
            }
        );

        const updateSheetInfo = (prevSpreadsheet: Spreadsheet, updatedSheet: Sheet): Spreadsheet => {
            if (!prevSpreadsheet) {
                return prevSpreadsheet;
            }

            const newSheetInfo: SheetInfo = {
                id: updatedSheet.id,
                name: updatedSheet.name,
                index: updatedSheet.index,
                color: updatedSheet.color,
            };

            const updatedSheetsInfo = prevSpreadsheet.sheetsInfo.map(sheet =>
                sheet.id === updatedSheet.id ? newSheetInfo : sheet
            );

            const sheetExists = prevSpreadsheet.sheetsInfo.some(sheet => sheet.id === updatedSheet.id);
            const finalSheetsInfo = sheetExists
                ? updatedSheetsInfo
                : [...updatedSheetsInfo, newSheetInfo];

            return {
                ...prevSpreadsheet,
                sheet: updatedSheet,
                sheetsInfo: finalSheetsInfo,
            };
        };

        const { mutate: addSheetMutation } = useMutation(
            (params: { spreadsheetId: number; index: number, name: string }) => addSheet(params),
            {
                onSuccess: (updatedSheet) => {
                    setSaving(false);
                    setSpreadsheet((prevSpreadsheet) => {
                        const newSpreadsheet = updateSheetInfo(prevSpreadsheet!, updatedSheet);
                        return newSpreadsheet;
                    });
                    updateCtrlZMemory(updatedSheet);
                },
                onError: (error: any) => {
                    let errorMessage = 'Something went wrong creating the sheet. Try again';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    if (error.status !== 401) {
                        console.error('Error creating sheet:', errorMessage);
                    }
                    setInfo({ message: errorMessage, isError: true });
                },
            }
        );

        const { mutate: renameSheetMutation } = useMutation(
            ({ sheetId, newName }: { sheetId: number; newName: string }) => setName({ sheetId, name: newName }),
            {
                onSuccess: (updatedSheet) => {
                    setSaving(false);
                    setSpreadsheet((prevSpreadsheet) =>
                        updateSheetInfo(prevSpreadsheet!, updatedSheet)
                    );
                    updateCtrlZMemory(updatedSheet);
                },
                onError: (error: any) => {
                    let errorMessage = 'Something went wrong renaming the sheet. Try again';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    if (error.status !== 401) {
                        console.error('Error renaming sheet:', errorMessage);
                    }
                    setInfo({ message: errorMessage, isError: true });
                },
            }
        );

        const { mutate: deleteSheetMutation } = useMutation(
            ({ sheetId }: { sheetId: number }) => deleteSheet(sheetId),
            {
                onSuccess: (deletedSheet) => {
                    setSaving(false);
                    setSpreadsheet((prevSpreadsheet) => {
                        if (!prevSpreadsheet) return prevSpreadsheet;

                        const updatedSheetsInfo = prevSpreadsheet.sheetsInfo.filter(
                            (sheet) => sheet.id !== deletedSheet.sheetId
                        );

                        const newSheetId = updatedSheetsInfo.length > 0 ? updatedSheetsInfo[0].id : null;

                        return {
                            ...prevSpreadsheet,
                            sheet: newSheetId ? { ...prevSpreadsheet.sheet, id: newSheetId } : prevSpreadsheet.sheet,
                            sheetsInfo: updatedSheetsInfo,
                        };
                    });

                    setTimeout(() => {
                        if (spreadsheet!.sheetsInfo.length > 0) {
                            changeSheetMutation({ sheetId: spreadsheet!.sheetsInfo[0].id });
                        }
                    }, 0);
                },
                onError: (error: any) => {
                    let errorMessage = 'Something went wrong deleting the sheet. Try again';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    if (error.status !== 401) {
                        console.error('Error deleting sheet:', errorMessage);
                    }
                    setInfo({ message: errorMessage, isError: true });
                },
            }
        );

        const { mutate: indexSheetMutation } = useMutation(
            ({ sheetId, newIndex }: { sheetId: number; newIndex: number }) => setIndex({ sheetId, newIndex }),
            {
                onSuccess: (updatedSheetsInfo) => {
                    setSaving(false);
                    setSpreadsheet((prevSpreadsheet) => {
                        if (!prevSpreadsheet)
                            return prevSpreadsheet;
                        return {
                            ...prevSpreadsheet,
                            sheetsInfo: updatedSheetsInfo,
                        };
                    }
                    );

                    setTimeout(() => {
                        if (spreadsheet!.sheetsInfo.length > 0) {
                            changeSheetMutation({ sheetId: currentSheetId });
                        }
                    }, 0);
                },
                onError: (error: any) => {
                    let errorMessage = 'Something went wrong renaming the sheet. Try again';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    if (error.status !== 401) {
                        console.error('Error renaming sheet:', errorMessage);
                    }
                    setInfo({ message: errorMessage, isError: true });
                },
            }
        );

        const { mutate: colorSheetMutation } = useMutation(
            ({ sheetId, newColor }: { sheetId: number; newColor: string }) => setColor({ sheetId, color: newColor }),
            {
                onSuccess: (updatedSheet) => {
                    setSaving(false);
                    setSpreadsheet((prevSpreadsheet) =>
                        updateSheetInfo(prevSpreadsheet!, updatedSheet)
                    );
                    updateCtrlZMemory(updatedSheet);
                },
                onError: (error: any) => {
                    let errorMessage = 'Something went wrong recoloring the sheet. Try again';

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }

                    if (error.status !== 401) {
                        console.error('Error recoloring sheet:', errorMessage);
                    }
                    setInfo({ message: errorMessage, isError: true });
                },
            }
        );

        const handleRightClick = (e: React.MouseEvent, sheetId: number, sheetName: string, sheetColor: string, sheetIndex: number) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, sheetId });
            setCurrentRightClickedSheetId(sheetId);
            setNewName(sheetName);
            setNewColor(sheetColor);
            setNewIndex(sheetIndex + 1);
        };

        const handleContextMenuClick = (option: string) => {
            if (contextMenu) {

                switch (option) {
                    case "Rename Sheet":
                        setRenameDialogOpen(true);
                        break;
                    case "Delete Sheet":
                        setDeleteDialogOpen(true);
                        break;
                    case "Change Index":
                        setIndexDialogOpen(true);
                        break;
                    case "Change Color":
                        setColorDialogOpen(true);
                        break;
                    default:
                        break;
                }
            }
            setContextMenu(null);
        };

        const handleRenameConfirm = () => {
            setSaving(true);
            renameSheetMutation({ sheetId: currentRightClickedSheetId, newName });
            setRenameDialogOpen(false);
            setContextMenu(null);
        };

        const handleDeleteConfirm = () => {
            setSaving(true);
            deleteSheetMutation({ sheetId: currentRightClickedSheetId });
            setDeleteDialogOpen(false);
            setContextMenu(null);
        };

        const handleIndexConfirm = () => {
            setSaving(true);
            indexSheetMutation({ sheetId: currentRightClickedSheetId, newIndex: newIndex - 1 });
            setIndexDialogOpen(false);
            setContextMenu(null);
        };

        const handleColorConfirm = () => {
            setSaving(true);
            colorSheetMutation({ sheetId: currentRightClickedSheetId, newColor });
            setColorDialogOpen(false);
            setContextMenu(null);
        };

        const handleColorChange = (color: any) => {
            setNewColor(color.hex);
        }


        return (
            <div className="w-full h-[170px] flex overflow-x-auto custom-scrollbar items-center gap-1">
                {canEdit &&
                    <button className="h-7 w-7 mx-2 flex-shrink-0 flex justify-center bg-primary rounded-lg" title="New sheet"
                        onClick={() =>
                            addSheetMutation({
                                spreadsheetId: spreadsheet!.id,
                                index: spreadsheet!.sheetsInfo.length,
                                name: `Sheet ${spreadsheet!.sheetsInfo.length + 1}`
                            })
                        }>
                        +
                    </button>
                }

                {spreadsheet!.sheetsInfo
                    ?.sort((a, b) => a.index - b.index)
                    .map((sheetInfo) => {
                        return (
                            <div
                                key={sheetInfo.id}
                                className={`h-full min-w-32 fit-content flex-shrink-0 flex items-center justify-center border-b-4 truncate outline outline-1 outline-gray-500
                                        outline-offset-[-1px] cursor-pointer px-3
                                        ${sheetInfo.id === currentSheetId ? 'bg-primary-lightest text-black' : ''}`}
                                style={{ borderBottomColor: sheetInfo.color }}
                                onClick={() => changeSheetMutation({ sheetId: sheetInfo.id })}
                                onContextMenu={(e) => handleRightClick(e, sheetInfo.id, sheetInfo.name, sheetInfo.color, sheetInfo.index)}
                            >
                                {sheetInfo.name}
                            </div>
                        );
                    })}

                {contextMenu && canEdit && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        options={[
                            'Rename Sheet',
                            ...(spreadsheet!.sheetsInfo.length > 1 ? ['Delete Sheet'] : []),
                            ...(spreadsheet!.sheetsInfo.length > 1 ? ['Change Index'] : []),
                            'Change Color'
                        ]}
                        onClick={handleContextMenuClick}
                        onClose={() => setContextMenu(null)}
                    />
                )}

                {/* Rename Dialog */}
                <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} onClick={(e) => e.stopPropagation()}>
                    <DialogTitle sx={{ color: '#510154', }}>Rename Sheet</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="New Name"
                            type="text"
                            fullWidth
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRenameDialogOpen(false)} sx={{ color: '#510154', }}>Cancel</Button>
                        <Button onClick={handleRenameConfirm} sx={{ color: '#510154', }}>Ok</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onClick={(e) => e.stopPropagation()}>
                    <DialogTitle sx={{ color: '#510154', }}>Delete Sheet</DialogTitle>
                    <DialogContent sx={{ color: '#510154', }}>
                        Are you sure you want to delete this sheet? This action cannot be reversed.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#510154', }}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} sx={{ color: '#510154', }}>Delete</Button>
                    </DialogActions>
                </Dialog>

                {/* Change Index Dialog */}
                <Dialog open={indexDialogOpen} onClose={() => setIndexDialogOpen(false)} onClick={(e) => e.stopPropagation()}>
                    <DialogTitle sx={{ color: '#510154', }}>Change Sheet Index</DialogTitle>
                    <Typography align="center" gutterBottom color="textSecondary">
                        {`Index can be between 1 and ${SheetList.length + 1}`}
                    </Typography>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="New Index"
                            type="number"
                            fullWidth
                            value={newIndex}
                            onChange={(e) => setNewIndex(Number(e.target.value))}
                            inputProps={{
                                min: 1,
                                max: spreadsheet!.sheetsInfo.length,
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIndexDialogOpen(false)} sx={{ color: '#510154', }}>Cancel</Button>
                        <Button onClick={handleIndexConfirm} sx={{ color: '#510154', }}>Ok</Button>
                    </DialogActions>
                </Dialog>

                {/* Color Dialog */}
                <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)} onClick={(e) => e.stopPropagation()}>
                    <DialogTitle sx={{ color: '#510154', }}>Recolor Sheet</DialogTitle>
                    <DialogContent>
                        <SketchPicker
                            color={newColor}
                            onChangeComplete={handleColorChange}
                            disableAlpha
                            presetColors={sketchColors}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setColorDialogOpen(false)} sx={{ color: '#510154', }}>Cancel</Button>
                        <Button onClick={handleColorConfirm} sx={{ color: '#510154', }}>Ok</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    };

export default SheetList;