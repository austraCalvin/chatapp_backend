"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isJSONString(param) {
    try {
        JSON.parse(param);
        return true;
    }
    catch (err) {
        return false;
    }
    ;
}
;
exports.default = isJSONString;
