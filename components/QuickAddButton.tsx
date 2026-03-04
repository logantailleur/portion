'use client';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

export type QuickAddButtonProps = {
  href: string;
};

export function QuickAddButton({ href }: QuickAddButtonProps) {
  return (
    <Box sx={{ py: 1.5, px: 0 }}>
      <Button
        component={NextLink}
        href={href}
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        sx={{ borderRadius: 2.5, textTransform: 'none' }}
      >
        <Typography variant="body2" component="span">
          Add log
        </Typography>
      </Button>
    </Box>
  );
}
