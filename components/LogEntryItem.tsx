'use client';

import { EditEntryDialog } from '@/components/EditEntryDialog';
import type { MealType } from '@/lib/calorieDistribution';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export type LogEntry = {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type LogEntryItemProps = {
  entry: LogEntry;
  currentMealType: MealType;
};

export function LogEntryItem({ entry, currentMealType }: LogEntryItemProps) {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const closeMenu = useCallback(() => setMenuAnchor(null), []);

  const handleDelete = useCallback(async () => {
    closeMenu();
    setIsDeleting(true);
    try {
      const res = await fetch('/api/log-entry/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id }),
      });
      if (!res.ok) {
        setIsDeleting(false);
        return;
      }
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }, [entry.id, closeMenu, router]);

  const handleEditClick = useCallback(() => {
    closeMenu();
    setEditOpen(true);
  }, [closeMenu]);

  const macroSummary = `P ${entry.protein} · C ${entry.carbs} · F ${entry.fat}`;

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          px: 2,
          py: 1.25,
          alignItems: 'flex-start',
          gap: 1,
          '&:not(:last-child)': {
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
          },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}
            >
              {entry.foodName}
            </Typography>
            <Typography
              variant="body2"
              component="span"
              fontWeight={700}
              sx={{ flexShrink: 0 }}
            >
              {entry.calories}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.25 }}
          >
            {macroSummary}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Options"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ color: 'text.secondary', mt: -0.5, mr: -0.5 }}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <CircularProgress size={18} />
          ) : (
            <MoreVertIcon fontSize="small" />
          )}
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 160 } } }}
        >
          <MenuItem onClick={handleEditClick}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </ListItem>
      <EditEntryDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        entry={{
          id: entry.id,
          foodName: entry.foodName,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          mealType: currentMealType,
        }}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
