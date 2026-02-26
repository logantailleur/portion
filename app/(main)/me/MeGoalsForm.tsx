"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export type MeGoalsFormProps = {
	initialGoals: {
		calorieTarget: number | null;
		proteinTarget: number | null;
		carbsTarget: number | null;
		fatTarget: number | null;
	};
};

const DEFAULT_CAL = 2000;
const DEFAULT_PROTEIN = 150;
const DEFAULT_CARBS = 250;
const DEFAULT_FAT = 65;

function toNum(value: string): number {
	const n = parseInt(value, 10);
	return Number.isNaN(n) ? 0 : Math.max(0, n);
}

export default function MeGoalsForm({ initialGoals }: MeGoalsFormProps) {
	const [calorieTarget, setCalorieTarget] = useState(
		String(initialGoals.calorieTarget ?? DEFAULT_CAL),
	);
	const [proteinTarget, setProteinTarget] = useState(
		String(initialGoals.proteinTarget ?? DEFAULT_PROTEIN),
	);
	const [carbsTarget, setCarbsTarget] = useState(
		String(initialGoals.carbsTarget ?? DEFAULT_CARBS),
	);
	const [fatTarget, setFatTarget] = useState(
		String(initialGoals.fatTarget ?? DEFAULT_FAT),
	);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setMessage(null);
		setSaving(true);
		try {
			const res = await fetch("/api/user/update-goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					calorieTarget: toNum(calorieTarget),
					proteinTarget: toNum(proteinTarget),
					carbsTarget: toNum(carbsTarget),
					fatTarget: toNum(fatTarget),
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				setMessage({ type: "error", text: data.error ?? "Failed to update goals" });
				return;
			}
			setMessage({ type: "success", text: "Goals saved." });
		} catch {
			setMessage({ type: "error", text: "Failed to update goals" });
		} finally {
			setSaving(false);
		}
	}

	return (
		<Paper variant="elevation" elevation={0} sx={{ p: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
			<Typography variant="subtitle1" sx={{ mb: 2 }}>
				Daily targets
			</Typography>
			<form onSubmit={handleSubmit}>
				<Stack spacing={2}>
					<TextField
						label="Calories (kcal)"
						type="number"
						inputProps={{ min: 0, step: 1 }}
						value={calorieTarget}
						onChange={(e) => setCalorieTarget(e.target.value)}
						fullWidth
					/>
					<TextField
						label="Protein (g)"
						type="number"
						inputProps={{ min: 0, step: 1 }}
						value={proteinTarget}
						onChange={(e) => setProteinTarget(e.target.value)}
						fullWidth
					/>
					<TextField
						label="Carbs (g)"
						type="number"
						inputProps={{ min: 0, step: 1 }}
						value={carbsTarget}
						onChange={(e) => setCarbsTarget(e.target.value)}
						fullWidth
					/>
					<TextField
						label="Fat (g)"
						type="number"
						inputProps={{ min: 0, step: 1 }}
						value={fatTarget}
						onChange={(e) => setFatTarget(e.target.value)}
						fullWidth
					/>
					{message && (
						<Typography variant="body2" color={message.type === "error" ? "error" : "success.main"}>
							{message.text}
						</Typography>
					)}
					<Box>
						<Button type="submit" variant="contained" disabled={saving}>
							{saving ? "Saving…" : "Save goals"}
						</Button>
					</Box>
				</Stack>
			</form>
		</Paper>
	);
}
