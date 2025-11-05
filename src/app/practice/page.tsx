import type { Metadata } from "next";
import { PracticeGameContent } from "./inner";

export const metadata: Metadata = {
  title: "Kanji Practice Quiz - Interactive Japanese Kanji Learning Game",
  description: "Practice Japanese kanji with interactive multiple choice quizzes. Test your knowledge of meanings, readings, and stroke order. Track your progress and improve your JLPT kanji skills with gamified learning.",
};

export default function PracticePage() {
  return <PracticeGameContent />;
}
