import * as React from "react";
import { Header } from "@/components/header";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Metadata } from "next";
import { ProgressManager } from "@/components/progress-manager";

export const metadata: Metadata = {
  title: "About Kanji Learn - Interactive Japanese Kanji Learning Tool",
  description: "Learn about Kanji Learn, a comprehensive Japanese kanji learning tool featuring interactive 3D visualizations, decomposition graphs, and JLPT study resources. Discover how to master Japanese characters effectively.",
};

const About = () => {
  return (
    <>
      <div className="relative h-screen grid grid-rows-[50px_1fr]">
        <Header route="about" />
        <ScrollArea className="w-full">
          <div className="p-4 max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mt-4 mb-4">
              About Kanji Learn
            </h1>
            <p className="mb-4">
              Kanji Learn is a comprehensive Japanese language learning tool that helps you master kanji through interactive visualizations, practice quizzes, and detailed character information. The application features multiple learning modes including browsing, practice games, progress tracking, and 3D network visualizations of kanji relationships.
            </p>
            <p className="mb-8">
              This project is based on{" "}
              <a
                target="_blank"
                href="https://github.com/gabor-kovacs/the-kanji-map"
                rel="noreferrer"
                className="text-primary inline-block hover:underline font-semibold"
              >
                "The Kanji Map"
              </a>
              {" "}originally created by{" "}
              <a
                target="_blank"
                href="https://drgaborkovacs.com/index_en.html"
                rel="noreferrer"
                className="text-primary inline-block hover:underline"
              >
                Gabor Kovacs
              </a>
              {" "}(©2017-{new Date().getFullYear()}), an innovative tool for visualizing kanji decomposition through interactive graphs.
            </p>

            <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
              Features
            </h2>
            <ul className="list-disc ml-6 mb-8 space-y-2">
              <li>
                <strong>Interactive Kanji Browser</strong> - Explore over 2,500 kanji with advanced filtering (JLPT level, stroke count, type)
              </li>
              <li>
                <strong>Practice Mode</strong> - Test your knowledge with multiple-choice quizzes and track your progress
              </li>
              <li>
                <strong>Progress Tracking</strong> - Monitor your learning journey with intelligent scoring system
              </li>
              <li>
                <strong>3D Network Visualization</strong> - See kanji relationships and decomposition in interactive 2D/3D graphs
              </li>
              <li>
                <strong>Detailed Information</strong> - Access meanings, readings, stroke order, examples, and radicals
              </li>
              <li>
                <strong>Export/Import Progress</strong> - Backup and transfer your learning data across devices
              </li>
            </ul>

            <ProgressManager />

            <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
              Support the Project
            </h2>
            <a
              href="https://www.paypal.com/donate?hosted_button_id=U867B8RRZUN7E"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                alt="Donate"
                width={74}
                height={21}
                src={"/btn_donate_SM.gif"}
              />
            </a>
            <p>
              If this project was useful for you and you would like to
              contribute back, you can always{" "}
              <a
                href="https://www.paypal.com/donate?hosted_button_id=U867B8RRZUN7E"
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-block hover:underline"
              >
                Donate!
              </a>
            </p>
            <p>
              Donations are used to pay for hosting, maintenance costs and
              improvements.
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight mt-8 mb-4">
              How to use this site
            </h1>
            <p>
              Kanji are represented with nodes and the connection between them
              with edges in a 2D or 3D force-directed graph. Click/tap on
              visible nodes or use the search field to change the selected node.
              If connected nodes have the same onyomi it is displayed over the
              link. Nodes are colored based on type:{" "}
              <svg className="inline h-[12px]" viewBox="0 0 100 100">
                <circle fill="black" cx={50} cy={50} r={50} />
                <circle fill="#2b99cf" cx={50} cy={50} r={40} />
              </svg>{" "}
              currently selected kanji,{" "}
              <svg className="inline h-[12px]" viewBox="0 0 100 100">
                <circle fill="black" cx={50} cy={50} r={50} />
                <circle fill="#80c2e2" cx={50} cy={50} r={40} />
              </svg>{" "}
              jōyō kanji,{" "}
              <svg className="inline h-[12px]" viewBox="0 0 100 100">
                <circle fill="black" cx={50} cy={50} r={50} />
                <circle fill="#d5ebf5" cx={50} cy={50} r={40} />
              </svg>{" "}
              jinmeiyō kanji,{" "}
              <svg className="inline h-[12px]" viewBox="0 0 100 100">
                <circle fill="black" cx={50} cy={50} r={50} />
                <circle fill="#fff" cx={50} cy={50} r={40} />
              </svg>{" "}
              neither.
            </p>
            <p>Displayed kanji information (where available):</p>
            <ul className="list-disc ml-6">
              <li>
                Type: jōyō kanji (taught in school), jinmeiyō kanji (used in
                names) or neither
              </li>
              <li>JLPT (Japanese-Language Proficiency) Test level</li>
              <li>
                Frequency rank out of 2500 most used kanji found in newspapers
              </li>
              <li>Stroke count</li>
              <li>Meaning</li>
              <li>Kunyomi (Japanese reading of the kanji)</li>
              <li>Onnyomi (Chinese/Sino-Japanese reading of the kanji)</li>
              <li>Examples with audio, kunyomi and onyomi</li>
              <li>Radical with kunyomi and meaning</li>
            </ul>
            <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
              Data Sources & Credits
            </h2>
            <p className="mb-4">
              This application uses high-quality open-source data and libraries from the Japanese learning community:
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Kanji Data & Graphics</h3>
            <ul className="list-disc ml-6 space-y-2 mb-6">
              <li>
                <a
                  href="https://github.com/KanjiVG/kanjivg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  KanjiVG
                </a>
                {" "}- Kanji vector graphics and decomposition data (CC BY-SA 3.0)
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://github.com/parsimonhi/animCJK"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  animCJK
                </a>
                {" "}- Stroke order animations (Arphic Public License)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Dictionary & Linguistic Data</h3>
            <ul className="list-disc ml-6 space-y-2 mb-6">
              <li>
                <a
                  target="_blank"
                  href="https://jisho.org"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  Jisho.org
                </a>
                {" "}- Kanji meanings, readings, examples, and radical information. Sources include{" "}
                <a
                  target="_blank"
                  href="https://jisho.org/about"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline"
                >
                  JMdict, KANJIDIC2, EDICT
                </a>
                {" "}and other open-source dictionaries
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://kanjialive.com/"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  Kanji alive
                </a>
                {" "}- Additional kanji information and examples (CC BY 4.0)
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Technical Libraries</h3>
            <ul className="list-disc ml-6 space-y-2 mb-6">
              <li>
                <a
                  target="_blank"
                  href="https://github.com/vasturiano/react-force-graph"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  react-force-graph
                </a>
                {" "}- Force-directed graph visualizations (MIT License)
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://github.com/vasturiano/three-spritetext"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  three-spritetext
                </a>
                {" "}- 3D text rendering for graphs (MIT License)
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://github.com/ChenYuHo/handwriting.js"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  handwriting.js
                </a>
                {" "}- Handwritten kanji recognition (MIT License)
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://ui.shadcn.com/"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  shadcn/ui
                </a>
                {" "}- Beautiful and accessible UI components (MIT License)
              </li>
              <li>
                <a
                  target="_blank"
                  href="https://nextjs.org/"
                  rel="noreferrer"
                  className="text-primary inline-block hover:underline font-semibold"
                >
                  Next.js
                </a>
                {" "}- React framework for production (MIT License)
              </li>
            </ul>

            <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
              Source Code
            </h2>
            <p className="mb-4">
              The original project source code:{" "}
              <a
                target="_blank"
                href="https://github.com/gabor-kovacs/the-kanji-map"
                rel="noreferrer"
                className="text-primary inline-block hover:underline font-semibold"
              >
                github.com/gabor-kovacs/the-kanji-map
              </a>
            </p>

            <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
              License & Copyright
            </h2>
            <p className="mb-4">
              Original "The Kanji Map" ©2017-{new Date().getFullYear()}{" "}
              <a
                target="_blank"
                href="https://drgaborkovacs.com/index_en.html"
                rel="noreferrer"
                className="text-primary inline-block hover:underline"
              >
                Gabor Kovacs
              </a>
            </p>
            <p className="mb-4">
              Released under the{" "}
              <a
                target="_blank"
                href="https://opensource.org/licenses/MIT"
                rel="noreferrer"
                className="text-primary inline-block hover:underline"
              >
                MIT License
              </a>
              . You are free to use, modify, and distribute this software in accordance with the license terms.
            </p>
            <p className="text-sm text-muted-foreground">
              All third-party data sources and libraries retain their respective licenses and copyrights as listed above.
            </p>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default About;
