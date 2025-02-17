"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class GroupModel extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const modelSchema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "description": { "type": String, "required": true },
            "name": { "type": String, "required": true },
            "configurable": { "type": Boolean, "required": true },
            "messages": { "type": Boolean, "required": true },
            "joinable": { "type": Boolean, "required": true },
            "approve": { "type": Boolean, "required": true }
        });
        this.errorOrigin = "Error from Group Mongoose instance";
        this.collection = this.connection.model("group", modelSchema, "groups");
    }
    ;
}
;
exports.default = GroupModel;
