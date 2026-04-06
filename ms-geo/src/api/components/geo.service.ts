import { Region, Provincia, Comuna } from '../../models';
import { ApiError } from '../../utils/ApiError';

export const getRegiones = async (): Promise<Region[]> => {
  const regiones = await Region.findAll({
    // CORRECCIÓN: Usamos 'regionId' y 'nombre' tal como lo declaraste en tu modelo Region
    attributes: ['regionId', 'nombre', 'abreviatura', 'capital'],
    order: [['regionId', 'ASC']],
  });
  return regiones;
};

export const getProvinciasByRegion = async (idRegion: number): Promise<Provincia[]> => {
  const regionExiste = await Region.findByPk(idRegion);
  if (!regionExiste) {
    throw new ApiError(404, `La región con ID ${idRegion} no existe en el catálogo.`);
  }

  const provincias = await Provincia.findAll({
    where: { regionId: idRegion },
    // CORRECCIÓN PREVENTIVA: En tu BD la columna se llama NOMBRE y PROVINCIA_ID
    attributes: ['provinciaId', 'nombre', 'regionId'],
    order: [['nombre', 'ASC']],
  });
  return provincias;
};

export const getComunasByProvincia = async (idProvincia: number): Promise<Comuna[]> => {
  const provinciaExiste = await Provincia.findByPk(idProvincia);
  if (!provinciaExiste) {
    throw new ApiError(404, `La provincia con ID ${idProvincia} no existe en el catálogo.`);
  }

  const comunas = await Comuna.findAll({
    where: { provinciaId: idProvincia },
    // CORRECCIÓN PREVENTIVA: En tu BD la columna se llama NOMBRE y COMUNA_ID
    attributes: ['comunaId', 'nombre', 'provinciaId'],
    order: [['nombre', 'ASC']],
  });
  return comunas;
};
