"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Studio = void 0;
const sequelize_1 = require("sequelize");
const Category_1 = require("./Category");
class Studio extends sequelize_1.Model {
    static initModel(sequelize) {
        return Studio.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            created_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
            updated_at: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW,
            },
        }, {
            sequelize,
            tableName: 'studios',
            modelName: 'Studio',
            timestamps: true,
            underscored: true, // <-- isso alinha created_at/updated_at
        });
    }
    static associate() {
        Studio.hasMany(Category_1.Category, {
            foreignKey: 'studio_id',
            as: 'categories',
        });
    }
}
exports.Studio = Studio;
