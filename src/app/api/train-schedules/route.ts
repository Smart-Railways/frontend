import { NextRequest, NextResponse } from "next/server";
import { getTrainSchedules, getPaginatedTrainSchedules } from "@/actions/schedules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const date = searchParams.get("date") || undefined;
  const source =
    searchParams.get("source") ||
    searchParams.get("src") ||
    searchParams.get("source_station") ||
    searchParams.get("src_station") ||
    undefined;
  const destination =
    searchParams.get("destination") ||
    searchParams.get("dest") ||
    searchParams.get("dst") ||
    searchParams.get("destination_station") ||
    searchParams.get("dest_station") ||
    undefined;
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("page_size");
  const paginatedFlag = searchParams.get("paginated") === "true";

  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  const page_size = pageSizeParam ? parseInt(pageSizeParam, 10) : undefined;

  const params = {
    date,
    source,
    destination,
    page,
    page_size,
  };

  if (paginatedFlag || page !== undefined || page_size !== undefined) {
    const result = await getPaginatedTrainSchedules(params);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch train schedules" },
        { status: result.status || 500 }
      );
    }
    return NextResponse.json(result.data);
  }

  const result = await getTrainSchedules(params);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to fetch train schedules" },
      { status: result.status || 500 }
    );
  }
  return NextResponse.json(result.data ?? []);
}
