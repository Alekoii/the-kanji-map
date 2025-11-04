import Link from "next/link";
import { joyoList } from "@/../data/joyo";
import { jinmeiyoList } from "@/../data/jinmeiyo";

interface KanjiCardProps {
  kanji: string;
  meaning?: string;
  kunyomi?: string;
  showDetails?: boolean;
}

export function KanjiCard({ kanji, meaning, kunyomi, showDetails = false }: KanjiCardProps) {
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
    <Link href={`/${kanji}`}>
      <div className="group relative border rounded-lg p-4 hover:shadow-lg hover:border-primary transition-all duration-200 bg-card h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <span className="text-4xl font-bold group-hover:scale-110 transition-transform duration-200">
            {kanji}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getKanjiTypeColor()}`}>
            {getKanjiType()}
          </span>
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
    </Link>
  );
}
