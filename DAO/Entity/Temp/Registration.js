"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registration = void 0;
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
class Registration {
    constructor({ id, email, ttl, code }) {
        this.id = id;
        this.email = email;
        this.ttl = ttl;
        this.code = code;
    }
    ;
}
exports.Registration = Registration;
;
class RegistrationFactory {
    constructor() { }
    ;
    static async find(param) {
        const elementFound = await Config_1.default.collection("registrations").getMany(param).catch((err) => {
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
        const elementFound = await Config_1.default.collection("registrations").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findByEmail(email) {
        if (!email) {
            return Promise.reject("Error from RegistrationFactory class at findByEmail - param must have value");
        }
        ;
        const elementFoundByEmail = await Config_1.default.collection("registrations").getOne({ email }).catch((err) => {
            console.log(err);
        });
        if (elementFoundByEmail === undefined) {
            return Promise.reject();
        }
        ;
        if (elementFoundByEmail === null) {
            return null;
        }
        ;
        return !!elementFoundByEmail;
    }
    ;
    static async postOne(param) {
        const isValid = JoiSchema_1.registrationJoiSchema.tailor("post").validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from RegistrationFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const registrationTTL = new Date(Date.now() + 2 * 60 * 1000), registrationCode = Math.round(Math.random() * 100000000);
        const postedElement = await Config_1.default.collection("registrations").postOne({ "id": (0, useId_1.default)().split("-").join(""), ...isValid.value, "ttl": registrationTTL, "code": registrationCode }).catch((err) => {
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
        const updatedElement = await Config_1.default.collection("registrations").patchOne({ id }, { code }).catch((err) => {
            console.log(err);
        });
        if (!updatedElement) {
            return Promise.reject(`Error from RegistraionFactory class at patchOne - rejected`);
        }
        ;
        return Promise.resolve(updatedElement);
    }
    ;
    static async deleteOne(id) {
        const acknowledged = await Config_1.default.collection("registrations").deleteOne(id).catch((err) => {
            console.log(err);
        });
        if (!acknowledged) {
            return Promise.reject(`Error from RegistrationFactory class at deleteOne - rejected`);
        }
        ;
        return Promise.resolve(acknowledged);
    }
    ;
}
;
exports.default = RegistrationFactory;
