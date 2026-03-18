"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const studioRoutes_1 = __importDefault(require("./routes/studioRoutes"));
const categoriesRoutes_1 = __importDefault(require("./routes/categoriesRoutes"));
const transactionsRoutes_1 = __importDefault(require("./routes/transactionsRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const employeesRoutes_1 = __importDefault(require("./routes/employeesRoutes"));
const Studio_1 = require("./models/Studio");
const Category_1 = require("./models/Category");
const Transaction_1 = require("./models/Transaction");
const Customer_1 = require("./models/Customer");
const Employee_1 = require("./models/Employee");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true
}));
app.use(express_1.default.json());
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
Studio_1.Studio.initModel(sequelize);
Category_1.Category.initModel(sequelize);
Transaction_1.Transaction.initModel(sequelize);
Customer_1.Customer.initModel(sequelize);
Employee_1.Employee.initModel(sequelize);
Studio_1.Studio.associate();
Category_1.Category.associate();
Transaction_1.Transaction.associate();
Customer_1.Customer.associate();
Employee_1.Employee.associate();
app.use('/api', studioRoutes_1.default);
app.use('/api', categoriesRoutes_1.default);
app.use('/api', transactionsRoutes_1.default);
app.use('/api', dashboardRoutes_1.default);
app.use('/api', customerRoutes_1.default);
app.use('/api', employeesRoutes_1.default);
app.get("/health", (req, res) => {
    res.status(200).send("ok");
});
sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch((err) => {
    console.error('Error syncing database:', err);
});
