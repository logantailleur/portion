'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

dayjs.extend(utc);

const REPORT_PAGE_SIZE = 10;

const KG_TO_LB = 1 / 0.453592;

export type TimeRangeFilter = 'week' | 'month' | '6months' | 'year' | 'toDate';

const TIME_RANGE_OPTIONS: { value: TimeRangeFilter; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: '6months', label: '6 months' },
  { value: 'year', label: 'Year' },
  { value: 'toDate', label: 'All' },
];

function getRangeEndDateStr(filter: TimeRangeFilter): string | null {
  if (filter === 'toDate') return null;
  return dayjs().format('YYYY-MM-DD');
}

function getCutoffDateStr(filter: TimeRangeFilter): string | null {
  if (filter === 'toDate') return null;
  if (filter === 'week') return dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  if (filter === 'month')
    return dayjs().subtract(1, 'month').format('YYYY-MM-DD');
  if (filter === '6months')
    return dayjs().subtract(6, 'month').format('YYYY-MM-DD');
  if (filter === 'year')
    return dayjs().subtract(1, 'year').format('YYYY-MM-DD');
  return null;
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
  /** All weigh-ins (for full report with edit/delete). */
  allWeighIns: WeighInEntry[];
  /** Goal as final point (estimated date + target weight). Shown at end of line. */
  goalPoint: GoalPoint | null;
  /** Current weight in kg (for drawing from today to goal when there are no weigh-ins). */
  currentWeightKg: number | null;
};

export default function MeWeighIns({
  initialWeighIns,
  allWeighIns,
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

  const [editEntry, setEditEntry] = useState<WeighInEntry | null>(null);
  const [editWeightLb, setEditWeightLb] = useState('');
  const [editDate, setEditDate] = useState<Dayjs | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteEntry, setDeleteEntry] = useState<WeighInEntry | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [reportPage, setReportPage] = useState(0);

  const sorted = [...initialWeighIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // When we have a goal, split into: (1) actual weigh-ins, (2) segment from last weigh-in to goal (dashed, secondary).
  type SeriesPoint = { dates: Date[]; weightsLb: number[] };
  let mainSeries: SeriesPoint;
  let toGoalSeries: SeriesPoint | null = null;

  if (sorted.length === 0 && goalPoint && currentWeightKg != null) {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);
    mainSeries = { dates: [], weightsLb: [] };
    toGoalSeries = {
      dates: [todayDate, new Date(goalPoint.date)],
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

  // Apply time range filter by calendar date (YYYY-MM-DD).
  const cutoffStr = getCutoffDateStr(timeRange);
  const rangeEndStr = getRangeEndDateStr(timeRange);
  if (cutoffStr != null && rangeEndStr != null && chartDates.length > 0) {
    const keep = chartDates.map(
      (d) =>
        d.toISOString().slice(0, 10) >= cutoffStr &&
        d.toISOString().slice(0, 10) <= rangeEndStr
    );
    chartDates = chartDates.filter((_, i) => keep[i]);
    mainData = mainData.filter((_, i) => keep[i]);
    if (toGoalData != null) toGoalData = toGoalData.filter((_, i) => keep[i]);
  }

  const xAxisMin =
    cutoffStr != null
      ? new Date(`${cutoffStr}T00:00:00.000Z`)
      : chartDates.length > 0
        ? chartDates[0]
        : undefined;
  const lastDate =
    chartDates.length > 0 ? chartDates[chartDates.length - 1] : null;
  const xAxisMax =
    rangeEndStr != null
      ? new Date(`${rangeEndStr}T23:59:59.999Z`)
      : lastDate != null
        ? new Date(`${lastDate.toISOString().slice(0, 10)}T23:59:59.999Z`)
        : undefined;

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
    const body: { weightKg: number; date: string } = {
      weightKg,
      date: (date ?? dayjs()).format('YYYY-MM-DD'),
    };
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

  const handleEditOpen = useCallback((entry: WeighInEntry) => {
    setEditEntry(entry);
    setEditWeightLb(
      (entry.weightKg * KG_TO_LB) % 1 === 0
        ? String(Math.round(entry.weightKg * KG_TO_LB))
        : (entry.weightKg * KG_TO_LB).toFixed(1)
    );
    setEditDate(dayjs.utc(entry.date));
    setEditError(null);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditEntry(null);
    setEditError(null);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editEntry) return;
    const lb = editWeightLb.trim() ? parseFloat(editWeightLb) : NaN;
    if (Number.isNaN(lb) || lb <= 0) {
      setEditError('Enter a valid weight (lb).');
      return;
    }
    const weightKg = lb / KG_TO_LB;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/user/weigh-ins/${editEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg,
          date: editDate ? editDate.format('YYYY-MM-DD') : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? 'Failed to update weigh-in.');
        return;
      }
      handleEditClose();
      router.refresh();
    } finally {
      setEditSaving(false);
    }
  }, [editEntry, editWeightLb, editDate, handleEditClose, router]);

  const handleDeleteOpen = useCallback((entry: WeighInEntry) => {
    setDeleteEntry(entry);
  }, []);

  const handleDeleteClose = useCallback(() => {
    setDeleteEntry(null);
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteEntry) return;
    setDeleteSaving(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/user/weigh-ins/${deleteEntry.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? 'Failed to delete weigh-in.');
        return;
      }
      handleDeleteClose();
      router.refresh();
    } finally {
      setDeleteSaving(false);
    }
  }, [deleteEntry, handleDeleteClose, router]);

  const reportRows = [...allWeighIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const reportTotalPages = Math.max(
    1,
    Math.ceil(reportRows.length / REPORT_PAGE_SIZE)
  );
  const reportRowsPage = reportRows.slice(
    reportPage * REPORT_PAGE_SIZE,
    reportPage * REPORT_PAGE_SIZE + REPORT_PAGE_SIZE
  );

  useEffect(() => {
    if (reportPage >= reportTotalPages && reportTotalPages > 0) {
      setReportPage(Math.max(0, reportTotalPages - 1));
    }
  }, [reportPage, reportTotalPages]);

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
                        valueFormatter: (v) =>
                          dayjs.utc(v).format('MMM D, YYYY'),
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

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          borderColor: 'divider',
          boxShadow: 1,
        }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography
            variant="h5"
            color="text.primary"
            fontWeight={500}
            sx={{ mb: 2 }}
          >
            All Weigh-Ins
          </Typography>
          {reportRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No weigh-ins yet. Add one above to see the report.
            </Typography>
          ) : (
            <>
              <Table size="small" aria-label="All weigh-ins">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Weight (lb)</TableCell>
                    <TableCell align="right" sx={{ width: 100 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportRowsPage.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {dayjs.utc(row.date).format('MMM D, YYYY')}
                      </TableCell>
                      <TableCell align="right">
                        {(row.weightKg * KG_TO_LB).toFixed(1)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          aria-label="Edit"
                          onClick={() => handleEditOpen(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Delete"
                          onClick={() => handleDeleteOpen(row)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Page {reportPage + 1} of {reportTotalPages}
                  {reportRows.length > 0 && (
                    <>
                      {' '}
                      · {reportRows.length} weigh-in
                      {reportRows.length !== 1 ? 's' : ''} total
                    </>
                  )}
                </Typography>
                <ButtonGroup size="small" sx={{ textTransform: 'none' }}>
                  <Button
                    disabled={reportPage <= 0}
                    onClick={() => setReportPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={reportPage >= reportTotalPages - 1}
                    onClick={() =>
                      setReportPage((p) =>
                        Math.min(reportTotalPages - 1, p + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </ButtonGroup>
              </Box>
            </>
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

      <Dialog
        open={editEntry != null}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, margin: 2 },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 600, fontSize: '1.125rem', py: 2, pb: 1.5 }}
        >
          Edit weigh-in
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 2.5, py: 2, pt: 2.5 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Weight (lb)"
                type="number"
                inputProps={{ min: 0, step: 0.1 }}
                value={editWeightLb}
                onChange={(e) => {
                  setEditWeightLb(e.target.value);
                  setEditError(null);
                }}
                fullWidth
                required
                error={!!editError}
                helperText={editError}
              />
              <DatePicker
                label="Date"
                value={editDate}
                onChange={(v) => setEditDate(v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button onClick={handleEditClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editSaving}
            sx={{ textTransform: 'none' }}
          >
            {editSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteEntry != null}
        onClose={handleDeleteClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, margin: 2 },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 600, fontSize: '1.125rem', py: 2, pb: 1.5 }}
        >
          Delete weigh-in?
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 2.5, py: 2 }}>
          {deleteEntry && (
            <Typography variant="body2" color="text.secondary">
              {dayjs.utc(deleteEntry.date).format('MMM D, YYYY')} —{' '}
              {(deleteEntry.weightKg * KG_TO_LB).toFixed(1)} lb. This cannot be
              undone.
            </Typography>
          )}
          {deleteError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 2.5, py: 2 }}>
          <Button onClick={handleDeleteClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteSaving}
            sx={{ textTransform: 'none' }}
          >
            {deleteSaving ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
