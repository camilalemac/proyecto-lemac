"use client"
import { useState, useEffect } from "react"
import { 
  GraduationCap, Eye, EyeOff, Check, X, Plus, AlertCircle, CheckCircle2 
} from "lucide-react"

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const GATEWAY_URL = "http://127.0.0.1:3007/api/v1"; 

  const [formData, setFormData] = useState({
    rut: "", nombre: "", email: "", password: "", confirmarPassword: "",
    rol: "", region: "", provincia: "", comuna: "", colegioId: 1 
  })

  const [rutValido, setRutValido] = useState<boolean | null>(null)
  const [hijos, setHijos] = useState<{rut: string, valido: boolean | null}[]>([{rut: "", valido: null}])
  const [regiones, setRegiones] = useState([])
  const [provincias, setProvincias] = useState([])
  const [comunas, setComunas] = useState([])

  const formatRut = (value: string) => {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9); 
    if (clean.length === 0) return "";
    if (clean.length <= 1) return clean;
    let body = clean.slice(0, -1);
    let dv = clean.slice(-1);
    body = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${body}-${dv}`;
  };

  const isValidRut = (rutFormateado: string) => {
    let clean = rutFormateado.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length < 8) return false;
    let body = clean.slice(0, -1);
    let dv = clean.slice(-1);
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    let expectedDv = 11 - (sum % 11);
    let finalDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
    return finalDv === dv;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setFormData({...formData, rut: formatted});
    if (formatted.length > 8) {
      setRutValido(isValidRut(formatted));
    } else {
      setRutValido(null);
    }
  };

  const handleHijoChange = (index: number, val: string) => {
    const formatted = formatRut(val);
    const newHijos = [...hijos];
    newHijos[index] = { 
      rut: formatted, 
      valido: formatted.length > 8 ? isValidRut(formatted) : null 
    };
    setHijos(newHijos);
  };

  const addHijo = () => setHijos([...hijos, {rut: "", valido: null}]);

  const passwordValidations = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }
  const esPasswordValida = Object.values(passwordValidations).every(Boolean);
  const contraseñasCoinciden = formData.password === formData.confirmarPassword && formData.password !== "";

  useEffect(() => {
    fetch(`${GATEWAY_URL}/geo/regiones`)
      .then(res => res.json())
      .then(j => {
        const dataArray = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : (Array.isArray(j?.data?.data) ? j.data.data : []));
        setRegiones(dataArray);
      })
      .catch(e => console.error("Error en regiones:", e));
  }, [])

  useEffect(() => {
    if (formData.region) {
      fetch(`${GATEWAY_URL}/geo/provincias/${formData.region}`)
        .then(res => res.json())
        .then(j => {
          const dataArray = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : (Array.isArray(j?.data?.data) ? j.data.data : []));
          setProvincias(dataArray);
        });
    }
  }, [formData.region])

  useEffect(() => {
    if (formData.provincia) {
      fetch(`${GATEWAY_URL}/geo/comunas/${formData.provincia}`)
        .then(res => res.json())
        .then(j => {
          const dataArray = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : (Array.isArray(j?.data?.data) ? j.data.data : []));
          setComunas(dataArray);
        });
    }
  }, [formData.provincia])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!esPasswordValida) return alert("Contraseña no cumple requisitos");
    if (!contraseñasCoinciden) return alert("Las contraseñas no coinciden");
    if (!rutValido) return alert("Por favor, ingresa un RUT válido");
    if (!formData.email) return alert("El email es obligatorio");

    const nombreLimpio = formData.nombre.trim();
    const partesNombre = nombreLimpio.split(/\s+/);

    if (partesNombre.length < 2) {
      return alert("Debes ingresar nombre y apellido para el registro académico.");
    }

    setLoading(true);
    const rutLimpio = formData.rut.replace(/[^0-9kK]/g, '');
    const rutCuerpo = rutLimpio.slice(0, -1);
    const rutDv = rutLimpio.slice(-1);
    const nombres = partesNombre[0];
    const apellidos = partesNombre.slice(1).join(" ");

    const payload = {
      colegioId: Number(formData.colegioId) || 1,
      rutCuerpo: rutCuerpo,
      rutDv: rutDv,
      nombres: nombres,
      apellidos: apellidos,
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      role: formData.rol === "Estudiante" ? "ALU" : "FAM_APO"
    };

    try {
      const res = await fetch(`${GATEWAY_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        window.location.href = "/login";
      } else {
        const errorMsg = data.errors ? data.errors.map((e: any) => e.msg).join(", ") : data.message;
        alert("Error: " + (errorMsg || "Datos inválidos"));
      }
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans">
      {/* SIDEBAR CAMBIADO A AZUL MARINO (#1A1A2E) */}
      <div className="hidden lg:flex w-1/4 bg-[#1A1A2E] p-10 flex-col text-white justify-between shadow-xl">
        <div>
          <div className="bg-[#FF8FAB]/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-[#FF8FAB]/30">
            <GraduationCap size={32} className="text-[#FF8FAB]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">EduPago Lemac</h1>
          <p className="text-slate-400 mt-3 text-sm leading-relaxed">
            Plataforma centralizada para la gestión académica y financiera.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#FF8FAB] font-bold">
          Proyecto de Lemac 2026
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto flex items-center">
        <div className="max-w-3xl mx-auto w-full bg-white rounded-[2.5rem] shadow-2xl p-10 lg:p-12 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <header className="mb-2">
              <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Crear cuenta</h2>
              <p className="text-gray-400 text-sm mt-1">Completa tus datos para comenzar</p>
            </header>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-wider">Tipo de Cuenta</label>
              <select 
                required
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value})} 
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8FAB] focus:bg-[#FF8FAB]/5 rounded-2xl text-sm font-medium outline-none transition-all appearance-none cursor-pointer text-[#1A1A2E]"
              >
                <option value="" disabled>Selecciona tu rol en la plataforma...</option>
                <option value="Estudiante"> Alumno / Estudiante</option>
                <option value="Apoderado"> Apoderado / Familia</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-wider">Correo Electrónico</label>
              <input type="email" placeholder="ejemplo@correo.cl" required 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8FAB] focus:bg-white rounded-2xl text-sm outline-none transition-all text-[#1A1A2E]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-wider">RUT</label>
                <div className="relative">
                  <input placeholder="12.345.678-9" required value={formData.rut} maxLength={12}
                    onChange={handleRutChange} 
                    className={`w-full p-4 bg-gray-50 border-2 focus:bg-white rounded-2xl text-sm outline-none transition-all pr-12 text-[#1A1A2E]
                      ${rutValido === true ? 'border-green-400' : rutValido === false ? 'border-red-400' : 'border-transparent focus:border-[#FF8FAB]'}`} />
                  <div className="absolute right-4 top-4">
                    {rutValido === true && <CheckCircle2 className="text-green-500" size={20} />}
                    {rutValido === false && <AlertCircle className="text-red-500" size={20} />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-wider">Nombre Completo</label>
                <input placeholder="Ej: Juan Pérez" required 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8FAB] focus:bg-white rounded-2xl text-sm outline-none transition-all text-[#1A1A2E]" />
              </div>
            </div>

            {formData.rol === "Apoderado" && (
              <div className="p-6 bg-slate-50 rounded-4xl border border-dashed border-[#FF8FAB]/40 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-black text-[#FF8FAB] uppercase tracking-wider block">Hijos a cargo</span>
                    <span className="text-[10px] text-gray-400 font-medium">RUT de los alumnos que representas</span>
                  </div>
                  <button type="button" onClick={addHijo} className="bg-[#FF8FAB] text-white p-2 rounded-xl shadow-md hover:bg-[#FF8FAB]/90 transition-all">
                    <Plus size={20}/>
                  </button>
                </div>
                {hijos.map((h, i) => (
                  <div key={i} className="relative">
                    <input placeholder={`Ej: 20.444.555-K`} required value={h.rut} maxLength={12}
                      className={`w-full p-4 bg-white border-2 rounded-2xl text-sm outline-none transition-all shadow-sm pr-12 text-[#1A1A2E]
                        ${h.valido === true ? 'border-green-400' : h.valido === false ? 'border-red-400' : 'border-slate-200 focus:border-[#FF8FAB]'}`}
                      onChange={(e) => handleHijoChange(i, e.target.value)} />
                    <div className="absolute right-4 top-4">
                      {h.valido === true && <CheckCircle2 className="text-green-500" size={20} />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-wider">Ubicación</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select onChange={(e) => setFormData({...formData, region: e.target.value})} className="p-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none text-[#1A1A2E] cursor-pointer border border-transparent focus:border-[#FF8FAB]">
                  <option value="">Región</option>
                  {Array.isArray(regiones) && regiones.map((r: any) => <option key={r.regionId || r.id} value={r.regionId || r.id}>{r.nombre}</option>)}
                </select>
                <select disabled={!formData.region} onChange={(e) => setFormData({...formData, provincia: e.target.value})} className="p-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none disabled:opacity-40 text-[#1A1A2E] cursor-pointer border border-transparent focus:border-[#FF8FAB]">
                  <option value="">Provincia</option>
                  {Array.isArray(provincias) && provincias.map((p: any) => <option key={p.provinciaId || p.id} value={p.provinciaId || p.id}>{p.nombre}</option>)}
                </select>
                <select disabled={!formData.provincia} onChange={(e) => setFormData({...formData, comuna: e.target.value})} className="p-4 bg-gray-50 rounded-2xl text-sm font-medium outline-none disabled:opacity-40 text-[#1A1A2E] cursor-pointer border border-transparent focus:border-[#FF8FAB]">
                  <option value="">Comuna</option>
                  {Array.isArray(comunas) && comunas.map((c: any) => <option key={c.comunaId || c.id} value={c.comunaId || c.id}>{c.nombre}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-wider">Contraseña</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Contraseña" required 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8FAB] rounded-2xl text-sm outline-none transition-all text-[#1A1A2E]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400 hover:text-[#FF8FAB] transition-colors">
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                  </button>
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Confirmar" required 
                    onChange={(e) => setFormData({...formData, confirmarPassword: e.target.value})} 
                    className={`w-full p-4 bg-gray-50 border-2 rounded-2xl text-sm outline-none transition-all text-[#1A1A2E]
                      ${formData.confirmarPassword === '' ? 'border-transparent focus:border-[#FF8FAB]' : 
                        contraseñasCoinciden ? 'border-green-400 focus:border-green-500' : 'border-red-400 focus:border-red-500'}`} />
                </div>
              </div>

              {/* REQUISITOS EN ROSADO (#FF8FAB) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-2 bg-[#FF8FAB]/5 p-4 rounded-2xl border border-[#FF8FAB]/10">
                <Req label="8+ chars" met={passwordValidations.length} />
                <Req label="Mayúscula" met={passwordValidations.upper} />
                <Req label="Número" met={passwordValidations.number} />
                <Req label="Símbolo" met={passwordValidations.special} />
              </div>
            </div>

            {/* BOTÓN REGISTRO ROSADO (#FF8FAB) */}
            <button type="submit" disabled={loading || !esPasswordValida || !contraseñasCoinciden || !formData.rol || rutValido === false} 
              className={`w-full py-5 mt-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all 
              ${loading || !esPasswordValida || !contraseñasCoinciden || !formData.rol || rutValido === false ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#FF8FAB] hover:bg-[#FF8FAB]/90 hover:-translate-y-1 active:scale-95 shadow-[#FF8FAB]/20'}`}>
              {loading ? "Creando cuenta..." : "Completar Registro"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Req({ label, met }: { label: string, met: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold transition-colors ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <CheckCircle2 size={14} className="text-green-500"/> : <X size={14} className="opacity-50"/>} {label}
    </div>
  )
}