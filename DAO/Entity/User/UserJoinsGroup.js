"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserJoinsGroup = void 0;
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
class UserJoinsGroup {
    constructor({ id, userId, groupId, notify, read, blocked, admin, date }) {
        this.id = id;
        this.userId = userId;
        this.groupId = groupId;
        this.notify = notify;
        this.read = read;
        this.blocked = blocked;
        this.admin = admin;
        this.date = date;
    }
    ;
}
exports.UserJoinsGroup = UserJoinsGroup;
;
class UserJoinsGroupFactory {
    constructor() { }
    ;
    static async find(param) {
        const elementFound = await Config_1.default.collection("user-joins-group").getMany(param).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findByUserId(userId, groupId) {
        const elementFound = await Config_1.default.collection("user-joins-group").getOne({ "userId": userId, "groupId": groupId }).catch((err) => {
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
        const elementFound = await Config_1.default.collection("user-joins-group").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async getMany(param) {
        const isValid = JoiSchema_1.userJoinsGroupSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error in UserJoinsGroupFactory class - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const foundElements = await Config_1.default.collection("user-joins-group").getMany({ "groupId": [isValid.value.groupId] }).catch((err) => {
            console.log(err);
        });
        if (foundElements === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(foundElements);
    }
    ;
    static async postOne(param) {
        const tailoredSchema = JoiSchema_1.userJoinsGroupSchema.tailor("post");
        const isValid = tailoredSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserJoinsGroupFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const createdDate = new Date().toUTCString();
        const postedElement = await Config_1.default.collection("user-joins-group").postOne({ "id": (0, useId_1.default)(), ...isValid.value, "date": createdDate }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
    static async postMany(param) {
        const tailoredSchema = JoiSchema_1.userJoinsGroupSchema.tailor("post");
        const isValid = joi_1.default.array().items(tailoredSchema).validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserSendsMessageFactory class at postMany - joi validation:${isValid.error.details[0].message}`);
        }
        ;
        const createdDate = new Date().toUTCString();
        const idGenerated = isValid.value.map((each) => {
            return { ...each, "id": (0, useId_1.default)(), "date": createdDate };
        });
        const postedArray = await Config_1.default.collection("user-joins-group").postMany(idGenerated).catch((err) => {
            console.log(err);
        });
        if (!postedArray) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(postedArray);
    }
    ;
}
;
exports.default = UserJoinsGroupFactory;
