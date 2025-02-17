"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReceivesMessage = exports.UserReceivesMessageComposite = void 0;
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
const UserSendsMessage_1 = __importStar(require("./UserSendsMessage"));
class UserReceivesMessageComposite {
    constructor(initialValue) {
        this.elements = initialValue ? (initialValue[0] ? initialValue.map((element) => new UserReceivesMessage(element)) : []) : [];
    }
    ;
    id(val) {
        const foundIndex = this.elements.findIndex((element) => (element.id === val));
        return foundIndex === -1 ? null : new UserReceivesMessage(this.elements[foundIndex]);
    }
    ;
    async lookup() {
        const unique = {};
        this.elements.forEach((each) => {
            unique[each.sendId] = undefined;
        });
        const userSendsMessage = await UserSendsMessage_1.default.find({ "id": Object.keys(unique) }).catch((err) => {
            console.log(err);
        });
        if (!userSendsMessage) {
            return Promise.reject();
        }
        ;
        for (const key in userSendsMessage.elements) {
            unique[userSendsMessage.elements[key].id] = userSendsMessage.elements[key];
        }
        ;
        const result = Object.entries(unique).map((each) => {
            return each[1];
        });
        return new UserSendsMessage_1.UserSendsMessageComposite(result);
    }
    ;
    forEach(callback) {
        for (let index = 0; index < this.elements.length; index++) {
            callback(this.elements[index]);
        }
        ;
    }
    ;
    filter(callback) {
        return this.elements.filter(callback);
    }
    ;
}
exports.UserReceivesMessageComposite = UserReceivesMessageComposite;
;
class UserReceivesMessage {
    constructor({ id, userId, sendId, date, chatType, chatId, replyType, replyId }) {
        this.id = id;
        this.userId = userId;
        // this.messageId = messageId;
        // this.senderId = senderId;
        this.sendId = sendId;
        this.date = date;
        this.chatType = chatType;
        this.chatId = chatId;
        this.replyType = replyType;
        this.replyId = replyId;
    }
    ;
    async lookup() {
        const userSendsMessage = await UserSendsMessage_1.default.findById(this.sendId).catch((err) => {
            console.log(err);
        });
        if (!userSendsMessage) {
            return Promise.reject();
        }
        ;
        return userSendsMessage;
    }
    ;
    async getSenderId() {
        const sendMessage = await this.lookup().catch((err) => {
            console.log(err);
        });
        if (!sendMessage) {
            return Promise.reject();
        }
        ;
        if (this.chatType === "contact") {
            return this.chatId;
        }
        else {
            return sendMessage.userId;
        }
        ;
    }
    ;
}
exports.UserReceivesMessage = UserReceivesMessage;
;
class UserReceivesMessageFactory {
    constructor() { }
    ;
    static async find(filter) {
        // const localJoiSchema = Joi.object<{ userId: IUser["id"][], "date": Date, "readDate": Date, "chatId": string[] }, true>({
        //     "userId": Joi.array<IUser["id"][]>().items(idJoiSchema).min(1),
        //     "chatId": Joi.array<string[]>().items(idJoiSchema).min(1),
        //     // "senderId": Joi.array<IUser["id"][]>().items(idJoiSchema).min(1),
        //     "date": dateJoiSchema.allow(true),
        //     "readDate": dateJoiSchema.allow(true),
        // });
        // const isValid = localJoiSchema.validate(filter);
        // if (isValid.error) {
        //     return Promise.reject(`Error from UserReceivesMessageFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        // };
        const elementFound = await Config_1.default.collection("user-receives-message").getMany(filter).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at getMany - rejected`);
        }
        ;
        if (elementFound === null) {
            return null;
        }
        ;
        return new UserReceivesMessageComposite(elementFound);
    }
    ;
    static async findById(id) {
        const isValid = JoiSchema_1.idJoiSchema.validate(id);
        if (isValid.error) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at findById - joi validation:${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.default.collection("user-receives-message").getOne({ "id": isValid.value }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject();
        }
        ;
        if (elementFound === null) {
            return null;
        }
        ;
        return new UserReceivesMessage(elementFound);
    }
    ;
    static async patchOne(id, update) {
        const isValid = JoiSchema_1.idJoiSchema.validate(id);
        if (isValid.error) {
            return Promise.reject(`Error in UserReceivesMessageFactory class  - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const acknowledged = await Config_1.default.collection("user-receives-message").patchOne({ "id": isValid.value }, update).catch((err) => {
            console.log(err);
        });
        if (acknowledged === undefined) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at patchOne - rejected`);
        }
        ;
        return Promise.resolve(acknowledged);
    }
    ;
    static async postMany(param) {
        const tailoredSchema = JoiSchema_1.userReceivesMessageJoiSchema.tailor("post");
        const isValid = joi_1.default.array().items(tailoredSchema).validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at postMany - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const idGenerated = isValid.value.map((each) => {
            return { ...each, "id": (0, useId_1.default)() };
        });
        const postedArray = await Config_1.default.collection("user-receives-message").postMany(idGenerated).catch((err) => {
            console.log(err);
        });
        if (!postedArray) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at postMany - rejected`);
        }
        ;
        return Promise.resolve(postedArray);
    }
    ;
    static async postOne(param) {
        console.log("user receive message object to be posted", param);
        const tailoredSchema = JoiSchema_1.userReceivesMessageJoiSchema.tailor("post");
        const isValid = tailoredSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        console.log("user receive message object after joi validation", isValid.value);
        const postedElement = await Config_1.default.collection("user-receives-message").postOne({ "id": (0, useId_1.default)(), ...isValid.value }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject(`Error from UserReceivesMessageFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
}
;
exports.default = UserReceivesMessageFactory;
