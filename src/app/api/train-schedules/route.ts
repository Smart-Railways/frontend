import { NextResponse } from "next/server";
import { getTrainSchedules } from "@/actions/schedules";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getTrainSchedules();
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to fetch train schedules" },
      { status: result.status || 500 }
    );
  }
  return NextResponse.json(result.data ?? []);
}
