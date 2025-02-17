"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = require("../Model");
class UserReceivesMessageModel extends Model_1.SessionEntityTemplate {
    constructor() {
        super();
        this.elements = [];
        this.errorOrigin = "Error from UserReceivesMessage Session instance";
    }
    ;
}
;
exports.default = UserReceivesMessageModel;
