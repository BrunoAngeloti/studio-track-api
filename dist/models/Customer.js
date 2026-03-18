"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const sequelize_1 = require("sequelize");
const Studio_1 = require("./Studio");
const Transaction_1 = require("./Transaction");
class Customer extends sequelize_1.Model {
    static initModel(sequelize) {
        return Customer.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            studio_id: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            archived: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        }, {
            sequelize,
            tableName: 'customers',
            modelName: 'Customer',
            timestamps: true,
            underscored: true,
        });
    }
    static associate() {
        Customer.belongsTo(Studio_1.Studio, {
            foreignKey: 'studio_id',
            as: 'studio',
        });
        Customer.hasMany(Transaction_1.Transaction, {
            foreignKey: 'customer_id',
            as: 'transactions',
        });
    }
}
exports.Customer = Customer;
