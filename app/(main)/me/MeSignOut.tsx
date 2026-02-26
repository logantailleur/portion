"use client";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { signOut } from "next-auth/react";

export default function MeSignOut() {
	return (
		<Paper variant="elevation" elevation={0} sx={{ p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
				<Typography variant="subtitle2" color="text.secondary">
					Sign out of your account
				</Typography>
				<Button
					variant="outlined"
					color="primary"
					onClick={() => signOut({ callbackUrl: "/login" })}
				>
					Log out
				</Button>
			</Stack>
		</Paper>
	);
}
