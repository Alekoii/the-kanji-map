import { NextRequest, NextResponse } from "next/server";
import { getGraphData, getKanjiDataLocal, getStrokeAnimation } from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Kanji ID is required" },
      { status: 400 }
    );
  }

  try {
    const [kanjiInfo, graphData, strokeAnimation] = await Promise.all([
      getKanjiDataLocal(id),
      getGraphData(id),
      getStrokeAnimation(id),
    ]);

    if (!kanjiInfo) {
      return NextResponse.json(
        { error: "Kanji not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      kanjiInfo,
      graphData,
      strokeAnimation,
    });
  } catch (error) {
    console.error("Error fetching kanji data:", error);
    return NextResponse.json(
      { error: "Failed to fetch kanji data" },
      { status: 500 }
    );
  }
}
