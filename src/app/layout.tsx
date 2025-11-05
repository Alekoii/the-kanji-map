import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider as JotaiProvider } from "jotai";
import { Noto_Sans_JP } from "next/font/google";
import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Kanji Learn - Master Japanese Kanji with Interactive Visual Learning", template: "%s | Kanji Learn" },
  description:
    "Learn Japanese kanji efficiently with interactive 3D visualizations, decomposition graphs, stroke animations, and practice quizzes. Master 2000+ kanji, track your progress, and explore radical connections. Perfect for JLPT preparation and Japanese language learners.",
  keywords: [
    "kanji learning",
    "learn Japanese kanji",
    "Japanese language learning",
    "kanji practice",
    "JLPT kanji",
    "kanji decomposition",
    "kanji radicals",
    "Japanese characters",
    "kanji study",
    "kanji flashcards",
    "Japanese writing system",
    "kanji meanings",
    "kanji readings",
    "onyomi kunyomi",
    "joyo kanji",
    "kanji stroke order",
    "interactive kanji learning",
  ],
  openGraph: {
    title: "Kanji Learn - Master Japanese Kanji with Interactive Visual Learning",
    description:
      "Learn Japanese kanji efficiently with interactive 3D visualizations, decomposition graphs, and practice quizzes. Master 2000+ kanji with visual learning tools.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kanji Learn - Master Japanese Kanji",
    description: "Learn Japanese kanji efficiently with interactive visualizations and practice tools.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  // themeColor: "#2b99cf",
};

const notoSansJp = Noto_Sans_JP({
  weight: "variable",
  subsets: ["latin-ext"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
  adjustFontFallback: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={notoSansJp.className}>
      <body className="w-screen h-screen overflow-hidden bg-background text-foreground selection:bg-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <JotaiProvider>
              <div className="isolate size-full">{children}</div>
            </JotaiProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
