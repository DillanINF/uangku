"use client";

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  PieChart,
  Target,
  BarChart3,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "UangKu Service Worker aktif:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "Service Worker gagal:",
            error
          );
        });
    }
  }, []);

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
          Tampil mulai ukuran md
      ===================================================== */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[200px] flex-col border-r border-slate-800 bg-[#080e12] md:flex">

        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
            <Wallet
              size={24}
              className="text-emerald-400"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-emerald-400">
              UANGKU
            </h1>

            <p className="text-[10px] text-slate-400">
              Kelola Keuanganmu
            </p>

            <p className="text-[10px] text-slate-400">
              dengan Bijak
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 px-4">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            href="/"
            active={pathname === "/"}
          />

          <SidebarItem
            icon={<ArrowLeftRight size={18} />}
            text="Transaksi"
            href="/transaksi"
            active={pathname.startsWith("/transaksi")}
          />

          <SidebarItem
            icon={<Tag size={18} />}
            text="Kategori"
            href="/kategori"
            active={pathname.startsWith("/kategori")}
          />

          <SidebarItem
            icon={<PieChart size={18} />}
            text="Anggaran"
            href="/budgets"
            active={pathname.startsWith("/budgets")}
          />

          <SidebarItem
            icon={<Target size={18} />}
            text="Tujuan"
            href="/goals"
            active={pathname.startsWith("/goals")}
          />

          <SidebarItem
            icon={<BarChart3 size={18} />}
            text="Laporan"
            href="/reports"
            active={pathname.startsWith("/reports")}
          />

          <SidebarItem
            icon={<Settings size={18} />}
            text="Pengaturan"
            href="/settings"
            active={pathname.startsWith("/settings")}
          />
        </nav>

        {/* QUOTE */}
        <div className="m-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs leading-5 text-slate-400">
            <span className="text-emerald-400">
              “
            </span>{" "}
            Kelola uangmu hari ini,
            nikmati masa depan.
            <span className="text-emerald-400">
              ”
            </span>
          </p>

          <p className="mt-3 text-[10px] text-slate-500">
            — Bijak Finansial
          </p>
        </div>
      </aside>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
          Tampil hanya di HP
      ===================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#080e12]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">

        <div className="grid grid-cols-6 gap-1 py-2">

          <MobileNavItem
            icon={<LayoutDashboard size={20} />}
            text="Home"
            href="/"
            active={pathname === "/"}
          />

          <MobileNavItem
            icon={<ArrowLeftRight size={20} />}
            text="Transaksi"
            href="/transaksi"
            active={pathname.startsWith("/transaksi")}
          />

          <MobileNavItem
            icon={<Tag size={20} />}
            text="Kategori"
            href="/kategori"
            active={pathname.startsWith("/kategori")}
          />

          <MobileNavItem
            icon={<PieChart size={20} />}
            text="Anggaran"
            href="/budgets"
            active={pathname.startsWith("/budgets")}
          />

          <MobileNavItem
            icon={<BarChart3 size={20} />}
            text="Laporan"
            href="/reports"
            active={pathname.startsWith("/reports")}
          />

          <MobileNavItem
            icon={<Settings size={20} />}
            text="Setting"
            href="/settings"
            active={pathname.startsWith("/settings")}
          />

        </div>
      </nav>
    </>
  );
}

/* =========================================================
   DESKTOP SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  text,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  text: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
        active
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}

      <span>{text}</span>
    </Link>
  );
}

/* =========================================================
   MOBILE NAV ITEM
========================================================= */

function MobileNavItem({
  icon,
  text,
  href,
  active = false,
}: {
  icon: React.ReactNode;
  text: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] transition ${
        active
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {icon}

      <span className="truncate">
        {text}
      </span>
    </Link>
  );
}