'use client';

import { calculateCaloriePlan } from '@/lib/calorieEngine';
import type { ActivityLevel, Sex } from '@/lib/calorieEngine';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very active' },
];

const DEFAULT_CAL = 2000;
const DEFAULT_PROTEIN = 150;
const DEFAULT_CARBS = 250;
const DEFAULT_FAT = 65;

/** Convert lb → kg and in → cm for API/engine; display uses lb and in. NIST 1 lb = 0.45359237 kg. */
const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;
const KG_TO_LB = 1 / LB_TO_KG;
const CM_TO_IN = 1 / IN_TO_CM;

function toNum(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

function toInt(value: string): number {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.round(n));
}

export type MeGoalsFormProps = {
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
  /** Called after a successful save (e.g. to close dialog and refresh). */
  onSaved?: () => void;
  /** When true, omit outer Paper and main title (for use inside a dialog). */
  inDialog?: boolean;
};

export default function MeGoalsForm({
  initialBodyMetrics,
  initialGoals,
  onSaved,
  inDialog,
}: MeGoalsFormProps) {
  // Section 1: Body metrics (input in lb and in; converted to kg/cm when saving)
  const [currentWeight, setCurrentWeight] = useState(() => {
    if (initialBodyMetrics.currentWeight == null) return '';
    const lb = initialBodyMetrics.currentWeight * KG_TO_LB;
    return lb % 1 === 0 ? String(lb) : lb.toFixed(1);
  });
  const [targetWeight, setTargetWeight] = useState(() => {
    if (initialBodyMetrics.targetWeight == null) return '';
    const lb = initialBodyMetrics.targetWeight * KG_TO_LB;
    return lb % 1 === 0 ? String(lb) : lb.toFixed(1);
  });
  const [heightInches, setHeightInches] = useState(() => {
    if (initialBodyMetrics.heightCm == null) return '';
    const in_ = initialBodyMetrics.heightCm * CM_TO_IN;
    return in_ % 1 === 0 ? String(in_) : in_.toFixed(1);
  });
  const [age, setAge] = useState(
    initialBodyMetrics.age != null ? String(initialBodyMetrics.age) : ''
  );
  const [sex, setSex] = useState<Sex | ''>(initialBodyMetrics.sex ?? '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>(
    initialBodyMetrics.activityLevel ?? ''
  );

  // Section 2: Targets (from API / calculation)
  const [calorieTarget, setCalorieTarget] = useState(
    initialGoals.calorieTarget ?? DEFAULT_CAL
  );
  const [proteinTarget, setProteinTarget] = useState(
    initialGoals.proteinTarget ?? DEFAULT_PROTEIN
  );
  const [carbsTarget, setCarbsTarget] = useState(
    initialGoals.carbsTarget ?? DEFAULT_CARBS
  );
  const [fatTarget, setFatTarget] = useState(
    initialGoals.fatTarget ?? DEFAULT_FAT
  );

  const [overrideManually, setOverrideManually] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Sync displayed targets when initial goals change (e.g. after refetch)
  useEffect(() => {
    setCalorieTarget(initialGoals.calorieTarget ?? DEFAULT_CAL);
    setProteinTarget(initialGoals.proteinTarget ?? DEFAULT_PROTEIN);
    setCarbsTarget(initialGoals.carbsTarget ?? DEFAULT_CARBS);
    setFatTarget(initialGoals.fatTarget ?? DEFAULT_FAT);
  }, [
    initialGoals.calorieTarget,
    initialGoals.proteinTarget,
    initialGoals.carbsTarget,
    initialGoals.fatTarget,
  ]);

  const hasAllMetrics =
    currentWeight !== '' &&
    targetWeight !== '' &&
    heightInches !== '' &&
    age !== '' &&
    sex !== '' &&
    activityLevel !== '';

  const bodyMetricsPayload = useCallback(() => {
    const lb = toNum(currentWeight);
    const targetLb = toNum(targetWeight);
    const in_ = toNum(heightInches);
    return {
      currentWeight: lb ? lb * LB_TO_KG : undefined,
      targetWeight: targetLb ? targetLb * LB_TO_KG : undefined,
      heightCm: in_ ? in_ * IN_TO_CM : undefined,
      age: toInt(age) || undefined,
      sex: sex || undefined,
      activityLevel: activityLevel || undefined,
    };
  }, [currentWeight, targetWeight, heightInches, age, sex, activityLevel]);

  const saveAndRecalculate = useCallback(async () => {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/update-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bodyMetricsPayload(),
          recalculate: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: 'error',
          text: data.error ?? 'Failed to update',
        });
        return;
      }
      if (data.calorieTarget != null) setCalorieTarget(data.calorieTarget);
      if (data.proteinTarget != null) setProteinTarget(data.proteinTarget);
      if (data.carbsTarget != null) setCarbsTarget(data.carbsTarget);
      if (data.fatTarget != null) setFatTarget(data.fatTarget);
      setMessage({ type: 'success', text: 'Body metrics and targets saved.' });
      onSaved?.();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update' });
    } finally {
      setSaving(false);
    }
  }, [bodyMetricsPayload, onSaved]);

  const saveOverride = useCallback(async () => {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/update-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bodyMetricsPayload(),
          calorieTarget: Math.round(calorieTarget),
          proteinTarget: Math.round(proteinTarget),
          carbsTarget: Math.round(carbsTarget),
          fatTarget: Math.round(fatTarget),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: 'error',
          text: data.error ?? 'Failed to save targets',
        });
        return;
      }
      setMessage({ type: 'success', text: 'Targets saved.' });
      onSaved?.();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save targets' });
    } finally {
      setSaving(false);
    }
  }, [
    bodyMetricsPayload,
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
    onSaved,
  ]);

  const handleSave = () => {
    if (overrideManually) {
      saveOverride();
    } else {
      saveAndRecalculate();
    }
  };

  // Client-side preview when all metrics are present (no save); convert lb/in → kg/cm
  const calculatedPreview =
    hasAllMetrics && !overrideManually
      ? calculateCaloriePlan({
          currentWeightKg: toNum(currentWeight) * LB_TO_KG,
          targetWeightKg: toNum(targetWeight) * LB_TO_KG,
          heightCm: toNum(heightInches) * IN_TO_CM,
          age: toInt(age),
          sex: sex as Sex,
          activityLevel: activityLevel as ActivityLevel,
        })
      : null;

  const displayCalories = overrideManually
    ? calorieTarget
    : (calculatedPreview?.calorieTarget ?? calorieTarget);
  const displayProtein = overrideManually
    ? proteinTarget
    : (calculatedPreview?.proteinGrams ?? proteinTarget);
  const displayFat = overrideManually
    ? fatTarget
    : (calculatedPreview?.fatGrams ?? fatTarget);
  const displayCarbs = overrideManually
    ? carbsTarget
    : (calculatedPreview?.carbsGrams ?? carbsTarget);

  const sectionLabelSx = {
    display: 'block',
    mb: 1.5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontSize: '0.7rem',
  };

  const content = (
    <Stack spacing={inDialog ? 3 : 4}>
      {!inDialog && (
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Goals & targets
        </Typography>
      )}

      {/* Section 1: Body metrics */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={sectionLabelSx}
        >
          Body metrics
        </Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Current weight (lb)"
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Target weight (lb)"
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              fullWidth
              size="small"
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Height (in)"
              type="number"
              inputProps={{ min: 0, step: 0.1 }}
              value={heightInches}
              onChange={(e) => setHeightInches(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Age"
              type="number"
              inputProps={{ min: 0, max: 120, step: 1 }}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              fullWidth
              size="small"
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sex-label">Sex</InputLabel>
              <Select
                labelId="sex-label"
                label="Sex"
                value={sex}
                onChange={(e) => setSex((e.target.value || '') as Sex | '')}
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                {SEX_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-label">Activity level</InputLabel>
              <Select
                labelId="activity-label"
                label="Activity level"
                value={activityLevel}
                onChange={(e) =>
                  setActivityLevel((e.target.value || '') as ActivityLevel | '')
                }
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                {ACTIVITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Box>

      {/* Section 2: Daily targets */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={sectionLabelSx}
        >
          Daily targets
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1.5,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              textAlign: 'center',
              borderRadius: 1.5,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Cal
            </Typography>
            {overrideManually ? (
              <TextField
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(toInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                variant="standard"
                slotProps={{
                  input: { sx: { fontSize: '1.125rem', textAlign: 'center' } },
                }}
                sx={{ mt: 0.25 }}
              />
            ) : (
              <Typography variant="subtitle1" fontWeight={600}>
                {displayCalories}
              </Typography>
            )}
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              textAlign: 'center',
              borderRadius: 1.5,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Protein
            </Typography>
            {overrideManually ? (
              <TextField
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(toInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                variant="standard"
                slotProps={{
                  input: { sx: { fontSize: '1.125rem', textAlign: 'center' } },
                }}
                sx={{ mt: 0.25 }}
              />
            ) : (
              <Typography variant="subtitle1" fontWeight={600}>
                {displayProtein}
              </Typography>
            )}
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              textAlign: 'center',
              borderRadius: 1.5,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Fat
            </Typography>
            {overrideManually ? (
              <TextField
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(toInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                variant="standard"
                slotProps={{
                  input: { sx: { fontSize: '1.125rem', textAlign: 'center' } },
                }}
                sx={{ mt: 0.25 }}
              />
            ) : (
              <Typography variant="subtitle1" fontWeight={600}>
                {displayFat}
              </Typography>
            )}
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              textAlign: 'center',
              borderRadius: 1.5,
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              Carbs
            </Typography>
            {overrideManually ? (
              <TextField
                type="number"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(toInt(e.target.value) || 0)}
                inputProps={{ min: 0 }}
                variant="standard"
                slotProps={{
                  input: { sx: { fontSize: '1.125rem', textAlign: 'center' } },
                }}
                sx={{ mt: 0.25 }}
              />
            ) : (
              <Typography variant="subtitle1" fontWeight={600}>
                {displayCarbs}
              </Typography>
            )}
          </Paper>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ mt: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" component="span" color="text.secondary">
              Override manually
            </Typography>
            <Switch
              checked={overrideManually}
              onChange={(e) => setOverrideManually(e.target.checked)}
              color="primary"
              size="small"
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={saving || (overrideManually ? false : !hasAllMetrics)}
            sx={{ textTransform: 'none', ml: 'auto' }}
          >
            {saving ? 'Saving…' : overrideManually ? 'Save targets' : 'Save'}
          </Button>
        </Stack>
      </Box>

      {message && (
        <Typography
          variant="body2"
          color={message.type === 'error' ? 'error' : 'success.main'}
        >
          {message.text}
        </Typography>
      )}
    </Stack>
  );

  return inDialog ? (
    <Box sx={{ pt: 1 }}>{content}</Box>
  ) : (
    <Paper
      variant="elevation"
      elevation={0}
      sx={{ p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      {content}
    </Paper>
  );
}
