import type { Metadata } from "next";
import { LearntKanjiContent } from "./inner";

export const metadata: Metadata = {
  title: "Learnt Kanji - Track Your Japanese Kanji Learning Progress",
  description: "Track your kanji learning progress with detailed statistics. Monitor mastered, learning, and struggling kanji. Review your study history and select kanji for practice sessions. Perfect for JLPT preparation and Japanese study.",
};

export default function LearntPage() {
  return <LearntKanjiContent />;
}
