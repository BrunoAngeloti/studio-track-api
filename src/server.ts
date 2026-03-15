import express from 'express';
import { Sequelize } from 'sequelize';
import config from './config/database.js';
import dotenv from 'dotenv';
import cors from "cors"

import studioRoutes from './routes/studioRoutes.ts';
import categoryRoutes from './routes/categoriesRoutes.ts';
import transactionsRoutes from './routes/transactionsRoutes.ts';
import dashboardRoutes from './routes/dashboardRoutes.ts';
import customersRoutes from './routes/customerRoutes.ts';
import employeesRoutes from './routes/employeesRoutes.ts';

import { Studio } from './models/Studio.ts';
import { Category } from './models/Category.ts';
import { Transaction } from './models/Transaction.ts';
import { Customer } from './models/Customer.ts';
import { Employee } from './models/Employee.ts';


dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));
app.use(express.json());

const sequelize = new Sequelize(config as any);

Studio.initModel(sequelize);
Category.initModel(sequelize);
Transaction.initModel(sequelize);
Customer.initModel(sequelize);
Employee.initModel(sequelize);

Studio.associate();
Category.associate();
Transaction.associate();
Customer.associate();
Employee.associate();


app.use('/api', studioRoutes);
app.use('/api', categoryRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', customersRoutes);
app.use('/api', employeesRoutes);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err: any) => {
  console.error('Error syncing database:', err);
});

