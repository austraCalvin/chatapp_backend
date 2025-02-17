"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class UserMongoDB extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const userSchema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "name": { "type": String, "required": false },
            "username": { "type": String, "required": true },
            "description": { "type": String, "required": false },
            "password": { "type": String, "required": true },
            "email": { "type": String, "required": true },
            "created": { "type": String, "required": true },
            "lastOnline": { "type": String, "required": true },
            "configId": { "type": String, "required": false }
        });
        this.errorOrigin = "Error from User Mongoose instance";
        this.collection = this.connection.model("user", userSchema, "users");
    }
    ;
}
;
exports.default = UserMongoDB;
