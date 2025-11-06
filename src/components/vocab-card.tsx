"use client";

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
  const getLearningBadgeColor = (score: number) => {
    if (score >= 20) return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
    if (score >= 10) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    if (score > 0) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };

  const getLearningLabel = (score: number) => {
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
        </div>
      </div>

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
