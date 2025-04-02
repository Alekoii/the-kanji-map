"use client";

import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { joyoList } from "@/../data/joyo";
import { jinmeiyoList } from "@/../data/jinmeiyo";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import searchlist from "@/../data/searchlist.json";
import { useMediaQuery } from "react-responsive";

interface KanjiListContentProps {
  kanjis: { params: { id: string } }[];
  initialPage: number;
}

export function KanjiListContent({ kanjis, initialPage }: KanjiListContentProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const itemsPerPage = 100;
  
  const filteredKanjis = kanjis.filter(({ params: { id } }) => {
    // Apply search term filter
    if (searchTerm && !id.includes(searchTerm)) {
      return false;
    }
    
    // Apply category filter
    if (filter === "joyo" && !joyoList.includes(id)) {
      return false;
    }
    if (filter === "jinmeiyo" && !jinmeiyoList.includes(id)) {
      return false;
    }
    if (filter === "other" && (joyoList.includes(id) || jinmeiyoList.includes(id))) {
      return false;
    }
    
    return true;
  });
  
  const totalPages = Math.ceil(filteredKanjis.length / itemsPerPage);
  
  
  useEffect(() => {
    setCurrentPage(1);

    if (searchTerm || filter !== "all") {
      router.replace("/list", { scroll: false });
    }
  }, [searchTerm, filter, router]);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKanjis = filteredKanjis.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    router.push(`/list?page=${page}`, { scroll: false });
  };

  const renderPagination = () => {
    const paginationItems = [];
    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      paginationItems.push(
        <Button 
          key="first" 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        paginationItems.push(<span key="ellipsis1" className="px-1">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push(<span key="ellipsis2" className="px-1">...</span>);
      }
      paginationItems.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return paginationItems;
  };

  return (
    <ScrollArea className="w-full h-[calc(100%-3rem)]">
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold">All Kanji</h1>
          <div className="text-sm text-muted-foreground">
            Showing {filteredKanjis.length > 0 ? startIndex + 1 : 0}-
            {Math.min(endIndex, filteredKanjis.length)} of {filteredKanjis.length} kanji
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search kanji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kanji</SelectItem>
                <SelectItem value="joyo">Jōyō Kanji</SelectItem>
                <SelectItem value="jinmeiyo">Jinmeiyō Kanji</SelectItem>
                <SelectItem value="other">Other Kanji</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredKanjis.length > 0 ? (
          <TooltipProvider>
            <div className={`grid ${mounted && isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4"}`}>
              {currentKanjis.map(({ params: { id } }) => {

                const kanjiInfo = searchlist.find(item => item.k === id);
                
                if (mounted && isMobile) {
                  return (
                    <Link
                      key={id}
                      href={`/${id}`}
                      className="flex gap-3 items-center p-3 border rounded-md hover:bg-accent transition-colors"
                    >
                      <span className="text-3xl mr-2">{id}</span>
                      {kanjiInfo && (
                        <div className="text-sm flex-1">
                          <p className="font-semibold">{kanjiInfo.m}</p>
                          {kanjiInfo.r && <p>訓: {kanjiInfo.r}</p>}
                        </div>
                      )}
                    </Link>
                  );
                }
                
                return (
                  <Tooltip key={id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/${id}`}
                        className="flex items-center justify-center aspect-square text-2xl border rounded-md hover:bg-accent transition-colors"
                      >
                        {id}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] text-xs">
                      {kanjiInfo ? (
                        <div className="space-y-1">
                          <p className="font-bold">Meaning: {kanjiInfo.m}</p>
                          {kanjiInfo.r && <p>Kunyomi: {kanjiInfo.r}</p>}
                          <p className="text-muted-foreground text-[10px]">
                            {joyoList.includes(id) ? "Jōyō Kanji" : 
                            jinmeiyoList.includes(id) ? "Jinmeiyō Kanji" : "Other Kanji"}
                          </p>
                        </div>
                      ) : (
                        <p>No information available</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No kanji found matching your criteria</p>
          </div>
        )}
        
        {filteredKanjis.length > itemsPerPage && (
          <div className="flex justify-center gap-2 mt-8 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {renderPagination()}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}