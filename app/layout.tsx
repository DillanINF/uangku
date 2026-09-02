import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "UangKu",
  description: "Aplikasi manajemen keuangan pribadi",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-[#070d11] text-white">

        <Script
          id="service-worker-register"
          strategy="afterInteractive"
        >
          {`
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
          `}
        </Script>

        <Sidebar />

        <main className="ml-0 min-h-screen md:ml-[200px]">
          {children}
        </main>

      </body>
    </html>
  );
}