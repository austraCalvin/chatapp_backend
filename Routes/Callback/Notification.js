"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableNotificationHandler = exports.switchNotifyHandler = exports.isNotificationEnabledHandler = void 0;
const UserConnection_1 = __importDefault(require("../../DAO/Entity/User/UserConnection"));
const User_1 = __importDefault(require("../../DAO/Entity/User/User"));
const Configuration_1 = __importDefault(require("../../DAO/Entity/User/Configuration"));
const JoiSchema_1 = require("../../hooks/JoiSchema");
const isNotificationEnabledHandler = async (req, res, next) => {
    // { "notify": boolean, "push": boolean, "email": boolean }
    console.log("checkPushSubscriptionHandler began working...");
    const userData = req.user;
    const currentUser = await User_1.default.findById(userData.id).catch((err) => {
        console.log(err);
    });
    if (!currentUser) {
        res.json({ "state": "Internal Server Error" });
        return;
    }
    ;
    const currentConfig = await currentUser.lookup().catch((err) => {
        console.log(err);
    });
    if (!currentConfig) {
        res.json({ "state": "Internal Server Error" });
        return;
    }
    ;
    res.json({ "notify": currentConfig.notify, "push": currentConfig.push, "email": currentConfig.email });
};
exports.isNotificationEnabledHandler = isNotificationEnabledHandler;
const switchNotifyHandler = async (req, res, next) => {
    const userData = req.user;
    const currentAction = req.params.action;
    if (!(currentAction === "on" || currentAction === "off")) {
        return;
    }
    ;
    const currentUser = await User_1.default.findById(userData.id).catch((err) => {
        console.log(err);
    });
    if (!currentUser) {
        res.json({ "state": "Internal Server Error" });
        return;
    }
    ;
    if (!currentUser.configId) {
        const postedConfig = await Configuration_1.default.postOne({ "notify": currentAction === "on" ? true : false }).catch((err) => {
            console.log(err);
        });
        if (!postedConfig) {
            res.json({ "state": "Internal Server Error" });
            return;
        }
        ;
        const patchedUser = await User_1.default.patchOne(userData.id, { "configId": postedConfig.id }).catch((err) => {
            console.log(err);
        });
        if (!patchedUser) {
            res.json({ "state": "Internal Server Error" });
            return;
        }
        ;
    }
    else {
        const patchedConfig = await Configuration_1.default.patchOne(currentUser.configId, { "notify": currentAction === "on" ? true : false }).catch((err) => {
            console.log(err);
        });
        if (patchedConfig === undefined) {
            res.json({ "state": "Internal Server Error" });
            return;
        }
        ;
        if (patchedConfig === false) {
            res.json({ "state": "Fail" });
            return;
        }
        ;
    }
    ;
    res.json({ "state": "Success" });
};
exports.switchNotifyHandler = switchNotifyHandler;
const enableNotificationHandler = async (req, res, next) => {
    console.log("enableNotificationHandler began working...");
    const userData = req.user;
    const tailoredSchema = JoiSchema_1.userConfigJoiSchema.tailor("patch");
    const isValid = tailoredSchema.validate(req.body, { "stripUnknown": true });
    if (isValid.error) {
        return Promise.reject(`Error from enableNotificationHandler - joi validation: ${isValid.error.details[0].message}`);
    }
    ;
    const enable = isValid.value;
    const currentUser = await User_1.default.findById(userData.id).catch((err) => {
        console.log(err);
    });
    if (!currentUser) {
        res.json({ "state": "Internal Server Error" });
        return;
    }
    ;
    if (!currentUser.configId) {
        const postedConfig = await Configuration_1.default.postOne(enable).catch((err) => {
            console.log(err);
        });
        if (!postedConfig) {
            res.json({ "state": "Internal Server Error" });
            return;
        }
        ;
        const patchedUser = await User_1.default.patchOne(userData.id, { "configId": postedConfig.id }).catch((err) => {
            console.log(err);
        });
        if (!patchedUser) {
            res.json({ "state": "Internal Server Error" });
            return;
        }
        ;
    }
    else {
        const patchedConfig = await Configuration_1.default.patchOne(currentUser.configId, enable).catch((err) => {
            console.log(err);
        });
        if (patchedConfig === undefined) {
            res.json({ "state": "Internal Server Error" });
            return;
        }
        ;
        if (patchedConfig === false) {
            res.json({ "state": "Fail" });
            return;
        }
        ;
    }
    ;
    const currentConn = await UserConnection_1.default.findById(currentUser.id).catch((err) => {
        console.log(err);
    });
    if (!currentConn) {
        res.json({ "state": "Internal Server Error" });
        return;
    }
    ;
    console.log("req.body:", req.body);
    if (req.body.push) {
        currentConn.subscribe(req.body.pushSubscription);
    }
    else {
        currentConn.unsubscribe();
    }
    ;
    res.json({ "state": "Success" });
};
exports.enableNotificationHandler = enableNotificationHandler;
