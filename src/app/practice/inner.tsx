"use client";

import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { practiceKanjiAtom, learntKanjiAtom } from "@/lib/store";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import searchlist from "@/../data/searchlist.json";
import { CheckCircle2Icon, XCircleIcon, PlayIcon } from "lucide-react";
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

export function PracticeGameContent() {
  const [practiceKanji] = useAtom(practiceKanjiAtom);
  const [learntKanji, setLearntKanji] = useAtom(learntKanjiAtom);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Get kanji data for practice
  const practiceKanjiData = useMemo(() => {
    return practiceKanji
      .map((id) => searchlist.find((k) => k.k === id))
      .filter(Boolean) as KanjiData[];
  }, [practiceKanji]);

  // Generate quiz questions
  const questions = useMemo(() => {
    if (practiceKanjiData.length === 0) return [];

    return practiceKanjiData.map((kanji) => {
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
  }, [practiceKanjiData]);

  const currentQuestion = questions[currentQuestionIndex];

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

  if (practiceKanji.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header route="practice" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">No Kanji Selected</h2>
            <p className="text-muted-foreground">
              Please select some kanji from the home page to start practicing.
            </p>
            <Link href="/">
              <Button>Go to Home Page</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen flex flex-col">
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
    <div className="min-h-screen flex flex-col">
      <Header route="practice" />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4 pb-24">
          <div className="w-full max-w-2xl space-y-8">
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
