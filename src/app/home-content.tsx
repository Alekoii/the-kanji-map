"use client";

import { useState, useMemo } from "react";
import { KanjiCard } from "@/components/kanji-card";
import { KanjiFilter, type KanjiFilters } from "@/components/kanji-filter";
import { KanjiModal } from "@/components/kanji-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import searchlist from "@/../data/searchlist.json";
import { joyoList } from "@/../data/joyo";
import { jinmeiyoList } from "@/../data/jinmeiyo";

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
  const itemsPerPage = isMobile ? 20 : 48;

  const handleKanjiClick = (kanji: string) => {
    setSelectedKanji(kanji);
    setIsModalOpen(true);
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
      </>
    );
  }

  return (
    <>
      <div className="flex h-full">
        <div className="w-64 flex-shrink-0">
          <KanjiFilter
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={kanjiData.length}
            filteredCount={filteredKanji.length}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Kanji Explorer</h1>
                <p className="text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredKanji.length)} of{" "}
                  {filteredKanji.length} kanji
                </p>
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
      </div>
      {selectedKanji && (
        <KanjiModal
          kanji={selectedKanji}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
