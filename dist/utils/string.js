"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = void 0;
const getQueryString = (value) => {
    if (!value)
        return undefined;
    if (Array.isArray(value))
        return String(value[0]);
    if (typeof value === 'string')
        return value;
    return undefined;
};
const parseDate = (value) => {
    const str = getQueryString(value);
    if (!str)
        return undefined;
    const date = new Date(str);
    return isNaN(date.getTime()) ? undefined : date;
};
exports.parseDate = parseDate;
