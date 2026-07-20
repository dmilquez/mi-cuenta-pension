import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Cuenta Pensión | Calculadora pensional Colombia",
  description:
    "Cuenta regresiva personalizada para conocer cuánto falta para alcanzar la edad general de pensión en Colombia.",
  openGraph: {
    title: "Mi Cuenta Pensión",
    description: "El tiempo para tu pensión, segundo a segundo.",
    locale: "es_CO",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Cuenta Pensión",
    description: "El tiempo para tu pensión, segundo a segundo.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
