import type { Metadata } from "next";
import { LearntKanjiContent } from "./inner";

export const metadata: Metadata = {
  title: "Learnt Kanji - The Kanji Map",
  description: "Track your kanji learning progress",
};

export default function LearntPage() {
  return <LearntKanjiContent />;
}
