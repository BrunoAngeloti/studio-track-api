import express from 'express';
import { Sequelize } from 'sequelize';
import config from './config/database.js';
import { Studio } from './models/Studio.ts';

import studioRoutes from './routes/studioRoutes.ts';

const app = express();
app.use(express.json());

const sequelize = new Sequelize(config as any);

Studio.initModel(sequelize);

app.use('/api', studioRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err: any) => {
  console.error('Error syncing database:', err);
});

