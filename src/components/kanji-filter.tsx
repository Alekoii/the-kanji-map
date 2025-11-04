"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

  const hasActiveFilters = filters.search !== "" ||
                          filters.searchType !== "all" ||
                          filters.type !== "all" ||
                          filters.jlptLevels.length > 0 ||
                          filters.strokeRange.min !== 1 ||
                          filters.strokeRange.max !== 30 ||
                          filters.sortBy !== "default";

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Filters</h2>
          <p className="text-sm text-muted-foreground">
            {filteredCount} of {totalCount} kanji
          </p>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search kanji, meaning..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Search Type */}
        <div className="space-y-2">
          <Label>Search In</Label>
          <RadioGroup
            value={filters.searchType}
            onValueChange={(value) => updateFilter("searchType", value as KanjiFilters["searchType"])}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="search-all" />
              <Label htmlFor="search-all" className="font-normal cursor-pointer text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="kanji" id="search-kanji" />
              <Label htmlFor="search-kanji" className="font-normal cursor-pointer text-sm">
                Kanji
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="meaning" id="search-meaning" />
              <Label htmlFor="search-meaning" className="font-normal cursor-pointer text-sm">
                Meaning
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reading" id="search-reading" />
              <Label htmlFor="search-reading" className="font-normal cursor-pointer text-sm">
                Reading
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Kanji Type */}
        <div className="space-y-2">
          <Label>Kanji Type</Label>
          <RadioGroup
            value={filters.type}
            onValueChange={(value) => updateFilter("type", value as KanjiFilters["type"])}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="font-normal cursor-pointer text-sm">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="joyo" id="joyo" />
              <Label htmlFor="joyo" className="font-normal cursor-pointer text-sm">
                Jōyō
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="jinmeiyo" id="jinmeiyo" />
              <Label htmlFor="jinmeiyo" className="font-normal cursor-pointer text-sm">
                Jinmeiyō
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-normal cursor-pointer text-sm">
                Other
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* JLPT Level */}
        <div className="space-y-2">
          <Label>JLPT Level</Label>
          <div className="space-y-2">
            {["N5", "N4", "N3", "N2", "N1"].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={filters.jlptLevels.includes(level)}
                  onCheckedChange={() => toggleJlptLevel(level)}
                />
                <Label htmlFor={level} className="font-normal cursor-pointer text-sm">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Stroke Count Range */}
        <div className="space-y-2">
          <Label>Stroke Count</Label>
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
              className="w-20"
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
              className="w-20"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <RadioGroup
            value={filters.sortBy}
            onValueChange={(value) => updateFilter("sortBy", value as KanjiFilters["sortBy"])}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="default" />
              <Label htmlFor="default" className="font-normal cursor-pointer text-sm">
                Default
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="frequency" id="frequency" />
              <Label htmlFor="frequency" className="font-normal cursor-pointer text-sm">
                Frequency
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="strokes" id="strokes" />
              <Label htmlFor="strokes" className="font-normal cursor-pointer text-sm">
                Strokes
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
