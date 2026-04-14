import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos personalizados para el Proyecto Lemac
export const metadata: Metadata = {
  title: "Lemac | Gestión de Cuotas Escolares",
  description: "Sistema inteligente de tesorería para centros de padres y apoderados. Desarrollado con OCI Oracle.",
  icons: {
    icon: "/favicon.ico", // Asegúrate de tener un icono o usar el emoji de GraduationCap
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es" // Cambiado a español
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-plomo text-[#0F172A] selection:bg-[#FF8FAB]/30">
        {/* El div principal ayuda a mantener el footer siempre abajo 
            y aplica la tipografía sans de Geist por defecto 
        */}
        <main className="grow font-(family-name:--font-geist-sans)">
          {children}
        </main>
      </body>
    </html>
  );
}