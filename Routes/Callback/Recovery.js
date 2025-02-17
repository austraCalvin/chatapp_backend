"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRecoveryCallback = exports.confirmRecoveryCallback = exports.validateRecoveryCodeCallback = exports.checkRecoveryCallback = exports.requestRecoveryCallback = void 0;
const User_1 = __importDefault(require("../../DAO/Entity/User/User"));
const nodemailer_1 = __importDefault(require("../../nodemailer"));
const Recovery_1 = __importDefault(require("../../DAO/Entity/Temp/Recovery"));
const JoiSchema_1 = require("../../hooks/JoiSchema");
const requestRecoveryCallback = async (req, res, next) => {
    const isValid = JoiSchema_1.recoveryJoiSchema.validate(req.body);
    if (isValid.error) {
        console.log(`Error from requestRecoveryCallback - joi validation: ${isValid.error.details[0].message}`);
        console.log("email field:", req.body);
        res.json({ "status": "Bad Request" });
        return;
    }
    ;
    const userExists = await User_1.default.findByEmail(isValid.value.userEmail).catch((err) => {
        console.log(err);
    });
    if (userExists === undefined) {
        res.status(500).json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (!userExists) {
        res.json({ "status": "No User" });
        return;
    }
    ;
    const newRecovery = await Recovery_1.default.postOne({ "userEmail": userExists.email, "type": isValid.value.type }).catch((err) => {
        console.log(err);
    });
    if (newRecovery === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    res.json({ "status": "Created" });
    nodemailer_1.default.sendMail({
        "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
        "to": newRecovery.userEmail,
        "subject": "Password recovery",
        "html": `<a href="http://localhost:3000/recovery/confirm/${newRecovery.id}">confirm</a>
    RECOVERY CODE
    <h2>${newRecovery.code}</h2>
    <br/>
    <br/>
    <a href="http://localhost:3000/recovery/cancel/${newRecovery.id}">cancel</a>
    `
    });
};
exports.requestRecoveryCallback = requestRecoveryCallback;
const checkRecoveryCallback = async (req, res, next) => {
    console.log(`checkRecoveryCallback - recoveryId=${req.params.id}`);
    const RecoveryExists = await Recovery_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (RecoveryExists === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    //RecoveryExists ? 200 : 204
    res.json({ "status": RecoveryExists ? "OK" : "Not Found" });
};
exports.checkRecoveryCallback = checkRecoveryCallback;
const validateRecoveryCodeCallback = async (req, res, next) => {
    const recoveryPending = await Recovery_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (recoveryPending === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (recoveryPending === null) {
        // status 204
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    if (!(/^\d+$/.test(req.body))) {
        res.json({ "status": "Bad Request" });
        return;
    }
    ;
    const insertedCode = Number(req.body);
    if (!(insertedCode === recoveryPending.code)) {
        res.json({ "status": "Unauthorized" });
        const currentRecoveryCode = Math.round(Math.random() * 100000000);
        const updatedRecovery = await Recovery_1.default.patchOne(req.params.id, currentRecoveryCode).catch((err) => {
            console.log(err);
        });
        if (updatedRecovery === undefined) {
            console.log("Error from confirmRecoveryCallback at RecoveryFactory.patchOne - rejected");
            return;
        }
        ;
        if (updatedRecovery === false) {
            console.log("Error from confirmRecoveryCallback at RecoveryFactory.patchOne - NOT acknowledged");
            return;
        }
        ;
        if (updatedRecovery === true) {
            nodemailer_1.default.sendMail({
                "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
                "to": recoveryPending.userEmail,
                "subject": "Recovery code just changed",
                "html": `
                <h1>CURRENT RECOVERY CODE</h1>
                <p>${currentRecoveryCode}</p>
                `
            });
        }
        ;
        return;
    }
    ;
    res.json({ "status": "Authorized" });
};
exports.validateRecoveryCodeCallback = validateRecoveryCodeCallback;
const confirmRecoveryCallback = async (req, res, next) => {
    const recoveryPending = await Recovery_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (recoveryPending === undefined) {
        //status 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (recoveryPending === null) {
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    const currentType = recoveryPending.type, currentField = req.body[currentType];
    if (!currentField) {
        res.json({ "status": "Bad Request" });
        return;
    }
    ;
    const userExists = await User_1.default.findByEmail(recoveryPending.userEmail).catch((err) => {
        console.log(err);
    });
    if (userExists === undefined) {
        //status 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (!userExists) {
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    const recoveredUser = await User_1.default.patchOne(userExists.id, { [currentType]: currentField }).catch((err) => {
        console.log(err);
    });
    if (recoveredUser === undefined) {
        //status 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    //status 200
    res.json({ "status": "Patched" });
    nodemailer_1.default.sendMail({
        "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
        "to": { "address": userExists.email, "name": userExists.username },
        "subject": `Your ${currentType} just changed`,
        "html": `
        Your user ${currentType} has been changed successfully
        `
    });
    const recoveryDeleted = await Recovery_1.default.deleteOne(recoveryPending.id).catch((err) => {
        console.log(err);
    });
    if (recoveryDeleted === undefined) {
        //status 500
        console.log("Error from confirmRecoveryCallback at recoveryDeleted");
        return;
    }
    ;
    if (!recoveryDeleted) {
        console.log("The recovery object could not be deleted");
        return;
    }
    ;
};
exports.confirmRecoveryCallback = confirmRecoveryCallback;
const cancelRecoveryCallback = async (req, res, next) => {
    const recoveryPending = await Recovery_1.default.deleteOne(req.params.id).catch((err) => {
        console.log(err);
    });
    if (recoveryPending === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (recoveryPending) {
        //status = 201
        res.json({ "status": "Success" });
    }
    else {
        //status = 200
        res.status(200).json({ "status": "Fail" });
    }
    ;
};
exports.cancelRecoveryCallback = cancelRecoveryCallback;
