import { getAllKanji } from "@/lib";
import { Metadata } from "next";
import { Header } from "@/components/header";
import { KanjiListContent } from "./inner";

export const metadata: Metadata = {
    title: "Kanji List",
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
