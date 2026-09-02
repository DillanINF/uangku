"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Utensils,
  Car,
  Gamepad2,
  ShoppingCart,
  Receipt,
} from "lucide-react";

type Budget = {
  id: number;
  name: string;
  amount: number;
  category: string;
};

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (
    normalized.includes("makan") ||
    normalized.includes("makanan") ||
    normalized.includes("minum")
  ) {
    return Utensils;
  }

  if (
    normalized.includes("transport") ||
    normalized.includes("kendaraan") ||
    normalized.includes("bensin")
  ) {
    return Car;
  }

  if (
    normalized.includes("hiburan") ||
    normalized.includes("game")
  ) {
    return Gamepad2;
  }

  if (
    normalized.includes("belanja") ||
    normalized.includes("shopping")
  ) {
    return ShoppingCart;
  }

  if (
    normalized.includes("tagihan") ||
    normalized.includes("listrik") ||
    normalized.includes("internet")
  ) {
    return Receipt;
  }

  return Wallet;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loaded, setLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    const savedBudgets = localStorage.getItem("uangku_budgets");

    if (savedBudgets) {
      try {
        const parsed = JSON.parse(savedBudgets);

        if (Array.isArray(parsed)) {
          setBudgets(parsed);
        }
      } catch (error) {
        console.error("Gagal membaca budget:", error);
      }
    }

    const savedTransactions = localStorage.getItem(
      "uangku_transactions"
    );

    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);

        if (Array.isArray(parsed)) {
          setTransactions(parsed);
        }
      } catch (error) {
        console.error(
          "Gagal membaca transaksi:",
          error
        );
      }
    }

    const savedCategories = localStorage.getItem(
      "uangku_categories"
    );

    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);

        if (Array.isArray(parsed)) {
          setCategories(
            parsed
              .map((item) =>
                typeof item === "string"
                  ? item
                  : item?.name
              )
              .filter(Boolean)
          );
        }
      } catch (error) {
        console.error(
          "Gagal membaca kategori:",
          error
        );
      }
    }

    setLoaded(true);
  }, []);

  /* =====================================================
     SAVE BUDGET
  ===================================================== */

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "uangku_budgets",
      JSON.stringify(budgets)
    );
  }, [budgets, loaded]);

  /* =====================================================
     TRANSACTIONS UPDATE
  ===================================================== */

  useEffect(() => {
    const updateTransactions = () => {
      const saved = localStorage.getItem(
        "uangku_transactions"
      );

      if (!saved) {
        setTransactions([]);
        return;
      }

      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setTransactions(parsed);
        }
      } catch (error) {
        console.error(
          "Gagal membaca transaksi:",
          error
        );
      }
    };

    window.addEventListener(
      "storage",
      updateTransactions
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateTransactions
      );
    };
  }, []);

  /* =====================================================
     TAMBAH / EDIT BUDGET
  ===================================================== */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama anggaran harus diisi.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Nominal anggaran harus lebih dari 0.");
      return;
    }

    if (!category) {
      alert("Silakan pilih kategori.");
      return;
    }

    if (editingId !== null) {
      setBudgets((prev) =>
        prev.map((budget) =>
          budget.id === editingId
            ? {
                ...budget,
                name: name.trim(),
                amount: Number(amount),
                category,
              }
            : budget
        )
      );
    } else {
      const newBudget: Budget = {
        id: Date.now(),
        name: name.trim(),
        amount: Number(amount),
        category,
      };

      setBudgets((prev) => [
        newBudget,
        ...prev,
      ]);
    }

    resetForm();
  }

  /* =====================================================
     RESET FORM
  ===================================================== */

  function resetForm() {
    setName("");
    setAmount("");
    setCategory("");
    setEditingId(null);
    setShowForm(false);
  }

  /* =====================================================
     EDIT
  ===================================================== */

  function handleEdit(budget: Budget) {
    setEditingId(budget.id);
    setName(budget.name);
    setAmount(String(budget.amount));
    setCategory(budget.category);
    setShowForm(true);
  }

  /* =====================================================
     DELETE
  ===================================================== */

  function handleDelete(id: number) {
    const budget = budgets.find(
      (item) => item.id === id
    );

    if (!budget) return;

    const confirmed = confirm(
      `Hapus anggaran "${budget.name}"?`
    );

    if (!confirmed) return;

    setBudgets((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  /* =====================================================
     HITUNG PENGELUARAN BULAN INI
  ===================================================== */

  function getSpentForBudget(
    budget: Budget
  ) {
    const now = new Date();

    return transactions
      .filter((transaction) => {
        if (transaction.type !== "expense") {
          return false;
        }

        if (
          transaction.category.toLowerCase() !==
          budget.category.toLowerCase()
        ) {
          return false;
        }

        const date = new Date(
          transaction.id
        );

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() ===
            now.getFullYear()
        );
      })
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );
  }

  /* =====================================================
     TOTAL BUDGET
  ===================================================== */

  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (total, budget) =>
        total + budget.amount,
      0
    );
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets.reduce(
      (total, budget) =>
        total +
        getSpentForBudget(budget),
      0
    );
  }, [budgets, transactions]);

  const totalRemaining = Math.max(
    totalBudget - totalSpent,
    0
  );

  return (
    <main className="min-h-screen bg-[#070d11] p-6 text-white md:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="mb-1 text-sm text-slate-500">
            Atur batas pengeluaranmu
          </p>

          <h1 className="text-3xl font-bold">
            Anggaran
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Pantau dan kelola anggaran keuanganmu
            setiap bulan.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setName("");
            setAmount("");
            setCategory(
              categories[0] || ""
            );
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#06100c] transition hover:bg-emerald-400"
        >
          <Plus size={19} />
          Tambah Anggaran
        </button>

      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-4 md:grid-cols-3">

        <SummaryCard
          title="Total Anggaran"
          value={formatRupiah(totalBudget)}
          icon={<Wallet size={21} />}
        />

        <SummaryCard
          title="Sudah Digunakan"
          value={formatRupiah(totalSpent)}
          icon={<Receipt size={21} />}
        />

        <SummaryCard
          title="Sisa Anggaran"
          value={formatRupiah(totalRemaining)}
          icon={<Wallet size={21} />}
        />

      </div>

      {/* BUDGET LIST */}

      <section className="rounded-2xl border border-slate-800 bg-[#0b141a]">

        <div className="border-b border-slate-800 p-5">
          <h2 className="font-semibold">
            Anggaran Bulan Ini
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Penggunaan dihitung berdasarkan transaksi
            bulan berjalan.
          </p>
        </div>

        {budgets.length === 0 ? (

          <div className="flex min-h-[300px] items-center justify-center p-8 text-center">

            <div>

              <Wallet
                size={40}
                className="mx-auto text-slate-700"
              />

              <p className="mt-4 text-sm text-slate-500">
                Belum ada anggaran
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Tambahkan anggaran untuk mulai
                mengontrol pengeluaran.
              </p>

              <button
                onClick={() => {
                  setCategory(
                    categories[0] || ""
                  );
                  setShowForm(true);
                }}
                className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400"
              >
                Tambah Anggaran
              </button>

            </div>

          </div>

        ) : (

          <div className="divide-y divide-slate-800">

            {budgets.map((budget) => {
              const Icon =
                getCategoryIcon(
                  budget.category
                );

              const spent =
                getSpentForBudget(
                  budget
                );

              const remaining =
                Math.max(
                  budget.amount - spent,
                  0
                );

              const percent =
                budget.amount > 0
                  ? Math.min(
                      Math.round(
                        (spent /
                          budget.amount) *
                          100
                      ),
                      100
                    )
                  : 0;

              return (
                <div
                  key={budget.id}
                  className="p-5"
                >

                  <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                        <div>
                          <p className="font-medium">
                            {budget.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {budget.category}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              handleEdit(
                                budget
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                            title="Edit"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                budget.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                            title="Hapus"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>

                      </div>

                      <div className="mt-4">

                        <div className="mb-2 flex justify-between text-xs">

                          <span className="text-slate-400">
                            {formatRupiah(
                              spent
                            )}{" "}
                            /{" "}
                            {formatRupiah(
                              budget.amount
                            )}
                          </span>

                          <span className="text-slate-400">
                            {percent}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className={`h-full rounded-full transition-all ${
                              percent >= 100
                                ? "bg-red-400"
                                : percent >= 80
                                  ? "bg-yellow-400"
                                  : "bg-emerald-400"
                            }`}
                            style={{
                              width: `${percent}%`,
                            }}
                          />

                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          Sisa{" "}
                          <span className="text-slate-300">
                            {formatRupiah(
                              remaining
                            )}
                          </span>
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>

      {/* MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b141a] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  {editingId !== null
                    ? "Edit Anggaran"
                    : "Tambah Anggaran"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tentukan batas pengeluaranmu.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="text-2xl text-slate-500 hover:text-white"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Nama Anggaran
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Contoh: Budget Makan"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Nominal Anggaran
                </label>

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  placeholder="1500000"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Kategori
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="">
                    Pilih kategori
                  </option>

                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                {categories.length === 0 && (
                  <p className="mt-2 text-xs text-yellow-500">
                    Belum ada kategori.
                    Buat kategori terlebih dahulu.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-[#06100c] transition hover:bg-emerald-400"
              >
                {editingId !== null
                  ? "Simpan Perubahan"
                  : "Simpan Anggaran"}
              </button>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}

/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b141a] p-5">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>

    </div>
  );
}