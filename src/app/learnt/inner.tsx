"use client";

import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { learntKanjiAtom, practiceKanjiAtom } from "@/lib/store";
import { learntVocabAtom, practiceVocabAtom } from "@/app/vocab/vocab-content";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import searchlist from "@/../data/searchlist.json";
import vocablist from "@/../data/vocablist.json";
import { Trophy, TrendingUp, TrendingDown, BookOpen, PlayIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

type KanjiItem = {
  k: string;
  r: string;
  m: string;
  g: number;
  j: string;
  s: number;
};

type VocabItem = {
  expression: string;
  reading: string;
  meaning: string;
  tags: string[];
};

export function LearntKanjiContent() {
  const [learntKanji] = useAtom(learntKanjiAtom);
  const [practiceKanji, setPracticeKanji] = useAtom(practiceKanjiAtom);
  const [learntVocab] = useAtom(learntVocabAtom);
  const [practiceVocab, setPracticeVocab] = useAtom(practiceVocabAtom);
  const [filter, setFilter] = useState<"all" | "mastered" | "learning" | "struggling">("all");
  const [activeTab, setActiveTab] = useState<"kanji" | "vocab">("kanji");

  const handleKanjiClick = (kanji: string) => {
    setPracticeKanji((prev) => {
      if (prev.includes(kanji)) {
        return prev.filter((k) => k !== kanji);
      }
      return [...prev, kanji];
    });
  };

  const handleVocabClick = (expression: string) => {
    setPracticeVocab((prev) => {
      if (prev.includes(expression)) {
        return prev.filter((v) => v !== expression);
      }
      return [...prev, expression];
    });
  };

  const clearAllSelections = () => {
    if (activeTab === "kanji") {
      setPracticeKanji([]);
    } else {
      setPracticeVocab([]);
    }
  };

  const learntKanjiData = useMemo(() => {
    const entries = Object.entries(learntKanji).map(([kanji, score]) => {
      const data = searchlist.find((k) => k.k === kanji) as KanjiItem | undefined;
      return {
        kanji,
        score,
        data,
      };
    });

    // Filter
    let filtered = entries;
    if (filter === "mastered") {
      filtered = entries.filter((entry) => entry.score >= 20);
    } else if (filter === "learning") {
      filtered = entries.filter((entry) => entry.score > 0 && entry.score < 20);
    } else if (filter === "struggling") {
      filtered = entries.filter((entry) => entry.score < 0);
    }

    // Sort by score descending
    return filtered.sort((a, b) => b.score - a.score);
  }, [learntKanji, filter]);

  const learntVocabData = useMemo(() => {
    const entries = Object.entries(learntVocab).map(([expression, score]) => {
      const data = vocablist.find((v) => v.expression === expression) as VocabItem | undefined;
      return {
        expression,
        score,
        data,
      };
    });

    // Filter
    let filtered = entries;
    if (filter === "mastered") {
      filtered = entries.filter((entry) => entry.score >= 20);
    } else if (filter === "learning") {
      filtered = entries.filter((entry) => entry.score > 0 && entry.score < 20);
    } else if (filter === "struggling") {
      filtered = entries.filter((entry) => entry.score < 0);
    }

    // Sort by score descending
    return filtered.sort((a, b) => b.score - a.score);
  }, [learntVocab, filter]);

  const kanjiStats = useMemo(() => {
    const entries = Object.values(learntKanji);
    return {
      total: entries.length,
      mastered: entries.filter((score) => score >= 20).length,
      learning: entries.filter((score) => score > 0 && score < 20).length,
      struggling: entries.filter((score) => score < 0).length,
    };
  }, [learntKanji]);

  const vocabStats = useMemo(() => {
    const entries = Object.values(learntVocab);
    return {
      total: entries.length,
      mastered: entries.filter((score) => score >= 20).length,
      learning: entries.filter((score) => score > 0 && score < 20).length,
      struggling: entries.filter((score) => score < 0).length,
    };
  }, [learntVocab]);

  const stats = activeTab === "kanji" ? kanjiStats : vocabStats;

  const getScoreColor = (score: number) => {
    if (score >= 20) return "text-green-600 dark:text-green-400";
    if (score >= 10) return "text-blue-600 dark:text-blue-400";
    if (score > 0) return "text-yellow-600 dark:text-yellow-400";
    if (score === 0) return "text-muted-foreground";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 20) return "bg-green-500";
    if (score >= 10) return "bg-blue-500";
    if (score > 0) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 20) return "Mastered";
    if (score >= 10) return "Proficient";
    if (score > 0) return "Learning";
    if (score === 0) return "Neutral";
    return "Struggling";
  };

  return (
    <div className="h-screen flex flex-col">
      <Header route="learnt" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-4">Learning Progress</h1>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "kanji" | "vocab")} className="mb-4">
            <TabsList>
              <TabsTrigger value="kanji">Kanji ({kanjiStats.total})</TabsTrigger>
              <TabsTrigger value="vocab">Vocabulary ({vocabStats.total})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Mastered</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Learning</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.learning}</div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Struggling</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.struggling}</div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === "mastered" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("mastered")}
            >
              Mastered ({stats.mastered})
            </Button>
            <Button
              variant={filter === "learning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("learning")}
            >
              Learning ({stats.learning})
            </Button>
            <Button
              variant={filter === "struggling" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("struggling")}
            >
              Struggling ({stats.struggling})
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className={`p-6 ${(activeTab === "kanji" ? practiceKanji.length : practiceVocab.length) > 0 ? "pb-24" : ""}`}>
            {activeTab === "kanji" && learntKanjiData.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No kanji learned yet</h2>
                <p className="text-muted-foreground mb-4">
                  Start practicing to track your progress!
                </p>
                <Link href="/">
                  <Button>Select Kanji to Practice</Button>
                </Link>
              </div>
            ) : activeTab === "vocab" && learntVocabData.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No vocabulary learned yet</h2>
                <p className="text-muted-foreground mb-4">
                  Start practicing to track your progress!
                </p>
                <Link href="/vocab">
                  <Button>Select Vocabulary to Practice</Button>
                </Link>
              </div>
            ) : activeTab === "kanji" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learntKanjiData.map(({ kanji, score, data }) => {
                  const isSelected = practiceKanji.includes(kanji);
                  return (
                    <div
                      key={kanji}
                      onClick={() => handleKanjiClick(kanji)}
                      className={`relative bg-card border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-5xl font-bold">{kanji}</div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score > 0 ? `+${score}` : score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getScoreLabel(score)}
                          </div>
                        </div>
                      </div>

                      {data && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">{data.m}</p>
                          <p className="text-xs text-muted-foreground">訓: {data.r}</p>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>-20</span>
                          <span>0</span>
                          <span>20</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getProgressBarColor(score)}`}
                            style={{
                              width: `${((score + 20) / 40) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learntVocabData.map(({ expression, score, data }) => {
                  const isSelected = practiceVocab.includes(expression);
                  return (
                    <div
                      key={expression}
                      onClick={() => handleVocabClick(expression)}
                      className={`relative bg-card border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-3xl font-bold mb-1">{expression}</div>
                          <div className="text-sm text-muted-foreground">{data?.reading}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score > 0 ? `+${score}` : score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getScoreLabel(score)}
                          </div>
                        </div>
                      </div>

                      {data && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">{data.meaning}</p>
                        </div>
                      )}

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>-20</span>
                          <span>0</span>
                          <span>20</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getProgressBarColor(score)}`}
                            style={{
                              width: `${((score + 20) / 40) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Floating Action Bar */}
        {((activeTab === "kanji" && practiceKanji.length > 0) || (activeTab === "vocab" && practiceVocab.length > 0)) && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {activeTab === "kanji"
                    ? `${practiceKanji.length} kanji selected`
                    : `${practiceVocab.length} vocabulary selected`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearAllSelections}>
                  <Trash2Icon className="h-4 w-4 mr-1.5" />
                  Clear
                </Button>
                <Link href={activeTab === "kanji" ? "/practice" : "/vocab/practice"}>
                  <Button size="sm" className="gap-2">
                    <PlayIcon className="h-4 w-4" />
                    Start Practice
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
