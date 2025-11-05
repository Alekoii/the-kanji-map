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
  searchKanji?: string;
}

export const dynamic = "force-dynamic";

const CompleteGraph3D = ({
  graphData,
  triggerFocus,
  bounds,
  autoRotate,
  showParticles,
  joyoOnly,
  searchKanji,
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
  const [selectedNode, setSelectedNode] = React.useState<NodeObject | null>(null);
  const [highlightNodes, setHighlightNodes] = React.useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = React.useState<Set<any>>(new Set());

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
    // Highlight the node and its first-level associations instead of navigating
    if (!node || !data) return;

    const nodeId = String(node.id);

    // Find all connected nodes (first level)
    const connectedNodes = new Set<string>();
    const connectedLinks = new Set();

    data.links.forEach((link: any) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;

      if (String(sourceId) === nodeId) {
        connectedNodes.add(String(targetId));
        connectedLinks.add(link);
      } else if (String(targetId) === nodeId) {
        connectedNodes.add(String(sourceId));
        connectedLinks.add(link);
      }
    });

    // Add the clicked node itself
    connectedNodes.add(nodeId);

    setSelectedNode(node);
    setHighlightNodes(connectedNodes);
    setHighlightLinks(connectedLinks);

    // Focus camera on the selected node
    const distance = 200;
    if (node.x && node.y && node.z && fg3DRef?.current) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      fg3DRef.current.cameraPosition(
        {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        },
        { x: node.x, y: node.y, z: node.z },
        1000,
      );
    }
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

  // Handle search - zoom to kanji when searched
  React.useEffect(() => {
    if (!searchKanji || !data?.nodes) return;

    const searchTimeout = setTimeout(() => {
      const foundNode = data.nodes.find((node) => String(node.id) === searchKanji) as NodeObject;

      if (foundNode) {
        // Simulate click to highlight associations
        handleClick(foundNode);
      }
    }, 100);

    return () => clearTimeout(searchTimeout);
  }, [searchKanji, data]);

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
      return "#3b82f6"; // Joyo kanji - Blue (more vibrant)
    } else if (jinmeiyoList.includes(String(nodeId))) {
      return "#10b981"; // Jinmeiyo kanji - Green (distinct)
    }
    return "#f59e0b"; // Other - Amber/Orange (clearly different)
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
      linkColor={(link: any) => {
        const isHighlighted = highlightLinks.has(link);
        if (isHighlighted) {
          return resolvedTheme === "dark" ? "#ff0080" : "#ff0080"; // Pink/magenta for highlighted
        }
        return resolvedTheme === "dark" ? "#ffffff30" : "#00000020";
      }}
      linkWidth={(link: any) => {
        return highlightLinks.has(link) ? 3 : 1;
      }}
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
        const nodeId = String(node.id);
        const isHighlighted = highlightNodes.has(nodeId);
        const isSelected = selectedNode?.id === node.id;

        let color = getNodeDefaultColor(nodeId);
        let size = 5;
        let textHeight = 6;

        // Highlight selected node
        if (isSelected) {
          color = "#ff0080"; // Magenta for selected
          size = 8;
          textHeight = 9;
        } else if (isHighlighted) {
          // Highlighted connected nodes
          size = 7;
          textHeight = 7.5;
        }

        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(size, 16, 16),
          new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            depthWrite: false,
            opacity: isHighlighted || isSelected ? 1.0 : 0.95,
          }),
        );

        const sprite = new SpriteText(String(node.id));
        sprite.fontFace =
          "Iowan Old Style, Apple Garamond, Baskerville, Times New Roman, Droid Serif, Times, Source Serif Pro, serif";
        sprite.color = "#000";
        sprite.textHeight = textHeight;
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
