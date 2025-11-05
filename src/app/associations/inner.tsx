"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { ResizeObserver } from "@juggle/resize-observer";
import useMeasure from "react-use-measure";
import { useAtom } from "jotai";
import {
  joyoOnlyAtom,
  particlesAtom,
  rotateAtom,
} from "@/lib/store";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  RefreshCcwIcon,
  ArrowUpFromDotIcon,
  MaximizeIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphData } from "react-force-graph-3d";

const CompleteGraph3DNoSSR = dynamic(() => import("./complete-graph-3d"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading 3D visualization...</div>,
});

interface Props {
  graphData: GraphData;
}

export function AssociationsContent({ graphData }: Props) {
  const [measureRef, bounds] = useMeasure({
    polyfill: ResizeObserver,
  });

  const [rotate, setRotate] = useAtom(rotateAtom);
  const [particles, setParticles] = useAtom(particlesAtom);
  const [joyoOnly, setJoyoOnly] = useAtom(joyoOnlyAtom);
  const [random, setRandom] = React.useState<number>(Date.now());
  const [searchValue, setSearchValue] = React.useState("");
  const [searchKanji, setSearchKanji] = React.useState<string>("");

  const handleRotateChange = (value: boolean) => {
    setRotate(value);
  };

  const handleParticlesChange = (value: boolean) => {
    setParticles(value);
  };

  const handleJoyoOnlyChange = (value: boolean) => {
    setJoyoOnly(value);
  };

  const handleZoomToFit = () => {
    setRandom(Date.now());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchKanji(searchValue.trim());
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchKanji("");
  };

  return (
    <div ref={measureRef} className="relative h-[calc(100vh-4rem)] w-full">
      {/* Title and Legend */}
      <div className="absolute top-4 left-4 z-50 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <h1 className="text-2xl font-bold mb-1">Kanji Associations Network</h1>
        <p className="text-sm text-muted-foreground">
          Explore complete kanji relationships in 3D
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {graphData.nodes.length} kanji | {graphData.links.length} connections
        </p>

        {/* Color Legend */}
        <div className="mt-4 pt-3 border-t space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Legend</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-xs">Jōyō Kanji (常用漢字)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-xs">Jinmeiyō Kanji (人名用漢字)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-xs">Other Kanji</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="absolute top-4 right-4 left-4 md:left-auto md:right-4 z-50 md:w-80">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search kanji (e.g., 会, 漢, 学)"
              className="w-full h-10 px-4 pr-10 rounded-lg border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" size="icon" className="h-10 w-10">
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
        {searchKanji && (
          <div className="mt-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded">
            Viewing: <span className="font-bold text-primary">{searchKanji}</span> and its associations
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-50 p-4 bg-background/80 backdrop-blur-sm rounded-lg border flex gap-1">
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                className={cn("size-10", rotate ? "bg-accent" : "")}
                variant="outline"
                aria-label="Autorotate"
                pressed={rotate}
                onPressedChange={handleRotateChange}
              >
                <RefreshCcwIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Autorotate</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                className={cn("size-10", particles ? "bg-accent" : "")}
                variant="outline"
                aria-label="Show arrow particles"
                pressed={particles}
                onPressedChange={handleParticlesChange}
              >
                <ArrowUpFromDotIcon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show arrow particles</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                className={cn("size-10", joyoOnly ? "bg-accent" : "")}
                variant="outline"
                aria-label="Show only Jōyō kanji"
                pressed={joyoOnly}
                onPressedChange={handleJoyoOnlyChange}
              >
                <span className="text-sm font-bold">漢</span>
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show only Jōyō kanji</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Fit to screen"
                onClick={handleZoomToFit}
              >
                <MaximizeIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom to fit</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Graph */}
      <div className="absolute inset-0">
        <CompleteGraph3DNoSSR
          key={random}
          graphData={graphData}
          autoRotate={rotate}
          showParticles={particles}
          joyoOnly={joyoOnly}
          triggerFocus={random}
          bounds={bounds}
          searchKanji={searchKanji}
        />
      </div>
    </div>
  );
}
