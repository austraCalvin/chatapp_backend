"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserConnection = exports.UserOffline = exports.UserOnline = void 0;
const JoiSchema_1 = require("../../../hooks/JoiSchema");
const UserSendsMessage_1 = __importDefault(require("../Message/UserSendsMessage"));
const Config_1 = require("../../DataBase/Config");
const Message_1 = __importDefault(require("../Message/Message"));
const UserReceivesMessage_1 = __importDefault(require("../Message/UserReceivesMessage"));
const UserJoinsGroup_1 = __importDefault(require("./UserJoinsGroup"));
const UserContactsUser_1 = __importDefault(require("./UserContactsUser"));
const node_events_1 = __importDefault(require("node:events"));
const User_1 = __importDefault(require("./User"));
const joi_1 = __importDefault(require("joi"));
const Group_1 = __importDefault(require("./Group"));
const web_push_1 = __importDefault(require("web-push"));
const nodemailer_1 = __importDefault(require("../../../nodemailer"));
node_events_1.default.setMaxListeners(2000000000);
class IUserOnline {
    constructor(id, connection, pushSubscription) {
        this.id = id;
        this.connection = connection;
        this.pushSubscription = pushSubscription;
        this.id = id;
        this.connection = connection;
        this.pushSubscription = pushSubscription;
    }
    ;
    async send2Db(userSends, message) {
        // //ensure contact exists before current user
        // //is alerted that message was sent
        // const currentUser = await UserFactory.findById(this.id).catch((err) => {
        //     console.log(err);
        // });
        // if (!currentUser) {
        //     return Promise.reject();
        // };
        //ensure contact exists before current user
        //is alerted that message was sent
        let postedMessagePromise;
        if (message.file) {
            postedMessagePromise = Message_1.default.postOne({ "body": message.body, "file": message.file });
        }
        else {
            postedMessagePromise = Message_1.default.postOne({ "body": message.body });
        }
        ;
        const postedMessage = await postedMessagePromise.catch((err) => {
            console.log(err);
        });
        if (!postedMessage) {
            return Promise.reject();
        }
        ;
        const postedUserSendsMessage = await UserSendsMessage_1.default.postOne({ "messageId": postedMessage.id, ...userSends, "userId": this.id }).catch((err) => {
            console.log(err);
        });
        if (!postedUserSendsMessage) {
            return Promise.reject();
        }
        ;
        return { "send": postedUserSendsMessage, "message": postedMessage };
    }
    ;
    async send(userSends, message) {
        const sent2Db = await this.send2Db(userSends, message).catch((err) => {
            console.log(err);
        });
        if (!sent2Db) {
            return Promise.reject();
        }
        ;
        return Promise.resolve(sent2Db.send).finally(async () => {
            const usersReceiveMessage = await sent2Db.send.getReceives().catch((err) => {
                console.log(err);
            });
            if (usersReceiveMessage === undefined) {
                return Promise.reject();
            }
            ;
            if ((usersReceiveMessage === null) || !usersReceiveMessage.elements[0]) {
                return;
            }
            ;
            const userIds = usersReceiveMessage.elements.map((each) => {
                return each.userId;
            });
            console.log("Receiver - user-id array:", userIds);
            const contactUsersConnection = await UserConnectionFactory.find(userIds).catch((err) => {
                console.log(err);
            });
            if (!contactUsersConnection) {
                return;
            }
            ;
            console.log(`UserOnline class - user connection array - ${contactUsersConnection.length === 1 ? `first element:${contactUsersConnection[0]}` : contactUsersConnection.length === 0 ? "none" : "more than one element"}`);
            console.log("usersConnection array:", contactUsersConnection);
            console.log("usersReceiveMessage array:", usersReceiveMessage);
            (usersReceiveMessage.filter((each_a) => {
                return (contactUsersConnection.findIndex((each_b) => (each_b.id === each_a.userId))) === -1 ? false : true;
            })).forEach((each) => {
                const receiverConnection = contactUsersConnection.find((receiver) => {
                    console.log(`Receiver user id=${receiver.id} & receive object user id=${each.userId}`);
                    return (receiver.id === each.userId);
                });
                if (!receiverConnection) {
                    console.log("Unexpected error from UserOnline at send - receives array - the receive object could not find its user");
                    return;
                }
                ;
                console.log(`UserOnline class - receive executed on the user connection - userId=${receiverConnection.id} - online=${receiverConnection.online}`);
                receiverConnection.receive(each, sent2Db.message).then((val) => {
                    // console.log("Received message -");
                    // console.log(val);
                }).catch((err) => {
                    console.log("IUserOnline send - receiverConnection receive catch -");
                    console.log(err);
                });
            });
        });
    }
    ;
    async sendNotification(userReceivesMessage, message) {
        console.log("sendNotification - caraxes");
        console.log("receive", userReceivesMessage);
        const chat = {};
        const preview = {};
        let isAllowed = null;
        let senderName = null;
        const currentUser = await User_1.default.findById(this.id).catch((err) => {
            console.log(err);
        });
        if (!currentUser) {
            return Promise.reject("Error from UserOffline at receive - current user does not exist - unexpected error");
        }
        ;
        const currentConfig = await currentUser.lookup().catch((err) => {
            console.log(err);
        });
        if (currentConfig === undefined) {
            return Promise.reject();
        }
        ;
        if (!currentConfig.notify) {
            return Promise.resolve({
                "push": {
                    "enabled": false
                },
                "email": {
                    "enabled": false
                }
            });
        }
        ;
        const senderId = await userReceivesMessage.getSenderId().catch((err) => {
            console.log(err);
        });
        if (!senderId) {
            return Promise.reject();
        }
        ;
        const contactUser = await User_1.default.findById(senderId).catch((err) => {
            console.log(err);
        });
        if (contactUser === undefined) {
            return Promise.reject();
        }
        ;
        console.log("sendNotification - syrax");
        senderName = contactUser ? contactUser.name : "Deleted User";
        if (userReceivesMessage.chatType === "contact") {
            const currentUserContactsUser = await UserContactsUser_1.default.findByUserIds(this.id, userReceivesMessage.chatId).catch((err) => {
                console.log(err);
            });
            if (currentUserContactsUser === undefined) {
                return Promise.reject();
            }
            ;
            chat.id = userReceivesMessage.chatId;
            isAllowed = currentUserContactsUser ? ({ "notify": currentUserContactsUser.notify, "name": currentUserContactsUser.name ? currentUserContactsUser.name : senderName }) : null;
        }
        else if (userReceivesMessage.chatType === "group") {
            const currentUserJoinsGroup = await UserJoinsGroup_1.default.findByUserId(this.id, userReceivesMessage.chatId).catch((err) => {
                console.log(err);
            });
            const currentUserContactsUser = await UserContactsUser_1.default.findByUserIds(this.id, senderId).catch((err) => {
                console.log(err);
            });
            if (currentUserJoinsGroup === undefined || currentUserContactsUser === undefined) {
                return Promise.reject();
            }
            ;
            chat.id = currentUserJoinsGroup ? currentUserJoinsGroup.id : undefined;
            isAllowed = { "notify": currentUserJoinsGroup ? currentUserJoinsGroup.notify : true, "name": currentUserContactsUser ? (currentUserContactsUser.name ? currentUserContactsUser.name : senderName) : senderName };
        }
        ;
        const notificationEnabled = { "push": { "enabled": currentConfig.push }, "email": { "enabled": currentConfig.email } };
        if (isAllowed) {
            if (isAllowed.notify && currentConfig.push) {
                if (!this.pushSubscription) {
                    console.log(`userId='${this.id}' - subscription='${!!this.pushSubscription}'`);
                    return Promise.reject("Receiver user is offline and unsubscribed for push notifications");
                }
                ;
            }
            if (!isAllowed.notify) {
                notificationEnabled.push.enabled = false;
                notificationEnabled.email.enabled = false;
            }
            ;
            senderName = isAllowed.name;
        }
        ;
        let groupName = null;
        if (userReceivesMessage.chatType === "group") {
            const currentGroup = await Group_1.default.findById(userReceivesMessage.chatId).catch((err) => {
                console.log(err);
            });
            if (currentGroup === undefined) {
                return Promise.reject();
            }
            ;
            groupName = currentGroup ? currentGroup.name : "Deleted User";
        }
        ;
        chat.id = groupName ? chat.id : senderId;
        chat.name = senderName;
        preview.user_name = groupName ? senderName : undefined;
        preview.body = message.body ? message.body : "Deleted Message";
        const push = { chat, message: preview };
        const result = {
            "push": { "enabled": false },
            "email": { "enabled": false }
        };
        result.push.enabled = notificationEnabled.push.enabled;
        result.email.enabled = notificationEnabled.email.enabled;
        console.log("notification enabled: ", result);
        if (notificationEnabled.push.enabled) {
            if (!this.pushSubscription) {
                result.push.error = "push is allowed but subscription is null";
            }
            else {
                console.log("webpush.sendNotification");
                const sendPush = await web_push_1.default.sendNotification(this.pushSubscription, JSON.stringify(push)).catch((err) => {
                    console.log(err);
                });
                if (!sendPush) {
                    return Promise.reject("Error from UserOffline at receive - webpush failed sending a notification");
                }
                ;
                result.push.response = sendPush;
                delete result.push.error;
            }
            ;
        }
        ;
        if (notificationEnabled.email.enabled) {
            const sender = push.message.user_name ? push.message.user_name : push.chat.name;
            const sendEmail = await nodemailer_1.default.sendMail({
                "from": { "address": "alexandrerivero16@gmail.com", "name": sender },
                "to": { "address": currentUser.email, "name": currentUser.username },
                "subject": (`@${sender} sent you a direct message`),
                "html": (`<h1>@${sender} sent you a direct message</h1>
                    <div>
    
                    ${push.message.body}
    
                    </div>
                    `)
            }).catch((err) => {
                console.log("Error from sendEmail");
                console.log(err);
            });
            if (!sendEmail) {
                return Promise.reject("Error from UserOffline at receive - nodemailer failed sending an email");
            }
            ;
            result.email.response = sendEmail;
            delete result.email.error;
        }
        ;
        return result;
    }
    ;
    subscribe(sub) {
        console.log("subscription being inserted into the user connection object");
        this.pushSubscription = sub;
        console.log("pushSubscription:", sub);
    }
    ;
}
;
class UserOnline extends IUserOnline {
    constructor(userId, connection, pushSubscription) {
        super(userId, connection, pushSubscription);
    }
    ;
    async receive(userReceivesMessage, message) {
        console.log(`UserOnline class at receive - message-to-deliver - Receive`);
        console.log(`obj id: ${userReceivesMessage.id}`);
        console.log(`user id: ${userReceivesMessage.userId}`);
        console.log(`chat id: ${userReceivesMessage.chatId}`);
        console.log(`user connection is ${this.connection ? (this.connection.connected ? "online" : "offline") : "offline"}`);
        console.log(`UserOnline class at receive - message-to-deliver - connection=${this.connection ? "" : "in"}valid`);
        let chatId;
        if (userReceivesMessage.chatType === "group") {
            const currentUserJoinsGroup = await UserJoinsGroup_1.default.findByUserId(this.id, userReceivesMessage.chatId).catch((err) => {
                console.log(err);
            });
            if (currentUserJoinsGroup === undefined) {
                return Promise.reject("Error from UserOnline class at receive - fail");
            }
            ;
            if (currentUserJoinsGroup === null) {
                return Promise.reject("Error from UserOnline class at receive - could not find the join of the user");
            }
            ;
            chatId = currentUserJoinsGroup.id;
        }
        else {
            chatId = userReceivesMessage.chatId;
        }
        ;
        const deliveredDateRaw = await this.connection.emitWithAck("message-to-deliver", { ...userReceivesMessage, chatId, "body": message.body }).catch((err) => {
            console.log(err);
        });
        if (!deliveredDateRaw) {
            return Promise.reject(`Error from UserOnline class at receive - receive object could not be sent - receiveId=${userReceivesMessage.id}`);
        }
        ;
        console.log(`UserOnline class at receive - message-to-deliver - typeof deliveredDate=${typeof deliveredDateRaw}`);
        const deliveredDate = deliveredDateRaw;
        console.log("UserOnline class at receive - message has been delivered");
        const acknowledged = await UserReceivesMessage_1.default.patchOne(userReceivesMessage.id, { "date": deliveredDate }).catch((err) => {
            console.log(err);
        });
        if (acknowledged === undefined) {
            return Promise.reject("Error from UserOnline class at receive - receive could not be patched");
        }
        ;
        if (acknowledged === false) {
            return Promise.reject(`Error from user-${this.id} from receive function - the user-receives-message could not be patched - not acknowledged - receiveId: ${userReceivesMessage.id} & date: ${deliveredDate}`);
        }
        ;
        console.log("UserOnline class at receive - receive just patched");
        return Promise.resolve({ "receive": { ...userReceivesMessage, "date": deliveredDate } }).finally(async () => {
            this.sendNotification(userReceivesMessage, message).then((e) => {
                console.log("notification success:", e);
            }).catch((err) => {
                console.log(err);
            });
            const sendObj = await userReceivesMessage.lookup().catch((err) => {
                console.log(err);
            });
            if (sendObj === undefined) {
                return console.log("Error from UserOnline class at receive - request for send object - rejected");
            }
            ;
            if (sendObj === null) {
                return console.log("Error from UserOnline class at receive - send object is null");
            }
            ;
            const senderUser = await UserConnectionFactory.findById(sendObj.userId).catch((err) => {
                console.log(err);
            });
            if (!senderUser) {
                return console.log("Error from UserOnline class - sender-user connection does not exist");
            }
            ;
            if (!senderUser.online) {
                return console.log(`UserOnline class - sender-user is offline`);
            }
            ;
            console.log(`UserOnline class - sender-user is online`);
            if (userReceivesMessage.chatType === "contact") {
                const isSentMessageDelivered = await UserSendsMessage_1.default.patchOne({ "id": userReceivesMessage.sendId, "deliveredDate": deliveredDate }).catch((err) => {
                    console.log(err);
                });
                if (isSentMessageDelivered === undefined) {
                    console.log("Error from UserOnline class at receive - receive could not be patched - rejected");
                    return Promise.reject();
                }
                ;
                if (!isSentMessageDelivered) {
                    console.log("Error from UserOnline class at receive - receive could not be patched - not acknowledged");
                    return Promise.reject();
                }
                ;
                const currentContactsContact = await UserContactsUser_1.default.findByUserIds(this.id, userReceivesMessage.chatId).catch((err) => {
                    console.log(err);
                });
                if (currentContactsContact === undefined) {
                    return Promise.reject();
                }
                ;
                const contactContactsCurrent = await UserContactsUser_1.default.findByUserIds(userReceivesMessage.chatId, this.id).catch((err) => {
                    console.log(err);
                });
                if (contactContactsCurrent === undefined) {
                    return Promise.reject();
                }
                ;
                console.log("kingsman-2", contactContactsCurrent.contactId);
                senderUser.setMessageStatus({ [userReceivesMessage.sendId]: { "chatId": this.id, "deliveredDate": deliveredDate } }, {});
                // senderUser.setMessageStatus({ [userReceivesMessage.sendId]: { "chatId": userReceivesMessage.chatId, "deliveredDate": deliveredDate } }, { [userReceivesMessage.id]: { "chatId": userReceivesMessage.chatId, "date": deliveredDate } });
            }
            else if (userReceivesMessage.chatType === "group") {
                const isReceiveObjDelivered = await UserReceivesMessage_1.default.find({ "sendId": [userReceivesMessage.sendId], "date": undefined }).catch((err) => {
                    console.log(err);
                });
                if (isReceiveObjDelivered === undefined) {
                    console.log(`UserOnline class - isSentMessageDelivered failed`);
                    return Promise.reject();
                }
                ;
                const currentJoinsGroup = await UserJoinsGroup_1.default.findByUserId(this.id, userReceivesMessage.chatId).catch((err) => {
                    console.log(err);
                });
                if (!currentJoinsGroup) {
                    console.log(`UserOnline class - currentJoinsGroup is null - chatId=${userReceivesMessage.chatId}`);
                    return Promise.reject();
                }
                ;
                const contactJoinsGroup = await UserJoinsGroup_1.default.findByUserId(senderUser.id, userReceivesMessage.chatId).catch((err) => {
                    console.log(err);
                });
                if (!contactJoinsGroup) {
                    console.log(`UserOnline class - contactJoinsGroup is null - senderId=${senderUser.id} - groupId=${userReceivesMessage.chatId}`);
                    return Promise.reject();
                }
                ;
                console.log(`UserOnline class - message-status triggered - method executed`);
                if (isReceiveObjDelivered) {
                    senderUser.setMessageStatus({}, { [userReceivesMessage.id]: { "userId": this.id, "chatId": contactJoinsGroup.id, "date": deliveredDate } });
                    return Promise.reject();
                }
                ;
                const isSentMessageDelivered = await UserSendsMessage_1.default.patchOne({ "id": userReceivesMessage.sendId, "deliveredDate": deliveredDate }).catch((err) => {
                    console.log(err);
                });
                if (isSentMessageDelivered === undefined) {
                    console.log("Error from UserOnline class at receive - receive could not be patched - rejected");
                    return Promise.reject();
                }
                ;
                if (!isSentMessageDelivered) {
                    console.log("Error from UserOnline class at receive - receive could not be patched - not acknowledged");
                    return Promise.reject();
                }
                ;
                senderUser.setMessageStatus({ [userReceivesMessage.sendId]: { "chatId": contactJoinsGroup.id, "deliveredDate": deliveredDate } }, { [userReceivesMessage.id]: { "userId": this.id, "chatId": contactJoinsGroup.id, "date": deliveredDate } });
            }
            ;
        });
    }
    ;
}
exports.UserOnline = UserOnline;
;
class UserOffline extends IUserOnline {
    constructor(userId, pushSubscription) {
        super(userId, undefined, pushSubscription);
    }
    ;
    async receive(userReceivesMessage, message) {
        const notificationSuccess = await this.sendNotification(userReceivesMessage, message).catch((err) => {
            console.log(err);
        });
        if (!notificationSuccess) {
            return Promise.reject();
        }
        ;
        return Promise.resolve({
            "receive": undefined,
            notification: {
                "push": {
                    "enabled": notificationSuccess.push.enabled,
                    "success": notificationSuccess.push.response,
                    "error": notificationSuccess.push.error
                },
                "email": {
                    "enabled": notificationSuccess.email.enabled,
                    "success": notificationSuccess.email.response,
                    "error": notificationSuccess.email.error
                }
            }
        });
    }
    ;
}
exports.UserOffline = UserOffline;
;
class UserConnection {
    constructor(id, connection) {
        this.id = id;
        this.listeners = {};
        this.eventEmitter = new node_events_1.default({ "captureRejections": true });
        if (connection) {
            this.strategy = new UserOnline(id, connection, this.pushSubscription);
            this.connection = connection;
            this._online = true;
            this.synch();
        }
        else {
            this._online = false;
            this.strategy = new UserOffline(id, this.pushSubscription);
        }
        ;
    }
    ;
    get conn() {
        return this.connection;
    }
    ;
    get online() {
        return this._online;
    }
    ;
    get isWebpush() {
        return this.pushSubscription ? true : false;
    }
    ;
    async sendNotification(userReceivesMessage, message) {
        return this.strategy.sendNotification(userReceivesMessage, message);
    }
    ;
    subscribe(sub) {
        return this.strategy.subscribe(sub);
    }
    ;
    unsubscribe() {
        delete this.pushSubscription;
    }
    ;
    setMessageStatus(sends, receives) {
        if (this.connection && this.connection.connected) {
            this.connection.emit("message-status", sends, receives);
        }
        ;
        return;
    }
    ;
    async setOnline(online, connection) {
        console.log(`UserConnection at setOnline - User-${this.id} is ${online ? "online" : "offline"}`);
        if (online) {
            this.connection = connection;
            this._online = true;
            this.strategy = new UserOnline(this.id, this.connection, this.pushSubscription);
            this.synch();
            // this.eventEmitter.emit("online", this);
            this.eventEmitter.emit("online");
        }
        else {
            this._online = false;
            this.strategy = new UserOffline(this.id, this.pushSubscription);
            if (this.connection) {
                this.connection.removeAllListeners("contact-online");
                this.connection.removeAllListeners("message-pending");
                this.connection.removeAllListeners("message-status");
                this.connection.removeAllListeners("disconnect");
                this.connection.removeAllListeners("sender-id");
                this.connection.removeAllListeners("send-data");
                this.connection.removeAllListeners("message-content");
            }
            ;
            if (this.contact) {
                this.unto();
            }
            ;
            const currentUser = await User_1.default.touch(this.id).catch((err) => {
                console.log(err);
            });
            if (!currentUser) {
                return Promise.reject(`Error from UserConnection class at setOnline - the current user could not be touched`);
            }
            ;
            this.eventEmitter.emit("offline");
        }
        ;
    }
    ;
    // onOnline(callback: (contactConnection: UserConnection) => void): void {
    //     this.eventEmitter.on("online", callback);
    // };
    onOnline(callback) {
        this.eventEmitter.on("online", callback);
    }
    ;
    onOffline(callback) {
        this.eventEmitter.on("offline", callback);
    }
    ;
    async unto() {
        for (const property in this.listeners) {
            const eventName = property;
            if (!this.listeners[eventName]) {
                console.log(`Error from UserConnection class at unto - the listener function name=${eventName} is null`);
                return;
            }
            ;
            this.contact.eventEmitter.off(eventName, this.listeners[eventName]);
        }
        ;
        this.contact = undefined;
    }
    ;
    async to(contactId) {
        const allowed = { online: true, "lastOnline": true };
        console.log("UserConnection class at to - start working...");
        if (this.contact) {
            if (this.contact.id !== contactId) {
                this.unto();
            }
            ;
        }
        ;
        const currentUser = await User_1.default.findById(this.id).catch((err) => {
            console.log(err);
        });
        if (!currentUser) {
            return Promise.reject(`Error from UserConnection class at to - ${currentUser === null ? `current user does not exist - id=${this.id}` : "rejected"}`);
        }
        ;
        const isAllowed_st = await currentUser.isAllowed("contact", contactId).catch((err) => {
            console.log(err);
        });
        if (!isAllowed_st || isAllowed_st.blocked || isAllowed_st.request) {
            return [null, undefined];
        }
        ;
        const currentUserConfig = await currentUser.lookup().catch((err) => {
            console.log(err);
        });
        if (currentUserConfig === undefined) {
            return Promise.reject("Error from UserConnection class at to - rejected");
        }
        ;
        if (currentUserConfig && currentUserConfig.online === "lastOnline") {
            if (currentUserConfig.lastOnline === "contact") {
                if (!isAllowed_st.contact) {
                    allowed.online = false;
                    allowed.lastOnline = false;
                    return [null, undefined];
                }
                ;
            }
            ;
            if (currentUserConfig.lastOnline === "none") {
                allowed.online = false;
                allowed.lastOnline = false;
                return [null, undefined];
            }
            ;
        }
        ;
        if (currentUserConfig.lastOnline === "contact") {
            if (!isAllowed_st.contact) {
                allowed.lastOnline = false;
            }
            ;
        }
        ;
        if (currentUserConfig.lastOnline === "none") {
            allowed.lastOnline = false;
        }
        ;
        const contactUser = await User_1.default.findById(contactId).catch((err) => {
            console.log(err);
        });
        if (!contactUser) {
            return Promise.reject(`Error from UserConnection class at to - ${contactUser === null ? `contact user does not exist - id=${contactId}` : "rejected"}`);
        }
        ;
        const isAllowed_nd = await contactUser.isAllowed("contact", this.id).catch((err) => {
            console.log(err);
        });
        if (!isAllowed_nd || isAllowed_nd.blocked) {
            return [null, undefined];
        }
        ;
        const contactUserConfig = await contactUser.lookup().catch((err) => {
            console.log(err);
        });
        if (contactUserConfig === undefined) {
            return Promise.reject("Error from UserConnection class at to - rejected");
        }
        ;
        if (contactUserConfig && contactUserConfig.online === "lastOnline") {
            if (contactUserConfig.lastOnline === "contact") {
                if (!isAllowed_nd.contact) {
                    allowed.online = false;
                    allowed.lastOnline = false;
                    return [null, undefined];
                }
                ;
            }
            ;
            if (contactUserConfig.lastOnline === "none") {
                allowed.online = false;
                allowed.lastOnline = false;
                return [null, undefined];
            }
            ;
        }
        ;
        if (contactUserConfig.lastOnline === "contact") {
            if (!isAllowed_nd.contact) {
                allowed.lastOnline = false;
            }
            ;
        }
        ;
        if (contactUserConfig.lastOnline === "none") {
            allowed.lastOnline = false;
        }
        ;
        let connection_ = null;
        const contactConnection = await UserConnectionFactory.findById(contactId).catch((err) => {
            console.log(err);
        });
        if (contactConnection === undefined) {
            return Promise.reject("Error from UserConnection class at to - rejected");
        }
        ;
        if (contactConnection === null) {
            const awaitContactUser = await UserConnectionFactory.postOne(contactId).catch((err) => {
                console.log(err);
            });
            if (awaitContactUser === undefined) {
                return Promise.reject("Error from UserConnection class at to - rejected");
            }
            ;
            connection_ = awaitContactUser;
        }
        else {
            connection_ = contactConnection;
        }
        ;
        if (this.contact) {
            if (this.contact.id !== contactId) {
                this.contact = connection_;
            }
            ;
        }
        else {
            this.contact = connection_;
        }
        ;
        return [connection_, allowed];
    }
    ;
    synch() {
        console.log("SYNCH BEGINS WORKING...");
        const connection = this.connection;
        connection.on("disconnect", (disconnectReason, description) => {
            console.log(`Disconnect event - User-${this.id} has gone offline`);
            this.setOnline(false);
        });
        connection.on("sender-id", async (sendId, callback) => {
            const sendMessage = await UserSendsMessage_1.default.findById(sendId).catch((err) => {
                console.log(err);
            });
            if (!sendMessage) {
                console.log("Error from UserConnection class at sync - send-message could not be obtained");
                return Promise.reject();
            }
            ;
            const contactJoinsGroup = await UserJoinsGroup_1.default.findByUserId(sendMessage.userId, sendMessage.chatId).catch((err) => {
                console.log(err);
            });
            if (!contactJoinsGroup) {
                console.log("Error from UserConnection class at sync - contactJoinsGroup could not be obtained");
                return Promise.reject();
            }
            ;
            callback(contactJoinsGroup.id);
        });
        connection.on("send-data", async (sendId, callback) => {
            const sendObject = await UserSendsMessage_1.default.findById(sendId).catch((err) => {
                console.log(err);
            });
            if (!sendObject) {
                return;
            }
            ;
            callback(sendObject.messageId);
        });
        connection.on("message-content", async (messageId, callback) => {
            const messageContent = await Message_1.default.findById(messageId).catch((err) => {
                console.log(err);
            });
            if (!messageContent) {
                return;
            }
            ;
            callback(messageContent);
        });
        connection.on("contact-online", async (contactId) => {
            const contactUser_st = await User_1.default.findById(contactId).catch((err) => {
                console.log(err);
            });
            if (!contactUser_st) {
                console.log(`ContactUser id='${contactId}'`);
                return;
            }
            ;
            this.to(contactId).then(async ([contactConnection, allowed]) => {
                if (contactConnection === null) {
                    console.log(`User-${this.id} is not listening to anyone`);
                    //can't see if contact user is online 
                    //or their last online
                    return;
                }
                ;
                console.log(`User-${this.id} began listening to User-${contactId} - online=${allowed.online ? "yes" : "no"} & lastOnline=${allowed.lastOnline ? "yes" : "no"}`);
                if (contactConnection.online) {
                    connection.emit("contact-online", contactId, { "online": true });
                }
                else {
                    console.log("contact-offline -", `id=${contactUser_st.id}`, `lastOnline=${contactUser_st.lastOnline}`);
                    connection.emit("contact-online", contactId, { "online": false, "lastOnline": allowed.lastOnline ? contactUser_st.lastOnline : undefined });
                }
                ;
                const onlineListener = () => {
                    if (!allowed.online) {
                        return;
                    }
                    ;
                    console.log(`User-${contactId} has gone online`);
                    connection.emit("contact-online", contactId, { "online": true });
                };
                const offlineListener = async () => {
                    console.log(`User-${contactId} has gone offline`);
                    const contactUser_nd = await User_1.default.findById(contactId).catch((err) => {
                        console.log(err);
                    });
                    if (!contactUser_nd) {
                        return console.log(`User-${contactId} no longer exists`);
                    }
                    ;
                    if (!allowed.lastOnline) {
                        return;
                    }
                    ;
                    console.log(`UserConnection class at offlineListener - currentUser=${this.id} & contactUser=${contactId} - online=${allowed.online ? "yes" : "no"} & lastOnline=${allowed.lastOnline ? "yes" : "no"}`);
                    connection.emit("contact-online", contactId, { "online": false, "lastOnline": contactUser_nd.lastOnline });
                };
                this.listeners.online = onlineListener;
                this.listeners.offline = offlineListener;
                contactConnection.onOnline(onlineListener);
                contactConnection.onOffline(offlineListener);
            }).catch((err) => {
                console.log(err);
            });
        });
        connection.on("contact-data", async (contactId, cb) => {
            console.log("contact-data inspection");
            console.log(contactId);
            const contactData = await User_1.default.findById(contactId).catch((err) => {
                console.log(err);
            });
            if (!contactData) {
                return;
            }
            ;
            cb({ "name": contactData.name ? contactData.name : contactData.username, "description": "random" });
        });
        //message to send by the current user
        connection.on("message-pending", async (userSends, message, callback) => {
            console.log(`MESSAGE PENDING - CHAT - id=${userSends.chatId} - type=${userSends.chatType}`);
            if (message.file) {
                return;
            }
            ;
            let chatId;
            if (userSends.chatType === "contact") {
                chatId = userSends.chatId;
            }
            else {
                const userJoinsGroup = await UserJoinsGroup_1.default.findById(userSends.chatId).catch((err) => {
                    console.log(err);
                });
                if (!userJoinsGroup) {
                    return;
                }
                ;
                const group = await Group_1.default.findById(userJoinsGroup.groupId).catch((err) => {
                    console.log(err);
                });
                if (!group) {
                    return;
                }
                ;
                chatId = group.id;
            }
            ;
            console.log(`MESSAGE PENDING - chatId=${chatId}`);
            this.send({ ...userSends, chatId }, message).then(async (userSentMessage) => {
                // "id": IUserSendsMessage["id"];
                // "userId": IUser["id"]
                // "messageId": IMessage["id"]
                // "date": IUserSendsMessage["date"];
                // "chatType": IChat["type"];
                // "chatId": IChat["id"];
                // contact create
                if (userSends.chatType === "contact") {
                    const currentContactsContact = await UserContactsUser_1.default.findByUserIds(this.id, userSends.chatId).catch((err) => {
                        console.log(err);
                    });
                    if (currentContactsContact === undefined) {
                        return;
                    }
                    else if (currentContactsContact === null) {
                        const contactUser = await User_1.default.findById(userSends.chatId).catch((err) => {
                            console.log(err);
                        });
                        if (!contactUser) {
                            return;
                        }
                        ;
                        const postedContact = await UserContactsUser_1.default.postOne({ "userId": this.id, "contactId": userSends.chatId, "name": contactUser.name ? contactUser.name : contactUser.username }).catch((err) => {
                            console.log(err);
                        });
                        if (postedContact === undefined) {
                            return;
                        }
                        ;
                        this.conn?.emit("add-contact", {
                            "id": postedContact.id,
                            "userId": contactUser.id,
                            "user_name": postedContact.name,
                        });
                    }
                    ;
                }
                ;
                //
                callback({ ...userSentMessage, "chatId": userSends.chatId });
            }).catch((err) => {
                if (err) {
                    console.log("Error from UserConnection at sync - MESSAGE-PENDING EVENT -", err);
                    callback(undefined);
                }
                ;
            });
        });
        //message-status
        connection.on("message-status", async (sends, receives) => {
            const result = { "sends": {}, "receives": {} };
            const localPromise_st = [];
            for (const sendId in sends) {
                localPromise_st.push(UserSendsMessage_1.default.findById(sendId));
            }
            ;
            const localPromise_nd = [];
            for (const receiveId in receives) {
                localPromise_nd.push(UserReceivesMessage_1.default.findById(receiveId));
            }
            ;
            Promise.all(localPromise_st).then((success) => {
                success.forEach((each) => {
                    if (each) {
                        if (sends[each.id] === "sent") {
                            result.sends = { [each.id]: { "deliveredDate": each.deliveredDate } };
                        }
                        else if (sends[each.id] === "delivered") {
                            result.sends = { [each.id]: { "readDate": each.readDate } };
                        }
                        ;
                    }
                    ;
                    console.log("UserConnection class at message-status on event - userSendsMessage is null");
                });
            }).catch((err) => {
                console.log(err);
            });
            Promise.all(localPromise_nd).then((success) => {
                success.forEach((each) => {
                    if (each) {
                        if (receives[each.id] === "sent") {
                            result.receives = { [each.id]: { "chatId": each.chatId, "date": each.date } };
                        }
                        else if (receives[each.id] === "delivered") {
                            result.receives = { [each.id]: { "chatId": each.chatId, "readDate": each.readDate } };
                        }
                        ;
                    }
                    ;
                    console.log("UserConnection class at message-status on event - userReceivesMessage is null");
                });
            }).catch((err) => {
                console.log(err);
            });
            this.setMessageStatus(result.sends, result.receives);
        });
        //message to deliver to the current user
        UserReceivesMessage_1.default.find({ "userId": [this.id], "date": undefined }).then(async (userReceivesMessages) => {
            console.log(`UserConnection class at sync - userId=${this.id} - checking receives`);
            if (!userReceivesMessages) {
                console.log("UserConnection class at synch - message-to-deliver - userReceivesMessages array is null");
                return;
            }
            ;
            if (!userReceivesMessages.elements[0]) {
                console.log("UserConnection class at synch - message-to-deliver - userReceivesMessages array is empty");
                return;
            }
            ;
            const lookup = await userReceivesMessages.lookup().catch((err) => {
                console.log(err);
            });
            if (!lookup) {
                console.log(`Error from UserConnection class at synch - message-to-deliver - receive lookup failed`);
                return;
            }
            ;
            const messages = await lookup.getMessages().catch((err) => {
                console.log(err);
            });
            if (messages === undefined) {
                console.log(`Error from UserConnection class at synch - message-to-deliver - messages fetch failed`);
                return;
            }
            ;
            if (messages === null) {
                console.log("Error from UserConnection class at synch - message-to-deliver - message not found");
            }
            ;
            userReceivesMessages.forEach(each => {
                if (!(lookup.id(each.sendId))) {
                    console.log("Error from UserConnection class at synch - message-to-deliver - send message is null");
                }
                ;
                const message = messages[lookup.id(each.sendId).messageId];
                this.receive(each, message).then((success) => {
                    if (!success) {
                        return;
                    }
                    ;
                    if (success.receive) {
                        console.log(`UserConnection class at synch - User received the message - deliveredDate=${success.receive.date ? "val" : "none"}`);
                    }
                    ;
                    if (success.notification) {
                        const result = Number(success.notification.push) + Number(success.notification.email);
                        console.log(`UserConnection class at synch - User ${success.notification.push.enabled || success.notification.email.enabled ? (result ? "received" : "didn't receive") : "didn't receive"} the notification - push=${success.notification.push} email=${success.notification.email}`);
                    }
                    ;
                }).catch((err) => {
                    console.log("UserConnection sync - receive method catch -", err);
                });
            });
        }).catch((err) => {
            console.log(err);
        });
        //message-to-read by the current user
        // UserReceivesMessageFactory.find({ "userId": [this.id], "readDate": undefined }).then(async (userReceivesMessages) => {
        //     if (!userReceivesMessages) {
        //         console.log("message-to-read - userReceivesMessages array is null");
        //         return;
        //     };
        //     if (!userReceivesMessages.elements[0]) {
        //         console.log("message-to-read - userReceivesMessages array is empty");
        //         return;
        //     };
        //     const currentUser = await UserFactory.findById(this.id).catch((err) => {
        //         console.log(err);
        //     });
        //     if (!currentUser) {
        //         return;
        //     };
        //     const currentUserConfig = await currentUser.lookup().catch((err) => {
        //         console.log(err);
        //     });
        //     if (currentUserConfig === undefined) {
        //         return;
        //     };
        //     //if the current does not allow the read feature
        //     //they will not be notified about messages to read
        //     if (currentUserConfig && !currentUserConfig.read) {
        //         return;
        //     };
        //     //userReceivesMessages gets its respective userSendsMessages
        //     const lookups = await userReceivesMessages.lookup().catch((err) => {
        //         throw new Error(err);
        //     });
        //     if (!lookups) {
        //         return;
        //     };
        //     //From the userSendsMessages, it's obtained the users
        //     //who send the messages to the current user
        //     const senderUsers = await lookups.getUsers().catch((err) => {
        //         throw new Error(err);
        //     });
        //     if (!senderUsers) {
        //         return;
        //     };
        //     //those sender users are used for obtaining their config
        //     const contactConfigs = await senderUsers.lookup().catch((err) => {
        //         throw new Error(err);
        //     });
        //     if (!contactConfigs) {
        //         return;
        //     };
        //     const isAllowed_1 = senderUsers.isAllowed("contact", this.id),
        //         isAllowed_2 = senderUsers.isAllowed("contact", this.id, true);
        //     const isAllowed = await Promise.all([isAllowed_1, isAllowed_2]).catch((err) => {
        //         throw new Error(err);
        //     });
        //     const unique: Record<IUser["id"], IUserReceivesMessage[]> = {};
        //     userReceivesMessages.forEach((each) => {
        //         const sendObj = lookups.id(each.sendId);
        //         if (!unique[sendObj.userId]) {
        //             unique[sendObj.userId] = [each];
        //             return;
        //         };
        //         unique[sendObj.userId].push(each);
        //     });
        //     for (const senderId in unique) {
        //         const senderAllows = isAllowed[0][senderId],
        //             userAllows = isAllowed[1][senderId];
        //         if (!senderAllows && !userAllows) {
        //             continue;
        //         };
        //         if ((senderAllows && !senderAllows.read) || (userAllows && !userAllows.read)) {
        //             delete unique[senderId];
        //         };
        //     };
        //     const filteredUserReceivesMessages = Object.values(unique).flat(1);
        //     const userUnreadMessages: IMessageToRead = {};
        //     filteredUserReceivesMessages.forEach(async (each) => {
        //         if (!userUnreadMessages[each.chatId]) {
        //             userUnreadMessages[each.chatId] = [];
        //         };
        //         userUnreadMessages[each.chatId] = [...userUnreadMessages[each.chatId], each.id];
        //     });
        //     (this.connection as UserWebSocket).emit("message-to-read", userUnreadMessages, async (userReadMessages) => {
        //         for (const receiveId in userReadMessages) {
        //             const patchedElement = await UserReceivesMessageFactory.patchOne(receiveId, { "readDate": userReadMessages[receiveId] }).catch((err) => {
        //                 console.log(err);
        //             });
        //             if (!patchedElement) {
        //                 return;
        //             };
        //             const userReceivesMessage = await UserReceivesMessageFactory.findById(receiveId).catch((err) => {
        //                 console.log(err);
        //             });
        //             if (!userReceivesMessage) {
        //                 return;
        //             };
        //             const lookup = await userReceivesMessage.lookup().catch((err) => {
        //                 console.log(err);
        //             });
        //             if (!lookup) {
        //                 return;
        //             };
        //             const senderUser = await UserConnectionFactory.findById(lookup.userId).catch((err) => {
        //                 console.log(err);
        //             });
        //             if (!senderUser) {
        //                 return;
        //             };
        //             if (senderUser.online) {
        //                 if (lookup.chatType === "contact") {
        //                     senderUser.setMessageStatus({ [userReceivesMessage.sendId]: { "readDate": userReadMessages[receiveId] } }, {});
        //                 } else if (lookup.chatType === "group") {
        //                     const isSentMessageRead = await UserReceivesMessageFactory.find({ "sendId": [userReceivesMessage.sendId], "readDate": undefined }).catch((err) => {
        //                         console.log(err);
        //                     });
        //                     if (isSentMessageRead === undefined) {
        //                         return;
        //                     };
        //                     if (isSentMessageRead) {
        //                         senderUser.setMessageStatus({}, { [userReceivesMessage.id]: { "chatId": userReceivesMessage.chatId, "readDate": userReadMessages[receiveId] } });
        //                         return;
        //                     };
        //                     senderUser.setMessageStatus({ [userReceivesMessage.sendId]: { "readDate": userReadMessages[receiveId] } }, { [userReceivesMessage.id]: { "chatId": userReceivesMessage.chatId, "readDate": userReadMessages[receiveId] } });
        //                 };
        //             };
        //         };
        //     });
        // }).catch((err) => {
        //     console.log(err);
        // });
    }
    ;
    async send(userSends, message) {
        if (message.file) {
            // return await this.strategy.send(userSends, message);
            return Promise.reject();
        }
        ;
        const result = await this.strategy.send(userSends, message).catch((err) => {
            console.log(err);
        });
        if (!result) {
            return Promise.reject();
        }
        ;
        return result;
    }
    ;
    async receive(userReceivesMessage, message) {
        if (userReceivesMessage.chatType === "contact") {
            //ensure contact exists before receiving a message from them
            const contactId = await userReceivesMessage.getSenderId().catch((err) => {
                console.log(err);
            });
            if (!contactId) {
                return Promise.reject();
            }
            ;
            const contextUsers = await User_1.default.find([this.id, contactId]).catch((err) => {
                console.log(err);
            });
            if (!contextUsers) {
                return Promise.reject();
            }
            ;
            const currentUser = contextUsers.id(this.id), contactUser = contextUsers.id(contactId);
            const isAllowed = await currentUser.isAllowed("contact", contactId).catch((err) => {
                console.log(err);
            });
            if (!isAllowed) {
                console.log("Error from UserConnection at receive - ONE OF THE ALLOWED IS NULL");
                return Promise.reject();
            }
            ;
            if (!isAllowed.contact) {
                const postedContact = await UserContactsUser_1.default.postOne({ "userId": this.id, "contactId": contactId, "verified": false }).catch((err) => {
                    console.log(err);
                });
                if (!postedContact) {
                    return Promise.reject();
                }
                ;
                if (this._online) {
                    this.connection.emit("add-contact", {
                        "id": postedContact.id,
                        "userId": contactUser.id,
                        "user_name": contactUser.name ? contactUser.username : contactUser.name
                    });
                }
                ;
            }
            ;
            //ensure contact exists before receiving a message from them
        }
        ;
        return this.strategy.receive(userReceivesMessage, message);
    }
    ;
}
exports.UserConnection = UserConnection;
;
class UserConnectionFactory {
    constructor() { }
    ;
    // private static eventEmitter = new EventEmitter({ "captureRejections": true });
    static async find(id) {
        const isValid = joi_1.default.array().items(JoiSchema_1.idJoiSchema).min(1).validate(id, { "stripUnknown": true });
        if (isValid.error) {
            return Promise.reject(`Error from UserConnectionFactory class at find - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const elementFound = await Config_1.SessionStorageDB.collection("userConnections").getMany({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserConnectionFactory class at find - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async findById(id) {
        const elementFound = await Config_1.SessionStorageDB.collection("userConnections").getOne({ id }).catch((err) => {
            console.log(err);
        });
        if (elementFound === undefined) {
            return Promise.reject(`Error from UserConnectionFactory class at findById - rejected`);
        }
        ;
        return Promise.resolve(elementFound);
    }
    ;
    static async postOne(id, connection) {
        const postedUserConnection = await Config_1.SessionStorageDB.collection("userConnections").postOne(new UserConnection(id, connection)).catch((err) => {
            console.log(err);
        });
        if (!postedUserConnection) {
            return Promise.reject(`Error from UserConnectionFactory class at postOne - rejected`);
        }
        ;
        return Promise.resolve(postedUserConnection);
    }
    ;
    static async listen(id, connection) {
        const isValid = JoiSchema_1.idJoiSchema.validate(id);
        if (isValid.error) {
            return Promise.reject(`Error from UserConnectionFactory class at listen - joi validation: ${isValid.error.details[0].message}`);
        }
        ;
        const foundElement = await this.findById(id).catch((err) => {
            console.log(err);
        });
        if (foundElement === undefined) {
            return Promise.reject(`Error from UserConnectionFactory class at listen - rejected`);
        }
        ;
        if (foundElement === null) {
            const userExists = await User_1.default.findById(id).catch((err) => {
                console.log(err);
            });
            if (userExists === undefined) {
                return Promise.reject("Error from UserConnectionFactory class at listen - rejected");
            }
            ;
            if (userExists === null) {
                return Promise.reject("Error from UserConnectionFactory class at listen - user does not exist");
            }
            ;
            const currentSession = await this.postOne(userExists.id, connection).catch((err) => {
                console.log(err);
            });
            if (!currentSession) {
                return Promise.reject(`Error from UserConnectionFactory class at listen - failed posting a new connection - userId: ${userExists.id}`);
            }
            ;
            console.log(`UserConnection class at listen - new connection has been created - User-${currentSession.id}`);
            return Promise.resolve(currentSession);
        }
        ;
        console.log(`UserConnection class at listen - connection already exists - User-${foundElement.id} - the connection has been set online`);
        foundElement.setOnline(true, connection);
        return Promise.resolve(foundElement);
    }
    ;
}
;
exports.default = UserConnectionFactory;
