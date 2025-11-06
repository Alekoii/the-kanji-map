"use client";

import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { VocabCard } from "@/components/vocab-card";
import { VocabFilterSidebar, type VocabFilters } from "@/components/vocab-filter-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import vocablist from "@/../data/vocablist.json";
import { PlayIcon, Trash2Icon, CheckSquare, ListChecks, Shuffle } from "lucide-react";
import Link from "next/link";

interface VocabItem {
  expression: string;
  reading: string;
  meaning: string;
  tags: string[];
}

interface VocabContentProps {
  isMobile?: boolean;
}

// Create atoms for vocab practice and learnt vocab
export const practiceVocabAtom = atomWithStorage<string[]>("practice-vocab", []);
export const learntVocabAtom = atomWithStorage<Record<string, number>>("learnt-vocab", {});

// Tag groups that should be treated as equivalent
const TAG_GROUPS: Record<string, string[]> = {
  "JLPT N5": ["JLPT_5", "JLPT_N5"],
  "JLPT N4": ["JLPT_4", "JLPT_N4"],
  "JLPT N3": ["JLPT_3", "JLPT_N3"],
  "JLPT N2": ["JLPT_2", "JLPT_N2"],
  "JLPT N1": ["JLPT_1", "JLPT_N1"],
  "Genki": ["Genki"],
  "Intermediate Japanese": ["Intermediate_Japanese"],
};

export function VocabContent({ isMobile = false }: VocabContentProps) {
  const [filters, setFilters] = useState<VocabFilters>({
    search: "",
    searchType: "all",
    tags: [],
    sortBy: "default",
    progress: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [practiceVocab, setPracticeVocab] = useAtom(practiceVocabAtom);
  const [learntVocab] = useAtom(learntVocabAtom);
  const itemsPerPage = isMobile ? 20 : 48;

  const handleVocabClick = (expression: string) => {
    // Toggle selection
    setPracticeVocab((prev) => {
      if (prev.includes(expression)) {
        return prev.filter((v) => v !== expression);
      }
      return [...prev, expression];
    });
  };

  const clearAllSelections = () => {
    setPracticeVocab([]);
  };

  const selectFirst10 = () => {
    const first10 = currentVocab.slice(0, 10).map((item) => item.expression);
    setPracticeVocab((prev) => {
      const newSet = new Set([...prev, ...first10]);
      return Array.from(newSet);
    });
  };

  const selectAllOnPage = () => {
    const allOnPage = currentVocab.map((item) => item.expression);
    setPracticeVocab((prev) => {
      const newSet = new Set([...prev, ...allOnPage]);
      return Array.from(newSet);
    });
  };

  const selectRandom = () => {
    const count = Math.min(10, currentVocab.length);
    const shuffled = [...currentVocab].sort(() => Math.random() - 0.5);
    const randomVocab = shuffled.slice(0, count).map((item) => item.expression);
    setPracticeVocab((prev) => {
      const newSet = new Set([...prev, ...randomVocab]);
      return Array.from(newSet);
    });
  };

  const vocabData = vocablist as VocabItem[];

  const filteredVocab = useMemo(() => {
    let result = vocabData.filter((item) => {
      // Filter out empty vocab
      if (!item.expression || !item.meaning) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();

        if (filters.searchType === "expression") {
          if (!item.expression.includes(filters.search)) {
            return false;
          }
        } else if (filters.searchType === "meaning") {
          if (!item.meaning.toLowerCase().includes(searchLower)) {
            return false;
          }
        } else if (filters.searchType === "reading") {
          if (!item.reading.toLowerCase().includes(searchLower)) {
            return false;
          }
        } else {
          // Search all fields (default)
          const matchesExpression = item.expression.includes(filters.search);
          const matchesMeaning = item.meaning.toLowerCase().includes(searchLower);
          const matchesReading = item.reading.toLowerCase().includes(searchLower);
          if (!matchesExpression && !matchesMeaning && !matchesReading) {
            return false;
          }
        }
      }

      // Tag filter
      if (filters.tags.length > 0) {
        // Expand tag groups to include all equivalent tags
        const expandedTags = filters.tags.flatMap((tag) => TAG_GROUPS[tag] || [tag]);
        const hasMatchingTag = expandedTags.some((tag) => item.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Progress filter
      if (filters.progress !== "all") {
        const score = learntVocab[item.expression];

        switch (filters.progress) {
          case "not_practiced":
            if (score !== undefined) return false;
            break;
          case "struggling":
            if (score === undefined || score > 0) return false;
            break;
          case "learning":
            if (score === undefined || score <= 0 || score >= 10) return false;
            break;
          case "proficient":
            if (score === undefined || score < 10 || score >= 20) return false;
            break;
          case "mastered":
            if (score === undefined || score < 20) return false;
            break;
        }
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === "alphabetical") {
      result = [...result].sort((a, b) => a.expression.localeCompare(b.expression));
    }

    return result;
  }, [vocabData, filters]);

  const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVocab = filteredVocab.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    const paginationItems = [];
    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      paginationItems.push(
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        paginationItems.push(
          <span key="ellipsis1" className="px-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push(
          <span key="ellipsis2" className="px-1">
            ...
          </span>
        );
      }
      paginationItems.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return paginationItems;
  };

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isMobile) {
    return (
      <>
        <div className="flex flex-col h-full">
          <VocabFilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={vocabData.length}
            filteredCount={filteredVocab.length}
          />

          {/* Bulk Selection Controls */}
          {currentVocab.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground mr-1">Quick select:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectFirst10}
                  className="h-8 text-xs"
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  First 10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllOnPage}
                  className="h-8 text-xs"
                >
                  <ListChecks className="h-3 w-3 mr-1" />
                  All on Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectRandom}
                  className="h-8 text-xs"
                >
                  <Shuffle className="h-3 w-3 mr-1" />
                  Random 10
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {currentVocab.map((item) => (
                <VocabCard
                  key={item.expression}
                  expression={item.expression}
                  reading={item.reading}
                  meaning={item.meaning}
                  tags={item.tags}
                  onClick={() => handleVocabClick(item.expression)}
                  isSelected={practiceVocab.includes(item.expression)}
                  learningScore={learntVocab[item.expression]}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {renderPagination()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
        {practiceVocab.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-card text-card-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border">
              <span className="font-semibold">
                {practiceVocab.length} vocab selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={clearAllSelections}
                >
                  <Trash2Icon className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Link href="/vocab/practice">
                  <Button size="sm" variant="secondary">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Practice
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex h-full">
        {/* Left Sidebar */}
        <VocabFilterSidebar
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={vocabData.length}
          filteredCount={filteredVocab.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Vocabulary Explorer</h1>
                    <p className="text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredVocab.length)} of{" "}
                      {filteredVocab.length} vocabulary words
                    </p>
                  </div>

                  {/* Bulk Selection Controls */}
                  {currentVocab.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Quick select:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectFirst10}
                      >
                        <CheckSquare className="h-4 w-4 mr-1.5" />
                        First 10
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllOnPage}
                      >
                        <ListChecks className="h-4 w-4 mr-1.5" />
                        All on Page
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectRandom}
                      >
                        <Shuffle className="h-4 w-4 mr-1.5" />
                        Random 10
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {currentVocab.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentVocab.map((item) => (
                    <VocabCard
                      key={item.expression}
                      expression={item.expression}
                      reading={item.reading}
                      meaning={item.meaning}
                      tags={item.tags}
                      onClick={() => handleVocabClick(item.expression)}
                      isSelected={practiceVocab.includes(item.expression)}
                      learningScore={learntVocab[item.expression]}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No vocabulary found matching your criteria
                  </p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {renderPagination()}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      {practiceVocab.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card text-card-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border">
            <span className="font-semibold">
              {practiceVocab.length} vocab selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={clearAllSelections}
              >
                <Trash2Icon className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Link href="/vocab/practice">
                <Button size="sm" variant="secondary">
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Practice
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
