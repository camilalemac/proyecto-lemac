"use client"
import { useState } from "react"
import { UserPlus, ArrowLeft, Loader2, ShieldCheck, Fingerprint } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function RegistroProfesoresPage() {
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);
  const [form, setForm] = useState({ 
    rutCuerpo: "", 
    rutDv: "", 
    nombres: "", 
    apellidos: "", 
    email: "", 
    password: "Profesor2026!" 
  });

  // FUNCIÓN: Validador de RUT Chileno Real (Algoritmo Módulo 11)
  const validarRutReal = (cuerpo: string, dv: string) => {
    const cuerpoLimpio = cuerpo.replace(/\./g, "");
    if (cuerpoLimpio.length < 7 || !dv) return false;

    let suma = 0;
    let multiplo = 2;
    for (let i = 1; i <= cuerpoLimpio.length; i++) {
      suma += multiplo * parseInt(cuerpoLimpio.charAt(cuerpoLimpio.length - i));
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const dvEsperado = 11 - (suma % 11);
    let dvFinal = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
    
    return dvFinal.toUpperCase() === dv.toUpperCase();
  };

  // FUNCIÓN: Formatea RUT con puntos y limita a 8 dígitos reales
  const formatRut = (value: string) => {
    // LÍMITE ESTRICTO DE 8 DÍGITOS PARA EL CUERPO
    const cuerpo = value.replace(/[^0-9]/g, "").slice(0, 8); 
    if (cuerpo.length <= 1) return cuerpo;
    
    let resultado = "";
    if (cuerpo.length > 6) {
      resultado = cuerpo.replace(/^(\d{1,2})(\d{3})(\d{3})$/, "$1.$2.$3");
    } else if (cuerpo.length > 3) {
      resultado = cuerpo.replace(/^(\d{1,3})(\d{3})$/, "$1.$2");
    } else {
      resultado = cuerpo;
    }
    return resultado;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, rutCuerpo: formatRut(e.target.value) });
  };

  const handleDvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // SOLO NÚMEROS O K, Y MÁXIMO 1 CARACTER
    const dv = e.target.value.toUpperCase().replace(/[^0-9K]/g, "").slice(0, 1); 
    setForm({ ...form, rutDv: dv });
  };

  // VALIDACIONES VISUALES EN TIEMPO REAL
  const rutLimpioLen = form.rutCuerpo.replace(/\./g, "").length;
  const estaEscribiendoRut = rutLimpioLen > 0 || form.rutDv.length > 0;
  const estaIncompleto = estaEscribiendoRut && (rutLimpioLen < 7 || form.rutDv === "");
  const esInvalido = !estaIncompleto && estaEscribiendoRut && !validarRutReal(form.rutCuerpo, form.rutDv);
  const tieneErrorRut = estaIncompleto || esInvalido;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tieneErrorRut || !estaEscribiendoRut) return;

    setProcesando(true);
    try {
      const token = Cookies.get("auth-token");
      const rutLimpio = form.rutCuerpo.replace(/\./g, "");

      const res = await fetch("http://localhost:3007/api/v1/identity/usuarios", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          ...form, 
          rutCuerpo: rutLimpio,
          colegioId: 1, 
          rolCode: "STF_PROF" 
        })
      });

      const json = await res.json();
      if (res.ok) {
        alert("Profesor(a) registrado exitosamente.");
        router.push("/dashboard/directora"); 
      } else {
        throw new Error(json.message || "Error en el registro");
      }
    } catch (e: any) {
      alert(`Error de Microservicio: ${e.message}`);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={() => router.push("/dashboard/directora")}
        className="flex items-center gap-2 text-slate-400 hover:text-[#0F172A] transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al Inicio
      </button>

      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <Fingerprint size={200} className="absolute -right-20 -bottom-20 text-slate-50 opacity-50" />

        <div className="flex items-center gap-6 mb-12 relative z-10">
          <div className="bg-emerald-100 p-5 rounded-4xl text-emerald-600 shadow-xl shadow-emerald-100">
            <UserPlus size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter leading-none">Alta de Docente</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Personal Administrativo y Académico</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className={`text-[10px] font-black uppercase ml-4 tracking-widest ${tieneErrorRut ? 'text-rose-500' : 'text-slate-400'}`}>
              Identificación Nacional (RUT) 
              {estaIncompleto ? " — LE FALTA RELLENAR EL RUT" : (esInvalido ? " — RUT INVÁLIDO" : "")}
            </label>
            <div className="flex gap-4">
              <input 
                required 
                className={`flex-1 p-5 border-none rounded-3xl text-sm font-bold outline-none transition-all ${tieneErrorRut ? 'bg-rose-50 ring-2 ring-rose-500 text-rose-900' : 'bg-slate-50 focus:ring-2 focus:ring-emerald-500'}`} 
                placeholder="12.345.678" 
                value={form.rutCuerpo} 
                onChange={handleRutChange} 
              />
              <input 
                required 
                maxLength={1}
                className={`w-20 p-5 border-none rounded-3xl text-sm font-bold text-center outline-none uppercase transition-all ${tieneErrorRut ? 'bg-rose-50 ring-2 ring-rose-500 text-rose-900' : 'bg-slate-50 focus:ring-2 focus:ring-emerald-500'}`} 
                placeholder="K" 
                value={form.rutDv} 
                onChange={handleDvChange} 
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Nombres</label>
             <input required className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Juan Alberto" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Apellidos</label>
             <input required className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Soto Pérez" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
             <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Email Corporativo</label>
             <input required type="email" className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="profesor@colegio.cl" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <button 
            disabled={procesando || tieneErrorRut || !estaEscribiendoRut} 
            type="submit"
            className="col-span-1 md:col-span-2 py-6 bg-[#0F172A] text-white rounded-4xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-slate-200"
          >
            {procesando ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
            Confirmar y Guardar en Oracle
          </button>
        </form>
      </div>
    </div>
  )
}