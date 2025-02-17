"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = require("../../DataBase/Config");
class FileFactory {
    constructor() { }
    ;
    static async findById(id) {
        const elementFound = await Config_1.SessionStorageDB.collection("files-content").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from FileFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postOne(param) {
        const isValid = JoiSchema_1.fileJoiSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error in MessageFactory class - joi validation ${isValid.error.details[0].message}`);
        }
        ;
        const postedElement = await Config_1.SessionStorageDB.collection("files-content").postOne({ "id": (0, useId_1.default)(), ...isValid.value }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject(`Error from FileFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
}
;
exports.default = FileFactory;
