import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    serverTime: Date.now(),
    system: "Aksaventra CBT Engine",
    version: "1.0.0",
  });
}

