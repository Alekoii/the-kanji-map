import { joyoList } from "@/../data/joyo";
import { jinmeiyoList } from "@/../data/jinmeiyo";
import { MaximizeIcon } from "lucide-react";
import { Button } from "./ui/button";

interface KanjiCardProps {
  kanji: string;
  meaning?: string;
  kunyomi?: string;
  showDetails?: boolean;
  onClick?: () => void;
  onExpandClick?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
  learningScore?: number;
}

export function KanjiCard({
  kanji,
  meaning,
  kunyomi,
  showDetails = false,
  onClick,
  onExpandClick,
  isSelected = false,
  learningScore
}: KanjiCardProps) {
  const getKanjiType = () => {
    if (joyoList.includes(kanji)) return "Jōyō";
    if (jinmeiyoList.includes(kanji)) return "Jinmeiyō";
    return "Other";
  };

  const getKanjiTypeColor = () => {
    if (joyoList.includes(kanji)) return "bg-blue-500/10 text-blue-500";
    if (jinmeiyoList.includes(kanji)) return "bg-green-500/10 text-green-500";
    return "bg-gray-500/10 text-gray-500";
  };

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
        <span lang="ja" className="text-4xl font-bold group-hover:scale-110 transition-transform duration-200">
          {kanji}
        </span>
        <div className="flex flex-col gap-1 items-end">
          <span className={`text-xs px-2 py-1 rounded-full ${getKanjiTypeColor()}`}>
            {getKanjiType()}
          </span>
          {onExpandClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onExpandClick}
            >
              <MaximizeIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showDetails && (meaning || kunyomi) && (
        <div className="mt-auto space-y-1 text-sm text-muted-foreground">
          {meaning && (
            <p className="line-clamp-2 font-medium text-foreground">
              {meaning}
            </p>
          )}
          {kunyomi && (
            <p lang="ja" className="line-clamp-1 text-xs">
              訓: {kunyomi}
            </p>
          )}
        </div>
      )}

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
