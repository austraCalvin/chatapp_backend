"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class MessageRequestMongoDB extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const messageRequestSchema = new mongoose_1.default.Schema({
            "id": { type: String, required: true },
            "userId": { type: String, required: true },
            "messageId": { type: String, required: true },
            "contactId": { type: String, required: true }
        });
        this.errorOrigin = "Error from MessageRequest Mongoose instance";
        this.collection = this.connection.model("message_request", messageRequestSchema, "message_requests");
    }
    ;
}
;
exports.default = MessageRequestMongoDB;
