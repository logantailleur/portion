'use client';

import type { MealType } from '@/lib/calorieDistribution';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export type MealSectionEntry = {
  id: string;
  foodName: string;
  calories: number;
};

export type MealSectionProps = {
  mealType: MealType;
  entries: MealSectionEntry[];
  mealCalorieTarget: number;
  onLogClick?: () => void;
};

const MEAL_TITLES: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function MealSection({
  mealType,
  entries,
  mealCalorieTarget,
  onLogClick,
}: MealSectionProps) {
  const consumed = entries.reduce((sum, e) => sum + e.calories, 0);
  const title = MEAL_TITLES[mealType];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        boxShadow: (t) =>
          t.palette.mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}
    >
      <Stack spacing={0}>
        {/* Header: title + calories */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {consumed} / {mealCalorieTarget} cal
            </Typography>
          </Stack>
        </Box>

        {/* Log button */}
        {onLogClick && (
          <Box sx={{ px: 2, pb: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onLogClick}
              sx={{ borderRadius: 2.5, textTransform: 'none' }}
            >
              Log
            </Button>
          </Box>
        )}

        {/* Entry list */}
        {entries.length > 0 ? (
          <List disablePadding sx={{ pt: 0, pb: 1 }}>
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                disablePadding
                sx={{
                  px: 2,
                  py: 0.75,
                  '&:not(:last-child)': {
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                  },
                }}
              >
                <ListItemText
                  primary={entry.foodName}
                  primaryTypographyProps={{
                    variant: 'body2',
                  }}
                  secondary={`${entry.calories} cal`}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              No entries yet
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
