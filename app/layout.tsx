import type { Metadata } from "next";
import { Inter, Anton } from "next/font/google";
import { SideNav } from "@/components/shell/SideNav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const LOGO_PATH = "/whtabtai-logo.png";

export const metadata: Metadata = {
  title: "What About AI · Studio",
  description:
    "The internal post studio for @whtabtai. AI news without the noise.",
  icons: {
    icon: [{ url: LOGO_PATH, type: "image/png", sizes: "1254x1254" }],
    shortcut: [LOGO_PATH],
    apple: [{ url: LOGO_PATH, sizes: "1254x1254" }],
  },
  openGraph: {
    title: "What About AI · Studio",
    description:
      "The internal post studio for @whtabtai. AI news without the noise.",
    siteName: "What About AI",
    images: [
      { url: LOGO_PATH, width: 1254, height: 1254, alt: "What About AI" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "What About AI · Studio",
    description:
      "The internal post studio for @whtabtai. AI news without the noise.",
    images: [LOGO_PATH],
  },
};

const editorialSidebarTheme = {
  "--sidebar": "#0a0908",
  "--sidebar-foreground": "#f4f1ea",
  "--sidebar-border": "#1d1a17",
  "--sidebar-accent": "rgba(244, 241, 234, 0.06)",
  "--sidebar-accent-foreground": "#ff4a1c",
  "--sidebar-primary": "#ff4a1c",
  "--sidebar-primary-foreground": "#0a0908",
  "--sidebar-ring": "#ff4a1c",
  "--sidebar-width-icon": "4rem",
} as React.CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="h-screen overflow-hidden bg-[color:var(--color-paper)] text-[color:var(--color-ink)]"
      >
        <TooltipProvider delay={0}>
          <SidebarProvider defaultOpen={false} style={editorialSidebarTheme}>
            <SideNav />
            <SidebarInset className="h-screen min-w-0 overflow-hidden bg-[color:var(--color-paper)]">
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
