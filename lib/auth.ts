import { prisma } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/** Session duration in seconds. 1 year so PWA users aren’t asked to log in often. */
const SESSION_MAX_AGE = 365 * 24 * 60 * 60;

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: "jwt",
		maxAge: SESSION_MAX_AGE,
		updateAge: 24 * 60 * 60, // refresh session if older than 24h (extends expiry on activity)
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session: async ({ session, token }) => {
			if (session.user) {
				(session.user as { id: string }).id = token.id as string;
			}
			return session;
		},
	},
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}
				const email = String(credentials.email);
				const rows = await prisma.$queryRaw<
					{ id: string; email: string; password: string | null }[]
				>`SELECT id, email, password FROM "User" WHERE email = ${email} LIMIT 1`;
				const user = rows[0];
				if (!user?.password) {
					return null;
				}
				const valid = await bcrypt.compare(
					String(credentials.password),
					user.password,
				);
				if (!valid) {
					return null;
				}
				return {
					id: user.id,
					email: user.email,
					name: null,
					image: null,
				};
			},
		}),
	],
};
