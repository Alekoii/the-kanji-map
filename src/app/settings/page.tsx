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
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
  { name: "Warm", value: "warm" },
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"light" | "dark" | "system">("system");
  const [japaneseFont, setJapaneseFont] = useState(JAPANESE_FONTS[0].value);
  const [englishFont, setEnglishFont] = useState(ENGLISH_FONTS[0].value);

  useEffect(() => {
    setMounted(true);

    // Load saved preferences
    const savedMode = localStorage.getItem("theme-mode") as "light" | "dark" | "system" | null;
    const savedJapaneseFont = localStorage.getItem("japanese-font");
    const savedEnglishFont = localStorage.getItem("english-font");

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

  const handleModeChange = (newMode: "light" | "dark" | "system") => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);

    if (newMode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
    } else {
      setTheme(newMode);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header route="settings" className="w-full" />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Customize your learning experience
            </p>
          </div>

          <Separator />

          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred color theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {THEMES.map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:border-primary ${
                      theme === themeOption.value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{themeOption.name}</span>
                      {theme === themeOption.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance Mode</CardTitle>
              <CardDescription>
                Choose between light, dark, or system preference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["light", "dark", "system"].map((modeOption) => (
                  <button
                    key={modeOption}
                    onClick={() => handleModeChange(modeOption as "light" | "dark" | "system")}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:border-primary ${
                      mode === modeOption
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{modeOption}</span>
                      {mode === modeOption && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Current: <span className="font-medium">{resolvedTheme}</span>
              </p>
            </CardContent>
          </Card>

          {/* Japanese Font */}
          <Card>
            <CardHeader>
              <CardTitle>Japanese Font</CardTitle>
              <CardDescription>
                Select a font for Japanese text (kanji, hiragana, katakana)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={japaneseFont} onValueChange={setJapaneseFont}>
                <SelectTrigger>
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
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-lg" style={{ fontFamily: japaneseFont }}>
                  漢字学習 - ひらがな - カタカナ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* English Font */}
          <Card>
            <CardHeader>
              <CardTitle>English Font</CardTitle>
              <CardDescription>
                Select a font for English text and interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={englishFont} onValueChange={setEnglishFont}>
                <SelectTrigger>
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
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-lg" style={{ fontFamily: englishFont }}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setTheme("light");
                setMode("system");
                setJapaneseFont(JAPANESE_FONTS[0].value);
                setEnglishFont(ENGLISH_FONTS[0].value);
                localStorage.removeItem("theme-mode");
                localStorage.removeItem("japanese-font");
                localStorage.removeItem("english-font");
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
