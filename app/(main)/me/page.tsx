import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MeGoalsForm from "./MeGoalsForm";
import MeSignOut from "./MeSignOut";

export default async function MePage() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		redirect("/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			calorieTarget: true,
			proteinTarget: true,
			carbsTarget: true,
			fatTarget: true,
		},
	});

	const initialGoals = {
		calorieTarget: user?.calorieTarget ?? null,
		proteinTarget: user?.proteinTarget ?? null,
		carbsTarget: user?.carbsTarget ?? null,
		fatTarget: user?.fatTarget ?? null,
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box>
				<Typography component="h1" variant="h4" sx={{ mb: 1 }}>
					Me
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Your profile, goals, and settings. Adjust targets and preferences here.
				</Typography>
			</Box>
			<MeGoalsForm initialGoals={initialGoals} />
			<MeSignOut />
		</Box>
	);
}
