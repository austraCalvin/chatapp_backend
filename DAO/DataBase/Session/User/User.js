"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = require("../Model");
class UserModel extends Model_1.SessionEntityTemplate {
    constructor() {
        super();
        this.elements = [];
        this.errorOrigin = "Error from User Session instance";
    }
    ;
}
;
exports.default = UserModel;
