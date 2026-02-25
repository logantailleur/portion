import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function HomePage() {
  return (
    <Box component="main" sx={{ minHeight: "100vh", p: 3 }}>
      <Typography variant="h5" component="h1" fontWeight={600}>
        Portion
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Foundation ready. Add features in <code>src/features</code>.
      </Typography>
    </Box>
  );
}
