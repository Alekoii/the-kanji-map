import { getAllKanji } from "@/lib";
import { Metadata } from "next";
import { Header } from "@/components/header";
import { KanjiListContent } from "./inner";

export const metadata: Metadata = {
    title: "Kanji List",
};

export default function KanjiListPage({
    searchParams,
}: {
    searchParams?: { page?: string };
}) {
    const kanjis = getAllKanji();

    const page = parseInt(searchParams?.page || "1");

    return (
        <div className="size-full">
            <Header className="w-full" route="list" />
            <KanjiListContent kanjis={kanjis} initialPage={page} />
        </div>
    );
}
