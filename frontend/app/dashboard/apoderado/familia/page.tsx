"use client"
import { useState, useEffect } from "react"
import { Users, ShieldCheck, CreditCard, Baby, Phone, FileText, Loader2, AlertCircle } from "lucide-react"
import Cookies from "js-cookie"

interface RelacionFamiliar {
  RELACION_ID: number;
  ALUMNO_ID: number;
  TIPO_RELACION: string;
  ES_APODERADO_ACAD: string;
  ES_TITULAR_FINAN: string;
  AUTORIZADO_RETIRO: string;
  alumno: {
    NOMBRE: string;
    APELLIDO_PATERNO: string;
    APELLIDO_MATERNO: string;
    RUT: string;
    FECHA_NACIMIENTO: string;
  }
}

export default function FamiliaPage() {
  const [familia, setFamilia] = useState<RelacionFamiliar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFamilia = async () => {
      try {
        const token = Cookies.get("auth-token")
        
        if (!token) {
          console.error("No se encontró el token de autenticación");
          setLoading(false);
          return;
        }

        // ✅ URL Corregida y headers completos
        const res = await fetch("http://127.0.0.1:3007/api/v1/academico/familia/mis-familiares", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await res.json()
        console.log("Datos recibidos:", data) // Para que verifiques la estructura en la consola

        if (data.success) {
          setFamilia(data.data)
        }
      } catch (err) {
        console.error("Error cargando familia:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFamilia()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFE]">
      <Loader2 className="animate-spin text-purple-400" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFCFE] p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Mi Grupo Familiar</h1>
        <p className="text-purple-400 font-medium text-sm italic">Gestión de pupilos y autorizaciones de retiro</p>
      </header>

      <div className="space-y-8">
        {familia.length > 0 ? (
          familia.map((rel) => (
            <div key={rel.RELACION_ID} className="bg-white rounded-[3rem] border border-purple-50 shadow-sm overflow-hidden transition-all hover:shadow-md group">
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                
                {/* Avatar con gradiente aesthetic */}
                <div className="w-24 h-24 bg-linear-to-tr from-pink-100 to-purple-100 rounded-4xl flex items-center justify-center text-purple-400 shadow-inner group-hover:scale-105 transition-transform">
                  <Baby size={48} />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
                      {rel.alumno.NOMBRE} {rel.alumno.APELLIDO_PATERNO}
                    </h2>
                    <span className="inline-block px-4 py-1 bg-purple-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest self-center md:self-auto">
                      {rel.TIPO_RELACION}
                    </span>
                  </div>
                  <p className="text-gray-400 font-medium mb-6">RUT: {rel.alumno.RUT}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Badge Finanzas */}
                    <div className={`p-4 rounded-3xl border transition-colors ${rel.ES_TITULAR_FINAN === 'S' ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <CreditCard size={16} className={rel.ES_TITULAR_FINAN === 'S' ? 'text-yellow-500' : 'text-gray-400'} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Finanzas</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700">{rel.ES_TITULAR_FINAN === 'S' ? 'Titular de Pago' : 'Sin acceso'}</p>
                    </div>

                    {/* Badge Académico */}
                    <div className={`p-4 rounded-3xl border transition-colors ${rel.ES_APODERADO_ACAD === 'S' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <FileText size={16} className={rel.ES_APODERADO_ACAD === 'S' ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Académico</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700">{rel.ES_APODERADO_ACAD === 'S' ? 'Gestión de Notas' : 'Solo lectura'}</p>
                    </div>

                    {/* Badge Retiro */}
                    <div className={`p-4 rounded-3xl border transition-colors ${rel.AUTORIZADO_RETIRO === 'S' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <ShieldCheck size={16} className={rel.AUTORIZADO_RETIRO === 'S' ? 'text-green-500' : 'text-red-400'} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">Seguridad</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700">{rel.AUTORIZADO_RETIRO === 'S' ? 'Autorizado Retiro' : 'No Autorizado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-purple-200 flex flex-col items-center gap-4">
            <AlertCircle className="text-purple-200" size={64} />
            <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em]">No se encontraron alumnos vinculados</p>
          </div>
        )}
      </div>
    </div>
  )
}