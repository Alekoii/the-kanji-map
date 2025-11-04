"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import gsap from "gsap";
import { X } from "lucide-react";
import { Kanji } from "@/components/kanji";
import { Radical } from "@/components/radical";
import { Examples } from "@/components/examples";
import { Graphs } from "@/components/graphs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getGraphData, getKanjiDataLocal, getStrokeAnimation } from "@/lib";

interface KanjiModalProps {
  kanji: string;
  isOpen: boolean;
  onClose: () => void;
}

export function KanjiModal({ kanji, isOpen, onClose }: KanjiModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [kanjiInfo, setKanjiInfo] = useState<KanjiInfo | null>(null);
  const [graphData, setGraphData] = useState<BothGraphData | null>(null);
  const [strokeAnimation, setStrokeAnimation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  // Load kanji data
  useEffect(() => {
    if (isOpen && kanji) {
      setIsLoading(true);
      Promise.all([
        getKanjiDataLocal(kanji),
        getGraphData(kanji),
        getStrokeAnimation(kanji),
      ]).then(([info, graph, stroke]) => {
        setKanjiInfo(info);
        setGraphData(graph);
        setStrokeAnimation(stroke);
        setIsLoading(false);
      });
    }
  }, [kanji, isOpen]);

  // GSAP animations
  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      // Animate in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      gsap.fromTo(
        contentRef.current,
        {
          scale: 0.8,
          opacity: 0,
          y: 50,
        },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: 0.1,
        }
      );
    }, modalRef);

    return () => ctx.revert();
  }, [isOpen]);

  const handleClose = () => {
    const ctx = gsap.context(() => {
      // Animate out
      gsap.to(contentRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: "power2.in",
      });

      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          onClose();
        },
      });
    }, modalRef);

    return () => ctx.revert();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative bg-background rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : kanjiInfo && graphData && strokeAnimation ? (
          isMobile ? (
            <ScrollArea className="w-full h-[90vh]">
              <div className="w-full p-4 space-y-6 pb-24">
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
          ) : (
            <div className="h-[85vh] grid grid-rows-[330px_1fr] overflow-hidden">
              <div className="top grid grid-cols-[1fr_1fr] overflow-hidden border-b">
                <div className="p-6">
                  <Kanji
                    screen="desktop"
                    kanjiInfo={kanjiInfo}
                    graphData={graphData}
                    strokeAnimation={strokeAnimation}
                  />
                </div>
                <div className="p-6 border-l">
                  <Radical kanjiInfo={kanjiInfo} />
                </div>
              </div>
              <div className="bottom grid grid-cols-[2fr_3fr] overflow-hidden">
                <ScrollArea className="w-full h-full">
                  <div className="p-6">
                    <Examples kanjiInfo={kanjiInfo} />
                  </div>
                </ScrollArea>
                <div className="border-l">
                  <Graphs kanjiInfo={kanjiInfo} graphData={graphData} />
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-[500px]">
            <div className="text-muted-foreground">Failed to load kanji data</div>
          </div>
        )}
      </div>
    </div>
  );
}
