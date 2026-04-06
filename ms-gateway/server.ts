import dotenv from 'dotenv';
import app from './app';
import { logger } from './src/utils/logger';

dotenv.config();

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  logger.info(`ms-gateway running on port ${port}`);
  console.log(`ms-gateway running on port ${port}`);
});
