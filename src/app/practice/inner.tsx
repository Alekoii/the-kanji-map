"use client";

import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { practiceKanjiAtom, learntKanjiAtom } from "@/lib/store";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import searchlist from "@/../data/searchlist.json";
import { CheckCircle2Icon, XCircleIcon, PlayIcon, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type KanjiData = {
  k: string;
  r: string;
  m: string;
  g: number;
  j: string;
  s: number;
};

type QuizQuestion = {
  kanji: string;
  correctAnswer: string;
  options: string[];
};

type FullKanjiData = {
  kanjialiveData?: {
    kanji?: {
      onyomi?: {
        romaji: string;
        katakana: string;
      };
      kunyomi?: {
        romaji: string;
        hiragana: string;
      };
    };
    examples?: Array<{
      japanese: string;
      meaning: {
        english: string;
      };
      audio: {
        mp3: string;
        ogg?: string;
        opus?: string;
        aac?: string;
      };
    }>;
  };
  jishoData?: {
    onyomi?: string[];
    kunyomi?: string[];
  };
};

export function PracticeGameContent() {
  const [practiceKanji] = useAtom(practiceKanjiAtom);
  const [learntKanji, setLearntKanji] = useAtom(learntKanjiAtom);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentKanjiData, setCurrentKanjiData] = useState<FullKanjiData | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Get kanji that are still being learned (score < 20) - only calculated once at start
  const learningKanji = useMemo(() => {
    const learning = Object.entries(learntKanji)
      .filter(([, score]) => score < 20) // Not mastered yet
      .sort(([, a], [, b]) => a - b) // Sort by score (lowest first)
      .map(([kanji]) => kanji);

    // Return up to 20 kanji for practice
    return learning.slice(0, 20);
  }, []); // Empty dependency array - only calculate once at mount

  // Get kanji data for practice - only calculated once at start
  const practiceKanjiData = useMemo(() => {
    const kanjiToUse = practiceKanji.length > 0 ? practiceKanji : learningKanji;
    return kanjiToUse
      .map((id) => searchlist.find((k) => k.k === id))
      .filter(Boolean) as KanjiData[];
  }, []); // Empty dependency array - only calculate once at mount

  // Generate quiz questions - only calculated once at start
  const questions = useMemo(() => {
    if (practiceKanjiData.length === 0) return [];

    const generatedQuestions = practiceKanjiData.map((kanji) => {
      const correctAnswer = kanji.m;

      // Get wrong answers from other kanji
      const wrongAnswers: string[] = [];
      const usedAnswers = new Set([correctAnswer]);

      while (wrongAnswers.length < 2) {
        const randomKanji = searchlist[Math.floor(Math.random() * searchlist.length)];
        if (!usedAnswers.has(randomKanji.m)) {
          wrongAnswers.push(randomKanji.m);
          usedAnswers.add(randomKanji.m);
        }
      }

      // Shuffle options
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        kanji: kanji.k,
        correctAnswer,
        options,
      };
    });

    // Shuffle questions for random order
    return generatedQuestions.sort(() => Math.random() - 0.5);
  }, []); // Empty dependency array - only calculate once at mount

  const currentQuestion = questions[currentQuestionIndex];

  // Fetch full kanji data when question changes
  useEffect(() => {
    if (!currentQuestion) return;

    const fetchKanjiData = async () => {
      try {
        const url = `/api/kanji/${encodeURIComponent(currentQuestion.kanji)}`;
        console.log("Fetching kanji data for:", currentQuestion.kanji);
        console.log("Fetch URL:", url);
        const response = await fetch(url);
        console.log("Fetch response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched kanji data:", data);
          // The API returns kanjiInfo object which contains the kanji data
          const kanjiData = data.kanjiInfo;
          console.log("Has onyomi?", kanjiData?.kanjialiveData?.kanji?.onyomi);
          console.log("Has kunyomi?", kanjiData?.kanjialiveData?.kanji?.kunyomi);
          setCurrentKanjiData(kanjiData);
        } else {
          console.error("Failed to fetch kanji data, status:", response.status, "URL:", url);
          setCurrentKanjiData(null);
        }
      } catch (error) {
        console.error("Error fetching kanji data:", error);
        setCurrentKanjiData(null);
      }
    };

    fetchKanjiData();
  }, [currentQuestion]);

  // Play audio for readings
  const playAudio = (audioUrl: string, type: string) => {
    if (!audioUrl) return;

    setPlayingAudio(type);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setPlayingAudio(null);
    };

    audio.onerror = () => {
      setPlayingAudio(null);
      console.error("Error playing audio");
    };

    audio.play().catch(error => {
      console.error("Error playing audio:", error);
      setPlayingAudio(null);
    });
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Update learnt kanji score
    const kanji = currentQuestion.kanji;
    setLearntKanji((prev) => {
      const currentScore = prev[kanji] || 0;
      const newScore = isCorrect
        ? Math.min(currentScore + 1, 20)  // +1 for correct, max 20
        : Math.max(currentScore - 1, -20); // -1 for incorrect, min -20
      return {
        ...prev,
        [kanji]: newScore,
      };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setPlayingAudio(null);
    } else {
      setGameComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameComplete(false);
  };

  // Show message only if no kanji selected AND no learning kanji available
  if (practiceKanjiData.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <Header route="practice" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">No Kanji to Practice</h2>
            <p className="text-muted-foreground">
              {practiceKanji.length === 0
                ? "You haven't selected any kanji or practiced any yet. Start by selecting kanji from the home page."
                : "No practice kanji found. Please select some kanji from the home page."}
            </p>
            <Link href="/">
              <Button>Go to Home Page</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show indicator when using auto-selected learning kanji
  const isAutoSelected = practiceKanji.length === 0 && learningKanji.length > 0;

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="h-screen flex flex-col">
        <Header route="practice" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">
              {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "💪"}
            </div>
            <h2 className="text-3xl font-bold">Game Complete!</h2>
            <div className="text-5xl font-bold text-primary">
              {score} / {questions.length}
            </div>
            <p className="text-xl text-muted-foreground">
              You scored {percentage}%
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart} size="lg">
                <PlayIcon className="mr-2 h-5 w-5" />
                Play Again
              </Button>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Select Different Kanji
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header route="practice" />

      {/* Auto-selected banner */}
      {isAutoSelected && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-3">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              📚 Practicing {learningKanji.length} kanji you're still learning (not yet mastered)
            </p>
          </div>
        </div>
      )}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-24 md:min-h-full md:flex md:items-center md:justify-center">
          <div className="w-full max-w-2xl space-y-8 py-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>
                  Score: {score} / {currentQuestionIndex + (showResult ? 1 : 0)}
                </span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                What is the meaning of this kanji?
              </h2>
              <div className="text-9xl font-bold py-8">{currentQuestion.kanji}</div>

              {/* Onyomi and Kunyomi readings with audio */}
              {currentKanjiData && (
                <div className="flex flex-wrap gap-3 justify-center items-center">
                  {/* Onyomi */}
                  {currentKanjiData.kanjialiveData?.kanji?.onyomi && (
                    <button
                      onClick={() => {
                        const audioUrl = currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3;
                        if (audioUrl) {
                          playAudio(audioUrl, 'onyomi');
                        }
                      }}
                      disabled={!currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                        "hover:border-primary hover:bg-accent",
                        currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3
                          ? "cursor-pointer"
                          : "cursor-default opacity-60",
                        playingAudio === 'onyomi' && "border-primary bg-accent"
                      )}
                    >
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">On'yomi</div>
                        <div className="text-lg font-medium">
                          {currentKanjiData.kanjialiveData.kanji.onyomi.katakana}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {currentKanjiData.kanjialiveData.kanji.onyomi.romaji}
                        </div>
                      </div>
                      {currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3 && (
                        <Volume2 className={cn(
                          "h-5 w-5 text-muted-foreground",
                          playingAudio === 'onyomi' && "text-primary animate-pulse"
                        )} />
                      )}
                    </button>
                  )}

                  {/* Kunyomi */}
                  {currentKanjiData.kanjialiveData?.kanji?.kunyomi && (
                    <button
                      onClick={() => {
                        const audioUrl = currentKanjiData.kanjialiveData?.examples?.[1]?.audio?.mp3 ||
                                       currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3;
                        if (audioUrl) {
                          playAudio(audioUrl, 'kunyomi');
                        }
                      }}
                      disabled={!currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                        "hover:border-primary hover:bg-accent",
                        currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3
                          ? "cursor-pointer"
                          : "cursor-default opacity-60",
                        playingAudio === 'kunyomi' && "border-primary bg-accent"
                      )}
                    >
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">Kun'yomi</div>
                        <div className="text-lg font-medium">
                          {currentKanjiData.kanjialiveData.kanji.kunyomi.hiragana}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {currentKanjiData.kanjialiveData.kanji.kunyomi.romaji}
                        </div>
                      </div>
                      {currentKanjiData.kanjialiveData?.examples?.[0]?.audio?.mp3 && (
                        <Volume2 className={cn(
                          "h-5 w-5 text-muted-foreground",
                          playingAudio === 'kunyomi' && "text-primary animate-pulse"
                        )} />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = option === currentQuestion.correctAnswer;
                const isSelected = option === selectedAnswer;
                const shouldShowCorrect = showResult && isCorrect;
                const shouldShowWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      "hover:border-primary hover:bg-accent",
                      "disabled:cursor-not-allowed",
                      !showResult && "active:scale-[0.98]",
                      shouldShowCorrect &&
                        "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                      shouldShowWrong &&
                        "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
                      !showResult && isSelected && "border-primary bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{option}</span>
                      {shouldShowCorrect && (
                        <CheckCircle2Icon className="h-6 w-6 text-green-600" />
                      )}
                      {shouldShowWrong && (
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer with Next button */}
      {showResult && (
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-2xl mx-auto p-4">
            <Button onClick={handleNext} size="lg" className="w-full">
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "See Results"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
