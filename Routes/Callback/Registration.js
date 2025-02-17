"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelRegistrationCallback = exports.confirmRegistrationCallback = exports.validateRegistrationCodeCallback = exports.checkRegistrationCallback = exports.requestRegistrationCallback = exports.checkRegistrationUsernameCallback = void 0;
const joi_1 = __importDefault(require("joi"));
const Registration_1 = __importDefault(require("../../DAO/Entity/Temp/Registration"));
const User_1 = __importDefault(require("../../DAO/Entity/User/User"));
const nodemailer_1 = __importDefault(require("../../nodemailer"));
const checkRegistrationUsernameCallback = async (req, res, next) => {
    const isValid = joi_1.default.string().validate(req.body);
    if (isValid.error) {
        console.log(`Error from checkRegistrationCallback - joi validation: ${isValid.error.details[0].message}`);
        console.log("username field:", req.body);
        res.json({ "status": "Bad Request" });
        return;
    }
    ;
    const userExists = await User_1.default.findByUsername(req.body).catch((err) => {
        console.log(err);
    });
    if (userExists === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    console.log("userExists:", userExists);
    await (new Promise((success, danger) => {
        setTimeout(() => {
            success();
        }, 3000);
    }));
    if (userExists) {
        res.json({ "status": "Bad Request", "message": "username is already in use" });
        return;
    }
    ;
    res.json({ "status": "OK" });
};
exports.checkRegistrationUsernameCallback = checkRegistrationUsernameCallback;
const requestRegistrationCallback = async (req, res, next) => {
    const isValid = joi_1.default.string().email().validate(req.body);
    if (isValid.error) {
        console.log(`Error from requestRegistrationCallback - joi validation: ${isValid.error.details[0].message}`);
        console.log("email field:", req.body);
        res.json({ "status": "Bad Request" });
        return;
    }
    ;
    const insertedEmail = isValid.value;
    const userExists = await User_1.default.findByEmail(insertedEmail).catch((err) => {
        console.log(err);
    });
    if (userExists === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (userExists) {
        res.json({ "status": "Exists" });
        return;
    }
    ;
    const newRegistration = await Registration_1.default.postOne({ "email": insertedEmail }).catch((err) => {
        console.log(err);
    });
    if (newRegistration === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    res.json({ "status": "Created" });
    nodemailer_1.default.sendMail({
        "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
        "to": newRegistration.email,
        "subject": "Confirm registration",
        "html": `<a href="http://localhost:3000/registration/confirm/${newRegistration.id}">confirm</a>
    REGISTRATION CODE
    <h2>${newRegistration.code}</h2>
    <br/>
    <br/>
    <a href="http://localhost:3000/registration/cancel/${newRegistration.id}">cancel</a>
    `
    });
};
exports.requestRegistrationCallback = requestRegistrationCallback;
const checkRegistrationCallback = async (req, res, next) => {
    const registrationExists = await Registration_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (registrationExists === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (registrationExists) {
        res.json({ "status": "OK" });
        return;
    }
    ;
    res.json({ "status": "Not Found", "message": "The registration does not exist" });
};
exports.checkRegistrationCallback = checkRegistrationCallback;
const validateRegistrationCodeCallback = async (req, res, next) => {
    const registrationPending = await Registration_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (registrationPending === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (registrationPending === null) {
        //status = 204
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
    if (!(insertedCode === registrationPending.code)) {
        res.json({ "status": "Unauthorized" });
        const currentRegistrationCode = Math.round(Math.random() * 100000000);
        const updatedRegistration = await Registration_1.default.patchOne(req.params.id, currentRegistrationCode).catch((err) => {
            console.log(err);
        });
        if (updatedRegistration === undefined) {
            console.log("Error from confirmRegistrationCallback at RegistrationFactory.patchOne - rejected");
            return;
        }
        ;
        if (updatedRegistration === false) {
            console.log("Error from confirmRegistrationCallback at RegistrationFactory.patchOne - NOT acknowledged");
            return;
        }
        ;
        if (updatedRegistration === true) {
            nodemailer_1.default.sendMail({
                "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
                "to": registrationPending.email,
                "subject": "Registration code just changed",
                "html": `
                <h1>CURRENT REGISTRATION CODE</h1>
                <p>${currentRegistrationCode}</p>
                `
            });
        }
        ;
        return;
    }
    ;
    res.json({ "status": "Authorized" });
};
exports.validateRegistrationCodeCallback = validateRegistrationCodeCallback;
const confirmRegistrationCallback = async (req, res, next) => {
    const registrationPending = await Registration_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (registrationPending === undefined) {
        res.status(500).json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (registrationPending === null) {
        res.json({ "status": "Not Found" });
        return;
    }
    ;
    const userExists = await User_1.default.findByUsernameAndEmail(req.body.username, registrationPending.email).catch((err) => {
        console.log(err);
    });
    if (userExists === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (userExists) {
        if (userExists.username || userExists.email) {
            const fieldUsed = userExists.username ? "username" : userExists.email ? "email" : "";
            res.json({ "status": "Bad Request", "error": { "field": fieldUsed, "message": `${fieldUsed} is already in use` } });
            // return done(`${errorOrigin} - ${fieldUsed} is already in use`, false);
        }
        ;
        // else if (userExists.username && userExists.email) {
        //     res.json({ "status": "Bad Request", "error": {"field": "","message": `username and email are already in use`} });
        //     // return done(`${errorOrigin} - username and email are already in use`, false);
        // };
        return;
    }
    ;
    const signupUser = await User_1.default.postOne({ "username": req.body.username, "password": req.body.password, "email": registrationPending.email, "name": req.body.name }).catch((err) => {
        console.log(err);
    });
    if (signupUser === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    //status = 201
    res.json({ "status": "Created" });
    // done(null, signupUser);
    nodemailer_1.default.sendMail({
        "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
        "to": { "address": signupUser.email, "name": signupUser.username },
        "subject": "Registration",
        "html": `
        Your user account has been registered successfully
        `
    });
    //registrationSuccededAndDeleted
    const registrationDeleted = await Registration_1.default.deleteOne(registrationPending.id).catch((err) => {
        console.log(err);
    });
    if (registrationDeleted === undefined) {
        //status 500
        console.log("Error from confirmRegistrationCallback at registrationDeleted");
        return;
    }
    ;
    if (registrationDeleted) {
        console.log("The registration object could not be deleted");
        return;
    }
    ;
};
exports.confirmRegistrationCallback = confirmRegistrationCallback;
const cancelRegistrationCallback = async (req, res, next) => {
    const registrationPending = await Registration_1.default.deleteOne(req.params.id).catch((err) => {
        console.log(err);
    });
    if (registrationPending === undefined) {
        //status = 500
        res.json({ "status": "Internal Server Error" });
        return;
    }
    ;
    if (registrationPending) {
        //status = 201
        res.json({ "status": "Success" });
    }
    else {
        //status = 200
        res.json({ "status": "Fail" });
    }
    ;
};
exports.cancelRegistrationCallback = cancelRegistrationCallback;
