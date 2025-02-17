"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const Registration_1 = require("./Callback/Registration");
const registrationRouter = (0, express_1.Router)();
registrationRouter.post("/", express_1.default.text(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Registration_1.requestRegistrationCallback)(unAuthorizedRequest, res, next);
});
registrationRouter.get("/:id", (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Registration_1.checkRegistrationCallback)(unAuthorizedRequest, res, next);
});
registrationRouter.post("/:id", express_1.default.text(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Registration_1.validateRegistrationCodeCallback)(unAuthorizedRequest, res, next);
});
registrationRouter.post("/confirm/:id", express_1.default.json(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Registration_1.confirmRegistrationCallback)(unAuthorizedRequest, res, next);
});
registrationRouter.get("/cancel/:id", (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Registration_1.cancelRegistrationCallback)(unAuthorizedRequest, res, next);
});
registrationRouter.post("/username/:username", express_1.default.text(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Registration_1.checkRegistrationUsernameCallback)(unAuthorizedRequest, res, next);
});
exports.default = registrationRouter;
