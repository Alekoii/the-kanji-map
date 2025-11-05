"use client";

import { useAtom } from "jotai";
import { learntKanjiAtom } from "@/lib/store";
import { Button } from "./ui/button";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function ProgressManager() {
  const [learntKanji, setLearntKanji] = useAtom(learntKanjiAtom);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        learntKanji: learntKanji,
        totalKanji: Object.keys(learntKanji).length,
      };

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `kanji-learn-progress-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: `Successfully exported progress for ${Object.keys(learntKanji).length} kanji!`,
      });

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to export progress. Please try again.",
      });
      console.error("Export error:", error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data
      if (!data.learntKanji || typeof data.learntKanji !== "object") {
        throw new Error("Invalid progress file format");
      }

      // Merge with existing progress (keep higher scores)
      const mergedProgress = { ...learntKanji };
      Object.entries(data.learntKanji).forEach(([kanji, score]) => {
        const currentScore = mergedProgress[kanji] || -Infinity;
        mergedProgress[kanji] = Math.max(currentScore, score as number);
      });

      setLearntKanji(mergedProgress);

      const importedCount = Object.keys(data.learntKanji).length;
      setMessage({
        type: "success",
        text: `Successfully imported progress for ${importedCount} kanji! Existing progress was preserved.`,
      });

      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to import progress. Please make sure the file is valid.",
      });
      console.error("Import error:", error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalKanji = Object.keys(learntKanji).length;
  const masteredKanji = Object.values(learntKanji).filter(score => score >= 20).length;
  const learningKanji = Object.values(learntKanji).filter(score => score < 20 && score > 0).length;
  const strugglingKanji = Object.values(learntKanji).filter(score => score <= 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Management</CardTitle>
        <CardDescription>
          Export your learning progress to backup or transfer to another device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Stats */}
        {totalKanji > 0 && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Practiced</p>
              <p className="text-2xl font-bold">{totalKanji}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mastered</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{masteredKanji}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Learning</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{learningKanji}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Struggling</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{strugglingKanji}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            variant="default"
            className="flex-1"
            disabled={totalKanji === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Progress
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Progress
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Message Alert */}
        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"}>
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {message.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Info Text */}
        <p className="text-xs text-muted-foreground">
          <strong>Export:</strong> Downloads a JSON file with your learning progress.{" "}
          <strong>Import:</strong> Merges imported progress with existing data (keeps higher scores).
        </p>
      </CardContent>
    </Card>
  );
}
