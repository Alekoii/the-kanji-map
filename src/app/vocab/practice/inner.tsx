"use client";

import { useState, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { practiceVocabAtom, learntVocabAtom } from "@/app/vocab/vocab-content";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import vocablist from "@/../data/vocablist.json";
import { CheckCircle2Icon, XCircleIcon, PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type VocabData = {
  expression: string;
  reading: string;
  meaning: string;
  tags: string[];
};

type QuizQuestion = {
  expression: string;
  reading: string;
  correctAnswer: string;
  options: string[];
  tags: string[];
};

export function VocabPracticeGameContent() {
  const [practiceVocab] = useAtom(practiceVocabAtom);
  const [learntVocab, setLearntVocab] = useAtom(learntVocabAtom);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Get vocab that are still being learned (score < 20) - only calculated once at start
  const learningVocab = useMemo(() => {
    const learning = Object.entries(learntVocab)
      .filter(([, score]) => score < 20) // Not mastered yet
      .sort(([, a], [, b]) => a - b) // Sort by score (lowest first)
      .map(([expression]) => expression);

    // Return up to 20 vocab for practice
    return learning.slice(0, 20);
  }, []); // Empty dependency array - only calculate once at mount

  // Get vocab data for practice - only calculated once at start
  const practiceVocabData = useMemo(() => {
    const vocabToUse = practiceVocab.length > 0 ? practiceVocab : learningVocab;
    return vocabToUse
      .map((expression) => vocablist.find((v) => v.expression === expression))
      .filter(Boolean) as VocabData[];
  }, []); // Empty dependency array - only calculate once at mount

  // Generate quiz questions
  const questions = useMemo(() => {
    if (practiceVocabData.length === 0) return [];

    const generatedQuestions = practiceVocabData.map((vocab) => {
      const correctAnswer = vocab.meaning;

      // Get wrong answers from other vocab
      const wrongAnswers: string[] = [];
      const usedAnswers = new Set([correctAnswer]);

      while (wrongAnswers.length < 2) {
        const randomVocab = vocablist[Math.floor(Math.random() * vocablist.length)];
        if (!usedAnswers.has(randomVocab.meaning)) {
          wrongAnswers.push(randomVocab.meaning);
          usedAnswers.add(randomVocab.meaning);
        }
      }

      // Shuffle options
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        expression: vocab.expression,
        reading: vocab.reading,
        correctAnswer,
        options,
        tags: vocab.tags,
      };
    });

    // Shuffle questions for random order
    return generatedQuestions.sort(() => Math.random() - 0.5);
  }, []); // Empty dependency array - only calculate once at mount

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    // Update learnt vocab score
    const expression = currentQuestion.expression;
    setLearntVocab((prev) => {
      const currentScore = prev[expression] || 0;
      const newScore = isCorrect
        ? Math.min(currentScore + 1, 20)  // +1 for correct, max 20
        : Math.max(currentScore - 1, -20); // -1 for incorrect, min -20
      return {
        ...prev,
        [expression]: newScore,
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

  // Show message only if no vocab selected AND no learning vocab available
  if (practiceVocabData.length === 0) {
    return (
      <div className="h-screen flex flex-col">
        <Header route="vocab" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">No Vocabulary to Practice</h2>
            <p className="text-muted-foreground">
              {practiceVocab.length === 0
                ? "You haven't selected any vocabulary or practiced any yet. Start by selecting vocabulary from the vocabulary page."
                : "No practice vocabulary found. Please select some vocabulary from the vocabulary page."}
            </p>
            <Link href="/vocab">
              <Button>Go to Vocabulary Page</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show indicator when using auto-selected learning vocab
  const isAutoSelected = practiceVocab.length === 0 && learningVocab.length > 0;

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="h-screen flex flex-col">
        <Header route="vocab" />
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
              <Link href="/vocab">
                <Button variant="outline" size="lg">
                  Select Different Vocabulary
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
      <Header route="vocab" />

      {/* Auto-selected banner */}
      {isAutoSelected && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-3">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              📚 Practicing {learningVocab.length} vocabulary words you're still learning (not yet mastered)
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
                What is the meaning of this vocabulary?
              </h2>

              {/* Expression */}
              <div className="text-7xl font-bold py-4">{currentQuestion.expression}</div>

              {/* Reading */}
              <div className="text-3xl text-muted-foreground mb-4">
                {currentQuestion.reading}
              </div>

              {/* Tags */}
              {currentQuestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentQuestion.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.replace(/_/g, " ")}
                    </Badge>
                  ))}
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
