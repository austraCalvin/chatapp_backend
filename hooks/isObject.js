"use strict";
/**
 * Object types
 *
 * - invalid = 0
 * - object = 1
 * - array = 2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypes = void 0;
var ObjectTypes;
(function (ObjectTypes) {
    ObjectTypes[ObjectTypes["invalid"] = 0] = "invalid";
    ObjectTypes[ObjectTypes["object"] = 1] = "object";
    ObjectTypes[ObjectTypes["array"] = 2] = "array";
})(ObjectTypes || (exports.ObjectTypes = ObjectTypes = {}));
;
function isObject(param) {
    if (Object.prototype.toString.call(param) === "[object Object]") {
        return 1;
    }
    ;
    if (Object.prototype.toString.call(param) === "[object Array]") {
        return 2;
    }
    ;
    return 0;
}
;
exports.default = isObject;
