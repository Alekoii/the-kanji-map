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
}

export function KanjiCard({
  kanji,
  meaning,
  kunyomi,
  showDetails = false,
  onClick,
  onExpandClick,
  isSelected = false
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

  return (
    <div
      onClick={onClick}
      className={`group relative border-2 rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-card h-full flex flex-col cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-4xl font-bold group-hover:scale-110 transition-transform duration-200">
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
            <p className="line-clamp-1 text-xs">
              訓: {kunyomi}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
