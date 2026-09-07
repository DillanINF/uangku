"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Utensils,
  Car,
  Gamepad2,
  ShoppingCart,
  Receipt,
  MoreHorizontal,
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

type Budget = {
  id: number;
  name: string;
  target: number;
  spent: number;
  percent: number;
  color: string;
  icon: React.ElementType;
};

type Goal = {
  id: number;
  name: string;
  target: number;
  saved: number;
  percent: number;
  color: string;
};

/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/* =========================================================
   CATEGORY CONFIG
========================================================= */

function getCategoryConfig(category: string) {
  const normalized = String(category || "").toLowerCase();

  if (
    normalized.includes("makan") ||
    normalized.includes("makanan") ||
    normalized.includes("minum")
  ) {
    return {
      name: "Makanan & Minuman",
      icon: Utensils,
      color: "bg-emerald-400",
    };
  }

  if (
    normalized.includes("transport") ||
    normalized.includes("kendaraan") ||
    normalized.includes("bensin")
  ) {
    return {
      name: "Transportasi",
      icon: Car,
      color: "bg-blue-400",
    };
  }

  if (
    normalized.includes("hiburan") ||
    normalized.includes("game")
  ) {
    return {
      name: "Hiburan",
      icon: Gamepad2,
      color: "bg-purple-400",
    };
  }

  if (
    normalized.includes("belanja") ||
    normalized.includes("shopping")
  ) {
    return {
      name: "Belanja",
      icon: ShoppingCart,
      color: "bg-orange-400",
    };
  }

  if (
    normalized.includes("tagihan") ||
    normalized.includes("listrik") ||
    normalized.includes("internet")
  ) {
    return {
      name: "Tagihan",
      icon: Receipt,
      color: "bg-pink-400",
    };
  }

  return {
    name: "Lainnya",
    icon: MoreHorizontal,
    color: "bg-slate-400",
  };
}

/* =========================================================
   TRANSACTION ICON
========================================================= */

function getTransactionIcon(category: string) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return <Icon size={16} />;
}

/* =========================================================
   DATE HELPER
========================================================= */

function getTransactionTimestamp(date: string) {
  if (!date) return 0;

  const timestamp = Date.parse(date);

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const parts = date.split(/[\/\-]/);

  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);

    const parsed = new Date(
      year,
      month,
      day
    ).getTime();

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  /* =======================================================
     LOAD TRANSACTIONS
  ======================================================= */

  useEffect(() => {
    const loadTransactions = () => {
      const savedTransactions =
        localStorage.getItem(
          "uangku_transactions"
        );

      if (!savedTransactions) {
        setTransactions([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(savedTransactions);

        if (!Array.isArray(parsed)) {
          setTransactions([]);
          return;
        }

        const validTransactions =
          parsed.filter(
            (item) =>
              item &&
              typeof item.id === "number" &&
              typeof item.title === "string" &&
              typeof item.amount === "number" &&
              (item.type === "income" ||
                item.type === "expense")
          );

        setTransactions(validTransactions);
      } catch (error) {
        console.error(
          "Gagal membaca transaksi:",
          error
        );

        setTransactions([]);
      }
    };

    loadTransactions();

    window.addEventListener(
      "storage",
      loadTransactions
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadTransactions
      );
    };
  }, []);

  /* =======================================================
     LOAD BUDGETS
  ======================================================= */

  useEffect(() => {
    const loadBudgets = () => {
      const savedBudgets =
        localStorage.getItem(
          "uangku_budgets"
        );

      if (!savedBudgets) {
        setBudgets([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(savedBudgets);

        if (!Array.isArray(parsed)) {
          setBudgets([]);
          return;
        }

        const dynamicBudgets: Budget[] =
          parsed.map((budget) => {
            const target = Number(
              budget.target ||
                budget.amount ||
                budget.limit ||
                0
            );

            const spent = transactions
              .filter((transaction) => {
                if (
                  transaction.type !==
                  "expense"
                ) {
                  return false;
                }

                const transactionCategory =
                  getCategoryConfig(
                    transaction.category
                  ).name;

                return (
                  transactionCategory.toLowerCase() ===
                  String(
                    budget.name || ""
                  ).toLowerCase()
                );
              })
              .reduce(
                (total, transaction) =>
                  total +
                  Number(
                    transaction.amount || 0
                  ),
                0
              );

            const percent =
              target > 0
                ? Math.min(
                    Math.round(
                      (spent / target) *
                        100
                    ),
                    100
                  )
                : 0;

            const config =
              getCategoryConfig(
                budget.name || ""
              );

            return {
              id: Number(
                budget.id || Date.now()
              ),
              name:
                budget.name ||
                "Lainnya",
              target,
              spent,
              percent,
              color: config.color,
              icon: config.icon,
            };
          });

        setBudgets(dynamicBudgets);
      } catch (error) {
        console.error(
          "Gagal membaca budget:",
          error
        );

        setBudgets([]);
      }
    };

    loadBudgets();

    window.addEventListener(
      "storage",
      loadBudgets
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadBudgets
      );
    };
  }, [transactions]);

  /* =======================================================
     LOAD GOALS
  ======================================================= */

  useEffect(() => {
    const loadGoals = () => {
      const savedGoals =
        localStorage.getItem(
          "uangku_goals"
        );

      if (!savedGoals) {
        setGoals([]);
        return;
      }

      try {
        const parsed =
          JSON.parse(savedGoals);

        if (!Array.isArray(parsed)) {
          setGoals([]);
          return;
        }

        const validGoals =
          parsed.filter(
            (goal) =>
              goal &&
              typeof goal.id === "number" &&
              typeof goal.name === "string" &&
              typeof goal.target === "number" &&
              typeof goal.saved === "number"
          );

        setGoals(validGoals);
      } catch (error) {
        console.error(
          "Gagal membaca goals:",
          error
        );

        setGoals([]);
      }
    };

    loadGoals();

    window.addEventListener(
      "storage",
      loadGoals
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadGoals
      );
    };
  }, []);

  /* =======================================================
     TOTAL PEMASUKAN
  ======================================================= */

  const totalIncome = useMemo(() => {
    return transactions
      .filter(
        (item) => item.type === "income"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  /* =======================================================
     TOTAL PENGELUARAN
  ======================================================= */

  const totalExpense = useMemo(() => {
    return transactions
      .filter(
        (item) => item.type === "expense"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  /* =======================================================
     SALDO
  ======================================================= */

  const balance =
    totalIncome - totalExpense;

  /* =======================================================
     TRANSAKSI TERBARU
  ======================================================= */

  const latestTransactions =
    useMemo(() => {
      return [...transactions]
        .sort(
          (a, b) =>
            getTransactionTimestamp(
              b.date
            ) -
            getTransactionTimestamp(
              a.date
            )
        )
        .slice(0, 3);
    }, [transactions]);

  /* =======================================================
     GRAFIK 6 BULAN
  ======================================================= */

  const chartData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() -
            (5 - index),
          1
        );

        return {
          month:
            date.toLocaleDateString(
              "id-ID",
              {
                month: "short",
              }
            ),
          monthIndex:
            date.getMonth(),
          year: date.getFullYear(),
          income: 0,
          expense: 0,
        };
      }
    );

    transactions.forEach(
      (transaction) => {
        const timestamp =
          getTransactionTimestamp(
            transaction.date
          );

        if (!timestamp) return;

        const date =
          new Date(timestamp);

        const target =
          months.find(
            (month) =>
              month.monthIndex ===
                date.getMonth() &&
              month.year ===
                date.getFullYear()
          );

        if (!target) return;

        if (
          transaction.type ===
          "income"
        ) {
          target.income += Number(
            transaction.amount || 0
          );
        } else {
          target.expense += Number(
            transaction.amount || 0
          );
        }
      }
    );

    return months;
  }, [transactions]);

  const maxChartValue =
    Math.max(
      ...chartData.map((item) =>
        Math.max(
          item.income,
          item.expense
        )
      ),
      1
    );

  /* =======================================================
     BUDGET SUMMARY
  ======================================================= */

  const budgetSummary = useMemo(() => {
    if (budgets.length === 0) {
      return {
        total: 0,
        spent: 0,
        percent: 0,
      };
    }

    const total = budgets.reduce(
      (sum, budget) =>
        sum +
        Number(budget.target || 0),
      0
    );

    const spent = budgets.reduce(
      (sum, budget) =>
        sum +
        Number(budget.spent || 0),
      0
    );

    const percent =
      total > 0
        ? Math.min(
            Math.round(
              (spent / total) * 100
            ),
            100
          )
        : 0;

    return {
      total,
      spent,
      percent,
    };
  }, [budgets]);

  /* =======================================================
     GOAL SUMMARY
  ======================================================= */

  const goalSummary = useMemo(() => {
    if (goals.length === 0) {
      return {
        total: 0,
        saved: 0,
        percent: 0,
      };
    }

    const total = goals.reduce(
      (sum, goal) =>
        sum +
        Number(goal.target || 0),
      0
    );

    const saved = goals.reduce(
      (sum, goal) =>
        sum +
        Number(goal.saved || 0),
      0
    );

    const percent =
      total > 0
        ? Math.min(
            Math.round(
              (saved / total) * 100
            ),
            100
          )
        : 0;

    return {
      total,
      saved,
      percent,
    };
  }, [goals]);

  /* =======================================================
     BULAN
  ======================================================= */

  const currentMonth =
    new Intl.DateTimeFormat(
      "id-ID",
      {
        month: "long",
        year: "numeric",
      }
    ).format(new Date());

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#070d11] text-white">

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6 flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="mb-1 text-xs font-medium text-emerald-400">
              UANGKU
            </p>

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Ringkasan Keuangan
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Pantau kondisi keuanganmu
              dengan cepat.
            </p>

          </div>

          <div className="shrink-0 rounded-xl border border-slate-800 bg-[#0c151b] px-3 py-2 text-right">

            <p className="text-[9px] uppercase tracking-wider text-slate-500">
              Periode
            </p>

            <p className="mt-0.5 text-xs font-medium capitalize text-slate-300">
              {currentMonth}
            </p>

          </div>

        </header>

        {/* =================================================
            SALDO UTAMA
        ================================================= */}

        <section className="mb-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0c151b]">

          <div className="p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Wallet size={16} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Saldo Saat Ini
                  </span>

                </div>

                <h2 className="mt-4 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {formatRupiah(balance)}
                </h2>

              </div>

              <Link
                href="/transactions"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-black transition hover:bg-emerald-400"
                title="Tambah transaksi"
              >
                <Plus size={18} />
              </Link>

            </div>

            {/* INCOME / EXPENSE */}

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-[#101a20] p-3">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ArrowDownLeft
                      size={14}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500">
                    Pemasukan
                  </span>

                </div>

                <p className="mt-2 truncate text-sm font-semibold text-emerald-400">
                  {formatRupiah(
                    totalIncome
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-[#101a20] p-3">

                <div className="flex items-center gap-2">

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                    <ArrowUpRight
                      size={14}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500">
                    Pengeluaran
                  </span>

                </div>

                <p className="mt-2 truncate text-sm font-semibold text-red-400">
                  {formatRupiah(
                    totalExpense
                  )}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            GRAFIK
        ================================================= */}

        <section className="mb-4 rounded-2xl border border-slate-800 bg-[#0c151b] p-4 sm:p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-sm font-semibold">
                Arus Keuangan
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                6 bulan terakhir
              </p>

            </div>

            <div className="flex items-center gap-3">

              <span className="flex items-center gap-1.5 text-[9px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Masuk
              </span>

              <span className="flex items-center gap-1.5 text-[9px] text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Keluar
              </span>

            </div>

          </div>

          <div className="mt-4 h-[180px] sm:h-[240px]">

            <div className="flex h-full items-end gap-2 border-b border-l border-slate-800 px-2 sm:gap-4 sm:px-4">

              {chartData.map(
                (item) => {

                  const incomeHeight =
                    item.income > 0
                      ? Math.max(
                          (item.income /
                            maxChartValue) *
                            100,
                          4
                        )
                      : 0;

                  const expenseHeight =
                    item.expense > 0
                      ? Math.max(
                          (item.expense /
                            maxChartValue) *
                            100,
                          4
                        )
                      : 0;

                  return (
                    <div
                      key={`${item.year}-${item.monthIndex}`}
                      className="flex h-full flex-1 items-end justify-center gap-1"
                    >

                      <div
                        className="w-1/2 rounded-t bg-emerald-400/60 transition-all"
                        style={{
                          height: `${incomeHeight}%`,
                        }}
                        title={`Pemasukan: ${formatRupiah(
                          item.income
                        )}`}
                      />

                      <div
                        className="w-1/2 rounded-t bg-red-400/60 transition-all"
                        style={{
                          height: `${expenseHeight}%`,
                        }}
                        title={`Pengeluaran: ${formatRupiah(
                          item.expense
                        )}`}
                      />

                    </div>
                  );
                }
              )}

            </div>

            <div className="mt-2 flex justify-between px-2 text-[9px] text-slate-600 sm:px-4">

              {chartData.map(
                (item) => (
                  <span
                    key={`${item.year}-${item.monthIndex}-label`}
                  >
                    {item.month}
                  </span>
                )
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            TRANSAKSI TERBARU
        ================================================= */}

        <section className="mb-4 rounded-2xl border border-slate-800 bg-[#0c151b] p-4 sm:p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-sm font-semibold">
                Transaksi Terbaru
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Aktivitas keuangan terakhir
              </p>

            </div>

            <Link
              href="/transactions"
              className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              Semua
              <ChevronRight size={13} />
            </Link>

          </div>

          {latestTransactions.length ===
          0 ? (
            <div className="py-8 text-center">

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                <Receipt
                  size={17}
                  className="text-slate-500"
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Belum ada transaksi
              </p>

              <Link
                href="/transactions"
                className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400"
              >
                Tambah transaksi
                <ChevronRight
                  size={12}
                />
              </Link>

            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-800/70">

              {latestTransactions.map(
                (transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        transaction.type ===
                        "income"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {transaction.type ===
                      "income" ? (
                        <TrendingUp
                          size={15}
                        />
                      ) : (
                        getTransactionIcon(
                          transaction.category
                        )
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-medium text-slate-200">
                        {transaction.title}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-slate-500">
                        {transaction.category}
                        {" · "}
                        {transaction.date}
                      </p>

                    </div>

                    <p
                      className={`shrink-0 text-xs font-semibold ${
                        transaction.type ===
                        "income"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.type ===
                      "income"
                        ? "+"
                        : "-"}
                      {formatRupiah(
                        transaction.amount
                      )}
                    </p>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            QUICK SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* BUDGET */}

          <section className="rounded-2xl border border-slate-800 bg-[#0c151b] p-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Wallet size={15} />
                </div>

                <div>

                  <h2 className="text-xs font-semibold">
                    Budget
                  </h2>

                  <p className="text-[9px] text-slate-500">
                    Bulan ini
                  </p>

                </div>

              </div>

              <Link
                href="/budgets"
                className="text-[10px] text-slate-500 transition hover:text-emerald-400"
              >
                Kelola
              </Link>

            </div>

            {budgets.length ===
            0 ? (
              <div className="mt-5">

                <p className="text-xs text-slate-500">
                  Belum ada budget aktif.
                </p>

                <Link
                  href="/budgets"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400"
                >
                  Buat budget
                  <ChevronRight
                    size={11}
                  />
                </Link>

              </div>
            ) : (
              <div className="mt-5">

                <div className="flex items-end justify-between">

                  <p className="text-lg font-bold text-white">
                    {budgetSummary.percent}%
                  </p>

                  <p className="text-[9px] text-slate-500">
                    {formatRupiah(
                      budgetSummary.spent
                    )}{" "}
                    /{" "}
                    {formatRupiah(
                      budgetSummary.total
                    )}
                  </p>

                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className={`h-full rounded-full ${
                      budgetSummary.percent >=
                      90
                        ? "bg-red-400"
                        : budgetSummary.percent >=
                            70
                          ? "bg-yellow-400"
                          : "bg-blue-400"
                    }`}
                    style={{
                      width: `${budgetSummary.percent}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-[9px] text-slate-500">
                  {budgetSummary.percent >=
                  90
                    ? "Penggunaan budget hampir penuh."
                    : "Budget masih dalam batas aman."}
                </p>

              </div>
            )}

          </section>

          {/* GOAL */}

          <section className="rounded-2xl border border-slate-800 bg-[#0c151b] p-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Target size={15} />
                </div>

                <div>

                  <h2 className="text-xs font-semibold">
                    Tujuan
                  </h2>

                  <p className="text-[9px] text-slate-500">
                    Progress tabungan
                  </p>

                </div>

              </div>

              <Link
                href="/goals"
                className="text-[10px] text-slate-500 transition hover:text-emerald-400"
              >
                Kelola
              </Link>

            </div>

            {goals.length ===
            0 ? (
              <div className="mt-5">

                <p className="text-xs text-slate-500">
                  Belum ada tujuan keuangan.
                </p>

                <Link
                  href="/goals"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400"
                >
                  Buat tujuan
                  <ChevronRight
                    size={11}
                  />
                </Link>

              </div>
            ) : (
              <div className="mt-5">

                <div className="flex items-end justify-between">

                  <p className="text-lg font-bold text-white">
                    {goalSummary.percent}%
                  </p>

                  <p className="text-[9px] text-slate-500">
                    {formatRupiah(
                      goalSummary.saved
                    )}{" "}
                    /{" "}
                    {formatRupiah(
                      goalSummary.total
                    )}
                  </p>

                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${goalSummary.percent}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-[9px] text-slate-500">
                  {goals.length} tujuan
                  keuangan aktif.
                </p>

              </div>
            )}

          </section>

        </div>

      </div>

    </main>
  );
}