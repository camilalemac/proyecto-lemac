"use client"

import { useEffect, useState, type ReactNode } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts"
import {
  Wallet, CheckCircle2, AlertCircle, ArrowUpRight, GraduationCap, Banknote, LogOut, PieChart as PieChartIcon
} from "lucide-react"
import { fetchResumenMisCobros, type CuotaCobro, type ResumenPagosAlumno } from "@/lib/services/pagos.service"

const handleApiResponse = async (res: Response) => {
  try {
    const contentType = res.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Respuesta no es JSON")
    }
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json?.message || "Error en API")
    }
    return json.data
  } catch (error) {
    console.warn("Error procesando respuesta:", error)
    return null
  }
}

const finanzasVacio: ResumenPagosAlumno = {
  totalPendiente: 0,
  totalPagado: 0,
  cobros: [],
}

export default function AlumnoDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<{
    finanzas: ResumenPagosAlumno
    cuentas: unknown[]
  }>({
    finanzas: finanzasVacio,
    cuentas: []
  })
  const [user, setUser] = useState({
    nombre: "Usuario",
    cargo: "Alumno"
  })

  const handleLogout = () => {
    Cookies.remove("auth-token")
    router.push("/login")
  }

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("auth-token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser({
          nombre: payload.nombre || "Usuario",
          cargo: payload.cargo || payload.role || "Alumno"
        })
      } catch (e) {
        console.error("Token inválido:", e)
        router.push("/login")
        return
      }

      const API = "http://127.0.0.1:3007/api/v1"
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      try {
        const finanzasResumen = await fetchResumenMisCobros(token)

        let cuentasData: unknown[] = []
        try {
          const raw = await fetch(`${API}/pagos/cuentas-bancarias`, { headers }).then(handleApiResponse)
          cuentasData = Array.isArray(raw) ? raw : []
        } catch (cuentasErr) {
          console.warn("Cuentas bancarias no disponibles:", cuentasErr)
        }

        setData({
          finanzas: finanzasResumen,
          cuentas: cuentasData
        })
      } catch (err) {
        console.error("Error conexión backend:", err)
        setError("No se pudo completar la carga. Revisa el gateway y ms-pagos.")
        setData({ finanzas: finanzasVacio, cuentas: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1A1A2E]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/10 border-t-[#FF8FAB] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium animate-pulse">Sincronizando portal...</p>
        </div>
      </div>
    )
  }

  const cobrosList: CuotaCobro[] = data.finanzas.cobros || []
  const sinMovimientosPagos =
    cobrosList.length === 0 &&
    (data.finanzas.totalPendiente ?? 0) === 0 &&
    (data.finanzas.totalPagado ?? 0) === 0

  const chartData = cobrosList.reduce<{ name: string; value: number }[]>((acc, curr) => {
    const name = curr.descripcion
    const value = curr.monto
    const existing = acc.find((i) => i.name === name)
    if (existing) existing.value += value
    else acc.push({ name, value })
    return acc
  }, [])

  const COLORS = ["#FFD1DC", "#D4C4FB", "#B2E2F2", "#E2F0CB", "#FFDAC1"]

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      
      {/* HEADER */}
      <div className="bg-[#1A1A2E] py-5 px-12 border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF8FAB]/10 p-2.5 rounded-xl border border-[#FF8FAB]/20">
              <GraduationCap className="text-[#FF8FAB]" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Sistema <span className="text-[#FF8FAB]">Lemac</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Panel Académico</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user.nombre}</p>
              <p className="text-[10px] font-bold text-[#FF8FAB] uppercase tracking-tighter opacity-80">{user.cargo}</p>
            </div>

            <div className="w-10 h-10 bg-[#252545] rounded-full flex items-center justify-center text-[#FF8FAB] border border-white/10 font-bold shadow-lg">
              {user.nombre.charAt(0)}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 transition-all group"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#1A1A2E] tracking-tight">Resumen General</h2>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenida, <span className="text-[#FF8FAB] font-bold">{user.nombre.split(' ')[0]}</span>.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        ) : null}

        {sinMovimientosPagos && !error ? (
          <p className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            No hay cobros registrados en pagos todavía. Los montos mostrarán <span className="font-semibold">$0</span> hasta que el microservicio devuelva datos.
          </p>
        ) : null}

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card title="Mi Pendiente" value={data.finanzas.totalPendiente} icon={<Wallet className="text-[#FF8FAB]" />} accentColor="border-l-[#FF8FAB]" />
          <Card title="Mi Pagado" value={data.finanzas.totalPagado} icon={<CheckCircle2 className="text-[#A7E8BD]" />} accentColor="border-l-[#A7E8BD]" />
          <Card title="Saldo del Curso" value={(data.cuentas[0] as { SALDO_ACTUAL?: number })?.SALDO_ACTUAL || 0} icon={<Banknote className="text-[#D4C4FB]" />} accentColor="border-l-[#D4C4FB]" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-8 text-gray-400 uppercase text-[10px] tracking-[0.15em] flex items-center gap-2">
              <ArrowUpRight size={14} className="text-[#D4C4FB]" /> Distribución
            </h3>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={5}>
                      {chartData.map((_, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <PieChartIcon className="text-gray-200" size={40} strokeWidth={1.25} />
                  <p className="text-gray-400 text-xs font-medium">Sin cobros para graficar</p>
                  <p className="text-gray-300 text-[11px]">Cuando existan movimientos, verás la distribución aquí.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-[0.15em] flex items-center gap-2">
                <AlertCircle size={14} className="text-[#FFB7C5]" /> Cobros recientes
              </h3>
              <Link href="/dashboard/alumno/cuotas" className="text-[10px] font-bold text-[#FF8FAB] uppercase tracking-widest border-b border-[#FF8FAB]/30 hover:border-[#FF8FAB] transition-all">
                Ver todo
              </Link>
            </div>
            <div className="space-y-3 overflow-auto max-h-80 pr-2">
              {cobrosList.length > 0 ? cobrosList.slice(0, 5).map((c) => (
                <div key={String(c.id)} className="p-4 bg-[#F8F9FA] rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-pink-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#FF8FAB] transition-colors">
                      <Wallet size={18}/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 text-sm">{c.descripcion}</p>
                      <p className="text-[10px] font-medium text-gray-400">
                        Vence: {c.fechaVencimiento ? new Date(c.fechaVencimiento).toLocaleDateString("es-CL") : "Pendiente"}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[#1A1A2E]">${c.monto.toLocaleString("es-CL")}</p>
                </div>
              )) : (
                <div className="py-12 text-center">
                  <Wallet className="mx-auto mb-3 text-gray-200" size={36} strokeWidth={1.25} />
                  <p className="text-gray-500 text-sm font-medium">Sin cobros recientes</p>
                  <p className="text-gray-400 text-xs mt-1">El listado se llena con la respuesta real de ms-pagos.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type CardProps = {
  title: string
  value: number
  icon: ReactNode
  accentColor: string
}

const Card = ({ title, value, icon, accentColor }: CardProps) => (
  <div className={`p-7 rounded-3xl shadow-sm border-l-4 ${accentColor} bg-white flex justify-between items-center transition-all hover:shadow-lg`}>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-bold text-[#1A1A2E]">
        ${Number(value || 0).toLocaleString("es-CL")}
      </p>
    </div>
    <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-50">{icon}</div>
  </div>
)
