import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import arrows from "../../media/svgs/arrow-filters.svg";

interface SelectOption {
  label: string;
  value: string | number;
}

interface DialogSelectProps {
  options: {
    label: string;
    value: string | number;
    selectOptions: SelectOption[];
    onChange: React.Dispatch<React.SetStateAction<string | number>>;
  }[];
}

const DialogSelect: React.FC<DialogSelectProps> = ({ options }) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (_: unknown, reason?: string) => {
    if (reason !== 'backdropClick') {
      setOpen(false);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string | number>, index: number) => {
    options[index].onChange(event.target.value);
  };

  return (
    <div>
      <Button onClick={handleClickOpen}>
        <img src={arrows} alt="Order & Sort" />
      </Button>
      <Dialog disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: '#510154', }}>Order & Sort Options</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {options.map((option, index) => (
              <FormControl sx={{
                m: 1,
                minWidth: '8rem',
                maxWidth: '100%',
                padding: '0px',
                "& .MuiInputLabel-root": { color: '#39B645 !important' },
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused": { borderColor: '#39B645 !important' },
                  color: 'black',
                  padding: '0px 0px',
                },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: '#39B645 !important' },
                "& .MuiSvgIcon-root": { color: '#39B645' },
              }} key={index}>
                <InputLabel htmlFor={`dialog-select-${option.label}`}>{option.label}</InputLabel>
                <Select
                  value={option.value}
                  onChange={(event) => handleSelectChange(event, index)}
                  input={<OutlinedInput label={option.label} id={`dialog-select-${option.label}`}
                    sx={{
                      minWidth: 'auto',
                      padding: '0px',
                      color: 'white',
                      "& .MuiSvgIcon-root": {
                        color: '#39B645',
                      },
                    }} />}
                >
                  {option.selectOptions.map((selectOption) => (
                    <MenuItem key={selectOption.value} value={selectOption.value}>
                      {selectOption.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: '#510154', }}>Cancel</Button>
          <Button onClick={handleClose} sx={{ color: '#510154', }}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DialogSelect;