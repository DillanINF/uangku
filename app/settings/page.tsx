"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  User,
  Wallet,
  Trash2,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("uangku_user_name");
    const savedCurrency = localStorage.getItem("uangku_currency");

    if (savedName) {
      setName(savedName);
    }

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("uangku_user_name", name);
    localStorage.setItem("uangku_currency", currency);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const resetTransactions = () => {
    localStorage.removeItem("uangku_transactions");

    window.dispatchEvent(new Event("storage"));

    setShowReset(false);
  };

  const resetAllData = () => {
    localStorage.removeItem("uangku_transactions");
    localStorage.removeItem("uangku_budgets");
    localStorage.removeItem("uangku_goals");
    localStorage.removeItem("uangku_categories");
    localStorage.removeItem("uangku_user_name");
    localStorage.removeItem("uangku_currency");

    window.dispatchEvent(new Event("storage"));

    setName("");
    setCurrency("IDR");
    setShowReset(false);

    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#070d11] text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800 px-5 py-6 md:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
            <Settings size={22} className="text-emerald-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Pengaturan
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Atur preferensi aplikasi UANGKU
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-5 px-5 py-6 md:px-7">
        {/* PROFIL */}
        <section className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <User size={19} className="text-blue-400" />
            </div>

            <div>
              <h2 className="font-semibold">
                Profil
              </h2>

              <p className="text-xs text-slate-500">
                Informasi dasar pengguna
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-xl">
            <label className="mb-2 block text-xs text-slate-400">
              Nama Pengguna
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama kamu"
              className="w-full rounded-lg border border-slate-700 bg-[#10191f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
            />
          </div>
        </section>

        {/* PREFERENSI */}
        <section className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet size={19} className="text-emerald-400" />
            </div>

            <div>
              <h2 className="font-semibold">
                Preferensi Keuangan
              </h2>

              <p className="text-xs text-slate-500">
                Atur mata uang yang digunakan
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-xl">
            <label className="mb-2 block text-xs text-slate-400">
              Mata Uang
            </label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-[#10191f] px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="IDR">
                Rupiah Indonesia (IDR)
              </option>

              <option value="USD">
                US Dollar (USD)
              </option>

              <option value="MYR">
                Malaysian Ringgit (MYR)
              </option>
            </select>
          </div>

          <button
            onClick={saveSettings}
            className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-emerald-400"
          >
            {saved ? (
              <>
                <Check size={17} />
                Tersimpan
              </>
            ) : (
              <>
                <Save size={17} />
                Simpan Pengaturan
              </>
            )}
          </button>
        </section>

        {/* DATA */}
        <section className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Trash2 size={19} className="text-yellow-400" />
            </div>

            <div>
              <h2 className="font-semibold">
                Manajemen Data
              </h2>

              <p className="text-xs text-slate-500">
                Kelola data yang tersimpan di perangkat
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={resetTransactions}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              <RotateCcw size={16} />
              Hapus Transaksi
            </button>

            <button
              onClick={() => setShowReset(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <Trash2 size={16} />
              Reset Semua Data
            </button>
          </div>
        </section>

        {/* INFO */}
        <section className="rounded-xl border border-slate-800 bg-[#0c151b] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-yellow-400"
            />

            <div>
              <h2 className="text-sm font-semibold">
                Penyimpanan Data
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Data UANGKU saat ini disimpan secara lokal
                pada browser/perangkat ini menggunakan
                localStorage.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL RESET */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#0c151b] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle
                size={21}
                className="text-red-400"
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Reset Semua Data?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Semua transaksi, anggaran, tujuan, kategori,
              dan pengaturan akan dihapus dari perangkat ini.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>

              <button
                onClick={resetAllData}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-400"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}