"use client";

import { InfoIcon, ListIcon, PuzzleIcon, Gamepad2Icon, TrophyIcon, NetworkIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants, Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ThemeSwitcherButton } from "./theme-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/list", label: "Kanji List", icon: ListIcon, route: "list" },
  { href: "/radicals", label: "Radicals", icon: PuzzleIcon, route: "radicals" },
  { href: "/practice", label: "Practice Game", icon: Gamepad2Icon, route: "practice" },
  { href: "/learnt", label: "Learnt Kanji", icon: TrophyIcon, route: "learnt" },
  { href: "/associations", label: "3D Associations Network", icon: NetworkIcon, route: "associations" },
  { href: "/about", label: "About", icon: InfoIcon, route: "about" },
];

export const Header = ({
  route,
  className,
}: {
  route?: string;
  className?: string;
}) => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Kanji Learn Logo"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <h1 className="text-base md:text-lg font-extrabold hidden xs:block">
              Kanji Learn
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Tooltip key={item.route}>
              <TooltipTrigger asChild>
                <Link
                  href={route === item.route ? "/" : item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    route === item.route && "bg-accent text-accent-foreground",
                  )}
                >
                  <item.icon className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          <div className="ml-2 border-l pl-2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <ThemeSwitcherButton />
              </TooltipTrigger>
              <TooltipContent>
                <p>Change theme</p>
              </TooltipContent>
            </Tooltip>

            <Button asChild variant="default" size="sm" className="ml-1">
              <a href="https://asakiri.com" target="_blank" rel="noopener noreferrer">
                Check out Asakiri
              </a>
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeSwitcherButton />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <MenuIcon className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Explore Kanji Learn features
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.route}
                    href={route === item.route ? "/" : item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "justify-start gap-3 h-12",
                      route === item.route && "bg-accent text-accent-foreground",
                    )}
                  >
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="mt-4 pt-4 border-t">
                  <Button asChild variant="default" className="w-full">
                    <a href="https://asakiri.com" target="_blank" rel="noopener noreferrer">
                      Check out Asakiri
                    </a>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
