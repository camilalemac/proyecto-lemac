import { Router } from 'express';
import * as geoController from './geo.controller';
import * as geoValidation from './geo.validation';

const router = Router();

// Rutas PÚBLICAS para el formulario de Login/Registro
router.get('/regiones', geoController.getRegiones);

router.get(
  '/provincias/:idRegion',
  geoValidation.validateGetProvincias,
  geoController.getProvincias,
);

router.get('/comunas/:idProvincia', geoValidation.validateGetComunas, geoController.getComunas);

export default router;
