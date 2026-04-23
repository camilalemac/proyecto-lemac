import { fetchClient } from "./apiConfig";
import { 
  ICurso, 
  ICursoPayload, 
  IPeriodo, 
  IPeriodoPayload, 
  IPupilo 
} from "../types/admin.types";

export const academicoService = {
  // ==========================================
  // FUNCIONES PARA CURSOS (ADMIN)
  // ==========================================
  
  // 1. Obtener todos los cursos
  getCursos: async (): Promise<ICurso[]> => {
    try {
      const response = await fetchClient("/academico/cursos");
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Error obteniendo cursos:", error);
      throw error;
    }
  },

  // 2. Crear un curso
  createCurso: async (payload: ICursoPayload): Promise<any> => {
    const response = await fetchClient("/academico/cursos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  },

  // 3. Editar un curso
  updateCurso: async (cursoId: number, payload: ICursoPayload): Promise<any> => {
    const response = await fetchClient(`/academico/cursos/${cursoId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response;
  },

  // 4. Eliminar un curso
  deleteCurso: async (cursoId: number): Promise<any> => {
    const response = await fetchClient(`/academico/cursos/${cursoId}`, {
      method: "DELETE",
    });
    return response;
  },

  // ==========================================
  // FUNCIONES PARA PERIODOS ACADÉMICOS (ADMIN)
  // ==========================================
  
  // 5. Obtener todos los periodos
  getPeriodos: async (): Promise<IPeriodo[]> => {
    try {
      const response = await fetchClient("/academico/periodos");
      return Array.isArray(response) ? response : (response.data || []);
    } catch (error) {
      console.error("Error obteniendo periodos:", error);
      throw error;
    }
  },

  // 6. Crear un periodo
  createPeriodo: async (payload: IPeriodoPayload): Promise<any> => {
    const response = await fetchClient("/academico/periodos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response;
  },

  // ==========================================
  // FUNCIONES PARA EL PORTAL APODERADO
  // ==========================================

  // 7. Obtener los hijos asociados al apoderado logueado
  getMisHijos: async (): Promise<IPupilo[]> => {
    try {
      const response = await fetchClient("/academico/familias/mis-hijos");
      if (!response.success) {
        throw new Error(response.message || "Error al cargar pupilos");
      }
      return response.data || [];
    } catch (error) {
      console.error("Error en getMisHijos:", error);
      throw error;
    }
  }
};