"use client"
import { useState } from "react"
import { Tag, Plus, Edit2, Trash2, Search, Filter } from "lucide-react"

export default function CategoriasManager({ categorias }: { categorias: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrado en tiempo real basado en los datos de la DB
  const filteredCategorias = categorias.filter(cat =>
    cat.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <section className="bg-white p-10 rounded-[4rem] border border-slate-50 shadow-sm min-h-125 animate-in fade-in duration-700">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#FDF2F5] p-3 rounded-2xl text-[#FF8FAB]">
              <Tag size={24} />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter">
              Gestión de Categorías
            </h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] ml-1">
            Clasificación de Movimientos • Sistema Lemac
          </p>
        </div>

        <button className="bg-[#0F172A] text-white px-8 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-[#FF8FAB] transition-all shadow-xl shadow-slate-100 active:scale-95 group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Nueva Categoría
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA ESTILIZADA */}
      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#FF8FAB] transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Buscar categoría por nombre..."
          className="w-full bg-slate-50 border-2 border-transparent focus:border-[#FF8FAB]/20 focus:bg-white rounded-4xl py-5 pl-16 pr-6 text-xs font-bold text-[#0F172A] outline-none transition-all placeholder:text-slate-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <Filter size={16} className="text-slate-200" />
        </div>
      </div>

      {/* GRILLA DE CATEGORÍAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategorias.length > 0 ? (
          filteredCategorias.map((cat) => (
            <div 
              key={cat.CATEGORIA_ID}
              className="group p-8 rounded-[3rem] border border-slate-50 bg-white hover:border-[#FF8FAB]/30 hover:shadow-2xl hover:shadow-pink-100/50 transition-all relative overflow-hidden flex flex-col justify-between"
            >
              {/* Indicador estético superior */}
              <div className="absolute top-0 right-10 w-12 h-1.5 bg-[#FF8FAB] rounded-b-full opacity-20 group-hover:opacity-100 transition-all" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-[#FDF2F5] group-hover:text-[#FF8FAB] transition-all duration-500">
                  <Tag size={20} />
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#0F172A] hover:shadow-sm transition-all" title="Editar">
                    <Edit2 size={14} />
                  </button>
                  <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:shadow-sm transition-all" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-black text-[#0F172A] uppercase text-sm mb-1 tracking-tight group-hover:text-[#FF8FAB] transition-colors">
                  {cat.NOMBRE}
                </h3>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                  Registro: #{cat.CATEGORIA_ID}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                      Estado Activo
                    </span>
                </div>
                <span className="text-[10px] font-black text-slate-200 italic">Oracle Cloud</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-4 border-dashed border-slate-50 rounded-[4rem]">
            <Search size={48} className="text-slate-100 mb-4" />
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] italic text-center">
              {searchTerm ? `No hay resultados para "${searchTerm}"` : "Base de datos de categorías vacía"}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}