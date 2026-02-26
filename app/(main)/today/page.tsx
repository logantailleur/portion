import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function TodayPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          Today
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your meals and macros for today. Log what you eat and stay on
          top of your goals.
        </Typography>
      </Box>
      <Paper
        variant="elevation"
        elevation={0}
        sx={{ p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <Typography variant="body2" color="text.secondary">
          Your daily log will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
