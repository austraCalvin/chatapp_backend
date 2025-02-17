"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isObject_1 = __importDefault(require("./isObject"));
function getFilterQueryForMany(model) {
    const filterQuery = {};
    for (const prop in model) {
        const currentValue = model[prop];
        if ((0, isObject_1.default)(currentValue) === 2) {
            filterQuery[prop] = { "$in": currentValue };
        }
        ;
        filterQuery[prop] = currentValue;
    }
    ;
    return filterQuery;
}
;
exports.default = getFilterQueryForMany;
