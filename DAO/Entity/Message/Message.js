"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
const File_1 = __importDefault(require("./File"));
class MessageFactory {
    constructor() { }
    ;
    static async find(id) {
        const isValid = joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1).validate(id, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from MessageFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.default.collection("messages").getMany({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from MessageFactory class at find - rejected`);
        }
        ;
        return Promise.resolve(elementFound ? elementFound : []);
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.default.collection("messages").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from MessageFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postOne(message) {
        const tailoredSchema = JoiSchema_1.messageJoiSchema.tailor("post");
        const isValid = tailoredSchema.validate(message, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from MessageFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        if (message.file) {
            const fileAttached = await File_1.default.postOne(message.file).catch((err) => {
                console.log(err);
            });
            if (!fileAttached) {
                return Promise.reject(`Error from MessageFactory class at postOne - rejected`);
            }
            ;
            const postedFileAttached = await Config_1.default.collection("messages").postOne({ "id": (0, useId_1.default)(), "body": isValid.value.body, "fileId": fileAttached.id }).catch((err) => {
                console.log(err);
            });
            if (!postedFileAttached) {
                return Promise.reject(`Error from MessageFactory class at postOne - rejected`);
            }
            ;
            return Promise.resolve(postedFileAttached);
        }
        ;
        const postedPlainText = await Config_1.default.collection("messages").postOne({ "id": (0, useId_1.default)(), "body": message.body }).catch((err) => {
            console.log(err);
        });
        if (!postedPlainText) {
            return Promise.reject(`Error from MessageFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedPlainText);
    }
    ;
}
;
//{"content": new Buffer("aa"), "ext": "", "name": "", "size": 1, "type": ""}
// MessageFactory.create({"body": undefined, "file": {"content": new Buffer("aa"), "ext": "", "name": "", "size": 1, "type": ""}}, ModelFactory.dataBase("mongodb").collection("messages"));
exports.default = MessageFactory;
