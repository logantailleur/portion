'use client';

import type { MealType } from '@/lib/calorieDistribution';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

/** Calories from macros: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat */
function caloriesFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(4 * protein + 4 * carbs + 9 * fat);
}

export type ManualLogFormProps = {
  defaultMeal: MealType;
};

export default function ManualLogForm({ defaultMeal }: ManualLogFormProps) {
  const router = useRouter();
  const [foodName, setFoodName] = useState('');
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');
  const [mealType, setMealType] = useState<MealType>(defaultMeal);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calories = useMemo(() => {
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    return caloriesFromMacros(p, c, f);
  }, [protein, carbs, fat]);

  function validate(): boolean {
    if (!foodName.trim()) {
      setError('Food name is required');
      return false;
    }
    const p = Number(protein);
    const c = Number(carbs);
    const f = Number(fat);
    if (Number.isNaN(p) || p < 0 || Number.isNaN(c) || c < 0 || Number.isNaN(f) || f < 0) {
      setError('Protein, carbs, and fat must be non-negative numbers');
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    const p = Number(protein);
    const c = Number(carbs);
    const f = Number(fat);
    setSubmitting(true);
    try {
      const res = await fetch('/api/log-entry/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: foodName.trim(),
          protein: p,
          carbs: c,
          fat: f,
          mealType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? 'Something went wrong');
        return;
      }
      router.push('/today');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}
    >
      <Stack spacing={2.5}>
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
          <InputLabel id="meal-label">Meal</InputLabel>
          <Select
            labelId="meal-label"
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
        >
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
            py: 2,
            px: 2,
            textAlign: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Calculated calories
          </Typography>
          <Typography variant="h4" component="p" fontWeight={600}>
            {calories}
            <Typography component="span" variant="h6" color="text.secondary" fontWeight={400}>
              {' '}
              kcal
            </Typography>
          </Typography>
        </Paper>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          fullWidth
          size="medium"
        >
          {submitting ? 'Adding…' : 'Add entry'}
        </Button>
      </Stack>
    </Box>
  );
}
