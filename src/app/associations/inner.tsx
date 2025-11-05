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
  ZoomInIcon,
  ZoomOutIcon,
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

  return (
    <div ref={measureRef} className="relative h-[calc(100vh-4rem)] w-full">
      {/* Title */}
      <div className="absolute top-4 left-4 z-50 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <h1 className="text-2xl font-bold mb-1">Kanji Associations Network</h1>
        <p className="text-sm text-muted-foreground">
          Explore complete kanji relationships in 3D
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {graphData.nodes.length} kanji | {graphData.links.length} connections
        </p>
      </div>

      {/* Controls */}
      <div className="absolute top-0 right-0 p-4 flex gap-1">
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
        />
      </div>
    </div>
  );
}
