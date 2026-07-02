import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Sequelize } from 'sequelize';
import cors from "cors"

import studioRoutes from './routes/studioRoutes';
import categoryRoutes from './routes/categoriesRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import customersRoutes from './routes/customerRoutes';
import employeesRoutes from './routes/employeesRoutes';
import servicesRoutes from './routes/serviceRoutes.js';
import additionalServicesRoutes from './routes/additionalServiceRoutes.js';
import repasseConfigRoutes from './routes/repasseConfigRoutes.js';
import weeklyAvailabilityRoutes from './routes/weeklyAvailabilityRoutes';
import availabilityOverrideRoutes from './routes/availabilityOverrideRoutes';
import appointmentAdditionalServiceRoutes from './routes/appointmentAdditionalServicesRoutes';
import appointmentRoutes from './routes/appointmentsRoutes';
import pushRoutes from './routes/pushRoutes';

import { Studio } from './models/Studio';
import { Category } from './models/Category';
import { Transaction } from './models/Transaction';
import { Customer } from './models/Customer';
import { Employee } from './models/Employee';
import { Service } from './models/Service.js';
import { AdditionalService } from './models/AdditionalService.js';
import { RepasseConfig } from './models/RepasseConfig';
import { WeeklyAvailability } from './models/WeeklyAvailability';
import { AvailabilityOverride } from './models/AvailabilityOverride';
import { AppointmentAdditionalService } from './models/AppointmentAdditionalService';
import { Appointment } from './models/Appointment';
import { PushSubscription } from './models/PushSubscription';

const app = express();

const defaultOrigins = [
  "https://studio-track.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : defaultOrigins;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const isLocalDatabase = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  dialectOptions: isLocalDatabase ? {} : {
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
Service.initModel(sequelize);
AdditionalService.initModel(sequelize);
RepasseConfig.initModel(sequelize);
WeeklyAvailability.initModel(sequelize) 
AvailabilityOverride.initModel(sequelize) 
AppointmentAdditionalService.initModel(sequelize) 
Appointment.initModel(sequelize)
PushSubscription.initModel(sequelize)

Studio.associate();
Category.associate();
Transaction.associate();
Customer.associate();
Employee.associate();
Service.associate();
AdditionalService.associate();
RepasseConfig.associate();
WeeklyAvailability.associate();
AvailabilityOverride.associate();
Appointment.associate();
PushSubscription.associate();


app.use('/api', studioRoutes);
app.use('/api', categoryRoutes);
app.use('/api', transactionsRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', customersRoutes);
app.use('/api', employeesRoutes);
app.use('/api', servicesRoutes);
app.use('/api', additionalServicesRoutes);
app.use('/api', repasseConfigRoutes);
app.use('/api', weeklyAvailabilityRoutes);
app.use('/api', availabilityOverrideRoutes);
app.use('/api', appointmentAdditionalServiceRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', pushRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err: any) => {
  console.error('Error syncing database:', err);
});

