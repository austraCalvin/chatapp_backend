"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGroupHandler = exports.getGroupListHandler = exports.getJoinListHandler = exports.backupChatCallback = exports.signupCallback = void 0;
const UserContactsUser_1 = __importDefault(require("./DAO/Entity/User/UserContactsUser"));
const UserSendsMessage_1 = __importDefault(require("./DAO/Entity/Message/UserSendsMessage"));
const UserReceivesMessage_1 = __importDefault(require("./DAO/Entity/Message/UserReceivesMessage"));
const Group_1 = __importDefault(require("./DAO/Entity/User/Group"));
const UserJoinsGroup_1 = __importDefault(require("./DAO/Entity/User/UserJoinsGroup"));
const UserConnection_1 = __importDefault(require("./DAO/Entity/User/UserConnection"));
const User_1 = __importDefault(require("./DAO/Entity/User/User"));
const Registration_1 = __importDefault(require("./DAO/Entity/Temp/Registration"));
const nodemailer_1 = __importDefault(require("./nodemailer"));
const signupCallback = async (req, res, next) => {
    const errorOrigin = "Error from passport signup strategy";
    const registrationPending = await Registration_1.default.findById(req.body.id).catch((err) => {
        console.log(err);
    });
    if (registrationPending === undefined) {
        res.status(500).json({ "status": "Rejected" });
        return;
    }
    ;
    if (registrationPending === null) {
        res.json({ "status": "registration eq null" });
        return;
    }
    ;
    const userExists = await User_1.default.findByUsernameAndEmail(req.body.username, registrationPending.email).catch((err) => {
        console.log(err);
    });
    if (userExists === undefined) {
        res.status(500).json({ "status": "Rejected" });
        return;
    }
    ;
    if (userExists) {
        if (userExists.username || userExists.email) {
            const fieldUsed = userExists.username ? "username" : userExists.email ? "email" : "";
            res.status(400).json({ "status": `${fieldUsed} is already in use` });
            // return done(`${errorOrigin} - ${fieldUsed} is already in use`, false);
        }
        else if (userExists.username && userExists.email) {
            res.status(400).json({ "status": `username and email are already in use` });
            // return done(`${errorOrigin} - username and email are already in use`, false);
        }
        ;
    }
    ;
    const signupUser = await User_1.default.postOne({ "username": req.body.username, "password": req.body.password, "email": registrationPending.email, "name": req.body.username }).catch((err) => {
        console.log(err);
    });
    if (signupUser === undefined) {
        res.status(500).json({ "status": "Rejected" });
        return;
    }
    ;
    res.status(201).json({ "status": "Created" });
    // done(null, signupUser);
    nodemailer_1.default.sendMail({
        "from": { "address": "alexandrerivero16@gmail.com", "name": "texty" },
        "to": { "address": signupUser.email, "name": signupUser.username },
        "subject": "Registration",
        "html": `
        Your user account has been registered successfully
        `
    });
};
exports.signupCallback = signupCallback;
const backupChatCallback = async (req, res, next) => {
    console.log("backupChatCallback working...");
    const currentUser = req.user;
    const { chatId } = req.params;
    console.log(`chatId='${chatId}'`);
    const UserHasContact = await UserContactsUser_1.default.findById(chatId).catch((err) => {
        console.log(err);
    });
    const UserJoinsGroup = await UserJoinsGroup_1.default.findById(chatId).catch((err) => {
        console.log(err);
    });
    if (UserHasContact === undefined || UserJoinsGroup === undefined) {
        return console.log(`Error from backupChatCallback at getting ${UserHasContact === undefined ? "contact" : "join"} object`);
    }
    ;
    if (UserHasContact === null && UserJoinsGroup === null) {
        console.log(`backupChatCallback at getting ${UserHasContact === null ? "contact" : "join"} object - default response`);
        return res.json([]);
    }
    ;
    const userSendsMessage = await UserSendsMessage_1.default.find({ "userId": [currentUser.id], "chatId": [UserHasContact ? UserHasContact.contactId : chatId] }).catch((err) => {
        console.log(err);
    });
    if (userSendsMessage === undefined) {
        return;
    }
    ;
    const userReceivesMessage = await UserReceivesMessage_1.default.find({ "userId": [currentUser.id], "chatId": [UserHasContact ? UserHasContact.contactId : chatId], "date": "$null" }).catch((err) => {
        console.log(err);
    });
    if (userReceivesMessage === undefined) {
        return;
    }
    ;
    const chatHistory = Object.values(userSendsMessage ? userSendsMessage.elements : []).concat((userReceivesMessage ? userReceivesMessage.elements : []));
    const orderedByDate = chatHistory.sort((a, b) => {
        const date_a = new Date(a.date), date_b = new Date(b.date);
        return date_a.getTime() - date_b.getTime();
    });
    console.log("backup callback succeded --->");
    console.log(orderedByDate);
    res.json(orderedByDate);
};
exports.backupChatCallback = backupChatCallback;
const getJoinListHandler = async (req, res, next) => {
    console.log("getJoinListHandler began working...");
    console.log(`id='${req.params.id}'`);
    const currentUser = req.user;
    const currentJoin = await UserJoinsGroup_1.default.findById(req.params.id).catch((err) => {
        console.log(err);
    });
    if (!currentJoin) {
        console.log("Error from getJoinListHandler - UserJoinsGroupFactory.findById");
        return;
    }
    ;
    const joins = await UserJoinsGroup_1.default.find({ "groupId": [currentJoin.groupId] }).catch((err) => {
        console.log(err);
    });
    if (joins === undefined) {
        console.log("Error from getJoinListHandler - UserJoinsGroupFactory.find");
        return;
    }
    ;
    res.json(joins ? joins : []);
};
exports.getJoinListHandler = getJoinListHandler;
const getGroupListHandler = async (req, res, next) => {
    console.log("getGroupListHandler began working...");
    const currentUser = req.user;
    const joins = await UserJoinsGroup_1.default.find({ "userId": [currentUser.id] }).catch((err) => {
        console.log(err);
    });
    if (joins === undefined) {
        return;
    }
    ;
    if (joins === null) {
        res.json([]);
        return;
    }
    ;
    const groupIds = new Set();
    joins.forEach((each) => {
        groupIds.add(each.groupId);
    });
    const groups = await Group_1.default.find({ "id": [...groupIds] }).catch((err) => {
        console.log(err);
    });
    if (groups === undefined) {
        return;
    }
    ;
    if (groups === null) {
        res.json([]);
        return;
    }
    ;
    if (joins.length === 0) {
        res.json([]);
        return;
    }
    ;
    const jsonResponse = joins.map((val) => {
        const currentGroup = groups.find((each) => each.id === val.groupId);
        return {
            "id": val.id,
            "type": "group",
            "name": currentGroup.name,
            "description": currentGroup.description
        };
    });
    console.log(`getGroupListHandler - groupList has value=${jsonResponse[0] ? "yes" : "no"}`);
    res.json(jsonResponse);
};
exports.getGroupListHandler = getGroupListHandler;
const postGroupHandler = async (req, res, next) => {
    console.log("getGroupListHandler began working...");
    console.log("invitations", req.body.invitations);
    const currentUser = req.user;
    const postedGroup = await Group_1.default.postOne({ "name": req.body.name, "description": req.body.description }).catch((err) => {
        console.log(err);
    });
    if (!postedGroup) {
        console.log(`postGroupHandler callback - group factory postOne method failed`);
        return;
    }
    ;
    const contactList = await UserContactsUser_1.default.find({ "id": req.body.invitations }).catch((err) => {
        console.log(err);
    });
    if (!contactList) {
        console.log(`postGroupHandler callback - contact-list find method failed`);
        return;
    }
    ;
    console.log(`postGroupHandler callback - contact-list find method suceeded`);
    // const prepareJoins: IPOSTUserJoinsGroupUpdated[] = (contactList.map((val) => {
    //     return { "userId": val.contactId, "name": val.name, "groupId": postedGroup.id };
    // }) as IPOSTUserJoinsGroupUpdated[]).concat({ "userId": currentUser.id, "name": currentUser.username, "groupId": postedGroup.id, "admin": true });
    const prepareJoins = contactList.map((val) => {
        return { "userId": val.contactId, "groupId": postedGroup.id };
    }).concat({ "userId": currentUser.id, "groupId": postedGroup.id, "admin": true });
    const postedJoins = await UserJoinsGroup_1.default.postMany(prepareJoins).catch((err) => {
        console.log(err);
    });
    if (!postedJoins) {
        return;
    }
    ;
    const userIds = contactList.map((val) => {
        return val.contactId;
    }).concat(currentUser.id);
    const userConns = await UserConnection_1.default.find(userIds).catch((err) => {
        console.log(err);
    });
    if (!userConns) {
        return;
    }
    ;
    const localPromise = new Promise((success, danger) => {
        const filteredJoins = postedJoins.filter((val) => val.userId !== currentUser.id).map(async (val) => {
            const foundContact = contactList.find((ele) => val.userId === ele.contactId);
            let user_name = foundContact ? foundContact.name : null;
            if (!user_name) {
                const currentContactUser = await User_1.default.findById(val.userId).catch((err) => {
                    console.log(err);
                });
                if (currentContactUser === undefined) {
                    throw new Error("");
                }
                ;
                user_name = currentContactUser ? currentContactUser.name : "Deleted User";
            }
            ;
            return { "id": val.id, "userId": val.userId, "name": user_name, "date": val.date, "admin": val.admin };
        });
        success(Promise.all(filteredJoins));
    });
    const currentJoin = postedJoins.find((val) => val.userId === currentUser.id);
    res.json({ "id": currentJoin.id, "name": postedGroup.name, "description": postedGroup.description, "admin": currentJoin.admin });
    // res.json({ "id": postedGroup.id, "name": postedGroup.name, "description": postedGroup.description, "joins": filteredJoins });
    const filteredJoins = await localPromise.catch((err) => {
        console.log(err);
    });
    if (!filteredJoins) {
        return;
    }
    ;
    userConns.forEach((user) => {
        if (!user.online) {
            return;
        }
        ;
        filteredJoins.forEach((each) => {
            if (!user.online) {
                return;
            }
            ;
            const currentConn = user.conn;
            if (each.userId === user.id) {
                currentConn.emit("join-group", { "id": each.id, "name": postedGroup.name, "admin": each.admin });
                return;
            }
            ;
            currentConn.emit("add-group-member", { "id": each.id, "name": each.name, "admin": each.admin });
        });
    });
    const currentConn = userConns.find((val) => val.id === currentUser.id);
    if (!currentConn || !currentConn.online) {
        return;
    }
    ;
    currentConn.online;
    filteredJoins.forEach((each) => {
        currentConn.conn.emit("add-group-member", { "id": each.id, "name": each.name, "admin": each.admin });
    });
};
exports.postGroupHandler = postGroupHandler;
