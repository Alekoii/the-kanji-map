"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

const JAPANESE_FONTS = [
  { name: "Noto Sans JP", value: "'Noto Sans JP', sans-serif" },
  { name: "Noto Serif JP", value: "'Noto Serif JP', serif" },
  { name: "M PLUS Rounded 1c", value: "'M PLUS Rounded 1c', sans-serif" },
  { name: "Zen Kaku Gothic New", value: "'Zen Kaku Gothic New', sans-serif" },
  { name: "Zen Maru Gothic", value: "'Zen Maru Gothic', sans-serif" },
  { name: "Kosugi Maru", value: "'Kosugi Maru', sans-serif" },
  { name: "Sawarabi Gothic", value: "'Sawarabi Gothic', sans-serif" },
  { name: "Sawarabi Mincho", value: "'Sawarabi Mincho', serif" },
  { name: "Shippori Mincho", value: "'Shippori Mincho', serif" },
  { name: "Klee One", value: "'Klee One', cursive" },
  { name: "Yusei Magic", value: "'Yusei Magic', sans-serif" },
  { name: "Dela Gothic One", value: "'Dela Gothic One', sans-serif" },
  { name: "Reggae One", value: "'Reggae One', cursive" },
  { name: "Hachi Maru Pop", value: "'Hachi Maru Pop', cursive" },
  { name: "RocknRoll One", value: "'RocknRoll One', sans-serif" },
];

const ENGLISH_FONTS = [
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Open Sans", value: "'Open Sans', sans-serif" },
  { name: "Lato", value: "'Lato', sans-serif" },
  { name: "Montserrat", value: "'Montserrat', sans-serif" },
  { name: "Poppins", value: "'Poppins', sans-serif" },
  { name: "Source Sans 3", value: "'Source Sans 3', sans-serif" },
  { name: "Raleway", value: "'Raleway', sans-serif" },
  { name: "Nunito", value: "'Nunito', sans-serif" },
  { name: "Ubuntu", value: "'Ubuntu', sans-serif" },
  { name: "Playfair Display", value: "'Playfair Display', serif" },
  { name: "Merriweather", value: "'Merriweather', serif" },
  { name: "Lora", value: "'Lora', serif" },
  { name: "PT Serif", value: "'PT Serif', serif" },
  { name: "Crimson Text", value: "'Crimson Text', serif" },
  { name: "Fira Sans", value: "'Fira Sans', sans-serif" },
  { name: "Work Sans", value: "'Work Sans', sans-serif" },
  { name: "DM Sans", value: "'DM Sans', sans-serif" },
  { name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { name: "Manrope", value: "'Manrope', sans-serif" },
];

const THEMES = [
  { name: "Default", value: "default" },
  { name: "Warm", value: "warm" },
];

const MODES = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
  { name: "System", value: "system" },
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colorTheme, setColorTheme] = useState("default");
  const [mode, setMode] = useState<"light" | "dark" | "system">("system");
  const [japaneseFont, setJapaneseFont] = useState(JAPANESE_FONTS[0].value);
  const [englishFont, setEnglishFont] = useState(ENGLISH_FONTS[0].value);

  useEffect(() => {
    setMounted(true);

    // Load saved preferences
    const savedColorTheme = localStorage.getItem("color-theme") || "default";
    const savedMode = localStorage.getItem("theme-mode") as "light" | "dark" | "system" | null;
    const savedJapaneseFont = localStorage.getItem("japanese-font");
    const savedEnglishFont = localStorage.getItem("english-font");

    setColorTheme(savedColorTheme);
    if (savedMode) setMode(savedMode);
    if (savedJapaneseFont) setJapaneseFont(savedJapaneseFont);
    if (savedEnglishFont) setEnglishFont(savedEnglishFont);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply fonts
    document.documentElement.style.setProperty("--font-japanese", japaneseFont);
    document.documentElement.style.setProperty("--font-english", englishFont);
    localStorage.setItem("japanese-font", japaneseFont);
    localStorage.setItem("english-font", englishFont);
  }, [japaneseFont, englishFont, mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Handle system mode with warm theme - listen for system preference changes
    if (mode === "system" && colorTheme === "warm") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const updateTheme = () => {
        setTheme(mediaQuery.matches ? "warm-dark" : "warm");
      };

      updateTheme();
      mediaQuery.addEventListener("change", updateTheme);

      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [mode, colorTheme, mounted, setTheme]);

  const applyTheme = (newMode: string, newColorTheme: string) => {
    if (newMode === "system") {
      if (newColorTheme === "default") {
        setTheme("system");
      } else {
        // For warm theme with system mode, set based on current system preference
        const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(systemMode === "dark" ? "warm-dark" : "warm");
      }
    } else {
      // Direct mode selection
      if (newColorTheme === "default") {
        setTheme(newMode);
      } else {
        setTheme(newMode === "dark" ? "warm-dark" : "warm");
      }
    }
  };

  const handleModeChange = (newMode: "light" | "dark" | "system") => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
    applyTheme(newMode, colorTheme);
  };

  const handleColorThemeChange = (newColorTheme: string) => {
    setColorTheme(newColorTheme);
    localStorage.setItem("color-theme", newColorTheme);
    applyTheme(mode, newColorTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header route="settings" className="w-full flex-shrink-0" />

      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl mx-auto px-4 py-4 pb-8">
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Customize your learning experience
              </p>
            </div>

            <Separator />

            {/* Mode Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mode</CardTitle>
                <CardDescription className="text-sm">
                  Choose between light, dark, or system preference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {MODES.map((modeOption) => (
                    <button
                      key={modeOption.value}
                      onClick={() => handleModeChange(modeOption.value as "light" | "dark" | "system")}
                      className={`relative p-3 rounded-lg border-2 transition-all hover:border-primary ${
                        mode === modeOption.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-sm">{modeOption.name}</span>
                        {mode === modeOption.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Color Theme Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Color Theme</CardTitle>
                <CardDescription className="text-sm">
                  Choose your preferred color scheme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((themeOption) => (
                    <button
                      key={themeOption.value}
                      onClick={() => handleColorThemeChange(themeOption.value)}
                      className={`relative p-3 rounded-lg border-2 transition-all hover:border-primary ${
                        colorTheme === themeOption.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-sm">{themeOption.name}</span>
                        {colorTheme === themeOption.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

          {/* Japanese Font */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Japanese Font</CardTitle>
              <CardDescription className="text-sm">
                Font for Japanese text (kanji, hiragana, katakana)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={japaneseFont} onValueChange={setJapaneseFont}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {JAPANESE_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="p-3 rounded-lg border bg-muted/50">
                <p className="text-base" style={{ fontFamily: japaneseFont }}>
                  漢字学習 - ひらがな - カタカナ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* English Font */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">English Font</CardTitle>
              <CardDescription className="text-sm">
                Font for English text and interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={englishFont} onValueChange={setEnglishFont}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {ENGLISH_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="p-3 rounded-lg border bg-muted/50">
                <p className="text-base" style={{ fontFamily: englishFont }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode("system");
                setColorTheme("default");
                setJapaneseFont(JAPANESE_FONTS[0].value);
                setEnglishFont(ENGLISH_FONTS[0].value);
                localStorage.removeItem("theme-mode");
                localStorage.removeItem("color-theme");
                localStorage.removeItem("japanese-font");
                localStorage.removeItem("english-font");
                applyTheme("system", "default");
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
