"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBEntityTemplate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const isObject_1 = __importDefault(require("../../../hooks/isObject"));
class MongoDBEntityTemplate {
    constructor() {
        this.online = false;
        this.connection = mongoose_1.default.connection;
        if (this.connection) {
            const connectionState = this.connection.readyState;
            if (connectionState === 1) {
                this.online = true;
            }
            else {
                this.online = false;
            }
            ;
            this.connection.on("open", () => {
                this.online = true;
            });
            this.connection.on("reconnected", () => {
                this.online = true;
            });
            this.connection.on("close", () => {
                this.online = false;
            });
            this.connection.on("disconnected", () => {
                this.online = false;
            });
            this.connection.on("error", () => {
                this.online = false;
            });
        }
        ;
    }
    ;
    async getMany(model, limit) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        let collection;
        const filterQuery = {};
        for (const prop in model) {
            const currentValue = model[prop];
            if ((0, isObject_1.default)(currentValue) === 2) {
                if (currentValue[1]) {
                    filterQuery[prop] = { "$in": currentValue };
                    continue;
                }
                ;
            }
            ;
            if (currentValue === "$null") {
                filterQuery[prop] = { "$not": { "$eq": null } };
            }
            else {
                filterQuery[prop] = { "$eq": currentValue ? currentValue[0] : null };
            }
            ;
        }
        ;
        console.log("model:", model);
        console.log("filter-query:", filterQuery);
        if (limit) {
            collection = await this.collection.find(model ? filterQuery : {}).limit(limit).lean().catch((err) => { });
        }
        else {
            collection = await this.collection.find(model ? filterQuery : {}).lean().catch((err) => {
            });
        }
        ;
        if (!collection) {
            return Promise.reject(`${this.errorOrigin} at method getMany - rejected`);
        }
        ;
        if (!collection.length) {
            return Promise.resolve(null);
        }
        ;
        return Promise.resolve(collection);
    }
    ;
    async getOne(model) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        const foundElement = await this.collection.findOne(model).lean().catch((err) => { });
        if (foundElement === undefined) {
            return Promise.reject(`${this.errorOrigin} at method getOne - rejected`);
        }
        ;
        if (foundElement === null) {
            return Promise.resolve(null);
        }
        ;
        return Promise.resolve(foundElement);
    }
    ;
    async postMany(models) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        const postedArray = await this.collection.insertMany(models).catch((err) => { });
        if (!postedArray) {
            return Promise.reject(`${this.errorOrigin} at method postMany - rejected`);
        }
        ;
        if (!postedArray.length) {
            return Promise.reject(`${this.errorOrigin} at method postMany - not inserted`);
        }
        ;
        return Promise.resolve(postedArray);
    }
    ;
    async postOne(model) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        const postedArray = await this.collection.insertMany([model]).catch((err) => { });
        if (!postedArray) {
            return Promise.reject(`${this.errorOrigin} at method postOne - rejected`);
        }
        ;
        if (!postedArray.length) {
            return Promise.reject(`${this.errorOrigin} at method postOne - not inserted`);
        }
        ;
        console.log("postedArray:", postedArray);
        return Promise.resolve(postedArray[0]);
    }
    ;
    async patchMany(model, update) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        let filterParam = {};
        if (model[1]) {
            for (const props in model[0]) {
                const property = props;
                for (const each of model) {
                    if (!filterParam[property]) {
                        filterParam[property] = {
                            "$in": []
                        };
                    }
                    ;
                    filterParam[property]["$in"] = [...filterParam[property]["$in"], each[property]];
                }
                ;
            }
            ;
        }
        else if (model[0]) {
            filterParam = model[0];
        }
        ;
        const patchedElement = await this.collection.updateOne(filterParam, { "$set": update }).catch((err) => { });
        if (!patchedElement) {
            return Promise.reject(`${this.errorOrigin} at method patchOne - rejected`);
        }
        ;
        if (!patchedElement.acknowledged) {
            return Promise.reject(`${this.errorOrigin} at method patchOne - not acknowledge`);
        }
        ;
        if (patchedElement.modifiedCount !== 1) {
            return Promise.resolve(false);
        }
        ;
        return Promise.resolve(true);
    }
    ;
    async patchOne(model, update) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        const patchedElement = await this.collection.updateOne(model, { "$set": update }).catch((err) => { });
        if (!patchedElement) {
            return Promise.reject(`${this.errorOrigin} at method patchOne - rejected`);
        }
        ;
        if (!patchedElement.acknowledged) {
            return Promise.reject(`${this.errorOrigin} at method patchOne - not acknowledge`);
        }
        ;
        if (patchedElement.modifiedCount !== 1) {
            return Promise.resolve(false);
        }
        ;
        return Promise.resolve(true);
    }
    ;
    async deleteOne(modelId) {
        if (!this.online) {
            return Promise.reject(`${this.errorOrigin} - offline`);
        }
        ;
        const deletedElement = await this.collection.deleteOne({ "id": modelId }).catch((err) => { });
        if (!deletedElement) {
            return Promise.reject(`${this.errorOrigin} at method deleteOne - rejected`);
        }
        ;
        if (!deletedElement.acknowledged) {
            return Promise.reject(`${this.errorOrigin} at method deleteOne - not acknowledged`);
        }
        ;
        if (deletedElement.deletedCount !== 1) {
            return Promise.resolve(false);
        }
        ;
        return Promise.resolve(true);
    }
    ;
}
exports.MongoDBEntityTemplate = MongoDBEntityTemplate;
;
