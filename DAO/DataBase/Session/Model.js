"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionEntityTemplate = void 0;
class SessionEntityTemplate {
    constructor() {
        this.elements = [];
    }
    ;
    async getMany(model, limit) {
        if (!this.elements[0]) {
            return Promise.resolve(null);
        }
        ;
        let result;
        if (model) {
            console.log(`UserConnection session storage instance - filterQuery:`, model);
            console.log(`UserConnection session storage instance - elements:`, this.elements.length ? this.elements.map((each) => ({ "userId": each.id, "online": each.connection ? each.connection.connected : false })) : "empty");
            const filtered = this.elements.filter((value) => {
                if (Object.prototype.toString.call(model.id) === "[object Array]") {
                    return model.id.includes(value.id);
                }
                else {
                    return value.id === model.id;
                }
                ;
            });
            const sliceConfig = {
                "start": 0,
                "end": limit ? limit : filtered.length
            };
            // result = filtered.slice(sliceConfig.start, sliceConfig.end);
            result = filtered;
        }
        else {
            result = this.elements.slice(0, limit ? limit : this.elements.length);
        }
        ;
        return Promise.resolve(result);
    }
    ;
    async getOne(model) {
        if (!this.elements[0]) {
            return Promise.resolve(null);
        }
        ;
        const foundElement = this.elements.find((value) => {
            if (model.id) {
                return value.id === model.id;
            }
            ;
        });
        if (!foundElement) {
            return Promise.resolve(null);
        }
        ;
        return Promise.resolve(foundElement);
    }
    ;
    async postMany(models) {
        const previousLength = this.elements.length;
        const newLength = this.elements.push(...models);
        return Promise.resolve(this.elements.slice(previousLength - 1, newLength));
    }
    ;
    async postOne(model) {
        const pushedUserIndex = this.elements.push(model);
        return Promise.resolve(this.elements[pushedUserIndex - 1]);
    }
    ;
    async patchMany(model, update) {
        return Promise.reject();
    }
    ;
    async patchOne(model, update) {
        const elementIndex = this.elements.findIndex((value, index) => {
            if (value.id === model.id) {
                return true;
            }
            ;
        });
        if (elementIndex === -1) {
            return Promise.resolve(false);
        }
        ;
        this.elements[elementIndex] = { ...this.elements[elementIndex], ...update };
        return Promise.resolve(true);
    }
    ;
    async deleteOne(modelId) {
        const elementIndex = this.elements.findIndex((value) => {
            return value.id === modelId;
        });
        if (elementIndex === -1) {
            return Promise.resolve(false);
        }
        ;
        this.elements.splice(elementIndex, 1);
        return Promise.resolve(true);
    }
    ;
}
exports.SessionEntityTemplate = SessionEntityTemplate;
;
