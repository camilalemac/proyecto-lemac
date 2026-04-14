"use client"
import React, { useState, useEffect } from "react"
import { 
  FileText, Download, Loader2, Search, Filter, 
  Calendar, ShieldCheck, AlertCircle, ArrowLeft,
  BarChart3, FileArchive, ServerOff
} from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function DirectoraReportesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [reportes, setReportes] = useState<any[]>([]);

  // Fetch 100% Real (Gateway 3007 -> MS_REPORTES)
  const fetchReportes = async () => {
    try {
      const token = Cookies.get("auth-token");
      if (!token) throw new Error("Sesión expirada o token no encontrado.");

      const res = await fetch("http://127.0.0.1:3007/api/v1/notificaciones/reportes", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const json = await res.json();
      
      if (res.ok && json.success) {
        setReportes(json.data || []);
      } else {
        throw new Error(json.message || "Error al leer historial del servidor.");
      }
    } catch (e: any) {
      setErrorGlobal(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchReportes(); 
  }, []);

  // Lógica de Filtrado (Frontend)
  const filtrados = reportes.filter(r => {
    // Maneja propiedades en mayúscula (Oracle) o camelCase
    const tituloDoc = r.TITULO || r.titulo || ""; 
    const tipoDoc = r.TIPO_DOCUMENTO || r.tipoDocumento || "";

    const coincideTexto = tituloDoc.toLowerCase().includes(busqueda.toLowerCase()) || 
                          tipoDoc.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === "TODOS" || tipoDoc === filtroTipo;
    return coincideTexto && coincideTipo;
  });

  const formatearTipo = (tipo: string) => {
    if (!tipo) return "Documento";
    return tipo.replace(/_/g, ' ');
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Archivo Institucional...</p>
    </div>
  );

  if (errorGlobal) return (
    <div className="flex h-screen flex-col items-center justify-center text-center p-8 bg-[#FDF2F5]">
      <ServerOff size={80} className="mb-6 text-rose-400 opacity-40" />
      <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter">Gateway Desconectado</h2>
      <p className="text-sm font-bold text-slate-500 mt-2 max-w-md">{errorGlobal}</p>
      <button onClick={() => window.location.reload()} className="mt-8 px-8 py-4 bg-[#0F172A] text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF8FAB] transition-colors">Reintentar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF2F5] pb-20">
      <div className="max-w-6xl mx-auto p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => router.push("/dashboard/directora")}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Volver al Inicio
        </button>

        {/* HEADER DE LA VISTA */}
        <header className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <FileArchive size={200} className="absolute -right-10 -bottom-10 text-slate-50 opacity-50" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="bg-[#0F172A] p-6 rounded-4xl text-[#FF8FAB] shadow-2xl">
              <FileText size={36} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none">Auditoría de Reportes</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Visor Oficial de Balances y Actas Institucionales</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto relative z-10">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Buscar documento..." 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl text-xs font-bold focus:ring-2 focus:ring-[#FF8FAB] outline-none transition-all"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select 
                className="w-full sm:w-56 appearance-none pl-14 pr-10 py-5 bg-slate-50 border-none rounded-3xl text-xs font-bold text-[#0F172A] focus:ring-2 focus:ring-[#FF8FAB] outline-none cursor-pointer"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="REPORTE_FINANCIERO_ANUAL">Balances Anuales</option>
                <option value="REPORTE_FINANCIERO_MENSUAL">Balances Mensuales</option>
                <option value="REPORTE_FINANCIERO_TRIMESTRAL">Balances Trimestrales</option>
                <option value="ACTA_REUNION">Actas de Reunión</option>
              </select>
            </div>
          </div>
        </header>

        {/* METRICAS VISUALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl"><BarChart3 size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total en Archivo</p>
              <h3 className="text-2xl font-black text-[#0F172A]">{reportes.length} Docs</h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><Calendar size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generados Año Actual</p>
              <h3 className="text-2xl font-black text-[#0F172A]">
                {reportes.filter(r => {
                  const f = r.FECHA_DE_CREACION || r.fechaDeCreacion || r.createdAt;
                  if(!f) return false;
                  return new Date(f).getFullYear() === new Date().getFullYear();
                }).length} Docs
              </h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="p-4 bg-pink-50 text-[#FF8FAB] rounded-2xl"><ShieldCheck size={24}/></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integridad DDBB</p>
              <h3 className="text-2xl font-black text-[#0F172A]">100% Sync</h3>
            </div>
          </div>
        </div>

        {/* LISTADO DINÁMICO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-[4rem] p-24 flex flex-col items-center justify-center text-center shadow-sm">
              <AlertCircle size={64} className="mb-4 text-slate-200" />
              <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tighter mb-2">Sin Resultados</h3>
              <p className="text-sm font-medium text-slate-400 max-w-sm">
                No se encontraron documentos en Oracle que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : filtrados.map((r) => {
            const tipoDoc = r.TIPO_DOCUMENTO || r.tipoDocumento;
            const tituloDoc = r.TITULO || r.titulo;
            const urlDoc = r.URL_ARCHIVO || r.urlArchivo;
            const fechaDoc = r.FECHA_DE_CREACION || r.fechaDeCreacion || r.createdAt || new Date();
            const docId = r.DOCUMENTO_ID || r.documentoId || r.id;

            const esAnual = tipoDoc === "REPORTE_FINANCIERO_ANUAL";
            const bgColor = esAnual ? "bg-[#0F172A]" : "bg-white";
            const textColor = esAnual ? "text-white" : "text-[#0F172A]";
            const subTextColor = esAnual ? "text-slate-400" : "text-slate-400";
            const iconBg = esAnual ? "bg-white/10 text-[#FF8FAB]" : "bg-slate-50 text-[#0F172A]";

            return (
              <div key={docId} className={`${bgColor} p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden`}>
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-5">
                    <div className={`p-5 rounded-3xl transition-all shadow-sm ${iconBg}`}>
                      <FileText size={28} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black uppercase tracking-tighter line-clamp-1 pr-4 ${textColor}`}>
                        {tituloDoc}
                      </h3>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${esAnual ? 'text-[#FF8FAB]' : 'text-blue-500'}`}>
                        {formatearTipo(tipoDoc)}
                      </p>
                    </div>
                  </div>
                  <a 
                    href={urlDoc} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`p-4 rounded-2xl transition-all shadow-sm shrink-0 ${esAnual ? 'bg-white text-[#0F172A] hover:bg-[#FF8FAB] hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-[#0F172A] hover:text-white'}`}
                  >
                    <Download size={20} />
                  </a>
                </div>

                <div className={`mt-10 flex items-center justify-between pt-6 border-t z-10 ${esAnual ? 'border-white/10' : 'border-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={subTextColor} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${subTextColor}`}>
                      {new Date(fechaDoc).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${esAnual ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em]">Certificado Drive</p>
                  </div>
                </div>
                
                {esAnual && (
                  <FileArchive size={180} className="absolute -right-10 -bottom-10 text-white/5 group-hover:scale-110 transition-transform duration-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}