'use client';

import type { ActivityLevel, Sex } from '@/lib/calorieEngine';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MeGoalsForm from './MeGoalsForm';

const KG_TO_LB = 1 / 0.453592;
const CM_TO_IN = 1 / 2.54;
/** Approx calories per pound of body fat (used for lb/week loss estimate). */
const CAL_PER_LB = 3500;

const SEX_LABEL: Record<Sex, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Active',
  very_active: 'Very active',
};

export type MeGoalsSummaryProps = {
  initialBodyMetrics: {
    currentWeight: number | null;
    targetWeight: number | null;
    heightCm: number | null;
    age: number | null;
    sex: Sex | null;
    activityLevel: ActivityLevel | null;
  };
  initialGoals: {
    calorieTarget: number | null;
    proteinTarget: number | null;
    carbsTarget: number | null;
    fatTarget: number | null;
  };
  /** BMR, TDEE, deficit from calorie engine (for verification vs external calculators). */
  planBreakdown?: { bmr: number; tdee: number; deficit: number } | null;
};

function formatLb(kg: number | null): string {
  if (kg == null) return '—';
  const lb = kg * KG_TO_LB;
  return lb % 1 === 0 ? `${lb}` : lb.toFixed(1);
}

function formatIn(cm: number | null): string {
  if (cm == null) return '—';
  const in_ = cm * CM_TO_IN;
  return in_ % 1 === 0 ? `${in_}` : in_.toFixed(1);
}

export default function MeGoalsSummary({
  initialBodyMetrics,
  initialGoals,
  planBreakdown,
}: MeGoalsSummaryProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasAnyMetrics =
    initialBodyMetrics.currentWeight != null ||
    initialBodyMetrics.targetWeight != null ||
    initialBodyMetrics.heightCm != null ||
    initialBodyMetrics.age != null ||
    initialBodyMetrics.sex != null ||
    initialBodyMetrics.activityLevel != null;

  const hasAnyGoals =
    initialGoals.calorieTarget != null ||
    initialGoals.proteinTarget != null ||
    initialGoals.carbsTarget != null ||
    initialGoals.fatTarget != null;

  const handleSaved = () => {
    setDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        {/* Header: title + edit */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
          }}
        >
          <Typography variant="h5" color="text.primary" fontWeight={500}>
            Goals
          </Typography>
          <Button
            variant="contained"
            size="medium"
            color="primary"
            onClick={() => setDialogOpen(true)}
            sx={{ minWidth: 0, textTransform: 'none' }}
          >
            Edit
          </Button>
        </Box>
        <Divider />
        {!hasAnyMetrics && !hasAnyGoals ? (
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set body metrics and daily targets to track progress.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setDialogOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Set goals
            </Button>
          </Box>
        ) : (
          <Stack divider={<Divider />} sx={{ pb: 0 }}>
            {/* Daily targets — primary focus */}
            {hasAnyGoals && (
              <Box sx={{ px: 2.5, py: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Daily targets
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(4, 1fr)',
                    },
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="primary.main"
                    >
                      {initialGoals.calorieTarget ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      cal
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      {initialGoals.proteinTarget ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      P (g)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      {initialGoals.fatTarget ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      F (g)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      {initialGoals.carbsTarget ?? '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      C (g)
                    </Typography>
                  </Box>
                </Box>
                {/* Losing ~X lb/week when in a deficit */}
                {planBreakdown != null && planBreakdown.deficit > 0 && (
                  <Typography
                    variant="body2"
                    color="primary.main"
                    sx={{ display: 'block', mt: 1.5, fontWeight: 500 }}
                  >
                    Losing ~
                    {(planBreakdown.deficit * 7) / CAL_PER_LB < 0.25
                      ? '<0.25'
                      : ((planBreakdown.deficit * 7) / CAL_PER_LB).toFixed(
                          1
                        )}{' '}
                    lb/week
                  </Typography>
                )}
                {/* Verification: BMR, TDEE, deficit so you can compare with external calculators */}
                {planBreakdown != null && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1.5 }}
                  >
                    BMR {planBreakdown.bmr} · TDEE {planBreakdown.tdee}
                    {planBreakdown.deficit > 0
                      ? ` − ${planBreakdown.deficit} deficit`
                      : ''}
                    = {planBreakdown.tdee - planBreakdown.deficit} cal
                  </Typography>
                )}
              </Box>
            )}

            {/* Body — secondary, compact */}
            {hasAnyMetrics && (
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                  borderRadius: 0,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Body
                </Typography>
                <Stack spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 2.5,
                      rowGap: 0.5,
                    }}
                  >
                    {(initialBodyMetrics.currentWeight != null ||
                      initialBodyMetrics.targetWeight != null) && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          Weight
                        </Typography>
                        <Typography variant="body2">
                          {formatLb(initialBodyMetrics.currentWeight)} →{' '}
                          {formatLb(initialBodyMetrics.targetWeight)} lb
                        </Typography>
                      </Box>
                    )}
                    {initialBodyMetrics.heightCm != null && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          Height
                        </Typography>
                        <Typography variant="body2">
                          {formatIn(initialBodyMetrics.heightCm)} in
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {(initialBodyMetrics.age != null ||
                    initialBodyMetrics.sex != null ||
                    initialBodyMetrics.activityLevel != null) && (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      useFlexGap
                      spacing={0.75}
                      justifyContent="center"
                    >
                      {initialBodyMetrics.age != null && (
                        <Chip
                          label={`${initialBodyMetrics.age} yr`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                      {initialBodyMetrics.sex != null && (
                        <Chip
                          label={SEX_LABEL[initialBodyMetrics.sex]}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                      {initialBodyMetrics.activityLevel != null && (
                        <Chip
                          label={
                            ACTIVITY_LABEL[initialBodyMetrics.activityLevel]
                          }
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1,
                            },
                          }}
                        />
                      )}
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: 'calc(100vh - 32px)',
            margin: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: '1.125rem',
            py: 2,
            pb: 1.5,
          }}
        >
          Edit goals
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 2.5, py: 2, pt: 2.5 }}>
          <MeGoalsForm
            initialBodyMetrics={initialBodyMetrics}
            initialGoals={initialGoals}
            onSaved={handleSaved}
            inDialog
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
