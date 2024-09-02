import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Typography } from '@mui/material';

interface ResizeDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (newSize: number) => void;
    minSize: number;
    title: string;
    defaultValue: number;
    setInfo: (info: { message: string; isError?: boolean } | null) => void;
}

const ResizeDialog: React.FC<ResizeDialogProps> = ({ open, onClose, onSave, minSize, title, defaultValue, setInfo }) => {
    const [inputValue, setInputValue] = useState(defaultValue);

    // needed to get the correct current value (re-render)
    useEffect(() => {
        setInputValue(defaultValue);
    }, [defaultValue]);

    const handleSave = () => {
        if (inputValue >= minSize) {
            onSave(inputValue);
        } else {
            setInfo({ message: `Size cannot be under ${minSize}px`, isError: true });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{color: '#510154',}}>{title}</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom sx={{color: '#510154',}}>
                    {`The default value is ${title === 'Resize Row' ? 21 : 100}px.`}
                </Typography>

                <TextField
                    autoFocus
                    margin="dense"
                    label="New Size (px)"
                    type="number"
                    fullWidth
                    value={inputValue}
                    onChange={(e) => setInputValue(Number(e.target.value))}
                    onKeyDown={handleKeyDown}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{color: '#510154',}}>Cancel</Button>
                <Button onClick={handleSave} sx={{color: '#510154',}}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ResizeDialog;