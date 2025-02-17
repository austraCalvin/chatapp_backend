"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class UserSendsMessageMongoDB extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const sendSchema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "userId": { "type": String, "required": true },
            "messageId": { "type": String, "required": true },
            "date": { "type": String, "required": true },
            "chatType": { "type": String, "required": true },
            "chatId": { "type": String, "required": true },
            "deliveredDate": { "type": String, "required": false },
            "readDate": { "type": String, "required": false },
            "replyType": { "type": String, "required": false },
            "replyId": { "type": String, "required": false }
        });
        this.errorOrigin = "Error from UserSendsMessage Mongoose instance";
        this.collection = this.connection.model("user_sends_message", sendSchema, "user_sends_messages");
    }
    ;
}
;
exports.default = UserSendsMessageMongoDB;
