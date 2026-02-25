"use client";

import AddIcon from "@mui/icons-material/Add";
import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const PILL_HEIGHT = 72;
const PILL_BOTTOM_INSET = 12;
const PILL_HORIZONTAL_INSET = 16;
const PILL_BORDER_RADIUS = 28;
const CENTER_BUTTON_SIZE = 88;
const MIN_TOUCH_TARGET = 44;

const leftTabs = [
	{ label: "Today", href: "/today", icon: <HomeIcon /> },
	{ label: "Week", href: "/week", icon: <BarChartIcon /> },
] as const;

const rightTabs = [
	{ label: "Recipes", href: "/recipes", icon: <RestaurantIcon /> },
	{ label: "Me", href: "/me", icon: <PersonIcon /> },
] as const;

const allTabs = [...leftTabs, ...rightTabs];

// Sliding pill: bar split [1/3][1/3][1/3], each tab 1/6 → Today=0%, Week=16.67%, Recipes=66.67%, Me=83.33%
const PILL_LEFT_PERCENT = [0, 16.67, 66.67, 83.33];
const PILL_WIDTH_PERCENT = 16.67;

export const PORTION_BOTTOM_NAV_HEIGHT = PILL_HEIGHT + PILL_BOTTOM_INSET + 8;

function NavAction({
	href,
	label,
	icon,
	isActive,
}: {
	href: string;
	label: string;
	icon: React.ReactNode;
	isActive: boolean;
}) {
	return (
		<IconButton
			component={NextLink}
			href={href}
			aria-label={label}
			aria-current={isActive ? "page" : undefined}
			sx={{
				flex: 1,
				flexDirection: "column",
				minHeight: MIN_TOUCH_TARGET,
				borderRadius: 2,
				backgroundColor: "transparent",
				color: isActive ? "primary.contrastText" : "text.secondary",
				mx: 0.5,
				position: "relative",
				zIndex: 1,
				"&:hover": {
					backgroundColor: isActive ? "transparent" : "action.hover",
				},
				"& .MuiSvgIcon-root": {
					fontSize: isActive ? "1.5rem" : "1.375rem",
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 0.25,
				}}
			>
				{icon}
				<Box
					component="span"
					sx={{
						fontSize: "0.75rem",
						fontWeight: isActive ? 700 : 500,
						lineHeight: 1,
					}}
				>
					{label}
				</Box>
			</Box>
		</IconButton>
	);
}

export function PortionBottomNav() {
	const pathname = usePathname();
	const activeIndex = allTabs.findIndex(
		(t) => pathname === t.href || pathname.startsWith(`${t.href}/`),
	);
	const slideLeft = activeIndex >= 0 ? PILL_LEFT_PERCENT[activeIndex] : 0;

	return (
		<Box
			component="nav"
			sx={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				display: "flex",
				justifyContent: "center",
				px: `${PILL_HORIZONTAL_INSET}px`,
				pb: `${PILL_BOTTOM_INSET}px`,
				pt: 1,
				zIndex: 1400,
			}}
		>
			<Box
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: 480,
					height: PILL_HEIGHT,
					borderRadius: PILL_BORDER_RADIUS,
					backgroundColor: "background.paper",
					boxShadow: (theme) =>
						theme.palette.mode === "dark"
							? "0 4px 24px rgba(0,0,0,0.4)"
							: "0 4px 24px rgba(0,0,0,0.08)",
					overflow: "visible",
					display: "flex",
					alignItems: "stretch",
				}}
			>
				{/* Sliding pill behind tabs */}
				{activeIndex >= 0 && (
					<Box
						sx={{
							position: "absolute",
							left: `${slideLeft}%`,
							top: 8,
							bottom: 8,
							width: `${PILL_WIDTH_PERCENT}%`,
							borderRadius: 2,
							backgroundColor: "primary.main",
							transition:
								"left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
							zIndex: 0,
						}}
					/>
				)}
				<Box
					sx={{
						flex: 1,
						display: "flex",
						position: "relative",
						zIndex: 1,
					}}
				>
					{leftTabs.map((item) => (
						<NavAction
							key={item.href}
							href={item.href}
							label={item.label}
							icon={item.icon}
							isActive={
								pathname === item.href ||
								pathname.startsWith(`${item.href}/`)
							}
						/>
					))}
				</Box>

				<Box
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<IconButton
						aria-label="Quick log food"
						sx={{
							width: CENTER_BUTTON_SIZE,
							height: CENTER_BUTTON_SIZE,
							backgroundColor: "primary.main",
							color: "primary.contrastText",
							boxShadow: (theme) =>
								theme.palette.mode === "dark"
									? "0 4px 20px rgba(0,0,0,0.5)"
									: "0 4px 20px rgba(13, 148, 136, 0.4)",
							"&:hover": {
								backgroundColor: "primary.dark",
							},
							"& .MuiSvgIcon-root": {
								fontSize: "2.25rem",
							},
						}}
					>
						<AddIcon />
					</IconButton>
				</Box>

				<Box
					sx={{
						flex: 1,
						display: "flex",
						position: "relative",
						zIndex: 1,
					}}
				>
					{rightTabs.map((item) => (
						<NavAction
							key={item.href}
							href={item.href}
							label={item.label}
							icon={item.icon}
							isActive={
								pathname === item.href ||
								pathname.startsWith(`${item.href}/`)
							}
						/>
					))}
				</Box>
			</Box>
		</Box>
	);
}

export default PortionBottomNav;
