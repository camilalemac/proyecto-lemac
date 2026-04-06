"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  FileText, CheckCircle2, ShieldCheck, Loader2, 
  UserPlus, GraduationCap, Download, AlertCircle,
  TrendingUp, ArrowUpRight
} from "lucide-react"

export default function DirectoraMasterPage() {
  const [cealData, setCealData] = useState<any>(null);
  const [cpadData, setCpadData] = useState<any>(null);
  const [cursos, setCursos] = useState<any[]>([]); // Estado para los cursos reales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevaProfesor, setNuevaProfesor] = useState({ nombre: "", asignatura: "", curso: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCeal, resCpad, resCursos] = await Promise.all([
          fetch('http://localhost:3001/api/v1/finanzas/ceal/resumen'),
          fetch('http://localhost:3001/api/v1/finanzas/cpad/resumen'),
          fetch('http://localhost:3001/api/v1/academico/cursos') // Endpoint real de tus microservicios
        ]);

        const isCealJson = resCeal.headers.get("content-type")?.includes("application/json");
        const isCpadJson = resCpad.headers.get("content-type")?.includes("application/json");
        const isCursosJson = resCursos.headers.get("content-type")?.includes("application/json");

        if (isCealJson) setCealData(await resCeal.json());
        if (isCpadJson) setCpadData(await resCpad.json());
        if (isCursosJson) setCursos(await resCursos.json());

        if (!isCealJson || !isCpadJson || !isCursosJson) {
          setError("Sincronización parcial: Algunos microservicios no responden JSON.");
        }
      } catch (e) { 
        setError("Error Crítico: Microservicio Académico/Financiero Offline (Puerto 3001).");
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const handleCrearProfesor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/v1/academico/profesores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaProfesor)
      });
      if (response.ok) {
        alert("Profesora vinculada exitosamente al curso en Oracle DB");
        setShowModal(false);
      }
    } catch (err) {
      alert("Error en microservicio académico.");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#0F172A]" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-[#FDF2F5] min-h-screen">
      
      {/* STATUS BAR */}
      {error && (
        <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl flex items-center gap-3 text-pink-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* HEADER INSTITUCIONAL */}
      <div className="bg-[#0F172A] p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8FAB]/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <ShieldCheck size={20} className="text-[#FF8FAB]" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Sistema de Control Master EDUCA+</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Panel de Dirección</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Consolidado General de Operaciones y Finanzas 2026</p>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#FF8FAB] text-white px-8 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-pink-500/20"
          >
            <UserPlus size={18} /> Vincular Docente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* CONTROL DE CURSOS REALES */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-[#0F172A] flex items-center gap-3 uppercase text-sm tracking-widest">
                <GraduationCap size={24} className="text-[#FF8FAB]" /> Monitor de Cuotas por Curso
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cursos.length > 0 ? (
                cursos.map((curso) => (
                  <Link href={`/dashboard/directora/${curso.id}`} key={curso.id} className="block group">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 group-hover:border-[#FF8FAB] group-hover:bg-white transition-all cursor-pointer shadow-sm group-hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{curso.nombre}</span>
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-[#FF8FAB] transition-colors" />
                      </div>
                      <p className="text-2xl font-black text-[#0F172A] mb-1">${curso.recaudacion?.toLocaleString() || "0"}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-[#FF8FAB] h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${curso.porcentaje || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Estado de Cuota</span>
                        <span className="text-[9px] font-black text-pink-600">{curso.porcentaje || 0}%</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay cursos vinculados en Oracle DB</p>
                </div>
              )}
            </div>
          </div>

          {/* BALANCE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
               <p className="text-[10px] font-black text-pink-500 uppercase mb-4 tracking-widest">Resumen CEAL</p>
               <h4 className="text-4xl font-black text-[#0F172A] tracking-tighter">
                 ${cealData?.totalIngresos?.toLocaleString() || "0"}
               </h4>
               <div className="mt-6 p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 text-emerald-700 text-[10px] font-black uppercase">
                 <CheckCircle2 size={16} /> Presupuesto Validado
               </div>
            </div>
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
               <p className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-widest">Recaudación CPAD</p>
               <h4 className="text-4xl font-black text-[#0F172A] tracking-tighter">
                 ${cpadData?.recaudacionTotal?.toLocaleString() || "0"}
               </h4>
               <button className="mt-6 w-full py-4 bg-[#0F172A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF8FAB] transition-all">
                 Descargar Auditoría Full PDF
               </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="font-black text-[#0F172A] mb-6 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <FileText size={18} className="text-slate-400" /> Balances
            </h3>
            <div className="space-y-4">
              <BalanceItem title="Cierre Gestión 2025" fecha="15 Ene 2026" />
              <BalanceItem title="Estado Financiero Q1" fecha="05 Abr 2026" />
            </div>
          </div>

          <div className="bg-slate-100 border-2 border-slate-200 p-8 rounded-[3rem] text-[#0F172A] shadow-lg shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
            <TrendingUp size={32} className="mb-4 text-[#0F172A] relative z-10" />
            <p className="font-black text-xs uppercase tracking-widest mb-2 relative z-10">Proyección Abril</p>
            <p className="text-xs font-medium leading-relaxed opacity-80 relative z-10">
              Se estima un incremento del 15% en la recaudación tras la asamblea.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL VINCULACIÓN DOCENTE */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl animate-in zoom-in duration-300 border border-pink-50">
            <div className="bg-pink-100 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 text-[#FF8FAB]">
              <UserPlus size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0F172A] mb-2 uppercase tracking-tighter">Alta de Docente</h2>
            
            <form onSubmit={handleCrearProfesor} className="space-y-4 mt-6">
              <input 
                placeholder="Nombre del Profesor" 
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#FF8FAB] transition-all"
                onChange={(e) => setNuevaProfesor({...nuevaProfesor, nombre: e.target.value})}
                required
              />
              <select 
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold outline-none appearance-none focus:ring-2 focus:ring-[#FF8FAB]"
                onChange={(e) => setNuevaProfesor({...nuevaProfesor, curso: e.target.value})}
              >
                <option value="">Seleccionar Curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 py-5 bg-[#0F172A] text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#FF8FAB] transition-colors">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function BalanceItem({ title, fecha }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-[#0F172A] transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-[#FF8FAB] transition-colors shadow-sm">
          <FileText size={16} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-700 uppercase leading-none group-hover:text-white">{title}</p>
          <p className="text-[9px] text-slate-400 font-bold mt-1 group-hover:text-pink-100">{fecha}</p>
        </div>
      </div>
      <Download size={14} className="text-slate-300 group-hover:text-white cursor-pointer" />
    </div>
  )
}