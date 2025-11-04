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
      type: "all",
      jlptLevels: [],
      strokeRange: { min: 1, max: 30 },
      sortBy: "default",
    });
  };

  const hasActiveFilters = filters.search !== "" ||
                          filters.type !== "all" ||
                          filters.jlptLevels.length > 0 ||
                          filters.strokeRange.min !== 1 ||
                          filters.strokeRange.max !== 30 ||
                          filters.sortBy !== "default";

  return (
    <div className="border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredCount} of {totalCount} kanji
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
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
                  Jōyō Kanji
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jinmeiyo" id="jinmeiyo" />
                <Label htmlFor="jinmeiyo" className="font-normal cursor-pointer">
                  Jinmeiyō Kanji
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
          <div className="space-y-3">
            <Label>Sort By</Label>
            <RadioGroup
              value={filters.sortBy}
              onValueChange={(value) => updateFilter("sortBy", value as KanjiFilters["sortBy"])}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default" className="font-normal cursor-pointer">
                  Default
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="frequency" id="frequency" />
                <Label htmlFor="frequency" className="font-normal cursor-pointer">
                  Frequency
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strokes" id="strokes" />
                <Label htmlFor="strokes" className="font-normal cursor-pointer">
                  Stroke Count
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
