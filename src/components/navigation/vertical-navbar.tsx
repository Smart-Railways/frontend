"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Train,
  Building2,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { LiveClock } from "@/components/ui/live-clock";

interface VerticalNavbarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  unreadCount?: number;
}

export function VerticalNavbar({
  activeTab,
  onTabChange,
  unreadCount = 3,
}: VerticalNavbarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle body class to prevent stacking context bleed when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("mobile-nav-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("mobile-nav-open");
      document.body.style.overflow = "";
    }
    return () => {
      document.body.classList.remove("mobile-nav-open");
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Determine active navigation item from current route
  const currentActiveTab =
    activeTab ||
    (pathname === "/maintenance"
      ? "maintenance"
      : pathname === "/assets"
      ? "assets"
      : pathname === "/trains"
      ? "trains"
      : pathname === "/"
      ? "dashboard"
      : "dashboard");

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      id: "trains",
      label: "Trains",
      icon: Train,
      href: "/trains",
    },
    {
      id: "assets",
      label: "Assets",
      icon: Building2,
      href: "/assets",
    },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: Wrench,
      href: "/maintenance",
    },
  ];

  return (
    <>
      {/* =========================================================
          1. MOBILE FIXED HEADER BAR (< lg)
          Provides a sticky top header bar with menu toggle & branding
      ========================================================== */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-brand-surface/95 backdrop-blur-md border-b border-brand-border/80 px-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open Navigation Menu"
            className="p-2 rounded-xl bg-brand-tertiary/80 border border-brand-border/80 text-brand-secondary hover:text-brand-primary active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Date and Time on Upper Corridor for Mobile & Tablet */}
        <div className="flex items-center">
          <LiveClock className="scale-85 sm:scale-100 origin-right shadow-2xs" />
        </div>
      </header>

      {/* =========================================================
          2. MOBILE BACKDROP OVERLAY (< lg)
      ========================================================== */}
      {mobileOpen && (
        <div
          data-mobile-overlay
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9998] lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* =========================================================
          3. SIDEBAR NAVIGATION ASIDE
          Desktop (lg+): Fixed on left, optionally collapsed (w-20 vs w-64)
          Mobile (< lg): Off-canvas drawer (-translate-x-full to translate-x-0)
      ========================================================== */}
      <aside
        data-mobile-sidebar
        className={`fixed top-0 left-0 bottom-0
          bg-brand-secondary
          border-r border-[#262b34]
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          select-none
          ${/* Mobile Drawer positioning */ ""}
          ${mobileOpen ? "translate-x-0 w-64 z-[9999] shadow-2xl" : "-translate-x-full lg:translate-x-0 lg:z-30"}
          ${/* Desktop width */ ""}
          ${collapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* TOP BRAND / LOGO */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#262b34]/60">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 overflow-hidden cursor-pointer"
            >
              {/* Brand Logo */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Sanket Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain drop-shadow-sm"
                  priority
                />
              </div>

              {/* Brand Text: always show in mobile drawer; on desktop hide when collapsed */}
              <div
                className={`transition-opacity duration-200 ${
                  collapsed ? "lg:hidden" : "block"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    Sanket
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider block">
                  Indian Railways
                </span>
              </div>
            </Link>

            {/* Mobile Close (X) Button */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation sidebar"
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = currentActiveTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    onTabChange?.(item.id);
                    setMobileOpen(false);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    px-3.5
                    py-2.5
                    rounded-xl
                    text-xs
                    font-medium
                    transition-colors
                    group
                    ${
                      isCurrent
                        ? "bg-[#1f2b3e] text-blue-400 border border-brand-primary/30 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#1f242d] border border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`
                        w-4 h-4
                        transition-colors
                        ${
                          isCurrent
                            ? "text-blue-400"
                            : "text-slate-400 group-hover:text-slate-200"
                        }
                      `}
                    />
                    <span className={collapsed ? "lg:hidden" : "inline"}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}