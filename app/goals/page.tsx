"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Target,
  Pencil,
  Trash2,
  Wallet,
  CalendarDays,
  X,
} from "lucide-react";

type Goal = {
  id: number;
  name: string;
  target: number;
  saved: number;
  deadline: string;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    const savedGoals = localStorage.getItem("uangku_goals");

    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);

        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      } catch (error) {
        console.error("Gagal membaca data tujuan:", error);
      }
    }

    setLoaded(true);
  }, []);

  /* =========================================================
     SAVE DATA
  ========================================================= */

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "uangku_goals",
      JSON.stringify(goals)
    );
  }, [goals, loaded]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalTarget = useMemo(() => {
    return goals.reduce(
      (sum, goal) => sum + Number(goal.target || 0),
      0
    );
  }, [goals]);

  const totalSaved = useMemo(() => {
    return goals.reduce(
      (sum, goal) => sum + Number(goal.saved || 0),
      0
    );
  }, [goals]);

  const completedGoals = goals.filter(
    (goal) => goal.saved >= goal.target
  ).length;

  /* =========================================================
     OPEN ADD FORM
  ========================================================= */

  function openAddForm() {
    setEditingId(null);

    setName("");
    setTarget("");
    setSaved("");
    setDeadline("");

    setShowForm(true);
  }

  /* =========================================================
     EDIT
  ========================================================= */

  function handleEdit(goal: Goal) {
    setEditingId(goal.id);

    setName(goal.name);
    setTarget(String(goal.target));
    setSaved(String(goal.saved));
    setDeadline(goal.deadline);

    setShowForm(true);
  }

  /* =========================================================
     DELETE
  ========================================================= */

  function handleDelete(id: number) {
    const goal = goals.find((item) => item.id === id);

    if (!goal) return;

    const confirmed = confirm(
      `Hapus tujuan "${goal.name}"?`
    );

    if (!confirmed) return;

    setGoals((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const targetValue = Number(target);
    const savedValue = Number(saved || 0);

    if (!name.trim()) {
      alert("Nama tujuan harus diisi.");
      return;
    }

    if (!targetValue || targetValue <= 0) {
      alert("Nominal target harus lebih dari 0.");
      return;
    }

    if (savedValue < 0) {
      alert("Nominal terkumpul tidak boleh negatif.");
      return;
    }

    if (savedValue > targetValue) {
      alert(
        "Nominal terkumpul tidak boleh lebih besar dari target."
      );
      return;
    }

    if (editingId !== null) {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === editingId
            ? {
                ...goal,
                name: name.trim(),
                target: targetValue,
                saved: savedValue,
                deadline,
              }
            : goal
        )
      );
    } else {
      const newGoal: Goal = {
        id: Date.now(),
        name: name.trim(),
        target: targetValue,
        saved: savedValue,
        deadline,
      };

      setGoals((prev) => [newGoal, ...prev]);
    }

    closeForm();
  }

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  function closeForm() {
    setShowForm(false);
    setEditingId(null);

    setName("");
    setTarget("");
    setSaved("");
    setDeadline("");
  }

  return (
    <main className="min-h-screen bg-[#070d11] p-6 text-white md:p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="mb-1 text-sm text-slate-500">
            Rencanakan masa depanmu
          </p>

          <h1 className="text-3xl font-bold">
            Tujuan Keuangan
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Buat dan pantau target keuangan yang ingin kamu capai.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-[#06100c] transition hover:bg-emerald-400"
        >
          <Plus size={19} />
          Tambah Tujuan
        </button>

      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Target"
          value={formatRupiah(totalTarget)}
          icon={<Target size={21} />}
        />

        <SummaryCard
          title="Total Terkumpul"
          value={formatRupiah(totalSaved)}
          icon={<Wallet size={21} />}
        />

        <SummaryCard
          title="Jumlah Tujuan"
          value={`${goals.length} tujuan`}
          icon={<Target size={21} />}
        />

        <SummaryCard
          title="Tercapai"
          value={`${completedGoals} tujuan`}
          icon={<CalendarDays size={21} />}
        />

      </div>

      {/* =====================================================
          GOALS
      ===================================================== */}

      {goals.length === 0 ? (

        <section className="rounded-2xl border border-slate-800 bg-[#0b141a] p-12">

          <div className="mx-auto max-w-md text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Target
                size={32}
                className="text-emerald-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Belum ada tujuan keuangan
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mulai buat target keuangan seperti dana darurat,
              membeli laptop, liburan, atau kebutuhan lainnya.
            </p>

            <button
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#06100c] transition hover:bg-emerald-400"
            >
              <Plus size={17} />
              Buat Tujuan Pertama
            </button>

          </div>

        </section>

      ) : (

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {goals.map((goal) => {

            const percent =
              goal.target > 0
                ? Math.min(
                    Math.round(
                      (goal.saved / goal.target) * 100
                    ),
                    100
                  )
                : 0;

            const remaining =
              Math.max(goal.target - goal.saved, 0);

            const completed =
              goal.saved >= goal.target;

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-slate-800 bg-[#0b141a] p-5 transition hover:border-slate-700"
              >

                {/* TOP */}

                <div className="flex items-start justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Target
                        size={21}
                        className="text-emerald-400"
                      />
                    </div>

                    <div className="min-w-0">

                      <h2 className="truncate font-semibold">
                        {goal.name}
                      </h2>

                      {goal.deadline ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <CalendarDays size={13} />
                          Target:{" "}
                          {new Date(
                            `${goal.deadline}T00:00:00`
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-600">
                          Tidak ada deadline
                        </p>
                      )}

                    </div>

                  </div>

                  {/* ACTION */}

                  <div className="flex shrink-0">

                    <button
                      onClick={() => handleEdit(goal)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-500/10 hover:text-emerald-400"
                      title="Edit tujuan"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Hapus tujuan"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

                {/* AMOUNT */}

                <div className="mt-6">

                  <div className="flex items-end justify-between gap-3">

                    <div>
                      <p className="text-xs text-slate-500">
                        Terkumpul
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-400">
                        {formatRupiah(goal.saved)}
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-xs text-slate-500">
                        Target
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-300">
                        {formatRupiah(goal.target)}
                      </p>

                    </div>

                  </div>

                </div>

                {/* PROGRESS */}

                <div className="mt-5">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-xs text-slate-500">
                      Progress
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        completed
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }`}
                    >
                      {completed
                        ? "Tercapai"
                        : `${percent}%`}
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                      }}
                    />

                  </div>

                </div>

                {/* REMAINING */}

                <div className="mt-4 rounded-xl bg-[#070d11] px-4 py-3">

                  <div className="flex items-center justify-between">

                    <span className="text-xs text-slate-500">
                      {completed
                        ? "Status"
                        : "Kekurangan"}
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        completed
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }`}
                    >
                      {completed
                        ? "Target tercapai 🎉"
                        : formatRupiah(remaining)}
                    </span>

                  </div>

                </div>

              </div>
            );
          })}

        </section>

      )}

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b141a] p-6 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {editingId !== null
                    ? "Edit Tujuan"
                    : "Tambah Tujuan"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tentukan target keuangan yang ingin kamu capai.
                </p>

              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Nama Tujuan
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Contoh: Beli Laptop Baru"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />

              </div>

              {/* TARGET */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Nominal Target
                </label>

                <input
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) =>
                    setTarget(e.target.value)
                  }
                  placeholder="12000000"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />

              </div>

              {/* SAVED */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Sudah Terkumpul
                </label>

                <input
                  type="number"
                  min="0"
                  value={saved}
                  onChange={(e) =>
                    setSaved(e.target.value)
                  }
                  placeholder="3000000"
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />

              </div>

              {/* DEADLINE */}

              <div>

                <label className="mb-2 block text-sm text-slate-400">
                  Deadline
                  <span className="ml-1 text-xs text-slate-600">
                    (opsional)
                  </span>
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(e) =>
                    setDeadline(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-800 bg-[#070d11] px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500"
                />

              </div>

              {/* BUTTON */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-[#06100c] transition hover:bg-emerald-400"
                >
                  {editingId !== null
                    ? "Simpan Perubahan"
                    : "Simpan Tujuan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

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