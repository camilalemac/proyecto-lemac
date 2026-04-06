"use client"
import React from "react"
import { Landmark, Info } from "lucide-react"

export default function TesoreroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-500">
      <section className="bg-slate-50/50 rounded-[3rem] p-8 border border-blue-100/50 min-h-[calc(100vh-160px)] shadow-inner">
        
        {/* Banner Único de Tesorería */}
        <div className="mb-8 flex items-center justify-between bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-blue-100/30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2 rounded-lg text-white shadow-lg shadow-blue-100">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-blue-900 leading-none">Panel de Tesorería</h3>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Gestión de Activos y Balances</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">
            <Info size={14} />
            <span className="text-[10px] font-bold tracking-tight">Conectado a Microservicio Finanzas</span>
          </div>
        </div>

        <div className="relative">
          {children}
        </div>
      </section>
    </div>
  )
}