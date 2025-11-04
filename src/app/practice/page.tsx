import type { Metadata } from "next";
import { PracticeGameContent } from "./inner";

export const metadata: Metadata = {
  title: "Practice Game - Kanji Learn",
  description: "Practice kanji with a multiple choice quiz game",
};

export default function PracticePage() {
  return <PracticeGameContent />;
}
