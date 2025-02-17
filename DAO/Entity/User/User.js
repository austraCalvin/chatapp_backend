"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserComposite = void 0;
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
const Configuration_1 = __importDefault(require("./Configuration"));
const UserContactsUser_1 = __importDefault(require("./UserContactsUser"));
const UserJoinsGroup_1 = __importDefault(require("./UserJoinsGroup"));
const Group_1 = __importDefault(require("./Group"));
const Request_1 = __importDefault(require("../Message/Request"));
class UserComposite {
    ;
    constructor(initialValue) {
        const result = {};
        initialValue.forEach((each) => {
            result[each.id] = each;
        });
        this.elements = result;
    }
    ;
    id(val) {
        return new User(this.elements[val]);
    }
    ;
    async lookup() {
        const filterQuery = [];
        for (const key in this.elements) {
            const userData = this.elements[key];
            if (userData.configId) {
                filterQuery.push(userData.configId);
            }
            ;
        }
        ;
        if (!filterQuery.length) {
            return {};
        }
        ;
        const userConfigs = await Configuration_1.default.find(filterQuery).catch((err) => {
            console.log(err);
        });
        if (userConfigs === undefined) {
            return Promise.reject();
        }
        ;
        return userConfigs ? userConfigs : {};
    }
    ;
    async isAllowed(chatType, chatId, reverse) {
        console.log(`IS ALLOWED - params - chatType=${chatType} - chatId=${chatId}`);
        //get the contact-users ids
        const userIds = Object.keys(this.elements);
        if (chatType === "contact") {
            const foundElement = await UserContactsUser_1.default.find({ "userId": !reverse ? userIds : [chatId], "contactId": !reverse ? [chatId] : userIds }).catch((err) => {
                console.log(err);
            });
            if (foundElement === undefined) {
                return Promise.reject();
            }
            ;
            const unique = {};
            if (!reverse) {
                const userConfig = await this.lookup().catch((err) => {
                    console.log(err);
                });
                if (userConfig === undefined) {
                    return Promise.reject();
                }
                ;
                for (let userId in this.elements) {
                    const currentUser = this.elements[userId], configId = currentUser.configId;
                    unique[userId] = {
                        "contact": false,
                        "blocked": false,
                        "messages": true,
                        "read": true
                    };
                    const currentConfig = userConfig[configId ? configId : ""];
                    const configValue = currentConfig.approve === "both" || currentConfig.approve === "contact" ? false : true;
                    unique[userId].messages = configValue;
                    unique[userId].read = configValue ? currentConfig.read : false;
                }
                ;
            }
            ;
            if (foundElement) {
                foundElement.forEach((each) => {
                    const configValue = each.blocked ? false : true;
                    unique[!reverse ? each.userId : each.contactId] = {
                        "contact": true,
                        "blocked": each.blocked,
                        "messages": configValue,
                        "read": configValue ? each.read : false
                    };
                });
            }
            ;
            return unique;
        }
        else if (chatType === "group") {
            const foundElement = await UserJoinsGroup_1.default.find({ "userId": userIds, "groupId": [chatId] }).catch((err) => {
                console.log(err);
            });
            if (foundElement === undefined) {
                return Promise.reject();
            }
            ;
            if (foundElement === null) {
                return Promise.reject();
            }
            ;
            const grougConfig = await Group_1.default.findById(chatId).catch((err) => {
                console.log(err);
            });
            if (!grougConfig) {
                return Promise.reject();
            }
            ;
            const unique = {};
            foundElement.forEach((each) => {
                const configValue = !each.blocked;
                unique[each.userId] = {
                    "blocked": each.blocked,
                    "messages": configValue ? grougConfig.messages : false,
                    "read": configValue ? each.read : false
                };
            });
            return unique;
        }
        ;
        return Promise.reject();
    }
    ;
    forEach(callback) {
        for (const key in this.elements) {
            callback(this.elements[key]);
        }
        ;
    }
    ;
    filter(callback) {
        const result = [];
        for (const key in this.elements) {
            const allowed = callback(this.elements[key]);
            if (allowed) {
                result.push(this.elements[key]);
            }
            ;
        }
        ;
        return new UserComposite(result);
    }
    ;
}
exports.UserComposite = UserComposite;
;
class User {
    constructor({ id, name, username, description, password, email, created, lastOnline, configId }) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.description = description;
        this.password = password;
        this.email = email;
        this.created = created;
        this.lastOnline = lastOnline;
        this.configId = configId;
    }
    ;
    async isAllowed(chatType, chatId) {
        if (chatType === "contact") {
            const contactId = chatId;
            const foundElement = await UserContactsUser_1.default.findByUserIds(contactId, this.id).catch((err) => {
                console.log(err);
            });
            if (foundElement === undefined) {
                return Promise.reject();
            }
            ;
            if (foundElement === null) {
                const messageRequest = await Request_1.default.findByUserIds(this.id, contactId).catch((err) => {
                    console.log(err);
                });
                if (messageRequest === undefined) {
                    return Promise.reject();
                }
                ;
                const contactUserConfig = await UserFactory.getConfig(contactId).catch((err) => {
                    console.log(err);
                });
                if (contactUserConfig === undefined) {
                    return Promise.reject();
                }
                ;
                if (contactUserConfig === null) {
                    return {
                        "request": !!messageRequest,
                        "contact": false,
                        "blocked": false,
                        "messages": messageRequest ? false : true,
                        "read": true,
                        "approve": "both"
                    };
                }
                ;
                return {
                    "request": !!messageRequest,
                    "contact": false,
                    "blocked": false,
                    "messages": true,
                    "read": contactUserConfig.read,
                    "approve": contactUserConfig.approve
                };
            }
            ;
            const configValue = !foundElement.blocked;
            return {
                "request": false,
                "contact": true,
                "blocked": !configValue,
                "messages": configValue,
                "read": configValue ? foundElement.read : false,
                "approve": "none"
            };
        }
        else if (chatType === "group") {
            const groupId = chatId;
            const currentJoinsGroup = await UserJoinsGroup_1.default.findByUserId(this.id, groupId).catch((err) => {
                console.log(err);
            });
            if (!currentJoinsGroup) {
                return Promise.reject();
            }
            ;
            const group = await Group_1.default.findById(currentJoinsGroup.groupId).catch((err) => {
                console.log(err);
            });
            if (!group) {
                return Promise.reject();
            }
            ;
            const configValue = !currentJoinsGroup.blocked;
            console.log({
                "blocked": !configValue,
                "messages": configValue,
                "read": configValue ? currentJoinsGroup.read : false,
                "approve": "none"
            });
            return {
                "blocked": !configValue,
                "messages": configValue,
                "read": configValue ? currentJoinsGroup.read : false,
                "approve": "none"
            };
        }
        ;
        return Promise.reject();
    }
    ;
    async lookup() {
        if (!this.configId) {
            return Promise.resolve({
                "online": "lastOnline",
                "lastOnline": "everyone",
                "approve": "none",
                "writing": true,
                "read": true,
                "notify": true,
                "push": false,
                "email": true
            });
        }
        ;
        const elementFound = await Configuration_1.default.findById(this.configId).catch((err) => {
            console.log(err);
        });
        if (!elementFound) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
}
exports.User = User;
;
class UserFactory {
    constructor() { }
    ;
    static async find(id) {
        const isValid = joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1).validate(id, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.default.collection("users").getMany({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserFactory class at find - rejected`);
        }
        ;
        return Promise.resolve(elementFound ? new UserComposite(elementFound) : null);
    }
    ;
    static async getConfig(userId) {
        console.log(`UserFactory userId inserted - ${userId ? userId : "null"}`);
        const owner = await this.findById(userId).catch((err) => {
            console.log(err);
        });
        if (owner === undefined) {
            return Promise.reject(`Error from UserFactory class at getConfig - failed finding the user by id - rejected`);
        }
        ;
        if (owner === null) {
            return Promise.reject(`Error from UserFactory class at getConfig - failed finding the user by id - user does not exist`);
        }
        ;
        if (!owner.configId) {
            console.log("current user does not have configuration");
            return Promise.resolve({
                "approve": "both",
                "writing": false,
                "online": "lastOnline",
                "lastOnline": "everyone",
                "read": false
            });
        }
        ;
        const elementFound = await Configuration_1.default.findById(owner.configId).catch((err) => {
            console.log(err);
        });
        if (!elementFound) {
            return Promise.reject(`Error from UserFactory class at getConfig - failed finding the configuration by id - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findByUsername(username) {
        const elementFound = await Config_1.default.collection("users").getOne({ username }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserFactory class at findByUsername - rejected`);
        }
        ;
        return elementFound;
    }
    ;
    static async findByEmail(email) {
        const elementFound = await Config_1.default.collection("users").getOne({ email }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserFactory class at findByEmail - rejected`);
        }
        ;
        return elementFound;
    }
    ;
    static async findByUsernameAndEmail(username, email) {
        if (!username || !email) {
            return Promise.reject("Error from UserFactory class at findByUsernameOrEmail - both params must have value");
        }
        ;
        const elementFoundByUsername = await Config_1.default.collection("users").getOne({ username }).catch((err) => {
            console.log(err);
        });
        const elementFoundByEmail = await Config_1.default.collection("users").getOne({ email }).catch((err) => {
            console.log(err);
        });
        if (elementFoundByUsername === undefined || elementFoundByEmail === undefined) {
            return Promise.reject();
        }
        ;
        if (elementFoundByUsername === null && elementFoundByEmail === null) {
            return null;
        }
        ;
        return {
            "username": !!elementFoundByUsername,
            "email": !!elementFoundByEmail,
        };
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.default.collection("users").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound ? new User(elementFound) : elementFound);
    }
    ;
    static async postOne(param) {
        const tailoredSchema = JoiSchema_1.userJoiSchema.tailor("signup");
        const isValid = tailoredSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from User class at postOne - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        console.log("pre validation");
        console.log(param);
        console.log("post validation");
        console.log(isValid.value);
        const createdDate = new Date().toUTCString();
        const postedElement = await Config_1.default.collection("users").postOne({ "id": (0, useId_1.default)(), ...isValid.value, "created": createdDate, "lastOnline": createdDate }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(postedElement);
    }
    ;
    static async touch(id) {
        const isValid = JoiSchema_1.idJoiSchema.validate(id);
        if (isValid.error) {
            return Promise.reject(`Error from User class at touch - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const updatedLastOnline = new Date().toUTCString();
        const updatedElement = await Config_1.default.collection("users").patchOne({ "id": id }, { "lastOnline": updatedLastOnline }).catch((err) => {
            console.log(err);
        });
        if (!updatedElement) {
            return Promise.reject(`Error from User class at touch - user could not update its lastOnline`);
        }
        ;
        return Promise.resolve(updatedElement);
    }
    ;
    static async patchOne(id, update) {
        const updatedElement = await Config_1.default.collection("users").patchOne({ id }, update).catch((err) => {
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
exports.default = UserFactory;
