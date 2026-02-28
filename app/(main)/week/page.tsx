import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function WeekPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          Week
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your weekly progress, trends, and how you’re doing across the
          week.
        </Typography>
      </Box>
      <Paper
        variant="elevation"
        elevation={0}
        sx={{ p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <Typography variant="body2" color="text.secondary">
          Weekly overview will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
