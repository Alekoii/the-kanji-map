import type { Metadata } from "next";
import { Header } from "@/components/header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Vocabulary Practice - Interactive Japanese Vocabulary Learning",
  description: "Practice Japanese vocabulary with interactive quizzes. Test your knowledge of meanings and readings.",
};

export default function VocabPracticePage() {
  return (
    <div className="size-full flex flex-col">
      <Header route="vocab" className="w-full" />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold">Vocabulary Practice</h1>
          <p className="text-lg text-muted-foreground">
            Vocabulary practice is coming soon! Select vocabulary items from the vocabulary page and
            practice them here.
          </p>
          <Link href="/vocab">
            <Button size="lg">Go to Vocabulary</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
