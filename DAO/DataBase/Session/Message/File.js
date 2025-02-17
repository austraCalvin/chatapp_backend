"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Config_1 = __importDefault(require("../../Config"));
const Model_1 = require("../Model");
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// console.log("dirname:", __dirname);
// console.log("filename:", __filename);
class FileModel extends Model_1.SessionEntityTemplate {
    constructor() {
        super();
        this.elements = [];
        this.files = fs_1.default.readdirSync(path_1.default.resolve("../upload"));
        this.errorOrigin = "Error from File Session instance";
    }
    ;
    async getMany(model, limit) {
        return Promise.reject();
    }
    ;
    async getOne(model) {
        const db = await Config_1.default.isOnline().catch((err) => { });
        if (!db) {
            return Promise.reject();
        }
        ;
        const foundElement = await db.collection("files").getOne(model).catch((err) => { });
        if (!foundElement) {
            return Promise.resolve(null);
        }
        ;
        const localPromise = new Promise((success, danger) => {
            fs_1.default.readFile(path_1.default.resolve(`../upload/${foundElement.id}.${foundElement.ext}`), (err, data) => {
                if (err) {
                    return danger(`${this.errorOrigin} - not found`);
                }
                ;
                success({ ...foundElement, "content": data });
            });
        });
        return localPromise;
    }
    ;
    async postMany(models) {
        return Promise.reject();
    }
    ;
    async postOne(model) {
        const db = await Config_1.default.isOnline().catch((err) => { });
        if (!db) {
            return Promise.reject();
        }
        ;
        console.log("model:", model);
        console.log("dir path:", path_1.default.resolve());
        console.log("specialz path:", path_1.default.resolve(`../upload/${model.id}.${model.ext}`));
        const localPromise = new Promise((success, danger) => {
            fs_1.default.writeFile(path_1.default.resolve(`../upload/${model.id}.${model.ext}`), model.content, async (err1) => {
                if (err1) {
                    console.log("WHY jeje:", err1);
                    return danger(`${this.errorOrigin} - not inserted`);
                }
                ;
                fs_1.default.readdir(path_1.default.resolve("../upload"), (err2, files) => {
                    if (err2) {
                        return danger(`${this.errorOrigin} - could not read the directory`);
                    }
                    ;
                    console.log("file directory:", files);
                    this.files = files;
                });
                const postedElement = await db.collection("files").postOne(model).catch((err) => { });
                if (!postedElement) {
                    return Promise.reject(`${this.errorOrigin} at method postOne - not inserted`);
                }
                ;
                success({ ...postedElement, "content": fs_1.default.readFileSync(path_1.default.resolve(`../upload/${model.id}.${model.ext}`)) });
            });
        });
        return localPromise;
    }
    ;
    async patchMany(model, update) {
        return Promise.reject();
    }
    ;
    async patchOne(model, update) {
        return Promise.reject();
    }
    ;
    async deleteOne(id) {
        const db = await Config_1.default.isOnline().catch((err) => { });
        if (!db) {
            return Promise.reject();
        }
        ;
        const foundElement = await db.collection("files").getOne({ id }).catch((err) => { });
        if (!foundElement) {
            return Promise.reject();
        }
        ;
        const localPromise = new Promise((success, danger) => {
            fs_1.default.unlink(path_1.default.resolve(`./src/upload/${foundElement.id}.${foundElement.ext}`), async (err) => {
                if (err) {
                    return danger(`${this.errorOrigin} - not deleted`);
                }
                ;
                const deletedElement = await db.collection("files").deleteOne(id).catch((err) => { });
                if (!deletedElement) {
                    return danger(`${this.errorOrigin} - not deleted - fileId:${id}`);
                }
                ;
                success(true);
            });
        });
        return localPromise;
    }
    ;
}
;
exports.default = FileModel;
