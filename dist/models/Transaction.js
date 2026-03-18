"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const sequelize_1 = require("sequelize");
const Studio_1 = require("./Studio");
const Category_1 = require("./Category");
const Customer_1 = require("./Customer");
const Employee_1 = require("./Employee");
class Transaction extends sequelize_1.Model {
    static initModel(sequelize) {
        return Transaction.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            studio_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            type: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                validate: {
                    isIn: [['INCOME', 'EXPENSE']],
                },
            },
            amount: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            date: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            category_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            customer_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            responsible_employee_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            repasse_employee_id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            repasse_percentage: {
                type: sequelize_1.DataTypes.DECIMAL(5, 2),
                allowNull: true,
            },
            payment_method: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            note: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            vendor: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'transactions',
            modelName: 'Transaction',
            timestamps: true,
            underscored: true,
        });
    }
    static associate() {
        Transaction.belongsTo(Studio_1.Studio, {
            foreignKey: 'studio_id',
            as: 'studio',
        });
        Transaction.belongsTo(Category_1.Category, {
            foreignKey: 'category_id',
            as: 'category',
        });
        Transaction.belongsTo(Customer_1.Customer, {
            foreignKey: 'customer_id',
            as: 'customer',
        });
        Transaction.belongsTo(Employee_1.Employee, {
            foreignKey: 'responsible_employee_id',
            as: 'responsible_employee',
        });
        Transaction.belongsTo(Employee_1.Employee, {
            foreignKey: 'repasse_employee_id',
            as: 'repasse_employee',
        });
    }
}
exports.Transaction = Transaction;
