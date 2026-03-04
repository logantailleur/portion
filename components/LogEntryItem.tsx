'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { MealType } from '@/lib/calorieDistribution';
import { MoveEntryDialog } from '@/components/MoveEntryDialog';

export type LogEntryItemProps = {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  currentMealType: MealType;
};

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export function LogEntryItem({
  id,
  foodName,
  calories,
  protein,
  carbs,
  fat,
  currentMealType,
}: LogEntryItemProps) {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  const handleMoveClick = useCallback(() => {
    closeMenu();
    setMoveOpen(true);
  }, [closeMenu]);

  const handleMoveSubmit = useCallback(
    async (mealType: MealType) => {
      const res = await fetch(`/api/log-entry/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealType }),
      });
      if (!res.ok) return;
      setMoveOpen(false);
      router.refresh();
    },
    [id, router]
  );

  const handleDelete = useCallback(async () => {
    closeMenu();
    const res = await fetch(`/api/log-entry/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    router.refresh();
  }, [id, closeMenu, router]);

  const handleEdit = useCallback(() => {
    closeMenu();
    // Placeholder for future edit flow
  }, [closeMenu]);

  const macroSummary = `P ${protein} · C ${carbs} · F ${fat}`;

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          px: 2,
          py: 1,
          alignItems: 'flex-start',
          '&:not(:last-child)': {
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
            {foodName}
          </Typography>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.25 }}
          >
            {macroSummary}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            fontWeight={600}
            color="text.primary"
            sx={{ display: 'block', mt: 0.25 }}
          >
            {calories} cal
          </Typography>
        </Box>
        <ListItemSecondaryAction sx={{ top: 12, right: 8 }}>
          <IconButton
            edge="end"
            size="small"
            aria-label="Options"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { minWidth: 160 } } }}
          >
            <MenuItem onClick={handleEdit} disabled>
              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
            </MenuItem>
            <MenuItem onClick={handleMoveClick}>
              <SwapHorizIcon fontSize="small" sx={{ mr: 1 }} /> Move
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
      <MoveEntryDialog
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        currentMealType={currentMealType}
        mealOptions={MEAL_OPTIONS}
        onSelect={handleMoveSubmit}
      />
    </>
  );
}
