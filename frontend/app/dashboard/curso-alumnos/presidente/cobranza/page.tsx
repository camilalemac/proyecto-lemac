"use client"
import { useState, useEffect } from "react"
import { Users, Search, Loader2, Send, Filter, AlertCircle } from "lucide-react"
import Cookies from "js-cookie"

export default function CobranzaCursoPage() {
  const [loading, setLoading] = useState(true)
  const [deudores, setDeudores] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    const fetchCobranza = async () => {
      try {
        const token = Cookies.get("auth-token")
        if (!token) return setLoading(false)

        const resMe = await fetch("http://127.0.0.1:3007/api/v1/auth/me", { 
          headers: { 'Authorization': `Bearer ${token}` } 
        })
        const dataMe = await resMe.json()

        if (dataMe.success) {
          const res = await fetch(`http://127.0.0.1:3007/api/v1/pagos/cobros/colegio/${dataMe.data.colegioId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const result = await res.json()
          if (result.success) {
            // Filtramos solo deudas pendientes de ESTE curso (asumiendo que viene cursoId en el perfil)
            const morosos = result.data.filter((c: any) => 
              c.ESTADO === 'PENDIENTE' && Number(c.CURSO_ID) === Number(dataMe.data.cursoId)
            )
            setDeudores(morosos)
          }
        }
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    fetchCobranza()
  }, [])

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-[#1A1A2E]/20 uppercase">Sincronizando deudores...</div>

  return (
    <section className="bg-white rounded-[3rem] shadow-2xl border border-[#1A1A2E]/5 overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="p-8 bg-[#FAF5FF] border-b border-[#1A1A2E]/5 flex justify-between items-center">
        <h3 className="text-xl font-black text-[#1A1A2E] uppercase flex items-center gap-3">
          <Users className="text-[#FF8FAB]" size={24} /> Listado de Morosidad de Curso
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="p-8">Folio</th>
              <th className="p-8">Descripción</th>
              <th className="p-8">Monto Deuda</th>
              <th className="p-8 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deudores.length > 0 ? deudores.map((d, i) => (
              <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                <td className="p-8 font-bold text-[#1A1A2E]">#{d.COBRO_ID}</td>
                <td className="p-8">
                  <p className="text-sm font-bold text-gray-600">{d.DESCRIPCION}</p>
                  <p className="text-[9px] font-black text-[#FF8FAB] uppercase mt-1">Vence: {new Date(d.FECHA_VENCIMIENTO).toLocaleDateString()}</p>
                </td>
                <td className="p-8 text-lg font-black text-[#1A1A2E]">
                  ${(Number(d.MONTO_ORIGINAL) - Number(d.MONTO_PAGADO)).toLocaleString('es-CL')}
                </td>
                <td className="p-8 text-center">
                  <button className="bg-[#1A1A2E] text-[#FF8FAB] px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">Notificar</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-32 text-center text-gray-300 font-black uppercase tracking-widest text-xs">El curso no tiene deudas pendientes</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}