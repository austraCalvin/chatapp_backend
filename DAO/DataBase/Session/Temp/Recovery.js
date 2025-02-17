"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = require("../Model");
class RecoverySession extends Model_1.SessionEntityTemplate {
    constructor() {
        super();
        this.elements = [];
        this.errorOrigin = "Error from Recovery Session instance";
    }
    ;
}
;
exports.default = RecoverySession;
