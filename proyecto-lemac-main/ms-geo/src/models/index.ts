import Region from './region.model';
import Provincia from './provincia.model';
import Comuna from './comuna.model';

// Definición de Relaciones

// 1. Region tiene muchas Provincias
Region.hasMany(Provincia, { foreignKey: 'regionId', as: 'provincias' });
Provincia.belongsTo(Region, { foreignKey: 'regionId', as: 'region' });

// 2. Provincia tiene muchas Comunas
Provincia.hasMany(Comuna, { foreignKey: 'provinciaId', as: 'comunas' });
Comuna.belongsTo(Provincia, { foreignKey: 'provinciaId', as: 'provincia' });

export { Region, Provincia, Comuna };
