import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface SelectorProps {
  theme: string;
  defaultt?: string; // Optional default value
  label: string;
  name: string;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

const Selector: React.FC<SelectorProps> = ({ theme, defaultt, label, name, options, onChange, disabled }) => {
  const [selectedValue, setSelectedValue] = React.useState<string | number>(defaultt || '');

  // Use MUI's theme breakpoints and media queries
  const muiTheme = useTheme();
  const isSmScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value as string;
    setSelectedValue(value);
    onChange(value);
  };

  React.useEffect(() => {
    if (defaultt) {
      setSelectedValue(defaultt);
    }
  }, [defaultt]);

  return (
    <Box sx={{
      minWidth: isSmScreen ? '65px' : '8rem',
      maxWidth: '100%',
    }}>
      <FormControl size="small" disabled={disabled}
        sx={{
          my: 1,
          minWidth: isSmScreen ? '65px' : '8rem',
          maxWidth: '100%',
          padding: '0px !important',
          "& .MuiInputLabel-root": { color: '#39B645 !important' },
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused": { borderColor: '#39B645 !important' },
            color: theme === 'dark' ? 'white' : 'black',
            "& .MuiOutlinedInput-input": {
              padding: isSmScreen ? '8px 0px !important' : '8px !important', // Adjust padding based on screen size
            }
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
            padding: '0px !important',
            color: theme === 'dark' ? 'white' : 'black',
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