"use client"
import { useState, useEffect } from "react"
import { 
  GraduationCap, User, Mail, Eye, EyeOff, Users, MapPin, Briefcase, CheckCircle2, Circle 
} from "lucide-react"

interface GeoItem { id: string | number; nombre: string }
interface LetraItem { id: string | number; letra: string }

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hijos, setHijos] = useState<string[]>([""]) 

  const [formData, setFormData] = useState({
    rut: "", nombre: "", email: "", password: "", confirmPassword: "",
    rol: "", region: "", provincia: "", comuna: "", curso: "", letra: ""
  })

  // --- Estados para la Base de Datos ---
  const [regiones, setRegiones] = useState<GeoItem[]>([])
  const [provincias, setProvincias] = useState<GeoItem[]>([])
  const [comunas, setComunas] = useState<GeoItem[]>([])
  const [letrasDisponibles, setLetrasDisponibles] = useState<LetraItem[]>([])

  const rolesCategorizados = {
    "Personal Institucional": ["Administrador", "Directora", "Unidad Tecnico Pedagogica", "Tesorero Colegio", "Profesor"],
    "Estudiantes": ["Alumno Regular", "Presidente de Centro de Alumnos", "Tesorero Centro Alumnos", "Secretario de Centro de Alumnos", "Presidente Curso Alumnos", "Tesorero de Curso Alumnos", "Secretario de Curso Alumnos"],
    "Apoderados": ["Apoderado Titular", "Presidente Centro Padres", "Tesorero Centro Padres", "Secretario Centro de Apoderados", "Presidente Curso Apoderados", "Tesorero de Curso Apoderados", "Secretario de Curso Apoderados"]
  }

  // --- Lógica de Cascada (Fetch a BD) ---
  useEffect(() => {
    const fetchRegiones = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_MS_GEO_URL || "http://localhost:8081"
        const res = await fetch(`${url}/api/regiones`)
        const data = await res.json()
        setRegiones(data)
      } catch (err) { setRegiones([{ id: 1, nombre: "Región Metropolitana" }]) }
    }
    fetchRegiones()
  }, [])

  useEffect(() => {
    if (!formData.region) { setProvincias([]); setComunas([]); return }
    const fetchProvincias = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_MS_GEO_URL || "http://localhost:8081"
        const res = await fetch(`${url}/api/provincias?region_id=${formData.region}`)
        const data = await res.json()
        setProvincias(data)
      } catch (err) { setProvincias([{ id: 10, nombre: "Provincia de Santiago" }]) }
    }
    fetchProvincias()
  }, [formData.region])

  useEffect(() => {
    if (!formData.provincia) { setComunas([]); return }
    const fetchComunas = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_MS_GEO_URL || "http://localhost:8081"
        const res = await fetch(`${url}/api/comunas?provincia_id=${formData.provincia}`)
        const data = await res.json()
        setComunas(data)
      } catch (err) { setComunas([{ id: 100, nombre: "Maipú" }]) }
    }
    fetchComunas()
  }, [formData.provincia])

  useEffect(() => {
    if (!formData.curso) { setLetrasDisponibles([]); return }
    const fetchLetras = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_MS_ACADEMICO_URL || "http://localhost:8082"
        const res = await fetch(`${url}/api/cursos/${formData.curso}/letras`)
        const data = await res.json()
        setLetrasDisponibles(data)
      } catch (err) { setLetrasDisponibles([{ id: 1, letra: "A" }, { id: 2, letra: "B" }]) }
    }
    fetchLetras()
  }, [formData.curso])

  // --- Validaciones y Handlers ---
  const hasMinLength = formData.password.length >= 8
  const hasUppercase = /[A-Z]/.test(formData.password)
  const hasNumber = /\d/.test(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""
  
  const isPasswordSecure = hasMinLength && hasUppercase && hasNumber && passwordsMatch

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "region") setFormData({ ...formData, region: value, provincia: "", comuna: "" })
    else if (name === "provincia") setFormData({ ...formData, provincia: value, comuna: "" })
    else if (name === "curso") setFormData({ ...formData, curso: value, letra: "" })
    else setFormData({ ...formData, [name]: value })
  }

  const handleHijoChange = (index: number, value: string) => {
    const newHijos = [...hijos]; newHijos[index] = value; setHijos(newHijos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/registro', {
      method: 'POST',
      body: JSON.stringify({ ...formData, hijos })
    });

    if (response.ok) {
      alert("¡Enviado al microservicio con éxito!");
    }
  };

  const esEstudiante = rolesCategorizados["Estudiantes"].includes(formData.rol)

  return (
    <div className="flex min-h-screen bg-plomo">
      <div className="hidden lg:flex w-100 bg-brand p-12 flex-col justify-center text-white shrink-0">
        <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold mb-6 leading-tight">Gestión Escolar Lemac</h1>
        <p className="text-purple-100 text-lg opacity-90">Administración institucional centralizada.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white rounded-4xl shadow-sm border border-gray-100 p-8 my-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Registro de Usuario</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">RUT</label>
                <input name="rut" required placeholder="12.345.678-9" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/20" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Nombre Completo</label>
                <input name="nombre" required placeholder="Ej: Barbara Quezada" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Rol / Cargo</label>
                <select name="rol" required onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/20 text-gray-600">
                  <option value="">Seleccionar cargo...</option>
                  {Object.entries(rolesCategorizados).map(([categoria, lista]) => (
                    <optgroup key={categoria} label={categoria}>
                      {lista.map(r => <option key={r} value={r}>{r}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Email Institucional</label>
                <input name="email" type="email" required placeholder="correo@lemac.cl" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Contraseña</label>
                <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400">
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Confirmar</label>
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required placeholder="••••••••" onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/20" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-gray-400">
                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-purple-50/50 p-3 rounded-xl flex justify-between text-[10px] uppercase tracking-wider font-bold border border-purple-100">
               <div className={`flex items-center gap-1 ${hasMinLength ? 'text-brand' : 'text-gray-400'}`}>
                 {hasMinLength ? <CheckCircle2 size={12}/> : <Circle size={12}/>} 8+ Caracteres
               </div>
               <div className={`flex items-center gap-1 ${hasUppercase ? 'text-brand' : 'text-gray-400'}`}>
                 {hasUppercase ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Mayúscula
               </div>
               <div className={`flex items-center gap-1 ${hasNumber ? 'text-brand' : 'text-gray-400'}`}>
                 {hasNumber ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Número
               </div>
               <div className={`flex items-center gap-1 ${passwordsMatch ? 'text-brand' : 'text-gray-400'}`}>
                 {passwordsMatch ? <CheckCircle2 size={12}/> : <Circle size={12}/>} Coinciden
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin size={16}/> Residencia</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select name="region" value={formData.region} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20">
                  <option value="">1. Región</option>
                  {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <select name="provincia" value={formData.provincia} disabled={!formData.region} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-50 outline-none">
                  <option value="">2. Provincia</option>
                  {provincias.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <select name="comuna" value={formData.comuna} disabled={!formData.provincia} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-50 outline-none">
                  <option value="">3. Comuna</option>
                  {comunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            {esEstudiante && (
              <div className="space-y-4 pt-2">
                 <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><GraduationCap size={16}/> Asignación Académica</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="curso" value={formData.curso} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20">
                    <option value="">Seleccionar curso...</option>
                    <optgroup label="Básica">
                      {[1,2,3,4,5,6,7,8].map(n => <option key={`b-${n}`} value={`B${n}`}>{n}° Básico</option>)}
                    </optgroup>
                    <optgroup label="Media">
                      {[1,2,3,4].map(n => <option key={`m-${n}`} value={`M${n}`}>{n}° Medio</option>)}
                    </optgroup>
                  </select>
                  <select name="letra" value={formData.letra} disabled={!formData.curso} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm disabled:opacity-50 outline-none">
                    <option value="">Seleccionar letra...</option>
                    {letrasDisponibles.map(l => <option key={l.id} value={l.letra}>{l.letra}</option>)}
                  </select>
                </div>
              </div>
            )}

            {formData.rol === "Apoderado Titular" && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand flex items-center gap-2 uppercase tracking-wider"><Users size={16}/> RUT de Hijos a Cargo</label>
                  <button type="button" onClick={() => setHijos([...hijos, ""])} className="text-[10px] bg-brand text-white px-2 py-1 rounded-lg uppercase tracking-widest">+ Añadir</button>
                </div>
                {hijos.map((hijo, i) => (
                  <input key={i} placeholder="Ej: 22.333.444-5" value={hijo} onChange={(e) => handleHijoChange(i, e.target.value)} className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm outline-none" />
                ))}
              </div>
            )}

            <button 
              disabled={!isPasswordSecure}
              className="w-full py-4 rounded-2xl font-bold bg-brand text-white hover:bg-brand-dark transition-all shadow-lg shadow-purple-200 disabled:bg-gray-300 disabled:shadow-none mt-4"
            >
              Registrar Usuario en Lemac
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}