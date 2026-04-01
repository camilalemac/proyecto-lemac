"use client"
import { useState, useEffect } from "react"
import { 
  GraduationCap, User, Mail, Eye, EyeOff, MapPin, CheckCircle2, Circle, BookOpen, Plus, Trash2, Users, Check, X
} from "lucide-react"

interface GeoItem { 
  regionId?: number; 
  provinciaId?: number; 
  comunaId?: number; 
  id?: string | number; 
  nombre: string 
}

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hijos, setHijos] = useState<string[]>([""]) 
  const [loading, setLoading] = useState(false)
  const [rutError, setRutError] = useState("")

  const [formData, setFormData] = useState({
    rut: "", nombre: "", email: "", password: "", confirmPassword: "",
    rol: "", region: "", provincia: "", comuna: "", 
    curso: "", letra: "", 
    colegioId: 1 
  })

  const [regiones, setRegiones] = useState<GeoItem[]>([])
  const [provincias, setProvincias] = useState<GeoItem[]>([])
  const [comunas, setComunas] = useState<GeoItem[]>([])
  const [cursos, setCursos] = useState<any[]>([])

  const rolesCategorizados = {
    "Personal Institucional": ["Administrador", "Directora", "Unidad Tecnico Pedagogica", "Tesorero Colegio", "Profesor"],
    "Estudiantes": ["Alumno Regular", "Presidente de Centro de Alumnos", "Tesorero Centro Alumnos", "Secretario de Centro de Alumnos", "Presidente Curso Alumnos", "Tesorero de Curso Alumnos", "Secretario de Curso Alumnos"],
    "Apoderados": ["Apoderado Titular", "Presidente Centro Padres", "Tesorero Centro Padres", "Secretario Centro de Apoderados", "Presidente Curso Apoderados", "Tesorero de Curso Apoderados", "Secretario de Curso Apoderados"]
  }

  const esEstudiante = rolesCategorizados["Estudiantes"].includes(formData.rol)
  const esApoderado = rolesCategorizados["Apoderados"].includes(formData.rol)

  // URLs de Microservicios
  const GEO_API_URL = "http://localhost:8081/api/v1/geo";
  const ACADEMICO_API_URL = "http://localhost:3004/api/v1/academico";
  const IDENTITY_API_URL = "http://localhost:3003/api/v1/identity";
  const AUTH_API_URL = "http://localhost:3001/api/v1/auth"; // Reincorporado

  // --- Formateo de RUT Automático ---
  const formatRut = (value: string) => {
    let newDoc = value.replace(/[^\dkK]/g, "");
    if (newDoc.length > 9) newDoc = newDoc.slice(0, 9); // Límite de 9 dígitos (cuerpo + DV)
    
    if (newDoc.length <= 1) return newDoc;
    let result = newDoc.slice(-1);
    let cuerpo = newDoc.slice(0, -1);
    if (cuerpo.length > 0) result = "-" + result;
    if (cuerpo.length > 3) result = "." + cuerpo.slice(-3) + result;
    if (cuerpo.length > 6) result = "." + cuerpo.slice(-6, -3) + result;
    if (cuerpo.length > 6) result = cuerpo.slice(0, -6) + result;
    else if (cuerpo.length > 3) result = cuerpo.slice(0, -3) + result;
    else result = cuerpo + result;
    return result;
  };

  // --- Validación de Contraseña ---
  const passwordValidations = {
    length: formData.password.length >= 8,
    number: /\d/.test(formData.password),
    upper: /[A-Z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }

  // --- Lógica de Carga de Datos ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resGeo, resCur] = await Promise.all([
          fetch(`${GEO_API_URL}/regiones`),
          fetch(`${ACADEMICO_API_URL}/cursos`)
        ]);
        const jsonGeo = await resGeo.json();
        const jsonCur = await resCur.json();
        setRegiones(jsonGeo.data || jsonGeo);
        if (jsonCur.success) setCursos(jsonCur.data);
      } catch (err) { console.error("Error cargando datos iniciales:", err); }
    }
    fetchData();
  }, [])

  useEffect(() => {
    if (!formData.region) return;
    fetch(`${GEO_API_URL}/provincias/${formData.region}`).then(res => res.json()).then(json => setProvincias(json.data || json));
  }, [formData.region])

  useEffect(() => {
    if (!formData.provincia) return;
    fetch(`${GEO_API_URL}/comunas/${formData.provincia}`).then(res => res.json()).then(json => setComunas(json.data || json));
  }, [formData.provincia])

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "rut") {
      setFormData({ ...formData, rut: formatRut(value) });
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleHijoChange = (index: number, value: string) => {
    const newHijos = [...hijos];
    newHijos[index] = formatRut(value); // También formatea el RUT del hijo
    setHijos(newHijos);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !Object.values(passwordValidations).every(Boolean)) {
        alert("Por favor cumple con todos los requisitos de seguridad.");
        return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${IDENTITY_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            ...formData, 
            rut: formData.rut.replace(/\./g, ""), // Limpiar puntos para el backend
            hijos: esApoderado ? hijos.map(h => h.replace(/\./g, "")) : [] 
        })
      });
      const data = await response.json();
      alert(data.success ? "¡Registro exitoso!" : `Error: ${data.message}`);
    } catch (error) { alert("Error de conexión"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar Visual */}
      <div className="hidden lg:flex w-100 bg-indigo-700 p-12 flex-col justify-center text-white shrink-0">
        <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold mb-6 leading-tight">Gestión Escolar Lemac</h1>
        <p className="text-indigo-100 text-lg opacity-90">Plataforma centralizada de registro institucional.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white rounded-4xl shadow-xl border border-gray-100 p-8 my-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Crear Nueva Cuenta</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ROL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Selecciona tu Rol</label>
              <select name="rol" required value={formData.rol} onChange={handleChange} className="w-full p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl outline-none text-indigo-900 font-medium">
                <option value="">Seleccionar cargo...</option>
                {Object.entries(rolesCategorizados).map(([categoria, lista]) => (
                  <optgroup key={categoria} label={categoria}>
                    {lista.map(r => <option key={r} value={r}>{r}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* RUT Y NOMBRE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">RUT</label>
                <input name="rut" required placeholder="12.345.678-9" value={formData.rut} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Nombre Completo</label>
                <input name="nombre" required placeholder="Ej: Bárbara Quezada" value={formData.nombre} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
              </div>
            </div>

            {/* CURSO Y LETRA (Categorizado en Básica/Media) */}
            {esEstudiante && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Curso</label>
                  <select name="curso" value={formData.curso} onChange={handleChange} className="w-full p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl">
                    <option value="">Seleccionar...</option>
                    <optgroup label="Enseñanza Básica">
                      {cursos.filter(c => c.nombre.toLowerCase().includes("básico")).map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Enseñanza Media">
                      {cursos.filter(c => c.nombre.toLowerCase().includes("medio")).map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Letra</label>
                  <select name="letra" value={formData.letra} onChange={handleChange} className="w-full p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl">
                    <option value="">Letra...</option>
                    {["A", "B", "C", "D"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* HIJOS (PARA APODERADOS) - RESTAURADO */}
            {esApoderado && (
              <div className="space-y-3 pt-4 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users size={16} className="text-indigo-500"/> Vincular Hijos (Alumnos)
                  </label>
                  <button type="button" onClick={() => setHijos([...hijos, ""])} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold hover:bg-indigo-100 flex items-center gap-1">
                    <Plus size={14}/> Agregar
                  </button>
                </div>
                {hijos.map((hijo, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={hijo} onChange={(e) => handleHijoChange(index, e.target.value)} placeholder="RUT del alumno (Ej: 22.333.444-5)" className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm" />
                    {hijos.length > 1 && (
                      <button type="button" onClick={() => {
                        const newHijos = [...hijos];
                        newHijos.splice(index, 1);
                        setHijos(newHijos);
                      }} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={18}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* UBICACIÓN */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin size={16} className="text-indigo-500"/> Ubicación</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select name="region" value={formData.region} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                  <option value="">Región</option>
                  {regiones.map(r => <option key={r.id || r.regionId} value={r.id || r.regionId}>{r.nombre}</option>)}
                </select>
                <select name="provincia" value={formData.provincia} disabled={!formData.region} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  <option value="">Provincia</option>
                  {provincias.map(p => <option key={p.id || p.provinciaId} value={p.id || p.provinciaId}>{p.nombre}</option>)}
                </select>
                <select name="comuna" value={formData.comuna} disabled={!formData.provincia} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  <option value="">Comuna</option>
                  {comunas.map(c => <option key={c.id || c.comunaId} value={c.id || c.comunaId}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* PASSWORD Y VALIDACIONES */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Contraseña</label>
                  <input name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative space-y-1">
                  <label className="text-xs font-semibold text-gray-500 ml-1">Confirmar</label>
                  <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-gray-400">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Indicadores de Seguridad */}
              <div className="grid grid-cols-2 gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <ValidationItem label="8 caracteres mínimo" valid={passwordValidations.length} />
                <ValidationItem label="Incluye un número" valid={passwordValidations.number} />
                <ValidationItem label="Una Mayúscula" valid={passwordValidations.upper} />
                <ValidationItem label="Carácter especial" valid={passwordValidations.special} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {loading ? "Procesando..." : "Crear Cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ValidationItem({ label, valid }: { label: string, valid: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {valid ? <CheckCircle2 size={14} className="text-green-500" /> : <Circle size={14} className="text-gray-300" />}
      <span className={`text-[11px] ${valid ? 'text-green-700 font-bold' : 'text-gray-500'}`}>{label}</span>
    </div>
  )
}