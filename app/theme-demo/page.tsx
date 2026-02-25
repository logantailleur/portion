"use client";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Rating from "@mui/material/Rating";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { BarChart, Gauge, LineChart, PieChart } from "@mui/x-charts";
import { useThemeMode } from "@/app/ThemeModeContext";
import { colors } from "@/theme";
import AddIcon from "@mui/icons-material/Add";
import CakeIcon from "@mui/icons-material/Cake";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const PALETTE_SWATCHES = [
  {
    name: "Primary",
    hex: colors.primary,
    purpose: "Main buttons, active states, headers, key CTAs",
    themeKey: "primary.main" as const,
  },
  {
    name: "Secondary",
    hex: colors.secondary,
    purpose: "Secondary actions, highlights, interactive elements",
    themeKey: "secondary.main" as const,
  },
  {
    name: "Light neutral",
    hex: colors.lightNeutral,
    purpose: "Backgrounds, cards, containers",
    themeKey: "background.default" as const,
    showBorder: true,
  },
  {
    name: "Dark neutral",
    hex: colors.darkNeutral,
    purpose: "Primary text, icons, readable content",
    themeKey: "text.primary" as const,
  },
  {
    name: "Accent / feedback",
    hex: colors.accentFeedback,
    purpose: "Alerts, errors, over calorie limit",
    themeKey: "error.main" as const,
  },
  {
    name: "Success accent",
    hex: colors.successAccent,
    purpose: "Positive feedback, e.g. hitting goals",
    themeKey: "success.main" as const,
  },
];

export default function ThemeDemoPage() {
  const { mode, toggleMode } = useThemeMode();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 6,
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            Theme demo
          </Typography>
          <Button color="inherit" onClick={toggleMode}>
            {mode === "light" ? "Dark" : "Light"} mode
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 960, mx: "auto", py: 4, px: 2 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Full component preview. Toggle mode with the app bar button.
        </Typography>

        {/* Palette */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Palette" subheader="Design tokens" />
          <CardContent>
            <Stack spacing={3}>
              {PALETTE_SWATCHES.map((swatch) => (
                <Stack
                  key={swatch.name}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "center" }}
                  gap={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "100%", sm: 120 },
                      height: 72,
                      borderRadius: 2,
                      backgroundColor: swatch.hex,
                      ...(swatch.showBorder || swatch.themeKey === "background.default"
                        ? { border: "1px solid", borderColor: "divider" as const }
                        : {}),
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {swatch.name}
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace" color="text.secondary" sx={{ mb: 0.5 }}>
                      {swatch.hex}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {swatch.purpose}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="h2" sx={{ mb: 2 }}>
          Components
        </Typography>

        <Stack spacing={3}>
          {/* Buttons */}
          <Card>
            <CardHeader title="Buttons" />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  <Button variant="contained">Contained</Button>
                  <Button variant="contained" color="secondary">Secondary</Button>
                  <Button variant="contained" color="success">Success</Button>
                  <Button variant="contained" color="error">Error</Button>
                  <Button variant="outlined">Outlined</Button>
                  <Button variant="text">Text</Button>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  <Button variant="contained" size="small">Small</Button>
                  <Button variant="contained" size="medium">Medium</Button>
                  <Button variant="contained" size="large">Large</Button>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  <Button variant="contained" disabled>Disabled</Button>
                  <Button variant="outlined" disabled>Disabled</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardHeader title="Tabs" />
            <CardContent>
              <Tabs value={0} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tab label="Tab one" />
                <Tab label="Tab two" />
                <Tab label="Tab three" />
              </Tabs>
              <Typography variant="body2" color="text.secondary">
                Tab content area (first tab selected).
              </Typography>
            </CardContent>
          </Card>

          {/* Form controls */}
          <Card>
            <CardHeader title="Form controls" />
            <CardContent>
              <Stack spacing={3} sx={{ maxWidth: 400 }}>
                <TextField label="Text field" placeholder="Placeholder" fullWidth />
                <TextField label="Filled" variant="filled" fullWidth />
                <TextField label="With error" error helperText="Helper text" fullWidth />
                <FormControl fullWidth size="small">
                  <InputLabel>Select</InputLabel>
                  <Select label="Select" value="">
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="a">Option A</MenuItem>
                    <MenuItem value="b">Option B</MenuItem>
                  </Select>
                </FormControl>
                <FormGroup row>
                  <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
                  <FormControlLabel control={<Checkbox />} label="Unchecked" />
                  <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
                </FormGroup>
                <RadioGroup row defaultValue="one">
                  <FormControlLabel value="one" control={<Radio />} label="One" />
                  <FormControlLabel value="two" control={<Radio />} label="Two" />
                </RadioGroup>
                <FormControlLabel control={<Switch defaultChecked />} label="Switch on" />
                <FormControlLabel control={<Switch />} label="Switch off" />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Slider</Typography>
                  <Slider defaultValue={50} valueLabelDisplay="auto" />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader title="Progress" />
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Linear (default)</Typography>
                  <LinearProgress sx={{ mb: 1 }} />
                  <LinearProgress color="secondary" sx={{ mb: 1 }} />
                  <LinearProgress color="success" variant="determinate" value={70} />
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={24} />
                  <CircularProgress size={32} color="secondary" />
                  <CircularProgress size={40} color="success" variant="determinate" value={60} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader title="Alerts" />
            <CardContent>
              <Stack spacing={2}>
                <Alert severity="success">Success — goal completed.</Alert>
                <Alert severity="info">Info — tip or context.</Alert>
                <Alert severity="warning">Warning — consider changing something.</Alert>
                <Alert severity="error">Error — something went wrong.</Alert>
                <Alert variant="outlined" severity="success">Outlined success</Alert>
                <Alert variant="filled" severity="error">Filled error</Alert>
              </Stack>
            </CardContent>
          </Card>

          {/* Dialog */}
          <Card>
            <CardHeader title="Dialog" subheader="Modal with title, content, and actions" />
            <CardContent>
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Open dialog
              </Button>
              <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Dialog title</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    This is a theme-styled dialog. It uses the same 12px border radius and
                    subtle shadow as other surfaces. Use dialogs for confirmations or
                    short forms.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button variant="contained" onClick={() => setDialogOpen(false)} autoFocus>
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </CardContent>
          </Card>

          {/* Chips */}
          <Card>
            <CardHeader title="Chips" />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Chip label="Default" />
                <Chip label="Primary" color="primary" />
                <Chip label="Secondary" color="secondary" />
                <Chip label="Success" color="success" />
                <Chip label="Error" color="error" />
                <Chip label="Outlined" variant="outlined" />
                <Chip label="Clickable" onClick={() => {}} />
                <Chip label="Deletable" onDelete={() => {}} />
              </Stack>
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader title="List" />
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <List disablePadding>
                <ListItemButton>
                  <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="List item with icon" secondary="Secondary text" />
                </ListItemButton>
                <Divider component="li" />
                <ListItemButton>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary="Another item" />
                </ListItemButton>
                <Divider component="li" />
                <ListItem>
                  <ListItemAvatar><Avatar><PersonIcon /></Avatar></ListItemAvatar>
                  <ListItemText primary="Item with avatar" secondary="Subtext" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader title="Table" />
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Calories</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Breakfast</TableCell>
                      <TableCell align="right">420</TableCell>
                      <TableCell align="right"><Chip label="OK" color="success" size="small" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lunch</TableCell>
                      <TableCell align="right">650</TableCell>
                      <TableCell align="right"><Chip label="OK" color="success" size="small" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Snack</TableCell>
                      <TableCell align="right">180</TableCell>
                      <TableCell align="right"><Chip label="Over" color="error" size="small" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Accordion */}
          <Card>
            <CardHeader title="Accordion" />
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Accordion defaultExpanded disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: 1, borderColor: "divider" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Section one</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Content for the first section.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: 1, borderColor: "divider" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Section two</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Content for the second section.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Avatar, Badge, Tooltip */}
          <Card>
            <CardHeader title="Avatar, Badge, Tooltip" />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" alignItems="center" gap={3}>
                <Avatar sx={{ bgcolor: "primary.main" }}>A</Avatar>
                <Avatar sx={{ bgcolor: "secondary.main" }}>B</Avatar>
                <Avatar src="" alt="User" />
                <Badge badgeContent={4} color="primary">
                  <Avatar sx={{ bgcolor: "primary.main" }}>N</Avatar>
                </Badge>
                <Badge badgeContent={99} color="error">
                  <NotificationsIcon />
                </Badge>
                <Tooltip title="Tooltip text">
                  <Button variant="outlined">Hover for tooltip</Button>
                </Tooltip>
              </Stack>
            </CardContent>
          </Card>

          {/* Divider, Link, Breadcrumbs */}
          <Card>
            <CardHeader title="Divider, Link, Breadcrumbs" />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2">Text above</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">Text below</Typography>
                </Box>
                <Link href="#" color="primary">Primary link</Link>
                <Link href="#" color="secondary">Secondary link</Link>
                <Breadcrumbs aria-label="breadcrumb">
                  <Link href="#" color="inherit">Home</Link>
                  <Link href="#" color="inherit">Section</Link>
                  <Typography color="text.primary">Current</Typography>
                </Breadcrumbs>
              </Stack>
            </CardContent>
          </Card>

          {/* Fab, Rating, Skeleton */}
          <Card>
            <CardHeader title="Fab, Rating, Skeleton" />
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Fab color="primary" size="small" aria-label="add"><AddIcon /></Fab>
                  <Fab color="secondary" size="medium" aria-label="add"><AddIcon /></Fab>
                  <Fab variant="extended" color="primary">Extended</Fab>
                </Stack>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Rating</Typography>
                  <Rating value={3} readOnly />
                  <Rating value={2.5} precision={0.5} readOnly sx={{ ml: 2 }} />
                </Box>
                <Stack spacing={1} sx={{ maxWidth: 300 }}>
                  <Skeleton variant="text" />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="rectangular" height={60} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Charts */}
          <Card>
            <CardHeader title="Charts (MUI X)" subheader="Bar, line, pie, and gauge" />
            <CardContent>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Bar chart</Typography>
                  <BarChart
                    xAxis={[{ scaleType: "band", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] }]}
                    series={[{ data: [420, 650, 380, 720, 540], label: "Calories" }]}
                    height={260}
                    margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Line chart</Typography>
                  <LineChart
                    xAxis={[{ data: [1, 2, 3, 4, 5], scaleType: "point" }]}
                    series={[{ data: [30, 50, 40, 70, 60], label: "Trend" }]}
                    height={260}
                    margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Pie chart</Typography>
                  <PieChart
                    series={[
                      {
                        data: [
                          { id: "breakfast", value: 420, label: "Breakfast" },
                          { id: "lunch", value: 650, label: "Lunch" },
                          { id: "dinner", value: 540, label: "Dinner" },
                          { id: "snacks", value: 210, label: "Snacks" },
                        ],
                        highlightScope: { fade: "global", highlight: "item" },
                      },
                    ]}
                    height={260}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Gauge</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={3} alignItems="flex-start">
                    <Gauge value={75} width={180} height={180} />
                    <Gauge value={40} valueMin={0} valueMax={100} startAngle={-110} endAngle={110} width={180} height={120} />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Date & time pickers */}
          <Card>
            <CardHeader title="Date & time pickers (MUI X)" subheader="DatePicker, TimePicker, DateTimePicker" />
            <CardContent>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={3} sx={{ maxWidth: 320 }}>
                  <DatePicker label="Date" slotProps={{ textField: { fullWidth: true } }} />
                  <TimePicker label="Time" slotProps={{ textField: { fullWidth: true } }} />
                  <DateTimePicker label="Date and time" slotProps={{ textField: { fullWidth: true } }} />
                </Stack>
              </LocalizationProvider>
            </CardContent>
          </Card>

          {/* Icons */}
          <Card>
            <CardHeader title="Icons (MUI Icons Material)" subheader="Sample icons with sizes and colors" />
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="body2" color="text.secondary">Default & color</Typography>
                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={2}>
                  <RestaurantIcon />
                  <CakeIcon color="primary" />
                  <FitnessCenterIcon color="secondary" />
                  <FavoriteIcon color="error" />
                  <TrendingUpIcon color="success" />
                </Stack>
                <Typography variant="body2" color="text.secondary">Sizes</Typography>
                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={2}>
                  <RestaurantIcon fontSize="small" />
                  <RestaurantIcon fontSize="medium" />
                  <RestaurantIcon fontSize="large" />
                  <RestaurantIcon sx={{ fontSize: 48 }} />
                </Stack>
                <Typography variant="body2" color="text.secondary">In buttons & chips</Typography>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  <Button variant="contained" startIcon={<AddIcon />}>Add</Button>
                  <Button variant="outlined" startIcon={<PersonIcon />}>Profile</Button>
                  <Chip icon={<RestaurantIcon />} label="Food" />
                  <Chip icon={<FitnessCenterIcon />} label="Workout" color="primary" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Paper variants */}
          <Card>
            <CardHeader title="Paper variants" />
            <CardContent>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                <Paper sx={{ p: 2, width: 140, textAlign: "center" }}>Default</Paper>
                <Paper variant="outlined" sx={{ p: 2, width: 140, textAlign: "center" }}>Outlined</Paper>
                <Paper elevation={3} sx={{ p: 2, width: 140, textAlign: "center" }}>Elevation 3</Paper>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
