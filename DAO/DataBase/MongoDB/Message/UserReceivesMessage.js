"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class UserReceivesMessageMongoDB extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const sendSchema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "userId": { "type": String, "required": true },
            // "messageId": { "type": String, "required": true },
            // "senderId": { "type": String, "required": true },
            "sendId": { "type": String, "required": true },
            "date": { "type": String, "required": false },
            "readDate": { "type": String, "required": false },
            "chatType": { "type": String, "required": true },
            "chatId": { "type": String, "required": true },
            "replyType": { "type": String, "required": false },
            "replyId": { "type": String, "required": false }
        });
        this.errorOrigin = "Error from UserReceivesMessage Mongoose instance";
        this.collection = this.connection.model("user_receives_message", sendSchema, "user_receives_messages");
    }
    ;
}
;
exports.default = UserReceivesMessageMongoDB;
