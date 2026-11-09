import type { NextRequest } from "next/server";
import { announcementsController } from "./_factory";

export async function GET(): Promise<Response> {
  return await announcementsController.getAnnouncements();
}

export async function POST(request: NextRequest): Promise<Response> {
  return await announcementsController.createAnnouncement(request);
}

