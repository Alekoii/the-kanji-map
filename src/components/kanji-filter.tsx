"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, SlidersHorizontal, BookOpen, GraduationCap, Paintbrush, ArrowUpDown } from "lucide-react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // searchType is now always visible in dropdown, so don't count it as active filter
  const hasActiveFilters = filters.type !== "all" ||
                          filters.jlptLevels.length > 0 ||
                          filters.strokeRange.min !== 1 ||
                          filters.strokeRange.max !== 30 ||
                          filters.sortBy !== "default";

  const getActiveFilterChips = () => {
    const chips: { label: string; key: keyof KanjiFilters }[] = [];

    // searchType is now always visible in dropdown, so don't show as chip
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

  // Filter content component (reused in both Sheet and Drawer)
  const FilterContent = () => (
    <div className="space-y-8">
      {/* JLPT Level - Most commonly used filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-semibold">JLPT Level</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Filter by Japanese Language Proficiency Test level
        </p>
        <div className="grid grid-cols-5 gap-2">
          {["N5", "N4", "N3", "N2", "N1"].map((level) => (
            <Button
              key={level}
              variant={filters.jlptLevels.includes(level) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleJlptLevel(level)}
              className="w-full"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Kanji Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-semibold">Kanji Type</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Official categorization of kanji characters
        </p>
        <RadioGroup
          value={filters.type}
          onValueChange={(value) => updateFilter("type", value as KanjiFilters["type"])}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="all" id="all" />
            <div className="flex-1">
              <Label htmlFor="all" className="font-medium cursor-pointer">
                All Kanji
              </Label>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="joyo" id="joyo" />
            <div className="flex-1">
              <Label htmlFor="joyo" className="font-medium cursor-pointer">
                Jōyō Kanji
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">常用漢字 - Regular use</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="jinmeiyo" id="jinmeiyo" />
            <div className="flex-1">
              <Label htmlFor="jinmeiyo" className="font-medium cursor-pointer">
                Jinmeiyō Kanji
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">人名用漢字 - Name use</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="other" id="other" />
            <div className="flex-1">
              <Label htmlFor="other" className="font-medium cursor-pointer">
                Other Kanji
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Less common characters</p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t" />

      {/* Stroke Count Range */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-semibold">Stroke Count</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Number of strokes to write the character
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor="min-strokes" className="text-xs text-muted-foreground mb-1.5 block">
                Minimum
              </Label>
              <Input
                id="min-strokes"
                type="number"
                min="1"
                max="30"
                value={filters.strokeRange.min}
                onChange={(e) => updateFilter("strokeRange", {
                  ...filters.strokeRange,
                  min: parseInt(e.target.value) || 1
                })}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="max-strokes" className="text-xs text-muted-foreground mb-1.5 block">
                Maximum
              </Label>
              <Input
                id="max-strokes"
                type="number"
                min="1"
                max="30"
                value={filters.strokeRange.max}
                onChange={(e) => updateFilter("strokeRange", {
                  ...filters.strokeRange,
                  max: parseInt(e.target.value) || 30
                })}
              />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {filters.strokeRange.min} - {filters.strokeRange.max} strokes
          </div>
        </div>
      </div>

      <div className="border-t" />

      {/* Sort By */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label className="text-base font-semibold">Sort Order</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Change how results are displayed
        </p>
        <RadioGroup
          value={filters.sortBy}
          onValueChange={(value) => updateFilter("sortBy", value as KanjiFilters["sortBy"])}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="default" id="sort-default" />
            <div className="flex-1">
              <Label htmlFor="sort-default" className="font-medium cursor-pointer">
                Default Order
              </Label>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="frequency" id="frequency" />
            <div className="flex-1">
              <Label htmlFor="frequency" className="font-medium cursor-pointer">
                By Frequency
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Most common first</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors">
            <RadioGroupItem value="strokes" id="strokes" />
            <div className="flex-1">
              <Label htmlFor="strokes" className="font-medium cursor-pointer">
                By Stroke Count
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Simplest first</p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Main Search and Filter Bar */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex gap-2">
          <Input
            id="search"
            placeholder="Search kanji, meaning, or reading..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="h-10 flex-1"
          />
          <Select
            value={filters.searchType}
            onValueChange={(value) => updateFilter("searchType", value as KanjiFilters["searchType"])}
          >
            <SelectTrigger className="w-[140px] h-10">
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

        {isMobile ? (
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="default" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </Button>
            </DrawerTrigger>

            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader className="px-6 py-4 border-b">
                <DrawerTitle className="flex items-center justify-between">
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </DrawerTitle>
              </DrawerHeader>

              <ScrollArea className="flex-1 px-6 py-6 overflow-y-auto">
                <FilterContent />
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        ) : (
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

            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle className="flex items-center justify-between pr-8">
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>

              <ScrollArea className="flex-1 px-6 py-6">
                <FilterContent />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

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
