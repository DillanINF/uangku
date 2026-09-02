"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  ShoppingCart,
  Gamepad2,
  Receipt,
  MoreHorizontal,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Transaction = {
  id: number;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
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
   ICON KATEGORI
========================================================= */

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
    normalized.includes("belanja") ||
    normalized.includes("shopping")
  ) {
    return ShoppingCart;
  }

  if (
    normalized.includes("hiburan") ||
    normalized.includes("game")
  ) {
    return Gamepad2;
  }

  if (
    normalized.includes("tagihan") ||
    normalized.includes("listrik") ||
    normalized.includes("internet")
  ) {
    return Receipt;
  }

  return MoreHorizontal;
}

/* =========================================================
   REPORTS PAGE
========================================================= */

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /* =======================================================
     LOAD TRANSACTIONS
  ======================================================= */

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
        } else {
          setTransactions([]);
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
     TOTAL PEMASUKAN
  ======================================================= */

  const totalIncome = useMemo(() => {
    return transactions
      .filter((item) => item.type === "income")
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
      .filter((item) => item.type === "expense")
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );
  }, [transactions]);

  /* =======================================================
     SALDO
  ======================================================= */

  const balance = totalIncome - totalExpense;

  /* =======================================================
     JUMLAH TRANSAKSI
  ======================================================= */

  const incomeCount = transactions.filter(
    (item) => item.type === "income"
  ).length;

  const expenseCount = transactions.filter(
    (item) => item.type === "expense"
  ).length;

  /* =======================================================
     KATEGORI PENGELUARAN
  ======================================================= */

  const expenseCategories = useMemo(() => {
    const grouped: Record<string, number> = {};

    transactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const category =
          item.category || "Lainnya";

        grouped[category] =
          (grouped[category] || 0) +
          Number(item.amount || 0);
      });

    return Object.entries(grouped)
      .map(([name, amount]) => ({
        name,
        amount,
        percent:
          totalExpense > 0
            ? Math.round(
                (amount / totalExpense) * 100
              )
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totalExpense]);

  /* =======================================================
     RATA-RATA PENGELUARAN
  ======================================================= */

  const averageExpense =
    expenseCount > 0
      ? totalExpense / expenseCount
      : 0;

  /* =======================================================
     PENGELUARAN TERBESAR
  ======================================================= */

  const highestExpense = useMemo(() => {
    const expenses = transactions.filter(
      (item) => item.type === "expense"
    );

    if (expenses.length === 0) {
      return null;
    }

    return [...expenses].sort(
      (a, b) => b.amount - a.amount
    )[0];
  }, [transactions]);

  /* =======================================================
     EXPORT PDF
  ======================================================= */

  function exportPDF() {
    if (transactions.length === 0) {
      alert("Belum ada transaksi untuk diekspor.");
      return;
    }

    const doc = new jsPDF();

    /* HEADER */

    doc.setFontSize(18);
    doc.text(
      "Laporan Keuangan UangKu",
      14,
      20
    );

    doc.setFontSize(10);
    doc.setTextColor(100);

    doc.text(
      `Tanggal laporan: ${new Date().toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )}`,
      14,
      28
    );

    /* SUMMARY */

    doc.setTextColor(0);
    doc.setFontSize(11);

    doc.text(
      `Total Pemasukan: ${formatRupiah(
        totalIncome
      )}`,
      14,
      40
    );

    doc.text(
      `Total Pengeluaran: ${formatRupiah(
        totalExpense
      )}`,
      14,
      47
    );

    doc.text(
      `Saldo: ${formatRupiah(balance)}`,
      14,
      54
    );

    /* TABLE */

    autoTable(doc, {
      startY: 64,

      head: [
        [
          "No",
          "Transaksi",
          "Kategori",
          "Tipe",
          "Nominal",
          "Tanggal",
        ],
      ],

      body: transactions.map(
        (transaction, index) => [
          index + 1,
          transaction.title,
          transaction.category ||
            "Lainnya",
          transaction.type === "income"
            ? "Pemasukan"
            : "Pengeluaran",
          formatRupiah(
            Number(transaction.amount || 0)
          ),
          transaction.date || "-",
        ]
      ),

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fillColor: [16, 185, 129],
      },

      alternateRowStyles: {
        fillColor: [245, 247, 248],
      },
    });

    doc.save(
      "laporan-keuangan-uangku.pdf"
    );
  }

  /* =======================================================
     EXPORT EXCEL
  ======================================================= */

  function exportExcel() {
    if (transactions.length === 0) {
      alert("Belum ada transaksi untuk diekspor.");
      return;
    }

    /* SHEET RINGKASAN */

    const summaryData = [
      {
        Keterangan: "Total Pemasukan",
        Jumlah: totalIncome,
      },
      {
        Keterangan: "Total Pengeluaran",
        Jumlah: totalExpense,
      },
      {
        Keterangan: "Saldo",
        Jumlah: balance,
      },
      {
        Keterangan: "Jumlah Pemasukan",
        Jumlah: incomeCount,
      },
      {
        Keterangan: "Jumlah Pengeluaran",
        Jumlah: expenseCount,
      },
      {
        Keterangan: "Total Transaksi",
        Jumlah: transactions.length,
      },
    ];

    const summarySheet =
      XLSX.utils.json_to_sheet(
        summaryData
      );

    /* SHEET TRANSAKSI */

    const transactionData =
      transactions.map(
        (transaction, index) => ({
          No: index + 1,
          Transaksi: transaction.title,
          Kategori:
            transaction.category ||
            "Lainnya",
          Tipe:
            transaction.type === "income"
              ? "Pemasukan"
              : "Pengeluaran",
          Nominal: Number(
            transaction.amount || 0
          ),
          Tanggal:
            transaction.date || "-",
        })
      );

    const transactionSheet =
      XLSX.utils.json_to_sheet(
        transactionData
      );

    /* SHEET KATEGORI */

    const categoryData =
      expenseCategories.map(
        (category) => ({
          Kategori: category.name,
          Pengeluaran: category.amount,
          Persentase:
            `${category.percent}%`,
        })
      );

    const categorySheet =
      XLSX.utils.json_to_sheet(
        categoryData
      );

    /* WORKBOOK */

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Ringkasan"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      transactionSheet,
      "Transaksi"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      categorySheet,
      "Kategori"
    );

    XLSX.writeFile(
      workbook,
      "laporan-keuangan-uangku.xlsx"
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#070d11] p-6 text-white md:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>
          <p className="mb-1 text-sm text-slate-500">
            Analisis keuangan
          </p>

          <h1 className="text-3xl font-bold">
            Laporan
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Lihat ringkasan dan analisis
            kondisi keuanganmu.
          </p>
        </div>

        {/* EXPORT BUTTON */}

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={exportPDF}
            disabled={
              transactions.length === 0
            }
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0b141a] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-red-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileDown size={17} />
            Export PDF
          </button>

          <button
            type="button"
            onClick={exportExcel}
            disabled={
              transactions.length === 0
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-[#06100c] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileSpreadsheet size={17} />
            Export Excel
          </button>

        </div>
      </div>

      {/* SUMMARY */}

      <div className="mb-6 grid gap-4 md:grid-cols-3">

        <ReportCard
          title="Total Pemasukan"
          value={formatRupiah(totalIncome)}
          description={`${incomeCount} transaksi`}
          icon={<TrendingUp size={20} />}
          color="text-emerald-400"
        />

        <ReportCard
          title="Total Pengeluaran"
          value={formatRupiah(totalExpense)}
          description={`${expenseCount} transaksi`}
          icon={<TrendingDown size={20} />}
          color="text-red-400"
        />

        <ReportCard
          title="Saldo Bersih"
          value={formatRupiah(balance)}
          description="Pemasukan dikurangi pengeluaran"
          icon={<Wallet size={20} />}
          color="text-blue-400"
        />

      </div>

      {/* CONTENT */}

      <div className="grid gap-5 xl:grid-cols-2">

        {/* KATEGORI */}

        <section className="rounded-2xl border border-slate-800 bg-[#0b141a] p-5">

          <div className="mb-6">
            <h2 className="font-semibold">
              Pengeluaran Berdasarkan Kategori
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Distribusi seluruh pengeluaran
            </p>
          </div>

          {expenseCategories.length ===
          0 ? (
            <EmptyReport />
          ) : (
            <div className="space-y-5">

              {expenseCategories.map(
                (item) => {
                  const Icon =
                    getCategoryIcon(
                      item.name
                    );

                  return (
                    <div
                      key={item.name}
                    >

                      <div className="mb-2 flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.percent}%
                            {" "}dari total
                          </p>

                        </div>

                        <p className="text-sm font-semibold">
                          {formatRupiah(
                            item.amount
                          )}
                        </p>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{
                            width: `${item.percent}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* STATISTIK */}

        <section className="rounded-2xl border border-slate-800 bg-[#0b141a] p-5">

          <div className="mb-6">
            <h2 className="font-semibold">
              Statistik Keuangan
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Ringkasan aktivitas transaksi
            </p>
          </div>

          <div className="space-y-4">

            <StatRow
              icon={
                <ArrowDownLeft
                  size={17}
                />
              }
              title="Jumlah Pemasukan"
              value={incomeCount.toString()}
              color="text-emerald-400"
            />

            <StatRow
              icon={
                <ArrowUpRight
                  size={17}
                />
              }
              title="Jumlah Pengeluaran"
              value={expenseCount.toString()}
              color="text-red-400"
            />

            <StatRow
              icon={
                <Wallet size={17} />
              }
              title="Total Transaksi"
              value={transactions.length.toString()}
              color="text-blue-400"
            />

            <StatRow
              icon={
                <TrendingDown
                  size={17}
                />
              }
              title="Rata-rata Pengeluaran"
              value={formatRupiah(
                averageExpense
              )}
              color="text-orange-400"
            />

            {/* PENGELUARAN TERBESAR */}

            <div className="border-t border-slate-800 pt-4">

              <p className="mb-2 text-xs text-slate-500">
                Pengeluaran Terbesar
              </p>

              {highestExpense ? (
                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium">
                      {highestExpense.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {highestExpense.category}
                    </p>

                  </div>

                  <p className="shrink-0 font-semibold text-red-400">
                    {formatRupiah(
                      highestExpense.amount
                    )}
                  </p>

                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Belum ada pengeluaran
                </p>
              )}

            </div>

          </div>

        </section>

      </div>

      {/* KONDISI KEUANGAN */}

      <section className="mt-5 rounded-2xl border border-slate-800 bg-[#0b141a] p-5">

        <h2 className="font-semibold">
          Kondisi Keuangan
        </h2>

        <div className="mt-4 rounded-xl bg-[#070d11] p-4">

          {transactions.length === 0 ? (

            <p className="text-sm text-slate-500">
              Belum ada data transaksi
              untuk dianalisis.
            </p>

          ) : balance > 0 ? (

            <div className="flex items-start gap-3">

              <TrendingUp
                size={20}
                className="mt-0.5 text-emerald-400"
              />

              <div>

                <p className="text-sm font-medium text-emerald-400">
                  Kondisi keuangan positif
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total pemasukanmu masih
                  lebih besar daripada
                  total pengeluaran.
                </p>

              </div>

            </div>

          ) : balance < 0 ? (

            <div className="flex items-start gap-3">

              <TrendingDown
                size={20}
                className="mt-0.5 text-red-400"
              />

              <div>

                <p className="text-sm font-medium text-red-400">
                  Pengeluaran lebih besar
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total pengeluaranmu saat
                  ini lebih besar daripada
                  pemasukan.
                </p>

              </div>

            </div>

          ) : (

            <div className="flex items-start gap-3">

              <Wallet
                size={20}
                className="mt-0.5 text-blue-400"
              />

              <div>

                <p className="text-sm font-medium text-blue-400">
                  Keuangan seimbang
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Total pemasukan dan
                  pengeluaran memiliki
                  nilai yang sama.
                </p>

              </div>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   REPORT CARD
========================================================= */

function ReportCard({
  title,
  value,
  description,
  icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b141a] p-5">

      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 ${color}`}
      >
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p
        className={`mt-1 text-xl font-bold ${color}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   STAT ROW
========================================================= */

function StatRow({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#070d11] p-3">

      <div className={`shrink-0 ${color}`}>
        {icon}
      </div>

      <p className="flex-1 text-sm text-slate-400">
        {title}
      </p>

      <p className="text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   EMPTY REPORT
========================================================= */

function EmptyReport() {
  return (
    <div className="flex h-64 items-center justify-center text-center">

      <div>

        <Wallet
          size={34}
          className="mx-auto text-slate-700"
        />

        <p className="mt-3 text-sm text-slate-500">
          Belum ada data pengeluaran
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Tambahkan transaksi untuk
          melihat laporan
        </p>

      </div>

    </div>
  );
}