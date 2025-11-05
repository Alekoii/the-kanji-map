"use client";

import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { practiceKanjiAtom, learntKanjiAtom } from "@/lib/store";
import { KanjiCard } from "@/components/kanji-card";
import { KanjiFilter, type KanjiFilters } from "@/components/kanji-filter";
import { KanjiModal } from "@/components/kanji-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import searchlist from "@/../data/searchlist.json";
import { joyoList } from "@/../data/joyo";
import { jinmeiyoList } from "@/../data/jinmeiyo";
import { PlayIcon, Trash2Icon, CheckSquare, ListChecks, Shuffle } from "lucide-react";
import Link from "next/link";

interface KanjiItem {
  k: string; // kanji
  r: string; // reading (kunyomi)
  m: string; // meaning
  g: number; // group (1=joyo, 2=jinmeiyo, 3=other)
  j: string | null; // JLPT level (N5, N4, N3, N2, N1, or null)
  s: number | null; // stroke count
}

interface HomeContentProps {
  isMobile?: boolean;
}

export function HomeContent({ isMobile = false }: HomeContentProps) {
  const [filters, setFilters] = useState<KanjiFilters>({
    search: "",
    searchType: "all",
    type: "all",
    jlptLevels: [],
    strokeRange: { min: 1, max: 30 },
    sortBy: "default",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [practiceKanji, setPracticeKanji] = useAtom(practiceKanjiAtom);
  const [learntKanji] = useAtom(learntKanjiAtom);
  const itemsPerPage = isMobile ? 20 : 48;

  const handleKanjiClick = (kanji: string) => {
    // Toggle selection instead of opening modal
    setPracticeKanji((prev) => {
      if (prev.includes(kanji)) {
        return prev.filter((k) => k !== kanji);
      }
      return [...prev, kanji];
    });
  };

  const handleExpandClick = (kanji: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedKanji(kanji);
    setIsModalOpen(true);
  };

  const clearAllSelections = () => {
    setPracticeKanji([]);
  };

  const selectFirst10 = () => {
    const first10 = currentKanji.slice(0, 10).map((item) => item.k);
    setPracticeKanji((prev) => {
      const newSet = new Set([...prev, ...first10]);
      return Array.from(newSet);
    });
  };

  const selectAllOnPage = () => {
    const allOnPage = currentKanji.map((item) => item.k);
    setPracticeKanji((prev) => {
      const newSet = new Set([...prev, ...allOnPage]);
      return Array.from(newSet);
    });
  };

  const selectRandom = () => {
    const count = Math.min(10, currentKanji.length);
    const shuffled = [...currentKanji].sort(() => Math.random() - 0.5);
    const randomKanji = shuffled.slice(0, count).map((item) => item.k);
    setPracticeKanji((prev) => {
      const newSet = new Set([...prev, ...randomKanji]);
      return Array.from(newSet);
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset selected kanji after animation completes
    setTimeout(() => setSelectedKanji(null), 300);
  };

  const kanjiData = searchlist as KanjiItem[];

  const filteredKanji = useMemo(() => {
    let result = kanjiData.filter((item) => {
      // Filter out empty kanji
      if (!item.k || !item.m) return false;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();

        if (filters.searchType === "kanji") {
          // Search only kanji character
          if (!item.k.includes(filters.search)) {
            return false;
          }
        } else if (filters.searchType === "meaning") {
          // Search only meaning
          if (!item.m.toLowerCase().includes(searchLower)) {
            return false;
          }
        } else if (filters.searchType === "reading") {
          // Search only reading
          if (!item.r.toLowerCase().includes(searchLower)) {
            return false;
          }
        } else {
          // Search all fields (default)
          const matchesKanji = item.k.includes(filters.search);
          const matchesMeaning = item.m.toLowerCase().includes(searchLower);
          const matchesReading = item.r.toLowerCase().includes(searchLower);
          if (!matchesKanji && !matchesMeaning && !matchesReading) {
            return false;
          }
        }
      }

      // Type filter
      if (filters.type === "joyo" && !joyoList.includes(item.k)) return false;
      if (filters.type === "jinmeiyo" && !jinmeiyoList.includes(item.k)) return false;
      if (filters.type === "other" && (joyoList.includes(item.k) || jinmeiyoList.includes(item.k))) {
        return false;
      }

      // JLPT Level filter
      if (filters.jlptLevels.length > 0) {
        if (!item.j || !filters.jlptLevels.includes(item.j)) {
          return false;
        }
      }

      // Stroke count filter
      if (item.s !== null && item.s !== undefined) {
        if (item.s < filters.strokeRange.min || item.s > filters.strokeRange.max) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === "frequency") {
      // Items are already sorted by frequency (searchlist.json is frequency-ordered)
      // No additional sorting needed
    } else if (filters.sortBy === "strokes") {
      // Sort by stroke count (ascending)
      result = [...result].sort((a, b) => {
        const aStrokes = a.s ?? Number.MAX_SAFE_INTEGER;
        const bStrokes = b.s ?? Number.MAX_SAFE_INTEGER;
        return aStrokes - bStrokes;
      });
    }

    return result;
  }, [kanjiData, filters]);

  const totalPages = Math.ceil(filteredKanji.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKanji = filteredKanji.slice(startIndex, endIndex);

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
          <div className="p-4">
            <KanjiFilter
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={kanjiData.length}
              filteredCount={filteredKanji.length}
            />
          </div>

          {/* Bulk Selection Controls */}
          {currentKanji.length > 0 && (
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
              {currentKanji.map((item) => (
                <KanjiCard
                  key={item.k}
                  kanji={item.k}
                  meaning={item.m}
                  kunyomi={item.r}
                  showDetails={true}
                  onClick={() => handleKanjiClick(item.k)}
                  onExpandClick={(e) => handleExpandClick(item.k, e)}
                  isSelected={practiceKanji.includes(item.k)}
                  learningScore={learntKanji[item.k]}
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
        {selectedKanji && (
          <KanjiModal
            kanji={selectedKanji}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
        {practiceKanji.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-card text-card-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border">
              <span className="font-semibold">
                {practiceKanji.length} kanji selected
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
                <Link href="/practice">
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
      <div className="flex flex-col h-full">
        <div className="p-6 pb-0">
          <KanjiFilter
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={kanjiData.length}
            filteredCount={filteredKanji.length}
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Kanji Explorer</h1>
                  <p className="text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredKanji.length)} of{" "}
                    {filteredKanji.length} kanji
                  </p>
                </div>

                {/* Bulk Selection Controls */}
                {currentKanji.length > 0 && (
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

            {currentKanji.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {currentKanji.map((item) => (
                  <KanjiCard
                    key={item.k}
                    kanji={item.k}
                    meaning={item.m}
                    kunyomi={item.r}
                    showDetails={true}
                    onClick={() => handleKanjiClick(item.k)}
                    onExpandClick={(e) => handleExpandClick(item.k, e)}
                    isSelected={practiceKanji.includes(item.k)}
                    learningScore={learntKanji[item.k]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No kanji found matching your criteria
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
      {selectedKanji && (
        <KanjiModal
          kanji={selectedKanji}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
      {practiceKanji.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card text-card-foreground rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border">
            <span className="font-semibold">
              {practiceKanji.length} kanji selected
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
              <Link href="/practice">
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
