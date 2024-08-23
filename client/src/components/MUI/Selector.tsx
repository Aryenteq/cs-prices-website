import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

interface SelectorProps {
  label: string;
  name: string;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string | number) => void;
}

const Selector: React.FC<SelectorProps> = ({ label, name, options, onChange }) => {
  const [selectedValue, setSelectedValue] = React.useState<string | number>('');

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <Box sx={{
      minWidth: '8rem',
      maxWidth: '100%'
    }}>
      <FormControl
        sx={{
          my: 1,
          minWidth: '8rem',
          maxWidth: '100%',
          padding: '0px',
          "& .MuiInputLabel-root": { color: '#39B645 !important' },
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused": { borderColor: '#39B645 !important' },
            color: 'white',
            padding: '0px 0px',
          },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: '#39B645 !important' },
          "& .MuiSvgIcon-root": { color: '#39B645' },
        }}
      >
        <InputLabel id={`${name}-select-label`} sx={{ paddingLeft: '4px' }}>{label}</InputLabel>
        <Select
          labelId={`${name}-select-label`}
          id={`${name}-select`}
          value={String(selectedValue)}
          label={label}
          onChange={handleChange}
          sx={{
            minWidth: 'auto',
            padding: '0px',
            color: 'white',
            "& .MuiSvgIcon-root": {
              color: '#39B645',
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}
              sx={{
                padding: '4px 8px', // Adjust padding of the dropdown items
                '&.Mui-selected': {
                  backgroundColor: '#39B645', // Background color when selected
                  color: 'white', // Text color when selected
                },
                '&.Mui-selected:hover': {
                  backgroundColor: '#39B645', // Background color when selected and hovered
                  color: 'white', // Text color when selected and hovered
                },
                '&:hover': {
                  backgroundColor: '#39B645' // Background color on hover
                }
              }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Selector;