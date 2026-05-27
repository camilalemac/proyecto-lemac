
import { z } from "zod";
import { validarRut } from "./utils";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const registroSchema = z.odObject({
  rol: z.enum(["FAM_ALU", "FAM_APO"], {
    errorMap: () => ({ message: "Debe seleccionar un rol válido (Alumno o Apoderado)" }),
  }),
  rut: z.string()
    .min(1, "El RUT es obligatorio")
    .refine((val) => validarRut(val), {
      message: "El RUT ingresado no es válido",
    }),
  nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  email: z.string()
    .min(1, "El correo es obligatorio")
    .email("Formato de correo electrónico inválido"),
  regionId: z.string().min(1, "Debe seleccionar una región"),
  provinciaId: z.string().min(1, "Debe seleccionar una provincia"),
  comunaId: z.string().min(1, "Debe seleccionar una comuna"),
  password: z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(passwordRegex, {
      message: "La contraseña debe incluir al menos una mayúscula, un número y un símbolo",
    }),
  confirmPassword: z.string().min(1, "Debe confirmar su contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type RegistroFormValues = z.infer<typeof registroSchema>;