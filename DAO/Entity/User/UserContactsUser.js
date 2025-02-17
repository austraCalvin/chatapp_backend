"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserContactsUser = void 0;
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const Config_1 = __importDefault(require("../../DataBase/Config"));
const useId_1 = __importDefault(require("../../../hooks/useId"));
class UserContactsUser {
    constructor({ id, userId, contactId, name, notify, read, verified, blocked, date }) {
        this.id = id;
        this.userId = userId;
        this.contactId = contactId;
        this.name = name;
        this.notify = notify;
        this.read = read;
        this.verified = verified;
        this.blocked = blocked;
        this.date = date;
    }
    ;
}
exports.UserContactsUser = UserContactsUser;
;
class UserContactsUserFactory {
    constructor() { }
    ;
    static async find(filter) {
        const elementFound = await Config_1.default.collection("user-contacts-user").getMany(filter).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findByUserIds(userId, contactId) {
        const elementFound = await Config_1.default.collection("user-contacts-user").getOne({ userId, contactId }).catch((err) => {
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
        const elementFound = await Config_1.default.collection("user-contacts-user").getOne({ id }).catch((err) => {
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
        const tailoredSchema = JoiSchema_1.userContactsUserJoiSchema.tailor("post");
        const isValid = tailoredSchema.validate(param);
        if (isValid.error) {
            return Promise.reject(`Error from UserContactsUserFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        console.log("param contact:", param);
        console.log("post one contact:", isValid.value);
        const createdDate = new Date().toUTCString();
        const postedElement = await Config_1.default.collection("user-contacts-user").postOne({ "id": (0, useId_1.default)(), ...isValid.value, "date": createdDate }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject(`Error from UserContactsUserFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
}
;
exports.default = UserContactsUserFactory;
