"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStorageDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Model_1 = __importDefault(require("./Model"));
class DataBase {
    static isOnline() {
        if (!this.asPromise) {
            if (this.online) {
                return Promise.resolve(this);
            }
            ;
            return Promise.reject("offline");
        }
        ;
        return this.asPromise;
    }
    ;
    static useDb(dbName) {
        if (typeof dbName !== "string") {
            throw new TypeError("name parameter must be a string");
        }
        ;
        if (!(this.finished)) {
            console.log("unfinished promise");
            return this;
        }
        ;
        const localPromise = new Promise((success, danger) => {
            switch (dbName) {
                case "mongodb":
                    if (dbName === this.dbName) {
                        return success(this);
                    }
                    ;
                    this.strategy = Model_1.default.dataBase("mongodb");
                    const connection = mongoose_1.default.connection;
                    const connectionState = connection.readyState;
                    if (connectionState === 1) {
                        this.online = true;
                        success(this);
                    }
                    else {
                        this.online = false;
                    }
                    ;
                    connection.on("open", () => {
                        console.log(`dbName='${dbName}' - event='open'`);
                        this.online = true;
                        success(this);
                    });
                    connection.on("reconnected", () => {
                        console.log(`dbName='${dbName}' - event='reconnected'`);
                        this.online = true;
                    });
                    connection.on("close", () => {
                        console.log(`dbName='${dbName}' - event='closed'`);
                        this.online = false;
                    });
                    connection.on("disconnected", () => {
                        console.log(`dbName='${dbName}' - event='disconnected'`);
                        this.online = false;
                    });
                    connection.on("error", () => {
                        console.log(`dbName='${dbName}' - event='error'`);
                        this.online = false;
                        danger(`dbName='${dbName}' - error`);
                    });
                    break;
                case "session-storage":
                    if (dbName === this.dbName) {
                        return success(this);
                    }
                    ;
                    this.strategy = Model_1.default.dataBase("session-storage");
                    this.online = true;
                    success(this);
                    break;
            }
            ;
        });
        this.finished = false;
        // localPromise.finally(() => {
        //     this.finished = true;
        // });
        // localPromise.catch((err) => {
        //     console.log("pre-made error message");
        // })
        // localPromise.catch((err) => {
        //     console.log("pre-made error message");
        // }).finally(() => {
        //     this.finished = true;
        // });
        this.dbName = dbName;
        this.asPromise = localPromise;
        this.collection = this.strategy.collection.bind({});
        return this;
    }
    ;
}
_a = DataBase;
DataBase.finished = true;
DataBase.online = false;
DataBase.strategy = _a.useDb("mongodb");
DataBase.collection = _a.strategy.collection.bind({});
;
class SessionStorageDB {
}
exports.SessionStorageDB = SessionStorageDB;
_b = SessionStorageDB;
SessionStorageDB.db = Model_1.default.dataBase("session-storage");
SessionStorageDB.collection = _b.db.collection.bind({});
;
exports.default = DataBase;
