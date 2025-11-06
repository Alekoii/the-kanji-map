"use client";

import { useAtom } from "jotai";
import { learntKanjiAtom } from "@/lib/store";
import { getVocabKanjiBreakdown } from "@/lib/kanji-breakdown";
import { BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VocabCardProps {
  expression: string;
  reading: string;
  meaning: string;
  tags: string[];
  onClick?: () => void;
  isSelected?: boolean;
  learningScore?: number;
}

export function VocabCard({
  expression,
  reading,
  meaning,
  tags,
  onClick,
  isSelected = false,
  learningScore,
}: VocabCardProps) {
  const [learntKanji] = useAtom(learntKanjiAtom);
  const kanjiBreakdown = getVocabKanjiBreakdown(expression);

  const getKanjiTextColor = (score: number | undefined) => {
    if (score === undefined) return "text-foreground";
    if (score >= 20) return "text-green-500";
    if (score >= 10) return "text-blue-500";
    if (score > 0) return "text-yellow-500";
    return "text-red-500";
  };

  const getKanjiBorderColor = (score: number | undefined) => {
    if (score === undefined) return "border-border";
    if (score >= 20) return "border-green-500";
    if (score >= 10) return "border-blue-500";
    if (score > 0) return "border-yellow-500";
    return "border-red-500";
  };

  const getKanjiBackgroundColor = (score: number | undefined) => {
    if (score === undefined) return "bg-muted/50";
    if (score >= 20) return "bg-green-500/10";
    if (score >= 10) return "bg-blue-500/10";
    if (score > 0) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getLearningBadgeColor = (score: number) => {
    if (score >= 20) return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    if (score >= 10) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    if (score > 0) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };

  const getLearningLabel = (score: number | undefined) => {
    if (score === undefined) return "Not practiced";
    if (score >= 20) return "Mastered";
    if (score >= 10) return "Proficient";
    if (score > 0) return "Learning";
    return "Struggling";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 20) return "bg-green-500";
    if (score >= 10) return "bg-blue-500";
    if (score > 0) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get primary tag (JLPT level or source)
  const primaryTag = tags.find((tag) => tag.includes("JLPT")) || tags[0];

  return (
    <div
      onClick={onClick}
      className={`group relative border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-card h-full flex flex-col cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary"
      } ${learningScore !== undefined ? "pb-10" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-4xl font-bold group-hover:scale-110 transition-transform duration-200">
          {expression}
        </span>
        <div className="flex flex-col gap-1 items-end">
          {primaryTag && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
              {primaryTag.replace(/_/g, " ")}
            </span>
          )}
          {kanjiBreakdown.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-2 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 transition-colors flex items-center gap-1"
                >
                  <BookOpen className="h-3 w-3" />
                  Kanji
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-3xl">{expression}</span>
                    <span className="text-sm font-normal text-muted-foreground">- Kanji Breakdown</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {kanjiBreakdown.map((item, index) => {
                    const kanjiScore = learntKanji[item.kanji];
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-colors ${getKanjiBackgroundColor(kanjiScore)} ${getKanjiBorderColor(kanjiScore)}`}
                      >
                        <span className="text-4xl font-bold shrink-0">{item.kanji}</span>
                        <div className="flex-1 min-w-0 space-y-1">
                          {item.reading && (
                            <p className="text-sm text-muted-foreground">
                              {item.reading}
                            </p>
                          )}
                          <p className="text-sm font-medium">{item.meaning}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Kanji breakdown preview with color coding */}
      {kanjiBreakdown.length > 0 && (
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap gap-1 mb-2">
            {kanjiBreakdown.map((item, index) => {
              const kanjiScore = learntKanji[item.kanji];
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <span
                      className={`text-lg font-bold transition-colors cursor-help ${getKanjiTextColor(kanjiScore)}`}
                    >
                      {item.kanji}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{item.kanji}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getLearningBadgeColor(kanjiScore || 0)}`}>
                          {getLearningLabel(kanjiScore)}
                        </span>
                      </div>
                      {item.reading && (
                        <p className="text-xs text-muted-foreground">{item.reading}</p>
                      )}
                      <p className="text-sm">{item.meaning}</p>
                      {kanjiScore !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Score: {kanjiScore > 0 ? '+' : ''}{kanjiScore}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      <div className="mt-auto space-y-1 text-sm text-muted-foreground">
        {/* Reading */}
        <p className="text-xs font-medium text-foreground">
          {reading}
        </p>
        {/* Meaning */}
        <p className="line-clamp-2 text-xs">
          {meaning}
        </p>
      </div>

      {/* Learning Progress Indicator */}
      {learningScore !== undefined && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-2 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-medium ${getLearningBadgeColor(learningScore)}`}>
                {getLearningLabel(learningScore)}
              </span>
              <span className={`text-[10px] font-bold ${getLearningBadgeColor(learningScore)}`}>
                {learningScore > 0 ? '+' : ''}{learningScore}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressBarColor(learningScore)}`}
                style={{ width: `${Math.abs(learningScore) * 5}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
