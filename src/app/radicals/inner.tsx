"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { joyoList } from "@/../data/joyo";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define strict types for our data
type KanjiComposition = {
    in: string[];
    out: string[];
};

type CompositionData = Record<string, KanjiComposition>;

type KanjiInfo = {
    k: string;
    g: number;
    m: string;
    r: string;
    frequency?: number;
};

type RadicalDataEntry = {
    meaning: string;
    strokes: number;
    kanji: string[];
};

type RadicalsData = Record<string, RadicalDataEntry>;

type RadicalInfo = {
    radical: string;
    kanjiUsages: string[];
    meaning?: string;
    strokes?: number;
};

type EnhancedKanjiInfo = KanjiInfo & {
    components: string[];
    usageCount: number;
};

export function RadicalPageContent() {
    // State with proper typing
    const [radicals, setRadicals] = useState<RadicalInfo[]>([]);
    const [selectedRadical, setSelectedRadical] = useState<RadicalInfo | null>(
        null,
    );
    const [relatedKanji, setRelatedKanji] = useState<EnhancedKanjiInfo[]>([]);
    const [compositionData, setCompositionData] = useState<
        CompositionData | null
    >(null);
    const [joyoOnly, setJoyoOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [mounted, setMounted] = useState(false);

    // Pagination state for kanji results
    const [currentKanjiPage, setCurrentKanjiPage] = useState(1);
    const kanjiPerPage = 24;

    // Pagination state for radicals
    const [currentRadicalPage, setCurrentRadicalPage] = useState(1);
    const [radicalsPerPage, setRadicalsPerPage] = useState(100);

    // Responsive design
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    // Filter radicals based on search term and minimum usage requirement
    const filteredRadicals = useMemo(() => {
        return radicals
            .filter((r) => r.kanjiUsages.length > 1) // Only show radicals used in more than 1 kanji
            .filter((r) =>
                r.radical.includes(searchTerm) ||
                (r.meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ??
                    false)
            );
    }, [radicals, searchTerm]);

    // Paginate the filtered radicals
    const paginatedRadicals = useMemo(() => {
        const startIndex = (currentRadicalPage - 1) * radicalsPerPage;
        return filteredRadicals.slice(startIndex, startIndex + radicalsPerPage);
    }, [filteredRadicals, currentRadicalPage, radicalsPerPage]);

    // Calculate total pages for radicals
    const totalRadicalPages = Math.ceil(
        filteredRadicals.length / radicalsPerPage,
    );

    // Calculate total pages for kanji results
    const totalKanjiPages = Math.ceil(relatedKanji.length / kanjiPerPage);

    // Get current page kanji
    const currentKanji = useMemo(() => {
        const startIndex = (currentKanjiPage - 1) * kanjiPerPage;
        return relatedKanji.slice(startIndex, startIndex + kanjiPerPage);
    }, [relatedKanji, currentKanjiPage, kanjiPerPage]);

    // Load composition data and process radicals
    useEffect(() => {
        setMounted(true);

        // Load composition data
        const loadData = async () => {
            try {
                // Get composition data (arrow relationships)
                const compositionModule = await import(
                    "@/../data/composition.json"
                );
                const compData: CompositionData = compositionModule.default;
                setCompositionData(compData);

                // Get radical meanings (still useful for display)
                const radicalsModule = await import(
                    "@/../data/radicalism.json"
                );
                const radicalsData: RadicalsData = radicalsModule.default;

                // Extract unique radicals by analyzing inward arrows
                const radicalMap = new Map<string, RadicalInfo>();

                // Process composition data to find radicals and their usages
                Object.entries(compData).forEach(([kanji, composition]) => {
                    // A potential radical is any kanji that appears as an input to other kanji
                    composition.in.forEach((component) => {
                        // Get or create radical info
                        if (!radicalMap.has(component)) {
                            const radicalData =
                                radicalsData[
                                    component as keyof typeof radicalsData
                                ];
                            radicalMap.set(component, {
                                radical: component,
                                kanjiUsages: [],
                                meaning: radicalData?.meaning || "",
                                strokes: radicalData?.strokes || 0,
                            });
                        }

                        // Add this kanji as a usage of the radical
                        const radicalInfo = radicalMap.get(component)!;
                        if (!radicalInfo.kanjiUsages.includes(kanji)) {
                            radicalInfo.kanjiUsages.push(kanji);
                        }
                    });
                });

                // Convert to array and sort by stroke count and usage count
                const radicalsArray = Array.from(radicalMap.values())
                    .sort((a, b) => {
                        // First sort by number of kanji usages (most used first)
                        const usageDiff = b.kanjiUsages.length -
                            a.kanjiUsages.length;
                        if (usageDiff !== 0) return usageDiff;
                        // Then by stroke count
                        return (a.strokes || 0) - (b.strokes || 0);
                    });

                setRadicals(radicalsArray);

                // Set appropriate radicals per page based on total count
                if (radicalsArray.length > 100) {
                    setRadicalsPerPage(100);
                } else {
                    setRadicalsPerPage(radicalsArray.length);
                }
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        loadData();
    }, []);

    // When a radical is selected, find all kanji that use it
    useEffect(() => {
        if (!selectedRadical || !compositionData) {
            setRelatedKanji([]);
            return;
        }

        // Reset to first page when selecting a new radical
        setCurrentKanjiPage(1);

        // Get kanji info for all related kanji
        import("@/../data/searchlist.json").then((searchlist) => {
            // Get basic kanji info
            const kanjiInfoList = selectedRadical.kanjiUsages
                .map((k) => {
                    const info = searchlist.default.find((item) =>
                        item.k === k
                    );
                    if (!info) return null;

                    // Get components for this kanji
                    const components = compositionData[k]?.in || [];

                    // Calculate usage count (how many kanji this kanji helps form)
                    const usageCount = Object.values(compositionData).filter(
                        (comp) => comp.in.includes(k),
                    ).length;

                    return {
                        ...info,
                        components,
                        usageCount,
                    };
                })
                .filter(Boolean) as EnhancedKanjiInfo[];

            // Apply Joyo filter if enabled
            const filteredKanji = joyoOnly
                ? kanjiInfoList.filter((k) => joyoList.includes(k.k))
                : kanjiInfoList;

            // Sort by usage count (most used first)
            const sortedKanji = [...filteredKanji].sort((a, b) => {
                // First by usage count (how many kanji this kanji is used in)
                const usageDiff = b.usageCount - a.usageCount;
                if (usageDiff !== 0) return usageDiff;

                // If same usage count, sort by frequency ranking if available
                if (a.frequency && b.frequency) {
                    return a.frequency - b.frequency;
                }

                // Fallback to alphabetical
                return a.k.localeCompare(b.k);
            });

            setRelatedKanji(sortedKanji);
        });
    }, [selectedRadical, joyoOnly, compositionData]);

    // Render pagination controls for radicals
    const renderRadicalPagination = () => {
        if (totalRadicalPages <= 1) return null;

        const pageItems = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentRadicalPage - Math.floor(maxVisiblePages / 2),
        );
        let endPage = Math.min(
            totalRadicalPages,
            startPage + maxVisiblePages - 1,
        );

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            pageItems.push(
                <Button
                    key="first"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentRadicalPage(1)}
                >
                    1
                </Button>,
            );
            if (startPage > 2) {
                pageItems.push(
                    <span key="ellipsis1" className="px-1">...</span>,
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageItems.push(
                <Button
                    key={i}
                    variant={currentRadicalPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentRadicalPage(i)}
                >
                    {i}
                </Button>,
            );
        }

        // Last page
        if (endPage < totalRadicalPages) {
            if (endPage < totalRadicalPages - 1) {
                pageItems.push(
                    <span key="ellipsis2" className="px-1">...</span>,
                );
            }
            pageItems.push(
                <Button
                    key="last"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentRadicalPage(totalRadicalPages)}
                >
                    {totalRadicalPages}
                </Button>,
            );
        }

        return (
            <div className="flex justify-center gap-2 my-6 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setCurrentRadicalPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentRadicalPage === 1}
                >
                    Previous
                </Button>

                {pageItems}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setCurrentRadicalPage((prev) =>
                            Math.min(totalRadicalPages, prev + 1)
                        )}
                    disabled={currentRadicalPage === totalRadicalPages}
                >
                    Next
                </Button>
            </div>
        );
    };

    // Render pagination controls for kanji results
    const renderKanjiPagination = () => {
        if (totalKanjiPages <= 1) return null;

        const pageItems = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(
            1,
            currentKanjiPage - Math.floor(maxVisiblePages / 2),
        );
        let endPage = Math.min(
            totalKanjiPages,
            startPage + maxVisiblePages - 1,
        );

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            pageItems.push(
                <Button
                    key="first"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentKanjiPage(1)}
                >
                    1
                </Button>,
            );
            if (startPage > 2) {
                pageItems.push(
                    <span key="ellipsis1" className="px-1">...</span>,
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pageItems.push(
                <Button
                    key={i}
                    variant={currentKanjiPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentKanjiPage(i)}
                >
                    {i}
                </Button>,
            );
        }

        // Last page
        if (endPage < totalKanjiPages) {
            if (endPage < totalKanjiPages - 1) {
                pageItems.push(
                    <span key="ellipsis2" className="px-1">...</span>,
                );
            }
            pageItems.push(
                <Button
                    key="last"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentKanjiPage(totalKanjiPages)}
                >
                    {totalKanjiPages}
                </Button>,
            );
        }

        return (
            <div className="flex justify-center gap-2 my-6 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setCurrentKanjiPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentKanjiPage === 1}
                >
                    Previous
                </Button>

                {pageItems}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setCurrentKanjiPage((prev) =>
                            Math.min(totalKanjiPages, prev + 1)
                        )}
                    disabled={currentKanjiPage === totalKanjiPages}
                >
                    Next
                </Button>
            </div>
        );
    };

    if (!mounted) return null;

    return (
        <ScrollArea className="w-full h-[calc(100vh-3rem)]">
            <div className="p-4 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
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

                        <div className="w-40">
                            <Select
                                value={radicalsPerPage.toString()}
                                onValueChange={(val) => {
                                    setRadicalsPerPage(parseInt(val, 10));
                                    setCurrentRadicalPage(1); // Reset to first page
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Radicals per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="50">
                                        50 per page
                                    </SelectItem>
                                    <SelectItem value="100">
                                        100 per page
                                    </SelectItem>
                                    <SelectItem value="200">
                                        200 per page
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <Input
                        placeholder="Search radicals by character or meaning..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentRadicalPage(1); // Reset to first page on search
                        }}
                        className="w-full"
                    />
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Radicals</h2>
                        <div className="text-sm text-muted-foreground">
                            Showing radicals used in multiple kanji
                            ({filteredRadicals.length} total)
                        </div>
                    </div>

                    <TooltipProvider>
                        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
                            {paginatedRadicals.map((radical) => (
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
                                            {radical.meaning && (
                                                <p className="font-bold">
                                                    {radical.meaning}
                                                </p>
                                            )}
                                            {radical.strokes !== undefined && (
                                                <p className="text-sm">
                                                    Strokes: {radical.strokes}
                                                </p>
                                            )}
                                            <p className="text-sm">
                                                Used in:{" "}
                                                {radical.kanjiUsages.length}
                                                {" "}
                                                kanji
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>

                    {/* Radicals Pagination */}
                    {renderRadicalPagination()}
                </div>

                {selectedRadical && (
                    <div className="mt-8">
                        <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-xl font-bold">
                                Kanji with {selectedRadical.radical}{" "}
                                {selectedRadical.meaning &&
                                    `(${selectedRadical.meaning})`}
                            </h2>
                            <div className="text-sm text-muted-foreground">
                                {relatedKanji.length} kanji found
                            </div>
                        </div>

                        <TooltipProvider>
                            <div
                                className={`grid ${
                                    isMobile
                                        ? "grid-cols-1 gap-3"
                                        : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                                }`}
                            >
                                {currentKanji.map((kanji) => (
                                    <div
                                        key={kanji.k}
                                        className="border rounded-md p-3 hover:bg-accent/10 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Link
                                                href={`/${kanji.k}`}
                                                className="text-3xl font-light hover:text-primary"
                                            >
                                                {kanji.k}
                                            </Link>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {kanji.m}
                                                </p>
                                                {kanji.r && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {kanji.r}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Show component radicals */}
                                        <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Components:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {kanji.components.map(
                                                    (comp) => (
                                                        <Tooltip
                                                            key={comp}
                                                            delayDuration={300}
                                                        >
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    className={cn(
                                                                        "w-7 h-7 text-sm border rounded flex items-center justify-center",
                                                                        comp ===
                                                                                selectedRadical
                                                                                    .radical
                                                                            ? "bg-accent"
                                                                            : "",
                                                                    )}
                                                                    onClick={() => {
                                                                        const newRadical =
                                                                            radicals
                                                                                .find(
                                                                                    (r) =>
                                                                                        r.radical ===
                                                                                            comp
                                                                                );
                                                                        if (newRadical) {
                                                                            setSelectedRadical(
                                                                                newRadical,
                                                                            );
                                                                            // Reset kanji pagination when switching radicals
                                                                            setCurrentKanjiPage(
                                                                                1,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {comp}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="top"
                                                                className="text-xs"
                                                            >
                                                                {radicals.find(
                                                                    (r) =>
                                                                        r.radical ===
                                                                            comp
                                                                )?.meaning ||
                                                                    comp}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-[10px] text-muted-foreground">
                                                {kanji.g === 1
                                                    ? "Jōyō Kanji"
                                                    : kanji.g === 2
                                                    ? "Jinmeiyō Kanji"
                                                    : "Other Kanji"}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Used in {kanji.usageCount} kanji
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TooltipProvider>

                        {/* Kanji Results Pagination */}
                        {renderKanjiPagination()}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
