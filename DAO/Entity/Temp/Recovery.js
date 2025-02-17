"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recovery = void 0;
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
class Recovery {
    constructor({ id, userEmail, ttl, code, type }) {
        this.id = id;
        this.userEmail = userEmail;
        this.type = type;
        this.ttl = ttl;
        this.code = code;
    }
    ;
}
exports.Recovery = Recovery;
;
class RecoveryFactory {
    constructor() { }
    ;
    static async find(param) {
        const elementFound = await Config_1.default.collection("recoveries").getMany(param).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.default.collection("recoveries").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postOne(param) {
        const isValid = JoiSchema_1.recoveryJoiSchema.tailor("post").validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from RecoveryFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const registrationTTL = new Date(Date.now() + 2 * 60 * 1000), registrationCode = Math.round(Math.random() * 100000000);
        const postedElement = await Config_1.default.collection("recoveries").postOne({ "id": (0, useId_1.default)().split("-").join(""), ...isValid.value, "ttl": registrationTTL, "code": registrationCode }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
    static async patchOne(id, code) {
        const updatedElement = await Config_1.default.collection("recoveries").patchOne({ id }, { code }).catch((err) => {
            console.log(err);
        });
        if (!updatedElement) {
            return Promise.reject(`Error from RecoveryFactory class at patchOne - rejected`);
        }
        ;
        return Promise.resolve(updatedElement);
    }
    ;
    static async deleteOne(id) {
        const acknowledged = await Config_1.default.collection("recoveries").deleteOne(id).catch((err) => {
            console.log(err);
        });
        if (!acknowledged) {
            return Promise.reject(`Error from RecoveryFactory class at deleteOne - rejected`);
        }
        ;
        return Promise.resolve(acknowledged);
    }
    ;
}
;
exports.default = RecoveryFactory;
