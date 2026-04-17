import { ThemeProvider } from "./components/theme-provider";
import type { Metadata, Viewport } from "next";

import "@livekit/components-styles";
import "@livekit/components-styles/prefabs";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "LiveKit Meet Agents",
  description: "LiveKit Meet with AI Agents",
};

export const viewport: Viewport = {
  themeColor: "#070707",
};

export default function LivekitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="antialiased">{children}</div>
    </ThemeProvider>
  );
}