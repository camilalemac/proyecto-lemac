"use client"
import { useEffect, useState } from "react"
import { ExternalLink, Calendar, FileText, Search } from "lucide-react"
import Cookies from "js-cookie"

export default function ListaActas() {
  const [actas, setActas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActas = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        // Conexión directa al microservicio de documentos (ms-pagos/documentos)
        const res = await fetch("http://127.0.0.1:3005/api/v1/documentos/actas", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        const json = await res.json()
        
        if (json.success) {
          setActas(json.data)
        }
      } catch (err) {
        console.error("Error al obtener actas desde el microservicio:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchActas()
  }, [])

  // Pantalla de carga con el color Rosa Pastel de tu marca
  if (loading) return (
    <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
      <div className="w-10 h-10 border-4 border-[#FF8FAB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sincronizando con ms-documentos...</p>
    </div>
  )

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento Oficial</th>
            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Registro</th>
            <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acceso Directo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {actas.length > 0 ? (
            actas.map((acta) => (
              <tr key={acta.DOCUMENTO_ID} className="hover:bg-slate-50/80 transition-all group">
                <td className="p-8">
                  <div className="flex items-center gap-5">
                    {/* Contenedor del Icono en Rosa Pastel */}
                    <div className="bg-[#FDF2F5] p-4 rounded-2xl text-[#FF8FAB] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight leading-none mb-1.5">
                        {acta.TITULO}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Folio Interno: #{acta.DOCUMENTO_ID}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
                    <Calendar size={15} className="text-[#FF8FAB]/60" />
                    {new Date(acta.FECHA_DE_CREACION).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </td>
                <td className="p-8 text-right">
                  <a 
                    href={acta.URL_ARCHIVO} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-[#0F172A] text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase hover:bg-[#FF8FAB] hover:shadow-lg hover:shadow-pink-100 transition-all active:scale-95 shadow-sm"
                  >
                    Ver en Google Drive <ExternalLink size={13} />
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="p-24 text-center">
                <div className="space-y-4">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">No hay actas disponibles</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">El repositorio institucional está vacío actualmente</p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}