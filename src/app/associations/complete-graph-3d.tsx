"use client";

import kanjilist from "@/../data/kanjilist.json";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { ForceGraphMethods, GraphData } from "react-force-graph-3d";
import ForceGraph3D, { NodeObject } from "react-force-graph-3d";
import type { RectReadOnly } from "react-use-measure";
import * as THREE from "three";
import SpriteText from "three-spritetext";

type NodeObjectWithData = NodeObject & { data: KanjiInfo };

interface Props {
  graphData: GraphData;
  triggerFocus: number;
  bounds: RectReadOnly;
  autoRotate: boolean;
  showParticles: boolean;
  joyoOnly: boolean;
}

export const dynamic = "force-dynamic";

const CompleteGraph3D = ({
  graphData,
  triggerFocus,
  bounds,
  autoRotate,
  showParticles,
  joyoOnly,
}: Props) => {
  // Memoize lists to prevent recreation on every render
  const joyoList = React.useMemo(
    () => kanjilist.filter((el) => el.g === 1).map((el) => el.k),
    [],
  );
  const jinmeiyoList = React.useMemo(
    () => kanjilist.filter((el) => el.g === 2).map((el) => el.k),
    [],
  );

  const { resolvedTheme } = useTheme();
  const fg3DRef: React.MutableRefObject<ForceGraphMethods | undefined> = React.useRef();
  const router = useRouter();

  const [data, setData] = React.useState<GraphData | null>(graphData);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (fg3DRef.current) {
        fg3DRef.current.renderer().dispose();
        fg3DRef.current.scene().clear();
      }
    };
  }, []);

  // Filter data based on joyoOnly setting
  React.useEffect(() => {
    if (!graphData) return;

    if (joyoOnly) {
      const joyoNodes = graphData.nodes.filter((node: NodeObject) =>
        joyoList.includes(String(node.id))
      );

      const joyoNodeIds = joyoNodes.map((node) => String(node.id));

      const joyoLinks = graphData.links.filter((link: any) => {
        const sourceId = typeof link.source === "object"
          ? link.source.id
          : link.source;
        const targetId = typeof link.target === "object"
          ? link.target.id
          : link.target;

        return joyoNodeIds.includes(String(sourceId)) &&
          joyoNodeIds.includes(String(targetId));
      });

      setData({
        nodes: joyoNodes,
        links: joyoLinks,
      });
    } else {
      setData(graphData);
    }
  }, [graphData, joyoOnly, joyoList]);

  const handleClick = (node: NodeObject) => {
    void router.push(`/${node?.id}`);
  };

  // Prefetch routes for performance
  React.useEffect(() => {
    if (!data?.nodes) return;

    // Only prefetch a subset to avoid overwhelming the browser
    const nodesToPrefetch = data.nodes.slice(0, 100);
    nodesToPrefetch.forEach((node) => {
      void router.prefetch(`/${node.id}`);
    });
  }, [data, router]);

  // Handle auto-rotation
  React.useEffect(() => {
    const controls = fg3DRef?.current?.controls();
    if (controls) {
      //@ts-ignore
      controls.autoRotate = autoRotate;
      //@ts-ignore
      controls.autoRotateSpeed = 0.5;
    }
  }, [autoRotate]);

  // Zoom to fit on mount or trigger
  React.useEffect(() => {
    const zoomToFit = setTimeout(() => {
      if (data && data?.nodes?.length > 0 && fg3DRef?.current) {
        fg3DRef.current.zoomToFit(1000, 50);
      }
    }, 100);

    return () => {
      clearTimeout(zoomToFit);
    };
  }, [data, triggerFocus]);

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debounceResumeAutoRotate = debounce((node: any) => {
    if (autoRotate && fg3DRef?.current) {
      // @ts-ignore
      !node && (fg3DRef.current.controls().autoRotate = true);
    }
  }, 500);

  const handleHover = (node: any, prevNode: any) => {
    // Pause autoRotate on hover
    if (autoRotate && fg3DRef?.current) {
      // @ts-ignore
      node && (fg3DRef.current.controls().autoRotate = false);
      debounceResumeAutoRotate(node);
    }

    // Reset the previous node's color
    if (prevNode) resetNodeColor(prevNode);

    // Highlight the currently hovered node
    if (node) highlightNode(node);
  };

  const resetNodeColor = (node: any) => {
    const defaultColor = getNodeDefaultColor(node.id);
    if (node?.__threeObj?.children[1]?.material?.color) {
      node.__threeObj.children[1].material.color.set(defaultColor);
    }
  };

  const highlightNode = (node: any) => {
    if (node?.__threeObj?.children[1]?.material?.color) {
      const color = node.__threeObj.children[1].material.color;
      node.__threeObj.children[1].material.color.setRGB(
        color.r * 0.8,
        color.g * 0.8,
        color.b * 0.8,
      );
    }
  };

  const getNodeDefaultColor = (nodeId: string) => {
    if (joyoList.includes(String(nodeId))) {
      return "#80c2e2"; // Joyo kanji
    } else if (jinmeiyoList.includes(String(nodeId))) {
      return "#d5ebf5"; // Jinmeiyo kanji
    }
    return "#fff"; // Other
  };

  // Find same onyomi between two kanji
  const sameOn = (kanji1: string, kanji2: string) => {
    const k1 = data?.nodes?.find((o) => o?.id === kanji1) as NodeObjectWithData;
    const k2 = data?.nodes?.find((o) => o?.id === kanji2) as NodeObjectWithData;
    const on1: string[] = k1?.data?.jishoData?.onyomi;
    const on2: string[] = k2?.data?.jishoData?.onyomi;
    return on1?.filter((value) => on2?.includes(value)) ?? "";
  };

  if (!data) return <div className="flex items-center justify-center h-full">Preparing visualization...</div>;

  return (
    <ForceGraph3D
      controlType={"orbit"}
      width={bounds.width}
      height={bounds.height}
      backgroundColor={"#00000000"}
      graphData={data}
      linkColor={() => {
        return resolvedTheme === "dark" ? "#ffffff50" : "#00000030";
      }}
      linkOpacity={0.3}
      linkDirectionalArrowLength={3}
      linkDirectionalArrowRelPos={0.8}
      linkDirectionalArrowResolution={6}
      linkDirectionalParticles={2}
      linkDirectionalParticleSpeed={0.003}
      linkDirectionalParticleWidth={showParticles ? 0.8 : 0.001}
      linkDirectionalParticleResolution={6}
      enableNavigationControls={true}
      showNavInfo={false}
      ref={fg3DRef}
      warmupTicks={100}
      cooldownTime={5000}
      onNodeClick={handleClick}
      onNodeHover={handleHover}
      nodeLabel={(n) => {
        const node = n as NodeObjectWithData;
        return `<div style="color: #ffffff; background: #000000a6; padding: 4px; border-radius: 4px;">
                  <span style="font-size: 16px; font-weight: bold;">${node.id}</span>
                  <br/>
                  <span>${node.data?.jishoData?.kunyomi || ''}</span>
                  <br/>
                  <span>${node.data?.jishoData?.meaning || ''}</span>
                </div>
               `;
      }}
      nodeThreeObject={(node: NodeObject) => {
        const color = getNodeDefaultColor(node.id as string);

        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(5, 16, 16),
          new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            depthWrite: false,
            opacity: 0.8,
          }),
        );

        const sprite = new SpriteText(String(node.id));
        sprite.fontFace =
          "Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid Serif, Times, Source Serif Pro, serif";
        sprite.color = "#000";
        sprite.textHeight = 6;
        sprite.fontSize = 80;
        sprite.padding = 2;

        const group = new THREE.Group();
        group.add(sprite);
        group.add(ball);
        return group;
      }}
      linkThreeObjectExtend={false}
    />
  );
};

export default CompleteGraph3D;
