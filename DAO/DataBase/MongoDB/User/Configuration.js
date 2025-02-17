"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class ConfigurationModel extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const schema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "online": {
                "type": String,
                "enum": ["everyone", "lastOnline"],
                "required": true
            },
            "writing": { "type": Boolean, "required": true },
            "lastOnline": {
                "type": String,
                "enum": ["everyone", "contact", "none"],
                "required": true
            },
            "read": { "type": Boolean, "required": true },
            "approve": {
                "type": String,
                "enum": ["contact", "group", "both", "none"],
                "required": true
            },
            "notify": { "type": Boolean, "required": true },
            "push": { "type": Boolean, "required": true },
            "email": { "type": Boolean, "required": true }
        });
        this.errorOrigin = "Error from Configuration Mongoose instance";
        this.collection = this.connection.model("configuration", schema, "configurations");
    }
    ;
}
;
exports.default = ConfigurationModel;
