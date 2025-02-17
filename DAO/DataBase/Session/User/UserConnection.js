"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model_1 = require("../Model");
class UserConnectionModel extends Model_1.SessionEntityTemplate {
    constructor() {
        console.log("UserConnection class has been created");
        super();
        this.elements = [];
        this.errorOrigin = "Error from UserConnection Session instance";
    }
    ;
}
;
exports.default = UserConnectionModel;
