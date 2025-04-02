"use client";

import { useMediaQuery } from "react-responsive";
import { Kanji } from "@/components/kanji";
import { Radical } from "@/components/radical";
import { Examples } from "@/components/examples";
import { Graphs } from "@/components/graphs";
import { SearchInput } from "@/components/search-input";
import { DrawInput } from "@/components/draw-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

interface KanjiPageContentProps {
  kanjiInfo: KanjiInfo; 
  graphData: BothGraphData; 
  strokeAnimation: string; 
}

export function KanjiPageContent({
  kanjiInfo,
  graphData,
  strokeAnimation,
}: KanjiPageContentProps) {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {

    return null; 
  }

  if (isMobile) {
    return (
      <ScrollArea className="w-full h-[calc(100vh-3rem)]">
        <div className="w-full p-4 space-y-8 pb-24">
          {/* Search */}
          <div className="flex justify-center w-full mb-2">
            <SearchInput searchPlaceholder="Search kanji..." />
          </div>

          {/* Kanji Information */}
          <div className="border rounded-lg p-4">
            <Kanji
              kanjiInfo={kanjiInfo}
              graphData={graphData}
              strokeAnimation={strokeAnimation}
              screen="mobile"
            />
          </div>

          {/* Radical Information */}
          <div className="border rounded-lg p-4">
            <Radical kanjiInfo={kanjiInfo} />
          </div>

          {/* Examples */}
          <div className="border rounded-lg p-4">
            <Examples kanjiInfo={kanjiInfo} />
          </div>

          {/* Graph */}
          <div className="border rounded-lg h-[60vh]">
            <Graphs kanjiInfo={kanjiInfo} graphData={graphData} />
          </div>
        </div>
      </ScrollArea>
    );
  } else {
    return (
      <div className="size-full grow hidden md:grid grid-cols-1 md:grid-rows-[330px_1fr] overflow-hidden">
        <div className="top grid grid-cols-[252px_1fr_1fr] overflow-hidden border-b border-lighter">
          <div className="flex flex-col items-center gap-2 mt-3">
            <SearchInput searchPlaceholder="Search..." />
            <DrawInput />
          </div>
          <div className="p-4 border-l">
            <Kanji
              screen="desktop"
              kanjiInfo={kanjiInfo}
              graphData={graphData}
              strokeAnimation={strokeAnimation}
            />
          </div>
          <div className="p-4 border-l">
            <Radical kanjiInfo={kanjiInfo} />
          </div>
        </div>
        <div className="bottom grid grid-cols-[2fr_3fr] overflow-hidden">
          <ScrollArea className="w-full h-full">
            <Examples kanjiInfo={kanjiInfo} />
          </ScrollArea>
          <div className="border-l">
            <Graphs kanjiInfo={kanjiInfo} graphData={graphData} />
          </div>
        </div>
      </div>
    );
  }
}
