"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ThemeSwitcherButton } from "./theme-switcher";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navItems = [
  { href: "/list", label: "Kanji List", route: "list" },
  { href: "/radicals", label: "Radicals", route: "radicals" },
  { href: "/practice", label: "Practice", route: "practice" },
  { href: "/learnt", label: "Learnt", route: "learnt" },
  { href: "/associations", label: "Associations", route: "associations" },
  { href: "/about", label: "About", route: "about" },
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
      <div className="flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <div className="flex items-center min-w-[200px]">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="Kanji Learn Logo"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <h1 className="text-base md:text-lg font-extrabold hidden sm:block">
              Kanji Learn
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.route}>
                  <Link href={route === item.route ? "/" : item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        route === item.route && "bg-accent text-accent-foreground",
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden lg:flex items-center gap-2 min-w-[200px] justify-end">
          <ThemeSwitcherButton />
          <Button asChild variant="default" size="sm">
            <a href="https://asakiri.com" target="_blank" rel="noopener noreferrer">
              Check out Asakiri
            </a>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeSwitcherButton />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
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
                  <Button
                    key={item.route}
                    asChild
                    variant={route === item.route ? "secondary" : "ghost"}
                    className="justify-start"
                  >
                    <Link href={route === item.route ? "/" : item.href}>
                      {item.label}
                    </Link>
                  </Button>
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
