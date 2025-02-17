"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUserDataHandler = exports.getUserDataHandler = void 0;
const User_1 = __importDefault(require("../../DAO/Entity/User/User"));
const getUserDataHandler = async (req, res, next) => {
    const currentUserData = req.user;
    const currentUser = await User_1.default.findById(currentUserData.id).catch((err) => {
        console.log(err);
    });
    if (currentUser === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (currentUser === null) {
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    res.json({ "username": currentUser.username, "name": currentUser.name, "about": currentUser.description });
};
exports.getUserDataHandler = getUserDataHandler;
const postUserDataHandler = async (req, res, next) => {
    const currentUserData = req.user;
    const currentUser = await User_1.default.patchOne(currentUserData.id, req.body).catch((err) => {
        console.log(err);
    });
    if (currentUser === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (currentUser === false) {
        res.json({ "status": "Fail" });
        return;
    }
    ;
    res.json({ "status": "Success" });
};
exports.postUserDataHandler = postUserDataHandler;
