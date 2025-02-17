"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isJSONString_1 = __importDefault(require("./isJSONString"));
/**
 *
 * The function checks if `string` is a valid JavaScript Object Notation (JSON) string, if so, converts `string` into an object or array and if not, returns null.
 *
 * @param string The string to convert.
 * @returns The JSON string converted into an object or null.
 */
function JSONParse(string) {
    if ((0, isJSONString_1.default)(string)) {
        return JSON.parse(string);
    }
    ;
    return null;
}
;
exports.default = JSONParse;
