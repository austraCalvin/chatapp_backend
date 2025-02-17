"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStorageModel = exports.MongoDBModel = exports.databaseChosen = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const File_1 = __importDefault(require("./MongoDB/Message/File"));
const Message_1 = __importDefault(require("./MongoDB/Message/Message"));
const UserReceivesMessage_1 = __importDefault(require("./MongoDB/Message/UserReceivesMessage"));
const UserSendsMessage_1 = __importDefault(require("./MongoDB/Message/UserSendsMessage"));
const User_1 = __importDefault(require("./MongoDB/User/User"));
const Configuration_1 = __importDefault(require("./Session/User/Configuration"));
const UserConnection_1 = __importDefault(require("./Session/User/UserConnection"));
const File_2 = __importDefault(require("../DataBase/MongoDB/Message/File"));
const Group_1 = __importDefault(require("../DataBase/MongoDB/User/Group"));
const UserContactsUser_1 = __importDefault(require("../DataBase/MongoDB/User/UserContactsUser"));
const UserJoinsGroup_1 = __importDefault(require("../DataBase/MongoDB/User/UserJoinsGroup"));
const Configuration_2 = __importDefault(require("../DataBase/MongoDB/User/Configuration"));
const Registration_1 = __importDefault(require("./MongoDB/Temp/Registration"));
const Registration_2 = __importDefault(require("./MongoDB/Temp/Registration"));
const Recovery_1 = __importDefault(require("./MongoDB/Temp/Recovery"));
const Recovery_2 = __importDefault(require("./Session/Temp/Recovery"));
const Request_1 = __importDefault(require("./MongoDB/Message/Request"));
exports.databaseChosen = "mongodb";
class ModelFactory {
    static dataBase(name) {
        if (typeof name !== "string") {
            throw new TypeError("name parameter must be a string");
        }
        ;
        if (name === "mongodb") {
            const config = {
                "username": "austra",
                "password": "8971036",
                "dbName": "chatapp",
                "isLocal": true,
                "host": {
                    "hostname": "127.0.0.1",
                    "port": 27017,
                },
                "connection": mongoose_1.default.connection
            };
            const uri = config.isLocal
                ?
                    (`mongodb://${config.host.hostname}:${config.host.port}/${config.dbName}`)
                :
                    (`mongodb+srv://${config.username}:${config.password}@cluster0.drohkax.mongodb.net/${config.dbName}?retryWrites=true&w=majority`);
            if (config.connection.readyState === 0) {
                mongoose_1.default.connect(uri).then(() => { }).catch((err) => { });
            }
            ;
            return new MongoDBModel;
        }
        ;
        return new SessionStorageModel;
    }
    ;
}
;
class MongoDBModel {
    collection(name) {
        if (!name || (typeof name !== "string")) {
            throw new TypeError("name parameter must be a string");
        }
        ;
        switch (name) {
            case "users":
                return new User_1.default;
            case "user-configuration":
                return new Configuration_2.default;
            case "messages":
                return new Message_1.default;
            case "user-sends-message":
                return new UserSendsMessage_1.default;
            case "user-receives-message":
                return new UserReceivesMessage_1.default;
            case "files":
                return new File_2.default;
            case "groups":
                return new Group_1.default;
            case "user-contacts-user":
                return new UserContactsUser_1.default;
            case "user-joins-group":
                return new UserJoinsGroup_1.default;
            case "registrations":
                return new Registration_1.default;
            case "recoveries":
                return new Recovery_1.default;
            case "message-requests":
                return new Request_1.default;
        }
        ;
    }
    ;
}
exports.MongoDBModel = MongoDBModel;
;
const userConnectionModelCreated = new UserConnection_1.default;
class SessionStorageModel {
    collection(name) {
        if (!name || (typeof name !== "string")) {
            throw new TypeError("name parameter must be a string");
        }
        ;
        switch (name) {
            case "users":
                return new User_1.default;
            case "user-configuration":
                return new Configuration_1.default;
            case "messages":
                return new Message_1.default;
            case "user-sends-message":
                return new UserSendsMessage_1.default;
            case "user-receives-message":
                return new UserReceivesMessage_1.default;
            case "files":
                return new File_2.default;
            case "files-content":
                return new File_1.default;
            case "groups":
                return new Group_1.default;
            case "user-contacts-user":
                return new UserContactsUser_1.default;
            case "user-joins-group":
                return new UserJoinsGroup_1.default;
            case "userConnections":
                return userConnectionModelCreated;
            case "registrations":
                return new Registration_2.default;
            case "recoveries":
                return new Recovery_2.default;
            case "message-requests":
                return new Request_1.default;
        }
        ;
    }
    ;
}
exports.SessionStorageModel = SessionStorageModel;
;
exports.default = ModelFactory;
