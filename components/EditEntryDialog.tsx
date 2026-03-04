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
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

/** Calories from macros: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat */
function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(4 * protein + 4 * carbs + 9 * fat);
}

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export type EditEntryFormValues = {
  id: string;
  foodName: string;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
};

export type EditEntryDialogProps = {
  open: boolean;
  onClose: () => void;
  entry: EditEntryFormValues;
  onSaved?: () => void;
};

export function EditEntryDialog({
  open,
  onClose,
  entry,
  onSaved,
}: EditEntryDialogProps) {
  const [foodName, setFoodName] = useState(entry.foodName);
  const [protein, setProtein] = useState(
    entry.protein === 0 ? '' : String(entry.protein)
  );
  const [carbs, setCarbs] = useState(
    entry.carbs === 0 ? '' : String(entry.carbs)
  );
  const [fat, setFat] = useState(entry.fat === 0 ? '' : String(entry.fat));
  const [mealType, setMealType] = useState<MealType>(entry.mealType);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFoodName(entry.foodName);
      setProtein(entry.protein === 0 ? '' : String(entry.protein));
      setCarbs(entry.carbs === 0 ? '' : String(entry.carbs));
      setFat(entry.fat === 0 ? '' : String(entry.fat));
      setMealType(entry.mealType);
      setError(null);
    }
  }, [
    open,
    entry.id,
    entry.foodName,
    entry.protein,
    entry.carbs,
    entry.fat,
    entry.mealType,
  ]);

  const calories = useMemo(() => {
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    return caloriesFromMacros(p, c, f);
  }, [protein, carbs, fat]);

  const resetForm = () => {
    setFoodName(entry.foodName);
    setProtein(entry.protein === 0 ? '' : String(entry.protein));
    setCarbs(entry.carbs === 0 ? '' : String(entry.carbs));
    setFat(entry.fat === 0 ? '' : String(entry.fat));
    setMealType(entry.mealType);
    setError(null);
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!foodName.trim()) {
      setError('Food name is required');
      return;
    }
    const p = Number(protein);
    const c = Number(carbs);
    const f = Number(fat);
    if (Number.isNaN(p) || p < 0 || Number.isNaN(c) || c < 0 || Number.isNaN(f) || f < 0) {
      setError('Protein, carbs, and fat must be non-negative numbers');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/log-entry/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          foodName: foodName.trim(),
          protein: p,
          carbs: c,
          fat: f,
          mealType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Update failed');
        return;
      }
      onClose();
      onSaved?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit entry</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Food name"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
              fullWidth
              autoFocus
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="edit-meal-label">Meal</InputLabel>
              <Select
                labelId="edit-meal-label"
                value={mealType}
                label="Meal"
                onChange={(e) => setMealType(e.target.value as MealType)}
              >
                {MEAL_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2} useFlexGap>
              <TextField
                label="Protein (g)"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Carbs (g)"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Fat (g)"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
                fullWidth
                size="small"
              />
            </Stack>
            <Paper
              variant="outlined"
              sx={{
                py: 1.5,
                px: 2,
                textAlign: 'center',
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Calculated calories
              </Typography>
              <Typography variant="h5" component="p" fontWeight={600}>
                {calories}{' '}
                <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
                  kcal
                </Typography>
              </Typography>
            </Paper>
            {error && (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
