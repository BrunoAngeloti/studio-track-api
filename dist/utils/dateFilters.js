"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateRangeByPeriod = void 0;
const date_fns_1 = require("date-fns");
// 🔥 função chave: converte local → UTC corretamente
const toUTC = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};
const getDateRangeByPeriod = (period) => {
    const now = new Date();
    let startLocal;
    let endLocal;
    switch (period) {
        case 'daily':
            startLocal = (0, date_fns_1.startOfDay)(now);
            endLocal = (0, date_fns_1.endOfDay)(now);
            break;
        case 'weekly':
            startLocal = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 });
            endLocal = (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 1 });
            break;
        case 'monthly':
            startLocal = (0, date_fns_1.startOfMonth)(now);
            endLocal = (0, date_fns_1.endOfMonth)(now);
            break;
        case 'yearly':
            startLocal = (0, date_fns_1.startOfYear)(now);
            endLocal = (0, date_fns_1.endOfYear)(now);
            break;
        default:
            startLocal = now;
            endLocal = now;
    }
    return {
        startDate: toUTC(startLocal),
        endDate: toUTC(endLocal),
    };
};
exports.getDateRangeByPeriod = getDateRangeByPeriod;
