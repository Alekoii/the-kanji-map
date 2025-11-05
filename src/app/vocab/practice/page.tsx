import type { Metadata } from "next";
import { VocabPracticeGameContent } from "./inner";

export const metadata: Metadata = {
  title: "Vocabulary Practice - Interactive Japanese Vocabulary Learning",
  description: "Practice Japanese vocabulary with interactive quizzes. Test your knowledge of meanings and readings.",
};

export default function VocabPracticePage() {
  return <VocabPracticeGameContent />;
}
