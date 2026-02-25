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
import { useCallback, useEffect, useRef, useState } from "react";

const PILL_HEIGHT = 72;
const PILL_BOTTOM_INSET = 12;
const PILL_HORIZONTAL_INSET = 8;
const PILL_BORDER_RADIUS = 28;
const CENTER_BUTTON_SIZE = 88;
const MIN_TOUCH_TARGET = 44;
const NAV_MAX_WIDTH = 560;

const leftTabs = [
	{ label: "Today", href: "/today", icon: <HomeIcon /> },
	{ label: "Week", href: "/week", icon: <BarChartIcon /> },
] as const;

const rightTabs = [
	{ label: "Recipes", href: "/recipes", icon: <RestaurantIcon /> },
	{ label: "Me", href: "/me", icon: <PersonIcon /> },
] as const;

const allTabs = [...leftTabs, ...rightTabs];

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
	const barRef = useRef<HTMLDivElement>(null);
	const tabRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
	const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

	const updatePillPosition = useCallback(() => {
		if (activeIndex < 0 || !barRef.current) return;
		const tabEl = tabRefs.current[activeIndex];
		if (!tabEl) return;
		const barRect = barRef.current.getBoundingClientRect();
		const tabRect = tabEl.getBoundingClientRect();
		setPillStyle({
			left: tabRect.left - barRect.left,
			width: tabRect.width,
		});
	}, [activeIndex]);

	useEffect(() => {
		const run = () => requestAnimationFrame(updatePillPosition);
		run();
		const ro = new ResizeObserver(run);
		if (barRef.current) ro.observe(barRef.current);
		return () => ro.disconnect();
	}, [updatePillPosition, activeIndex]);

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
				ref={barRef}
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: NAV_MAX_WIDTH,
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
				{/* Sliding pill — position from measured tab */}
				{activeIndex >= 0 && pillStyle && (
					<Box
						sx={{
							position: "absolute",
							left: pillStyle.left,
							top: 8,
							bottom: 8,
							width: pillStyle.width,
							borderRadius: 2,
							backgroundColor: "primary.main",
							transition:
								"left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
							zIndex: 0,
						}}
					/>
				)}
				<Box
					ref={(el: HTMLDivElement | null) => { tabRefs.current[0] = el; }}
					sx={{ flex: 1, display: "flex", position: "relative", zIndex: 1 }}
				>
					<NavAction
						href={leftTabs[0].href}
						label={leftTabs[0].label}
						icon={leftTabs[0].icon}
						isActive={pathname === leftTabs[0].href || pathname.startsWith(`${leftTabs[0].href}/`)}
					/>
				</Box>
				<Box
					ref={(el: HTMLDivElement | null) => { tabRefs.current[1] = el; }}
					sx={{ flex: 1, display: "flex", position: "relative", zIndex: 1 }}
				>
					<NavAction
						href={leftTabs[1].href}
						label={leftTabs[1].label}
						icon={leftTabs[1].icon}
						isActive={pathname === leftTabs[1].href || pathname.startsWith(`${leftTabs[1].href}/`)}
					/>
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
					ref={(el: HTMLDivElement | null) => { tabRefs.current[2] = el; }}
					sx={{ flex: 1, display: "flex", position: "relative", zIndex: 1 }}
				>
					<NavAction
						href={rightTabs[0].href}
						label={rightTabs[0].label}
						icon={rightTabs[0].icon}
						isActive={pathname === rightTabs[0].href || pathname.startsWith(`${rightTabs[0].href}/`)}
					/>
				</Box>
				<Box
					ref={(el: HTMLDivElement | null) => { tabRefs.current[3] = el; }}
					sx={{ flex: 1, display: "flex", position: "relative", zIndex: 1 }}
				>
					<NavAction
						href={rightTabs[1].href}
						label={rightTabs[1].label}
						icon={rightTabs[1].icon}
						isActive={pathname === rightTabs[1].href || pathname.startsWith(`${rightTabs[1].href}/`)}
					/>
				</Box>
			</Box>
		</Box>
	);
}

export default PortionBottomNav;
