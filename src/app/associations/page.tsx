import { getAllKanjiGraphData } from "@/lib";
import { Metadata } from "next";
import { AssociationsContent } from "./inner";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Kanji Associations - 3D Network View",
  description: "Explore all kanji associations and relationships in an interactive 3D network visualization",
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
