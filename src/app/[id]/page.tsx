import composition from "@/../data/composition.json";
import { getGraphData, getKanjiDataLocal, getStrokeAnimation } from "@/lib";
import { Metadata } from "next";
import { KanjiPageContent } from "./inner";
import { Header } from "@/components/header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: urlEncodedId } = await params;
  const id = decodeURIComponent(urlEncodedId);
  const kanjiInfo = await getKanjiDataLocal(id);

  const meaning = kanjiInfo?.jishoData?.meaning || "";
  const kunyomi = kanjiInfo?.jishoData?.kunyomi || "";
  const onyomi = kanjiInfo?.jishoData?.onyomi?.join(", ") || "";

  return {
    title: `${id} - ${meaning ? meaning.split(", ").slice(0, 3).join(", ") : "Japanese Kanji"}`,
    description: `Learn the Japanese kanji ${id}. ${meaning ? `Meaning: ${meaning}. ` : ""}${kunyomi ? `Kunyomi: ${kunyomi}. ` : ""}${onyomi ? `Onyomi: ${onyomi}. ` : ""}Study stroke order, decomposition, examples, and kanji associations with interactive visualizations.`,
  };
}

export async function generateStaticParams() {
  const kanjis = Object.keys(composition);
  return kanjis.map((kanji) => ({
    id: kanji,
  }));
}

export default async function KanjiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: urlEncodedId } = await params;
  const id = decodeURIComponent(urlEncodedId);
  const kanjiInfo = await getKanjiDataLocal(id);
  const graphData = await getGraphData(id);
  const strokeAnimation = await getStrokeAnimation(id);

  if (!kanjiInfo || !graphData || !strokeAnimation) return <div />;

  return (
    <div className="size-full ">
      <Header className="w-full" />
      <KanjiPageContent
        kanjiInfo={kanjiInfo}
        graphData={graphData}
        strokeAnimation={strokeAnimation}
      />
    </div>
  );
}
