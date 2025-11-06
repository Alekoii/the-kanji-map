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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP:wght@200..900&family=M+PLUS+Rounded+1c:wght@100;300;400;500;700;800;900&family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&family=Zen+Maru+Gothic:wght@300;400;500;700;900&family=Kosugi+Maru&family=Sawarabi+Gothic&family=Sawarabi+Mincho&family=Shippori+Mincho:wght@400;500;600;700;800&family=Klee+One:wght@400;600&family=Yusei+Magic&family=Dela+Gothic+One&family=Reggae+One&family=Hachi+Maru+Pop&family=RocknRoll+One&family=Inter:wght@100..900&family=Roboto:wght@100;300;400;500;700;900&family=Open+Sans:wght@300..800&family=Lato:wght@100;300;400;700;900&family=Montserrat:wght@100..900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Source+Sans+3:wght@200..900&family=Raleway:wght@100..900&family=Nunito:wght@200..1000&family=Ubuntu:wght@300;400;500;700&family=Playfair+Display:wght@400..900&family=Merriweather:wght@300;400;700;900&family=Lora:wght@400..700&family=PT+Serif:wght@400;700&family=Crimson+Text:wght@400;600;700&family=Fira+Sans:wght@100;200;300;400;500;600;700;800;900&family=Work+Sans:wght@100..900&family=DM+Sans:wght@100..1000&family=Space+Grotesk:wght@300..700&family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="w-screen h-screen overflow-hidden bg-background text-foreground selection:bg-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "warm", "warm-dark", "system"]}
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
