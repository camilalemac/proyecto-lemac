"use client"
import React from "react"

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* ELIMINAMOS TODO EL ASIDE Y EL HEADER DE AQUÍ.
         Ahora, cada vista (Presidente/Secretario) usará su propio 
         diseño sin que este layout les imponga un sidebar extra.
      */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}