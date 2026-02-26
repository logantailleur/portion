'use client';

import {
  calculateCaloriePlan,
  getGoalEstimate,
} from '@/lib/calorieEngine';
import type { ActivityLevel, Sex } from '@/lib/calorieEngine';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Light', description: '1–3 days/week' },
  { value: 'moderate', label: 'Moderate', description: '3–5 days/week' },
  { value: 'active', label: 'Active', description: '6–7 days/week' },
  { value: 'very_active', label: 'Very active', description: 'Intense daily' },
];

export type GoalType = 'lose' | 'maintain' | 'gain';
const GOAL_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain weight' },
  { value: 'gain', label: 'Gain weight' },
];

const STEP_LABELS = ['Basic Info', 'Weight & Goal', 'Activity Level', 'Review'];

const SURPLUS_CAL = 300; // extra calories for gain goal

function toNum(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

function toInt(value: string): number {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.round(n));
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1: Basic info
  const [sex, setSex] = useState<Sex | ''>('');
  const [age, setAge] = useState('');
  const [heightInches, setHeightInches] = useState('');

  // Step 2: Weight
  const [currentWeightLb, setCurrentWeightLb] = useState('');
  const [targetWeightLb, setTargetWeightLb] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('maintain');

  // Step 3: Activity
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeightKg = toNum(currentWeightLb) * LB_TO_KG;
  const targetWeightKg = toNum(targetWeightLb) * LB_TO_KG;
  const heightCm = toNum(heightInches) * IN_TO_CM;
  const ageNum = toInt(age);

  const hasBasic = sex !== '' && age.trim() !== '' && toInt(age) > 0 && toNum(heightInches) > 0;
  const hasWeight = toNum(currentWeightLb) > 0 && toNum(targetWeightLb) > 0;
  const hasActivity = activityLevel !== '';

  const canProceedFromStep = useMemo(() => {
    if (step === 0) return hasBasic;
    if (step === 1) return hasWeight;
    if (step === 2) return hasActivity;
    return true;
  }, [step, hasBasic, hasWeight, hasActivity]);

  // Step 4 (Review): live preview via client-side calorieEngine for instant feedback.
  // Final submit uses /api/user/complete-onboarding which recalculates server-side.
  const plan = useMemo(() => {
    if (!hasBasic || !hasWeight || !hasActivity) return null;
    const c = currentWeightKg;
    const t = targetWeightKg;
    const targetForEngine = goalType === 'lose' ? t : goalType === 'maintain' ? c : t;
    return calculateCaloriePlan({
      currentWeightKg: c,
      targetWeightKg: targetForEngine,
      heightCm,
      age: ageNum,
      sex: sex as Sex,
      activityLevel: activityLevel as ActivityLevel,
    });
  }, [
    hasBasic,
    hasWeight,
    hasActivity,
    currentWeightKg,
    targetWeightKg,
    heightCm,
    ageNum,
    sex,
    activityLevel,
    goalType,
  ]);

  const adjustedPlan = useMemo(() => {
    if (!plan) return null;
    if (goalType === 'gain') {
      const extraCarbs = Math.round(SURPLUS_CAL / 4);
      return {
        ...plan,
        calorieTarget: plan.calorieTarget + SURPLUS_CAL,
        carbsGrams: plan.carbsGrams + extraCarbs,
        carbsCalories: plan.carbsCalories + SURPLUS_CAL,
      };
    }
    return plan;
  }, [plan, goalType]);

  const goalEstimate = useMemo(() => {
    if (!adjustedPlan || goalType !== 'lose') return null;
    return getGoalEstimate({
      currentWeightKg,
      targetWeightKg,
      heightCm,
      age: ageNum,
      sex: sex as Sex,
      activityLevel: activityLevel as ActivityLevel,
      calorieTarget: adjustedPlan.calorieTarget,
    });
  }, [adjustedPlan, goalType, currentWeightKg, targetWeightKg, heightCm, ageNum, sex, activityLevel]);

  const timelineWeeksMessage = useMemo(() => {
    if (!goalEstimate) return null;
    const now = Date.now();
    const weeks = (goalEstimate.estimatedDate.getTime() - now) / (7 * 24 * 60 * 60 * 1000);
    const center = Math.round(weeks);
    const low = Math.max(1, center - 2);
    const high = center + 2;
    if (low >= high) return `You'll reach your goal in approximately ${center} week${center !== 1 ? 's' : ''} at this rate.`;
    return `You'll reach your goal in approximately ${low}–${high} weeks at this rate.`;
  }, [goalEstimate]);

  const handleNext = useCallback(() => {
    setError(null);
    if (step < STEP_LABELS.length - 1) setStep((s) => s + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!hasBasic || !hasWeight || !hasActivity) return;
    setError(null);
    setSubmitting(true);
    try {
      // Send only raw form data; API recalculates server-side (never trust client math)
      const res = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentWeight: currentWeightKg,
          targetWeight: goalType === 'maintain' ? currentWeightKg : targetWeightKg,
          heightCm,
          age: ageNum,
          sex,
          activityLevel,
          goalType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to save');
      }
      router.push('/today');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }, [hasBasic, hasWeight, hasActivity, currentWeightKg, targetWeightKg, heightCm, ageNum, sex, activityLevel, goalType, router]);

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: 'auto',
        px: 2,
        py: 3,
        pb: 4,
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3, px: 0 }}>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <Stack spacing={2.5}>
          <FormControl fullWidth size="medium">
            <InputLabel id="onboarding-sex">Sex</InputLabel>
            <Select
              labelId="onboarding-sex"
              label="Sex"
              value={sex}
              onChange={(e) => setSex((e.target.value || '') as Sex | '')}
            >
              {SEX_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Age"
            type="number"
            inputProps={{ min: 13, max: 120, step: 1 }}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            fullWidth
          />
          <TextField
            label="Height (inches)"
            type="number"
            inputProps={{ min: 0, step: 0.1 }}
            value={heightInches}
            onChange={(e) => setHeightInches(e.target.value)}
            fullWidth
          />
        </Stack>
      )}

      {/* Step 2: Weight & Goal */}
      {step === 1 && (
        <Stack spacing={2.5}>
          <TextField
            label="Current weight (lb)"
            type="number"
            inputProps={{ min: 0, step: 0.1 }}
            value={currentWeightLb}
            onChange={(e) => setCurrentWeightLb(e.target.value)}
            fullWidth
          />
          <TextField
            label="Target weight (lb)"
            type="number"
            inputProps={{ min: 0, step: 0.1 }}
            value={targetWeightLb}
            onChange={(e) => setTargetWeightLb(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth size="medium">
            <InputLabel id="onboarding-goal">Goal type</InputLabel>
            <Select
              labelId="onboarding-goal"
              label="Goal type"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
            >
              {GOAL_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}

      {/* Step 3: Activity Level */}
      {step === 2 && (
        <Stack spacing={1.5}>
          {ACTIVITY_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={activityLevel === opt.value ? 'contained' : 'outlined'}
              onClick={() => setActivityLevel(opt.value)}
              fullWidth
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                minHeight: 56,
              }}
            >
              <Stack alignItems="flex-start" sx={{ width: '100%' }}>
                <Typography fontWeight={600}>{opt.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {opt.description}
                </Typography>
              </Stack>
            </Button>
          ))}
        </Stack>
      )}

      {/* Step 4: Review */}
      {step === 3 && adjustedPlan && (
        <Stack spacing={2.5}>
          {timelineWeeksMessage && (
            <Typography
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 1,
                bgcolor: 'action.hover',
                color: 'text.primary',
                fontWeight: 500,
              }}
            >
              {timelineWeeksMessage}
            </Typography>
          )}
          <Stack spacing={1.5} sx={{ py: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Daily calories</Typography>
              <Typography fontWeight={600}>{adjustedPlan.calorieTarget}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Protein</Typography>
              <Typography fontWeight={600}>{adjustedPlan.proteinGrams}g</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Carbs</Typography>
              <Typography fontWeight={600}>{adjustedPlan.carbsGrams}g</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Fat</Typography>
              <Typography fontWeight={600}>{adjustedPlan.fatGrams}g</Typography>
            </Stack>
            {goalEstimate && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Target date</Typography>
                <Typography variant="body2">
                  {formatDate(goalEstimate.estimatedDate)}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ mt: 1, py: 1.5 }}
          >
            {submitting ? 'Saving…' : 'Start tracking'}
          </Button>
        </Stack>
      )}

      {/* Next / Back */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 4, pt: 2 }}
      >
        <Button
          onClick={handleBack}
          disabled={step === 0}
          sx={{ minWidth: 80, visibility: step === 0 ? 'hidden' : 'visible' }}
        >
          Back
        </Button>
        {step < 3 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceedFromStep}
            sx={{ minWidth: 80 }}
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
}
