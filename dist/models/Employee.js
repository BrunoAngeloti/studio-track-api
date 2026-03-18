"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Employee = void 0;
const sequelize_1 = require("sequelize");
const Studio_1 = require("./Studio");
class Employee extends sequelize_1.Model {
    static initModel(sequelize) {
        return Employee.init({
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
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            active: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        }, {
            sequelize,
            tableName: 'employees',
            modelName: 'Employee',
            timestamps: true,
            underscored: true,
        });
    }
    static associate() {
        Employee.belongsTo(Studio_1.Studio, {
            foreignKey: 'studio_id',
            as: 'studio',
        });
    }
}
exports.Employee = Employee;
