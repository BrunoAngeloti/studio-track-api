"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    dialect: 'postgres',
    url: process.env.DATABASE_URL,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        timestamps: true,
        underscored: true,
    },
};
exports.default = config;
