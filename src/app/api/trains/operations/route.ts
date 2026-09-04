import { NextRequest, NextResponse } from "next/server";
import { getTrackedTrainOperations } from "@/actions/trains";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || "2026-09-04";
  const source = searchParams.get("source") || "NDLS";
  const destination = searchParams.get("destination") || "MTJ";

  const result = await getTrackedTrainOperations({ date, source, destination });
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to fetch tracked train operations" },
      { status: result.status || 500 }
    );
  }
  return NextResponse.json(result.data);
}
