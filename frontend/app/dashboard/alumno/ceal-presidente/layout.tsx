"use client"
import React from "react"
import { Crown, Info, ShieldCheck } from "lucide-react"

export default function CealPresidenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-700 ease-out p-4 md:p-0">
      {/* Contenedor Principal con Estética Lemac */}
      <section className="bg-[#FAF5FF] rounded-[3rem] p-6 md:p-10 border border-purple-100 min-h-[calc(100vh-140px)] shadow-[inset_0_2px_15px_-5px_rgba(147,51,234,0.05)] relative overflow-hidden">
        
        {/* Decoración de fondo sutil para evitar el "vacío" visual */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* BANNER DE IDENTIDAD CEAL */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-sm gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-linear-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-purple-200">
              <Crown size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-black text-purple-950 uppercase tracking-tight">
                  Presidencia Centro de Alumnos
                </h3>
                <ShieldCheck size={16} className="text-purple-400" />
              </div>
              <p className="text-[10px] text-purple-400 font-extraback uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                Gestión Institucional EDUCA+
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-purple-600 bg-white/80 px-5 py-2 rounded-2xl border border-purple-50 shadow-inner">
            <Info size={16} className="animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-wider">Vista de Supervisión Activa</span>
          </div>
        </div>

        {/* Renderizado de la página (CealPresidentePage) */}
        <div className="relative z-10">
          {children}
        </div>
      </section>
    </div>
  )
}