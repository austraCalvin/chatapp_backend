"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
class Group {
    constructor({ id, description, name, configurable, messages, joinable, approve }) {
        this.id = id;
        this.description = description;
        this.name = name;
        this.configurable = configurable;
        this.messages = messages;
        this.joinable = joinable;
        this.approve = approve;
    }
    ;
}
exports.Group = Group;
;
class GroupFactory {
    constructor() { }
    ;
    static async find(param) {
        const elementFound = await Config_1.default.collection("groups").getMany(param).catch((err) => {
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
        const elementFound = await Config_1.default.collection("groups").getOne({ id }).catch((err) => {
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
        const isValid = JoiSchema_1.groupJoiSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from GroupFactory class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const postedElement = await Config_1.default.collection("groups").postOne({ "id": (0, useId_1.default)(), ...isValid.value }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
}
;
exports.default = GroupFactory;
