'use client';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export type QuickAddBarProps = {
  onLogClick?: () => void;
};

export function QuickAddBar({ onLogClick }: QuickAddBarProps) {
  return (
    <Box sx={{ py: 1.5, px: 0 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={onLogClick}
        sx={{ borderRadius: 2.5, textTransform: 'none' }}
      >
        <Typography variant="body2" component="span">
          Log
        </Typography>
      </Button>
    </Box>
  );
}
