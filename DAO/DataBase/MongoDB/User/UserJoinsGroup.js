"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class UserJoinsGroupModel extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const userSchema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "userId": { "type": String, "required": true },
            "groupId": { "type": String, "required": true },
            "notify": { "type": Boolean, "required": true },
            "read": { "type": Boolean, "required": true },
            "blocked": { "type": Boolean, "required": true },
            "admin": { "type": Boolean, "required": true },
            "date": { "type": String, "required": true }
        });
        this.errorOrigin = "Error from UserJoinsGroup Mongoose instance";
        this.collection = this.connection.model("user_joins_group", userSchema, "user_joins_groups");
    }
    ;
}
;
exports.default = UserJoinsGroupModel;
