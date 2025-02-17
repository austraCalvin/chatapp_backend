"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class RecoveryMongoDB extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const schema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "userEmail": { "type": String, "required": true },
            "type": { "type": String, "enum": ["email", "username", "password"], "required": true },
            "ttl": { "type": Date, "required": true },
            "code": { "type": Number, "required": true }
        });
        this.errorOrigin = "Error from Recovery Mongoose instance";
        this.collection = this.connection.model("recovery", schema, "recoveries");
    }
    ;
}
;
exports.default = RecoveryMongoDB;
