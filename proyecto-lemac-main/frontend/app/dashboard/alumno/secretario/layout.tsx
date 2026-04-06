"use client"
import React from "react"
import { Edit3, Info, BookmarkCheck } from "lucide-react"

export default function SecretarioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-700 ease-out p-4 md:p-0">
      
      {/* Contenedor Principal: Fondo Menta Pastel Muy Suave */}
      <section className="bg-[#F0FDF4] rounded-[3rem] p-6 md:p-10 border border-[#DCFCE7] min-h-[calc(100vh-140px)] shadow-[inset_0_2px_15px_-5px_rgba(21,128,61,0.03)] relative overflow-hidden">
        
        {/* Decoración sutil de fondo para evitar vacío visual */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 bg-[#BBF7D0]/30 rounded-full blur-3xl pointer-events-none" />

        {/* BANNER DISTINTIVO DE SECRETARÍA (Mint/Aqua Pastels) */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/80 shadow-sm gap-4">
          <div className="flex items-center gap-5">
            {/* Icono: Fondo Aqua Pastel Suave */}
            <div className="bg-[#A7F3D0] p-3 rounded-2xl text-[#065F46] shadow-lg shadow-[#A7F3D0]/50">
              <Edit3 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-black text-[#166534] uppercase tracking-tight">
                  Panel de Secretaría
                </h3>
                <BookmarkCheck size={16} className="text-[#34D399]" />
              </div>
              <p className="text-[10px] text-[#047857] font-extrabold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2 leading-none">
                {/* Punto parpadeante pastel */}
                <span className="w-1.5 h-1.5 bg-[#6EE7B7] rounded-full animate-pulse" />
                Documentación y Actas oficiales
              </p>
            </div>
          </div>
          
          {/* Tag de estado: Colores pastel suaves */}
          <div className="flex items-center gap-3 text-[#059669] bg-white/80 px-5 py-2 rounded-full border border-[#D1FAE5] shadow-inner">
            <Info size={16} className="text-[#6EE7B7]" />
            <span className="text-[10px] font-black uppercase tracking-wider">Módulo de Redacción Activo</span>
          </div>
        </div>

        {/* Contenido de la página (page.tsx) */}
        <div className="relative z-10">
          {children}
        </div>
      </section>
      
      <p className="mt-8 text-center text-[10px] text-gray-400 font-medium uppercase tracking-[0.3em] italic">
        EDUCA+ • Sistema Central de Secretaría • 2026
      </p>
    </div>
  )
}