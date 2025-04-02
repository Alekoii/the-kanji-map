"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import Link from "next/link";
import { joyoList } from "@/../data/joyo";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "react-responsive";
import radicalList from "@/../data/radicalism.json";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Define types for our data structures
interface RadicalInfo {
    radical: string;
    meaning: string;
    strokes?: number;
    kanji: string[];
}

interface KanjiInfo {
    k: string;
    g: number;
    m: string;
    r: string;
}

export function RadicalPageContent() {
    const [radicals, setRadicals] = useState<RadicalInfo[]>([]);
    const [selectedRadical, setSelectedRadical] = useState<RadicalInfo | null>(
        null,
    );
    const [relatedKanji, setRelatedKanji] = useState<KanjiInfo[]>([]);
    const [joyoOnly, setJoyoOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [mounted, setMounted] = useState(false);
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    useEffect(() => {
        setMounted(true);

        // Process and sort radicals by stroke count
        const sortedRadicals = Object.entries(radicalList)
            .map(([radical, info]) => ({
                radical,
                meaning: (info as any).meaning || "",
                strokes: (info as any).strokes || 0,
                kanji: (info as any).kanji || [],
            }))
            .sort((a, b) => a.strokes - b.strokes);

        setRadicals(sortedRadicals);
    }, []);

    // When a radical is selected, find all kanji that use it
    useEffect(() => {
        if (!selectedRadical) {
            setRelatedKanji([]);
            return;
        }

        // Get kanji info for all related kanji
        import("@/../data/searchlist.json").then((searchlist) => {
            const kanjiInfoList = selectedRadical.kanji
                .map((k) => searchlist.default.find((item) => item.k === k))
                .filter(Boolean) as KanjiInfo[];

            // Apply Joyo filter if enabled
            const filteredKanji = joyoOnly
                ? kanjiInfoList.filter((k) => joyoList.includes(k.k))
                : kanjiInfoList;

            setRelatedKanji(filteredKanji);
        });
    }, [selectedRadical, joyoOnly]);

    // Filter radicals based on search term
    const filteredRadicals = radicals.filter((r) =>
        r.radical.includes(searchTerm) ||
        r.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!mounted) return null;

    return (
        <ScrollArea className="w-full h-[calc(100vh-3rem)]">
            <div className="p-4 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold">Kanji Radicals</h1>
                    <div className="flex items-center gap-3">
                        <Toggle
                            className={cn("", joyoOnly ? "bg-accent" : "")}
                            variant="outline"
                            aria-label="Show only Jōyō kanji"
                            pressed={joyoOnly}
                            onPressedChange={setJoyoOnly}
                        >
                            <span className="text-sm">Jōyō Only</span>
                        </Toggle>
                    </div>
                </div>

                <div className="mb-6">
                    <Input
                        placeholder="Search radicals by character or meaning..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Radicals</h2>
                    <TooltipProvider>
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
                            {filteredRadicals.map((radical) => (
                                <Tooltip
                                    key={radical.radical}
                                    delayDuration={300}
                                >
                                    <TooltipTrigger asChild>
                                        <button
                                            className={cn(
                                                "flex items-center justify-center aspect-square text-2xl border rounded-md hover:bg-accent transition-colors",
                                                selectedRadical?.radical ===
                                                        radical.radical
                                                    ? "bg-accent text-accent-foreground"
                                                    : "",
                                            )}
                                            onClick={() =>
                                                setSelectedRadical(radical)}
                                        >
                                            {radical.radical}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <div className="space-y-1">
                                            <p className="font-bold">
                                                {radical.meaning}
                                            </p>
                                            <p className="text-sm">
                                                Strokes: {radical.strokes}
                                            </p>
                                            <p className="text-sm">
                                                Kanji: {radical.kanji.length}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>
                </div>

                {selectedRadical && (
                    <div className="mt-8">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-xl font-bold">
                                Kanji with {selectedRadical.radical}{" "}
                                ({selectedRadical.meaning})
                            </h2>
                            <div className="text-sm text-muted-foreground">
                                {relatedKanji.length} kanji found
                            </div>
                        </div>

                        <TooltipProvider>
                            <div
                                className={`grid ${
                                    isMobile
                                        ? "grid-cols-6 gap-3"
                                        : "grid-cols-10 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 gap-4"
                                }`}
                            >
                                {relatedKanji.map((kanji) => (
                                    <Tooltip key={kanji.k} delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={`/${kanji.k}`}
                                                className="flex items-center justify-center aspect-square text-2xl border rounded-md hover:bg-accent transition-colors"
                                            >
                                                {kanji.k}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="top"
                                            className="max-w-[250px]"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-bold">
                                                    Meaning: {kanji.m}
                                                </p>
                                                {kanji.r && (
                                                    <p>Reading: {kanji.r}</p>
                                                )}
                                                <p className="text-muted-foreground text-[10px]">
                                                    {kanji.g === 1
                                                        ? "Jōyō Kanji"
                                                        : kanji.g === 2
                                                        ? "Jinmeiyō Kanji"
                                                        : "Other Kanji"}
                                                </p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
