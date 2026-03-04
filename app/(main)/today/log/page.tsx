import ManualLogForm from './ManualLogForm';
import { authOptions } from '@/lib/auth';
import {
  getDefaultMealType,
  type MealType,
} from '@/lib/calorieDistribution';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const MEAL_TYPES: readonly MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

function isMealType(value: string | null): value is MealType {
  return value !== null && MEAL_TYPES.includes(value as MealType);
}

export default async function TodayLogPage({
  searchParams,
}: {
  searchParams: Promise<{ meal?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const params = await searchParams;
  const mealParam = params.meal ?? null;
  const selectedMeal = isMealType(mealParam)
    ? mealParam
    : getDefaultMealType();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          Log food
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add a manual entry with food name and macros.
        </Typography>
      </Box>
      <ManualLogForm defaultMeal={selectedMeal} />
    </Box>
  );
}
