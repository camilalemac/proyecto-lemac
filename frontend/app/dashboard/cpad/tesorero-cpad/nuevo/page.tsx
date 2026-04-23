"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Save, Loader2, Landmark,
  DollarSign, Tag, FileText, Calendar, CheckCircle2, ArrowRightLeft
} from "lucide-react"

// ARQUITECTURA LIMPIA
import { authService } from "../../../../../services/authService"
import { pagosService } from "../../../../../services/pagosService"

export default function NuevoRegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [loadingDatos, setLoadingDatos] = useState(true);

  const [formData, setFormData] = useState({
    tipoMovimiento: "EGRESO",
    monto: "",
    categoriaId: "", 
    cuentaId: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Validar Identidad
        const perfil = await authService.getMe();
        const colId = perfil.COLEGIO_ID || 1;

        // 2. Cargar Categorías y Cuentas en paralelo
        const [catsData, cuentasData] = await Promise.all([
          pagosService.getCategoriasPagos(),
          pagosService.getCuentasPorColegio(colId)
        ]);

        setCategorias(catsData);
        setCuentas(cuentasData);

        // Setear valores por defecto si hay datos
        setFormData(prev => ({
          ...prev,
          categoriaId: catsData.length > 0 ? (catsData[0].CATEGORIA_ID || catsData[0].categoria_id) : "",
          cuentaId: cuentasData.length > 0 ? (cuentasData[0].CUENTA_ID || cuentasData[0].cuenta_id) : ""
        }));

      } catch (err) {
        console.error("Error al cargar datos base:", err);
      } finally {
        setLoadingDatos(false);
        setAuthLoading(false);
      }
    };
    initData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Adaptar el payload para que coincida con la tabla pag_movimientos_caja
      const payload = {
        cuenta_id: Number(formData.cuentaId),
        categoria_id: Number(formData.categoriaId),
        tipo_movimiento: formData.tipoMovimiento,
        glosa: formData.descripcion,
        monto: Number(formData.monto),
        fecha_movimiento: formData.fecha
      };

      await pagosService.registrarMovimientoManual(payload);
      
      setEnviado(true);
      setTimeout(() => router.push('/dashboard/cpad/tesorero-cpad'), 2000);
    } catch (error: any) {
      alert(`Error al guardar: ${error.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-[#FDF2F5]">
      <Loader2 className="animate-spin text-[#FF8FAB]" size={48} strokeWidth={1.5} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autenticando Ledger...</p>
    </div>
  )

  if (enviado) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="bg-white p-16 rounded-[3.5rem] shadow-xl text-center border border-pink-100 animate-in zoom-in duration-300">
          <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">¡Registrado!</h2>
          <p className="text-[#FF8FAB] font-bold text-[10px] mt-2 uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sincronizado con Oracle Database
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-100 text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest hover:bg-[#1A1A2E] hover:text-white transition-all"
      >
        <ArrowLeft size={14} /> Volver a Tesorería
      </button>

      <header className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
         <div className="bg-[#1A1A2E] p-5 rounded-2xl text-[#FF8FAB] shadow-xl shadow-slate-900/10">
           <ArrowRightLeft size={32} />
         </div>
         <div>
           <h1 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter leading-none italic">Nuevo Registro</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Ingreso manual al libro contable</p>
         </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8">
        
        {/* TIPO DE MOVIMIENTO (Radio Buttons) */}
        <div className="flex gap-4 p-2 bg-slate-50 rounded-3xl border border-slate-100">
          <button
            type="button"
            onClick={() => setFormData({...formData, tipoMovimiento: 'INGRESO'})}
            className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              formData.tipoMovimiento === 'INGRESO' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            + Registrar Ingreso
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, tipoMovimiento: 'EGRESO'})}
            className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              formData.tipoMovimiento === 'EGRESO' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            - Registrar Egreso
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CUENTA DESTINO/ORIGEN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
              <Landmark size={12} className="text-[#FF8FAB]" /> Cuenta Bancaria
            </label>
            <select 
              disabled={loadingDatos || cuentas.length === 0}
              className="w-full bg-slate-50 border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] appearance-none disabled:opacity-50"
              value={formData.cuentaId}
              onChange={(e) => setFormData({...formData, cuentaId: e.target.value})}
              required
            >
              {loadingDatos ? <option>Cargando...</option> : 
                cuentas.map(c => <option key={c.CUENTA_ID || c.cuenta_id} value={c.CUENTA_ID || c.cuenta_id}>{c.NOMBRE_CUENTA || c.nombre_cuenta}</option>)
              }
            </select>
          </div>

          {/* MONTO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
              <DollarSign size={12} className="text-[#FF8FAB]" /> Monto Neto
            </label>
            <input 
              required
              type="number"
              placeholder="Ej: 50000"
              className="w-full bg-slate-50 border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] transition-all"
              value={formData.monto}
              onChange={(e) => setFormData({...formData, monto: e.target.value})}
            />
          </div>

          {/* CATEGORÍA DINÁMICA */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
              <Tag size={12} className="text-[#FF8FAB]" /> Categoría
            </label>
            <select 
              disabled={loadingDatos || categorias.length === 0}
              className="w-full bg-slate-50 border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] appearance-none disabled:opacity-50"
              value={formData.categoriaId}
              onChange={(e) => setFormData({...formData, categoriaId: e.target.value})}
              required
            >
              {loadingDatos ? <option>Cargando...</option> : 
                categorias.map(cat => <option key={cat.CATEGORIA_ID || cat.categoria_id} value={cat.CATEGORIA_ID || cat.categoria_id}>{cat.NOMBRE || cat.nombre}</option>)
              }
            </select>
          </div>

          {/* FECHA */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
              <Calendar size={12} className="text-[#FF8FAB]" /> Fecha de Transacción
            </label>
            <input 
              type="date"
              required
              className="w-full bg-slate-50 border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB]"
              value={formData.fecha}
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
            />
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2">
            <FileText size={12} className="text-[#FF8FAB]" /> Glosa (Motivo)
          </label>
          <textarea 
            required
            rows={3}
            placeholder="Escribe el detalle de la compra o ingreso..."
            className="w-full bg-slate-50 border-none p-5 rounded-4xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] transition-all"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={loading || loadingDatos}
          className="w-full bg-[#1A1A2E] text-white py-6 rounded-4xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#FF8FAB] hover:text-[#1A1A2E] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Impactando Ledger...' : 'Registrar en Oracle DB'}
        </button>
      </form>
    </div>
  )
}