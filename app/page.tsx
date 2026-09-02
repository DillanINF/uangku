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
} from "lucide-react";

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

type CategoryData = {
  name: string;
  amount: number;
  percent: number;
  icon: React.ElementType;
  color: string;
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
   ICON TRANSAKSI
========================================================= */

function getTransactionIcon(category: string) {
  const normalized = category.toLowerCase();

  if (
    normalized.includes("makan") ||
    normalized.includes("makanan") ||
    normalized.includes("minum")
  ) {
    return <Utensils size={15} />;
  }

  if (
    normalized.includes("transport") ||
    normalized.includes("kendaraan") ||
    normalized.includes("bensin")
  ) {
    return <Car size={15} />;
  }

  if (
    normalized.includes("belanja") ||
    normalized.includes("shopping")
  ) {
    return <ShoppingCart size={15} />;
  }

  if (
    normalized.includes("hiburan") ||
    normalized.includes("game")
  ) {
    return <Gamepad2 size={15} />;
  }

  if (
    normalized.includes("tagihan") ||
    normalized.includes("listrik") ||
    normalized.includes("internet")
  ) {
    return <Receipt size={15} />;
  }

  return <Wallet size={15} />;
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function getCategoryConfig(category: string) {
  const normalized = category.toLowerCase();

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
    color: "bg-gray-400",
  };
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

    const parsed = new Date(year, month, day).getTime();

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

/* =========================================================
   GOALS
========================================================= */

const goals: Goal[] = [
  {
    id: 1,
    name: "Dana Darurat",
    target: 10000000,
    saved: 5000000,
    percent: 50,
    color: "bg-emerald-400",
  },
  {
    id: 2,
    name: "Liburan ke Bali",
    target: 5000000,
    saved: 2500000,
    percent: 50,
    color: "bg-blue-400",
  },
  {
    id: 3,
    name: "Beli Laptop Baru",
    target: 12000000,
    saved: 3000000,
    percent: 25,
    color: "bg-purple-400",
  },
];

/* =========================================================
   DASHBOARD
========================================================= */

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  /* -------------------------------------------------------
     LOAD TRANSACTIONS
  ------------------------------------------------------- */

  useEffect(() => {
    const loadTransactions = () => {
      const savedTransactions = localStorage.getItem(
        "uangku_transactions"
      );

      if (!savedTransactions) {
        setTransactions([]);
        return;
      }

      try {
        const parsedTransactions = JSON.parse(savedTransactions);

        if (Array.isArray(parsedTransactions)) {
          const validTransactions = parsedTransactions.filter(
            (item) =>
              item &&
              typeof item.id === "number" &&
              typeof item.title === "string" &&
              typeof item.amount === "number" &&
              (item.type === "income" ||
                item.type === "expense")
          );

          setTransactions(validTransactions);
        }
      } catch (error) {
        console.error(
          "Gagal membaca transaksi:",
          error
        );

        setTransactions([]);
      }
    };

    loadTransactions();

    /* Agar dashboard otomatis ikut berubah
       ketika localStorage berubah dari halaman lain */
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

 useEffect(() => {
  const loadBudgets = () => {
    const savedBudgets = localStorage.getItem("uangku_budgets");

    if (!savedBudgets) {
      setBudgets([]);
      return;
    }

    try {
      const parsedBudgets = JSON.parse(savedBudgets);

      if (!Array.isArray(parsedBudgets)) {
        setBudgets([]);
        return;
      }

      const dynamicBudgets: Budget[] = parsedBudgets.map((budget) => {
        const target = Number(
          budget.target || budget.amount || budget.limit || 0
        );

        const spent = transactions
          .filter((transaction) => {
            if (transaction.type !== "expense") {
              return false;
            }

            const transactionCategory =
              getCategoryConfig(transaction.category).name;

            return (
              transactionCategory.toLowerCase() ===
              String(budget.name || "").toLowerCase()
            );
          })
          .reduce(
            (total, transaction) =>
              total + Number(transaction.amount || 0),
            0
          );

        const percent =
          target > 0
            ? Math.min(Math.round((spent / target) * 100), 100)
            : 0;

        const config = getCategoryConfig(budget.name || "");

        return {
          id: Number(budget.id || Date.now()),
          name: budget.name || "Lainnya",
          target,
          spent,
          percent,
          color: config.color,
          icon: config.icon,
        };
      });

      setBudgets(dynamicBudgets);
    } catch (error) {
      console.error("Gagal membaca budget:", error);
      setBudgets([]);
    }
  };

  loadBudgets();

  window.addEventListener("storage", loadBudgets);

  return () => {
    window.removeEventListener("storage", loadBudgets);
  };
}, [transactions]);
  
  useEffect(() => {
  const loadGoals = () => {
    const savedGoals = localStorage.getItem("uangku_goals");

    if (!savedGoals) {
      setGoals([]);
      return;
    }

    try {
      const parsedGoals = JSON.parse(savedGoals);

      if (Array.isArray(parsedGoals)) {
        const validGoals = parsedGoals.filter(
          (goal) =>
            goal &&
            typeof goal.id === "number" &&
            typeof goal.name === "string" &&
            typeof goal.target === "number" &&
            typeof goal.saved === "number"
        );

        setGoals(validGoals);
      }
    } catch (error) {
      console.error("Gagal membaca data goals:", error);
      setGoals([]);
    }
  };

  loadGoals();

  window.addEventListener("storage", loadGoals);

  return () => {
    window.removeEventListener("storage", loadGoals);
  };
}, []);

  /* -------------------------------------------------------
     TOTAL PEMASUKAN
  ------------------------------------------------------- */

  const totalIncome = useMemo(() => {
    return transactions
      .filter((item) => item.type === "income")
      .reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  /* -------------------------------------------------------
     TOTAL PENGELUARAN
  ------------------------------------------------------- */

  const totalExpense = useMemo(() => {
    return transactions
      .filter((item) => item.type === "expense")
      .reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  /* -------------------------------------------------------
     SALDO
  ------------------------------------------------------- */

  const balance = totalIncome - totalExpense;

  /* -------------------------------------------------------
     JUMLAH TRANSAKSI
  ------------------------------------------------------- */

  const incomeCount = transactions.filter(
    (item) => item.type === "income"
  ).length;

  const expenseCount = transactions.filter(
    (item) => item.type === "expense"
  ).length;

  /* -------------------------------------------------------
     TRANSAKSI TERBARU
  ------------------------------------------------------- */

  const latestTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          getTransactionTimestamp(b.date) -
          getTransactionTimestamp(a.date)
      )
      .slice(0, 5);
  }, [transactions]);

  /* -------------------------------------------------------
     KATEGORI PENGELUARAN DINAMIS
  ------------------------------------------------------- */

  const categories = useMemo<CategoryData[]>(() => {
    const expenseTransactions = transactions.filter(
      (item) => item.type === "expense"
    );

    if (expenseTransactions.length === 0) {
      return [];
    }

    const grouped: Record<
      string,
      {
        amount: number;
        icon: React.ElementType;
        color: string;
      }
    > = {};

    expenseTransactions.forEach((transaction) => {
      const config = getCategoryConfig(
        transaction.category
      );

      if (!grouped[config.name]) {
        grouped[config.name] = {
          amount: 0,
          icon: config.icon,
          color: config.color,
        };
      }

      grouped[config.name].amount += Number(
        transaction.amount || 0
      );
    });

    const total = expenseTransactions.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount || 0),
      0
    );

    return Object.entries(grouped)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percent:
          total > 0
            ? Math.round((data.amount / total) * 100)
            : 0,
        icon: data.icon,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [transactions]);

  /* -------------------------------------------------------
     DATA GRAFIK
     6 bulan terakhir
  ------------------------------------------------------- */

  const chartData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (5 - index),
          1
        );

        return {
          month: date.toLocaleDateString(
            "id-ID",
            {
              month: "short",
            }
          ),
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          income: 0,
          expense: 0,
        };
      }
    );

    transactions.forEach((transaction) => {
      const timestamp = getTransactionTimestamp(
        transaction.date
      );

      if (!timestamp) return;

      const date = new Date(timestamp);

      const target = months.find(
        (month) =>
          month.monthIndex === date.getMonth() &&
          month.year === date.getFullYear()
      );

      if (!target) return;

      if (transaction.type === "income") {
        target.income += Number(
          transaction.amount || 0
        );
      } else {
        target.expense += Number(
          transaction.amount || 0
        );
      }
    });

    return months;
  }, [transactions]);

  const maxChartValue =
    Math.max(
      ...chartData.map((item) =>
        Math.max(item.income, item.expense)
      ),
      1
    );

  /* -------------------------------------------------------
     BULAN SEKARANG
  ------------------------------------------------------- */

  const currentMonth = new Intl.DateTimeFormat(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    }
  ).format(new Date());

  return (
    <main className="min-h-screen bg-[#070d11] text-white">

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="flex-1 overflow-hidden">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-7">

          <div>
            <h1 className="text-2xl font-bold">
              Sistem Manajemen Keuangan Personal
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Ringkasan keuanganmu hari ini
            </p>
          </div>

          <div className="w-fit rounded-xl border border-slate-700 bg-[#10191f] px-4 py-3 text-sm text-slate-300">
            📅{" "}
            <span className="capitalize">
              {currentMonth}
            </span>
          </div>

        </header>

        <div className="space-y-5 px-5 pb-8 md:px-7">

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              title="Saldo Saat Ini"
              value={formatRupiah(balance)}
              description="Total uang yang kamu miliki"
              type="balance"
            />

            <SummaryCard
              title="Total Pemasukan"
              value={formatRupiah(totalIncome)}
              description={`dari ${incomeCount} transaksi`}
              type="income"
            />

            <SummaryCard
              title="Total Pengeluaran"
              value={formatRupiah(totalExpense)}
              description={`dari ${expenseCount} transaksi`}
              type="expense"
            />

            <SummaryCard
              title="Sisa Budget"
              value="Rp 0"
              description="Belum ada anggaran aktif"
              type="budget"
            />

          </div>

          {/* =================================================
              GRAPH + CATEGORY
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* =================================================
                GRAPH
            ================================================= */}

            <div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-semibold">
                    Ringkasan Arus Keuangan
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Pemasukan dan pengeluaran 6 bulan terakhir
                  </p>
                </div>

                <div className="flex gap-3 text-[10px]">

                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Pemasukan
                  </span>

                  <span className="flex items-center gap-1 text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Pengeluaran
                  </span>

                </div>

              </div>

              <div className="mt-6 h-[240px]">

                <div className="flex h-full items-end gap-3 border-b border-l border-slate-800 px-3">

                  {chartData.map((item) => {

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
                          className="w-1/2 rounded-t-md bg-emerald-400/50 transition-all"
                          style={{
                            height: `${incomeHeight}%`,
                          }}
                          title={`Pemasukan: ${formatRupiah(
                            item.income
                          )}`}
                        />

                        <div
                          className="w-1/2 rounded-t-md bg-red-400/50 transition-all"
                          style={{
                            height: `${expenseHeight}%`,
                          }}
                          title={`Pengeluaran: ${formatRupiah(
                            item.expense
                          )}`}
                        />

                      </div>
                    );
                  })}

                </div>

                <div className="mt-3 flex justify-between px-3 text-xs text-slate-500">

                  {chartData.map((item) => (
                    <span
                      key={`${item.year}-${item.monthIndex}-label`}
                    >
                      {item.month}
                    </span>
                  ))}

                </div>

              </div>

            </div>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">

              <div>
                <h2 className="font-semibold">
                  Pengeluaran Berdasarkan Kategori
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Berdasarkan transaksi yang tersimpan
                </p>
              </div>

              {categories.length === 0 ? (

                <div className="flex h-[240px] items-center justify-center text-center">

                  <div>
                    <Wallet
                      size={32}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Belum ada data pengeluaran
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Tambahkan transaksi untuk melihat kategori
                    </p>
                  </div>

                </div>

              ) : (

                <div className="mt-5 flex flex-col gap-4">

                  {categories.map((category) => {

                    const Icon = category.icon;

                    return (
                      <div
                        key={category.name}
                        className="flex items-center gap-3"
                      >

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${category.color}/20`}
                        >
                          <Icon size={15} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs text-slate-300">
                            {category.name}
                          </p>

                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className={`h-full rounded-full ${category.color} transition-all`}
                              style={{
                                width: `${category.percent}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-xs text-slate-300">
                            {formatRupiah(
                              category.amount
                            )}
                          </p>

                          <p className="text-[10px] text-slate-500">
                            {category.percent}%
                          </p>

                        </div>

                      </div>
                    );
                  })}

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              BOTTOM CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* =================================================
                TRANSACTIONS
            ================================================= */}

            <div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-semibold">
                    Transaksi Terbaru
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    5 transaksi terakhir
                  </p>
                </div>

                <Link
                  href="/transactions"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black transition hover:bg-emerald-400"
                  title="Tambah transaksi"
                >
                  <Plus size={18} />
                </Link>

              </div>

              <div className="mt-4 space-y-4">

                {latestTransactions.length === 0 ? (

                  <div className="py-8 text-center">

                    <Wallet
                      size={30}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-xs text-slate-500">
                      Belum ada transaksi
                    </p>

                    <Link
                      href="/transactions"
                      className="mt-3 inline-block text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      Tambah transaksi
                    </Link>

                  </div>

                ) : (

                  latestTransactions.map(
                    (transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-3"
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
                            <ArrowDownLeft
                              size={16}
                            />
                          ) : (
                            getTransactionIcon(
                              transaction.category
                            )
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-medium">
                            {transaction.title}
                          </p>

                          <p className="truncate text-[10px] text-slate-500">
                            {transaction.category}{" "}
                            · {transaction.date}
                          </p>

                        </div>

                        <p
                          className={`whitespace-nowrap text-xs font-semibold ${
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
                  )

                )}

              </div>

              <Link
                href="/transactions"
                className="mt-5 block w-full rounded-lg border border-slate-700 py-2 text-center text-xs text-emerald-400 transition hover:bg-emerald-500/5"
              >
                Lihat Semua Transaksi
              </Link>

            </div>

            {/* =================================================
                BUDGET
            ================================================= */}

            <div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-semibold">
                    Anggaran Bulan Ini
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Pantau penggunaan anggaran
                  </p>
                </div>

              </div>

              <div className="mt-5 space-y-5">

                {budgets.map((budget) => {

                  const Icon = budget.icon;

                  return (
                    <div key={budget.name}>

                      <div className="flex items-center gap-2">

                        <Icon
                          size={16}
                          className="shrink-0 text-slate-300"
                        />

                        <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                          {budget.name}
                        </span>

                        <span className="shrink-0 text-[9px] text-slate-500">
                          {formatRupiah(budget.spent)} / {formatRupiah(budget.target)}
                        </span>

                      </div>

                      <div className="mt-2 flex items-center gap-2">

                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className={`h-full rounded-full ${budget.color} transition-all`}
                            style={{
                              width: `${budget.percent}%`,
                            }}
                          />

                        </div>

                        <span className="w-8 text-right text-[9px] text-slate-400">
                          {budget.percent}%
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

              <Link
                href="/budgets"
                className="mt-5 block w-full rounded-lg border border-slate-700 py-2 text-center text-xs text-emerald-400 transition hover:bg-emerald-500/5"
              >
                Kelola Anggaran
              </Link>

            </div>

            {/* =================================================
    GOALS
================================================= */}

<div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">

  <div>
    <h2 className="font-semibold">
      Tujuan Keuangan
    </h2>

    <p className="mt-1 text-xs text-slate-500">
      Progress tujuan keuanganmu
    </p>
  </div>

  {goals.length === 0 ? (

    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
        <Target
          size={24}
          className="text-emerald-400"
        />
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Belum ada tujuan keuangan
      </p>

      <Link
        href="/goals"
        className="mt-3 text-xs text-emerald-400 transition hover:text-emerald-300"
      >
        Tambah tujuan
      </Link>

    </div>

  ) : (

    <div className="mt-5 space-y-6">

      {goals.slice(0, 3).map((goal) => {

        const target = Number(goal.target || 0);
        const saved = Number(goal.saved || 0);

        const percent =
          target > 0
            ? Math.min(
                Math.round((saved / target) * 100),
                100
              )
            : 0;

        const completed = saved >= target;

        return (
          <div key={goal.id}>

            {/* GOAL INFO */}

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800">

                <Target
                  size={16}
                  className={
                    completed
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }
                />

              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-medium">
                  {goal.name}
                </p>

                <p className="mt-1 truncate text-[10px] text-slate-500">
                  {formatRupiah(saved)} /{" "}
                  {formatRupiah(target)}
                </p>

              </div>

              <span
                className={`text-[10px] font-semibold ${
                  completed
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {completed
                  ? "Selesai"
                  : `${percent}%`}
              </span>

            </div>

            {/* PROGRESS */}

            <div className="mt-2">

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                  }}
                />

              </div>

            </div>

          </div>
        );
      })}

    </div>

  )}

  <Link
    href="/goals"
    className="mt-5 block w-full rounded-lg border border-slate-700 py-2 text-center text-xs text-emerald-400 transition hover:bg-emerald-500/5"
  >
    {goals.length > 3
      ? "Lihat Semua Tujuan"
      : "Kelola Tujuan"}
  </Link>

</div>

            <div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">

              <div>
                <h2 className="font-semibold">
                  Tujuan Keuangan
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Progress tujuan keuanganmu
                </p>
              </div>

              <div className="mt-5 space-y-6">

                {goals.map((goal) => (
                  <div key={goal.name}>

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800">

                        <Target
                          size={16}
                          className="text-emerald-400"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs font-medium">
                          {goal.name}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-slate-500">
                          {formatRupiah(goal.saved)} / {formatRupiah(goal.target)}
                        </p>

                      </div>

                    </div>

                    <div className="mt-2 flex items-center gap-2">

                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className={`h-full rounded-full ${goal.color}`}
                          style={{
                            width: `${goal.percent}%`,
                          }}
                        />

                      </div>

                      <span className="w-8 text-right text-[10px] text-slate-400">
                        {goal.percent}%
                      </span>

                    </div>

                  </div>
                ))}

              </div>

              <Link
                href="/goals"
                className="mt-4 block w-full rounded-lg border border-slate-700 py-2 text-center text-xs text-emerald-400 transition hover:bg-emerald-500/5"
              >
                Lihat Semua Tujuan
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  description,
  type,
}: {
  title: string;
  value: string;
  description: string;
  type:
    | "balance"
    | "income"
    | "expense"
    | "budget";
}) {
  const color =
    type === "income"
      ? "text-blue-400"
      : type === "expense"
        ? "text-red-400"
        : type === "budget"
          ? "text-yellow-400"
          : "text-emerald-400";

  const Icon =
    type === "income"
      ? TrendingUp
      : type === "expense"
        ? TrendingDown
        : type === "budget"
          ? Wallet
          : Wallet;

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0c151b] p-5 transition hover:border-slate-700">

      <div className="flex items-center justify-between">

        <div className="min-w-0">

          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p
            className={`mt-2 truncate text-xl font-bold ${color}`}
          >
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {description}
          </p>

        </div>

        <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800">

          <Icon
            size={19}
            className={color}
          />

        </div>

      </div>

    </div>
  );
}