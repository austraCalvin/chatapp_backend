"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
class UserConfigFactory {
    constructor() { }
    ;
    static async find(id) {
        const isValid = joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1).validate(id, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserConfigFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.default.collection("user-configuration").getMany({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from ConfigurationFactory class at find - rejected`);
        }
        ;
        const unique = {};
        if (elementFound) {
            for (const key in elementFound) {
                unique[elementFound[key].id] = elementFound[key];
            }
            ;
        }
        ;
        return Promise.resolve(elementFound ? unique : elementFound);
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.default.collection("user-configuration").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from ConfigurationFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postOne(param) {
        const tailoredSchema = JoiSchema_1.userConfigJoiSchema.tailor("post");
        const isValid = tailoredSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserConfigurationFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const postedElement = await Config_1.default.collection("user-configuration").postOne({ "id": (0, useId_1.default)(), ...isValid.value }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject(`Error from ConfigurationFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
    static async patchOne(id, update) {
        const tailoredSchema = JoiSchema_1.userConfigJoiSchema.tailor("patch");
        const isValid = tailoredSchema.validate(update, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserConfigurationFactory class at patchOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const updatedElement = await Config_1.default.collection("user-configuration").patchOne({ id }, update).catch((err) => {
            console.log(err);
        });
        if (!updatedElement) {
            return Promise.reject(`Error from UserFactory class at patchOne - rejected`);
        }
        ;
        return Promise.resolve(updatedElement);
    }
    ;
}
;
exports.default = UserConfigFactory;
