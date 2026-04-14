"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, Save, Loader2, 
  DollarSign, Tag, FileText, Calendar, CheckCircle2
} from "lucide-react"
import Cookies from "js-cookie"

export default function NuevoRegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const [formData, setFormData] = useState({
    monto: "",
    categoriaId: "", 
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  // 1. CARGAR CATEGORÍAS DESDE MS-PAGOS (Puerto 3005)
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const token = Cookies.get("auth-token");
        // Ajustado a puerto 3005 y prefijo /pagos
        const response = await fetch('http://localhost:3005/api/v1/pagos/categorias', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setCategorias(result.data);
          if (result.data.length > 0) {
            // Se usa el nombre de la columna que devuelve tu Oracle (CATEGORIA_ID)
            setFormData(prev => ({ ...prev, categoriaId: result.data[0].CATEGORIA_ID }));
          }
        }
      } catch (err) {
        console.error("Error al cargar categorías de Oracle:", err);
        // Lista vacía para forzar la revisión de la conexión real
        setCategorias([]); 
      } finally {
        setLoadingCategorias(false);
      }
    };
    fetchCategorias();
  }, []);

  // 2. ENVIAR REGISTRO A MS-PAGOS (Puerto 3005)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = Cookies.get("auth-token");
      // Ajustado a puerto 3005 y prefijo /pagos/registro (o el que definas en tus rutas)
      const response = await fetch('http://localhost:3005/api/v1/pagos/registro', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEnviado(true);
        setTimeout(() => router.push('/dashboard/apoderado/tesorero-cpad'), 2000);
      } else {
        const errorData = await response.json();
        alert(`Error al guardar: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      alert("Error de conexión con el microservicio de pagos.");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF2F5]">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl text-center border border-pink-100 animate-in zoom-in duration-300">
          <CheckCircle2 size={80} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-[#1A1A2E] uppercase tracking-tighter">¡Guardado!</h2>
          <p className="text-[#FF8FAB] font-bold text-[10px] mt-2 uppercase tracking-widest">Sincronizado con Oracle Database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#FDF2F5] min-h-screen">
      <button 
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-50 text-[#1A1A2E] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tighter">Nuevo Registro</h1>
          <p className="text-[#FF8FAB] font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Tesorería Lemac</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-pink-50 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* MONTO */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} className="text-[#FF8FAB]" /> Monto del movimiento
              </label>
              <input 
                required
                type="number"
                placeholder="Ej: 50000"
                className="w-full bg-[#FDF2F5] border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] transition-all"
                value={formData.monto}
                onChange={(e) => setFormData({...formData, monto: e.target.value})}
              />
            </div>

            {/* CATEGORÍA DINÁMICA */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-[#FF8FAB]" /> Categoría
              </label>
              <select 
                disabled={loadingCategorias || categorias.length === 0}
                className="w-full bg-[#FDF2F5] border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] appearance-none disabled:opacity-50"
                value={formData.categoriaId}
                onChange={(e) => setFormData({...formData, categoriaId: e.target.value})}
              >
                {loadingCategorias ? (
                  <option>Cargando...</option>
                ) : categorias.length > 0 ? (
                  categorias.map((cat: any) => (
                    <option key={cat.CATEGORIA_ID} value={cat.CATEGORIA_ID}>
                      {cat.NOMBRE}
                    </option>
                  ))
                ) : (
                  <option>No hay categorías disponibles</option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={12} className="text-[#FF8FAB]" /> Descripción del detalle
            </label>
            <textarea 
              required
              rows={3}
              placeholder="Escribe el motivo del registro..."
              className="w-full bg-[#FDF2F5] border-none p-5 rounded-4xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB] transition-all"
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-[#FF8FAB]" /> Fecha Contable
              </label>
              <input 
                type="date"
                className="w-full bg-[#FDF2F5] border-none p-5 rounded-3xl text-[#1A1A2E] font-bold focus:ring-2 focus:ring-[#FF8FAB]"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={loading || loadingCategorias}
              className="w-full bg-[#1A1A2E] text-white p-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#FF8FAB] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Sincronizando...' : 'Sincronizar Oracle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}