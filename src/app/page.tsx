import { Header } from "@/components/header";
import { HomeContent } from "./home-content";

export default function Home() {
  return (
    <div className="size-full flex flex-col">
      <Header route="home" className="w-full" />
      {/* MOBILE */}
      <div className="w-full h-[calc(100%-3rem)] md:hidden">
        <HomeContent isMobile={true} />
      </div>
      {/* DESKTOP */}
      <div className="w-full h-[calc(100%-3rem)] hidden md:block">
        <HomeContent isMobile={false} />
      </div>
    </div>
  );
}
