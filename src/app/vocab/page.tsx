import type { Metadata } from "next";
import { Header } from "@/components/header";
import { VocabContent } from "./vocab-content";

export const metadata: Metadata = {
  title: "Vocabulary - Japanese Vocabulary Learning",
  description:
    "Browse and practice Japanese vocabulary with filters. Track your progress and improve your JLPT vocabulary skills.",
};

export default function VocabPage() {
  return (
    <div className="size-full flex flex-col">
      <Header route="vocab" className="w-full" />
      {/* MOBILE */}
      <div className="w-full h-[calc(100%-3rem)] md:hidden">
        <VocabContent isMobile={true} />
      </div>
      {/* DESKTOP */}
      <div className="w-full h-[calc(100%-3rem)] hidden md:block">
        <VocabContent isMobile={false} />
      </div>
    </div>
  );
}
