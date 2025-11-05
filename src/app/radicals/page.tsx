import { Header } from "@/components/header";
import { Metadata } from "next";
import { RadicalPageContent } from "./inner";

export const metadata: Metadata = {
    title: "Kanji Radicals - Learn Japanese Kanji by Radical Components",
    description:
        "Browse and learn kanji organized by radical components. Understand kanji composition and structure using accurate radical data. Master kanji building blocks for effective Japanese character learning.",
};

export default function RadicalPage() {
    return (
        <div className="size-full">
            <Header className="w-full" route="radicals" />
            <RadicalPageContent />
        </div>
    );
}
