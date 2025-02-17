"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = require("../Model");
class FileModel extends Model_1.MongoDBEntityTemplate {
    constructor() {
        super();
        const messageSchema = new mongoose_1.default.Schema({
            "id": { "type": String, "required": true },
            "name": { "type": String, "required": true },
            "type": { "type": String, "required": true },
            "ext": { "type": String, "required": true },
            "size": { "type": Number, "required": true },
        });
        this.errorOrigin = "Error from File Mongoose instance";
        this.collection = this.connection.model("file", messageSchema, "files");
    }
    ;
}
;
exports.default = FileModel;
