import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useMutation, useQueryClient } from 'react-query';

import csSheet from '../../media/imgs/cs-sheet.png';
import normalSheet from '../../media/imgs/normal-sheet.png';
import edit from "../../media/svgs/edit.svg";
import trash from "../../media/svgs/trash.svg";
import rename from "../../media/svgs/rename.svg";
import newTab from "../../media/svgs/new-tab.svg";

import { formatDate } from "../../utils/formatDate";
import { encryptData } from "../../utils/encrypt";
import { authTokensFetch } from "../../utils/authTokens";
import { useInfo } from "../InfoContext";

interface SpreadsheetItemProps {
    spreadsheet: {
        id: number;
        name: string;
        type: string;
        created: string;
        lastOpened: string;
        updatedAt: string;
        ownerName: string;
        permission: 'EDIT' | 'VIEW';
    };
    openMenuId: number | null;
    handleMenuToggle: (id: number) => void;
}

const SpreadsheetItem: React.FC<SpreadsheetItemProps> = ({ spreadsheet, openMenuId, handleMenuToggle }) => {
    const navigate = useNavigate();
    const { setInfo } = useInfo();
    const isOpen = openMenuId === spreadsheet.id;

    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newName, setNewName] = useState(spreadsheet.name);

    const queryClient = useQueryClient();

    // Rename mutation
    const renameMutation = useMutation(async () => {
        const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheet.id}/name`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newName }),
        });
        return data;
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('spreadsheets');
            setRenameDialogOpen(false);
        },
        onError: (error: any) => {
            setInfo({ message: error.message, isError: true });
            if (error.status !== 401) {
                console.error('Error renaming spreadsheet:', error);
            }
        },
    });

    // Delete mutation
    const deleteMutation = useMutation(async () => {
        const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheet.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return data;
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('spreadsheets');
            setDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            setInfo({ message: error.message, isError: true });
            if (error.status !== 401) {
                console.error('Error deleting spreadsheet:', error);
            }
        },
    });

    const handleItemClick = () => {
        const spreadsheetId = spreadsheet.id;
        const encodedInfo = encodeURIComponent(encryptData(`${spreadsheetId}`));
        navigate(`/spreadsheet/${encodedInfo}`);
    };

    const toggleMenu = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        handleMenuToggle(spreadsheet.id);
    };

    const handleRename = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        setRenameDialogOpen(true);
        handleMenuToggle(spreadsheet.id);
    };

    const handleDeleteOrRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        setDeleteDialogOpen(true);
        handleMenuToggle(spreadsheet.id);
    };

    const handleOpenInNewTab = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        const spreadsheetId = spreadsheet.id;
        const encodedInfo = encodeURIComponent(encryptData(`${spreadsheetId}`));
        window.open(`/spreadsheet/${encodedInfo}`, '_blank');
        handleMenuToggle(spreadsheet.id);
    };

    return (
        <div className="relative flex my-3 cursor-pointer hover:bg-secondary-dark p-2" onClick={handleItemClick}>
            <div className="flex w-9/20 gap-2">
                <img src={spreadsheet.type === 'NORMAL' ? normalSheet : csSheet} alt="Sheet" className="w-6 h-6" />
                <p className="truncate">{spreadsheet.name}</p>
            </div>

            <p className="w-1/6 truncate">{formatDate(spreadsheet.lastOpened)}</p>
            <p className="w-1/6 truncate">{spreadsheet.ownerName}</p>
            <p className="w-1/6 truncate">{spreadsheet.type}</p>
            <button className="w-1/20 relative" onClick={toggleMenu}>
                <img src={edit} alt="Options" className="ml-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
                    {spreadsheet.permission === 'EDIT' &&
                        <button
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                            onClick={handleRename}
                        >
                            <img src={rename} alt="Rename" className="mr-2" />
                            Rename
                        </button>}
                    <button
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        onClick={handleDeleteOrRemove}
                    >
                        <img src={trash} alt="Trash" className="mr-2" />
                        {spreadsheet.permission === 'EDIT' ? "Delete" : "Remove"}
                    </button>
                    <button
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        onClick={handleOpenInNewTab}
                    >
                        <img src={newTab} alt="New tab" className="mr-2" />
                        Open in new tab
                    </button>
                </div>
            )}

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}
                onClick={(e) => e.stopPropagation()}>
                <DialogTitle>Rename Spreadsheet</DialogTitle>
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
                    <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => renameMutation.mutate()}>Ok</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}
                onClick={(e) => e.stopPropagation()}>
                <DialogTitle>Delete Spreadsheet</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this spreadsheet? This action can not be reversed.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => deleteMutation.mutate()}>Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default SpreadsheetItem;