"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

export type KanjiProgressFilter = "all" | "not_practiced" | "struggling" | "learning" | "proficient" | "mastered";

export interface KanjiFilters {
  search: string;
  searchType: "all" | "kanji" | "meaning" | "reading";
  type: "all" | "joyo" | "jinmeiyo" | "other";
  jlptLevels: string[];
  sortBy: "default" | "frequency" | "strokes";
  progress: KanjiProgressFilter;
}

interface KanjiFilterProps {
  filters: KanjiFilters;
  onFiltersChange: (filters: KanjiFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const STORAGE_KEY = "kanji-learn-filters";

export function KanjiFilterSidebar({ filters, onFiltersChange, totalCount, filteredCount }: KanjiFilterProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't restore search term, but restore other filters
        onFiltersChange({
          ...parsed,
          search: "",
        });
      }
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Failed to save filters:", error);
    }
  }, [filters]);

  const updateFilter = <K extends keyof KanjiFilters>(key: K, value: KanjiFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleJlptLevel = (level: string) => {
    const newLevels = filters.jlptLevels.includes(level)
      ? filters.jlptLevels.filter(l => l !== level)
      : [...filters.jlptLevels, level];
    updateFilter("jlptLevels", newLevels);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      searchType: "all" as const,
      type: "all" as const,
      jlptLevels: [],
      sortBy: "default" as const,
      progress: "all" as const,
    };
    onFiltersChange(defaultFilters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFilters));
  };

  const hasActiveFilters = filters.type !== "all" ||
                          filters.jlptLevels.length > 0 ||
                          filters.sortBy !== "default" ||
                          filters.progress !== "all";

  const FilterContent = () => (
    <div className="space-y-3">
      {/* Search */}
      <div className="space-y-2">
        <Input
          id="search"
          placeholder="Search kanji..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="h-9"
        />
        <Select
          value={filters.searchType}
          onValueChange={(value) => updateFilter("searchType", value as KanjiFilters["searchType"])}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            <SelectItem value="kanji">Kanji</SelectItem>
            <SelectItem value="meaning">Meaning</SelectItem>
            <SelectItem value="reading">Reading</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* JLPT Level */}
      <div className="grid grid-cols-5 gap-2">
        {["N5", "N4", "N3", "N2", "N1"].map((level) => (
          <Button
            key={level}
            variant={filters.jlptLevels.includes(level) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleJlptLevel(level)}
            className="h-9"
          >
            {level}
          </Button>
        ))}
      </div>

      {/* Kanji Type */}
      <Select
        value={filters.type}
        onValueChange={(value) => updateFilter("type", value as KanjiFilters["type"])}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Kanji</SelectItem>
          <SelectItem value="joyo">Jōyō Kanji</SelectItem>
          <SelectItem value="jinmeiyo">Jinmeiyō Kanji</SelectItem>
          <SelectItem value="other">Other Kanji</SelectItem>
        </SelectContent>
      </Select>

      {/* Progress Filter */}
      <Select
        value={filters.progress}
        onValueChange={(value) => updateFilter("progress", value as KanjiProgressFilter)}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Progress</SelectItem>
          <SelectItem value="not_practiced">Not Practiced</SelectItem>
          <SelectItem value="struggling">Struggling</SelectItem>
          <SelectItem value="learning">Learning</SelectItem>
          <SelectItem value="proficient">Proficient</SelectItem>
          <SelectItem value="mastered">Mastered</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select
        value={filters.sortBy}
        onValueChange={(value) => updateFilter("sortBy", value as KanjiFilters["sortBy"])}
      >
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Order</SelectItem>
          <SelectItem value="frequency">By Frequency</SelectItem>
          <SelectItem value="strokes">By Stroke Count</SelectItem>
        </SelectContent>
      </Select>

      {/* Stats and Reset */}
      <div className="space-y-2 pt-2">
        <div className="text-xs text-center">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredCount.toLocaleString()}</span> / <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span>
          </p>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters} className="w-full h-8">
            <X className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );

  // Mobile view with drawer
  if (isMobile) {
    return (
      <div className="p-4">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="default" className="w-full gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {[
                    filters.type !== "all",
                    filters.jlptLevels.length > 0,
                    filters.sortBy !== "default"
                  ].filter(Boolean).length}
                </span>
              )}
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader className="px-6 py-4 border-b">
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>

            <ScrollArea className="flex-1 px-6 py-6 overflow-y-auto">
              <FilterContent />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside className="w-64 border-r bg-card h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <FilterContent />
        </div>
      </ScrollArea>
    </aside>
  );
}
