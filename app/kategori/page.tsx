"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Tag,
  Utensils,
  Car,
  ShoppingCart,
  Gamepad2,
  Receipt,
  Wallet,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
  icon: string;
};

const defaultCategories: Category[] = [
  {
    id: 1,
    name: "Makanan",
    icon: "food",
  },
  {
    id: 2,
    name: "Transportasi",
    icon: "transport",
  },
  {
    id: 3,
    name: "Belanja",
    icon: "shopping",
  },
  {
    id: 4,
    name: "Hiburan",
    icon: "entertainment",
  },
  {
    id: 5,
    name: "Tagihan",
    icon: "bill",
  },
  {
    id: 6,
    name: "Lainnya",
    icon: "other",
  },
];

function CategoryIcon({ icon }: { icon: string }) {
  if (icon === "food") return <Utensils size={20} />;
  if (icon === "transport") return <Car size={20} />;
  if (icon === "shopping") return <ShoppingCart size={20} />;
  if (icon === "entertainment") return <Gamepad2 size={20} />;
  if (icon === "bill") return <Receipt size={20} />;

  return <Wallet size={20} />;
}

export default function KategoriPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const savedCategories =
      localStorage.getItem("uangku_categories");

    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);

        if (Array.isArray(parsed)) {
          setCategories(parsed);
        }
      } catch (error) {
        console.error(
          "Gagal membaca kategori:",
          error
        );
      }
    } else {
      setCategories(defaultCategories);

      localStorage.setItem(
        "uangku_categories",
        JSON.stringify(defaultCategories)
      );
    }
  }, []);

  function addCategory() {
  const name = newCategory.trim();

  // Jangan izinkan input kosong
  if (!name) {
    alert("Masukkan nama kategori terlebih dahulu.");
    return;
  }

  // Cek apakah kategori sudah ada
  const alreadyExists = categories.some(
    (category) =>
      category.name.trim().toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) {
    alert("Kategori tersebut sudah ada.");
    return;
  }

  // Buat kategori baru
  const newItem: Category = {
    id: Date.now(),
    name: name,
    icon: "other",
  };

  // Gabungkan kategori lama + kategori baru
  const updatedCategories = [
    ...categories,
    newItem,
  ];

  // Update tampilan
  setCategories(updatedCategories);

  // Simpan ke localStorage
  localStorage.setItem(
    "uangku_categories",
    JSON.stringify(updatedCategories)
  );

  // Kosongkan input
  setNewCategory("");

  alert(`Kategori "${name}" berhasil ditambahkan.`);
}
  function deleteCategory(id: number) {
    const category = categories.find(
      (item) => item.id === id
    );

    if (!category) return;

    const confirmDelete = confirm(
      `Hapus kategori "${category.name}"?`
    );

    if (!confirmDelete) return;

    const updatedCategories = categories.filter(
      (item) => item.id !== id
    );

    setCategories(updatedCategories);

    localStorage.setItem(
      "uangku_categories",
      JSON.stringify(updatedCategories)
    );
  }

  return (
    <main className="min-h-screen bg-[#070d11] text-white">
      <section className="flex-1 px-5 py-6 md:px-7">

        {/* HEADER */}
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Tag size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Kategori
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Kelola kategori pemasukan dan pengeluaranmu
              </p>
            </div>
          </div>
        </div>

        {/* TAMBAH KATEGORI */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-[#0b141a] p-5">

          <h2 className="mb-4 font-semibold">
            Tambah Kategori
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">

            <input
              type="text"
              value={newCategory}
              onChange={(event) =>
                setNewCategory(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addCategory();
                }
              }}
              placeholder="Contoh: Pendidikan"
              className="flex-1 rounded-xl border border-slate-700 bg-[#10191f] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />

           <button
            type="button"
            onClick={addCategory}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
           >
  <Plus size={18} />
  Tambah
</button>

          </div>
        </div>

        {/* DAFTAR KATEGORI */}
        <div className="rounded-2xl border border-slate-800 bg-[#0b141a]">

          <div className="border-b border-slate-800 p-5">
            <h2 className="font-semibold">
              Daftar Kategori
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {categories.length} kategori tersedia
            </p>
          </div>

          <div className="divide-y divide-slate-800">

            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-5"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CategoryIcon icon={category.icon} />
                  </div>

                  <p className="font-medium">
                    {category.name}
                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteCategory(category.id)
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                  title="Hapus kategori"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            ))}

          </div>

        </div>

      </section>
    </main>
  );
}