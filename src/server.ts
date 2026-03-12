import express from 'express';
import { Sequelize } from 'sequelize';
import config from './config/database.js';


import studioRoutes from './routes/studioRoutes.ts';
import categoryRoutes from './routes/categoriesRoutes.ts';
import transactionsRoutes from './routes/transactionsRoutes.ts';
import repassesRoutes from './routes/repassesRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';

import { Studio } from './models/Studio.ts';
import { Category } from './models/Category.ts';
import { Transaction } from './models/Transaction.ts';
import { Repasse } from './models/Repasse.ts';


const app = express();
app.use(express.json());

const sequelize = new Sequelize(config as any);

Studio.initModel(sequelize);
Category.initModel(sequelize);
Transaction.initModel(sequelize);
Repasse.initModel(sequelize);

Studio.associate();
Category.associate();
Transaction.associate();
Repasse.associate();


app.use('/api', studioRoutes);
app.use('/api', categoryRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', repassesRoutes);
app.use('/api', dashboardRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err: any) => {
  console.error('Error syncing database:', err);
});

