"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isObject_1 = __importDefault(require("./isObject"));
function filterProps(value, propsIn) {
    const valueChecked = (0, isObject_1.default)(value);
    const propsInChecked = (0, isObject_1.default)(propsIn);
    if (valueChecked !== 1) {
        throw new TypeError("Error in filterProps function - value param is not valid JSON object");
    }
    ;
    // if (propsInChecked !== 2) {
    //     throw new TypeError("Error in filterProps function - propsIn param is not valid JSON array");
    // };
    const selectedProps = JSON.stringify(value, propsIn), filteredObject = JSON.parse(selectedProps);
    return filteredObject;
}
;
// const result = filterProps<IUser>({ "id": "ab", "username": "sdf", "password": "asd", "email": "dfgdfg", "created": new Date(), "lastOnline": new Date() }, ["id"]);
// console.log("result:", result);
exports.default = filterProps;
