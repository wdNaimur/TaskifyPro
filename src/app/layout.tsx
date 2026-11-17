import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Inter is Taskify's primary font.
 * next/font/google loads it with zero layout shift — it's self-hosted
 * at build time, so no external network requests at runtime.
 *
 * We expose it as the CSS variable --font-inter, which globals.css
 * passes to Tailwind's --font-sans token.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taskify",
  description: "Your personal productivity cockpit — tasks, habits, and deep work in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
