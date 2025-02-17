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
exports.UserSendsMessage = exports.UserSendsMessageComposite = void 0;
const joi_1 = __importDefault(require("joi"));
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const useId_1 = __importDefault(require("../../../hooks/useId"));
const Config_1 = __importDefault(require("../../DataBase/Config"));
const UserJoinsGroup_1 = __importDefault(require("../User/UserJoinsGroup"));
const User_1 = __importDefault(require("../User/User"));
const UserReceivesMessage_1 = __importStar(require("./UserReceivesMessage"));
const Message_1 = __importDefault(require("./Message"));
const UserContactsUser_1 = __importDefault(require("../User/UserContactsUser"));
const Request_1 = __importDefault(require("./Request"));
const UserConnection_1 = __importDefault(require("../User/UserConnection"));
class UserSendsMessageComposite {
    constructor(initialValue) {
        const result = {};
        initialValue.forEach((each) => {
            result[each.id] = each;
        });
        this.elements = result;
    }
    ;
    id(val) {
        return this.elements[val];
    }
    ;
    async getUsers() {
        const userIds = new Set;
        for (const prop in this.elements) {
            userIds.add(this.elements[prop].userId);
        }
        ;
        const users = await User_1.default.find([...userIds]).catch((err) => {
            console.log(err);
        });
        if (!users) {
            return Promise.reject();
        }
        ;
        return users;
    }
    ;
    async getMessages() {
        const messageIds = new Set;
        for (const prop in this.elements) {
            messageIds.add(this.elements[prop].messageId);
        }
        ;
        const unique = {};
        for (const key in this.elements) {
            unique[key] = undefined;
        }
        ;
        const messages = await Message_1.default.find([...messageIds]).catch((err) => {
            console.log(err);
        });
        if (!messages) {
            return Promise.reject();
        }
        ;
        messages.forEach((each) => {
            unique[each.id] = each;
        });
        return unique;
    }
    ;
}
exports.UserSendsMessageComposite = UserSendsMessageComposite;
;
class UserSendsMessage {
    constructor({ id, userId, messageId, date, chatType, chatId, replyType, replyId }) {
        this.id = id;
        this.userId = userId;
        this.messageId = messageId;
        this.date = date;
        this.chatType = chatType;
        this.chatId = chatId;
        this.replyType = replyType;
        this.replyId = replyId;
    }
    ;
    async getReceives() {
        console.log("getReceives triggered");
        if (this.chatType === "contact") {
            const contactId = this.chatId;
            const contextUsers = await User_1.default.find([this.userId, contactId]).catch((err) => {
                console.log(err);
            });
            if (!contextUsers) {
                return Promise.reject();
            }
            ;
            const currentUser = contextUsers.id(this.userId), contactUser = contextUsers.id(contactId);
            const isAllowed_st = await currentUser.isAllowed("contact", contactId).catch((err) => {
                console.log(err);
            });
            const isAllowed_nd = await contactUser.isAllowed("contact", this.userId).catch((err) => {
                console.log(err);
            });
            if (!isAllowed_st || !isAllowed_nd) {
                console.log("ONE OF THE ALLOWED IS NULL");
                return Promise.reject();
            }
            ;
            //The receiver does not have you as a contact
            //The receiver allows you to send messages
            //There's a request message
            if (!isAllowed_st.contact && isAllowed_st.messages && !isAllowed_st.request && !isAllowed_nd.request && isAllowed_nd.messages) {
                const contactUserConnection = await UserConnection_1.default.findById(this.chatId).catch((err) => {
                    console.log(err);
                });
                if (contactUserConnection === undefined) {
                    return Promise.reject();
                }
                ;
                if (isAllowed_st.approve === "both" || isAllowed_st.approve === "contact") {
                    const postedMessageRequest = await Request_1.default.postOne({ "userId": this.userId, "contactId": this.chatId, "messageId": this.id }).catch((err) => {
                        console.log(err);
                    });
                    if (postedMessageRequest === undefined) {
                        return Promise.reject();
                    }
                    ;
                    const currentUserConnection = await UserConnection_1.default.findById(this.userId).catch((err) => {
                        console.log(err);
                    });
                    if (!currentUserConnection) {
                        return Promise.reject();
                    }
                    ;
                    if (currentUserConnection) {
                        if (currentUserConnection.online) {
                            currentUserConnection.conn?.emit("add-message-request", { "id": postedMessageRequest.id, "messageId": postedMessageRequest.messageId, "contactId": postedMessageRequest.contactId });
                        }
                        ;
                    }
                    ;
                    if (contactUserConnection) {
                        if (contactUserConnection.online) {
                            contactUserConnection.conn?.emit("add-message-request", { "id": postedMessageRequest.id, "userId": postedMessageRequest.userId, "messageId": postedMessageRequest.messageId });
                        }
                        ;
                    }
                    ;
                }
                else {
                    const postedContact = await UserContactsUser_1.default.postOne({ "userId": this.chatId, "contactId": this.userId, "name": currentUser.name ? currentUser.name : currentUser.username }).catch((err) => {
                        console.log(err);
                    });
                    if (postedContact === undefined) {
                        return Promise.reject();
                    }
                    ;
                    if (contactUserConnection) {
                        contactUserConnection.conn?.emit("add-contact", {
                            "id": postedContact.id,
                            "userId": postedContact.contactId,
                            "user_name": postedContact.name,
                        });
                    }
                    ;
                }
                ;
            }
            else if (!isAllowed_st.messages || !isAllowed_nd.messages || isAllowed_st.request || isAllowed_nd.request) {
                console.log("MESSAGES IS NOT ALLOWED");
                return Promise.resolve(null);
            }
            ;
            console.log("Data being set for user receive message object to be created", { ...this, "userId": contactId, "sendId": this.id });
            const postedUserReceivesMessage = await UserReceivesMessage_1.default.postOne({ ...this, "userId": contactId, "chatId": this.userId, "sendId": this.id }).catch((err) => {
                console.log(err);
            });
            if (!postedUserReceivesMessage) {
                return Promise.reject();
            }
            ;
            return Promise.resolve(new UserReceivesMessage_1.UserReceivesMessageComposite([postedUserReceivesMessage]));
        }
        else if (this.chatType === "group") {
            // const currentJoinsGroup = await UserJoinsGroupFactory.findById(this.chatId).catch((err) => {
            //     console.log(err);
            // });
            // if (!currentJoinsGroup) {
            //     return Promise.reject();
            // };
            const usersJoinGroup = await UserJoinsGroup_1.default.find({ "groupId": [this.chatId] }).catch((err) => {
                console.log(err);
            });
            if (usersJoinGroup === undefined) {
                return Promise.reject();
            }
            ;
            if (usersJoinGroup === null) {
                return Promise.resolve(null);
            }
            ;
            usersJoinGroup.splice(usersJoinGroup.findIndex((e) => e.userId === this.userId), 1);
            const receiverIds = usersJoinGroup.map((e) => e.userId);
            const receiverUsers = await User_1.default.find(receiverIds).catch((err) => {
                console.log(err);
            });
            if (!receiverUsers) {
                return Promise.reject();
            }
            ;
            const isAllowed_1 = receiverUsers.isAllowed("contact", this.userId), isAllowed_2 = receiverUsers.isAllowed("contact", this.userId, true);
            const isAllowed = await Promise.all([isAllowed_1, isAllowed_2]).catch((err) => {
                console.log(err);
            });
            if (!isAllowed) {
                return Promise.reject();
            }
            ;
            const currentUser = await User_1.default.findById(this.userId).catch((err) => {
                console.log(err);
            });
            if (!currentUser) {
                return Promise.reject();
            }
            ;
            const currentUserConfig = await currentUser.lookup().catch((err) => {
                console.log(err);
            });
            if (!currentUserConfig) {
                return Promise.reject();
            }
            ;
            const filteredUsersJoinGroup = usersJoinGroup.filter(async (value) => {
                const receiverAllows = isAllowed[0][value.userId], userAllows = isAllowed[1][value.userId];
                if (!receiverAllows || !userAllows) {
                    return true;
                }
                ;
                if (userAllows.blocked) {
                    return false;
                }
                ;
                return receiverAllows.messages;
            });
            console.log(`UserSendsMessage class at getReceives - filteredUsersJoinGroup =`, filteredUsersJoinGroup);
            if (!filteredUsersJoinGroup[0]) {
                return Promise.resolve(null);
            }
            ;
            const usersReceiveMessage = filteredUsersJoinGroup.map((each) => {
                const userReceivesMessage = { "userId": each.userId, "sendId": this.id, "chatType": this.chatType, "chatId": this.chatId };
                if (this.replyType && this.replyId) {
                    userReceivesMessage.replyType = this.replyType === "send" ? "receive" : "send";
                    userReceivesMessage.replyId = this.replyId;
                }
                ;
                return userReceivesMessage;
            });
            const postedUsersReceiveMessage = await UserReceivesMessage_1.default.postMany(usersReceiveMessage).catch((err) => {
                console.log(err);
            });
            if (!postedUsersReceiveMessage) {
                return Promise.reject();
            }
            ;
            return Promise.resolve(new UserReceivesMessage_1.UserReceivesMessageComposite(postedUsersReceiveMessage));
        }
        ;
        return Promise.resolve(null);
    }
    ;
}
exports.UserSendsMessage = UserSendsMessage;
;
class UserSendsMessageFactory {
    constructor() { }
    ;
    static async find(param) {
        console.log(`UserSendsMessageFactory at find - param -`, param);
        const isValid = joi_1.default.object({
            "id": joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1),
            "userId": joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1),
            "chatId": joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1)
        }).validate(param);
        if (isValid.error) {
            return Promise.reject(`Error from UserSendsMessageFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.default.collection("user-sends-message").getMany(param).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserSendsMessageFactory class at find - rejected`);
        }
        ;
        return Promise.resolve(elementFound ? new UserSendsMessageComposite(elementFound) : null);
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.default.collection("user-sends-message").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserSendsMessageFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postMany(param) {
        const tailoredSchema = JoiSchema_1.userSendsMessageJoiSchema.tailor("post");
        const isValid = joi_1.default.array().items(tailoredSchema).validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserSendsMessageFactory class at postMany - joi validation:${isValid.error.details[0].message}`);
        }
        ;
        const idGenerated = isValid.value.map((each) => {
            return { ...each, "id": (0, useId_1.default)() };
        });
        const postedArray = await Config_1.default.collection("user-sends-message").postMany(idGenerated).catch((err) => {
            console.log(err);
        });
        if (!postedArray) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(postedArray);
    }
    ;
    static async postOne(param) {
        const tailoredSchema = JoiSchema_1.userSendsMessageJoiSchema.tailor("post");
        const isValid = tailoredSchema.validate(param, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserSendsMessageFactory class at postOne - joi validation:${isValid.error.details[0].message}`);
        }
        ;
        const postedElement = await Config_1.default.collection("user-sends-message").postOne({ "id": (0, useId_1.default)(), ...isValid.value }).catch((err) => {
            console.log(err);
        });
        if (!postedElement) {
            return Promise.reject(`Error from UserSendsMessageFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(new UserSendsMessage(postedElement));
    }
    ;
    static async patchOne(param) {
        const updatedElement = await Config_1.default.collection("user-sends-message").patchOne({ "id": param.id }, { "deliveredDate": param.deliveredDate }).catch((err) => {
            console.log(err);
        });
        if (!updatedElement) {
            return Promise.reject(`Error from UserSendsMessageFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(updatedElement);
    }
    ;
}
;
exports.default = UserSendsMessageFactory;
