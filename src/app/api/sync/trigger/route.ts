import { NextResponse } from "next/server";
import { syncWorker } from "@/modules/sync/application/SyncWorker";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: syncWorker.getStatus(),
  });
}

export async function POST() {
  const result = await syncWorker.runOnce();
  return NextResponse.json(
    {
      success: result.success,
      data: result,
    },
    { status: result.success ? 200 : 207 },
  );
}
