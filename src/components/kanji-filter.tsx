"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X, SlidersHorizontal } from "lucide-react";

export interface KanjiFilters {
  search: string;
  searchType: "all" | "kanji" | "meaning" | "reading";
  type: "all" | "joyo" | "jinmeiyo" | "other";
  jlptLevels: string[];
  strokeRange: { min: number; max: number };
  sortBy: "default" | "frequency" | "strokes";
}

interface KanjiFilterProps {
  filters: KanjiFilters;
  onFiltersChange: (filters: KanjiFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export function KanjiFilter({ filters, onFiltersChange, totalCount, filteredCount }: KanjiFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    onFiltersChange({
      search: "",
      searchType: "all",
      type: "all",
      jlptLevels: [],
      strokeRange: { min: 1, max: 30 },
      sortBy: "default",
    });
  };

  const removeFilter = (key: keyof KanjiFilters) => {
    switch (key) {
      case "search":
        updateFilter("search", "");
        break;
      case "searchType":
        updateFilter("searchType", "all");
        break;
      case "type":
        updateFilter("type", "all");
        break;
      case "jlptLevels":
        updateFilter("jlptLevels", []);
        break;
      case "strokeRange":
        updateFilter("strokeRange", { min: 1, max: 30 });
        break;
      case "sortBy":
        updateFilter("sortBy", "default");
        break;
    }
  };

  const hasActiveFilters = filters.searchType !== "all" ||
                          filters.type !== "all" ||
                          filters.jlptLevels.length > 0 ||
                          filters.strokeRange.min !== 1 ||
                          filters.strokeRange.max !== 30 ||
                          filters.sortBy !== "default";

  const getActiveFilterChips = () => {
    const chips: { label: string; key: keyof KanjiFilters }[] = [];

    if (filters.searchType !== "all") {
      chips.push({ label: `Search: ${filters.searchType}`, key: "searchType" });
    }
    if (filters.type !== "all") {
      chips.push({ label: filters.type === "joyo" ? "Jōyō" : filters.type === "jinmeiyo" ? "Jinmeiyō" : "Other", key: "type" });
    }
    if (filters.jlptLevels.length > 0) {
      chips.push({ label: `JLPT: ${filters.jlptLevels.join(", ")}`, key: "jlptLevels" });
    }
    if (filters.strokeRange.min !== 1 || filters.strokeRange.max !== 30) {
      chips.push({ label: `Strokes: ${filters.strokeRange.min}-${filters.strokeRange.max}`, key: "strokeRange" });
    }
    if (filters.sortBy !== "default") {
      chips.push({ label: `Sort: ${filters.sortBy}`, key: "sortBy" });
    }

    return chips;
  };

  const activeChips = getActiveFilterChips();

  return (
    <div className="space-y-3">
      {/* Main Search and Filter Bar */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            id="search"
            placeholder="Search kanji, meaning, or reading..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="h-10"
          />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="default" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between pr-8">
                <span>Filter Kanji</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Reset All
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
                {/* Search Type */}
                <div className="space-y-3">
                  <Label>Search In</Label>
                  <RadioGroup
                    value={filters.searchType}
                    onValueChange={(value) => updateFilter("searchType", value as KanjiFilters["searchType"])}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="search-all" />
                      <Label htmlFor="search-all" className="font-normal cursor-pointer">
                        All Fields
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kanji" id="search-kanji" />
                      <Label htmlFor="search-kanji" className="font-normal cursor-pointer">
                        Kanji Character Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="meaning" id="search-meaning" />
                      <Label htmlFor="search-meaning" className="font-normal cursor-pointer">
                        Meaning Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reading" id="search-reading" />
                      <Label htmlFor="search-reading" className="font-normal cursor-pointer">
                        Reading Only
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Kanji Type */}
                <div className="space-y-3">
                  <Label>Kanji Type</Label>
                  <RadioGroup
                    value={filters.type}
                    onValueChange={(value) => updateFilter("type", value as KanjiFilters["type"])}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="font-normal cursor-pointer">
                        All Kanji
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="joyo" id="joyo" />
                      <Label htmlFor="joyo" className="font-normal cursor-pointer">
                        Jōyō Kanji (常用漢字)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jinmeiyo" id="jinmeiyo" />
                      <Label htmlFor="jinmeiyo" className="font-normal cursor-pointer">
                        Jinmeiyō Kanji (人名用漢字)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal cursor-pointer">
                        Other Kanji
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* JLPT Level */}
                <div className="space-y-3">
                  <Label>JLPT Level</Label>
                  <div className="space-y-2">
                    {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={level}
                          checked={filters.jlptLevels.includes(level)}
                          onCheckedChange={() => toggleJlptLevel(level)}
                        />
                        <Label htmlFor={level} className="font-normal cursor-pointer">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stroke Count Range */}
                <div className="space-y-3">
                  <Label>Stroke Count Range</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={filters.strokeRange.min}
                      onChange={(e) => updateFilter("strokeRange", {
                        ...filters.strokeRange,
                        min: parseInt(e.target.value) || 1
                      })}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={filters.strokeRange.max}
                      onChange={(e) => updateFilter("strokeRange", {
                        ...filters.strokeRange,
                        max: parseInt(e.target.value) || 30
                      })}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-3">
                  <Label>Sort By</Label>
                  <RadioGroup
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilter("sortBy", value as KanjiFilters["sortBy"])}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="sort-default" />
                      <Label htmlFor="sort-default" className="font-normal cursor-pointer">
                        Default Order
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="frequency" id="frequency" />
                      <Label htmlFor="frequency" className="font-normal cursor-pointer">
                        By Frequency
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="strokes" id="strokes" />
                      <Label htmlFor="strokes" className="font-normal cursor-pointer">
                        By Stroke Count
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
          </SheetContent>
        </Sheet>

        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
        </span>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <Button
              key={chip.key}
              variant="secondary"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => removeFilter(chip.key)}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
