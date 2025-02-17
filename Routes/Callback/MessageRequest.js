"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineMessageRequestHandler = exports.acceptMessageRequestHandler = exports.getMessageRequestHandler = exports.getMessageRequestListHandler = void 0;
const User_1 = __importDefault(require("../../DAO/Entity/User/User"));
const Request_1 = __importDefault(require("../../DAO/Entity/Message/Request"));
const UserContactsUser_1 = __importDefault(require("../../DAO/Entity/User/UserContactsUser"));
const UserConnection_1 = __importDefault(require("../../DAO/Entity/User/UserConnection"));
const getMessageRequestListHandler = async (req, res, next) => {
    console.log("getMessageRequestListHandler began working...");
    const userData = req.user;
    const currentUser = await User_1.default.findById(userData.id).catch((err) => {
        console.log(err);
    });
    if (!currentUser) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    const messageRequests = await Request_1.default.find({ "contactId": [currentUser.id] }).catch((err) => {
        console.log(err);
    });
    if (messageRequests === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (messageRequests === null) {
        res.json([]);
        return;
    }
    ;
    console.log("message-requests:", messageRequests);
    console.log("message-requests:", JSON.parse(JSON.stringify(messageRequests)));
    res.json(messageRequests.map((element, index) => {
        if (userData.id === element.contactId) {
            return { ...element, "contactId": undefined };
        }
        else {
            return { ...element, "userId": undefined };
        }
        ;
    }));
};
exports.getMessageRequestListHandler = getMessageRequestListHandler;
const getMessageRequestHandler = async (req, res, next) => {
    const messageRequest = await Request_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (messageRequest === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (messageRequest === null) {
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    res.json(messageRequest);
};
exports.getMessageRequestHandler = getMessageRequestHandler;
const acceptMessageRequestHandler = async (req, res, next) => {
    const messageRequest = await Request_1.default.findById(req.body).catch((err) => {
        console.log(err);
    });
    if (messageRequest === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (messageRequest === null) {
        res.json({ "status": "Not Found", "message": "The message request does not exist" });
        return;
    }
    ;
    // const userData = req.user as Express.User;
    const currentUser = await User_1.default.findById(messageRequest.contactId).catch((err) => {
        console.log(err);
    });
    const contactUser = await User_1.default.findById(messageRequest.userId).catch((err) => {
        console.log(err);
    });
    if (!currentUser || !contactUser) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    const userContactsUser = await UserContactsUser_1.default.postOne({ "userId": messageRequest.contactId, "contactId": messageRequest.userId, "name": contactUser.name ? contactUser.name : contactUser.username }).catch((err) => {
        console.log(err);
    });
    if (!userContactsUser) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    const deletedMessageRequest = await Request_1.default.deleteOne(messageRequest.id).catch((err) => {
        console.log(err);
    });
    if (deletedMessageRequest === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (deletedMessageRequest === false) {
        res.json({ "status": "Fail", "message": "The message request could not be deleted" });
        return;
    }
    ;
    res.json({ "status": "Success", "data": { "id": userContactsUser.id, "userId": userContactsUser.contactId, "type": "contact", "name": userContactsUser.name, "description": "random" } });
};
exports.acceptMessageRequestHandler = acceptMessageRequestHandler;
const declineMessageRequestHandler = async (req, res, next) => {
    const messageRequest = await Request_1.default.findById(req.body).catch((err) => {
        console.log(err);
    });
    if (messageRequest === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (messageRequest === null) {
        res.json({ "status": "Not Found", "message": "The message request does not exist" });
        return;
    }
    ;
    const isDeleted = await Request_1.default.deleteOne(req.body).catch((err) => {
        console.log(err);
    });
    if (isDeleted === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (isDeleted) {
        res.json({ "status": "Success" });
        const userConnections = await UserConnection_1.default.find([messageRequest.userId, messageRequest.contactId]).catch((err) => {
            console.log(err);
        });
        if (!userConnections) {
            res.json({ "status": "Internal Server Error" });
            return;
        }
        ;
        userConnections.forEach((e) => {
            if (e.online) {
                e.conn?.emit("drop-message-request", messageRequest.id);
            }
            ;
        });
    }
    else {
        res.json({ "status": "Fail", "message": "The message request could not be deleted" });
    }
    ;
    return;
};
exports.declineMessageRequestHandler = declineMessageRequestHandler;
