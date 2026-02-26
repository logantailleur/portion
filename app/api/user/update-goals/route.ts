import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

function isValidGoalValue(value: unknown): value is number {
	return (
		typeof value === "number" &&
		!Number.isNaN(value) &&
		Number.isInteger(value) &&
		value >= 0
	);
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		const calorieTarget = body.calorieTarget;
		const proteinTarget = body.proteinTarget;
		const carbsTarget = body.carbsTarget;
		const fatTarget = body.fatTarget;

		if (!isValidGoalValue(calorieTarget)) {
			return Response.json(
				{ error: "Invalid calorieTarget: must be a non-negative integer" },
				{ status: 400 },
			);
		}
		if (!isValidGoalValue(proteinTarget)) {
			return Response.json(
				{ error: "Invalid proteinTarget: must be a non-negative integer" },
				{ status: 400 },
			);
		}
		if (!isValidGoalValue(carbsTarget)) {
			return Response.json(
				{ error: "Invalid carbsTarget: must be a non-negative integer" },
				{ status: 400 },
			);
		}
		if (!isValidGoalValue(fatTarget)) {
			return Response.json(
				{ error: "Invalid fatTarget: must be a non-negative integer" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				calorieTarget,
				proteinTarget,
				carbsTarget,
				fatTarget,
			},
		});

		return Response.json(
			{
				calorieTarget: user.calorieTarget,
				proteinTarget: user.proteinTarget,
				carbsTarget: user.carbsTarget,
				fatTarget: user.fatTarget,
			},
			{ status: 200 },
		);
	} catch (err) {
		console.error("update-goals:", err);
		return Response.json(
			{ error: "Failed to update goals" },
			{ status: 500 },
		);
	}
}
