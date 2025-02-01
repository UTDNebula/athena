import { styled, TableSortLabel } from '@mui/material';

//Change arrow color for TableSortLabel
const StyledTableSortLabel = styled(TableSortLabel)({
  '& .MuiTableSortLabel-icon': {
    opacity: 0.5, // Ensure the arrow is always visible
  },
  '&.Mui-active .MuiTableSortLabel-icon': {
    color: 'var(--mui-palette-text-primary)', // Brighten the arrow
  },
});

export default StyledTableSortLabel;
