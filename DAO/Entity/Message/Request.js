"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
class MessageRequestFactory {
    constructor() { }
    ;
    static async find(param) {
        const isValid = joi_1.default.object({
            "contactId": joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1)
        }).validate(param);
        if (isValid.error) {
            return Promise.reject(`Error from MessageRequestFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.default.collection("message-requests").getMany(param).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from MessageRequestFactory class at find - rejected`);
        }
        ;
        return Promise.resolve(elementFound ? elementFound : []);
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.default.collection("message-requests").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from MessageRequestFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findByUserIds(userId, contactId) {
        const elementFound = await Config_1.default.collection("message-requests").getOne({ userId, contactId }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from MessageRequestFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postOne(messageRequest) {
        const tailoredSchema = JoiSchema_1.messageRequestJoiSchema.tailor("post");
        const isValid = tailoredSchema.validate(messageRequest, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from MessageRequestFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const postedElement = await Config_1.default.collection("message-requests").postOne({ "id": (0, useId_1.default)(), ...messageRequest }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject(`Error from MessageRequestFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
    static async deleteOne(id) {
        const deletedElement = await Config_1.default.collection("message-requests").deleteOne(id).catch((err) => {
            console.log(err);
        });
        if (!deletedElement) {
            return Promise.reject(`Error from MessageRequestFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(deletedElement);
    }
    ;
}
;
exports.default = MessageRequestFactory;
