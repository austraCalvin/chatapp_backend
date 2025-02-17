"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactHandler = exports.getContactListHandler = exports.addContactHandler = void 0;
const joi_1 = __importDefault(require("joi"));
const User_1 = __importDefault(require("../../DAO/Entity/User/User"));
const UserContactsUser_1 = __importDefault(require("../../DAO/Entity/User/UserContactsUser"));
const addContactHandler = async (req, res, next) => {
    const isValid = joi_1.default.string().min(3).validate(req.body);
    if (isValid.error) {
        console.log(`Error from addContactHandlerCallback - joi validation: ${isValid.error.details[0].message}`);
        console.log("username field:", req.body);
        res.json({ "status": "Bad Request", "message": "The field must be a string and have at least three characters" });
        return;
    }
    ;
    const username = isValid.value;
    const currentUser = req.user;
    if (currentUser.username === username) {
        res.json({ "status": "Bad Request", "message": "You can't add yourself as a contact" });
        return;
    }
    ;
    const contactUser = await User_1.default.findByUsername(username).catch((err) => {
        console.log(err);
    });
    if (!contactUser) {
        res.json({ "status": "Not Found", "message": "This username does not exist" });
        return;
    }
    ;
    const isContact = await UserContactsUser_1.default.findByUserIds(currentUser.id, contactUser.id).catch((err) => {
        console.log(err);
    });
    if (isContact === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (isContact) {
        res.json({ "status": "Exists", "message": "This user has already been added to your contact list" });
        return;
    }
    ;
    const postedContact = await UserContactsUser_1.default.postOne({ "userId": currentUser.id, "contactId": contactUser.id, "name": contactUser.name }).catch((err) => {
        console.log(err);
    });
    if (!postedContact) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    res.json({ "status": "Created", "data": { ...JSON.parse(JSON.stringify(postedContact)), "chatId": postedContact.contactId } });
};
exports.addContactHandler = addContactHandler;
const getContactListHandler = async (req, res, next) => {
    const currentUser = req.user;
    const contactList = await UserContactsUser_1.default.find({ "userId": [currentUser.id] }).catch((err) => {
        console.log(err);
    });
    if (contactList === undefined) {
        return;
    }
    ;
    if (contactList === null) {
        res.json([]);
        return;
    }
    ;
    console.log(`getContactListHandler - contactList has value=${contactList[0] ? "yes" : "no"}`);
    console.log("array:", contactList);
    if (contactList.length === 0) {
        res.json([]);
        return;
    }
    ;
    res.json(contactList.map((val) => ({
        "id": val.id,
        "userId": val.contactId,
        "type": "contact",
        "name": val.name,
        "description": ""
    })));
};
exports.getContactListHandler = getContactListHandler;
const getContactHandler = async (req, res, next) => {
    const contactUser = await User_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (contactUser === undefined) {
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (contactUser === null) {
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    res.json(contactUser);
};
exports.getContactHandler = getContactHandler;
