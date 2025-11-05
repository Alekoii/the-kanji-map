import { getAllKanji } from "@/lib";
import { Metadata } from "next";
import { Header } from "@/components/header";
import { KanjiListContent } from "./inner";

export const metadata: Metadata = {
    title: "Complete Kanji List - Browse All Japanese Characters",
    description: "Browse the complete list of Japanese kanji characters with meanings, readings, and stroke counts. Find kanji by JLPT level, frequency, or joyo/jinmeiyo classification. Perfect for organized kanji study and review.",
};

export default function KanjiListPage(props: any) {
    const kanjis = getAllKanji();

    const pageString = props.searchParams?.page;
    const parsedPage = parseInt(pageString || "1", 10);
    const initialPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    return (
        <div className="size-full">
            <Header className="w-full" route="list" />
            <KanjiListContent kanjis={kanjis} initialPage={initialPage} />
        </div>
    );
}
