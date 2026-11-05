import type { NextRequest } from "next/server";
import { proxyMiddleware } from "./proxy";

export async function middleware(request: NextRequest) {
  return await proxyMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, assets, fonts
     */
    "/((?!_next/static|_next/image|favicon.ico|images|assets|fonts).*)",
  ],
};
