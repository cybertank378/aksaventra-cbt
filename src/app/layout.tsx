import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import AppToastProvider from "@/libs/providers/AppToastProvider";

export const metadata: Metadata = {
  title: {
    default: "Aksaventra CBT",
    template: "%s | Aksaventra CBT",
  },
  description:
    "Aksaventra CBT: Sistem Ujian Berbasis Komputer terintegrasi Moodle untuk sekolah.",
  applicationName: "Aksaventra CBT",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png" },
      {
        url: "/assets/images/logo/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png" }],
  },
};

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`
          ${plusJakartaSans.variable}
          ${jetbrainsMono.variable}
          bg-background
          text-foreground
          antialiased
        `}
      >
        <AppToastProvider>{children}</AppToastProvider>
      </body>
    </html>
  );
}
