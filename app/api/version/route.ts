import { NextResponse } from "next/server";

/**
 * Returns a stable build/deploy identifier so the client can detect when
 * a new version has been deployed and trigger a reload.
 * On Vercel, VERCEL_GIT_COMMIT_SHA changes each deploy.
 */
export function GET() {
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_BUILD_ID ??
    "dev";
  return NextResponse.json({ buildId }, { headers: { "Cache-Control": "no-store" } });
}
