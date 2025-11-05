"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

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
  learningScore = 0,
}: VocabCardProps) {
  const getLearningColor = (score: number) => {
    if (score >= 5) return "text-green-500";
    if (score >= 3) return "text-yellow-500";
    if (score >= 1) return "text-orange-500";
    return "";
  };

  // Get primary tag (JLPT level or source)
  const primaryTag = tags.find((tag) => tag.includes("JLPT")) || tags[0];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md",
        "group relative"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-1">
        {/* Learning score indicator */}
        {learningScore > 0 && (
          <div className="absolute top-1.5 right-1.5">
            <CheckCircle2 className={cn("h-4 w-4", getLearningColor(learningScore))} />
          </div>
        )}

        {/* Expression */}
        <div className="text-xl font-bold text-center">{expression}</div>

        {/* Reading */}
        <div className="text-xs text-muted-foreground text-center">{reading}</div>

        {/* Meaning */}
        <div className="text-xs text-center line-clamp-2 min-h-[2rem]">{meaning}</div>

        {/* Tags */}
        {primaryTag && (
          <div className="flex justify-center pt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {primaryTag.replace(/_/g, " ")}
            </Badge>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
}
