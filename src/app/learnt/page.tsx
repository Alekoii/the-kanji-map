import type { Metadata } from "next";
import { LearntKanjiContent } from "./inner";

export const metadata: Metadata = {
  title: "Learning Progress - Track Your Japanese Study Progress",
  description: "Track your kanji and vocabulary learning progress with detailed statistics. Monitor mastered, learning, and struggling items. Review your study history and select items for practice sessions. Perfect for JLPT preparation and Japanese study.",
};

export default function LearntPage() {
  return <LearntKanjiContent />;
}
