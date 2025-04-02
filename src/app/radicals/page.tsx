import { Header } from "@/components/header";
import { Metadata } from "next";
import { RadicalPageContent } from "./inner";

export const metadata: Metadata = {
    title: "Radicals",
    description: "Browse kanji by radicals",
};

export default function RadicalPage() {
    return (
        <div className="size-full">
            <Header className="w-full" route="radicals" />
            <RadicalPageContent />
        </div>
    );
}
