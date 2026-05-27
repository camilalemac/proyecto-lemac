import Identity from "./identity.model";
import Role from "./role.model";
import Permission from "./permission.model";
import RolePermission from "./rolePermission.model";
import UserRole from "./userRole.model";

// Las asociaciones se configuran en cada modelo para evitar definiciones duplicadas.
// Aquí solo exportamos modelos.

// Si necesitas reasignar alias globales, hazlo en un único lugar, pero no repetido.

export { Identity, Role, Permission, RolePermission, UserRole };
