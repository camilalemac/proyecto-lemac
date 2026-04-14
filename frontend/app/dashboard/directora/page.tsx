"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  FileText, CheckCircle2, ShieldCheck, Loader2, 
  UserPlus, GraduationCap, Download, AlertCircle,
  TrendingUp, ArrowUpRight, LayoutDashboard,
  Users, Wallet, PieChart
} from "lucide-react"

export default function DirectoraMasterPage() {
  // Datos de diseño para visualizar ahora
  const [metrics] = useState({ ceal: 850000, cpad: 2450000, totalGastos: 1100000 });
  const [reportes] = useState([
    { DOCUMENTO_ID: 1, TITULO: "Balance Q1 2026", URL_ARCHIVO: "#", FECHA: "12/04/2026" },
    { DOCUMENTO_ID: 2, TITULO: "Acta Asamblea General", URL_ARCHIVO: "#", FECHA: "05/04/2026" }
  ]);

  return (
    <div className="p-8 space-y-8 bg-[#FDF2F5] min-h-screen">
      
      {/* HEADER INSTITUCIONAL */}
      <div className="bg-[#0F172A] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF8FAB]/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={20} className="text-[#FF8FAB]" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Master Control</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Panel de Dirección</h1>
            <p className="text-slate-400 text-sm font-medium">Consolidado General de Operaciones 2026</p>
          </div>
          <Link href="/dashboard/directora/profesores" className="bg-[#FF8FAB] text-white px-8 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl">
            <UserPlus size={18} /> Gestión de Docentes
          </Link>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Egresos Totales" value={metrics.totalGastos} icon={<TrendingUp />} color="text-rose-500" />
        <MetricCard title="Saldo CEAL" value={metrics.ceal} icon={<Users />} color="text-sky-500" />
        <MetricCard title="Recaudación CPAD" value={metrics.cpad} icon={<Wallet />} color="text-emerald-500" />
        <Link href="/dashboard/directora/validacion" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center relative overflow-hidden group hover:bg-[#1A1A2E] transition-all">
          <p className="text-[10px] font-black text-slate-400 group-hover:text-rose-400 uppercase tracking-widest mb-2">Validaciones</p>
          <h3 className="text-2xl font-black text-[#0F172A] group-hover:text-white">7 Pendientes</h3>
          <ShieldCheck size={60} className="absolute -right-2 -bottom-2 text-slate-50 opacity-20 group-hover:text-white" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MONITOR DE GASTOS (ACCESO A DASHBOARD) */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-between h-112.5">
          <div>
            <div className="w-14 h-14 bg-pink-50 text-[#FF8FAB] rounded-2xl flex items-center justify-center mb-6">
              <PieChart size={28} />
            </div>
            <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter mb-4">Análisis de Gastos</h2>
            <p className="text-slate-400 font-medium leading-relaxed max-w-md">
              Visualice la distribución de fondos del Centro de Alumnos y Centro de Padres segmentado por categorías oficiales.
            </p>
          </div>
          <Link href="/dashboard/directora/gastos" className="w-full bg-[#0F172A] text-white py-5 rounded-3xl text-center font-black text-[11px] uppercase tracking-widest hover:bg-[#FF8FAB] transition-all">
            Abrir Visualización Dinámica
          </Link>
        </div>

        {/* ÚLTIMOS REPORTES */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col h-112.5">
          <h3 className="font-black text-[#0F172A] uppercase text-xs tracking-widest mb-8">Balances Recientes</h3>
          <div className="space-y-4 flex-1">
            {reportes.map(r => (
              <div key={r.DOCUMENTO_ID} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <FileText className="text-slate-400" size={18} />
                  <p className="text-[11px] font-bold text-slate-700">{r.TITULO}</p>
                </div>
                <Download size={14} className="text-slate-300 cursor-pointer hover:text-[#FF8FAB]" />
              </div>
            ))}
          </div>
          <Link href="/dashboard/directora/reportes" className="text-center text-[10px] font-black uppercase text-slate-400 hover:text-[#FF8FAB] pt-4 border-t border-slate-100">
            Ver Archivo Completo
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
      <h3 className="text-2xl font-black text-[#0F172A]">${value.toLocaleString('es-CL')}</h3>
    </div>
  )
}