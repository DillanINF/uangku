"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Wallet,
  Pencil,
  Trash2,
  Utensils,
  Car,
  ShoppingCart,
  Gamepad2,
  Receipt,
} from "lucide-react";

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

export default function TransaksiPage() {
 const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [loaded, setLoaded] = useState(false);
 const [categories, setCategories] = useState<string[]>([]);
// Ambil data transaksi dari localStorage
useEffect(() => {
  const savedTransactions = localStorage.getItem("uangku_transactions");

  if (savedTransactions) {
    try {
      const parsedTransactions = JSON.parse(savedTransactions);

      if (Array.isArray(parsedTransactions)) {
        setTransactions(parsedTransactions);
      }
    } catch (error) {
      console.error("Gagal membaca data transaksi:", error);
    }
  }

  setLoaded(true);
}, []);

useEffect(() => {
  const savedCategories = localStorage.getItem("uangku_categories");

  if (savedCategories) {
    try {
      const parsedCategories = JSON.parse(savedCategories);

      if (Array.isArray(parsedCategories)) {
        setCategories(
          parsedCategories.map((category) => category.name)
        );
      }
    } catch (error) {
      console.error("Gagal membaca kategori:", error);
    }
  }
}, []);
// Simpan data setiap kali transaksi berubah
useEffect(() => {
  if (!loaded) return;

  localStorage.setItem(
    "uangku_transactions",
    JSON.stringify(transactions)
  );
}, [transactions, loaded]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [type, setType] = useState<"income" | "expense">("expense");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Makanan");

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!title.trim() || !amount || Number(amount) <= 0) {
    alert("Nama transaksi dan nominal harus diisi.");
    return;
  }

  if (type === "expense" && !category) {
    alert("Silakan pilih kategori.");
    return;
  }

  if (editingId !== null) {
    // EDIT TRANSAKSI
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === editingId
          ? {
              ...transaction,
              title: title.trim(),
              category:
                type === "income" ? "Pemasukan" : category,
              amount: Number(amount),
              type,
            }
          : transaction
      )
    );
  } else {
    // TAMBAH TRANSAKSI BARU
    const newTransaction: Transaction = {
      id: Date.now(),
      title: title.trim(),
      category:
        type === "income" ? "Pemasukan" : category,
      amount: Number(amount),
      type,
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    setTransactions((prev) => [
      newTransaction,
      ...prev,
    ]);
  }

  // RESET FORM
  setTitle("");
  setAmount("");
  setCategory("");
  setEditingId(null);
  setShowForm(false);
}

function handleEdit(transaction: Transaction) {
  setEditingId(transaction.id);

  setTitle(transaction.title);
  setAmount(String(transaction.amount));
  setType(transaction.type);

  if (transaction.type === "expense") {
    setCategory(transaction.category);
  } else {
    setCategory("");
  }

  setShowForm(true);
}

function handleDelete(id: number) {
  const transaction = transactions.find(
    (item) => item.id === id
  );

  if (!transaction) return;

  const confirmed = confirm(
    `Hapus transaksi "${transaction.title}"?`
  );

  if (!confirmed) return;

  setTransactions((prev) =>
    prev.filter((item) => item.id !== id)
  );
}

  return (
    <main className="min-h-screen bg-[#070d11] p-6 text-white md:p-8">

      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-1 text-sm text-slate-500">
            Kelola keuanganmu
          </p>

          <h1 className="text-3xl font-bold">
            Transaksi
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Catat dan pantau semua pemasukan serta pengeluaranmu.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#06100c] transition hover:bg-emerald-400"
        >
          <Plus size={19} />
          Tambah Transaksi
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">

        <SummaryCard
          title="Saldo"
          value={formatRupiah(balance)}
          icon={<Wallet size={21} />}
        />

        <SummaryCard
          title="Pemasukan"
          value={formatRupiah(totalIncome)}
          icon={<ArrowDownLeft size={21} />}
        />

        <SummaryCard
          title="Pengeluaran"
          value={formatRupiah(totalExpense)}
          icon={<ArrowUpRight size={21} />}
        />

      </div>

      {/* TRANSACTIONS */}
      <section className="rounded-2xl border border-slate-800 bg-[#0b141a]">

        {/* SECTION HEADER */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center">

          <div>
            <h2 className="font-semibold">
              Semua Transaksi
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {transactions.length} transaksi tercatat
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#081015] px-3 py-2">
            <Search size={17} className="text-slate-500" />

            <input
              placeholder="Cari transaksi..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600 md:w-52"
            />
          </div>

        </div>

        {/* LIST */}
        <div className="divide-y divide-slate-800">

          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

        </div>

      </section>

      {/* ADD TRANSACTION MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b141a] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  {editingId !== null
                    ? "Edit Transaksi"
                    : "Tambah Transaksi"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Catat transaksi keuanganmu
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-slate-500 hover:text-white"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* TYPE */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#070d11] p-1">

                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`rounded-lg py-3 text-sm font-medium transition ${
                    type === "expense"
                      ? "bg-red-500/15 text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`rounded-lg py-3 text-sm font-medium transition ${
                    type === "income"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  Pemasukan
                </button>

              </div>

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Nama Transaksi
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Makan siang"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              {/* AMOUNT */}
              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Nominal
                </label>

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              {/* CATEGORY */}
              {type === "expense" && (
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Kategori
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    {categories.map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-[#06100c] transition hover:bg-emerald-400"
              >
                {editingId !== null
                  ? "Simpan Perubahan"
                  : "Simpan Transaksi"}
              </button>

            </form>

          </div>

        </div>
      )}

    </main>
  );
}


/* SUMMARY CARD */

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


/* TRANSACTION ITEM */

function TransactionItem({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}) {
  const isIncome = transaction.type === "income";

  return (
    <div className="flex items-center justify-between gap-4 p-5 transition hover:bg-white/[0.02]">

      {/* INFO */}
      <div className="flex min-w-0 items-center gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isIncome
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {isIncome ? (
            <ArrowDownLeft size={20} />
          ) : (
            <ArrowUpRight size={20} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium">
            {transaction.title}
          </p>

          <div className="mt-1 flex gap-2 text-xs text-slate-500">
            <span>{transaction.category}</span>
            <span>•</span>
            <span>{transaction.date}</span>
          </div>
        </div>

      </div>

      {/* NOMINAL + ACTION */}
      <div className="flex shrink-0 items-center gap-3">

        <p
          className={`font-semibold ${
            isIncome
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatRupiah(transaction.amount)}
        </p>

        {/* EDIT */}
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-500/10 hover:text-emerald-400"
          title="Edit transaksi"
        >
          <Pencil size={16} />
        </button>

        {/* DELETE */}
        <button
          type="button"
          onClick={() => onDelete(transaction.id)}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          title="Hapus transaksi"
        >
          <Trash2 size={16} />
        </button>

      </div>

    </div>
  );
}