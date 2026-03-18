"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const sequelize_1 = require("sequelize");
const Studio_1 = require("./Studio");
class Category extends sequelize_1.Model {
    static initModel(sequelize) {
        return Category.init({
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
            color: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'categories',
            modelName: 'Category',
            timestamps: false,
            underscored: true,
        });
    }
    static associate() {
        Category.belongsTo(Studio_1.Studio, {
            foreignKey: 'studio_id',
            as: 'studio',
        });
    }
}
exports.Category = Category;
