"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface VocabFilters {
  search: string;
  searchType: "all" | "expression" | "meaning" | "reading";
  tags: string[];
  sortBy: "default" | "alphabetical";
}

interface VocabFilterProps {
  filters: VocabFilters;
  onFiltersChange: (filters: VocabFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const STORAGE_KEY = "vocab-learn-filters";

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

const COMMON_TAGS = Object.keys(TAG_GROUPS);

export function VocabFilterSidebar({ filters, onFiltersChange, totalCount, filteredCount }: VocabFilterProps) {
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

  const updateFilter = <K extends keyof VocabFilters>(key: K, value: VocabFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter("tags", newTags);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      searchType: "all" as const,
      tags: [],
      sortBy: "default" as const,
    };
    onFiltersChange(defaultFilters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFilters));
  };

  const hasActiveFilters = filters.tags.length > 0 || filters.sortBy !== "default";

  const FilterContent = () => (
    <div className="space-y-3">
      {/* Search */}
      <div className="space-y-2">
        <Input
          placeholder="Search vocabulary..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="h-9"
        />
        <Select
          value={filters.searchType}
          onValueChange={(value) =>
            updateFilter("searchType", value as VocabFilters["searchType"])
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Search All</SelectItem>
            <SelectItem value="expression">Expression Only</SelectItem>
            <SelectItem value="meaning">Meaning Only</SelectItem>
            <SelectItem value="reading">Reading Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Tags</label>
          {filters.tags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => updateFilter("tags", [])}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => updateFilter("sortBy", value as VocabFilters["sortBy"])}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredCount}</span> of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span> vocabulary words
        </p>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full h-9" onClick={resetFilters}>
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="border-b bg-background/95 backdrop-blur p-4">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full h-9">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {filters.tags.length}
                </span>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filter Vocabulary</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8 pt-2">
              <FilterContent />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

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
