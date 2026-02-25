import { createTheme, type PaletteMode } from "@mui/material/styles";

export const colors = {
	primary: "#0D9488", // Teal — main buttons, active states, headers, CTAs
	secondary: "#F59E0B", // Amber — secondary actions, highlights
	lightNeutral: "#F5F5F5", // Light Gray — backgrounds, cards
	darkNeutral: "#212121", // Dark Gray — primary text, icons
	accentFeedback: "#E53935", // Red — alerts, errors, over-limit
	successAccent: "#81C784", // Light Green — positive feedback, goals
} as const;

const getPalette = (mode: PaletteMode) =>
	mode === "light"
		? {
				mode: "light" as const,
				primary: {
					main: colors.primary,
					light: "#14B8A6",
					dark: "#0F766E",
					contrastText: "#ffffff",
				},
				secondary: {
					main: colors.secondary,
					light: "#FBBF24",
					dark: "#D97706",
					contrastText: "rgba(0, 0, 0, 0.87)",
				},
				error: {
					main: colors.accentFeedback,
					light: "#EF5350",
					dark: "#C62828",
					contrastText: "#ffffff",
				},
				warning: {
					main: colors.secondary,
					light: "#FBBF24",
					dark: "#D97706",
					contrastText: "rgba(0, 0, 0, 0.87)",
				},
				success: {
					main: colors.successAccent,
					light: "#A5D6A7",
					dark: "#66BB6A",
					contrastText: "rgba(0, 0, 0, 0.87)",
				},
				background: {
					default: "#F0F4F8", // Cool gray — airy blue-gray
					paper: "#ffffff",
				},
				text: {
					primary: colors.darkNeutral,
					secondary: "rgba(33, 33, 33, 0.7)",
					disabled: "rgba(33, 33, 33, 0.5)",
				},
				divider: "rgba(33, 33, 33, 0.12)",
			}
		: {
				mode: "dark" as const,
				primary: {
					main: colors.primary,
					light: "#14B8A6",
					dark: "#0F766E",
					contrastText: "#ffffff",
				},
				secondary: {
					main: colors.secondary,
					light: "#FBBF24",
					dark: "#D97706",
					contrastText: "rgba(0, 0, 0, 0.87)",
				},
				error: {
					main: colors.accentFeedback,
					light: "#EF5350",
					dark: "#C62828",
					contrastText: "#ffffff",
				},
				warning: {
					main: colors.secondary,
					light: "#FBBF24",
					dark: "#D97706",
					contrastText: "rgba(0, 0, 0, 0.87)",
				},
				success: {
					main: colors.successAccent,
					light: "#A5D6A7",
					dark: "#66BB6A",
					contrastText: "rgba(0, 0, 0, 0.87)",
				},
				background: {
					default: "#1A1F26", // Cool dark — slight blue tint
					paper: "#242B33",
				},
				text: {
					primary: colors.lightNeutral,
					secondary: "rgba(245, 245, 245, 0.7)",
					disabled: "rgba(245, 245, 245, 0.5)",
				},
				divider: "rgba(245, 245, 245, 0.12)",
			};

const lightShadows = [
	"none",
	"0 1px 2px rgba(33, 33, 33, 0.06)",
	"0 2px 8px rgba(33, 33, 33, 0.08)",
	"0 4px 12px rgba(33, 33, 33, 0.08)",
	"0 8px 24px rgba(33, 33, 33, 0.09)",
	"0 12px 32px rgba(33, 33, 33, 0.10)",
	"0 16px 40px rgba(33, 33, 33, 0.10)",
	"0 20px 48px rgba(33, 33, 33, 0.11)",
	"0 24px 56px rgba(33, 33, 33, 0.11)",
	"0 28px 64px rgba(33, 33, 33, 0.12)",
	"0 32px 72px rgba(33, 33, 33, 0.12)",
	"0 36px 80px rgba(33, 33, 33, 0.13)",
	"0 40px 88px rgba(33, 33, 33, 0.13)",
	"0 44px 96px rgba(33, 33, 33, 0.14)",
	"0 48px 104px rgba(33, 33, 33, 0.14)",
	"0 52px 112px rgba(33, 33, 33, 0.15)",
	"0 56px 120px rgba(33, 33, 33, 0.15)",
	"0 60px 128px rgba(33, 33, 33, 0.16)",
	"0 64px 136px rgba(33, 33, 33, 0.16)",
	"0 68px 144px rgba(33, 33, 33, 0.17)",
	"0 72px 152px rgba(33, 33, 33, 0.17)",
	"0 76px 160px rgba(33, 33, 33, 0.18)",
	"0 80px 168px rgba(33, 33, 33, 0.18)",
	"0 84px 176px rgba(33, 33, 33, 0.19)",
	"0 88px 184px rgba(33, 33, 33, 0.19)",
];

const darkShadows = [
	"none",
	"0 1px 2px rgba(0, 0, 0, 0.2)",
	"0 2px 8px rgba(0, 0, 0, 0.24)",
	"0 4px 12px rgba(0, 0, 0, 0.26)",
	"0 8px 24px rgba(0, 0, 0, 0.28)",
	"0 12px 32px rgba(0, 0, 0, 0.30)",
	"0 16px 40px rgba(0, 0, 0, 0.32)",
	"0 20px 48px rgba(0, 0, 0, 0.34)",
	"0 24px 56px rgba(0, 0, 0, 0.36)",
	"0 28px 64px rgba(0, 0, 0, 0.38)",
	"0 32px 72px rgba(0, 0, 0, 0.40)",
	"0 36px 80px rgba(0, 0, 0, 0.42)",
	"0 40px 88px rgba(0, 0, 0, 0.44)",
	"0 44px 96px rgba(0, 0, 0, 0.46)",
	"0 48px 104px rgba(0, 0, 0, 0.48)",
	"0 52px 112px rgba(0, 0, 0, 0.50)",
	"0 56px 120px rgba(0, 0, 0, 0.52)",
	"0 60px 128px rgba(0, 0, 0, 0.54)",
	"0 64px 136px rgba(0, 0, 0, 0.56)",
	"0 68px 144px rgba(0, 0, 0, 0.58)",
	"0 72px 152px rgba(0, 0, 0, 0.60)",
	"0 76px 160px rgba(0, 0, 0, 0.62)",
	"0 80px 168px rgba(0, 0, 0, 0.64)",
	"0 84px 176px rgba(0, 0, 0, 0.66)",
	"0 88px 184px rgba(0, 0, 0, 0.68)",
];

export function createAppTheme(mode: PaletteMode) {
	const palette = getPalette(mode);
	const shadows = (mode === "light"
		? lightShadows
		: darkShadows) as unknown as ReturnType<typeof createTheme>["shadows"];

	return createTheme({
		palette: { ...palette },
		shadows,
		shape: {
			borderRadius: 12,
		},
		typography: {
			fontFamily:
				'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
			h1: {
				fontWeight: 600,
				letterSpacing: "-0.02em",
			},
			h2: {
				fontWeight: 600,
				letterSpacing: "-0.02em",
			},
			h3: {
				fontWeight: 600,
				letterSpacing: "-0.01em",
			},
			h4: {
				fontWeight: 500,
				letterSpacing: "0.01em",
			},
			h5: {
				fontWeight: 500,
			},
			h6: {
				fontWeight: 500,
			},
		},
		spacing: 8,
		components: {
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						backgroundColor: palette.background?.default,
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						borderRadius: 10,
						textTransform: "none" as const,
						fontWeight: 500,
					},
				},
				defaultProps: {
					disableElevation: true,
					disableRipple: true,
				},
			},
			MuiButtonBase: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiIconButton: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 12,
						boxShadow:
							mode === "light"
								? "0 2px 8px rgba(33, 33, 33, 0.08)"
								: "0 2px 8px rgba(0, 0, 0, 0.24)",
					},
				},
			},
			MuiPaper: {
				styleOverrides: {
					root: {
						borderRadius: 12,
						boxShadow:
							mode === "light"
								? "0 2px 8px rgba(33, 33, 33, 0.08)"
								: "0 2px 8px rgba(0, 0, 0, 0.24)",
					},
				},
			},
			MuiTextField: {
				defaultProps: {
					size: "small",
				},
			},
			MuiInputBase: {
				styleOverrides: {
					root: {
						borderRadius: 10,
					},
				},
			},
			MuiOutlinedInput: {
				styleOverrides: {
					root: {
						borderRadius: 10,
					},
				},
			},
			MuiFilledInput: {
				styleOverrides: {
					root: {
						borderRadius: 10,
					},
				},
			},
			MuiChip: {
				styleOverrides: {
					root: {
						borderRadius: 8,
					},
				},
			},
			MuiDialog: {
				styleOverrides: {
					paper: {
						borderRadius: 12,
						boxShadow:
							mode === "light"
								? "0 8px 24px rgba(33, 33, 33, 0.09)"
								: "0 8px 24px rgba(0, 0, 0, 0.28)",
					},
				},
			},
			MuiMenu: {
				styleOverrides: {
					paper: {
						borderRadius: 12,
						boxShadow:
							mode === "light"
								? "0 4px 12px rgba(33, 33, 33, 0.08)"
								: "0 4px 12px rgba(0, 0, 0, 0.26)",
					},
				},
			},
			MuiPopover: {
				styleOverrides: {
					paper: {
						borderRadius: 12,
						boxShadow:
							mode === "light"
								? "0 4px 12px rgba(33, 33, 33, 0.08)"
								: "0 4px 12px rgba(0, 0, 0, 0.26)",
					},
				},
			},
			MuiCardContent: {
				styleOverrides: {
					root: {
						padding: 20,
						"&:last-child": {
							paddingBottom: 20,
						},
					},
				},
			},
			MuiCardHeader: {
				styleOverrides: {
					root: {
						padding: "20px 20px 12px",
					},
				},
			},
		},
	});
}

// Default export: light theme (for initial render / SSR)
const defaultTheme = createAppTheme("light");
export default defaultTheme;
