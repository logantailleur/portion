import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function RecipesPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
          Recipes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Save and use your favorite recipes. Log a full recipe in one tap.
        </Typography>
      </Box>
      <Paper variant="elevation" elevation={0} sx={{ p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Typography variant="body2" color="text.secondary">
          Your recipes will appear here.
        </Typography>
      </Paper>
    </Box>
  );
}
