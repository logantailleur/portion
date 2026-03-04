'use client';

import type { MealType } from '@/lib/calorieDistribution';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useEffect, useState } from 'react';

export type MoveEntryDialogProps = {
  open: boolean;
  onClose: () => void;
  currentMealType: MealType;
  mealOptions: { value: MealType; label: string }[];
  onSelect: (mealType: MealType) => void | Promise<void>;
};

export function MoveEntryDialog({
  open,
  onClose,
  currentMealType,
  mealOptions,
  onSelect,
}: MoveEntryDialogProps) {
  const [selected, setSelected] = useState<MealType>(currentMealType);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelected(currentMealType);
  }, [open, currentMealType]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSelect(selected);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Move to</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="move-meal-label">Meal</InputLabel>
            <Select
              labelId="move-meal-label"
              value={selected}
              label="Meal"
              onChange={(e) => setSelected(e.target.value as MealType)}
            >
              {mealOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || selected === currentMealType}
        >
          {submitting ? 'Moving…' : 'Move'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
