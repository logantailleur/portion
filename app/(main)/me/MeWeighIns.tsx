'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const KG_TO_LB = 1 / 0.453592;

export type TimeRangeFilter = 'week' | 'month' | '6months' | 'year' | 'toDate';

const TIME_RANGE_OPTIONS: { value: TimeRangeFilter; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: '6months', label: '6 months' },
  { value: 'year', label: 'Year' },
  { value: 'toDate', label: 'All' },
];

function getRangeEnd(filter: TimeRangeFilter): Date | null {
  if (filter === 'toDate') return null;
  // End of today (23:59:59.999) so any weigh-in on the calendar day is included.
  // Weigh-ins can be stored as UTC midnight, which may be "today" in another TZ.
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

function getCutoff(filter: TimeRangeFilter): Date | null {
  if (filter === 'toDate') return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(now);
  if (filter === 'week') d.setDate(d.getDate() - 7);
  else if (filter === 'month') d.setMonth(d.getMonth() - 1);
  else if (filter === '6months') d.setMonth(d.getMonth() - 6);
  else if (filter === 'year') d.setFullYear(d.getFullYear() - 1);
  return d;
}

export type WeighInEntry = {
  id: string;
  weightKg: number;
  date: string;
};

export type GoalPoint = {
  date: string;
  weightKg: number;
};

export type MeWeighInsProps = {
  initialWeighIns: WeighInEntry[];
  /** Goal as final point (estimated date + target weight). Shown at end of line. */
  goalPoint: GoalPoint | null;
  /** Current weight in kg (for drawing from today to goal when there are no weigh-ins). */
  currentWeightKg: number | null;
};

export default function MeWeighIns({
  initialWeighIns,
  goalPoint,
  currentWeightKg,
}: MeWeighInsProps) {
  const theme = useTheme();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weightLb, setWeightLb] = useState('');
  const [date, setDate] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('toDate');

  const sorted = [...initialWeighIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // When we have a goal, split into: (1) actual weigh-ins, (2) segment from last weigh-in to goal (dashed, secondary).
  type SeriesPoint = { dates: Date[]; weightsLb: number[] };
  let mainSeries: SeriesPoint;
  let toGoalSeries: SeriesPoint | null = null;

  if (sorted.length === 0 && goalPoint && currentWeightKg != null) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    mainSeries = { dates: [], weightsLb: [] };
    toGoalSeries = {
      dates: [today, new Date(goalPoint.date)],
      weightsLb: [currentWeightKg * KG_TO_LB, goalPoint.weightKg * KG_TO_LB],
    };
  } else if (sorted.length > 0) {
    mainSeries = {
      dates: sorted.map((w) => new Date(w.date)),
      weightsLb: sorted.map((w) => w.weightKg * KG_TO_LB),
    };
    if (goalPoint) {
      const last = mainSeries.dates.length - 1;
      const lastDate = mainSeries.dates[last];
      const lastWeight = mainSeries.weightsLb[last];
      if (lastDate != null && lastWeight != null) {
        toGoalSeries = {
          dates: [lastDate, new Date(goalPoint.date)],
          weightsLb: [lastWeight, goalPoint.weightKg * KG_TO_LB],
        };
      }
    }
  } else {
    mainSeries = { dates: [], weightsLb: [] };
  }

  const hasChartData =
    mainSeries.dates.length > 0 || (toGoalSeries?.dates.length ?? 0) > 0;
  const allWeightsLb = [
    ...mainSeries.weightsLb,
    ...(toGoalSeries?.weightsLb ?? []),
  ];

  // Y-axis range from data with padding so the line isn’t flattened (e.g. 150–350 → 175–325 for 180–200)
  const yPaddingLb = 10;
  const weightMin = hasChartData ? Math.min(...allWeightsLb) - yPaddingLb : 0;
  const weightMax = hasChartData ? Math.max(...allWeightsLb) + yPaddingLb : 100;
  const yMin = Math.max(0, Math.floor(weightMin / 5) * 5);
  const yMax = Math.ceil(weightMax / 5) * 5;

  // Build shared x-axis and series data for the chart (one or two series).
  let chartDates: Date[];
  let mainData: (number | null)[];
  let toGoalData: (number | null)[] | null = null;

  if (toGoalSeries && mainSeries.dates.length === 0) {
    // Only current → goal (no weigh-ins yet).
    chartDates = toGoalSeries.dates;
    mainData = [];
    toGoalData = toGoalSeries.weightsLb;
  } else if (toGoalSeries && mainSeries.dates.length > 0) {
    // Weigh-ins + segment to goal: shared x = main dates + goal date.
    const goalDate = toGoalSeries.dates[1] ?? new Date(goalPoint!.date);
    chartDates = [...mainSeries.dates, goalDate];
    mainData = [...mainSeries.weightsLb, null];
    toGoalData = [
      ...Array(mainSeries.dates.length - 1).fill(null),
      ...toGoalSeries.weightsLb,
    ];
  } else {
    chartDates = mainSeries.dates;
    mainData = mainSeries.weightsLb;
  }

  // Apply time range filter: keep only points within [cutoff, rangeEnd].
  const cutoff = getCutoff(timeRange);
  const rangeEnd = getRangeEnd(timeRange);
  if (cutoff != null && rangeEnd != null && chartDates.length > 0) {
    const keep = chartDates.map((d) => d >= cutoff && d <= rangeEnd);
    chartDates = chartDates.filter((_, i) => keep[i]);
    mainData = mainData.filter((_, i) => keep[i]);
    if (toGoalData != null) toGoalData = toGoalData.filter((_, i) => keep[i]);
  }

  // Fixed x-axis domain for filtered view: always show the full date window.
  const xAxisMin =
    cutoff ?? (chartDates.length > 0 ? chartDates[0] : undefined);
  const xAxisMax =
    rangeEnd ??
    (chartDates.length > 0 ? chartDates[chartDates.length - 1] : undefined);

  // Y-axis range from visible (filtered) data when we have points to show.
  const visibleWeights = [...mainData, ...(toGoalData ?? [])].filter(
    (v): v is number => v != null
  );
  const hasVisibleData = chartDates.length > 0 && visibleWeights.length > 0;
  const visibleWeightMin = hasVisibleData
    ? Math.min(...visibleWeights) - yPaddingLb
    : weightMin;
  const visibleWeightMax = hasVisibleData
    ? Math.max(...visibleWeights) + yPaddingLb
    : weightMax;
  const visibleYMin = Math.max(0, Math.floor(visibleWeightMin / 5) * 5);
  const visibleYMax = Math.ceil(visibleWeightMax / 5) * 5;

  const handleOpen = useCallback(() => {
    setWeightLb('');
    setDate(null);
    setError(null);
    setDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    const lb = weightLb.trim() ? parseFloat(weightLb) : NaN;
    if (Number.isNaN(lb) || lb <= 0) {
      setError('Enter a valid weight (lb).');
      return;
    }
    const weightKg = lb / KG_TO_LB;
    const body: { weightKg: number; date?: string } = { weightKg };
    if (date) {
      body.date = date.startOf('day').toISOString();
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/user/weigh-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to save weigh-in.');
        return;
      }
      handleClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [weightLb, date, handleClose, router]);

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
            Weigh-ins
          </Typography>
          <Button
            variant="contained"
            size="medium"
            color="primary"
            onClick={handleOpen}
            sx={{ minWidth: 0, textTransform: 'none' }}
          >
            Add weight
          </Button>
        </Box>
        <Divider />
        <Box sx={{ px: { xs: 1, sm: 1.5 }, py: 2 }}>
          {!hasChartData ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track your progress over time. Add a weight to see your chart.
            </Typography>
          ) : (
            <Box>
              {!hasVisibleData ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 4 }}
                >
                  No weigh-ins in this range.
                </Typography>
              ) : (
                <Box sx={{ width: '100%', minHeight: 300 }}>
                  <LineChart
                    xAxis={[
                      {
                        label: 'Date',
                        data: chartDates,
                        scaleType: 'time',
                        valueFormatter: (v) => dayjs(v).format('MMM D, YYYY'),
                        tickNumber: Math.min(6, chartDates.length) || 2,
                        tickLabelStyle: { fontSize: 11 },
                        ...(xAxisMin != null && xAxisMax != null
                          ? { min: xAxisMin, max: xAxisMax }
                          : {}),
                      },
                    ]}
                    yAxis={[
                      {
                        label: 'Weight (lb)',
                        min: visibleYMin,
                        max: visibleYMax,
                        tickNumber: 6,
                        tickLabelStyle: { fontSize: 11 },
                      },
                    ]}
                    series={[
                      ...(mainData.length > 0
                        ? [
                            {
                              id: 'weight',
                              label: 'Weight',
                              data: mainData,
                              color: theme.palette.primary.main,
                              showMark: true,
                              curve: 'linear' as const,
                              connectNulls: true,
                            },
                          ]
                        : []),
                      ...(timeRange === 'toDate' && toGoalData != null
                        ? [
                            {
                              id: 'toGoal',
                              label: 'Target',
                              data: toGoalData,
                              color: theme.palette.secondary.main,
                              showMark: true,
                              curve: 'linear' as const,
                              connectNulls: true,
                            },
                          ]
                        : []),
                    ]}
                    height={300}
                    margin={{ top: 20, right: 16, bottom: 36, left: 28 }}
                    grid={{ vertical: true, horizontal: true }}
                    sx={{
                      '& .MuiLineElement-root': {
                        strokeWidth: 2,
                      },
                      '& .MuiLineElement-root:first-of-type': {
                        stroke: theme.palette.primary.main,
                      },
                      ...(timeRange === 'toDate' && toGoalData != null
                        ? {
                            '& .MuiLineElement-root:last-of-type': {
                              stroke: theme.palette.secondary.main,
                              strokeDasharray: '6 4',
                            },
                            '& .MuiMarkElement-root:last-of-type': {
                              fill: theme.palette.secondary.main,
                            },
                          }
                        : {}),
                    }}
                  />
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                <ButtonGroup
                  size="small"
                  sx={{ flexWrap: 'wrap' }}
                  aria-label="Time range filter"
                >
                  {TIME_RANGE_OPTIONS.map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={timeRange === value ? 'contained' : 'outlined'}
                      onClick={() => setTimeRange(value)}
                      sx={{ textTransform: 'none' }}
                    >
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
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
          Add weigh-in
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 2.5, py: 2, pt: 2.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Weight (lb)"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={weightLb}
                onChange={(e) => {
                  setWeightLb(e.target.value);
                  setError(null);
                }}
                fullWidth
                required
                error={!!error}
                helperText={error}
              />
              <DatePicker
                label="Date (optional)"
                value={date}
                onChange={(v) => setDate(v)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: 'Leave blank for today',
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ textTransform: 'none' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
