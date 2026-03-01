import express from 'express';
import { Sequelize } from 'sequelize';
import config from './config/database.js';
import { Studio } from './models/Studio.ts';

import studioRoutes from './routes/studioRoutes.ts';
import categoryRoutes from './routes/categoriesRoutes.ts';
import { Category } from './models/Category.ts';

const app = express();
app.use(express.json());

const sequelize = new Sequelize(config as any);

Studio.initModel(sequelize);
Category.initModel(sequelize);

Studio.associate();
Category.associate();

app.use('/api', studioRoutes);
app.use('/api', categoryRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err: any) => {
  console.error('Error syncing database:', err);
});

