import { getAllKanjiGraphData } from "@/lib";
import { Metadata } from "next";
import { AssociationsContent } from "./inner";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Kanji Associations - Interactive 3D Network Visualization",
  description: "Explore all Japanese kanji associations and relationships in an interactive 3D network. Discover how kanji connect through shared components, radicals, and readings. Visual learning tool for understanding kanji structure and relationships.",
};

export default async function AssociationsPage() {
  const graphData = await getAllKanjiGraphData();

  if (!graphData) return <div>Loading...</div>;

  return (
    <div className="size-full">
      <Header route="associations" className="w-full" />
      <AssociationsContent graphData={graphData} />
    </div>
  );
}
