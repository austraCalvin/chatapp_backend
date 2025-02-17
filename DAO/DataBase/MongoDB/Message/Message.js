"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class MessageMongoDB extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const messageSchema = new mongoose_1.default.Schema({
            "id": { type: String, required: true },
            "body": { type: String, required: false, },
            "fileId": { type: String, required: false }
        });
        this.errorOrigin = "Error from Message Mongoose instance";
        this.collection = this.connection.model("message", messageSchema, "messages");
    }
    ;
}
;
exports.default = MessageMongoDB;
