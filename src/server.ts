import express from 'express';
import { Sequelize } from 'sequelize';
import config from './config/database.js';
import dotenv from 'dotenv';
import cors from "cors"

import studioRoutes from './routes/studioRoutes';
import categoryRoutes from './routes/categoriesRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import customersRoutes from './routes/customerRoutes';
import employeesRoutes from './routes/employeesRoutes';

import { Studio } from './models/Studio';
import { Category } from './models/Category';
import { Transaction } from './models/Transaction';
import { Customer } from './models/Customer';
import { Employee } from './models/Employee';


dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

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

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}).catch((err: any) => {
  console.error('Error syncing database:', err);
});

